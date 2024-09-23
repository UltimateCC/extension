import 'simplebar'
import 'simplebar/dist/simplebar.css'
import './assets/app.scss'
import Config from './components/Config.svelte'
import Overlay from './components/Overlay.svelte'
import Transcript from './components/Transcript.svelte'
import { initContext } from './lib/settings'
import { twitchChannel } from './lib/twitch'

// Channel id is needed to start extension
let starting = true;
twitchChannel.subscribe((channelId)=>{
	if(starting && channelId) {
		starting = false;
		init(channelId);
	}
});

function init(channelId: string) {
	// Load correct component
	// https://dev.twitch.tv/docs/extensions/reference/#client-query-parameters

	const params = new URLSearchParams(location.search);

	// Default: Show only transcript
	let component: any = Transcript;

	// Config page
	if( ['config', 'dashboard'].includes(params.get('mode') ?? '') ) {
		component = Config;

	// Overlay
	}else if( (params.get('platform') === 'web' && params.get('anchor') === 'video_overlay' ) ) {
		component = Overlay;
	}

	const context = initContext(channelId);

	app = new component({
		target: document.getElementById('app'),
		context
	});

}

let app;
export default app;