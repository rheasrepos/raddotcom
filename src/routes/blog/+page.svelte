<script>
	import PageLayout from '../../components/PageLayout.svelte';
	import { categoryConfig, getCategoryColor } from '../../lib/categories.js';
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { loadPosts } from '../../lib/posts.js';

	let posts = [];
	let grouping = 'date'; // 'date' | 'category' | 'month'

	// Categories the reader has hidden. Carried in the URL (?hide=a,b) so the
	// filter follows you into a post and its Newer/Older paging.
	let hidden = new Set();

	onMount(async () => {
		const h = new URL(window.location.href).searchParams.get('hide');
		if (h) hidden = new Set(h.split(',').filter(Boolean));
		try {
			posts = await loadPosts();
		} catch (e) {
			posts = [];
		}
	});

	function toggleHidden(id) {
		hidden.has(id) ? hidden.delete(id) : hidden.add(id);
		hidden = hidden; // reactivity
		const url = new URL(window.location.href);
		if (hidden.size) url.searchParams.set('hide', [...hidden].join(','));
		else url.searchParams.delete('hide');
		history.replaceState({}, '', url);
	}

	$: hideParam = hidden.size ? `?hide=${[...hidden].join(',')}` : '';
	$: presentCats = Object.values(categoryConfig).filter((c) => posts.some((p) => p.type === c.id));

	function fmt(d) {
		return new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
	}
	function monthLabel(d) {
		return new Date(d).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
	}
	function catLabel(type) {
		return categoryConfig[type] ? categoryConfig[type].label : type;
	}

	// Newest first, minus hidden categories
	$: sorted = [...posts]
		.filter((p) => !hidden.has(p.type))
		.sort((a, b) => new Date(b.date) - new Date(a.date));

	// The SAME list, regrouped depending on the chosen view.
	$: groups = (() => {
		if (grouping === 'date') return [];
		const map = new Map();
		for (const p of sorted) {
			const key = grouping === 'category' ? catLabel(p.type) : monthLabel(p.date);
			if (!map.has(key)) map.set(key, []);
			map.get(key).push(p);
		}
		return [...map.entries()];
	})();
</script>

<PageLayout title="Rhea's Web - Rhea Madhogarhia">
	<section class="archive">
		<header class="arch-head">
			<h1 class="arch-title">Rhea's Web</h1>
			<p class="arch-sub">Notes, essays, and thesis fragments — {posts.length} entries.</p>
		</header>

		<nav class="view-switch" aria-label="Group posts by">
			<span class="view-switch-label">View:</span>
			<button class:active={grouping === 'date'} on:click={() => (grouping = 'date')}>Chronological</button>
			<button class:active={grouping === 'category'} on:click={() => (grouping = 'category')}>By Category</button>
			<button class:active={grouping === 'month'} on:click={() => (grouping = 'month')}>By Month</button>
		</nav>

		<!-- Category filter: click to hide/show a category while you browse -->
		<nav class="cat-filter" aria-label="Filter categories">
			<span class="view-switch-label">Show:</span>
			{#each presentCats as c}
				<button
					class="cat-chip"
					class:off={hidden.has(c.id)}
					style="--chip: {getCategoryColor(c.id)}"
					on:click={() => toggleHidden(c.id)}
					title={hidden.has(c.id) ? `Show ${c.label}` : `Hide ${c.label}`}
				>
					<span class="chip-dot"></span>{c.label}
				</button>
			{/each}
		</nav>

		{#if posts.length === 0}
			<p class="empty">Loading…</p>
		{:else if grouping === 'date'}
			<!-- Flat Substack-style archive -->
			<ul class="entries">
				{#each sorted as p}
					<li class="entry">
						<a class="entry-link" href="/posts/{p.id}{hideParam}">
							<span class="entry-date">{fmt(p.date)}</span>
							<span class="entry-title" class:ai-title={p.aiTitle} title={p.aiTitle ? 'Title drafted with AI assistance' : undefined}>{p.title}</span>
							{#if p.form}<span class="entry-form">{p.form}</span>{/if}
						</a>
						{#if p.description}<p class="entry-desc">{p.description}</p>{/if}
					</li>
				{/each}
			</ul>
		{:else}
			<!-- Grouped: each group is a "folder" with its posts connected beneath -->
			<div class="folders">
				{#each groups as [name, items]}
					<section class="folder">
						<h2 class="folder-head">
							<span
								class="folder-dot"
								style="background: {grouping === 'category' ? getCategoryColor(items[0].type) : '#000'}"
							></span>
							{name}
							<span class="folder-count">{items.length}</span>
						</h2>
						<ul class="entries nested">
							{#each items as p}
								<li class="entry">
									<a class="entry-link" href="/posts/{p.id}{hideParam}">
										<span class="entry-date">{fmt(p.date)}</span>
										<span class="entry-title" class:ai-title={p.aiTitle} title={p.aiTitle ? 'Title drafted with AI assistance' : undefined}>{p.title}</span>
										{#if p.form}<span class="entry-form">{p.form}</span>{/if}
									</a>
								</li>
							{/each}
						</ul>
					</section>
				{/each}
			</div>
		{/if}
	</section>
</PageLayout>

<style>
	.archive {
		max-width: 720px;
		margin: 0 auto;
		padding: 4px 0 40px;
	}

	.arch-head {
		margin-bottom: 22px;
	}
	.arch-title {
		font-size: 2.2rem;
		font-weight: 800;
		color: #000;
		margin: 0 0 6px;
	}
	.arch-sub {
		font-size: 1rem;
		color: #333;
		margin: 0;
	}

	/* View switcher — same list, different groupings */
	.view-switch {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 6px;
		padding-bottom: 10px;
		margin-bottom: 8px;
		border-bottom: 1px solid rgba(0, 0, 0, 0.35);
	}
	.view-switch-label {
		font-size: 0.85rem;
		font-weight: 700;
		margin-right: 4px;
	}
	.view-switch button {
		background: transparent;
		border: none;
		color: #333;
		font-size: 0.9rem;
		padding: 3px 8px;
		cursor: pointer;
		border-bottom: 2px solid transparent;
	}
	.view-switch button:hover {
		color: #000;
	}
	.view-switch button.active {
		color: #000;
		font-weight: 700;
		border-bottom-color: #000;
	}

	/* Entries */
	.entries {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	.entry {
		padding: 12px 0;
		border-bottom: 1px solid rgba(0, 0, 0, 0.12);
	}
	.entry-link {
		display: flex;
		align-items: baseline;
		gap: 14px;
		text-decoration: none;
		color: #000;
	}
	.entry-date {
		flex: 0 0 auto;
		width: 96px;
		font-size: 0.8rem;
		color: #777;
		font-variant-numeric: tabular-nums;
	}
	.entry-title {
		font-size: 1.05rem;
		font-weight: 600;
		line-height: 1.35;
	}
	/* Category filter chips */
	.cat-filter {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 8px;
		margin: 10px 0 18px;
	}
	.cat-chip {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		border: 1px solid #000;
		background: #fff;
		font-size: 0.8rem;
		padding: 3px 9px;
		cursor: pointer;
	}
	.chip-dot {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--chip, #999);
		border: 1px solid #000;
	}
	.cat-chip.off {
		opacity: 0.45;
		text-decoration: line-through;
		background: #eee;
	}

	/* Form badge: paper / discussion post / blog post / … */
	.entry-form {
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: #444;
		background: rgba(0, 0, 0, 0.07);
		border: 1px solid rgba(0, 0, 0, 0.2);
		border-radius: 0;
		padding: 1px 6px;
		margin-left: 8px;
		white-space: nowrap;
	}
	/* AI-drafted titles: dashed underline, same convention as AIText */
	.entry-title.ai-title {
		text-decoration: underline dashed;
		text-decoration-thickness: 1px;
		text-underline-offset: 3px;
		cursor: help;
	}
	.entry-link:hover .entry-title {
		text-decoration: underline;
	}
	.entry-desc {
		margin: 5px 0 0 110px;
		font-size: 0.9rem;
		color: #555;
		line-height: 1.5;
	}

	/* Grouped folders — posts connect to their folder with a left rule */
	.folders {
		display: flex;
		flex-direction: column;
		gap: 26px;
	}
	.folder-head {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 1.15rem;
		font-weight: 800;
		color: #000;
		margin: 0 0 6px;
	}
	.folder-dot {
		width: 12px;
		height: 12px;
		border: 1px solid #000;
		flex: 0 0 auto;
	}
	.folder-count {
		font-size: 0.78rem;
		font-weight: 600;
		color: #777;
		border: 1px solid rgba(0, 0, 0, 0.3);
		padding: 0 6px;
	}
	.entries.nested {
		margin-left: 5px;
		padding-left: 16px;
		border-left: 2px solid rgba(0, 0, 0, 0.35);
	}
	.entries.nested .entry {
		padding: 8px 0;
		border-bottom: 1px dotted rgba(0, 0, 0, 0.18);
	}
	.entries.nested .entry:last-child {
		border-bottom: none;
	}

	.empty {
		color: #555;
	}

	@media (max-width: 600px) {
		.entry-link {
			flex-direction: column;
			gap: 2px;
		}
		.entry-desc {
			margin-left: 0;
		}
	}
</style>
