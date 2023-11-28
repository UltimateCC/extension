
import express from 'express';
import session from 'express-session';
import { createServer } from 'http';
import RedisStore from "connect-redis";
import {createClient} from "redis";
import { Server } from 'socket.io';
import { initSocketioServer, endSocketSessions } from './socketioServer';
import { apiRouter } from './api/apiRoutes';
import { rateLimiterMiddleware } from './middleware/rateLimit';
import { config } from './config';

const app = express();
app.set('trust proxy', 1);

app.use(rateLimiterMiddleware);

// Sessions are valid for 24h
const sessionTime = 60 * 60 * 24;

const redisClient = createClient({
	url: config.SESSION_REDIS
});
redisClient.on('error', e=>{
	console.error('Redis client error', e);
});

const sessionMiddleware = session({
	proxy: true,
	secret: config.SESSION_SECRET,
	saveUninitialized: false,
	resave: false,
	cookie: {
		//secure: true,
		maxAge: sessionTime * 1000
	},
	store: new RedisStore({
		client: redisClient,
		prefix: "captions:",
	})
});
app.use(sessionMiddleware);
app.use(express.json());

// API routes
app.use('/api', apiRouter);

// socket.io on same server
export const server = createServer(app);
export const io = new Server(server);
/*
// socketio admin UI
instrument(io, {
	auth: {
		type: 'basic',
		username: 'admin',
		password: process.env.SOCKETIO_ADMIN_PASSWORD!
	}
});*/
io.engine.use(sessionMiddleware);
//Register socketio routes
initSocketioServer(io);


const PORT = config.PORT;

export async function startServer() {
	await redisClient.connect();
	await new Promise<void>((res)=>{
		server.listen(PORT, ()=>{
			res();
		});
	});
}

export async function stopServer() {
	await Promise.all([
		new Promise<void>((resolve, reject)=>{
			console.info('Closing HTTP server');
			server.close((err)=>{
				if(err) reject();
				else resolve();
			});
		}),
		endSocketSessions(io)
	]);
	await redisClient.disconnect();
	console.info('Server closed');
}
