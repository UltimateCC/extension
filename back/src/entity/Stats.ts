import { BaseEntity, Column, CreateDateColumn, Entity, ObjectId, ObjectIdColumn } from "typeorm";
import { UserConfig } from "./User";
import { TranscriptData } from "../types";

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

	countTranscript(transcript: TranscriptData) {
		if(transcript.final) {
			this.finalCount++;
			this.finalCharCount += transcript.text.length;
		}else{
			this.partialCount++;
			this.partialCharCount += transcript.text.length;
		}
	}
}
