import languages from "../assets/languages.json";
import rtl_languages from "../assets/rtl_languages.json";

export function hexToRGB(hex: string) {
	if (!hex) return "";
	hex = hex.replace('#', '');
	return parseInt(hex.substring(0, 2), 16) + ", " + parseInt(hex.substring(2, 4), 16) + ", " + parseInt(hex.substring(4, 6), 16);
}

export function isRTL(lang: LangCode) {
	return rtl_languages.includes(lang);
}

export type LangCode = keyof typeof languages;