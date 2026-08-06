<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import PageLayout from '$components/PageLayout.svelte';
	import { loadPosts, getPostById, formatDate, getProjectColor } from '$lib/posts.js';
	import { renderMarkdown, isHtmlContent } from '$lib/markdown.js';
	import { redactionClass, APPLY_TO_BODY } from '$lib/redaction.js';
	import { categoryConfig } from '$lib/categories.js';
	import { SITE_NAME } from '$lib/site.js';

	// Build an accurate folder path from the post's category chain + subfolder,
	// e.g. "www.rhea.com / Collecting / Analog Archive".
	function prettyFolder(s) {
		return String(s || '').replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
	}
	function crumbFor(p) {
		if (!p) return '';
		const parts = [];
		let c = categoryConfig[p.type];
		const chain = [];
		while (c) { chain.unshift(c.label); c = c.parent ? categoryConfig[c.parent] : null; }
		parts.push(...(chain.length ? chain : [p.type]));
		if (p.subfolder) parts.push(prettyFolder(p.subfolder));
		return parts.join(' / ');
	}

	// Get post ID from URL
	$: postId = $page.params.id;

	// Hidden categories carried over from the blog filter (?hide=a,b) —
	// Newer/Older paging skips posts in these categories.
	$: hidden = new Set(($page.url.searchParams.get('hide') || '').split(',').filter(Boolean));
	$: hideParam = hidden.size ? `?hide=${[...hidden].join(',')}` : '';

	// View mode for the post body: original document vs rendered vs raw Markdown.
	let view = 'rendered'; // 'doc' | 'rendered' | 'raw'
	let viewedPostId = null;
	// Default to the original document whenever the post has one.
	$: if (post && post.id !== viewedPostId) {
		viewedPostId = post.id;
		view = post.pdf ? 'doc' : 'rendered';
	}

	// The `## Topics` / `## Related` blocks are Obsidian graph plumbing —
	// they're `[[wikilinks]]` the web renderer can't resolve, so they'd show
	// as literal "[[Topic - creative]]". Strip them from the reader view.
	function stripGraphBlocks(md) {
		return String(md).replace(/\n#+\s*(Topics|Related)\s*\n(?:\s*[-*]\s*\[\[.*?\]\].*\n?)+/gi, '\n').trimEnd();
	}
	// If the content is already HTML (older hardcoded posts) pass it through;
	// otherwise treat it as Markdown and render it.
	$: contentIsHtml = post ? isHtmlContent(post.content) : false;
	$: renderedContent = post
		? (contentIsHtml ? post.content : renderMarkdown(stripGraphBlocks(post.content)))
		: '';
	
	// Load posts and find the specific post
	let allPosts = [];
	let post = null;
	let nextPost = null;
	let previousPost = null;
	
	onMount(async () => {
		// Load all posts from the Git-based API
		allPosts = await loadPosts();
		// Note: allPosts is already sorted by date (newest first) by loadPosts()
	});

	// This reactive block will re-run whenever the postId changes (from navigation)
	// or when allPosts is first loaded.
	$: {
		if (allPosts.length > 0 && postId) {
			post = getPostById(allPosts, postId);

			if (post) {
				// Page within the visible set: posts whose category isn't hidden
				// (the current post always counts so paging works from anywhere).
				const navPosts = allPosts.filter(
					(p) => !hidden.has(p.type) || String(p.id) === String(postId)
				);
				const currentIndex = navPosts.findIndex(p => String(p.id) === String(postId));

				// Find next post (newest, so index - 1)
				if (currentIndex > 0) {
					nextPost = navPosts[currentIndex - 1];
				} else {
					nextPost = null; // This is the newest post
				}

				// Find previous post (oldest, so index + 1)
				if (currentIndex < navPosts.length - 1) {
					previousPost = navPosts[currentIndex + 1];
				} else {
					previousPost = null; // This is the oldest post
				}

			} else {
				// Post not found, clear everything
				post = null;
				nextPost = null;
				previousPost = null;
			}
		}
	}

	// Handle back navigation
	function goBack() {
		window.history.back();
	}
</script>

<PageLayout>
	<div class="container">
		{#if allPosts.length > 0 && post}
			<!-- Browser-style bar: back sits at the top, like surfing Rhea's Web -->
			<nav class="reader-bar">
				<button class="reader-nav-btn" on:click={goBack} title="Back">←</button>
				<div class="reader-address">{SITE_NAME} / {crumbFor(post)}</div>
				<a class="reader-nav-btn text" href="/blog" title="All posts">All Posts</a>
			</nav>

			<article class="reader">
				<h1 class="reader-title {redactionClass(post.date)}" class:ai-title={post.aiTitle} title={post.aiTitle ? 'Title drafted with AI assistance' : undefined}>{post.title}</h1>
				{#if post.description}
					<p class="reader-desc" class:ai-desc={post.aiDescription} title={post.aiDescription ? 'Description drafted with AI assistance' : undefined}>{post.description}</p>
				{/if}
				<div class="reader-meta">
					{formatDate(post.date)} · <span style="color: {getProjectColor(post.type)}">{post.type}</span>
					{#if post.form}<span class="reader-form">{post.form}</span>{/if}
				</div>

				<!-- Document / Rendered / Markdown toggle -->
				<div class="view-toggle" role="group" aria-label="View mode">
					{#if post.pdf}
						<button class="view-toggle-btn {view === 'doc' ? 'active' : ''}" on:click={() => (view = 'doc')}>
							Document
						</button>
					{/if}
					<button class="view-toggle-btn {view === 'rendered' ? 'active' : ''}" on:click={() => (view = 'rendered')}>
						Rendered
					</button>
					<button class="view-toggle-btn {view === 'raw' ? 'active' : ''}" on:click={() => (view = 'raw')}>
						Markdown
					</button>
				</div>

				{#if post.images && post.images.length}
					{#each post.images as img, i}
						<img class="post-image" src={img} alt="{post.title}{post.images.length > 1 ? ` — ${i + 1} of ${post.images.length}` : ''}" loading="lazy" />
					{/each}
				{:else if post.image}
					<img class="post-image" src={post.image} alt={post.title} loading="lazy" />
				{/if}

				{#if post.video}
					{@const vid = (String(post.video).match(/(?:v=|youtu\.be\/|embed\/)([\w-]{6,})/) || [])[1]}
					{#if vid}
						<div class="video-embed">
							<iframe
								src="https://www.youtube.com/embed/{vid}"
								title={post.title}
								allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
								allowfullscreen
							></iframe>
						</div>
					{/if}
				{/if}

				{#if post.link}
					<!-- Live view of the project site, like a window onto the real thing -->
					<div class="site-embed">
						<div class="site-bar">
							<span class="site-dot"></span><span class="site-dot"></span><span class="site-dot"></span>
							<span class="site-url">{post.link.replace(/^https?:\/\//, '')}</span>
							<a class="site-open" href={post.link} target="_blank" rel="noopener noreferrer">Open live ↗</a>
						</div>
						<iframe src={post.link} title="{post.title} (live site)" class="site-frame" loading="lazy"></iframe>
					</div>
				{/if}

				{#if post.doi}
					<p class="pub-links">
						<a href={post.doi} target="_blank" rel="noopener noreferrer">Read the paper on bioRxiv ↗</a>
					</p>
				{/if}

				{#if view === 'doc' && post.pdf}
					<!-- The original, as submitted — real formatting preserved -->
					<div class="pdf-reader">
						<div class="pdf-bar">
							<span class="pdf-name">{post.pdf.split('/').pop()}</span>
							<a class="pdf-download" href={post.pdf} download>Download PDF</a>
						</div>
						<iframe src={post.pdf} title="{post.title} (PDF)" class="pdf-frame"></iframe>
					</div>
				{:else if view === 'raw'}
					<pre class="content-raw">{post.content}</pre>
				{:else}
					<div class="content-body prose {APPLY_TO_BODY ? redactionClass(post.date) : ''}">{@html renderedContent}</div>
				{/if}

				{#if nextPost || previousPost}
					<div class="reader-steps">
						{#if nextPost}
							<a href="/posts/{nextPost.id}{hideParam}">← Newer</a>
						{:else}<span></span>{/if}
						{#if previousPost}
							<a href="/posts/{previousPost.id}{hideParam}">Older →</a>
						{:else}<span></span>{/if}
					</div>
				{/if}
			</article>
		{:else if allPosts.length > 0}
			<!-- Post Not Found -->
			<div class="not-found">
				<h1>Post Not Found</h1>
				<p>The post you're looking for doesn't exist.</p>
				<div class="not-found-links">
					<!-- Updated link to /blog -->
					<a href="/blog" class="btn">Browse All Posts</a>
					<a href="/" class="btn">Go Home</a>
				</div>
			</div>
		{:else}
			<!-- Loading -->
			<div class="not-found">
				<h1>Loading...</h1>
				<p>Please wait while we load the post.</p>
			</div>
		{/if}
	</div>
</PageLayout>

<style>
	/* Browser-style bar at the top of a post */
	.reader-bar {
		display: flex;
		align-items: center;
		gap: 10px;
		border: 2px solid #000;
		background: #d9d9d9;
		padding: 6px 8px;
		margin-bottom: 24px;
	}
	.reader-nav-btn {
		background: #ececec;
		border: 1px solid #000;
		color: #000;
		font-family: Arial, sans-serif;
		font-size: 1rem;
		font-weight: 700;
		line-height: 1;
		padding: 6px 10px;
		cursor: pointer;
		text-decoration: none;
		white-space: nowrap;
	}
	.reader-nav-btn:hover {
		background: #000;
		color: #fff;
	}
	.reader-address {
		flex: 1;
		background: #f2f2f2;
		border: 1px solid #999;
		padding: 6px 12px;
		font-family: 'Courier New', monospace;
		font-size: 0.85rem;
		color: #333;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.reader {
		max-width: 760px;
		margin: 0 auto;
	}
	.reader-title {
		font-size: 2rem;
		font-weight: bold;
		color: #000;
		line-height: 1.2;
		margin: 0 0 0.5rem;
	}
	/* Scanned artifact / artwork — always fits the screen (never taller than
	   the viewport), whole image visible. */
	.post-image {
		display: block;
		max-width: 100%;
		/* Fit within the viewport minus the page header, so a single artifact
		   is fully visible without scrolling. */
		max-height: calc(100vh - 300px);
		width: auto;
		height: auto;
		object-fit: contain;
		border: 1px solid #000;
		margin: 16px auto;
	}

	/* Embedded video */
	.video-embed {
		position: relative;
		width: 100%;
		padding-top: 56.25%;
		border: 2px solid #000;
		background: #000;
		margin: 16px 0;
	}
	.video-embed iframe {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		border: none;
	}
	.pub-links {
		font-size: 0.95rem;
		margin: 16px 0;
	}

	/* Embedded PDF reader */
	.pdf-reader {
		margin-top: 20px;
		border: 2px solid #000;
		background: #fff;
	}
	.pdf-bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 10px;
		padding: 8px 12px;
		background: #111;
		color: #fff;
		font-size: 0.85rem;
	}
	.pdf-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.pdf-download {
		color: #fff;
		text-decoration: underline;
		white-space: nowrap;
	}
	.pdf-frame {
		display: block;
		width: 100%;
		height: 80vh;
		border: none;
	}
	/* Live project-site embed (are.na-style window) */
	.site-embed { margin: 18px 0; border: 1px solid #000; background: #fff; }
	.site-bar {
		display: flex;
		align-items: center;
		gap: 6px;
		padding: 6px 10px;
		background: #ececec;
		border-bottom: 1px solid #000;
		font-size: 0.8rem;
	}
	.site-dot { width: 10px; height: 10px; border-radius: 50%; background: #cfcfcf; }
	.site-url { margin-left: 6px; color: #444; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
	.site-open { margin-left: auto; white-space: nowrap; }
	.site-frame { display: block; width: 100%; height: 68vh; border: none; background: #fff; }

	/* AI-drafted titles: dashed underline, same convention as AIText */
	.reader-title.ai-title {
		text-decoration: underline dashed;
		text-decoration-thickness: 1px;
		text-underline-offset: 3px;
		cursor: help;
	}
	.reader-form {
		font-size: 0.7rem;
		text-transform: uppercase;
		letter-spacing: 0.04em;
		color: #777;
		margin-left: 8px;
		white-space: nowrap;
	}
	.reader-desc { font-size: 0.95rem; color: #333; margin: 0 0 6px; }
	.reader-meta {
		font-size: 0.85rem;
		color: #555;
		margin-bottom: 1.25rem;
	}
	.reader-meta span {
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.4px;
	}
	.reader-steps {
		display: flex;
		justify-content: space-between;
		margin-top: 2.5rem;
		padding-top: 1rem;
		border-top: 1px solid rgba(0, 0, 0, 0.25);
	}
	.reader-steps a {
		color: #000;
		text-decoration: none;
		font-weight: 700;
		font-size: 0.9rem;
	}
	.reader-steps a:hover {
		text-decoration: underline;
	}

	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
	}

	@media (max-width: 620px) {
		.container { padding: 1rem 0.8rem; }
		.reader-title { font-size: 1.45rem; }
		.pdf-frame { height: 70vh; }
	}
	
	.content-body {
		font-size: 1rem;
		color: #000000;
		line-height: 1.6;
		white-space: pre-wrap;
	}

	/* Rendered Markdown: normal flow (not pre-wrapped) with tidy spacing. */
	.content-body.prose {
		white-space: normal;
	}
	.content-body.prose :global(h1),
	.content-body.prose :global(h2),
	.content-body.prose :global(h3),
	.content-body.prose :global(h4) {
		line-height: 1.25;
		margin: 1.4em 0 0.5em;
	}
	.content-body.prose :global(p) {
		margin: 0 0 1em;
	}
	.content-body.prose :global(ul),
	.content-body.prose :global(ol) {
		margin: 0 0 1em;
		padding-left: 1.4em;
	}
	.content-body.prose :global(li) {
		margin: 0.25em 0;
	}
	.content-body.prose :global(a) {
		color: #0645ad;
		text-decoration: underline;
	}
	.content-body.prose :global(blockquote) {
		margin: 0 0 1em;
		padding: 0.2em 0 0.2em 1em;
		border-left: 3px solid #000;
		color: #333;
		font-style: italic;
	}
	.content-body.prose :global(code) {
		background: rgba(0, 0, 0, 0.08);
		padding: 0.1em 0.35em;
		font-size: 0.9em;
	}
	.content-body.prose :global(pre.md-code) {
		background: #1e1e1e;
		color: #f4f4f4;
		padding: 14px 16px;
		overflow-x: auto;
		margin: 0 0 1em;
	}
	.content-body.prose :global(pre.md-code code) {
		background: none;
		padding: 0;
		color: inherit;
	}
	.content-body.prose :global(hr) {
		border: none;
		border-top: 1px solid #ccc;
		margin: 1.6em 0;
	}
	.content-body.prose :global(img) {
		max-width: 100%;
		height: auto;
	}

	/* Rendered / Markdown toggle */
	.view-toggle {
		display: inline-flex;
		border: 1px solid #000;
		overflow: hidden;
		margin: 0 0 1.1rem;
	}
	.view-toggle-btn {
		background: transparent;
		border: none;
		padding: 5px 14px;
		font-size: 0.82rem;
		font-family: Arial, sans-serif;
		color: #000;
		cursor: pointer;
		transition: background 0.2s ease, color 0.2s ease;
	}
	.view-toggle-btn + .view-toggle-btn {
		border-left: 1px solid #000;
	}
	.view-toggle-btn.active {
		background: #000;
		color: #fff;
	}

	/* Raw Markdown view */
	.content-raw {
		font-family: 'SFMono-Regular', Menlo, Consolas, monospace;
		font-size: 0.85rem;
		line-height: 1.55;
		color: #111;
		background: rgba(0, 0, 0, 0.05);
		border: 1px solid rgba(0, 0, 0, 0.25);
		padding: 16px 18px;
		white-space: pre-wrap;
		word-break: break-word;
		margin: 0;
	}

	/* Renamed old nav to footer nav */
	.not-found {
		text-align: center;
		padding: 3rem 1rem;
		font-family: Arial, sans-serif;
	}

	.not-found h1 {
		font-size: 2rem;
		color: #000000;
		margin-bottom: 1rem;
	}

	.not-found p {
		font-size: 1rem;
		color: #666666;
		margin-bottom: 2rem;
	}

	.not-found-links {
		display: flex;
		justify-content: center;
		gap: 1rem;
	}

	.btn {
		font-family: Arial, sans-serif;
		font-size: 1rem;
		color: #000000;
		text-decoration: none;
		padding: 0.75rem 1.5rem;
		border: 1px solid #000000;
		transition: all 0.3s ease;
	}

	.btn:hover {
		background: #000000;
		color: #ffffff;
	}
</style>