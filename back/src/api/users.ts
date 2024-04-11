import { Router } from "express";
import { User } from "../entity/User";
import { FindOptionsWhere } from "typeorm";
import { isExtensionInstalled } from "../twitch/extension";
import { Secret } from "../entity/Secret";

export const usersRouter = Router();

usersRouter.get('', async (req, res, next)=>{
	try{
		const where: FindOptionsWhere<User> = {};

		// Filter users with config to use GCP
		if(req.query.gcp) {
			// @ts-expect-error Typeorm typings lack mongodb support
			where['config.translateService'] = 'gcp';
		}

		const users: User[] = await User.find({ where, order: { created: 'DESC' } });

		// Keep only fields useful for user list
		res.json(users.map(({ created, updated, twitchId, twitchLogin }) => {
			return { created, updated, twitchId, twitchLogin };
		}));
	}catch(e) {
		next(e);
	}
});

type UserInfo = Partial<User> & {
	extInstalled?: boolean
	gcpKeyCreated?: Date
	gcpKeyLastUsed?: Date
}

usersRouter.get('/:twitchid', async (req, res, next)=>{
	try{
		const twitchId = req.params.twitchid;

		const user: UserInfo | null = await User.findOneBy({ twitchId });
		if(!user) {
			return res.status(404).json({message: 'Not found'});
		}

		delete user.twitchToken;

		user.extInstalled = await isExtensionInstalled(twitchId);
		const key = await Secret.findOneBy({ twitchId, type: 'gcpKey' });
		if(key) {
			user.gcpKeyCreated = key.created;
			user.gcpKeyLastUsed = key.updated;
		}

		res.json(user);
	}catch(e) {
		next(e);
	}
});
