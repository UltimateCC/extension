import { Router } from "express";
import { User } from "../entity/User";
import { logger } from "../utils/logger";
import { GCPTranslator } from "../translate/GCPTranslator";
import { z } from "zod";
import { Secret, SecretType } from "../entity/Secret";

export const secretsRouter = Router();

const PostBodyType = z.object({
	type: SecretType,
	value: z.string().min(1).max(128).optional()
});

secretsRouter.post('', async (req, res, next)=>{
	try{
		const data = PostBodyType.parse(req.body);
		const user = await User.findOneByOrFail({ twitchId: req.session.userid });

		// Verify value
		if(data.value) {
			// If new GCP API key is given, check if it works
			if(data.type === 'gcpKey') {
				logger.debug(`Saving GCP key for ${req.session.userid}`);
				const check = await GCPTranslator.checkKey(data.value);
				if(check.isError) {
					logger.warn(`Error saving GCP key for ${req.session.userid} : ${check.message}`, check.text);
					return res.status(400).json({
						message: `GCP API error: ${check.message}`
					});
				}
			}
		}

		// Remove old secret if there is one
		await Secret.delete({ twitchId: user.twitchId, type: data.type });

		// Save new secret
		if(data.value) {
			const secret = new Secret();
			secret.twitchId = user.twitchId;
			secret.type = data.type;
			secret.setValue(data.value);
			await secret.save();
		}

		res.json({success: true});
	}catch(e) {
		next(e);
	}
});

