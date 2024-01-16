import { User, UserConfig, UserSecrets } from "../entity/User";
import { logger } from "../logger";
import { CaptionsData, LangList, Result, TranscriptAlt, TranscriptData } from "../types";


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

	private cache = new Map<string, TranscriptAlt[]>;

	protected translatedChars = 0;
	protected errorCount = 0;

	constructor(protected user: User) {}

	getTranslatedChars() {
		return this.translatedChars;
	}

	getErrorCount() {
		return this.errorCount;
	}

	isWorking() {
		return !!this.translatedChars;
	}

	async init() {}

	abstract ready(): boolean;

	/** Get list of supported languages */
	async getLangs(): Promise<LangList> {
		return [];
	}

	async translate(data: TranscriptData): Promise<Result<CaptionsData>> {
		if(!this.ready()) {
			return {
				isError: true,
				message: 'Translation service is not properly configured'
			}
		}

		// Invalid credentials, do not try translation anymore
		if(this.expired) {
			return {
				isError: false,
				data: {
					delay: data.delay,
					duration: data.duration,
					final: data.final,
					captions: [
						{lang: data.lang, text: data.text}
					]
				}
			}
		}

		const start = Date.now();
		const lang = data.lang.split('-')[0];
		let errors: string[] | undefined = [];

		const result: CaptionsData = {
			delay: data.delay + ( Date.now() - start ),
			duration: data.duration,
			captions: [],
			final: data.final
		}

		// If translations already in cache, get it
		const cached = this.cache.get(data.text+data.lang);
		if(cached) {
			result.captions = cached;
		}else {
			const translated = await this.translateAll(
				{ text: data.text, lang },
				// Exclude source language
				this.user.config.translateLangs.filter(t=>t!==lang)
			);
			if(translated.isError) {
				return translated;
			}
			result.captions = translated.data;
			errors = translated.errors;

			this.cache.set(data.text+data.lang, translated.data);
			// Cache translation results a small time
			setTimeout(()=>{
				this.cache.delete(data.text+data.lang);
			}, getCacheDelay(data.text));
		}
		return {
			isError: false,
			data: result,
			errors
		}
	}

	/** Override this function to translate to all languages at once, source language is already excluded for target languages */
	protected async translateAll(transcript: TranscriptAlt, langs: string[]): Promise<Result<TranscriptAlt[]>> {
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
					this.translatedChars += transcript.text.length;
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
	};

	/** This function will be called for each of the languages to translate, unless translateAll method is overriden */
	protected translateOne(transcript: TranscriptAlt, target: string): Promise<Result<TranscriptAlt>> {
		throw new Error('Not implemented');
	};

}