<script>
	import PageLayout from '../../components/PageLayout.svelte';

	// Featured a cappella performances (these live on other channels, so they
	// don't show up in either uploads feed below — pinned here on purpose).
	const featured = [
		{ id: '3yGZ4tiVzj4', title: 'Featured performance — I' },
		{ id: '7kV89H4PWRE', title: 'Featured performance — II' },
		{ id: 'JPdG4s8XHBc', title: 'Featured performance — III' },
		{ id: 'DapZN5Zf1JQ', title: 'Featured performance — IV' }
	];

	// Each channel's auto-updating "uploads" playlist (UC… id with UC→UU).
	const channels = [
		{
			name: 'rheamad',
			handle: '@rheamad',
			uploads: 'UUEQ38C8Z5AjJCOr_MN-tGuA',
			url: 'https://www.youtube.com/@rheamad'
		},
		{
			name: 'Finders, Keepers',
			handle: '@FindersKeepersRadio',
			uploads: 'UUnYPb-3a_NR3T4Ps2DJf46w',
			url: 'https://www.youtube.com/@FindersKeepersRadio'
		}
	];
</script>

<PageLayout title="Videos - Rhea Madhogarhia">
	<section class="videos-page">
		<header class="videos-head">
			<h1 class="videos-title">Music &amp; Video</h1>
			<p class="videos-sub">
				A running gallery of what I make — pulled live from both channels, newest first.
			</p>
		</header>

		<!-- Featured a cappella -->
		<section class="block">
			<h2 class="block-title">Featured</h2>
			<div class="feature-grid">
				{#each featured as v}
					<div class="video-card">
						<div class="video-frame">
							<iframe
								src={`https://www.youtube-nocookie.com/embed/${v.id}`}
								title={v.title}
								loading="lazy"
								frameborder="0"
								allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
								allowfullscreen
							></iframe>
						</div>
					</div>
				{/each}
			</div>
		</section>

		<!-- Both channels, embedded and auto-updating -->
		{#each channels as ch}
			<section class="block">
				<div class="block-head">
					<h2 class="block-title">{ch.name}</h2>
					<a class="channel-link" href={ch.url} target="_blank" rel="noopener">
						Visit channel →
					</a>
				</div>
				<div class="video-card wide">
					<div class="video-frame">
						<iframe
							src={`https://www.youtube-nocookie.com/embed/videoseries?list=${ch.uploads}`}
							title={`${ch.name} — latest uploads`}
							loading="lazy"
							frameborder="0"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
							allowfullscreen
						></iframe>
					</div>
					<p class="channel-caption">
						All uploads from {ch.handle} — use the playlist button inside the player to browse the full list.
					</p>
				</div>
			</section>
		{/each}
	</section>
</PageLayout>

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
	.block > .block-title {
		border-bottom: 2px solid #000;
		padding-bottom: 8px;
		margin-bottom: 20px;
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

	.feature-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 20px;
	}

	.video-card {
		background: transparent;
		border: 1px solid #000;
		border-radius: 8px;
		overflow: hidden;
	}
	.video-card.wide {
		max-width: 860px;
		margin: 0 auto;
	}

	/* 16:9 responsive iframe */
	.video-frame {
		position: relative;
		width: 100%;
		aspect-ratio: 16 / 9;
		background: #000;
	}
	.video-frame iframe {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		border: 0;
	}

	.channel-caption {
		font-size: 0.85rem;
		color: #555;
		margin: 0;
		padding: 10px 14px;
	}

	@media (max-width: 750px) {
		.videos-title {
			font-size: 2rem;
		}
	}
</style>
