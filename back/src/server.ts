
import express from 'express';
import session from 'express-session';
import fileStore from 'session-file-store';
import { authRouter } from './api/auth';
import { secretsRouter } from './api/secrets';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initSocketioServer } from './socketioServer';
import { thanksRouter } from './api/thanks';
import { configRouter } from './api/config';

const app = express();
app.set('trust proxy', 1);

const sessionTime = 3600*24;
const FileStore = fileStore(session);
const sessionMiddleware = session({
	proxy: true,
	secret: process.env.SESSION_SECRET!,
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

// API Routes 
// Auth
app.use('/api/auth', authRouter);
// Config
app.use('/api/config', configRouter);
// Secrets
app.use('/api/config', secretsRouter);
// Thanks page
app.use('/api/thanks', thanksRouter);

// socket.io on same server
const server = createServer(app);
const io = new Server(server);
io.engine.use(sessionMiddleware);
//Register socketio routes
initSocketioServer(io);


const PORT = process.env.PORT;

export function startServer() {
	return new Promise<void>((res)=>{
		server.listen(PORT, ()=>{
			res();
		});
	});
}