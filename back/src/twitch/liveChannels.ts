import { getCaptionSessionIfExists } from "../CaptionSession"
import { environment } from "../utils/environment"
import { logger } from "../utils/logger"
import { metrics } from "../utils/metrics"
import { api, clientId } from "./twitch"

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
	translateLangs: string[]
}

let liveChannels: LiveChannel[] = [];

/** Get channels currently live with the extension activated */
export function getLiveChannels() {
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

			const sessionStatus = await getCaptionSessionIfExists(channel.id)?.getStatus();
			if(!sessionStatus?.lastSpokenLang) return;

			const stream = await api.streams.getStreamByUserIdBatched(channel.id);
			if(!stream) return;

			const spokenLang = sessionStatus.lastSpokenLang.split('-')[0];
			const translateLangs = (sessionStatus.translateLangs ?? []).filter(l => l!==spokenLang);

			out.push({
				id: stream.userId,
				name: stream.userName,
				displayName: stream.userDisplayName,
				gameName: stream.gameName,
				title: stream.title,
				viewers: stream.viewers,
				thumbnailUrl: stream.getThumbnailUrl(640, 360),
				spokenLang,
				translation: sessionStatus.translationEnabled ?? false,
				translateLangs
			});
		}));

		// Sort all fetched streams by descending viewer count
		out.sort((a,b)=> b.viewers - a.viewers);

		liveChannels = out;

		updateMetrics();
	}catch(e) {
		logger.error('Error getting live channels', e);
	}
}

function updateMetrics() {
	let viewers = 0;
	let translation = 0;
	let translateLangs = 0;
	for(const live of liveChannels) {
		viewers += live.viewers;
		if(live.translation) {
			translation++;
			translateLangs += live.translateLangs.length;
		}
	}
	metrics.liveChannels.set(liveChannels.length);
	metrics.liveViewers.set(viewers);
	metrics.translateChannels.set(translation);
	metrics.translateLangs.set(translateLangs);
}
