import { sendExtensionPubSubBroadcastMessage, setExtensionBroadcasterConfiguration } from "@twurple/ebs-helper";
import { api, clientId, secret, ownerId, ensureUserReady } from "./twitch";
import { logger } from "../logger";

// Check if user has installed extension
export async function isExtensionInstalled(user: string) {
	// https://dev.twitch.tv/docs/api/reference/#get-user-active-extensions
	// Dev version should be included, but they are not :/ bug ?

	// Dont warn user in dev
	if(process.env.NODE_ENV !== 'production') {
		return true;
	}

	try{
		await ensureUserReady(user);
		const exts = await api.users.getActiveExtensions(user, true);
		for(const ext of exts.getAllExtensions()) {
			if(ext.id === clientId) {
				return true;
			} 
		}
	}catch(e) {
		logger.error('Error checking if extension is installed', e);
		// In case of error return true to not disturb user
		return true;
	}
	return false;
}

export async function sendPubsub(userId: string, message: string) {
	await sendExtensionPubSubBroadcastMessage({ clientId, secret, ownerId }, userId, message);
}

export async function saveTwitchConfig(userId: string, config: string) {
	await setExtensionBroadcasterConfiguration({ clientId, secret, ownerId }, userId, config);
}

// Get live channels currently live with the extension
export async function getLiveChannels() {
	const channels = await api.extensions.getLiveChannelsWithExtensionPaginated(clientId).getAll();
	return channels.map(c=>(
		{
			id: c.id,
			displayName: c.displayName,
			title: c.title,
			gameName: c.gameName
		}
	));
}