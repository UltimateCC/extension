
import { Router } from "express";
import { User, UserSecretsSchema } from "../entity/User";
import { logger } from "../logger";

export const secretsRouter = Router();

secretsRouter.post('', async (req, res, next)=>{
	try{
		const user = await User.findOneByOrFail({twitchId: req.session.userid});
		const newSecrets = UserSecretsSchema.parse(req.body);

		// If new GCP API key is given, check if it works
		if(newSecrets.gcpKey) {
			const params = new URLSearchParams({
				key: newSecrets.gcpKey,
				q: 'Hi',
				source: 'en',
				target: 'fr'
			});
			const gcpRes = await fetch("https://translation.googleapis.com/language/translate/v2?" + params );
			if(!gcpRes.ok) {
				const text = await gcpRes.text();
				logger.warn('Error saving GCP key for '+req.session.userid, text);
				return res.status(400).json({
					message: 'GCP API error: ' + gcpRes.status + ' ' + gcpRes.statusText
				});
			}
			logger.debug('Saving GCP key for '+req.session.userid);
		}

		Object.assign(user.secrets, newSecrets);
		await User.update({
			id: user.id
		},{
			secrets: user.secrets
		});
		res.json({success: true});
	}catch(e) {
		next(e);
	}
});

