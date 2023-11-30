import { Router } from "express";
import { TwitchConfigSchema, User } from "../entity/User";
import { saveTwitchConfig } from "../twitch/extension";

export const twitchConfigRouter = Router();

twitchConfigRouter.get('', async (req, res, next)=>{
	try{
		const user = await User.findOneByOrFail({twitchId: req.session.userid});
		res.json(user.twitchConfig);
	}catch(e) {
		next(e);
	}
});

twitchConfigRouter.post('', async (req, res, next)=>{
	try{
		const user = await User.findOneByOrFail({twitchId: req.session.userid});
		const config = TwitchConfigSchema.partial().parse(req.body);
		Object.assign(user.twitchConfig, config);
		await saveTwitchConfig(user.twitchId, JSON.stringify(config));
		await user.save();
		res.json(user.twitchConfig);
	}catch(e) {
		next(e);
	}
});