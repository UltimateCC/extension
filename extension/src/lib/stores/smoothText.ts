import { writable } from "svelte/store";

/** Update text smoothly along a known duration,
 *  when all text is shown, run callback
 * 
 * @returns Readable store for current text state
 */
export function smoothText() {
	const store = writable('');

	let current = '';
	let interval = 0;
	let parts: string[] = [];
	let x: ReturnType<typeof setTimeout>;

	let active = false;
	let callback: (()=>void) | undefined;

	function tick() {
		// Add next part if available
		if(parts.length > 0) {
			current = `${current} ${parts.shift()}`;
			store.set(current);
		}

		if(parts.length > 0) {
			x = setTimeout(tick, interval);
		}else{
			end();
		}
	}
	
	function end() {
		if(active) {
			active = false;
			clearTimeout(x);
			if(callback) {
				callback();
				callback = undefined;
			}
		}
	}

	const { subscribe } = store;

	return {
		subscribe,
		clear: () => {
			end();
			current = '';
			store.set(current);
		},
		setText: (text: string, duration: number) => {
			end();
			active = true;
			const oldLength = current.length;
			
			if(text.length < oldLength || !duration) {
				store.set(text);
				current = text;
			}else{
				current = text.slice(0, oldLength);
				parts = text.slice(oldLength).split(' ');

				// Apply first part of text directly (prevent text splitted between words)
				current += parts.shift();
				store.set(current);

				interval = duration / parts.length;
				x = setTimeout(tick, interval);
			}

			return new Promise<void>((res) => {
				callback = res;
			});
		}
	}

}
