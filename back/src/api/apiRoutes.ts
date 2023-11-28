import { Router } from "express";
import { authMiddleware, authRouter } from "./auth";
import { thanksRouter } from "./thanks";
import { webhooksRouter } from "./webhooks";
import { configRouter } from "./config";
import { secretsRouter } from "./secrets";
import { twitchConfigRouter } from "./twitchConfig";
import { statsRouter } from "./stats";
import { twitchRouter } from "./twitch";


export const apiRouter = Router();

// Public routes
// Auth
apiRouter.use('/auth', authRouter);

// Thanks page
apiRouter.use('/thanks', thanksRouter);

// Get data from twitch
apiRouter.use('/twitch', twitchRouter);

// Webhooks
apiRouter.use('/webhooks', webhooksRouter);

// Authenticated routes
// User config (loaded when connected to websocket)
apiRouter.use('/config', authMiddleware, configRouter);

// Secrets
apiRouter.use('/secrets', authMiddleware, secretsRouter);

// Twitch configuration
apiRouter.use('/twitchconfig', authMiddleware, twitchConfigRouter);

// Statistics
apiRouter.use('/stats', authMiddleware, statsRouter);
