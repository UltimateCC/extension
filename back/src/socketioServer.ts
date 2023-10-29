import { Server, Socket } from "socket.io";
import { CaptionsData, CaptionsStatus, Info, LangList, TranscriptAlt } from "./types";
import { User, UserConfig } from "./entity/User";
import { getTranslator } from "./translate/getTranslator";
import { sendPubsub } from "./twitch";
import { dataSource } from "./database";
import { Translator } from "./translate/Translator";
import { getStt } from "./stt/getStt";
import { SpeechToText } from "./stt/SpeechToText";
import { StreamingSpeechToText } from "./streamingStt/StreamingSpeechToText";
import { getStreamingStt } from "./streamingStt/getStreamingStt";


interface ServerToClientEvents {
	translateLangs: (langs: LangList) => void;
	status: ( status: CaptionsStatus ) => void;
	info: ( info: Info )=>void;
	transcript: ( transcript: TranscriptAlt )=>void;
}

interface ClientToServerEvents {
	reloadConfig: () => void;
	text: (text: CaptionsData) => void;
	audio: (data: Buffer, duration: number)  => void;
	audioStart: ()  => void;
	audioData: (data: Buffer)  => void;
	audioEnd: ()  => void;
}

type TypedSocket = Socket<ClientToServerEvents, ServerToClientEvents, {}, SocketData>
type TypedServer = Server<ClientToServerEvents, ServerToClientEvents, {}, SocketData>

export interface SocketData {
	config: UserConfig;
	twitchId: string;
	translator: Translator;
	stt: SpeechToText | null;
	streamingStt: StreamingSpeechToText | null;
}

async function loadConfig(socket: TypedSocket) {
	const u = await dataSource.manager.findOneByOrFail(User, { twitchId: socket.data.twitchId });
	socket.data.config = u.config;

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

async function sendStatus(socket: TypedSocket) {
	socket.emit('status', {
		stt: socket.data.streamingStt?.ready() ?? socket.data.stt?.ready() ?? false,
		translation: socket.data.translator.ready(),
		twitch: true // todo: check if extension is installed
	});
}

async function handleCaptions(socket: TypedSocket, transcript: CaptionsData ) {
	try {
		socket.emit('transcript', transcript.captions[0]);
		const out = await socket.data.translator.translate(transcript);
		if(out.isError) {
			socket.emit('info', { type: 'warn', message: out.message });
		}else{
			console.log('Sending pubsub', out.data);
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
		socket.on('audioStart', async ()=>{
			socket.data.streamingStt?.start();
		});
		socket.on('audioEnd', ()=>{
			socket.data.streamingStt?.stop();
		});
		socket.on('audioData', (data)=>{
			socket.data.streamingStt?.handleData(data);
		});
		socket.on('disconnect', ()=>{
			socket.data.streamingStt?.stop();
		});
	});
	
}