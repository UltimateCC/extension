
import { User } from "../entity/User";
import { AzureStt } from "./AzureStt";


export function getStreamingStt(u: User) {

	switch(u.config.stt.type) {

		case 'azure':
			return new AzureStt(u.config, u.secrets);

		default:
			return null;
	}

}