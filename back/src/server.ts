
import express from 'express';
import session from 'express-session';
import fileStore from 'session-file-store';
import { authRouter } from './api/auth';
import { apiRouter } from './api/user';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initSocketioServer } from './socketioServer';

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

//Auth
app.use('/api/auth', authRouter);
//Api routes
app.use(apiRouter);

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