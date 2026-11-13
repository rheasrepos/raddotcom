// The complexity survey (rhea.com/complexity) — Rhea's never-run "what is
// complexity to you" questionnaire from the Data Cognition Lab days, now open
// to anyone. Answers are ANONYMOUS (no name, no id beyond a random row uuid)
// and shared live, so the page can chart everyone's averages.
// Same Supabase project + keys as WPM (src/lib/wpm.js); table SQL is in
// HOW TO UPDATE THIS SITE.md §5g. Without keys it falls back to this browser only.
import { env } from '$env/dynamic/public';

const URL = env.PUBLIC_SUPABASE_URL || '';
const KEY = env.PUBLIC_SUPABASE_ANON_KEY || '';
export const configured = Boolean(URL && KEY);
const headers = { apikey: KEY };
const LOCAL = 'complexityLocal';

// the four scales: [column, left end, right end] — Rhea's wording
export const SCALES = [
	['difficult_easy', 'difficult', 'easy'],
	['difficult_beautiful', 'difficult', 'beautiful'],
	['good_bad', 'good', 'bad'],
	['needed_wanted', 'needed', 'wanted']
];

export async function loadAnswers() {
	if (configured) {
		const res = await fetch(`${URL}/rest/v1/complexity?select=*&order=created_at.desc&limit=1000`, { headers });
		if (!res.ok) throw new Error('answers unavailable');
		return await res.json();
	}
	try { return JSON.parse(localStorage.getItem(LOCAL) || '[]'); } catch { return []; }
}

export async function submitAnswer(row) {
	if (configured) {
		const res = await fetch(`${URL}/rest/v1/complexity`, {
			method: 'POST',
			headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
			body: JSON.stringify(row)
		});
		if (!res.ok) throw new Error('could not save');
		return;
	}
	const local = JSON.parse(localStorage.getItem(LOCAL) || '[]');
	local.unshift({ ...row, created_at: new Date().toISOString() });
	localStorage.setItem(LOCAL, JSON.stringify(local.slice(0, 1000)));
}
