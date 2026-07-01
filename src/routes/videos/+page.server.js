// Pulls each channel's recent uploads from its public YouTube RSS feed so we
// can render a real thumbnail gallery. Runs on the server (or at build time),
// so there's no CORS problem and no API key needed.

const CHANNELS = [
	{
		name: 'rheamad',
		handle: '@rheamad',
		id: 'UCEQ38C8Z5AjJCOr_MN-tGuA',
		url: 'https://www.youtube.com/@rheamad'
	},
	{
		name: 'Finders, Keepers',
		handle: '@FindersKeepersRadio',
		id: 'UCnYPb-3a_NR3T4Ps2DJf46w',
		url: 'https://www.youtube.com/@FindersKeepersRadio'
	}
];

function decode(s) {
	return s
		.replace(/&amp;/g, '&')
		.replace(/&#39;/g, "'")
		.replace(/&quot;/g, '"')
		.replace(/&lt;/g, '<')
		.replace(/&gt;/g, '>');
}

function parseFeed(xml) {
	const videos = [];
	const blocks = xml.split('<entry>').slice(1);
	for (const b of blocks) {
		const id = (b.match(/<yt:videoId>([^<]+)<\/yt:videoId>/) || [])[1];
		if (!id) continue;
		const title = (b.match(/<title>([^<]*)<\/title>/) || [])[1] || '';
		const published = (b.match(/<published>([^<]+)<\/published>/) || [])[1] || '';
		videos.push({
			id,
			title: decode(title),
			published,
			thumb: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
		});
	}
	return videos;
}

// Prerender so it also works on static hosting (feed is baked at build time).
export const prerender = true;

export async function load({ fetch }) {
	const channels = await Promise.all(
		CHANNELS.map(async (ch) => {
			try {
				const res = await fetch(`https://www.youtube.com/feeds/videos.xml?channel_id=${ch.id}`);
				if (!res.ok) return { ...ch, videos: [] };
				const xml = await res.text();
				return { ...ch, videos: parseFeed(xml) };
			} catch {
				return { ...ch, videos: [] };
			}
		})
	);
	return { channels };
}
