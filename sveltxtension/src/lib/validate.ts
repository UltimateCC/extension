import { type Action } from 'svelte/action';

/** Action to bind to input elem with value as arg to validate input on each update */
export const validate: Action<HTMLInputElement, string> = function (node) {
	return {
		update() {
			// Default value if not a number
			if(isNaN(parseInt(node.value))) {
				node.value = '0';
			}

			// Enforce min
			if(node.min && node.value < node.min) {
				node.value = node.min;
			}

			// Enforce max
			if(node.max && node.value > node.max) {
				node.value = node.max;
			}
		}
	};
}


