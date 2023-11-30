import { z } from "zod";


export const configSchema = z.object({
	// Database url
	DB_URL: z.string().min(1),

	// Server listen port
	PORT: z.string().min(1),

	// Logger log level
	LOGLEVEL: z.string().default('info'),

	// Secret for signing user sessions
	SESSION_SECRET: z.string().min(1),
	// Session redis URL
	SESSION_REDIS: z.string().min(1),

	// List of admins twitch id separated with ","
	// Admins are allowed to fetch global stats
	ADMINS_TWITCHID: z.string().default(''),

	// Twitch config
	TWITCH_CLIENTID: z.string().min(1),
	TWITCH_CLIENTSECRET: z.string().min(1),
	TWITCH_OWNERID: z.string().min(1),
	TWITCH_SECRET: z.string().min(1),
	TWITCH_REDIRECT_URI: z.string().min(1),

	// Discord token (to fetch thanks info)
	DISCORD_BOT_TOKEN: z.string().optional(),
});

export const config = configSchema.parse(process.env);
