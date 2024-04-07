import { Router } from "express";
import { getLiveChannels } from "../twitch/liveChannels";
import { adminMiddleware } from "./auth";
import { getExtensionAnalytics } from "../twitch/extension";

export const twitchRouter = Router();

twitchRouter.get('/live', async (req, res, next)=>{
	try{
		const channels = getLiveChannels();
		res.json(channels);
	}catch(e) {
		next(e);
	}
});

twitchRouter.get('/analytics',  adminMiddleware, async (req, res, next)=>{
	try{
		const data = await getExtensionAnalytics();
		res.json(data);
	}catch(e) {
		next(e);
	}
});
