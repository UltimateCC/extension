import { Router } from "express";
import { thanksRouter } from "./thanks";
import { webhooksRouter } from "./webhooks";
import { configRouter } from "./config";
import { secretsRouter } from "./secrets";
import { twitchConfigRouter } from "./twitchConfig";
import { statsRouter } from "./stats";
import { twitchRouter } from "./twitch";
import { usersRouter } from "./users";
import { authRouter } from "./auth";
import { adminMiddleware, authMiddleware } from "../middleware/session";


export const apiRouter = Router();

// Public routes
// Previous auth: Ensure users with old dashboard loaded are considered disconnected
apiRouter.get('/auth', (req, res, next)=>{
	res.json({
		connected: false,
	});
});

// Info about connected user
apiRouter.use('/me', authRouter);

// Thanks page
apiRouter.use('/thanks', thanksRouter);

// Get data from twitch
apiRouter.use('/twitch', twitchRouter);

// Webhooks
apiRouter.use('/webhooks', webhooksRouter);

// Authenticated routes
// User configuration
apiRouter.use('/config', authMiddleware, configRouter);

// Secrets
apiRouter.use('/secrets', authMiddleware, secretsRouter);

// Twitch configuration
apiRouter.use('/twitchconfig', authMiddleware, twitchConfigRouter);

// Statistics
apiRouter.use('/stats', authMiddleware, statsRouter);

// Admin: List users
apiRouter.use('/users', adminMiddleware, usersRouter)
