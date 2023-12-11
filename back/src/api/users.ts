import { Router } from "express";
import { User } from "../entity/User";

export const usersRouter = Router();

usersRouter.get('', async (req, res, next)=>{
	try{
		const users: Partial<User>[] = await User.find({where: {},  order: { created: 'DESC' }});

		users.forEach(u=>{
			delete u.secrets;
			delete u.twitchToken;
		});
		
		res.json(users);
	}catch(e) {
		next(e);
	}
});

usersRouter.get('/:twitchid', async (req, res, next)=>{
	try{
		const user: Partial<User> | null = await User.findOneBy({twitchId: req.params.twitchid});

		if(!user) {
			return res.status(404).json({message: 'Not found'});
		}

		delete user.secrets;
		delete user.twitchToken;
		
		res.json(user);
	}catch(e) {
		next(e);
	}
});