import { Secret } from "../entity/Secret";
import { logger } from "../config/logger";
import { Result, TranscriptAlt } from "../types";
import { Translator } from "./Translator";
import { metrics } from "../utils/metrics";

// https://cloud.google.com/translate/docs/reference/rest/v2/translate

export class GCPTranslator extends Translator {

	private key: string;

	ready() {
		return !!this.key;
	}

	/** Check if API key is working by translating an empty string */
	static async checkKey(key: string) {
		const params = new URLSearchParams({
			key,
			q: '',
			source: 'en',
			target: 'fr'
		});
		const res = await fetch(`https://translation.googleapis.com/language/translate/v2?${params}`);
		if(!res.ok) {
			const json = await res.json();
			const message = json?.error?.message;

			return {
				isError: true,
				message: `GCP API returned error ${res.status} ${res.statusText}${message? ` : ${message}` : ''}`
			}
		}
		return {
			isError: false
		}
	}

	async init() {
		const secret = await Secret.findOneBy({ twitchId: this.user.twitchId, type: 'gcpKey' });
		if(!secret) {
			return {
				isError: false,
				message: 'No API key found'
			}
		}
		const key = await secret.getValue();
		const check = await GCPTranslator.checkKey(key);
		if(check.isError) {
			return check;
		}
		this.key = key;
		this.translating = true;
		return {
			isError: false
		}
	}

	protected async translateOne(transcript: TranscriptAlt, target: string): Promise<Result<{data: TranscriptAlt}>> {

		const params = new URLSearchParams({
			q: transcript.text,
			source: transcript.lang,
			format: 'text',
			target: target,
			key: this.key
		});

		const end = metrics.gcpRequests.startTimer();

		const res = await fetch(`https://translation.googleapis.com/language/translate/v2?${params}`, {
			method: 'POST'
		});

		end({ status: res.status });

		if(res.ok) {
			const json = await res.json();
			return {
				isError: false,
				data: { text: json?.data?.translations[0]?.translatedText ?? '' , lang: target }
			};
		}else{
			const status = `${ res.status } ${ res.statusText }`;
			const text = await res.text();
			logger.debug('GCP translation error', status, text);

			// Status 403 = Key doesnt have required permissions to access API
			// Status 400 = Invalid request ...? Invalid API key etc
			// Mark as expired to avoid calling API again in this case
			if(res.status === 403 || res.status === 400) {
				this.expired = true;
				this.translating = false;
			}
			return {
				isError: true,
				message: `Translation API error: ${ status }`
			}
		}
	}
}
