
import { NextFunction, Request, Response, Router } from "express";
import { auth, authURL } from "../twitch";
import { User } from "../entity/User";


declare module 'express-session' {
	interface SessionData {
		userid: string
		login: string
		img: string
		connected: boolean
	}
}

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
	if(!req.session.userid) {
		res.status(401).json({message: 'Missing authorization'});
	}else{
		next();
	}
}

export const authRouter = Router();

authRouter.get('', (req, res, next)=>{
	res.json({
		connected: req.session.connected,
		userid: req.session.userid,
		login: req.session.login,
		img: req.session.img,
		url: authURL
	});
});

authRouter.post('', async (req, res, next)=>{
	try{
		if(!req.body || !req.body.code || typeof req.body.code !== 'string') {
			return res.status(400).send('Missing code');
		}
		const { login, userId, email, token, img } = await auth(req.body.code);
		
		let user = await User.findOneBy({ twitchId: userId });
		if(!user) {
			user = new User();
		}
		user.twitchId = userId;
		user.twitchLogin = login;
		user.twitchToken = token;
		user.email = email ?? '';

		await user.save();
		req.session.connected = true;
		req.session.userid = userId;
		req.session.login = login;
		req.session.img = img;
		console.info(login + ' authenticated');
		return res.json({login, userid: userId, img, connected: true, url: authURL});
	}catch(e) {
		next(e);
	}
});

authRouter.delete('', authMiddleware, (req, res, next)=>{
	req.session.destroy((err)=>{
		if(err) next(err);
		else res.status(200).send({message: 'Disconnected'});
	});
});
