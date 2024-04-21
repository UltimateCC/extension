import { z } from "zod";
import { Entity, Column, ObjectIdColumn, ObjectId, CreateDateColumn, UpdateDateColumn, BaseEntity } from "typeorm";
import { AccessToken } from "@twurple/auth";
import { randomBytes } from "crypto";
import { promisify } from "node:util";

const randBytes = promisify(randomBytes);

@Entity()
export class User extends BaseEntity {
	@ObjectIdColumn()
	id: ObjectId;

	// Properties
	@CreateDateColumn()
	created: Date

	@UpdateDateColumn()
	updated: Date

	@Column({unique: true})
	userId: string;

	@Column({unique: true})
	twitchId: string;

	@Column()
	twitchLogin: string;

	@Column()
	twitchName: string;

	@Column()
	img: string;

	@Column('json')
	twitchToken: AccessToken;

	@Column()
	email: string;

	@Column()
	webhookSecret: string;

	@Column('json')
	config: UserConfig = UserConfigSchema.parse({});

	@Column()
	twitchConfig: TwitchConfig = {};

	// Methods
	async genWebhookSecret() {
		const bytes = await randBytes(32);
		this.webhookSecret = bytes.toString('hex');
		await this.save();
	}
}

export const UserConfigSchema = z.object({
	transcribe: z.enum([''/*, 'azure'*/]).default(''),
	spokenLang: z.string().default('en-US'),
	lastSpokenLang: z.string().optional(),
	/*spokenLangs: z.array(z.string()).optional(),*/

	translateService: z.enum(['', 'gcp']).default(''),
	translateLangs: z.array(z.string()).default([]),

	twitchAutoStop: z.boolean().default(true),

	banWords: z.array(
		z.string().max(50).refine(s => [...'.*+?^${}()|[]\\'].every(c => !s.includes(c)))
	).max(100).default([]),

	customDelay: z.number().min(-5).max(1800).default(0),

	obsEnabled: z.boolean().default(false),
	obsPort: z.number().default(4455),
	obsPassword: z.string().default(''),
	obsSendCaptions: z.boolean().default(true),
	obsAutoStop: z.boolean().default(true),

	browserSourceEnabled: z.boolean().default(false)
});

export type UserConfig = z.infer<typeof UserConfigSchema>;

export const TwitchConfigSchema = z.object({
	showCaptions: z.boolean()
}).partial();

export type TwitchConfig = z.infer<typeof TwitchConfigSchema>;
