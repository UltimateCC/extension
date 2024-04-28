import { logger } from "../config/logger";
import { Result, TranscriptAlt } from "../types";
import { Translator } from "./Translator";


export class AzureTranslator extends Translator {

	ready() {
		return true;
	}

	async translateAll(transcript: TranscriptAlt, langs: string[]): Promise<Result<{data: TranscriptAlt[]}>> {
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
