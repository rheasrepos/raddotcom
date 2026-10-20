// Lets the top nav (and anything else) open the WPM popup from anywhere.
import { writable } from 'svelte/store';
export const wpmOpen = writable(false);
