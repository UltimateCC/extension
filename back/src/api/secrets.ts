
import { Router } from "express";
import { User, UserSecretsSchema } from "../entity/User";
import { logger } from "../logger";
import { GCPTranslator } from "../translate/GCPTranslator";

export const secretsRouter = Router();

secretsRouter.post('', async (req, res, next)=>{
	try{
		const user = await User.findOneByOrFail({twitchId: req.session.userid});
		const newSecrets = UserSecretsSchema.parse(req.body);

		// If new GCP API key is given, check if it works
		if(newSecrets.gcpKey) {
			logger.debug('Saving GCP key for '+req.session.userid);
			const err = await GCPTranslator.checkKey(newSecrets.gcpKey);
			if(err) {
				logger.warn('Error saving GCP key for '+req.session.userid+ ' '+err.message, err.text);
				return res.status(400).json({
					message: 'GCP API error: ' + err.message
				});
			}
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

