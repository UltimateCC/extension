import { Router } from "express";
import { Stats } from "../entity/Stats";

const admins = (process.env.ADMINS_TWITCHID ?? '').split(',');

export const statsRouter = Router();

statsRouter.get('', async (req, res, next)=>{
	try{
		// If user is admin and "all" parameter is set, get stats from all users
		let all = false;
		if(req.query.all) {
			if(!admins.includes(req.session.userid!)) {
				res.status(403).json({
					error: 'Forbidden'
				});
				return;
			}
			all = true;
		}
		const stats = await Stats.findBy({ twitchId: all ? undefined : req.session.userid });
		res.json(stats);
	}catch(e) {
		next(e);
	}
});