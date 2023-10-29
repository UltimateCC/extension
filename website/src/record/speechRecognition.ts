

/** Speech recognition using Web Speech API */
export async function startSpeechRecognition(handleText: (transcript: { text: string, lang: string, duration: number }) => void, lang: string) {
	let stopped = false;

	const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
	if(!SpeechRecognition) {
		throw new Error('Speech recognition not supported in this browser');
	}

	const recognition = new SpeechRecognition();
	recognition.lang = lang;
	recognition.continuous = true;
	recognition.interimResults = true;
	recognition.maxAlternatives = 1;

	// Log relevant errors
	recognition.onerror = (event) => {
		if(event.error !== 'aborted' && event.error !== 'no-speech') {
			console.error('Speech recognition error', event.error);
		}
	}

	//Restart recognition when it ends itself
	recognition.onend = () => { if(!stopped) recognition.start(); }

	let lastIndex = -1;
	let start = Date.now();

	recognition.onresult = (event) => {
		// Get start time when new sentence
		if(lastIndex !== event.resultIndex) {
			lastIndex = event.resultIndex;
			start = Date.now();
		}
		const result = event.results[event.resultIndex];
		const text = result[0].transcript.trim();
		if(text) {
			if(result.isFinal) {
				// recognizing ''
				handleText({text, lang, duration: Date.now() - start});
				start = Date.now();
			}else{
				// recognizing text
			}
		}
	}

	recognition.start();

	return ()=>{
		stopped = true;
		recognition.abort();
		// recognizing ''
	}
}