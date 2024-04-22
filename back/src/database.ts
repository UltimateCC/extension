import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Stats } from "./entity/Stats";
import { environment } from "./config/environment";
import { logger } from "./config/logger";
import { Secret } from "./entity/Secret";


export const dataSource = new DataSource({
	type: "mongodb",
	url: environment.DB_URL,
	entities: [User, Stats, Secret],
	connectTimeoutMS: 5000,
});

/** Retry multiple times connecting to database */
export async function initDatabase() {
	let tries = 0;
	let success = false;

	while(!success) {
		try {
			await dataSource.initialize();
			await dataSource.synchronize();
			success = true;
			logger.info('Database ready');
		}catch(e) {
			tries++;
			if(tries<10) {
				logger.error('Error connecting to database, retrying in 5 seconds', e);
				await new Promise((res)=>{ setTimeout(res, 5000) });
			}else{
				logger.error('Unable to connect to database', e);
				process.exit(1);
			}
		}
	}
}

export async function disconnectDatabase() {
	await dataSource.destroy();
}
