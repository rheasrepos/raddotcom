// Load posts with the page (server + client navigation) so the blog renders
// WITH its content instead of getting stuck on a blank/loading state that
// needed a manual refresh.
export async function load({ fetch }) {
	try {
		const res = await fetch('/api/posts');
		const posts = res.ok ? await res.json() : [];
		return { posts };
	} catch (e) {
		return { posts: [] };
	}
}
