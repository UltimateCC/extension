
import { z } from "zod";
import { Entity, Column, ObjectIdColumn, ObjectId, CreateDateColumn, UpdateDateColumn, BaseEntity, OneToMany } from "typeorm";
import { AccessToken } from "@twurple/auth";
import { randomBytes } from "crypto";
import { promisify } from "node:util";
//import { Stat } from "./Stat";

const randBytes = promisify(randomBytes);

@Entity()
export class User extends BaseEntity {
	@ObjectIdColumn()
	id: ObjectId;

	// Relations
	/*
	@OneToMany(() => Stat, (stat) => stat.user)
	stats: Stat[];
	*/

	// Properties
	@CreateDateColumn()
	created: Date

	@UpdateDateColumn()
	updated: Date

	@Column({unique: true})
	twitchId: string;

	@Column()
	twitchLogin: string;

	@Column('json')
	twitchToken: AccessToken;

	@Column()
	webhookSecret: string;

	@Column('json')
	config: UserConfig = {
		transcribe: '',
		lastSpokenLang: 'fr-FR',
		spokenLang: 'en-US',
		spokenLangs: ['en-US'],
		translateService: '',
		translateLangs: [],
		banWords: []
	};

	@Column('json')
	secrets: UserSecrets = {};

	// Methods
	async genWebhookSecret() {
		const bytes = await randBytes(16);
		this.webhookSecret = bytes.toString('hex');
		await this.save();
	}
}

export const UserConfigSchema = z.object({
	transcribe: z.union([
		z.literal(''),
		z.literal('whisper'),
		z.literal('deepgram'),
		z.literal('azure'),
	]),
	lastSpokenLang: z.string(),
	spokenLang: z.string(),
	spokenLangs: z.array(z.string()),
	translateService: z.union([
		z.literal(''),
		z.literal('azure'),
		z.literal('libre'),
		z.literal('gcp')
	]),
	translateLangs: z.array(z.string()),
	banWords: z.array(z.object({
		lang: z.string(),
		text: z.string()
	}))
});

export type UserConfig = z.infer<typeof UserConfigSchema>;

export const UserSecretsSchema = z.object({
	// OpenAI API Key
	openaiKey: z.string().optional(),

	// Deepgram API key
	deepgramKey: z.string().optional(),

	// Azure stt config
	azureSttKey: z.string().optional(),
	azureSttRegion: z.string().optional(),

	// Azure translation config
	azureKey: z.string().optional(),
	azureRegion: z.string().optional(),

	// LibreTranslate config
	libreUrl: z.string().optional(),
	libreKey: z.string().optional(),

	//GCP translation config
	gcpKey: z.string().optional(),
});

export type UserSecrets = z.infer<typeof UserSecretsSchema>;