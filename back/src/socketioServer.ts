import { Server, Socket } from "socket.io";
import { Action, CaptionsStatus, Info, LangList, TranscriptData, CaptionsData } from "./types";
import { User, UserConfig } from "./entity/User";
import { getTranslator } from "./translate/getTranslator";
import { Translator } from "./translate/Translator";
import { Stats } from "./entity/Stats";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { isExtensionInstalled, sendPubsub } from "./twitch/extension";
import { logger } from "./logger";
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
	firstText: number
	lastText: number
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
	duration: z.number().positive(),
	final: z.boolean(),
	text: z.string().min(1).max(250),
	lang: z.string().min(1).max(6)
});

async function loadConfig(socket: TypedSocket) {
	// End previous session if there was one
	await endSession(socket);

	// Ratelimit
	await loadRateLimiter.consume(socket.data.twitchId);

	// Fetch user
	const u = await User.findOneOrFail({where: { twitchId: socket.data.twitchId }, cache: false});
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
		logger.warn(`Translation API initialization error for user ${socket.data.twitchId}: ${init.message}`);
	}

	// Send available translation languages
	const langs = await socket.data.translator.getLangs();
	socket.emit('translateLangs', langs);

	sendStatus(socket);
	socket.data.ready = true;
}

async function endSession(socket: TypedSocket) {
	//socket.data.streamingStt?.stop();
	// Save statistics if necessary
	if(socket.data.stats?.finalCount || socket.data.stats?.partialCount) {
		// Remove stats from socket data before to avoid race condition (double save)
		const stats = socket.data.stats;
		socket.data.stats = null;
		stats.duration = socket.data.lastText - socket.data.firstText;
		stats.translatedCharCount = socket.data.translator.getTranslatedChars();
		stats.translateErrorCount = socket.data.translator.getErrorCount();
		await stats.save();
		logger.debug(`Saved stats for ${ socket.data.twitchId }`);
	}
}

async function sendStatus(socket: TypedSocket) {
	socket.emit('status', {
		stt: /*socket.data.streamingStt?.ready() ??*/ false,
		translation: socket.data.translator.ready(),
		twitch: await isExtensionInstalled(socket.data.twitchId)
	});
}

async function handleTranscript(socket: TypedSocket, transcript: TranscriptData) {
	try {
		socket.emit('transcript', transcript );

		socket.data.lastSpokenLang = transcript.lang;

		// Count statistics
		if(socket.data.stats) {
			socket.data.stats.countTranscript(transcript);
			const now = Date.now();
			if(!socket.data.firstText) {
				socket.data.firstText = now - transcript.duration;
			}
			socket.data.lastText = now;
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
	socket.data.ready = false;
	loadConfig(socket).catch((e=>{
		logger.error('Error loading user config', e);
	}));

	socket.join(`twitch-${ socket.data.twitchId }`);

	socket.on('disconnect', ()=>{
		endSession(socket).catch(e=>logger.error('Error ending session', e));
	});

	socket.on('reloadConfig', ()=>{
		loadConfig(socket).catch(e=>logger.error('Error reloading config', e));
	});

	socket.on('text', async (captions) =>{
		if(!socket.data.ready) return;

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
