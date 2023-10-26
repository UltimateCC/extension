
import { CaptionsData, Result } from "../types";
import { Translator } from "./Translator";

/** Stub translator not doing any translation */
export class NullTranslator extends Translator {

	ready(): boolean {
		return true;
	}

	async translate(data: CaptionsData): Promise<Result<CaptionsData>> {
		return {
			isError: false,
			data: data
		}
	}
}