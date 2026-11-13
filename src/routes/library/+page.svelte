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
	import LibraryMap from '../../components/LibraryMap.svelte';
	let view = 'list'; // 'list' | 'map'
	// the map dims everything outside the current search / topic / kind filter
	$: inFilter = (it) => shown.includes(it);

	const items = lib.items;
	const KINDS = ['video', 'website', 'paper', 'book', 'podcast', 'post', 'thing'];

	let q = '';
	let topic = 'all';
	let kind = 'all';
	let sort = 'topic'; // 'topic' | 'az' | 'za' | 'kind'

	// one colour per topic, shared by the sidebar and the map
	const PALETTE = ['#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4', '#42d4f4', '#f032e6', '#9a6324', '#469990', '#800000', '#808000', '#000075', '#e6a800', '#7a7a7a', '#bfef45', '#dcbeff', '#aaffc3', '#ffd8b1', '#fabed4'];

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

	$: colors = Object.fromEntries(topics.map(([t], i) => [t, t === 'Wild card' ? '#000' : PALETTE[i % PALETTE.length]]));

	const byTitle = (a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
	// grouped by topic (default) or by kind; or one flat A–Z / Z–A list
	$: groups = sort === 'topic'
		? topics.map(([t]) => [t, shown.filter((it) => it.topic === t)]).filter(([, l]) => l.length)
		: sort === 'kind'
			? KINDS.map((k) => [k + 's', shown.filter((it) => it.kind === k).sort(byTitle)]).filter(([, l]) => l.length)
			: [[sort === 'az' ? 'A–Z' : 'Z–A', [...shown].sort(sort === 'az' ? byTitle : (a, b) => byTitle(b, a))]];
</script>

<PageLayout title="Library - Rhea Madhogarhia">
<div class="lib">
	<header>
		<h1>Library</h1>
		<p class="meta" data-no-reveal>{items.length} <AIText>things saved from around the internet</AIText></p>
		<p class="note"><AIText>Topics are found automatically by clustering the items and are named by the words most typical of each group, except Wild card, which is hand-picked. Names were transcribed from saved screenshots and bookmarks.</AIText></p>
	</header>

	<div class="layout">
	<aside class="side">
		<div class="views">
			<button class:on={view === 'list'} on:click={() => (view = 'list')}>list</button>
			<button class:on={view === 'map'} on:click={() => (view = 'map')}>map</button>
		</div>
		<input class="search" type="search" placeholder="search the library…" bind:value={q} />
		<label class="lbl">kind
			<select bind:value={kind}>
				<option value="all">all kinds</option>
				{#each KINDS as k}<option value={k}>{k}s</option>{/each}
			</select>
		</label>
		{#if view === 'list'}
			<label class="lbl">sort
				<select bind:value={sort}>
					<option value="topic">by topic</option>
					<option value="az">A–Z</option>
					<option value="za">Z–A</option>
					<option value="kind">by kind</option>
				</select>
			</label>
		{/if}
		<div class="topics">
			<button class="t" class:on={topic === 'all'} on:click={() => (topic = 'all')}>all topics <span class="n">{items.length}</span></button>
			{#each topics as [t, n]}
				<button class="t" class:on={topic === t} on:click={() => (topic = topic === t ? 'all' : t)}
					title={t === 'Wild card' ? "Rhea's own picks" : 'Machine-made topic name'}>
					<i style="background:{colors[t]}"></i><span class:machine={t !== 'Wild card'}>{t}</span> <span class="n">{n}</span>
				</button>
			{/each}
		</div>
	</aside>
	<main class="main">
	<p class="count">{shown.length} shown</p>

	{#if view === 'map'}
		<p class="note"><AIText>Each dot is one saved thing, joined to the three things most like it. Colours are topics. Hover to see a dot and its neighbours, click to open it, drag and scroll to move around. Search and filters above dim everything else.</AIText></p>
		<LibraryMap {items} {colors} highlight={inFilter} on:open={(e) => e.detail.url ? window.open(e.detail.url, '_blank', 'noopener') : window.open('https://duckduckgo.com/?q=' + encodeURIComponent(e.detail.title), '_blank', 'noopener')} />
	{:else}
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
	{/if}
	{#if !shown.length}<p class="count" data-no-reveal><AIText>nothing matches.</AIText></p>{/if}
	</main>
	</div>
</div>
</PageLayout>

<style>
	.lib { padding: 4px 0 30px; max-width: 1180px; }
	.layout { display: grid; grid-template-columns: 230px 1fr; gap: 18px; align-items: start; }
	.side { position: sticky; top: 8px; display: flex; flex-direction: column; gap: 8px; max-height: calc(100vh - 140px); overflow: auto; padding-right: 4px; }
	.main { min-width: 0; }
	.lbl { display: flex; align-items: center; justify-content: space-between; gap: 6px; font-size: 0.8rem; }
	.topics { display: flex; flex-direction: column; gap: 2px; margin-top: 4px; }
	.t { display: flex; align-items: center; gap: 6px; text-align: left; font: inherit; font-size: 0.78rem; padding: 3px 6px; border: 1px solid transparent; background: none; cursor: pointer; }
	.t:hover { border-color: #000; }
	.t.on { background: #000; color: #fff; }
	.t i { flex: none; width: 9px; height: 9px; display: inline-block; }
	.t .n { margin-left: auto; }
	@media (max-width: 760px) { .layout { grid-template-columns: 1fr; } .side { position: static; max-height: none; } }
	h1 { margin: 0 0 4px; }
	.meta { margin: 0; opacity: 0.75; font-size: 0.9rem; }
	.note { margin: 8px 0 14px; max-width: 70ch; font-size: 0.85rem; opacity: 0.85; }
	.views { display: flex; border: 1px solid #000; }
	.views button { flex: 1; }
	.views button { font: inherit; font-size: 0.85rem; padding: 3px 12px; border: none; background: #c0c0c0; cursor: pointer; }
	.views button.on { background: #000; color: #fff; }
	.search { width: 100%; box-sizing: border-box; padding: 6px 10px; border: 1px solid #000; background: #f7f7f7; font: inherit; }
	select { font: inherit; border: 1px solid #000; background: #f7f7f7; padding: 4px 6px; }
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
