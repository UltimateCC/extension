
import { Result, TranscriptAlt } from "../types";
import { Translator } from "./Translator";

/** Stub translator not doing any translation */
export class NullTranslator extends Translator {

	ready(): boolean {
		return true;
	}

	protected async translateAll(transcript: TranscriptAlt, langs: string[]): Promise<Result<TranscriptAlt[]>> {
		return {
			isError: false,
			data: [transcript]
		}
	}
}