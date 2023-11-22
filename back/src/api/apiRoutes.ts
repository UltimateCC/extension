import { Router } from "express";
import { authMiddleware, authRouter } from "./auth";
import { thanksRouter } from "./thanks";
import { webhooksRouter } from "./webhooks";
import { configRouter } from "./config";
import { secretsRouter } from "./secrets";
import { twitchRouter } from "./twitch";
import { statsRouter } from "./stats";


export const apiRouter = Router();

// Public routes
// Auth
apiRouter.use('/auth', authRouter);

// Thanks page
apiRouter.use('/thanks', thanksRouter);

// Webhooks
apiRouter.use('/webhooks', webhooksRouter);

// Authenticated routes
// User config (loaded when connected to websocket)
apiRouter.use('/config', authMiddleware, configRouter);

// Secrets
apiRouter.use('/secrets', authMiddleware, secretsRouter);

// Twitch configuration
apiRouter.use('/twitch', authMiddleware, twitchRouter);

// Statistics
apiRouter.use('/stats', authMiddleware, statsRouter);
