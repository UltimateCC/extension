import { sendExtensionPubSubBroadcastMessage, setExtensionBroadcasterConfiguration } from "@twurple/ebs-helper";
import { api, clientId, secret, ownerId, ensureUserReady } from "./twitch";
import { logger } from "../utils/logger";
import { metrics } from "../utils/metrics";

// Check if user has installed extension
export async function isExtensionInstalled(user: string) {
	try{
		await ensureUserReady(user);
		const exts = await api.asUser(user, (client) => client.users.getActiveExtensions(user, true));

		return exts.getAllExtensions().some(ext => ext.id === clientId);
	}catch(e) {
		logger.error('Error checking if extension is installed', e);
		// In case of error return true to not disturb user
		return true;
	}
}

export async function sendPubsub(userId: string, message: string) {
	try{
		await sendExtensionPubSubBroadcastMessage({ clientId, secret, ownerId }, userId, message);
	}catch(e) {
		if(e && typeof e === 'object' && 'statusCode' in e && typeof e.statusCode === 'number') {
			const status = e?.statusCode;
			metrics.pubsubErrors.inc({ status });
			logger.warn(`Error ${status} sending pubsub for user ${userId}`);
		}else{
			logger.error(`Unexpected error sending pubsub for user ${userId}`, e);
		}
	}
}

export async function saveTwitchConfig(userId: string, config: string) {
	await setExtensionBroadcasterConfiguration({ clientId, secret, ownerId }, userId, config);
}

export async function getExtensionAnalytics() {
	await ensureUserReady(ownerId);
	const res = await api.callApi({
		type: 'helix',
		method: 'GET',
		url: '/analytics/extensions',
		forceType: 'user',
		userId: ownerId,
		auth: true,
		query: {
			extension_id: clientId
		}
	}) as { data: unknown[] };

	return res.data[0];
}
