
import { NextFunction, Request, Response, Router } from "express";
import { auth, authURL } from "../twitch";
import { dataSource } from "../database";
import { User } from "../entity/User";


export function authMiddleware(req: Request, res: Response, next: NextFunction) {
	if(!req.session.userid) {
		res.status(401).json({message: 'Missing authorization'});
	}else{
		next();
	}
}

export const authRouter = Router();

authRouter.get('/api/auth', (req, res, next)=>{
	res.json({
		connected: req.session.connected,
		userid: req.session.userid,
		login: req.session.login,
		url: authURL
	});
});

authRouter.post('/api/auth',async (req, res, next)=>{
	try{
		if(!req.body || !req.body.code || typeof req.body.code !=='string') {
			return res.status(400).send('Missing code');
		}
		const { login, userid, token } = await auth(req.body.code);

		let user = await dataSource.manager.findOneBy(User, { twitchId: userid });
		if(!user) {
			user = new User();
		}
		user.twitchId = userid;
		user.twitchLogin = login;
		user.twitchToken = token;
		await dataSource.manager.save(user);
		req.session.connected = true;
		req.session.userid = userid;
		req.session.login = login;
		console.info(login + ' authenticated');
		return res.json({login, userid, connected: true, url: authURL});
	}catch(e) {
		next(e);
	}
});

authRouter.delete('/api/auth', authMiddleware, (req, res, next)=>{
	req.session.destroy((err)=>{
		if(err) next(err);
		else res.status(200).send({message: 'Disconnected'});
	});
});
