<script>
	import { createEventDispatcher, onMount } from 'svelte';
	import { fade, fly } from 'svelte/transition';

	export let posts = [];

	const dispatch = createEventDispatcher();

	let query = '';
	let input;
	let active = 0;

	onMount(() => {
		if (input) input.focus();
	});

	function plain(html) {
		return String(html || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
	}

	function snippet(p, q) {
		const text = plain(p.content) || p.description || '';
		const i = q ? text.toLowerCase().indexOf(q.toLowerCase()) : -1;
		if (i < 0) return text.slice(0, 90) + (text.length > 90 ? '…' : '');
		const start = Math.max(0, i - 30);
		return (start > 0 ? '…' : '') + text.slice(start, i + 90) + '…';
	}

	$: q = query.trim().toLowerCase();
	$: results = !q
		? []
		: posts
				.filter((p) => {
					const hay = (p.title + ' ' + (p.description || '') + ' ' + plain(p.content) + ' ' + p.type).toLowerCase();
					return hay.includes(q);
				})
				.slice(0, 12);
	$: if (active >= results.length) active = 0;

	function choose(p) {
		dispatch('select', p);
	}
	function onKeydown(e) {
		if (e.key === 'Escape') { dispatch('close'); }
		else if (e.key === 'ArrowDown') { e.preventDefault(); active = Math.min(active + 1, results.length - 1); }
		else if (e.key === 'ArrowUp') { e.preventDefault(); active = Math.max(active - 1, 0); }
		else if (e.key === 'Enter' && results[active]) { choose(results[active]); }
	}
</script>

<div class="spot-backdrop" role="presentation" on:click|self={() => dispatch('close')} transition:fade={{ duration: 100 }}>
	<div class="spotlight" transition:fly={{ y: -16, duration: 150 }}>
		<div class="spot-input-row">
			<svg class="spot-mag" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
				<circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" />
			</svg>
			<input
				bind:this={input}
				bind:value={query}
				on:keydown={onKeydown}
				type="text"
				placeholder="Spotlight — search my writing…"
				autocomplete="off"
				spellcheck="false"
			/>
			<kbd class="spot-esc">esc</kbd>
		</div>

		{#if q && results.length}
			<ul class="spot-results">
				{#each results as p, i}
					<li>
						<button class="spot-row {i === active ? 'active' : ''}" on:click={() => choose(p)} on:mouseenter={() => (active = i)}>
							<span class="spot-text">
								<span class="spot-title">{p.title}</span>
								<span class="spot-snip">{snippet(p, q)}</span>
							</span>
							<span class="spot-type">{p.type}</span>
						</button>
					</li>
				{/each}
			</ul>
		{:else if q}
			<div class="spot-empty">No matches for “{query}”.</div>
		{/if}
	</div>
</div>

<style>
	.spot-backdrop {
		position: fixed; inset: 0; z-index: 1100;
		background: rgba(20, 20, 30, 0.35);
		backdrop-filter: blur(2px);
		display: flex; justify-content: center;
		padding-top: 14vh;
	}
	.spotlight {
		width: min(640px, 92vw);
		background: rgba(250, 250, 252, 0.98);
		border: 1px solid #000;
		overflow: hidden;
		height: fit-content;
		font-family: var(--font-family, Arial, sans-serif);
	}
	.spot-input-row { display: flex; align-items: center; gap: 10px; padding: 14px 16px; }
	.spot-mag { width: 20px; height: 20px; color: #888; flex-shrink: 0; }
	.spot-input-row input {
		flex: 1; border: none; background: transparent; outline: none;
		font-size: 1.25rem; color: #111;
	}
	.spot-esc { background: #eee; border: 1px solid #ccc; border-radius: 0; padding: 1px 6px; font-size: 0.7rem; color: #777; }
	.spot-results { list-style: none; margin: 0; padding: 6px; max-height: 52vh; overflow: auto; border-top: 1px solid #e3e3e8; }
	.spot-row {
		width: 100%; display: flex; align-items: center; gap: 12px;
		padding: 9px 12px; background: transparent; border: none; text-align: left; border-radius: 0;
	}
	.spot-row.active { background: #367af6; }
	.spot-row.active :global(*) { color: #fff !important; }
	.spot-doc { font-size: 1.3rem; }
	.spot-text { display: flex; flex-direction: column; flex: 1; min-width: 0; }
	.spot-title { font-weight: 600; font-size: 0.95rem; }
	.spot-snip { font-size: 0.78rem; color: #777; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.spot-type { font-size: 0.72rem; color: #999; text-transform: capitalize; flex-shrink: 0; }
	.spot-empty { padding: 22px 18px; color: #888; border-top: 1px solid #e3e3e8; }
</style>
