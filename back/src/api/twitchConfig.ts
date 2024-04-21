import { Router } from "express";
import { TwitchConfigSchema, User } from "../entity/User";
import { saveTwitchConfig } from "../twitch/extension";
import { SessionRequest } from "supertokens-node/framework/express";

export const twitchConfigRouter = Router();

twitchConfigRouter.get('', async (req: SessionRequest, res, next)=>{
	try{
		const user = await User.findOneByOrFail({userId: req.session?.getUserId()});
		res.json(user.twitchConfig);
	}catch(e) {
		next(e);
	}
});

twitchConfigRouter.post('', async (req: SessionRequest, res, next)=>{
	try{
		const user = await User.findOneByOrFail({userId: req.session?.getUserId()});
		const config = TwitchConfigSchema.partial().parse(req.body);
		Object.assign(user.twitchConfig, config);
		await saveTwitchConfig(user.twitchId, JSON.stringify(user.twitchConfig));
		await User.update({
			id: user.id
		},{
			twitchConfig: user.twitchConfig
		});
		res.json(user.twitchConfig);
	}catch(e) {
		next(e);
	}
});
