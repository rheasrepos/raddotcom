<script>
	// Grid of video thumbnails (channel uploads + the extras from _videos.md);
	// click one and it plays in place.
	import { onMount } from 'svelte';
	import AIText from './AIText.svelte';
	export let channelUrl = 'https://youtube.com/@rheamad';
	let videos = null; // null = loading
	let playing = null;
	onMount(async () => {
		try { const r = await fetch('/api/videos'); videos = r.ok ? await r.json() : []; } catch { videos = []; }
	});
</script>

{#if videos === null}
	<p class="vg-msg">loading videos…</p>
{:else if videos.length === 0}
	<p class="vg-msg"><AIText>couldn't load the videos right now —</AIText> <a href={channelUrl} target="_blank" rel="noopener noreferrer">open the channel ↗</a></p>
{:else}
	<div class="vg">
		{#each videos as v (v.id)}
			<div class="vg-item" class:extra={v.source === 'extra'}>
				{#if playing === v.id}
					<div class="vg-player"><iframe src="https://www.youtube.com/embed/{v.id}?autoplay=1" title={v.title} allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe></div>
				{:else}
					<button class="vg-thumb" on:click={() => (playing = v.id)} title="Play">
						<img src="https://i.ytimg.com/vi/{v.id}/hqdefault.jpg" alt={v.title} loading="lazy" />
						<span class="vg-play">▶</span>
					</button>
				{/if}
				<div class="vg-cap">
					<span class="vg-title">{v.title}</span>
					<span class="vg-meta">{v.date}{#if v.source === 'extra'}{v.date ? ' · ' : ''}<AIText>not on my channel</AIText>{/if}</span>
				</div>
			</div>
		{/each}
	</div>
{/if}

<style>
	.vg { display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 1px; background: #000; }
	.vg-item { background: #fff; display: flex; flex-direction: column; }
	.vg-thumb { position: relative; display: block; width: 100%; aspect-ratio: 16 / 9; border: 0; padding: 0; background: #000; cursor: pointer; overflow: hidden; }
	.vg-thumb img { width: 100%; height: 100%; object-fit: cover; display: block; }
	.vg-play { position: absolute; inset: 0; display: grid; place-items: center; color: #fff; font-size: 1.6rem; text-shadow: 0 0 10px #000; opacity: 0.85; }
	.vg-thumb:hover .vg-play { opacity: 1; }
	.vg-player { aspect-ratio: 16 / 9; background: #000; }
	.vg-player iframe { width: 100%; height: 100%; border: 0; display: block; }
	.vg-cap { padding: 8px 10px; display: flex; flex-direction: column; gap: 2px; }
	.vg-title { font-size: 0.85rem; font-weight: 700; line-height: 1.25; }
	.vg-meta { font-size: 0.72rem; opacity: 0.65; }
	.vg-msg { padding: 12px; font-size: 0.85rem; opacity: 0.8; margin: 0; }
	.vg-msg a { color: inherit; }
</style>
