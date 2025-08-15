import { writable } from 'svelte/store';

// Store to manage page transition states
export const pageTransition = writable({
	isLoading: false,
	fromPage: null,
	toPage: null
});

// Actions for managing transitions
export const transitionActions = {
	// Start a page transition
	startTransition: (fromPage, toPage) => {
		pageTransition.set({
			isLoading: true,
			fromPage,
			toPage
		});
	},

	// Complete a page transition
	completeTransition: () => {
		pageTransition.set({
			isLoading: false,
			fromPage: null,
			toPage: null
		});
	},

	// Check if we're transitioning from homepage to another page
	isHomepageTransition: (fromPage, toPage) => {
		return fromPage === '/' && toPage !== '/';
	},

	// Check if we're transitioning to homepage from another page
	isToHomepageTransition: (fromPage, toPage) => {
		return fromPage !== '/' && toPage === '/';
	}
}; 