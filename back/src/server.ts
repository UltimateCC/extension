import express from 'express';
import { createServer } from 'node:http';
import { io } from './socketioServer';
import { apiRouter } from './api/apiRoutes';
import { rateLimiterMiddleware } from './middleware/rateLimit';
import { environment } from './config/environment';
import { logger } from './config/logger';
import { eventsub } from './twitch/events';
import { errorMiddleware } from './middleware/error';
import { endSessions } from './CaptionSession';
import { loadSessionMiddleware, supertokenErrorHandler, supertokenMiddleware } from './middleware/session';

const app = express();
app.set('trust proxy', true);

app.use(rateLimiterMiddleware);
eventsub.apply(app);
app.use(supertokenMiddleware);
app.use(express.json());

// API routes
app.use('/api', apiRouter);

// Handle errors
app.use(supertokenErrorHandler);
app.use(errorMiddleware);

// Create HTTP server and attach express app
export const server = createServer(app);
// Attach socketio to server
io.attach(server);
io.engine.use(loadSessionMiddleware);

io.engine.on("connection_error", (err) => {
	logger.debug('socketio connection error', err);
});

export async function startServer() {
	await new Promise<void>((res) => {
		server.listen(environment.PORT, res);
	});
	logger.info(`Server started on port ${ environment.PORT }`);
	await eventsub.markAsReady();
}

export async function stopServer() {
	await Promise.all([
		new Promise<void>((resolve, reject)=>{
			logger.info('Closing HTTP server');
			server.close((err)=>{
				if(err) reject(err);
				else resolve();
			});
		}),
		endSessions()
	]);
	logger.info('Server closed');
}
