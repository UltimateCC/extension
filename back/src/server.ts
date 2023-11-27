
import express from 'express';
import session from 'express-session';
import fileStore from 'session-file-store';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initSocketioServer, endSocketSessions } from './socketioServer';
import { apiRouter } from './api/apiRoutes';
import { rateLimiterMiddleware } from './middleware/rateLimit';
import { config } from './config';

const app = express();
app.set('trust proxy', 1);

app.use(rateLimiterMiddleware);

const sessionTime = 3600*24;
const FileStore = fileStore(session);
const sessionMiddleware = session({
	proxy: true,
	secret: config.SESSION_SECRET,
	saveUninitialized: false,
	resave: false,
	cookie: {
		//secure: true,
		maxAge: sessionTime * 1000
	},
	store: new FileStore({
		path: './data/sessions',
		ttl: sessionTime,
		logFn: ()=>{}
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

export function startServer() {
	return new Promise<void>((res)=>{
		server.listen(PORT, ()=>{
			res();
		});
	});
}

export async function stopServer() {
	await new Promise<void>((resolve, reject)=>{
		console.info('Closing HTTP server');
		server.close((err)=>{
			if(err) reject();
			else resolve();
		});
	});
	console.info('Server closed');
	await endSocketSessions(io);
}
