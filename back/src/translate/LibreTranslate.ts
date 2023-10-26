
import { Result, TranscriptAlt } from "../types";
import { Translator } from "./Translator";


export class LibreTranslate extends Translator {

	ready() {
		return !!(this.secrets.libreUrl && this.secrets.libreUrl.startsWith('http'));
	}

	async getLangs() {
		try {
			if(this.ready()) {
				const res = await fetch(this.secrets.libreUrl+'/languages');

				if(res.ok) {
					const json = await res.json();
					
					return json.map((lang:{ code: string, name: string} )=>{
						return { code: lang.code, name: lang.name };
					});			
				}				
			}
		}catch(e) {
			console.error('Libretranslate error fetching language list');
		}
		return [];
	}

	protected async translateOne(transcript: TranscriptAlt, target: string): Promise<Result<TranscriptAlt>> {
		const req = await fetch(this.secrets.libreUrl + '/translate', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded',
			},
			body: new URLSearchParams({
				q: transcript.text,
				source: transcript.lang.substring(0,2),
				target: target,
				api_key: this.secrets.libreKey!
			})
		});
		const res = await req.json();
		return {
			isError: false,
			data: {
				lang: target,
				text: res.translatedText,
			}
		};
	}

}