import { Router } from "express";
import { Stats } from "../entity/Stats";

export const statsRouter = Router();

statsRouter.get('', async (req, res, next)=>{
	try{
		let stats: Stats[];	

		// If user is admin and "all" parameter is set, get stats from all users
		if(req.query.all) {
			if(!req.session.admin) {
				res.status(403).json({
					error: 'Forbidden'
				});
				return;
			}
			stats = await Stats.find();
		}else{
			stats = await Stats.find({where:{ twitchId: req.session.userid }});
		}
		res.json(stats);
	}catch(e) {
		next(e);
	}
});