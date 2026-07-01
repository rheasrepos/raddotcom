<script>
	import PageLayout from '../../components/PageLayout.svelte';

	export let data;

	// Featured a cappella performances (these live on other channels, so they
	// don't show up in either uploads feed — pinned here on purpose).
	const featured = [
		{ id: '3yGZ4tiVzj4', title: 'Featured performance' },
		{ id: '7kV89H4PWRE', title: 'Featured performance' },
		{ id: 'JPdG4s8XHBc', title: 'Featured performance' },
		{ id: 'DapZN5Zf1JQ', title: 'Featured performance' }
	].map((v) => ({ ...v, thumb: `https://i.ytimg.com/vi/${v.id}/hqdefault.jpg` }));

	const channels = data?.channels ?? [];

	// Click-to-play lightbox.
	let active = null;
	function play(v) {
		active = v;
	}
	function close() {
		active = null;
	}

	function fmt(d) {
		if (!d) return '';
		try {
			return new Date(d).toLocaleDateString('en-US', {
				year: 'numeric',
				month: 'short',
				day: 'numeric'
			});
		} catch {
			return '';
		}
	}
</script>

<svelte:window on:keydown={(e) => e.key === 'Escape' && close()} />

<PageLayout title="Videos - Rhea Madhogarhia">
	<section class="videos-page">
		<header class="videos-head">
			<h1 class="videos-title">Music &amp; Video</h1>
			<p class="videos-sub">Everything I make, pulled from both channels. Click any thumbnail to play.</p>
		</header>

		<!-- Featured -->
		<section class="block">
			<h2 class="block-title">Featured</h2>
			<div class="gallery">
				{#each featured as v}
					<button class="tile" on:click={() => play(v)}>
						<span class="thumb-wrap">
							<img class="thumb" src={v.thumb} alt={v.title} loading="lazy" />
							<span class="play-badge" aria-hidden="true">►</span>
						</span>
						<span class="tile-title">{v.title}</span>
					</button>
				{/each}
			</div>
		</section>

		<!-- Both channels as galleries -->
		{#each channels as ch}
			<section class="block">
				<div class="block-head">
					<h2 class="block-title">{ch.name}</h2>
					<a class="channel-link" href={ch.url} target="_blank" rel="noopener">Visit channel →</a>
				</div>

				{#if ch.videos && ch.videos.length}
					<div class="gallery">
						{#each ch.videos as v}
							<button class="tile" on:click={() => play(v)}>
								<span class="thumb-wrap">
									<img class="thumb" src={v.thumb} alt={v.title} loading="lazy" />
									<span class="play-badge" aria-hidden="true">►</span>
								</span>
								<span class="tile-title">{v.title}</span>
								{#if v.published}<span class="tile-date">{fmt(v.published)}</span>{/if}
							</button>
						{/each}
					</div>
				{:else}
					<!-- Fallback: if the feed couldn't be read, embed the channel's
					     auto-updating uploads player so nothing is ever blank. -->
					<div class="fallback">
						<div class="video-frame">
							<iframe
								src={`https://www.youtube-nocookie.com/embed/videoseries?list=UU${ch.id.slice(2)}`}
								title={`${ch.name} — latest uploads`}
								loading="lazy"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowfullscreen
							></iframe>
						</div>
					</div>
				{/if}
			</section>
		{/each}
	</section>
</PageLayout>

<!-- Lightbox -->
{#if active}
	<div class="lightbox" role="presentation" on:click|self={close}>
		<div class="lightbox-inner">
			<button class="lightbox-close" on:click={close} aria-label="Close">✕</button>
			<div class="video-frame">
				<iframe
					src={`https://www.youtube-nocookie.com/embed/${active.id}?autoplay=1`}
					title={active.title}
					allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
					allowfullscreen
				></iframe>
			</div>
			{#if active.title}<p class="lightbox-title">{active.title}</p>{/if}
		</div>
	</div>
{/if}

<style>
	.videos-page {
		max-width: 1100px;
		margin: 0 auto;
		padding: 10px 4px 40px;
	}

	.videos-head {
		text-align: center;
		margin-bottom: 36px;
	}
	.videos-title {
		font-size: 2.5rem;
		font-weight: bold;
		color: #000;
		margin: 0 0 10px;
	}
	.videos-sub {
		font-size: 1.1rem;
		color: #444;
		margin: 0;
	}

	.block {
		margin-bottom: 44px;
	}
	.block > .block-title {
		border-bottom: 2px solid #000;
		padding-bottom: 8px;
		margin-bottom: 20px;
	}
	.block-head {
		display: flex;
		align-items: baseline;
		justify-content: space-between;
		gap: 12px;
		flex-wrap: wrap;
		border-bottom: 2px solid #000;
		padding-bottom: 8px;
		margin-bottom: 20px;
	}
	.block-title {
		font-size: 1.5rem;
		font-weight: bold;
		color: #000;
		margin: 0;
	}
	.channel-link {
		font-size: 0.9rem;
		font-weight: bold;
		color: #000;
		text-decoration: none;
		white-space: nowrap;
	}
	.channel-link:hover {
		text-decoration: underline;
	}

	/* Gallery grid */
	.gallery {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
		gap: 18px;
	}

	.tile {
		display: flex;
		flex-direction: column;
		text-align: left;
		background: transparent;
		border: 1px solid #000;
		padding: 0;
		cursor: pointer;
		font-family: inherit;
		transition: transform 0.12s ease, box-shadow 0.12s ease;
	}
	.tile:hover {
		transform: translateY(-3px);
		box-shadow: 4px 4px 0 #000;
	}

	.thumb-wrap {
		position: relative;
		display: block;
		width: 100%;
		aspect-ratio: 16 / 9;
		background: #000;
		overflow: hidden;
		border-bottom: 1px solid #000;
	}
	.thumb {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
	.play-badge {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2rem;
		color: #fff;
		text-shadow: 0 2px 6px rgba(0, 0, 0, 0.7);
		opacity: 0.9;
		transition: opacity 0.12s ease, transform 0.12s ease;
	}
	.tile:hover .play-badge {
		opacity: 1;
		transform: scale(1.15);
	}

	.tile-title {
		font-size: 0.9rem;
		font-weight: 600;
		color: #000;
		padding: 8px 10px 2px;
		line-height: 1.3;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 2;
		overflow: hidden;
	}
	.tile-date {
		font-size: 0.72rem;
		color: #666;
		padding: 0 10px 10px;
	}

	.fallback {
		max-width: 860px;
	}

	/* 16:9 responsive iframe (fallback + lightbox) */
	.video-frame {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 9;
		background: #000;
		border: 1px solid #000;
	}
	.video-frame iframe {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		border: 0;
	}

	/* Lightbox */
	.lightbox {
		position: fixed;
		inset: 0;
		z-index: 2000;
		background: rgba(0, 0, 0, 0.82);
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px;
	}
	.lightbox-inner {
		width: min(960px, 96vw);
	}
	.lightbox-close {
		display: block;
		margin: 0 0 8px auto;
		background: #fff;
		border: 1px solid #000;
		color: #000;
		font-size: 0.9rem;
		font-weight: 700;
		padding: 4px 10px;
		cursor: pointer;
	}
	.lightbox-title {
		color: #fff;
		font-size: 0.95rem;
		margin: 10px 2px 0;
	}

	@media (max-width: 750px) {
		.videos-title {
			font-size: 2rem;
		}
	}
</style>
