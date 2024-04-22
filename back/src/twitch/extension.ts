import { sendExtensionPubSubBroadcastMessage, setExtensionBroadcasterConfiguration } from "@twurple/ebs-helper";
import { api, clientId, secret, ownerId, ensureUserReady } from "./twitch";
import { logger } from "../config/logger";
import { metrics } from "../utils/metrics";

// Check if user has installed extension
export async function isExtensionInstalled(twitchId: string) {
	try{
		await ensureUserReady(twitchId);
		const exts = await api.asUser(twitchId, (client) => client.users.getActiveExtensions(twitchId, true));

		return exts.getAllExtensions().some(ext => ext.id === clientId);
	}catch(e) {
		logger.error('Error checking if extension is installed', e);
	}
}

export async function sendPubsub(twitchId: string, message: string) {
	try{
		await sendExtensionPubSubBroadcastMessage({ clientId, secret, ownerId }, twitchId, message);
	}catch(e) {
		if(e && typeof e === 'object' && 'statusCode' in e && typeof e.statusCode === 'number') {
			const status = e?.statusCode;
			metrics.pubsubErrors.inc({ status });
			logger.warn(`Error ${status} sending pubsub for user ${twitchId}`);
		}else{
			logger.error(`Unexpected error sending pubsub for user ${twitchId}`, e);
		}
	}
}

export async function saveTwitchConfig(twitchId: string, config: string) {
	await setExtensionBroadcasterConfiguration({ clientId, secret, ownerId }, twitchId, config);
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
