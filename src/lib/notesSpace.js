// Which notes space a visitor is looking at: 'tfidf' (word overlap) or 'embed'
// (a sentence-transformers model). Shared by the Blog map and the "Nearby"
// list on post pages, and remembered in this browser. null = use the default
// that scripts/embed-vault.py wrote into static/vault-space.json.
import { writable } from 'svelte/store';

const KEY = 'notes-space';

function initial() {
	try {
		return (typeof localStorage !== 'undefined' && localStorage.getItem(KEY)) || null;
	} catch {
		return null;
	}
}

export const notesSpace = writable(initial());

notesSpace.subscribe((v) => {
	try {
		if (typeof localStorage !== 'undefined' && v) localStorage.setItem(KEY, v);
	} catch {
		/* storage blocked: the choice just won't persist */
	}
});

// The space to actually use, given the loaded vault-space.json.
export function activeSpace(data, choice) {
	if (!data) return null;
	if (data.spaces && choice && data.spaces[choice]) return choice;
	return data.default || 'tfidf';
}
