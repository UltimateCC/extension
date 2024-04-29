import { z } from "zod";

export const envSchema = z.object({
	// Environment
	NODE_ENV: z.enum(['production','']).default(''),

	// Database url
	DB_URL: z.string().min(1),

	// Server listen port
	PORT: z.string().min(1),
	// Metrics listen port
	METRICS_PORT: z.string().default('9000'),

	// Logger log level
	LOGLEVEL: z.string().default('info'),

	// Supertokens (auth)
	SUPERTOKENS_URL: z.string().min(1),
	APP_DOMAIN: z.string().min(1),

	// Secret for encrypting user's api keys
	ENCRYPTION_SECRET: z.string().min(1),

	// Twitch config
	TWITCH_CLIENTID: z.string().min(1),
	TWITCH_CLIENTSECRET: z.string().min(1),
	TWITCH_OWNERID: z.string().min(1),
	TWITCH_SECRET: z.string().min(1),

	TWITCH_EVENTSUB_HOST: z.string(),
	TWITCH_EVENTSUB_SECRET: z.string(),

	// Discord token (to fetch thanks info)
	DISCORD_BOT_TOKEN: z.string().optional(),
});

export const environment = envSchema.parse(process.env);
