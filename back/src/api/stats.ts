import { Router } from "express";
import { Stats } from "../entity/Stats";

const admins = (process.env.ADMINS_TWITCHID ?? '').split(',');

export const statsRouter = Router();

// Basic way to get all statistics
// Will probably change soon (pagination + users can get their own stats)
statsRouter.get('', async (req, res, next)=>{
	try{
		if(!admins.includes(req.session.userid!)) {
			res.status(403).json({
				error: 'Forbidden'
			});
			return;
		}
		const stats = await Stats.find();
		res.json(stats);
	}catch(e) {
		next(e);
	}
});