import { UserConfig, UserSecrets } from "../entity/User";
import { CaptionsData, Result, TranscriptData } from "../types";


export abstract class SpeechToText {
	constructor(protected config: UserConfig, protected secrets: UserSecrets) {}

	abstract ready(): boolean;
	abstract transcribe(data: Buffer, duration: number): Promise<Result<TranscriptData | null> >;
}