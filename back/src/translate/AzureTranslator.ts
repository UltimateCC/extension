import { logger } from "../utils/logger";
import { LangList, Result, TranscriptAlt } from "../types";
import { Translator } from "./Translator";


export class AzureTranslator extends Translator {
	private static langList: LangList = [];

	ready() {
		//return !!(this.secrets.azureKey && this.secrets.azureRegion);
		return false;
	}

	async getLangs() {
		if(!this.ready()) {
			return [];
		}

		if(!AzureTranslator.langList.length) {
			//Fetch language list only the first time, it shouldn't change
			const res = await fetch('https://api.cognitive.microsofttranslator.com/languages?api-version=3.0');

			if(res.ok) {
				const json = await res.json();

				for(const [k, v] of Object.entries(json.translation)) {
					AzureTranslator.langList.push({code: k, name: (v as {name: string}).name });
				}
			}
		}
		return AzureTranslator.langList;
	}

	async translateAll(transcript: TranscriptAlt, langs: string[]): Promise<Result<TranscriptAlt[]>> {
		const out = [transcript];

		try {
			const params = new URLSearchParams({
				'api-version': '3.0'
			});

			for(const lang of langs) {
				params.append('to', lang);
			}

			const res = await fetch(`https://api.cognitive.microsofttranslator.com/translate?${params}`, {
				method: 'POST',
				headers: {
					//'Ocp-Apim-Subscription-Key': this.secrets.azureKey!,
					//'Ocp-Apim-Subscription-Region': this.secrets.azureRegion!,
					'Content-type': 'application/json'
				},
				body: JSON.stringify([{ text: transcript.text }])
			});
			const data = await res.json();
			if( data && data[0] && data[0].translations && data[0].translations.length ) {
				for(const l of data[0].translations) {
					out.push({ text: l.text, lang: l.to });
				}
			}
			this.incrementTranslatedChars(transcript.text.length * langs.length);
		}catch(e) {
			logger.error('Azure translation error', e);
		}
		return {
			isError: false,
			data: out
		};
	}

}
