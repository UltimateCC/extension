import { UserConfig, UserSecrets } from "../entity/User";
import { CaptionsData, LangList, Result, TranscriptAlt, TranscriptData } from "../types";

// Cache delay for keeping translation results
const CACHE_DELAY = 30 * 1000;

export abstract class Translator {
	private cache = new Map<string, TranscriptAlt[]>;
	protected translatedChars = 0;

	constructor(protected config: UserConfig, protected secrets: UserSecrets) {}

	getTranslatedChars() {
		return this.translatedChars;
	}

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
		const start = Date.now();
		const lang = data.lang.split('-')[0];

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
				this.config.translateLangs.filter(t=>t!==lang)
			);
			if(translated.isError) {
				return translated;
			}
			result.captions = translated.data;

			this.cache.set(data.text+data.lang, translated.data);
			setTimeout(()=>{
				this.cache.delete(data.text+data.lang);
			}, CACHE_DELAY);
		}
		return {
			isError: false,
			data: result
		}
	}

	/** Override this function to translate to all languages at once, source language is already excluded for target languages */
	protected async translateAll(transcript: TranscriptAlt, langs: string[]): Promise<Result<TranscriptAlt[]>> {
		const out = [transcript];
		//Translate in all required languages
		try {
			const translated = await Promise.all(langs.map(lang=>{ return this.translateOne(transcript, lang) }));
			for(const result of translated) {
				if(!result.isError) {
					out.push(result.data);
					this.translatedChars += transcript.text.length;
				}
			}
		}catch(e){
			console.error('Translation error', e);
		}
		return {
			isError: false,
			data: out
		}
	};

	/** This function will be called for each of the languages to translate, unless translateAll method is overriden */
	protected translateOne(transcript: TranscriptAlt, target: string): Promise<Result<TranscriptAlt>> {
		throw new Error('Not implemented');
	};

}