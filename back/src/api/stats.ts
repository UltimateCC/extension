import { Router } from "express";
import { Stats } from "../entity/Stats";
import { FindOptionsWhere } from "typeorm";

export const statsRouter = Router();

statsRouter.get('', async (req, res, next)=>{
	try{
		const where: FindOptionsWhere<Stats> = { twitchId: req.session.userid };

		if(req.session.admin) {
			if(req.query.all) {
				// Include all users
				delete where.twitchId;
			}else if(typeof req.query.twitchId === 'string') {
				// Filter to specific user
				where.twitchId = req.query.twitchId;
			}
		}

		// Filter only stats with translation
		if(req.query.translation) {
			// @ts-expect-error Typeorm typings lack mongodb support
			where.translatedCharCount = { $gt: 0 };
		}

		if(req.query.before && typeof req.query.before === 'string') {
			// @ts-expect-error Typeorm typings lack mongodb support
			where.created = { $lte: new Date(req.query.before) }
		}

		if(req.query.after && typeof req.query.after === 'string') {
			// @ts-expect-error Typeorm typings lack mongodb support
			where.created = { $gte: new Date(req.query.after) }
		}

		const stats = await Stats.find({where, order: { created: 'DESC' }});
		res.json(stats);
	}catch(e) {
		next(e);
	}
});
