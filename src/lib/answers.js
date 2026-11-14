// Visitor answers to the Questions page (rhea.com/questions). Anonymous, shared
// live through the same Supabase project as WPM (table `question_answers`, SQL in
// HOW TO §5h). Without the keys/table, answers only stay in this browser.
import { env } from '$env/dynamic/public';

const URL = env.PUBLIC_SUPABASE_URL || '';
const KEY = env.PUBLIC_SUPABASE_ANON_KEY || '';
export const configured = Boolean(URL && KEY);
const headers = { apikey: KEY };
const LOCAL = 'questionAnswersLocal';

export async function loadAnswers() {
	if (configured) {
		const res = await fetch(`${URL}/rest/v1/question_answers?select=question,answer,created_at&order=created_at.desc&limit=2000`, { headers });
		if (!res.ok) throw new Error('answers unavailable');
		return await res.json();
	}
	try { return JSON.parse(localStorage.getItem(LOCAL) || '[]'); } catch { return []; }
}

export async function sendAnswer(question, answer) {
	const row = { question: question.slice(0, 400), answer: answer.trim().slice(0, 1000) };
	if (configured) {
		const res = await fetch(`${URL}/rest/v1/question_answers`, {
			method: 'POST',
			headers: { ...headers, 'Content-Type': 'application/json', Prefer: 'return=minimal' },
			body: JSON.stringify(row)
		});
		if (!res.ok) throw new Error('could not save');
		return;
	}
	const local = JSON.parse(localStorage.getItem(LOCAL) || '[]');
	local.unshift({ ...row, created_at: new Date().toISOString() });
	localStorage.setItem(LOCAL, JSON.stringify(local.slice(0, 2000)));
}
