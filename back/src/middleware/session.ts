import session from "express-session";
import { environment } from "../environment";
import { logger } from "../logger";
import { createClient } from "redis";
import RedisStore from "connect-redis";

// Sessions are valid for 7 days
const sessionTime = 60 * 60 * 24 * 7;

const redisClient = createClient({
	url: environment.SESSION_REDIS
});
redisClient.on('error', e=>{
	logger.error('Redis client error', e);
});

export const sessionMiddleware = session({
	proxy: true,
	secret: environment.SESSION_SECRET,
	saveUninitialized: false,
	resave: false,
	rolling: true,
	cookie: {
		//secure: true,
		maxAge: sessionTime * 1000
	},
	store: new RedisStore({
		client: redisClient,
		prefix: "captions:",
	})
});

export async function initSessionMiddleware() {
	await redisClient.connect();
}

export async function stopSessionMiddleware() {
	await redisClient.disconnect();
}