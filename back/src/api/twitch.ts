import { Router } from "express";
import { getLiveChannels } from "../twitch/liveChannels";

export const twitchRouter = Router();

twitchRouter.get('/live', async (req, res, next)=>{
	try{
		const channels = getLiveChannels();
		res.json(channels);
	}catch(e) {
		next(e);
	}
});
