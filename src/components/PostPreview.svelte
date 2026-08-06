<script>
	// ONE shared preview for a post, used by the blog grid AND the desktop
	// folder windows so the two can never drift apart. Renders, in order of
	// preference: a cover image (art / PDF first page / video still), a live
	// site embed (are.na style) for link projects, or a text excerpt.
	export let post;

	function excerpt(p, n = 320) {
		const t = String(p.content || '')
			.replace(/<[^>]*>/g, ' ')
			.replace(/\[\[[^\]]*\]\]/g, ' ')
			.replace(/[#>*_`[\]]/g, ' ')
			.replace(/\s+/g, ' ')
			.trim();
		return t.slice(0, n);
	}
</script>

{#if post.thumb || post.image || post.iconImage}
	<div class="pv pv-thumb">
		<img src={post.thumb || post.image || post.iconImage} alt={post.title} loading="lazy" />
	</div>
{:else if post.link}
	<div class="pv pv-site">
		<iframe src={post.link} title={post.title} loading="lazy" scrolling="no" tabindex="-1"></iframe>
	</div>
{:else}
	<div class="pv pv-text">{excerpt(post)}</div>
{/if}

<style>
	.pv { overflow: hidden; background: #fff; position: relative; width: 100%; height: 100%; }
	.pv-thumb { display: flex; align-items: center; justify-content: center; background: #f2f2f2; }
	.pv-thumb img { max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain; }
	.pv-site iframe {
		width: 1100px; height: 800px; border: 0;
		transform: scale(0.3); transform-origin: top left; pointer-events: none;
	}
	.pv-text {
		padding: 10px 12px;
		font-size: 0.72rem;
		line-height: 1.4;
		color: #444;
		background: #fafafa;
	}
</style>
