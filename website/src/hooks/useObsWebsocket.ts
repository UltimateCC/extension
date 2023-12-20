import OBSWebSocket from "obs-websocket-js"
import { useEffect, useRef } from "react"


interface ObsWebsocketParams {
	enabled?: boolean
	url?: string
	password?: string
}

const obs = new OBSWebSocket();

export function useObsWebsocket({ url, password, enabled }: ObsWebsocketParams) {

	const connecting = useRef<boolean>(false);
	const shouldConnect = useRef<boolean>(false);

	useEffect(()=>{
		function connect() {
			connecting.current = true;
			obs.connect(url, password)
				.catch(e=>{
					console.error('Error connecting OBS websocket',e);
					if(shouldConnect.current) {
						connect();
					}
				})
				.finally(()=>{
					connecting.current = false;
					shouldConnect.current = false;
				});
		}

		if(url && password && enabled) {
			if(!connecting.current) {
				connect();
			}else{
				shouldConnect.current = true;
			}
		}

		return ()=>{
			shouldConnect.current = false;
			obs.disconnect()
				.catch(e=>console.error('Error disconnecting OBS websocket',e));
		}

	}, [url, password, enabled]);

	return {
		obs: obs
	};
}