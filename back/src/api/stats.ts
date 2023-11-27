import { Router } from "express";
import { Stats } from "../entity/Stats";
import { config } from "../config";
import { FindManyOptions } from "typeorm";

const admins = config.ADMINS_TWITCHID.split(',');

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
		let stats: Stats[];	
		if(all) {
			stats = await Stats.find();
		}else {
			stats = await Stats.find({where:{ twitchId: req.session.userid }});
		}
		res.json(stats);
	}catch(e) {
		next(e);
	}
});