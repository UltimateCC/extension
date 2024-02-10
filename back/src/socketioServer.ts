import { Server, Socket } from "socket.io";
import { Action, CaptionsStatus, Info, LangList, TranscriptData, CaptionsData } from "./types";
import { User, UserConfig } from "./entity/User";
import { getTranslator } from "./translate/getTranslator";
import { Translator } from "./translate/Translator";
import { Stats } from "./entity/Stats";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { isExtensionInstalled, sendPubsub } from "./twitch/extension";
import { logger } from "./utils/logger";
import { eventsub } from "./twitch/events";
import { z } from "zod";


interface ServerToClientEvents {
	translateLangs: (langs: LangList) => void;
	status: ( status: CaptionsStatus ) => void;
	info: ( info: Info )=>void;
	transcript: ( transcript: TranscriptData )=>void;
	action: (action: Action)=>void;
}

interface ClientToServerEvents {
	reloadConfig: () => void;
	text: (text: TranscriptData) => void;
	/*
	audioStart: ()  => void;
	audioData: (data: Buffer)  => void;
	audioEnd: ()  => void;
	*/
}

export interface SocketData {
	ready: boolean
	loading?: Promise<void>
	shouldReload: boolean
	sessionTimeout: NodeJS.Timeout
	lastSpokenLang: string
	stats: Stats | null
	config: UserConfig
	twitchId: string
	translator: Translator
	//streamingStt: StreamingSpeechToText | null;
}

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;
type TypedServer = Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

// Limit config reloads
const loadRateLimiter = new RateLimiterMemory({
	points: 3,
	duration: 1,
});

// Limit received text
const textRateLimiter = new RateLimiterMemory({
	points: 10,
	duration: 5,
});

const transcriptDataSchema = z.object({
	delay: z.number(),
	duration: z.number(),
	final: z.boolean(),
	text: z.string().min(1).max(250),
	lang: z.string().min(1)
});

async function loadConfig(socket: TypedSocket) {
	try{
		// End previous session if there was one
		await endSession(socket);

		// Ratelimit
		await loadRateLimiter.consume(socket.data.twitchId);

		// Fetch user
		const u = await User.findOneOrFail({where: { twitchId: socket.data.twitchId }, cache: false });
		socket.data.config = u.config;

		if(socket.data.config.twitchAutoStop !== false) {
			registerTwitchAutoStop(u.twitchId);
		}

		//Init statistics
		socket.data.stats = new Stats();
		socket.data.stats.twitchId = u.twitchId;
		socket.data.stats.config = socket.data.config;

		// Streaming speech to text
		/*
		await socket.data.streamingStt?.stop();
		socket.data.streamingStt = getStreamingStt(u);
		socket.data.streamingStt?.on('transcript', transcript=>{
			handleCaptions(socket, transcript);
		});
		socket.data.streamingStt?.on('info', info => {
			socket.emit('info', info);
		});*/

		// Translation
		socket.data.translator = getTranslator(u);
		const init = await socket.data.translator.init();
		if(init.isError) {
			socket.emit('info', {type: 'error', message: `Translation API initialization error: ${init.message}`});
			logger.warn(`Translation API initialization error for user ${socket.data.twitchId}: ${init.message} ${init.text??''}`);
		}

		// Send available translation languages
		const langs = await socket.data.translator.getLangs();
		socket.emit('translateLangs', langs);

		sendStatus(socket);

		rescheduleSessionEnd(socket);
	}catch(e) {
		delete socket.data.loading;
		throw e;
	}
	delete socket.data.loading;

	if(socket.data.shouldReload) {
		socket.data.shouldReload = false;
		socket.data.loading = loadConfig(socket);
		await socket.data.loading;
	}
	socket.data.ready = true;
}

async function ensureConfigLoaded(socket: TypedSocket) {
	if(!socket.data.ready) {
		if(!socket.data.loading) {
			socket.data.loading = loadConfig(socket);
		}
		await socket.data.loading;
	}
}

const SESSION_TIMEOUT = 1000 * 60 * 15

function rescheduleSessionEnd(socket: TypedSocket) {
	clearTimeout(socket.data.sessionTimeout);
	socket.data.sessionTimeout = setTimeout(()=>{ endSession(socket) }, SESSION_TIMEOUT);
}

async function endSession(socket: TypedSocket) {
	try {
		clearTimeout(socket.data.sessionTimeout);
		socket.data.ready = false;
		//socket.data.streamingStt?.stop();
		// Save statistics if necessary
		if(socket.data.stats?.finalCount || socket.data.stats?.partialCount) {
			// Remove stats from socket data before to avoid race condition (double save)
			const stats = socket.data.stats;
			socket.data.stats = null;
			stats.duration = stats.lastText - stats.firstText;
			stats.translatedCharCount = socket.data.translator.getTranslatedChars();
			stats.translateErrorCount = socket.data.translator.getErrorCount();
			await stats.save();
			logger.debug(`Saved stats for ${ socket.data.twitchId }`);
		}
	}catch(e) {
		logger.error('Error ending session', e);
	}
}

async function sendStatus(socket: TypedSocket) {
	socket.emit('status', {
		/*stt: socket.data.streamingStt?.ready() ?? false,*/
		translation: socket.data.translator.ready(),
		twitch: await isExtensionInstalled(socket.data.twitchId)
	});
}

async function handleTranscript(socket: TypedSocket, transcript: TranscriptData) {
	await ensureConfigLoaded(socket);
	rescheduleSessionEnd(socket);
	try {
		socket.emit('transcript', transcript );

		socket.data.lastSpokenLang = transcript.lang;

		// Count statistics
		if(socket.data.stats) {
			socket.data.stats.countTranscript(transcript);
		}

		const out = await socket.data.translator.translate(transcript);
		if(out.isError) {
			socket.emit('info', { type: 'warn', message: out.message });
			logger.error(`Translation failed for ${ socket.data.twitchId } : ${ out.message }`);
		}else{
			// If translation generated errors, warn user
			if(out.errors?.length) {
				// If multiple translation errors, it's probably multiple times the same
				// -> Send only first one to user
				const message = out.errors[0];
				// Do not send errors 500+ to users to avoid confusion
				if(!message.startsWith('Translation API error: 50')) {
					socket.emit('info', { type: 'warn', message });
				}
				logger.warn(`Translation error for ${ socket.data.twitchId } : ${ message }`);
			}
			await sendCaptions(socket, out.data);
		}
	}catch(e) {
		logger.error(`Error handling transcript for ${ socket.data.twitchId }`, e);
	}
}

async function sendCaptions(socket: TypedSocket, data: CaptionsData) {
	try{
		logger.debug(`Sending pubsub for ${ socket.data.twitchId }`, data);
		await sendPubsub(socket.data.twitchId, JSON.stringify(data));
	}catch(e) {
		if(e && typeof e === 'object' && 'statusCode' in e) {
			if(e?.statusCode === 422) {
				logger.warn(`Pubsub message too large for user ${ socket.data.twitchId }`);
			}else if([500, 502, 503, 504].includes(e?.statusCode as number)) {
				logger.warn(`Error 500 sending pubsub for user ${ socket.data.twitchId }`);
			}else{
				logger.error(`Unexpected error sending pubsub for user ${ socket.data.twitchId }`);
			}
		}
	}
}

export const io: TypedServer = new Server();

// Before actually accepting connection: auth + try loading config
io.use((socket, next)=>{
	// eslint-disable-next-line -- Access session object added by express-session
	const session = (socket.request as any).session;

	if(!session.userid) {
		logger.warn('Unauthenticated socketio connection');
		next(new Error('not authenticated'));
	}else{
		socket.data.twitchId = session.userid;
		next();
	}
});

// When socket connected
io.on('connect', (socket) => {
	socket.data.loading = loadConfig(socket);
	socket.data.loading.catch((e=>{
		logger.error('Error loading user config', e);
	}));

	socket.join(`twitch-${ socket.data.twitchId }`);

	socket.on('disconnect', ()=>{
		endSession(socket);
	});

	socket.on('reloadConfig', ()=>{
		if(socket.data.loading) {
			socket.data.shouldReload = true;
		}else{
			socket.data.loading = loadConfig(socket);
			socket.data.loading.catch(e=>logger.error('Error reloading config', e));
		}
	});

	socket.on('text', async (captions) =>{
		// Ratelimit
		try {
			await textRateLimiter.consume(socket.data.twitchId);
		}catch(e) {
			logger.warn(`Transcript ratelimited for: ${ socket.data.twitchId }`);
			return;
		}

		// Check captions data format
		const parsed = transcriptDataSchema.safeParse(captions);
		if(parsed.success) {
			handleTranscript(socket, parsed.data);
		}else{
			logger.warn(`Invalid transcript format for: ${ socket.data.twitchId } ${parsed.error.errors[0].message}`);
		}
	});

	// Streaming speech to text
	/*
	socket.on('audioStart', ()=>{
		socket.data.streamingStt?.start();
	});
	socket.on('audioEnd', ()=>{
		socket.data.streamingStt?.stop();
	});
	socket.on('audioData', (data)=>{
		socket.data.streamingStt?.handleData(data);
	});*/
});

/** Gracefully end all sessions (called at shutdown) */
export async function endSocketSessions() {
	// Only local sockets are fetched
	// -> socket type can be used
	const sockets = await io.local.fetchSockets() as unknown as TypedSocket[];
	// End all sessions (triggers saving statistics)
	await Promise.all(sockets.map(s=>endSession(s)));
	logger.info('All sockets sessions ended');
}

export async function getUserSockets(twitchId: string) {
	// Only local sockets are fetched
	// -> socket type can be used
	return await io.local.in(`twitch-${ twitchId }`).fetchSockets() as unknown as TypedSocket[];
}

export async function isConnected(twitchId: string) {
	const sockets = await getUserSockets(twitchId);
	return !!sockets.length;
}

export function registerTwitchAutoStop(twitchId: string) {
	eventsub.onStreamOffline(twitchId, async()=>{
		try {
			const sockets = await getUserSockets(twitchId);
			for(const socket of sockets) {
				if(socket.data.config.twitchAutoStop !== false) {
					socket.emit('action', { type: 'stop' });
				}
			}
		}catch(e) {
			logger.warn('Error fetching sockets for twitch autostop', e);
		}
	});
}
