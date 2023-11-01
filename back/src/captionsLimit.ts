

const limits = new Map<string, NodeJS.Timeout>();

// Limit final captions to one each 2 seconds
const finalDelay = 2000;

// Limit partial captions to one each 5 seconds
const partialDelay = 5000;

/** Return true if captions should be ignored */
export function rateLimit(id: string, final: boolean) {

	if(final) {
		// Final captions ratelimit
		if(limits.has('f'+id)) {
			return true;
		}
		const x = setTimeout(() => limits.delete('f'+id), finalDelay);
		limits.set('f'+id, x);
		// Clear previous timeout for partial captions
		clearTimeout(limits.get('p'+id));

	// Partial captions ratelimit
	}else if(limits.has('p'+id)) {
		return true;
	}

	// Set time before allowing next partial captions
	const x = setTimeout(() => limits.delete('p'+id), partialDelay);
	limits.set('p'+id, x);

	return false;
}
