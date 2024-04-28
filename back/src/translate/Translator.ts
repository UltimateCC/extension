import { User } from "../entity/User";
import { logger } from "../config/logger";
import { Result, TranscriptAlt } from "../types";
import { metrics } from "../utils/metrics";


/** Get delay to keep text cached */
function getCacheDelay(text: string) {
	// Longer cache time for really short text (repeated more commonly)
	if(text.length < 10) {
		return 1000 * 60 * 30;
	}else{
		return 1000 * 30;
	}
}

export abstract class Translator {

	protected expired = false;
	protected translating = false;

	private cache = new Map<string, TranscriptAlt[]>;

	protected errorCount = 0;

	constructor(protected user: User) {}

	incrementTranslatedChars(count: number) {
		metrics.translatedCharTotal.inc(count);
	}

	getErrorCount() {
		return this.errorCount;
	}

	isWorking() {
		return this.translating && !this.expired;
	}

	async init(): Promise<{isError: boolean, message?: string}> {
		return {
			isError: false
		}
	}

	abstract ready(): boolean;

	async translate(data: TranscriptAlt): Promise<Result<{ translations: TranscriptAlt[], translatedChars: number }>> {
		const lang = data.lang.split('-')[0];

		if(!this.ready() || this.expired) {
			// Invalid credentials, do not try translation anymore
			return {
				isError: false,
				translations: [
					{ lang: data.lang, text: data.text }
				],
				translatedChars: 0
			}
		}

		// If translations already in cache, get it
		const cacheKey = `${data.lang}${data.text}`;
		const cached = this.cache.get(cacheKey);
		if(cached) {
			return {
				isError: false,
				translations: cached,
				translatedChars: 0
			}
		}else {
			const translated = await this.translateAll(
				{ text: data.text, lang },
				// Exclude source language
				this.user.config.translateLangs.filter(t=>t!==lang)
			);
			if(translated.isError) {
				return translated;
			}

			this.cache.set(cacheKey, translated.data);
			// Cache translation results a small time
			setTimeout(()=>{
				this.cache.delete(cacheKey);
			}, getCacheDelay(data.text));

			return {
				isError: false,
				translations: translated.data,
				translatedChars: data.text.length
			};
		}
	}

	/** Override this function to translate to all languages at once, source language is already excluded for target languages */
	protected async translateAll(transcript: TranscriptAlt, langs: string[]): Promise<Result<{ data: TranscriptAlt[]}>> {
		const out = [transcript];
		const errors = [];
		//Translate in all required languages
		try {
			const translated = await Promise.all(langs.map(lang=>{ return this.translateOne(transcript, lang) }));
			for(const result of translated) {
				if(result.isError) {
					errors.push(result.message);
					this.errorCount++;
				}else{
					out.push(result.data);
					this.incrementTranslatedChars(transcript.text.length);
				}
			}
		}catch(e){
			logger.error('Translation error', e);
			this.errorCount++;
		}
		return {
			isError: false,
			errors,
			data: out
		}
	}

	/** This function will be called for each of the languages to translate, unless translateAll method is overriden */
	protected translateOne(transcript: TranscriptAlt, target: string): Promise<Result<{data: TranscriptAlt}>> {
		throw new Error('Not implemented');
	}

}
