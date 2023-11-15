import { Router } from "express";
import { authMiddleware } from "./auth";
import { User } from "../entity/User";
import { io } from "../server";
import { Action } from "../types";


async function getWebhookUrl(twitchId: string, regen: boolean) {
	const user = await User.findOneByOrFail({ twitchId });
	if(!user.webhookSecret || regen) {
		await user.genWebhookSecret();
	}
	return '/api/webhooks/' + user.twitchId + '/' + user.webhookSecret;
}

export const webhooksRouter = Router();

// Get current webhook base url
webhooksRouter.get('/url', authMiddleware, async (req, res, next)=>{
	try {
		const url = await getWebhookUrl(req.session.userid!, false);
		res.json({ url });
	}catch(e) {
		next(e);
	}
});

// Generate a new webhook base url
webhooksRouter.post('/url', authMiddleware, async (req, res, next)=>{
	try {
		const url = await getWebhookUrl(req.session.userid!, true);
		res.json({ url });
	}catch(e) {
		next(e);
	}
});

// Handle webhook
webhooksRouter.post('/:id/:key', async (req, res, next)=>{
	try{
		const user = await User.findOneByOrFail({ twitchId: req.params.id, webhookSecret: req.params.key });

		let action: Action | undefined;
		if(req.query.setlang !== undefined) {
			action = {
				type: 'setlang',
				lang: typeof req.query.setlang === 'string' ? req.query.setlang : undefined
			}
		}
		// Other webhook actions can be handled here

		// If action received, send it to user
		if(action) {
			io.to('twitch-'+user.twitchId).emit('action', action);
			res.json({ success: true });
		}else{
			res.sendStatus(400);
		}
		
	}catch(e) {
		next(e);
	}
});