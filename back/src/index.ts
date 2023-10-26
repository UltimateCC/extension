import "reflect-metadata";
import { dataSource } from './database';
import { startServer } from "./server";


(async ()=>{
	try{
		await dataSource.initialize();
		await dataSource.synchronize();
		console.info('Database ready');
		await startServer();
		console.info('Server started on port '+process.env.PORT);
	}catch(e){
		console.error('Error during init', e);
	}
})();
