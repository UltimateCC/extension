// Based on https://github.com/joshnuss/svelte-persisted-store
// Writable store persisted to localstorage
// localstorage key can be loaded at runtime using a store

import {get, writable, type Readable, type Writable} from 'svelte/store';


type StoreDict = { [key: string]: Writable<any> }

const browser = typeof(window) !== 'undefined' && typeof(document) !== 'undefined';
const storage = browser ? localStorage : null;

if (browser) {
	// Listen for storage events to handle updates in other tabs
	window.addEventListener("storage", (event: StorageEvent) => {
		if ( event.key !== null ) {
			stores[event.key]?.set(event.newValue ? JSON.parse(event.newValue) : null);
		}
	});
}

const stores: StoreDict = {};

export function persisted<T>(storageKey: string | Readable<string>, initialValue: T): Writable<T> {
	let key = '';
	// Get localstorage key if it already exists
	if(typeof storageKey === 'string') {
		key = storageKey;
	}else{
		const val = get(storageKey);
		if(typeof val === 'string') {
			key = val;
		}
	}
	let store = stores[key];

	if (!store) {
		const baseStore = writable(key ? initialValue : undefined, (set) => {
			if(key) {
				const json = storage?.getItem(key);
				if(json) set(JSON.parse(json));
			}
		});

		function updateStorage(key: string, value: T) {
			if(key) {
				storage?.setItem(key, JSON.stringify(value));
			}
		}

		const { subscribe } = baseStore;

		store = {
			set(value: T) {
				updateStorage(key, value);
				baseStore.set(value);
			},
			update(callback: (value: T) => T) {
				return baseStore.update((last) => {
					const value = callback(last);
					updateStorage(key, value);
					return value;
				})
			},
			subscribe
		}

		if(key) {
			stores[key] = store
		}else if(typeof storageKey !== 'string'){
			// Key is not known yet
			// Subscribe to storageKey store and set everything when value is received
			const unsubscribe = storageKey.subscribe((k)=>{
				if(k) {
					unsubscribe();
					key = k;
					const value = get(store);
					if(value !== undefined) {
						// Store has been updated: updated storage accordingly
						updateStorage(key, value);
					}else{
						// Store not updated: Load localstorage value
						const json = storage?.getItem(key);
						if(json) {
							baseStore.set(JSON.parse(json));
						} 
					}
					if(stores[key]) {
						console.warn('A store already exists with key: '+key);
					}
					stores[key] = store;
				}
			});
		}
	}
	return store;
}