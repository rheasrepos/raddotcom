<script>
	// /questions — Rhea's open questions for research and problems she thinks we
	// should solve, quoted exactly from her notes. Source: the vault's _questions.md
	// (copied to src/data/questions.md by promote-to-site.command).
	// Each line: "- quote | where it came from". Section names and "where it came
	// from" were written by Claude, so they carry the AI underline; quotes are hers.
	import PageLayout from '../../components/PageLayout.svelte';
	import AIText from '../../components/AIText.svelte';
	const raw = Object.values(import.meta.glob('/src/data/questions.md', { eager: true, query: '?raw', import: 'default' }))[0] || '';

	const sections = [];
	for (const line of raw.split('\n')) {
		const h = line.match(/^##\s+(.+)/);
		if (h) { sections.push({ name: h[1].trim(), items: [] }); continue; }
		const m = line.match(/^-\s+(.+)$/);
		if (m && sections.length) {
			const [q, from = '', ...links] = m[1].split(/\s+\|\s+/);
			sections[sections.length - 1].items.push({ q, from, links: links.filter(Boolean) });
		}
	}
	const total = sections.reduce((n, s) => n + s.items.length, 0);
	let query = '';
	$: shown = sections
		.map((s) => ({ ...s, items: s.items.filter((it) => !query.trim() || `${it.q} ${it.from}`.toLowerCase().includes(query.toLowerCase())) }))
		.filter((s) => s.items.length);
</script>

<PageLayout title="Questions - Rhea Madhogarhia">
<div class="qs">
	<header>
		<h1>Questions</h1>
		<p class="note"><AIText>Questions for research and problems worth solving, copied from Rhea's notes, lab notes and margins, with only spelling typos fixed. They're open: if you're working on one, or want to, tell her.</AIText></p>
		<p class="note"><a href="/ai-problems">AI-fixable problems database →</a></p>
		<input class="search" type="search" placeholder="search {total} questions…" bind:value={query} />
	</header>

	{#each shown as s (s.name)}
		<section>
			<h2><AIText>{s.name}</AIText></h2>
			<ol>
				{#each s.items as it}
					<li>
						<blockquote>“{it.q}”</blockquote>
						{#if it.from}<span class="from"><AIText>{it.from}</AIText></span>{/if}
						{#if it.links.length}<span class="qlinks">{#each it.links as l}<a href={l} target={l.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer">{l.includes('github.com') ? 'GitHub ↗' : 'page ↗'}</a>{/each}</span>{/if}
					</li>
				{/each}
			</ol>
		</section>
	{/each}
	{#if !shown.length}<p class="note" data-no-reveal><AIText>nothing matches.</AIText></p>{/if}
</div>
</PageLayout>

<style>
	.qs { padding: 4px 0 30px; max-width: 900px; }
	h1 { margin: 0 0 6px; }
	.note { margin: 6px 0; max-width: 70ch; font-size: 0.85rem; opacity: 0.85; }
	.note a { color: #000; }
	.search { width: 100%; max-width: 420px; box-sizing: border-box; margin: 10px 0 4px; padding: 6px 10px; border: 1px solid #000; background: #f7f7f7; font: inherit; }
	section { margin: 22px 0; }
	h2 { font-size: 1rem; margin: 0 0 8px; border-bottom: 1px solid #000; padding-bottom: 4px; }
	ol { margin: 0; padding-left: 1.4em; }
	li { padding: 8px 0; border-bottom: 1px dotted rgba(0, 0, 0, 0.25); }
	blockquote { margin: 0; font-size: 1rem; line-height: 1.45; }
	.qlinks { display: inline-flex; gap: 10px; margin-top: 3px; font-size: 0.75rem; }
	.qlinks a { color: #000; }
	.from { display: block; margin-top: 3px; font-size: 0.72rem; opacity: 0.65; }
</style>
