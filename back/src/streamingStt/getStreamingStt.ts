
import { User } from "../entity/User";
import { StreamingSpeechToText } from "./StreamingSpeechToText";


export function getStreamingStt(u: User): StreamingSpeechToText | null {

	switch(u.config.transcribe) {

		/*
		case 'azure':
			return new AzureStt(u.config, u.secrets);
		*/

		default:
			return null;
	}

}