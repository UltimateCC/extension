
import { useCallback, useState } from "react";
import api from "../services/api";

export function useSavedConfig<T>({ apiPath }: { apiPath: string }) {

	const [config, setConfig] = useState<Partial<T>>({});

	const loadConfig = useCallback(async ()=>{
		const res: Partial<T> = await api(apiPath);
		setConfig(res);
	}, [apiPath]);


	const updateConfig = useCallback(async (newConfig: Partial<T>)=>{
		const updated = {
			...config,
			...newConfig
		}
		setConfig(updated);

		await api(apiPath, { method: 'POST', body: updated });
	}, [apiPath, config]);

	return { config, loadConfig, updateConfig };
}