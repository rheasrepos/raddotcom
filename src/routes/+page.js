// Load posts as part of the page load (server render AND client navigation),
// so the desktop always renders WITH its content instead of flashing blank
// while an onMount fetch races — which was leaving a blank desktop until a
// manual reload.
export async function load({ fetch }) {
	try {
		const res = await fetch('/api/posts');
		const posts = res.ok ? await res.json() : [];
		return { posts };
	} catch (e) {
		return { posts: [] };
	}
}
