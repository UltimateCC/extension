import { UserConfig, UserSecrets } from "../entity/User";
import { CaptionsData, LangList, Result, TranscriptAlt } from "../types";

export abstract class Translator {

	protected langs: string[]
	constructor(protected config: UserConfig, protected secrets: UserSecrets) {
		this.langs = config.translation.langs.map(l=>l.substring(0,2));
	}

	abstract ready(): boolean;

	/** Get list of supported languages */
	async getLangs(): Promise<LangList> {
		return [];
	}

	async translate(data: CaptionsData): Promise<Result<CaptionsData>> {
		if(!this.ready()) {
			return {
				isError: true,
				message: 'Configure the translation service before using it'
			}
		}
		const start = Date.now();
		// Exclude source language
		const lang = data.captions[0].lang.substring(0,2);
		const result = await this.translateAll(
			{ text: data.captions[0].text, lang },
			this.langs.filter(t=>t!==lang)
		);
		if(result.isError) {
			return result;
		}else{
			return {
				isError: false,
				data: {
					delay: data.delay + ( Date.now() - start ),
					duration: data.duration,
					captions: result.data
				}
			}
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