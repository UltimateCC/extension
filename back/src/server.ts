
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initSocketioServer, endSocketSessions } from './socketioServer';
import { apiRouter } from './api/apiRoutes';
import { rateLimiterMiddleware } from './middleware/rateLimit';
import { config } from './config';
import { logger } from './logger';
import { initSessionMiddleware, sessionMiddleware, stopSessionMiddleware } from './middleware/session';

const app = express();
app.set('trust proxy', 1);

app.use(rateLimiterMiddleware);
app.use(sessionMiddleware);
app.use(express.json());

// API routes
app.use('/api', apiRouter);

// socket.io on same server
export const server = createServer(app);
export const io = new Server(server);

io.engine.use(sessionMiddleware);
//Register socketio routes
initSocketioServer(io);


export async function startServer() {
	await initSessionMiddleware();
	await new Promise<void>((res)=>{
		server.listen(config.PORT, ()=>{
			res();
		});
	});
}

export async function stopServer() {
	await Promise.all([
		new Promise<void>((resolve, reject)=>{
			logger.info('Closing HTTP server');
			server.close((err)=>{
				if(err) reject();
				else resolve();
			});
		}),
		endSocketSessions(io)
	]);
	logger.info('Server closed');
	await stopSessionMiddleware();
}
