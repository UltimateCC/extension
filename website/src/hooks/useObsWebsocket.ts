import OBSWebSocket from "obs-websocket-js"
import { useCallback, useEffect, useRef, useState } from "react"


interface ObsWebsocketParams {
	enabled?: boolean
	url?: string
	password?: string
}

const obs = new OBSWebSocket();

export function useObsWebsocket({ url, password, enabled }: ObsWebsocketParams) {
    const [isConnected, setIsConnected] = useState<boolean>(false);

	const urlRef = useRef<string>();
	const passwordRef = useRef<string>();
	const enabledRef = useRef<boolean>();
	urlRef.current = url;
	passwordRef.current = password;
	enabledRef.current = enabled;

	const connecting = useRef<boolean>(false);
	const shouldConnect = useRef<boolean>(false);

	const connect = useCallback(()=>{
		connecting.current = true;
		obs.connect(urlRef.current, passwordRef.current)
			.then(()=>{
				setIsConnected(true);
			})
			.catch(e=>{
				console.error('Error connecting OBS websocket',e);
				setIsConnected(false);
				if(shouldConnect.current) {
					connect();
				}
			})
			.finally(()=>{
				connecting.current = false;
				shouldConnect.current = false;
			});
	}, []);

	const disconnect = useCallback(()=>{
		shouldConnect.current = false;
		obs.disconnect()
			.then(()=>{
				setIsConnected(false);
			})
			.catch(e=>console.error('Error disconnecting OBS websocket',e));
	}, []);

	const refresh = useCallback(()=>{
		if(urlRef.current && passwordRef.current && enabledRef.current) {
			if(!connecting.current) {
				connect();
			}else{
				shouldConnect.current = true;
			}
		}else{
			disconnect();
		}
	}, [connect, disconnect]);

	useEffect(()=>{
		refresh();
		return disconnect

	}, [connect, disconnect, refresh, url, enabled, password]);

	return {
		obs,
		isConnected,
		refresh
	};
}