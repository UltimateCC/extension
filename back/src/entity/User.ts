
import { z } from "zod";
import { Entity, Column, PrimaryColumn } from "typeorm"
import { AccessToken } from "@twurple/auth";

@Entity()
export class User {
	@PrimaryColumn()
	twitchId: string;

	@Column()
	twitchLogin: string;

	@Column('json')
	twitchToken: AccessToken;

	@Column('json')
	config: UserConfig = {
		stt: {
			type: '',	
			lang: 'en-US',		
		},
		translation: {
			type: '',
			langs: ['fr-FR', 'en-US'],
		}
	};

	@Column('json')
	secrets: UserSecrets = {}
}

export const UserConfigSchema = z.object({
	stt: z.object({
		type: z.union([
			z.literal(''),
			z.literal('whisper'),
			z.literal('deepgram'),
			z.literal('azure'),
		]),
		lang: z.string(),
		langs: z.array(z.string()).optional()
	}),
	translation: z.object({
		type: z.union([
			z.literal(''),
			z.literal('azure'),
			z.literal('libre'),
			z.literal('gcp')
		]),
		langs: z.array(z.string()),
	})
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