// Based on https://github.com/joshnuss/svelte-persisted-store
// Writable store persisted to localstorage

import { writable, type Writable } from 'svelte/store';

type StoreDict = { [key: string]: Writable<any> }

function getStorage() {
	try{
		// Access to local storage only on browser
		const browser = typeof(window) !== 'undefined' && typeof(document) !== 'undefined';
		const storage = browser ? localStorage : null;

		// Ensure storage access is allowed
		storage?.setItem('test', 'test');
		storage?.getItem('test');
		storage?.removeItem('test');
		return storage;
	}catch(e) {
		console.error('Error accessing local storage', e);
		return null;
	}
}
const storage = getStorage();

/*
Listening for storage events would allow to handle settings update accross different tabs
But needs to be fixed to avoid infinite loops

if (storage) {
	// Listen for storage events to handle updates in other tabs
	window.addEventListener("storage", (event: StorageEvent) => {
		if ( event.key !== null ) {
			stores[event.key]?.set(event.newValue ? JSON.parse(event.newValue) : null);
		}
	});
}*/

const stores: StoreDict = {};

export function persisted<T>(storageKey: string, initialValue: T): Writable<T> {
	let store = stores[storageKey];

	if (!store) {
		const baseStore = writable(initialValue, (set) => {
			const json = storage?.getItem(storageKey);
			if(json) set(JSON.parse(json));
		});

		function updateStorage(key: string, value: T) {
			storage?.setItem(key, JSON.stringify(value));
		}

		const { subscribe } = baseStore;

		store = {
			set(value: T) {
				updateStorage(storageKey, value);
				baseStore.set(value);
			},
			update(callback: (value: T) => T) {
				return baseStore.update((last) => {
					const value = callback(last);
					updateStorage(storageKey, value);
					return value;
				})
			},
			subscribe
		}

		stores[storageKey] = store;
	}
	return store;
}
