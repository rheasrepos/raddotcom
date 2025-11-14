import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import adapter from '@sveltejs/adapter-auto';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto is the recommended adapter for most projects.
		// It will automatically detect the best adapter for your deployment target.
		// This replaces adapter-static.
		adapter: adapter()
	}
};

export default config;