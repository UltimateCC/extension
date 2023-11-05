import './assets/app.scss'
import Transcript from './components/Transcript.svelte'
import Config from './components/Config.svelte'
import Overlay from './components/Overlay.svelte'

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

let app = new component({
	target: document.getElementById('app'),
});

export default app
