import { Router } from "express";
import { Stats } from "../entity/Stats";
import { FindOptionsWhere } from "typeorm";

export const statsRouter = Router();

statsRouter.get('', async (req, res, next)=>{
	try{
		let stats: Stats[];

		let where: FindOptionsWhere<Stats> = { twitchId: req.session.userid };

		if(req.session.admin) {
			if(req.query.all) {
				// Include all users
				delete where.twitchId;
			}else if(typeof req.query.twitchId === 'string') {
				// Filter to specific user
				where.twitchId = req.query.twitchId;
			}
		}
		stats = await Stats.find({where, order: { created: 'DESC' }});
		res.json(stats);
	}catch(e) {
		next(e);
	}
});