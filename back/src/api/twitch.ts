import { Router } from "express";
import { getLiveChannels } from "../twitch/liveChannels";
import { adminMiddleware } from "./auth";
import { getExtensionAnalytics } from "../twitch/extension";

export const twitchRouter = Router();

twitchRouter.get('/live', async (req, res, next)=>{
	try{
		res.json(getLiveChannels());
	}catch(e) {
		next(e);
	}
});

twitchRouter.get('/analytics',  adminMiddleware, async (req, res, next)=>{
	try{
		res.json(await getExtensionAnalytics());
	}catch(e) {
		next(e);
	}
});
