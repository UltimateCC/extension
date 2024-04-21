import { Router } from "express";
import { User, UserConfigSchema } from "../entity/User";
import { SessionRequest } from "supertokens-node/framework/express";

export const configRouter = Router();

configRouter.get('', async (req: SessionRequest, res, next) => {
	try{
		const user = await User.findOneByOrFail({userId: req.session?.getUserId()});
		res.json(user.config);
	}catch(e) {
		next(e);
	}
});

configRouter.post('', async (req: SessionRequest, res, next)=>{
	try{
		const user = await User.findOneByOrFail({userId: req.session?.getUserId()});
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
