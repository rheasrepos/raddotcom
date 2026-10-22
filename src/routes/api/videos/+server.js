// /api/videos — the video gallery's data: the channel's uploads (from
// YouTube's public RSS feed, no API key) + extra videos Rhea lists in the
// vault's _videos.md (copied to src/data/videos.md by promote-to-site).
// Fetched server-side (YouTube sends no CORS headers for browsers) and cached
// for an hour per serverless instance.
import { json } from '@sveltejs/kit';

const CHANNEL_ID = 'UCEQ38C8Z5AjJCOr_MN-tGuA'; // @rheamad
const extraRaw = import.meta.glob('/src/data/videos.md', { eager: true, query: '?raw', import: 'default' });

let cache = { at: 0, data: null };
const HOUR = 60 * 60 * 1000;

function ytId(url) {
	const m = String(url || '').match(/(?:v=|youtu\.be\/|embed\/|shorts\/)([\w-]{6,})/);
	return m ? m[1] : null;
}

async function channelUploads() {
	try {
		const r = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${CHANNEL_ID}`, { headers: { 'user-agent': 'rhea.com' } });
		if (!r.ok) return [];
		const xml = await r.text();
		return [...xml.matchAll(/<entry>([\s\S]*?)<\/entry>/g)].map((m) => {
			const e = m[1];
			const g = (tag) => (e.match(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`)) || [])[1] || '';
			return { id: g('yt:videoId'), title: g('title'), date: g('published').slice(0, 10), source: 'channel' };
		}).filter((v) => v.id);
	} catch { return []; }
}

async function extras() {
	const text = Object.values(extraRaw)[0] || '';
	const out = [];
	for (const line of text.split('\n')) {
		const t = line.trim();
		if (!t || t.startsWith('#')) continue;
		const [url, ...rest] = t.split(' — ');
		const id = ytId(url);
		if (!id) continue;
		let title = rest.join(' — ').trim();
		if (!title) {
			try {
				const r = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`);
				if (r.ok) title = (await r.json()).title || '';
			} catch {}
		}
		out.push({ id, title: title || id, date: '', source: 'extra' });
	}
	return out;
}

export async function GET() {
	if (!cache.data || Date.now() - cache.at > HOUR) {
		const [ch, ex] = await Promise.all([channelUploads(), extras()]);
		const seen = new Set();
		const all = [...ex, ...ch].filter((v) => (seen.has(v.id) ? false : seen.add(v.id)));
		cache = { at: Date.now(), data: all };
	}
	return json(cache.data, { headers: { 'cache-control': 'public, max-age=600' } });
}
