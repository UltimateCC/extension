
import { z } from "zod";
import { Entity, Column, ObjectIdColumn, ObjectId, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { AccessToken } from "@twurple/auth";

@Entity()
export class User {
	@ObjectIdColumn()
	id: ObjectId;

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

	@Column('json')
	config: UserConfig = {
		transcribe: '',	
		spokenLang: 'en-US',
		spokenLangs: ['en-US'],
		translateService: '',
		translateLangs: [],
		banWords: []
	};

	@Column('json')
	secrets: UserSecrets = {}
}

export const UserConfigSchema = z.object({
	transcribe: z.union([
		z.literal(''),
		z.literal('whisper'),
		z.literal('deepgram'),
		z.literal('azure'),
	]),
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