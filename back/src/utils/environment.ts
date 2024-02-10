import { z } from "zod";


export const envSchema = z.object({
	// Environnement
	NODE_ENV: z.enum(['production','']).default(''),

	// Database url
	DB_URL: z.string().min(1),

	// Server listen port
	PORT: z.string().min(1),
	// Metrics listen port
	METRICS_PORT: z.string().default('9000'),

	// Logger log level
	LOGLEVEL: z.string().default('info'),

	// Secret for signing user sessions
	SESSION_SECRET: z.string().min(1),
	// Session redis URL
	SESSION_REDIS: z.string().min(1),

	// Secret for encrypting user's api keys
	ENCRYPTION_SECRET: z.string().min(1),

	// List of admins twitch id separated with ","
	// Admins are allowed to fetch global stats
	ADMINS_TWITCHID: z.string().default(''),

	// Twitch config
	TWITCH_CLIENTID: z.string().min(1),
	TWITCH_CLIENTSECRET: z.string().min(1),
	TWITCH_OWNERID: z.string().min(1),
	TWITCH_SECRET: z.string().min(1),
	TWITCH_REDIRECT_URI: z.string().min(1),

	TWITCH_EVENTSUB_HOST: z.string(),
	TWITCH_EVENTSUB_SECRET: z.string(),

	// Discord token (to fetch thanks info)
	DISCORD_BOT_TOKEN: z.string().optional(),
});

export const environment = envSchema.parse(process.env);
