
import { Router } from "express";
import { dataSource } from "../database";
import { User, UserConfigSchema, UserSecretsSchema } from "../entity/User";
import { authMiddleware } from "./auth";

export const apiRouter = Router();

apiRouter.get('/api/config', authMiddleware, async (req, res, next)=>{
	try{
		let user = await dataSource.manager.findOneByOrFail(User, { twitchId: req.session.userid});
		res.json(user.config);
	}catch(e) {
		next(e);
	}
});

apiRouter.post('/api/config', authMiddleware, async (req, res, next)=>{
	try{
		const user = await dataSource.manager.findOneByOrFail(User, {twitchId: req.session.userid});
		const config = UserConfigSchema.partial().parse(req.body);
		Object.assign(user.config, config);
		await dataSource.manager.save(user);
		res.json(user.config);
	}catch(e) {
		next(e);
	}
});

apiRouter.post('/api/secrets', authMiddleware, async (req, res, next)=>{
	try{
		const user = await dataSource.manager.findOneByOrFail(User, {twitchId: req.session.userid});
		Object.assign(user.secrets, UserSecretsSchema.parse(req.body));
		await dataSource.manager.save(user);
		res.json({success: true});
	}catch(e) {
		next(e);
	}
});

