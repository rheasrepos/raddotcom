// "What are the world's biggest problems?" — visitor answers on /ai-problems.
// Stored in the same Supabase project as the WPM wall (PUBLIC_SUPABASE_URL /
// PUBLIC_SUPABASE_ANON_KEY). Table + policies: supabase/problem_votes.sql.
// Without the keys the form says it isn't open yet and nothing is sent.
import { env } from '$env/dynamic/public';

const URL = env.PUBLIC_SUPABASE_URL || '';
const KEY = env.PUBLIC_SUPABASE_ANON_KEY || '';
export const votesConfigured = Boolean(URL && KEY);
const headers = { apikey: KEY };

/** @param {{category: string, problem?: string, why?: string}} v */
export async function submitVote(v) {
	const body = {
		category: v.category.slice(0, 60),
		problem: (v.problem || '').trim().slice(0, 200) || null,
		why: (v.why || '').trim().slice(0, 500) || null
	};
	const res = await fetch(`${URL}/rest/v1/problem_votes`, {
		method: 'POST',
		headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
		body: JSON.stringify(body)
	});
	if (!res.ok) throw new Error('could not submit');
}

/** @returns {Promise<{stats: {category: string, votes: number}[], writeins: {problem: string, mentions: number}[]}>} */
export async function loadVotes() {
	const [a, b] = await Promise.all([
		fetch(`${URL}/rest/v1/problem_vote_stats?select=*`, { headers }),
		fetch(`${URL}/rest/v1/problem_vote_writeins?select=*&order=mentions.desc&limit=100`, { headers })
	]);
	if (!a.ok || !b.ok) throw new Error('votes unavailable');
	return { stats: await a.json(), writeins: await b.json() };
}
