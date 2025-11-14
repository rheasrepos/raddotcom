// This tells SvelteKit that this page is dynamic and should not be
// pre-rendered as static HTML at build time.
export const prerender = false;

export function load({ params }) {
	return {
		id: params.id
	};
} 