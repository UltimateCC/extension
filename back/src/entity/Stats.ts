import { BaseEntity, Column, CreateDateColumn, Entity, ManyToOne, ObjectId, ObjectIdColumn } from "typeorm";
import { User, UserConfig } from "./User";


@Entity()
export class Stats extends BaseEntity {
	@ObjectIdColumn()
	id: ObjectId;

	// Relations
	@ManyToOne(() => User, (user) => user.stats)
	user: User;

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
	config: UserConfig;

	@Column()
	translateErrorCount: number = 0;

}