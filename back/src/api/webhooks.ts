import { Router } from "express";
import { authMiddleware } from "./auth";
import { User } from "../entity/User";


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
		const user = User.findOneByOrFail({ twitchId: req.params.id, webhookSecret: req.params.key });
		// todo: handle actions
		res.json({ success: true });		
	}catch(e) {
		next(e);
	}
});