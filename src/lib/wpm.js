// WPM — the one-minute typing test + shared sticky-note wall (= leaderboard).
// Shared between the popup (components/OneMinute.svelte) and the full page
// (routes/wpm). The WALL IS SHARED across visitors, so it needs a tiny backend:
// a free Supabase table. The two keys come from environment variables:
//
//   PUBLIC_SUPABASE_URL       e.g. https://abcd.supabase.co
//   PUBLIC_SUPABASE_ANON_KEY  the publishable key (sb_publishable_…) or legacy anon key — safe in browsers
//
// Locally: put them in a .env file (see .env.example). On Vercel: Project →
// Settings → Environment Variables, then redeploy. Without them the wall
// falls back to localStorage (only notes written in THIS browser).
// Setup steps + SQL: HOW TO UPDATE THIS SITE.md §5d.
import { writable } from 'svelte/store';
import { env } from '$env/dynamic/public';

export const wpmOpen = writable(false); // legacy: lets anything pop the widget open

const URL = env.PUBLIC_SUPABASE_URL || '';
const KEY = env.PUBLIC_SUPABASE_ANON_KEY || '';
export const configured = Boolean(URL && KEY);
const LOCAL = 'omLocalWall';
// Only the apikey header: works for both the new publishable keys (sb_publishable_…)
// and legacy anon JWTs; a publishable key sent as a Bearer token is rejected.
const headers = { apikey: KEY };

export async function loadWall(limit = 200) {
	if (configured) {
		const res = await fetch(`${URL}/rest/v1/notes?select=*&order=created_at.desc&limit=${limit}`, { headers });
		if (!res.ok) throw new Error('wall unavailable');
		return await res.json();
	}
	try { return JSON.parse(localStorage.getItem(LOCAL) || '[]'); } catch { return []; }
}

export async function pinNote(note) {
	if (configured) {
		const res = await fetch(`${URL}/rest/v1/notes`, {
			method: 'POST',
			headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
			body: JSON.stringify(note)
		});
		if (!res.ok) throw new Error('could not pin');
		return;
	}
	const local = JSON.parse(localStorage.getItem(LOCAL) || '[]');
	local.unshift({ ...note, created_at: new Date().toISOString() });
	localStorage.setItem(LOCAL, JSON.stringify(local.slice(0, 200)));
}

// words per minute for `text` typed over `ms` milliseconds (floor 1s)
export function wpmOf(text, ms) {
	const mins = Math.max(ms / 60000, 1 / 60);
	const words = text.trim() ? text.trim().split(/\s+/).length : 0;
	return Math.round(words / mins);
}
