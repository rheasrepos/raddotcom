// What lives where — pure helpers over the posts list + categoryConfig.
// Used by the desktop (+page.svelte) and its windows.
import { categoryConfig } from '$lib/categories.js';

// A post belongs to a category if it's its primary `type` OR it's listed
// in the post's extra `categories` (from `also_in:`). This is what lets a
// file live in multiple folders at once.
export function inCat(p, catId) {
	return p.type === catId || (Array.isArray(p.categories) && p.categories.includes(catId));
}

// Does a category (or any category nested under it) contain posts?
export function hasPostsDeep(projects, catId) {
	if ((projects || []).some((p) => inCat(p, catId))) return true;
	return Object.values(categoryConfig)
		.filter((c) => c.parent === catId)
		.some((c) => hasPostsDeep(projects, c.id));
}

// Cross-listed posts (in a folder via also_in:, not their primary type)
// group under a single virtual "Course Final Projects" subfolder instead of
// dragging their ORIGIN subfolder in as a confusing one-off folder.
export const XSUB = '__crosslisted__';
// Anything with `era: before-college` sits in a virtual "Before College"
// subfolder of whichever folder it's in (Art, Personal Writing, …), keeping
// its own subfolder underneath (e.g. Before College / College Application
// Essays). Encoded as BC or "BC/<subfolder>".
export const BC = '__before_college__';
export const isBC = (p) => p.era === 'before-college';

export function prettyFolder(s) {
	if (s === XSUB) return 'Course Final Projects';
	if (s === BC) return 'Before College';
	if (String(s).startsWith(BC + '/')) return prettyFolder(String(s).slice(BC.length + 1));
	return String(s).replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// Contents of a folder window's CURRENT level (top of its stack).
// A level shows: its direct child-category folders (that contain posts),
// its own subfolders, and its own posts — never grandchildren directly.
export function folderContents(win, projects) {
	const cur = win.stack[win.stack.length - 1];
	const childCats = Object.values(categoryConfig)
		.filter((c) => c.parent === cur.category && hasPostsDeep(projects, c.id));
	const all = (projects || []).filter((p) => inCat(p, cur.category));
	const effSub = (p) => (p.type === cur.category ? p.subfolder : XSUB);
	// Inside "Before College": its posts, grouped by their own subfolder
	if (cur.subfolder === BC) {
		const own = all.filter(isBC);
		const subs = [...new Set(own.filter((p) => p.subfolder).map((p) => BC + '/' + p.subfolder))].sort();
		return { childCats: [], subs, posts: own.filter((p) => !p.subfolder) };
	}
	if (cur.subfolder && cur.subfolder.startsWith(BC + '/')) {
		const inner = cur.subfolder.slice(BC.length + 1);
		return { childCats: [], subs: [], posts: all.filter((p) => isBC(p) && p.subfolder === inner) };
	}
	const own = all.filter((p) => !isBC(p));
	if (cur.subfolder) {
		return { childCats: [], subs: [], posts: own.filter((p) => effSub(p) === cur.subfolder) };
	}
	const subs = [...new Set(own.filter((p) => effSub(p)).map((p) => effSub(p)))].sort();
	if (all.some(isBC)) subs.push(BC); // last, like a drawer at the bottom
	return { childCats, subs, posts: own.filter((p) => !effSub(p)) };
}

export function ytId(url) {
	const m = String(url || '').match(/(?:v=|youtu\.be\/|embed\/)([\w-]{6,})/);
	return m ? m[1] : null;
}

// A plain-text excerpt of a post's body for tile previews.
export function excerpt(md, max = 320) {
	const t = String(md || '').replace(/<\/?ai>/g, '')
		.replace(/\n#+\s*(Topics|Related)\s*\n(?:\s*[-*]\s*\[\[.*?\]\].*\n?)+/gi, '')
		.replace(/\[\[.*?\]\]/g, '')
		.replace(/<[^>]*>/g, ' ')
		.replace(/[#>*_`]/g, '')
		.replace(/\s+/g, ' ')
		.trim();
	return t.length > max ? t.slice(0, max) + '…' : t || '(no text yet)';
}

// Preview a post's body, minus the Obsidian graph plumbing, as plain text.
export function renderMarkdownSafe(md) {
	const t = String(md || '').replace(/<\/?ai>/g, '')
		.replace(/\n#+\s*(Topics|Related)\s*\n(?:\s*[-*]\s*\[\[.*?\]\].*\n?)+/gi, '')
		.replace(/\[\[.*?\]\]/g, '')
		.replace(/[#>*_`]/g, '')
		.trim();
	const esc = t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
	return esc.split(/\n{2,}/).slice(0, 6).map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
}

// Does a post match a free-text search (title, description, or body)?
export function matchesQuery(project, query) {
	const q = String(query || '').toLowerCase();
	if (!q) return true;
	const titleMatch = project.title.toLowerCase().includes(q);
	const descriptionMatch = project.description?.toLowerCase().includes(q) ?? false;
	const contentText = project.content ? String(project.content).replace(/<[^>]*>/g, ' ') : '';
	return titleMatch || descriptionMatch || contentText.toLowerCase().includes(q);
}
