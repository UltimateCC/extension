import { Router } from "express";
import { getLiveChannels } from "../twitch/extension";


export const twitchRouter = Router();

twitchRouter.get('/live', async (req, res, next)=>{
	try{
		const channels = await getLiveChannels();
		res.json(channels);
	}catch(e) {
		next(e);
	}
});
