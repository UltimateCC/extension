import { getAllSessionsStatus } from "../CaptionSession"
import { logger } from "../utils/logger"
import { metrics } from "../utils/metrics"
import { api } from "./twitch"

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

// Schedule live channel list loading each 15sec
setInterval(loadLiveChannels, 15000);

async function loadLiveChannels() {
	try{
		const out: LiveChannel[] = [];
		const sessions = await getAllSessionsStatus();

		await Promise.all(sessions.filter(s=>s.lastSpokenLang).map(async (s) => {

			const stream = await api.streams.getStreamByUserIdBatched(s.twitchId);
			if(!stream) return;

			const spokenLang = s.lastSpokenLang.split('-')[0];
			const translateLangs = (s.translateLangs ?? []).filter(l => l!==spokenLang);

			out.push({
				id: stream.userId,
				name: stream.userName,
				displayName: stream.userDisplayName,
				gameName: stream.gameName,
				title: stream.title,
				viewers: stream.viewers,
				thumbnailUrl: stream.getThumbnailUrl(640, 360),
				spokenLang,
				translation: s.translationEnabled ?? false,
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
