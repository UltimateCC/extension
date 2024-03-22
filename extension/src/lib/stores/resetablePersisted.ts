import { persisted } from "./persistedStore";

/** Utility to get a resetable store persisted to local storage */ 
export function resetablePersisted<T>(storageKey: string, getDefault: () => T) {
	const { set, subscribe, update } = persisted(storageKey, getDefault());

	function reset() {
		set(getDefault());
	}

	return { set, subscribe, update, reset }
}

export type Resetable<T> = ReturnType<typeof resetablePersisted<T>>;
