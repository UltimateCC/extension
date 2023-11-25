import "reflect-metadata";
import { initDatabase } from './database';
import { startServer, stopServer } from "./server";


(async ()=>{
	try{
		await initDatabase();
		await startServer();
		console.info('Server started on port '+process.env.PORT);
	}catch(e){
		console.error('Error during init', e);
	}
})();

// Stop server on Ctrl+C
process.on('SIGTERM', () => {
	stopServer();
});

/*
process.on('uncaughtException', (err)=>{
	console.error('uncaughtException', err);
});*/

process.on('unhandledRejection', (err)=>{
	console.error('unhandledRejection', err);
});