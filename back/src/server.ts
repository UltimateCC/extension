
import express from 'express';
import { createServer } from 'http';
import { endSocketSessions, io } from './socketioServer';
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

// Create HTTP server and attach express app
export const server = createServer(app);
// Attach socketio to server
io.attach(server);
io.engine.use(sessionMiddleware);

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
		endSocketSessions()
	]);
	logger.info('Server closed');
	await stopSessionMiddleware();
}
