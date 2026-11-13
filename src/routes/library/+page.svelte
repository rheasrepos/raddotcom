<script>
	// /library — everything Rhea has saved from around the internet (videos,
	// links, websites, books, recommendations), searchable and grouped by topic.
	// Data: src/data/library.json, built by scripts/build-library.py from the
	// draft vault's recommendations/ notes. Topics are machine-made clusters
	// (named by their most distinctive words), except "Wild card", which is
	// Rhea's own pick (recommendations/_wildcard.md).
	import PageLayout from '../../components/PageLayout.svelte';
	import AIText from '../../components/AIText.svelte';
	import lib from '../../data/library.json';

	const items = lib.items;
	const KINDS = ['video', 'website', 'paper', 'book', 'podcast', 'post', 'thing'];

	let q = '';
	let topic = 'all';
	let kind = 'all';

	const domain = (u) => (u ? u.replace(/^https?:\/\/(www\.)?/, '').split('/')[0] : '');

	// topics, Wild card first, then by size
	$: topics = (() => {
		const c = {};
		for (const it of items) c[it.topic] = (c[it.topic] || 0) + 1;
		return Object.entries(c).sort((a, b) => (a[0] === 'Wild card' ? -1 : b[0] === 'Wild card' ? 1 : b[1] - a[1]));
	})();

	$: shown = items.filter((it) => {
		if (topic !== 'all' && it.topic !== topic) return false;
		if (kind !== 'all' && it.kind !== kind) return false;
		if (!q.trim()) return true;
		const hay = `${it.title} ${it.topic} ${it.kind} ${domain(it.url)}`.toLowerCase();
		return q.toLowerCase().split(/\s+/).filter(Boolean).every((w) => hay.includes(w));
	});

	// grouped for display when no single topic is selected
	$: groups = topics
		.map(([t]) => [t, shown.filter((it) => it.topic === t)])
		.filter(([, list]) => list.length);
</script>

<PageLayout title="Library - Rhea Madhogarhia">
<div class="lib">
	<header>
		<h1>Library</h1>
		<p class="meta">{items.length} things saved from around the internet</p>
		<p class="note"><AIText>Topics are found automatically by clustering the items and are named by the words most typical of each group, except Wild card, which is hand-picked. Names were transcribed from saved screenshots and bookmarks.</AIText></p>
	</header>

	<div class="controls">
		<input class="search" type="search" placeholder="search the library…" bind:value={q} />
		<select bind:value={kind} aria-label="Kind">
			<option value="all">all kinds</option>
			{#each KINDS as k}<option value={k}>{k}s</option>{/each}
		</select>
	</div>

	<div class="chips">
		<button class:on={topic === 'all'} on:click={() => (topic = 'all')}>all</button>
		{#each topics as [t, n]}
			<button class:on={topic === t} class:wild={t === 'Wild card'} class:machine={t !== 'Wild card'}
				title={t === 'Wild card' ? "Rhea's own picks" : 'Machine-made topic name'}
				on:click={() => (topic = topic === t ? 'all' : t)}>{t} <span class="n">{n}</span></button>
		{/each}
	</div>

	<p class="count">{shown.length} shown</p>

	{#each groups as [t, list] (t)}
		<section>
			<h2 class:machine={t !== 'Wild card'}>{t}</h2>
			<ul>
				{#each list as it}
					<li>
						{#if it.url}
							<a href={it.url} target="_blank" rel="noopener noreferrer">{it.title}</a>
							<span class="dom">{domain(it.url)}</span>
						{:else}
							<span class="plain">{it.title}</span>
							<a class="dom" href="https://duckduckgo.com/?q={encodeURIComponent(it.title)}" target="_blank" rel="noopener noreferrer">search ↗</a>
						{/if}
						<span class="kind">{it.kind}</span>
					</li>
				{/each}
			</ul>
		</section>
	{/each}
	{#if !shown.length}<p class="count">nothing matches.</p>{/if}
</div>
</PageLayout>

<style>
	.lib { padding: 4px 0 30px; max-width: 920px; }
	h1 { margin: 0 0 4px; }
	.meta { margin: 0; opacity: 0.75; font-size: 0.9rem; }
	.note { margin: 8px 0 14px; max-width: 70ch; font-size: 0.85rem; opacity: 0.85; }
	.controls { display: flex; gap: 8px; margin-bottom: 10px; }
	.search { flex: 1; padding: 6px 10px; border: 1px solid #000; background: #f7f7f7; font: inherit; }
	select { font: inherit; border: 1px solid #000; background: #f7f7f7; padding: 4px 6px; }
	.chips { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
	.chips button { font: inherit; font-size: 0.78rem; padding: 3px 9px; border: 1px solid #000; background: #c0c0c0; cursor: pointer; }
	.chips button.on { background: #000; color: #fff; }
	.chips button.wild { border-style: double; border-width: 3px; }
	.n { opacity: 0.6; }
	/* machine-made topic names carry the AI dashed underline */
	.machine { text-decoration: underline dashed; text-decoration-thickness: 1px; text-underline-offset: 3px; }
	.count { font-size: 0.8rem; opacity: 0.7; margin: 4px 0 10px; }
	section { margin: 18px 0; }
	h2 { font-size: 1rem; margin: 0 0 6px; border-bottom: 1px solid #000; padding-bottom: 4px; }
	ul { list-style: none; margin: 0; padding: 0; }
	li { display: flex; align-items: baseline; gap: 10px; padding: 5px 0; border-bottom: 1px dotted rgba(0, 0, 0, 0.25); font-size: 0.9rem; }
	li a { color: #000; }
	.plain { color: #000; }
	.dom { margin-left: auto; font-size: 0.72rem; opacity: 0.65; white-space: nowrap; color: #000; }
	.kind { font-size: 0.68rem; border: 1px solid rgba(0, 0, 0, 0.4); padding: 0 5px; white-space: nowrap; }
</style>
