import "reflect-metadata";
import { disconnectDatabase, initDatabase } from './database';
import { startServer, stopServer } from "./server";
import { config } from "./config";


(async ()=>{
	try{
		await initDatabase();
		await startServer();
		console.info('Server started on port '+config.PORT);
	}catch(e){
		console.error('Error during init', e);
	}
})();

// Stop server on Ctrl+C
process.on('SIGTERM', async() => {
	try {
		await stopServer();
		await disconnectDatabase();
		console.info('Database disconnected');
	}catch(e) {
		console.error('Error stoping server', e)
	}
});

/*
process.on('uncaughtException', (err)=>{
	console.error('uncaughtException', err);
});*/

process.on('unhandledRejection', (err)=>{
	console.error('unhandledRejection', err);
});