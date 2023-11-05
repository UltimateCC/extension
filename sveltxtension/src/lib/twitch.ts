import { readable } from "svelte/store";
import { handleCaptions, type CaptionsData } from "./captions";


export const twitchContext = readable<Partial<Twitch.ext.Context>>({}, (set)=>{
	Twitch.ext.onContext(context=>{
		set(context);
	});
});

export const broadcasterConfig = readable<string>('', (set)=>{
	Twitch.ext.configuration.onChanged(()=>{
		set(Twitch.ext.configuration.broadcaster?.content || '');
	});
});

let lastMessage = '';
Twitch.ext.listen('broadcast', (_: string, contentType: string, message: string)=>{
	// Ignore if exactly same message is received twice
	if(lastMessage === message) {
		return;
	}
	lastMessage = message;

	if (contentType !== 'application/json') {
		console.error('Ultimate CC : Pubsub content-type is not JSON');
		return;
	}

	const obj: CaptionsData = JSON.parse(message);
	if(Array.isArray(obj.captions)) {
		handleCaptions(obj);
	}
});
