import { Stats } from "./entity/Stats";
import { User, UserConfig } from "./entity/User";
import { Translator } from "./translate/Translator";
import { getTranslator } from "./translate/getTranslator";
import { logger } from "./utils/logger";
import { io, registerTwitchAutoStop } from "./socketioServer";
import { isExtensionInstalled, sendPubsub } from "./twitch/extension";
import { applyBanwords } from "./utils/functions";
import { CaptionsData, TranscriptData } from "./types";
import { metrics } from "./utils/metrics";


const SESSION_TIMEOUT = 1000 * 60 * 15;

const captionSessions = new Map<string, CaptionSession>();

export function getCaptionSession(twitchId: string) {
	let s = captionSessions.get(twitchId);
	if(!s) {
		s = new CaptionSession(twitchId);
		captionSessions.set(twitchId, s);
	}
	return s;
}

export async function getAllSessionsStatus() {
	return Promise.all([...captionSessions.values()].map(s => s.getStatus()));
}

/** Gracefully end all sessions (called at shutdown) */
export async function endSessions() {
	// End all sessions (triggers saving statistics)
	await Promise.all([...captionSessions.values()].map(s => s.unload()));
	logger.info('All sessions ended');
}

export class CaptionSession {
	private ready: boolean;
	private loading?: Promise<void>;
	private shouldReload: boolean;
	private timeout: ReturnType<typeof setTimeout>;
	private lastSpokenLang: string;
	private stats: Stats | null;
	private config: UserConfig;
	private translator: Translator;

	constructor(private twitchId: string) {}

	reload() {
		if(this.loading) {
			this.shouldReload = true;
		}else{
			this.loading = this.load();
			this.loading.catch(e=>logger.error('Error loading config', e));
		}
	}

	private async load() {
		try{
			// End previous session if there was one
			await this.unload();

			// Fetch user
			const u = await User.findOneOrFail({where: { twitchId: this.twitchId }, cache: false });
			this.config = u.config;

			if(this.config.twitchAutoStop !== false) {
				registerTwitchAutoStop(u.twitchId);
			}

			//Init statistics
			this.stats = new Stats();
			this.stats.twitchId = u.twitchId;
			this.stats.config = this.config;

			// Translation
			this.translator = getTranslator(u);
			const init = await this.translator.init();
			if(init.isError) {
				io.to(`twitch-${this.twitchId}`).emit('info', {type: 'error', message: `Translation API initialization error: ${init.message}`});
				logger.warn(`Translation API initialization error for user ${this.twitchId}: ${init.message}`);
			}

			// Send available translation languages
			const langs = await this.translator.getLangs();
			io.to(`twitch-${this.twitchId}`).emit('translateLangs', langs);

			// Warn if extension is not installed
			if((await isExtensionInstalled(this.twitchId)) === false) {
				io.to(`twitch-${this.twitchId}`).emit('info', { type: "warn", message: 'The Twitch extension is not installed on your channel' });
			}

			this.keepAlive();
		}catch(e) {
			delete this.loading;
			throw e;
		}

		if(this.shouldReload) {
			await new Promise(res => setTimeout(res, 500));
			this.shouldReload = false;
			this.loading = this.load();
			await this.loading;
		}
		delete this.loading;
		this.ready = true;
	}

	async unload() {
		try {
			clearTimeout(this.timeout);
			this.ready = false;
			// Save statistics if necessary
			if(this.stats?.finalCount || this.stats?.partialCount) {
				const stats = this.stats;
				this.stats = null;
				stats.duration = stats.lastText - stats.firstText;
				stats.translatedCharCount = this.translator.getTranslatedChars();
				stats.translateErrorCount = this.translator.getErrorCount();
				await stats.save();
				logger.debug(`Saved stats for ${this.twitchId}`);
			}
		}catch(e) {
			logger.error(`Error unloading usage session of ${this.twitchId}`, e);
		}
	}

	async ensureLoaded() {
		if(!this.ready) {
			if(!this.loading) {
				this.loading = this.load();
			}
			await this.loading;
		}
	}

	keepAlive() {
		clearTimeout(this.timeout);
		this.timeout = setTimeout(() => {
			captionSessions.delete(this.twitchId);
			this.unload();
		}, SESSION_TIMEOUT);
	}

	async handleTranscript(transcript: TranscriptData) {
		const start = Date.now();

		await this.ensureLoaded();
		this.keepAlive();
		this.lastSpokenLang = transcript.lang;
		try {
			transcript.text = applyBanwords(this.config.banWords ?? [], transcript.text);

			if(this.config.browserSourceEnabled) {
				io.to(`browserSource-${this.twitchId}`).emit('transcript', transcript);
			}

			// Count statistics
			if(this.stats) {
				this.stats.countTranscript(transcript);
			}

			const out = await this.translator.translate(transcript);
			if(out.isError) {
				io.to(`twitch-${this.twitchId}`).emit('info', { type: 'warn', message: out.message });
				logger.error(`Translation failed for ${this.twitchId} : ${out.message}`);
			}else{
				// If translation generated errors, warn user
				if(out.errors?.length) {
					// If multiple translation errors, it's probably multiple times the same
					// -> Send only first one to user
					const message = out.errors[0];
					// Do not send errors 500+ to users to avoid confusion
					if(!message.startsWith('Translation API error: 50')) {
						io.to(`twitch-${this.twitchId}`).emit('info', { type: 'warn', message });
					}
					logger.warn(`Translation error for ${this.twitchId} : ${message}`);
				}

				// For each translated text, apply banwords
				const censoredText = out.data.map(t => ({
					...t,
					text: applyBanwords(this.config.banWords ?? [], t.text)
				}));

				await this.sendCaptions({
					captions: censoredText,
					delay: transcript.delay + (Date.now() - start),
					duration: transcript.duration,
					final: transcript.final,
					lineEnd: transcript.lineEnd
				});
			}
		}catch(e) {
			logger.error(`Error handling transcript for ${this.twitchId}`, e);
		}
	}

	async sendCaptions(data: CaptionsData) {
		try{
			logger.debug(`Sending captions for ${this.twitchId}`, data);

			metrics.captionsDelay.observe({ final: data.final ? 1 : 0 }, Math.max(0, (data.delay / 1000) + 1));
			if(this.config.browserSourceEnabled) {
				io.to(`browserSource-${this.twitchId}`).emit('captions', data);
			}
			await sendPubsub(this.twitchId, JSON.stringify(data));
		}catch(e) {
			logger.error(`Unexpected error sending captions for user ${this.twitchId}`, e);
		}
	}

	async getStatus() {
		return {
			twitchId: this.twitchId,
			lastSpokenLang: this.lastSpokenLang,
			translationEnabled: this.translator.isWorking(),
			translateLangs: this.config.translateLangs
		}
	}

}
