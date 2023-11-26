import { readable, writable } from "svelte/store";
import { handleCaptions, type CaptionsData } from "./captions";


Twitch.ext.onError(err=>{
	console.error('Ultimate CC : Extension helper error', err);
});

Twitch.ext.onAuthorized(auth=>{
	twitchChannel.set(auth.channelId);
});
export const twitchChannel = writable<string>(undefined);

export const twitchContext = readable<Partial<Twitch.ext.Context>>({}, (set)=>{
	Twitch.ext.onContext(context=>{
		set(context);
	});
});

// Type for configuration stored in broadcaster config segment
type BroadcasterConfig = {
	showCaptions?: boolean
}

export const broadcasterConfig = readable<BroadcasterConfig>(undefined, (set)=>{
	Twitch.ext.configuration.onChanged(()=>{
		try{
			set(JSON.parse(Twitch.ext.configuration.broadcaster?.content || '{}' ));
		}catch(e) {
			console.error('Ultimate CC : Error parsing broadcaster configuration');
		}
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
