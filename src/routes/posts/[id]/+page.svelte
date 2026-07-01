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
			<!-- Back Button -->
			<button class="back-btn" on:click={goBack}>← Back</button>
			
			<!-- UPDATED: Next/Previous Post Navigation -->
			<nav class="post-navigation">
				<div class="nav-links">
					
					<!-- Next Post Link (Newer) -->
					{#if nextPost}
						<a href="/posts/{nextPost.id}" class="nav-link prev">
							← Newer Post
							<span class="nav-title">{nextPost.title}</span>
						</a>
					{:else}
						<!-- Placeholder to maintain layout -->
						<span class="nav-link-placeholder"></span>
					{/if}

					<!-- Previous Post Link (Older) -->
					{#if previousPost}
						<a href="/posts/{previousPost.id}" class="nav-link next">
							Older Post →
							<span class="nav-title">{previousPost.title}</span>
						</a>
					{:else}
						<!-- Placeholder to maintain layout -->
						<span class="nav-link-placeholder"></span>
					{/if}

				</div>
			</nav>
			
			<!-- Single Post in Expandable List Format -->
			<div class="expandable-list-container">
				<div class="list-header">
					<h2 class="list-title">{post.title}</h2>
				</div>
				
				<div class="expandable-list">
					<div class="list-item">
						<div class="list-item-header">
							<div class="item-info">
								<span class="item-date">{formatDate(post.date)}</span>
								<span class="item-title">{post.title}</span>
								<span class="item-type" style="color: {getProjectColor(post.type)}">{post.type}</span>
							</div>
							<div class="expand-icon expanded">▶</div>
						</div>
						
						<div class="list-item-content">
							<div class="content-details">
								<h3 class="content-title">{post.title}</h3>
								<p class="content-description">{post.description}</p>

								<!-- Rendered / raw Markdown toggle -->
								<div class="view-toggle" role="group" aria-label="View mode">
									<button
										class="view-toggle-btn {showRaw ? '' : 'active'}"
										on:click={() => (showRaw = false)}
									>
										Rendered
									</button>
									<button
										class="view-toggle-btn {showRaw ? 'active' : ''}"
										on:click={() => (showRaw = true)}
									>
										Markdown
									</button>
								</div>

								{#if showRaw}
									<pre class="content-raw">{post.content}</pre>
								{:else}
									<div class="content-body prose">{@html renderedContent}</div>
								{/if}
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Footer Navigation (All Posts / Home) -->
			<nav class="post-navigation-footer">
				<div class="nav-links-footer">
					<!-- Updated link to /blog -->
					<a href="/blog" class="nav-link-footer">← All Posts</a>
					<a href="/" class="nav-link-footer">← Home</a>
				</div>
			</nav>
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
	.back-btn {
		background: #000000;
		color: #ffffff;
		border: 1px solid #000000;
		padding: 0.75rem 1.5rem;
		cursor: pointer;
		font-family: Arial, sans-serif;
		font-size: 1rem;
		margin-bottom: 2rem;
		transition: all 0.3s ease;
	}

	.back-btn:hover {
		background: #ffffff;
		color: #000000;
	}

	.container {
		max-width: 800px;
		margin: 0 auto;
		padding: 2rem;
	}
	
	/* --- STYLES for Next/Prev Nav --- */
	.post-navigation {
		margin-bottom: 2rem;
	}

	.nav-links {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		align-items: flex-start; /* Align tops */
	}

	.nav-link {
		font-family: Arial, sans-serif;
		font-size: 1rem;
		color: #000000;
		text-decoration: none;
		padding: 0.5rem 1rem;
		border: 1px solid #000000;
		transition: all 0.3s ease;
		display: flex;
		flex-direction: column;
		flex-basis: 48%; /* Each link takes up ~half the space */
		line-height: 1.4;
		min-height: 3.5rem; /* Give it a min-height so they align */
	}

	.nav-link:hover {
		background: #000000;
		color: #ffffff;
	}
	
	.nav-link.next {
		text-align: right;
		align-items: flex-end; /* Align text to the right */
	}

	.nav-link.prev {
		text-align: left;
		align-items: flex-start; /* Align text to the left */
	}

	.nav-title {
		font-size: 0.8rem;
		color: #666666;
		margin-top: 4px;
		/* Truncate long titles */
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		max-width: 100%; /* Ensure it doesn't overflow */
	}

	.nav-link:hover .nav-title {
		color: #ffffff;
	}
	
	/* Placeholder styling */
	.nav-link-placeholder {
		flex-basis: 48%;
		visibility: hidden;
		min-height: 3.5rem;
	}
	/* --- End of Nav Styles --- */

	.expandable-list-container {
		margin-bottom: 2rem;
	}

	.list-header {
		margin-bottom: 1rem;
	}

	.list-title {
		font-family: Arial, sans-serif;
		font-size: 1.5rem;
		font-weight: bold;
		color: #000000;
		margin: 0;
	}

	.expandable-list {
		border: 1px solid #000000;
	}

	.list-item {
		border-bottom: 1px solid #000000;
	}

	.list-item:last-child {
		border-bottom: none;
	}

	.list-item-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		cursor: pointer;
		background: #ffffff;
	}

	.list-item-header:hover {
		background: #f5f5f5;
	}

	.item-info {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.item-date {
		font-family: Arial, sans-serif;
		font-size: 0.875rem;
		color: #666666;
	}

	.item-title {
		font-family: Arial, sans-serif;
		font-size: 1.125rem;
		font-weight: bold;
		color: #000000;
	}

	.item-type {
		font-family: Arial, sans-serif;
		font-size: 0.875rem;
		font-weight: bold;
		text-transform: uppercase;
	}

	.expand-icon {
		font-family: Arial, sans-serif;
		font-size: 1rem;
		color: #000000;
		transition: transform 0.3s ease;
	}

	.expand-icon.expanded {
		transform: rotate(90deg);
	}

	.list-item-content {
		padding: 1rem;
		background: #ffffff;
	}

	.content-image {
		margin-bottom: 1rem;
	}

	.content-image img {
		width: 100%;
		height: auto;
		border: 1px solid #000000;
	}

	.content-details {
		font-family: Arial, sans-serif;
	}

	.content-title {
		font-size: 1.25rem;
		font-weight: bold;
		color: #000000;
		margin: 0 0 0.5rem 0;
	}

	.content-description {
		font-size: 1rem;
		color: #666666;
		margin: 0 0 1rem 0;
		line-height: 1.5;
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
	.post-navigation-footer {
		margin-top: 2rem;
		padding-top: 1rem;
		border-top: 1px solid #eee;
	}

	.nav-links-footer {
		display: flex;
		gap: 1rem;
	}

	.nav-link-footer {
		font-family: Arial, sans-serif;
		font-size: 1rem;
		color: #000000;
		text-decoration: none;
		padding: 0.5rem 1rem;
		border: 1px solid #000000;
		transition: all 0.3s ease;
	}

	.nav-link-footer:hover {
		background: #000000;
		color: #ffffff;
	}
	/* --- End of Renaming --- */

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