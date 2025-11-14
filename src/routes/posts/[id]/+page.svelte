<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import PageLayout from '$components/PageLayout.svelte';
	import { loadPosts, getPostById, formatDate, getProjectColor } from '$lib/posts.js';

	// Get post ID from URL
	$: postId = $page.params.id;
	
	// Load posts and find the specific post
	let allPosts = [];
	let post = null;
	
	onMount(async () => {
		// Load all posts from the Git-based API
		allPosts = await loadPosts();
		post = getPostById(allPosts, postId);
		
		console.log('Post ID:', postId, 'Type:', typeof postId, 'All Posts:', allPosts.length, 'Found Post:', post ? post.title : 'Not found');
		if (allPosts.length > 0) {
			console.log('Available post IDs:', allPosts.map(p => ({ id: p.id, title: p.title })));
		}
	});

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
							<div class="content-image">
								<img src={post.image} alt={post.title} />
							</div>
							<div class="content-details">
								<h3 class="content-title">{post.title}</h3>
								<p class="content-description">{post.description}</p>
								<div class="content-body">
									{post.content}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Navigation -->
			<nav class="post-navigation">
				<div class="nav-links">
					<!-- Updated link to /blog -->
					<a href="/blog" class="nav-link">← All Posts</a>
					<a href="/" class="nav-link">← Home</a>
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
		transition: background 0.3s ease;
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
		/* Allow line breaks from the original text */
		white-space: pre-wrap;
	}

	.post-navigation {
		margin-top: 2rem;
		padding-top: 1rem;
		border-top: 1px solid #000000;
	}

	.nav-links {
		display: flex;
		gap: 1rem;
	}

	.nav-link {
		font-family: Arial, sans-serif;
		font-size: 1rem;
		color: #000000;
		text-decoration: none;
		padding: 0.5rem 1rem;
		border: 1px solid #000000;
		transition: all 0.3s ease;
	}

	.nav-link:hover {
		background: #000000;
		color: #ffffff;
	}

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