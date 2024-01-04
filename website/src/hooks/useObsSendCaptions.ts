import type OBSWebSocket from "obs-websocket-js";
import { useEffect, useRef } from "react";

/** Hook to send text as captions to OBS */
export function useObsSendCaptions({obs, text, enabled}: { obs: OBSWebSocket, enabled: boolean, text: string }) {
	const last = useRef<number>();
	const x = useRef<number>();

	useEffect(()=>{
		function sendCaptions() {
			if(obs.identified && enabled) {
				last.current = Date.now();
				obs.call('SendStreamCaption', {captionText: text}).catch(e=>console.warn('Error sending stream captions', e));
			}
		}

		// Send last text after 500ms without activity
		clearTimeout(x.current);
		x.current = setTimeout(()=>{
				sendCaptions();
		}, 500);

		// Prevent sending too much captions
		if(last.current && Date.now() < (last.current + 200) ) {
			return;
		}
		sendCaptions();
	}, [obs, enabled, text]);
}