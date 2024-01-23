import { Router } from "express";
import { User, UserConfigSchema } from "../entity/User";

export const configRouter = Router();

configRouter.get('', async (req, res, next)=>{
	try{
		const user = await User.findOneByOrFail({twitchId: req.session.userid});
		res.json(user.config);
	}catch(e) {
		next(e);
	}
});

configRouter.post('', async (req, res, next)=>{
	try{
		const user = await User.findOneByOrFail({twitchId: req.session.userid});
		const userConfig = UserConfigSchema.partial().parse(req.body);
		Object.assign(user.config, userConfig);
		await User.update({
			id: user.id
		},{
			config: user.config
		});
		res.json(user.config);
	}catch(e) {
		next(e);
	}
});

