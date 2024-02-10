import { sendExtensionPubSubBroadcastMessage, setExtensionBroadcasterConfiguration } from "@twurple/ebs-helper";
import { api, clientId, secret, ownerId, ensureUserReady } from "./twitch";
import { logger } from "../utils/logger";
import { getUserSockets } from "../socketioServer";
import { environment } from "../utils/environment";

// Check if user has installed extension
export async function isExtensionInstalled(user: string) {
	// https://dev.twitch.tv/docs/api/reference/#get-user-active-extensions
	// Dev version should be included, but they are not :/ bug ?

	// Dont warn user in dev
	if(environment.NODE_ENV !== 'production') {
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

interface LiveChannel {
	id: string
	name: string
	displayName: string
	viewers: number
	title: string
	gameName: string
	thumbnailUrl: string
	spokenLang: string
	translation: boolean
}

let liveChannels: LiveChannel[] = [];

/** Get channels currently live with the extension activated */
export async function getLiveChannels() {
	return liveChannels;
}

// Load live channels only on prod as it's only working with a released extension
if(environment.NODE_ENV === 'production') {
	setInterval(loadLiveChannels, 15000);
}

async function loadLiveChannels() {
	try{
		// Get all channels live with extension
		const channels = await api.withoutUser((client)=>{
			return client.extensions.getLiveChannelsWithExtensionPaginated(clientId).getAll();
		});

		const out: LiveChannel[] = [];

		await Promise.all(channels.map(async (channel) => {
			const sockets = await getUserSockets(channel.id);

			// Get a socket corresponding to a probably active session
			const socket = sockets.find(s=>s.data.lastSpokenLang);
			if(!socket) return;

			const socketData = socket.data;

			const stream = await api.streams.getStreamByUserIdBatched(channel.id);
			if(!stream) return;

			out.push({
				id: stream.userId,
				name: stream.userName,
				displayName: stream.userDisplayName,
				gameName: stream.gameName,
				title: stream.title,
				viewers: stream.viewers,
				thumbnailUrl: stream.getThumbnailUrl(640, 360),
				spokenLang: socketData.lastSpokenLang.split('-')[0],
				translation: socketData.translator?.isWorking() ?? false
			});
		}));

		// Sort all fetched streams by descending viewer count
		out.sort((a,b)=> b.viewers - a.viewers);

		liveChannels = out;
	}catch(e) {
		logger.error('Error getting live channels', e);
	}
}
