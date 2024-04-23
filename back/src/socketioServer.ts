import { Server } from "socket.io";
import { RateLimiterMemory } from "rate-limiter-flexible";
import { z } from "zod";
import { Action, Info, TranscriptData, CaptionsData } from "./types";
import { logger } from "./config/logger";
import { metrics } from "./utils/metrics";
import { getCaptionSession } from "./CaptionSession";
import { SessionRequest } from "supertokens-node/framework/express";
import { User } from "./entity/User";


interface ServerToClientEvents {
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
	notAuth: boolean
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
io.use((socket, next) => {
	if(typeof socket.handshake.auth.browserSource === 'string') {
		next();
	}else{
		const req = socket.request as SessionRequest;
		const userId = req.session?.getUserId();
		if(!userId) {
			logger.warn('Unauthenticated socketio connection');
			socket.data.notAuth = true;
			//next(new Error('not authenticated'));
			next();
		}else{
			User.findOneByOrFail({userId})
			.then((u) => {
				socket.data.twitchId = u.twitchId;
				next();
			})
			.catch(e => {
				logger.warn('Error loading user linked with session', e);
				next(new Error('auth error'));
			});
		}
	}
});

// When socket connected
io.on('connect', (socket) => {
	if(socket.data.notAuth) {
		socket.emit('info', { type: 'warn', message: 'Your session seems expired, try refreshing the page !' });
		return;
	}

	metrics.connectionCount.inc();
	socket.on('disconnect', () => {
		metrics.connectionCount.dec();
	});

	if(socket.handshake.auth.browserSource) {
		socket.join(`browserSource-${socket.handshake.auth.browserSource}`);

		metrics.browsersourceConnectionCount.inc();
		socket.on('disconnect', () => {
			metrics.browsersourceConnectionCount.dec();
		});
	}

	// Socket connections from dashboard
	if(socket.data.twitchId) {
		logger.info(`${socket.data.twitchId} socketio dashboard connect`);

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

