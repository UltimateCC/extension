import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, ObjectId, ObjectIdColumn } from "typeorm";
import { User } from "./User";



@Entity()
export class Stat extends BaseEntity {
	@ObjectIdColumn()
	id: ObjectId;

	/*
	// Relations
	@ManyToOne(() => User, (user) => user.stats)
	user: User;
	*/

	// Properties
	@CreateDateColumn()
	created: Date;

	@Column()
	twitchId: string;

	@Column()
	duration: number;

	@Column()
	partialCount: number;

	@Column()
	finalCount: number;

	@Column()
	partialCharCount: number;

	@Column()
	finalCharCount: number;

	@Column()
	spokenLang: string;

	@Column()
	translateService: string;

	@Column()
	translateLangs: string;

	@Column()
	translateErrorCount: number;

}