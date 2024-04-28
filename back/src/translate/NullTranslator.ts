import { Result, TranscriptAlt } from "../types";
import { environment } from "../config/environment";
import { Translator } from "./Translator";

/** Stub translator not doing any translation */
export class NullTranslator extends Translator {

	ready(): boolean {
		return true;
	}

	protected async translateAll(transcript: TranscriptAlt, langs: string[]): Promise<Result<{data: TranscriptAlt[]}>> {
		const data = [transcript];

		// If not in production, add fake translated text for testing
		if(environment.NODE_ENV !== 'production') {
			data.push({
				text: transcript.text,
				lang: "test"
			});
		}

		return {
			isError: false,
			data
		}
	}
}
