
import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Stats } from "./entity/Stats";


export const dataSource = new DataSource({
	type: "mongodb",
	url: process.env.DB_URL!,
	entities: [User, Stats],
	connectTimeoutMS: 5000,
});

/** Retry multiple times connecting to database */
export async function initDatabase() {
	let tries = 0;

	while(true) {
		try {
			await dataSource.initialize();
			await dataSource.synchronize();
			break;
		}catch(e) {
			tries++;
			if(tries<10) {
				console.error('Error connecting to database, retrying in 5 seconds', e);
				await new Promise((res)=>{ setTimeout(res, 5000) });				
			}else{
				console.error('Unable to connect to database', e);
				process.exit(1);
			}
		}
	}
}