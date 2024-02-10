import { BaseEntity, Column, CreateDateColumn, Entity, ObjectId, ObjectIdColumn } from "typeorm";
import { UserConfig } from "./User";
import { TranscriptData } from "../types";
import { metrics } from "../utils/metrics";

@Entity()
export class Stats extends BaseEntity {
	@ObjectIdColumn()
	id: ObjectId;

	// Properties
	@CreateDateColumn()
	created: Date;

	@Column()
	twitchId: string;

	@Column()
	duration: number;

	@Column()
	partialCount: number = 0;

	@Column()
	finalCount: number = 0;

	@Column()
	partialCharCount: number = 0;

	@Column()
	finalCharCount: number = 0;

	@Column()
	translatedCharCount: number = 0;

	@Column()
	config: UserConfig;

	@Column()
	translateErrorCount: number = 0;

	// Date for first and last text used for calculating duration
	firstText: number;
	lastText: number;

	countTranscript(transcript: TranscriptData) {
		if(transcript.final) {
			this.finalCount++;
			this.finalCharCount += transcript.text.length;
		}else{
			this.partialCount++;
			this.partialCharCount += transcript.text.length;
		}
		metrics.sentenceTotal.inc({ final: transcript.final ? 1 : 0 });
		metrics.charTotal.inc({ final: transcript.final ? 1 : 0 });

		const now = Date.now();
		if(!this.firstText) {
			this.firstText = now - transcript.duration;
		}
		this.lastText = now;
	}
}
