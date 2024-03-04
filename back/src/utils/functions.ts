
export function applyBanwords(words: string[], initialText: string) {
	let text = initialText;
	// Apply ban words
	for(const word of words) {
		if(text.toLowerCase().includes(word)) {
			const censoredWord = word.substring(0, 1) + '*'.repeat(word.length - 1);
			const regex = new RegExp(`\\b${word}\\b`, 'gi');
			text = text.replace(regex, censoredWord);
		}
	}
	return text;
}

