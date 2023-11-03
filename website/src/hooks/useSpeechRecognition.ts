import { useEffect, useState } from "react";
import { TranscriptData } from "../context/SocketContext";


/** Speech recognition using Web Speech API */
export function useSpeechRecognition(
	handleText: (transcript: TranscriptData) => void,
	lang: string,
	listening: boolean
) {
	const [error, setError] = useState<string>();
	const [text, setText] = useState<string>('');

	useEffect(()=>{

		let stopFunc = ()=>{};
		let stopped = false;
		if(listening) {
			const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
			if(!SpeechRecognition) {
				setError('Speech recognition not supported in this browser, try using Chrome or Edge');
				return;
			}
			setError(undefined);

			const recognition = new SpeechRecognition();
			recognition.lang = lang;
			recognition.continuous = true;
			recognition.interimResults = true;
			recognition.maxAlternatives = 1;

			// Log relevant errors
			recognition.onerror = (event) => {
				if(event.error !== 'aborted' && event.error !== 'no-speech') {
					setError('Speech recognition error : '+event.error);
					console.error('Speech recognition error', event.error);
				}
			}

			//Restart recognition when it ends itself
			recognition.onend = () => { if(!stopped) recognition.start(); }

			let lastCaptions: number | null = null;

			recognition.onresult = (event) => {
				const result = event.results[event.resultIndex];
				const text = result[0].transcript.trim();

				setText(text);

				// Wait 2s between each partial caption
				if(!result.isFinal && lastCaptions && ( (lastCaptions + 2000) > Date.now() ) ) {
					return;
				}

				// Ignore first partial captions
				if(text && (result.isFinal || lastCaptions) ) {

					// Duration/delay is time since last partial sent
					const duration = Date.now() - (lastCaptions ?? 0);
					handleText({text, lang, duration, delay: duration, final: result.isFinal });
				}

				if(result.isFinal) {
					// Reset timestamps when sentence ends
					lastCaptions = null;
				}else{
					// Setup timestamp for next partial time
					lastCaptions = Date.now();
				}
				
			}

			recognition.start();

			stopFunc = () =>{
				recognition.abort();
			}
		}else{
			setText('');
		}

		return ()=>{
			stopped = true;
			stopFunc();
		}

	}, [ listening, lang, handleText ]);

	return { error, text };
}