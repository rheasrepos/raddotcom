<script>
	import { page } from '$app/stores';
	import PageLayout from '$components/PageLayout.svelte';
	import { posts } from '$lib/postsStore.js';
	import { getProjectColor, formatDate, loadPosts } from '$lib/posts.js';
	import { onMount } from 'svelte';

	// Get the post ID from the props
	export let data;
	$: postId = parseInt(data.id);
	
	// Get all posts from the store and find the specific one
	$: allPosts = $posts;
	$: post = allPosts ? allPosts.find(p => p.id === postId) : null;
	
	// Fallback posts if store is empty
	let fallbackPosts = [];
	let fallbackPost = null;
	
	onMount(() => {
		// Always load fallback posts to ensure we have data
		fallbackPosts = loadPosts();
		fallbackPost = fallbackPosts.find(p => p.id === postId);
		console.log('Using fallback posts:', fallbackPosts.length, 'Found post:', fallbackPost);
	});
	
	// Use fallback if store is empty
	$: finalPosts = allPosts && allPosts.length > 0 ? allPosts : fallbackPosts;
	$: finalPost = post || fallbackPost;
	
	// Debug logging
	$: console.log('Post ID:', postId, 'Type:', typeof postId, 'All Posts:', finalPosts, 'Found Post:', finalPost);
	$: if (finalPosts) {
		console.log('Available post IDs:', finalPosts.map(p => ({ id: p.id, title: p.title })));
	}

	// Handle back navigation
	function goBack() {
		window.history.back();
	}
</script>



<PageLayout title="Post Details">
	<div class="container">
		{#if finalPosts && finalPost}
			<!-- Back Button -->
			<button class="back-btn" on:click={goBack}>← Back</button>
			
			<!-- Single Post in Expandable List Format -->
			<div class="expandable-list-container">
				<div class="list-header">
					<h2 class="list-title">{finalPost.title}</h2>
				</div>
				
				<div class="expandable-list">
					<div class="list-item">
						<div class="list-item-header">
							<div class="item-info">
								<span class="item-date">{formatDate(finalPost.date)}</span>
								<span class="item-title">{finalPost.title}</span>
								<span class="item-type" style="color: {getProjectColor(finalPost.type)}">{finalPost.type}</span>
							</div>
							<div class="expand-icon expanded">▶</div>
						</div>
						
						<div class="list-item-content">
							<div class="content-image">
								<img src={finalPost.image} alt={finalPost.title} />
							</div>
							<div class="content-details">
								<h3 class="content-title">{finalPost.title}</h3>
								<p class="content-description">{finalPost.description}</p>
								<div class="content-body">
									{finalPost.content}
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<!-- Navigation -->
			<nav class="post-navigation">
				<div class="nav-links">
					<a href="/projects" class="nav-link">← All Projects</a>
					<a href="/" class="nav-link">← Home</a>
				</div>
			</nav>
		{:else if finalPosts}
			<!-- Post Not Found -->
			<div class="not-found">
				<h1>Post Not Found</h1>
				<p>The post you're looking for doesn't exist.</p>
				<div class="not-found-links">
					<a href="/projects" class="btn">Browse All Projects</a>
					<a href="/" class="btn">Go Home</a>
				</div>
			</div>
		{:else}
			<!-- Loading or Error -->
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
		opacity: 0.8;
	}

	/* Expandable List Styles */
	.expandable-list-container {
		margin: 2rem 0;
	}

	.list-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 2px solid #000000;
	}

	.list-title {
		font-size: 2rem;
		font-weight: bold;
		color: #000000;
		margin: 0;
	}

	.expandable-list {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.list-item {
		border: 1px solid #000000;
		background: rgba(255, 255, 255, 0.9);
		margin-bottom: 0;
	}

	.list-item-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		cursor: pointer;
		background: rgba(255, 255, 255, 0.9);
		transition: all 0.3s ease;
	}

	.list-item-header:hover {
		background: rgba(255, 255, 255, 1);
	}

	.item-info {
		display: flex;
		align-items: center;
		gap: 2rem;
		flex: 1;
	}

	.item-date {
		color: #636e72;
		font-size: 0.9rem;
		min-width: 120px;
	}

	.item-title {
		font-weight: bold;
		color: #000000;
		font-size: 1.1rem;
		flex: 1;
	}

	.item-type {
		font-size: 0.8rem;
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		min-width: 100px;
		text-align: center;
	}

	.expand-icon {
		font-size: 0.8rem;
		color: #000000;
		transition: transform 0.3s ease;
	}

	.expand-icon.expanded {
		transform: rotate(90deg);
	}

	.list-item-content {
		padding: 2rem;
		border-top: 1px solid #000000;
		background: rgba(255, 255, 255, 1);
	}

	.content-image {
		margin-bottom: 2rem;
		text-align: center;
	}

	.content-image img {
		max-width: 100%;
		height: auto;
		border: 1px solid #000000;
	}

	.content-details {
		max-width: 800px;
		margin: 0 auto;
	}

	.content-title {
		font-size: 2rem;
		font-weight: bold;
		color: #000000;
		margin-bottom: 1rem;
		line-height: 1.2;
	}

	.content-description {
		font-size: 1.25rem;
		color: #636e72;
		line-height: 1.6;
		margin-bottom: 2rem;
	}

	.content-body {
		font-size: 1.1rem;
		line-height: 1.8;
		color: #2d3436;
		white-space: pre-line;
	}

	.post-header {
		margin-bottom: 3rem;
		padding-bottom: 2rem;
		border-bottom: 2px solid #000000;
	}

	.post-meta {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.post-date {
		color: #636e72;
		font-size: 1rem;
	}

	.post-type {
		padding: 0.5rem 1rem;
		color: #ffffff;
		font-size: 0.875rem;
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.post-title {
		font-size: 3rem;
		font-weight: bold;
		color: #000000;
		margin-bottom: 1rem;
		line-height: 1.2;
	}

	.post-description {
		font-size: 1.25rem;
		color: #636e72;
		line-height: 1.6;
		max-width: 800px;
	}

	.post-content {
		max-width: 900px;
		margin: 0 auto;
	}

	.post-image {
		margin-bottom: 2rem;
		text-align: center;
	}

	.post-image img {
		max-width: 100%;
		height: auto;
		border: 1px solid #000000;
	}

	.post-body {
		font-size: 1.1rem;
		line-height: 1.8;
		color: #2d3436;
		white-space: pre-line;
	}

	.post-navigation {
		margin-top: 4rem;
		padding-top: 2rem;
		border-top: 2px solid #000000;
	}

	.nav-links {
		display: flex;
		gap: 2rem;
		justify-content: center;
	}

	.nav-link {
		color: #000000;
		text-decoration: none;
		font-weight: bold;
		padding: 0.75rem 1.5rem;
		border: 1px solid #000000;
		transition: all 0.3s ease;
	}

	.nav-link:hover {
		background: #000000;
		color: #ffffff;
	}

	.not-found {
		text-align: center;
		padding: 4rem 2rem;
	}

	.not-found h1 {
		font-size: 2.5rem;
		color: #000000;
		margin-bottom: 1rem;
	}

	.not-found p {
		font-size: 1.2rem;
		color: #636e72;
		margin-bottom: 2rem;
	}

	.not-found-links {
		display: flex;
		gap: 1rem;
		justify-content: center;
	}

	.btn {
		background: #000000;
		color: #ffffff;
		border: 1px solid #000000;
		padding: 0.75rem 1.5rem;
		text-decoration: none;
		font-family: Arial, sans-serif;
		font-size: 1rem;
		transition: all 0.3s ease;
	}

	.btn:hover {
		opacity: 0.8;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.post-title {
			font-size: 2rem;
		}

		.post-description {
			font-size: 1.1rem;
		}

		.nav-links {
			flex-direction: column;
			align-items: center;
		}

		.not-found-links {
			flex-direction: column;
			align-items: center;
		}
	}
</style> 