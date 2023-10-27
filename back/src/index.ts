import "reflect-metadata";
import { initDatabase } from './database';
import { startServer } from "./server";


(async ()=>{
	try{
		await initDatabase();
		console.info('Database ready');
		await startServer();
		console.info('Server started on port '+process.env.PORT);
	}catch(e){
		console.error('Error during init', e);
	}
})();
