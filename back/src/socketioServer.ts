import { Server, Socket } from "socket.io";
import { Action, CaptionsStatus, Info, LangList, TranscriptAlt, TranscriptData } from "./types";
import { User, UserConfig } from "./entity/User";
import { getTranslator } from "./translate/getTranslator";
import { isExtensionInstalled, sendPubsub } from "./twitch";
import { Translator } from "./translate/Translator";
import { getStt } from "./stt/getStt";
import { SpeechToText } from "./stt/SpeechToText";
import { StreamingSpeechToText } from "./streamingStt/StreamingSpeechToText";
import { getStreamingStt } from "./streamingStt/getStreamingStt";
import { Stats } from "./entity/Stats";


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
	audio: (data: Buffer, duration: number)  => void;
	audioStart: ()  => void;
	audioData: (data: Buffer)  => void;
	audioEnd: ()  => void;
}

export interface SocketData {
	startTime: number;
	stats: Stats | null;
	config: UserConfig;
	twitchId: string;
	translator: Translator;
	stt: SpeechToText | null;
	streamingStt: StreamingSpeechToText | null;
}

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>
type TypedServer = Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>


async function loadConfig(socket: TypedSocket) {
	// End previous session if there was one
	await endSession(socket);
	const u = await User.findOneByOrFail({ twitchId: socket.data.twitchId });
	socket.data.config = u.config;

	//Init statistics
	socket.data.stats = new Stats();
	socket.data.startTime = Date.now();
	socket.data.stats.user = u;
	socket.data.stats.twitchId = u.twitchId;
	socket.data.stats.config = socket.data.config;

	// Speech to text
	socket.data.stt = getStt(u);

	// Streaming speech to text
	await socket.data.streamingStt?.stop();
	socket.data.streamingStt = getStreamingStt(u);
	socket.data.streamingStt?.on('transcript', transcript=>{
		handleCaptions(socket, transcript);
	});
	socket.data.streamingStt?.on('info', info => {
		socket.emit('info', info);
	});

	// Translation
	socket.data.translator = getTranslator(u);

	// Send available translation languages
	const langs = await socket.data.translator.getLangs();
	socket.emit('translateLangs', langs);

	sendStatus(socket);
}

async function endSession(socket: TypedSocket) {
	socket.data.streamingStt?.stop();
	// Save statistics if necessary
	if(socket.data.stats?.finalCount || socket.data.stats?.partialCount) {
		socket.data.stats.duration = Date.now() - socket.data.startTime;
		await socket.data.stats.save();
		socket.data.stats = null;
	}
}

async function sendStatus(socket: TypedSocket) {
	socket.emit('status', {
		stt: socket.data.streamingStt?.ready() ?? socket.data.stt?.ready() ?? false,
		translation: socket.data.translator.ready(),
		twitch: await isExtensionInstalled(socket.data.twitchId)
	});
}

async function handleCaptions(socket: TypedSocket, transcript: TranscriptData ) {
	try {
		socket.emit('transcript', transcript );

		// Save statistics
		if(socket.data.stats) {
			if(transcript.final) {
				socket.data.stats.finalCount++;
				socket.data.stats.finalCharCount += transcript.text.length;
			}else{
				socket.data.stats.partialCount++;
				socket.data.stats.partialCharCount += transcript.text.length;
			}
		}

		const out = await socket.data.translator.translate(transcript);
		if(out.isError) {
			socket.emit('info', { type: 'warn', message: out.message });
			if(socket.data.stats) {
				socket.data.stats.translateErrorCount++;
			}
		}else{
			//console.log('Sending pubsub for '+socket.data.twitchId, out.data);
			await sendPubsub(socket.data.twitchId, JSON.stringify(out.data));
		}
	}catch(e) {
		console.error('Error handling captions', e);
	}
}

export function initSocketioServer(io: TypedServer) {

	io.use((socket, next)=>{
		const session = (socket.request as any).session;

		if(session.userid) {
			socket.data.twitchId = session.userid;
			loadConfig(socket).then(()=>{
				next();
			})
			.catch((e=>{
				console.error('Error loading user config', e);
				next(new Error('error loading user config'));
			}));
			
		}else{
			next(new Error('not authenticated'));
		}
	});

	io.on('connect', (socket) => {
		socket.join('twitch-'+socket.data.twitchId);

		socket.on('disconnect', ()=>{
			endSession(socket)
				.catch(e=>console.error('Error ending session', e));
		});

		socket.on('reloadConfig', ()=>{
			loadConfig(socket).catch(e=>console.error('Error reloading config', e));
		});

		// Text direclty received
		socket.on('text', captions =>{
			handleCaptions(socket, captions).catch(e=>{
				console.error('Error handling captions', e);
			});
		});

		// Speech to text
		socket.on('audio', (data, duration)=>{
			socket.data.stt?.transcribe(data, duration)
				.then(result=>{
					if(result.isError) {
						socket.emit('info', { type: 'warn', message: result.message });
					}else if(result.data) {
						handleCaptions(socket, result.data);
					}
				})
				.catch(e=>{ console.error('Stt error', e) });
		});

		// Streaming speech to text
		socket.on('audioStart', ()=>{
			socket.data.streamingStt?.start();
		});
		socket.on('audioEnd', ()=>{
			socket.data.streamingStt?.stop();
		});
		socket.on('audioData', (data)=>{
			socket.data.streamingStt?.handleData(data);
		});
	});
}

export async function endSocketSessions(io: TypedServer) {
	// Only local sockets are fetched
	// socket type can be used safely
	const sockets = await io.local.fetchSockets() as unknown as TypedSocket[];
	// End all sessions (triggers saving statistics)
	await Promise.all(sockets.map(s=>endSession(s)));
}