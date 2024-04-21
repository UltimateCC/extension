import { Router } from "express";
import { User } from "../entity/User";
import { getSession } from "supertokens-node/recipe/session";
import { isAdminSession } from "../config/auth";

export const authRouter = Router();

authRouter.get('', async (req, res, next) => {
	try {
		const session = await getSession(req, res, { sessionRequired: false });
		if(session) {
			const [admin, user] = await Promise.all([
				isAdminSession(session),
				User.findOneByOrFail({userId: session.getUserId()})
			]);

			res.json({
				connected: true,
				displayName: user.twitchName,
				img: user.img,
				twitchId: user.twitchId,
				admin: (admin ? true : undefined),
			});
		}else{
			res.json({ connected: false });
		}
	}catch(e) {
		next(e);
	}

});
