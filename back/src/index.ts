import "reflect-metadata";
import { disconnectDatabase, initDatabase } from './database';
import { startServer, stopServer } from "./server";
import { environment } from "./environment";
import { logger } from "./logger";
import { User } from "./entity/User";
import { Secret } from "./entity/Secret";


(async ()=>{
	try{
		await initDatabase();
		// await encryptKeys();
		await startServer();
		logger.info('Server started on port '+environment.PORT);
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


// Temporary startup function to encrypt all API keys in database before starting app
async function encryptKeys() {
	logger.info('Encrypting API keys');
	let count = 0;
	const users = await User.find({where: {}});

	const promises: Promise<any>[] = [];

	for(const u of users) {
		if(u.secrets.gcpKey) {
			const secret = new Secret();
			secret.twitchId = u.twitchId;
			secret.type = 'gcpKey';
			secret.setValue(u.secrets.gcpKey);
			promises.push(secret.save());
			count++;
		}
	}
	logger.info('Saving ' + count + ' encrypted API keys');
	await Promise.all(promises);
	logger.info('All API keys encrypted');
}
