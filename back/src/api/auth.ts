
import { NextFunction, Request, Response, Router } from "express";
import { authURL } from "../twitch/twitch";
import { User } from "../entity/User";
import { auth } from "../twitch/auth";
import { logger } from "../logger";
import { environment } from "../environment";


declare module 'express-session' {
	interface SessionData {
		userid: string
		login: string
		img: string
		connected: boolean
		admin?: true
	}
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
	if(!req.session.userid) {
		res.status(401).json({message: 'Missing authorization'});
	}else{
		next();
	}
}

export function adminMiddleware(req: Request, res: Response, next: NextFunction) {
	if(!req.session.admin) {
		res.status(403).json({message: 'Forbidden'});
	}else{
		next();
	}
}

const admins = environment.ADMINS_TWITCHID.split(',');

export const authRouter = Router();

authRouter.get('', (req, res, next)=>{
	res.json({
		connected: req.session.connected,
		userid: req.session.userid,
		login: req.session.login,
		img: req.session.img,
		admin: req.session.admin,
		url: authURL
	});
});

authRouter.post('', async (req, res, next)=>{
	try{
		if(!req.body || !req.body.code || typeof req.body.code !== 'string') {
			return res.status(400).send('Missing code');
		}
		const { name, displayName, userId, email, token, img } = await auth(req.body.code);
		
		let user = await User.findOneBy({ twitchId: userId });
		if(!user) {
			user = new User();
		}
		user.twitchId = userId;
		user.twitchLogin = name;
		user.twitchToken = token;
		user.email = email ?? '';

		await user.save();
		req.session.connected = true;
		req.session.userid = userId;
		req.session.login = displayName;
		req.session.img = img;
		if(admins.includes(userId)) {
			req.session.admin = true;
		}
		logger.info(name + ' authenticated');
		return res.json({login: displayName, userid: userId, img, connected: true, url: authURL});
	}catch(e) {
		next(e);
	}
});

authRouter.delete('', (req, res, next)=>{
	req.session.destroy((err)=>{
		if(err) next(err);
		else res.status(200).send({message: 'Disconnected'});
	});
});
