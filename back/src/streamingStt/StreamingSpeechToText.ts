import { EventEmitter } from "stream";
import { UserConfig, UserSecrets } from "../entity/User";
import { Info, TranscriptData } from "../types";


interface SttEvents {
	transcript: (transcript: TranscriptData) => void;
	info: ( info: Info )=>void;
}

export interface StreamingSpeechToText {
	on<U extends keyof SttEvents>(event: U, listener: SttEvents[U]): this;
	emit<U extends keyof SttEvents>(event: U, ...args: Parameters<SttEvents[U]>): boolean;
}


export abstract class StreamingSpeechToText extends EventEmitter {
	constructor(protected config: UserConfig, protected secrets: UserSecrets) {
		super();
	}

	abstract ready(): boolean;
	async start() {};
	async handleData(data: Buffer) {};
	async stop() {};
}