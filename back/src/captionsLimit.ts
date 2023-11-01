

const partialLimits = new Map<string, NodeJS.Timeout>();
const finalLimits = new Map<string, NodeJS.Timeout>();

// Minimum delay between each final captions
const finalDelay = 2000;

// Minimum delay between each partial captions
const partialDelay = 3000;

/** Return true if captions should be ignored */
export function captionsLimit(id: string, final: boolean) {

	if(final) {
		// Final captions ratelimit
		if(finalLimits.has(id)) {
			return true;
		}
		const x = setTimeout(() => finalLimits.delete(id), finalDelay);
		finalLimits.set(id, x);
		// Clear previous timeout for partial captions
		clearTimeout(partialLimits.get(id));

	// Partial captions ratelimit
	}else{
		if(partialLimits.has(id)) {
			return true;
		}
	}
	// Set time before allowing next partial captions
	const x = setTimeout(() => partialLimits.delete(id), partialDelay);
	partialLimits.set(id, x);

	return false;
}
