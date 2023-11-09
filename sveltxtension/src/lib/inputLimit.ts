


export function inputLimit(node: HTMLInputElement) {

	const clamp = (event: Event) => {

		if( node.min!==undefined ) {
			node.value = Math.max( parseInt(node.min), parseInt(node.value)).toString();
			event.preventDefault();
		}

		if( node.max!==undefined ) {
			node.value = Math.min( parseInt(node.max), parseInt(node.value)).toString();
			event.preventDefault();
		}
	};

	node.addEventListener('change', clamp, true);

	return {
		destroy() {
			node.removeEventListener('change', clamp, true);
		}
	};
}
