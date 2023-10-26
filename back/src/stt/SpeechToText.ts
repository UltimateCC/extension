import { UserConfig, UserSecrets } from "../entity/User";
import { CaptionsData, Result } from "../types";


export abstract class SpeechToText {
	constructor(protected config: UserConfig, protected secrets: UserSecrets) {}

	abstract ready(): boolean;
	abstract transcribe(data: Buffer, duration: number): Promise<Result<CaptionsData | null> >;
}