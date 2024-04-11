import { Server } from "socket.io";
import { Action, Info, LangList, TranscriptData, CaptionsData } from "./types";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { logger } from "./utils/logger";
import { eventsub } from "./twitch/events";
import { z } from "zod";
import { metrics } from "./utils/metrics";
import { getCaptionSession } from "./CaptionSession";


interface ServerToClientEvents {
	translateLangs: (langs: LangList) => void;
	info: (info: Info) => void;
	transcript: (transcript: TranscriptData) => void;
	captions: (captions: CaptionsData) => void;
	action: (action: Action) => void;
}

interface ClientToServerEvents {
	reloadConfig: () => void;
	text: (text: TranscriptData) => void;
}

export interface SocketData {
	twitchId: string
}

// Limit received text
const textRateLimiter = new RateLimiterMemory({
	points: 10,
	duration: 5,
});

const transcriptDataSchema = z.object({
	delay: z.number(),
	duration: z.number(),
	final: z.boolean(),
	lineEnd: z.boolean().optional(),
	text: z.string().min(1).max(250),
	lang: z.string().min(1)
});

export const io = new Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>();

// Before actually accepting connection: auth
io.use((socket, next)=>{

	if(typeof socket.handshake.auth.browserSource === 'string') {
		next();
	}else{
		// eslint-disable-next-line -- Access session object added by express-session
		const session = (socket.request as any).session;

		if(!session.userid) {
			logger.warn('Unauthenticated socketio connection');
			next(new Error('not authenticated'));
		}else{
			socket.data.twitchId = session.userid;
			next();
		}
	}
});

// When socket connected
io.on('connect', (socket) => {
	metrics.connectionCount.inc();
	socket.on('disconnect', ()=>{
		metrics.connectionCount.dec();
	});

	if(socket.handshake.auth.browserSource) {
		socket.join(`browserSource-${socket.handshake.auth.browserSource}`);

		metrics.browsersourceConnectionCount.inc();
		socket.on('disconnect', ()=>{
			metrics.browsersourceConnectionCount.dec();
		});
	}

	// Socket connections from dashboard
	if(socket.data.twitchId) {
		socket.join(`twitch-${socket.data.twitchId}`);
		metrics.dashboardConnectionCount.inc();

		socket.on('disconnect', () => {
			metrics.dashboardConnectionCount.dec();
		});

		socket.on('reloadConfig', () => {
			getCaptionSession(socket.data.twitchId).reload();
		});

		socket.on('text', async (captions) => {
			// Ratelimit
			try {
				await textRateLimiter.consume(socket.data.twitchId);
			}catch(e) {
				logger.warn(`Transcript ratelimited for: ${socket.data.twitchId}`);
				return;
			}

			// Check captions data format
			const parsed = transcriptDataSchema.safeParse(captions);
			if(parsed.success) {
				getCaptionSession(socket.data.twitchId).handleTranscript(parsed.data);
			}else{
				logger.warn(`Invalid transcript format for: ${socket.data.twitchId} ${parsed.error.errors[0].message}`);
			}
		});
	}
});

export function registerTwitchAutoStop(twitchId: string) {
	eventsub.onStreamOffline(twitchId, async()=>{
		io.to(`twitch-${twitchId}`).emit('action', { type: 'stop' });
	});
}
