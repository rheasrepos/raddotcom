// The admin editor only works on Rhea's own machine (it writes files and runs
// git), and its passcode lives in client code — so in production it doesn't
// exist. `npm run dev` still serves it locally at /admin.
import { error } from '@sveltejs/kit';
import { dev } from '$app/environment';

export function load() {
	if (!dev) throw error(404, 'Not found');
	return {};
}
