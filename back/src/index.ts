import "reflect-metadata";
import { disconnectDatabase, initDatabase } from './database';
import { startServer, stopServer } from "./server";
import { config } from "./config";
import { logger } from "./logger";


(async ()=>{
	try{
		await initDatabase();
		await startServer();
		logger.info('Server started on port '+config.PORT);
	}catch(e){
		logger.error('Error during init', e);
	}
})();

// Stop server on Ctrl+C
process.on('SIGTERM', async() => {
	try {
		await stopServer();
		await disconnectDatabase();
		logger.info('Database disconnected');
	}catch(e) {
		logger.error('Error stoping server', e)
	}
});

/*
process.on('uncaughtException', (err)=>{
	logger.error('uncaughtException', err);
});*/

process.on('unhandledRejection', (err)=>{
	logger.error('unhandledRejection', err);
});