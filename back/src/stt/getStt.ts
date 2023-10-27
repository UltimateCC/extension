
import { User } from "../entity/User";
import { DeepgramStt } from "./DeepgramStt";
import { WhisperOpenAIStt } from "./WhisperOpenAIStt";


export function getStt(u: User) {

	switch(u.config.transcribe) {

		case 'whisper':
			return new WhisperOpenAIStt(u.config, u.secrets);

		case 'deepgram':
			return new DeepgramStt(u.config, u.secrets);

		default:
			return null;
	}

}