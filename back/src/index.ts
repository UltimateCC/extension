import "reflect-metadata";
import { disconnectDatabase, initDatabase } from './database';
import { startServer, stopServer } from "./server";
import { logger } from "./utils/logger";
import { startMetricsServer, stopMetricsServer } from "./utils/metrics";


(async ()=>{
	try{
		await initDatabase();
		await Promise.all([
			startServer(),
			startMetricsServer()
		]);
	}catch(e){
		logger.error('Error during init', e);
	}
})();

// Stop server on Ctrl+C
process.on('SIGTERM', async() => {
	try {
		await stopServer();
		logger.info('Server closed');
		await stopMetricsServer();
		await disconnectDatabase();
		process.exit(0);
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
