<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import PageLayout from '$components/PageLayout.svelte';
	import { loadPosts, getPostById, formatDate, getProjectColor } from '$lib/posts.js';
	import { renderMarkdown, isHtmlContent } from '$lib/markdown.js';

	// Get post ID from URL
	$: postId = $page.params.id;

	// View mode for the post body: rendered vs. raw Markdown source.
	let showRaw = false;

	// If the content is already HTML (older hardcoded posts) pass it through;
	// otherwise treat it as Markdown and render it.
	$: contentIsHtml = post ? isHtmlContent(post.content) : false;
	$: renderedContent = post
		? (contentIsHtml ? post.content : renderMarkdown(post.content))
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
				// Find the index of the current post in the sorted list
				const currentIndex = allPosts.findIndex(p => String(p.id) === String(postId));

				// Find next post (newest, so index - 1)
				if (currentIndex > 0) {
					nextPost = allPosts[currentIndex - 1];
				} else {
					nextPost = null; // This is the newest post
				}

				// Find previous post (oldest, so index + 1)
				if (currentIndex < allPosts.length - 1) {
					previousPost = allPosts[currentIndex + 1];
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
				<div class="reader-address">rheasweb / {post.type}</div>
				<a class="reader-nav-btn text" href="/blog" title="All posts">All Posts</a>
			</nav>

			<article class="reader">
				<h1 class="reader-title" class:ai-title={post.aiTitle} title={post.aiTitle ? 'Title drafted with AI assistance' : undefined}>{post.title}</h1>
				<div class="reader-meta">
					{formatDate(post.date)} · <span style="color: {getProjectColor(post.type)}">{post.type}</span>
					{#if post.form}<span class="reader-form">{post.form}</span>{/if}
				</div>

				<!-- Rendered / raw Markdown toggle -->
				<div class="view-toggle" role="group" aria-label="View mode">
					<button class="view-toggle-btn {showRaw ? '' : 'active'}" on:click={() => (showRaw = false)}>
						Rendered
					</button>
					<button class="view-toggle-btn {showRaw ? 'active' : ''}" on:click={() => (showRaw = true)}>
						Markdown
					</button>
				</div>

				{#if showRaw}
					<pre class="content-raw">{post.content}</pre>
				{:else}
					<div class="content-body prose">{@html renderedContent}</div>
				{/if}

				<!-- Embedded PDF reader for notes that point at a document -->
				{#if post.pdf}
					<div class="pdf-reader">
						<div class="pdf-bar">
							<span class="pdf-name">{post.pdf.split('/').pop()}</span>
							<a class="pdf-download" href={post.pdf} download>Download PDF</a>
						</div>
						<iframe src={post.pdf} title="{post.title} (PDF)" class="pdf-frame"></iframe>
					</div>
				{/if}

				{#if nextPost || previousPost}
					<div class="reader-steps">
						{#if nextPost}
							<a href="/posts/{nextPost.id}">← Newer</a>
						{:else}<span></span>{/if}
						{#if previousPost}
							<a href="/posts/{previousPost.id}">Older →</a>
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
		background: #fff;
		padding: 6px 8px;
		margin-bottom: 24px;
	}
	.reader-nav-btn {
		background: #fff;
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
		color: #444;
		background: rgba(0, 0, 0, 0.07);
		border: 1px solid rgba(0, 0, 0, 0.2);
		border-radius: 4px;
		padding: 1px 6px;
		margin-left: 6px;
		white-space: nowrap;
	}
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