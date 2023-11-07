
export function hexToRGB(hex: string) {
	if (!hex) return "";
	hex = hex.replace('#', '');
	return parseInt(hex.substring(0, 2), 16) + ", " + parseInt(hex.substring(2, 4), 16) + ", " + parseInt(hex.substring(4, 6), 16);
}