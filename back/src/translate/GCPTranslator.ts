
import { Result, TranscriptAlt } from "../types";
import { Translator } from "./Translator";

// https://cloud.google.com/translate/docs/reference/rest/v2/translate

export class GCPTranslator extends Translator {

	ready() {
		return !!this.secrets.gcpKey;
	}

	async getLangs() {
		if(this.ready()) {
			const params = new URLSearchParams({ key: this.secrets.gcpKey! });
			const res =  await fetch('https://translation.googleapis.com/language/translate/v2/languages?'+params);

			if(res.ok) {
				const json = await res.json();
				return json.data.languages.map((lang:{ language: string, name: string} )=>{
					return { code: lang.language, name: lang.name };
				});
			}
		}
		return [];
	}

	protected async translateOne(transcript: TranscriptAlt, target: string): Promise<Result<TranscriptAlt>> {

		const params = new URLSearchParams({
			q: transcript.text,
			source: transcript.lang,
			format: 'text',
			target: target,
			key: this.secrets.gcpKey!
		});

		const res = await fetch('https://translation.googleapis.com/language/translate/v2?'+params, {
			method: 'POST'
		});

		const json = await res.json();
		return {
			isError: false,
			data: { text: json?.data?.translations[0]?.translatedText ?? '' , lang: target }
		};
	}
	
}