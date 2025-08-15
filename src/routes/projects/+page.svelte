<script>
	import PageLayout from '../../components/PageLayout.svelte';
	import { categoryConfig, getCategoryLabel, getCategoryColor } from '../../lib/categories.js';
	import { posts } from '../../lib/postsStore.js';
	
	// State
	let selectedCategory = 'all';
	let filteredPosts = $posts;
	
	// Get categories from the config
	let categories = Object.values(categoryConfig);
	
	// Filter posts based on selected category
	$: {
		if (selectedCategory === 'all') {
			filteredPosts = $posts;
		} else {
			filteredPosts = $posts.filter(post => post.type === selectedCategory);
		}
	}
	
	function getCategoryName(categoryId) {
		return categoryConfig[categoryId] ? categoryConfig[categoryId].label : 'Unknown';
	}
	
	function formatDate(dateString) {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', { 
			year: 'numeric', 
			month: 'long', 
			day: 'numeric' 
		});
	}
</script>

<PageLayout title="Projects - Rhea Madhogarhia">
	<!-- Header Section -->
	<section class="header-section">
		<div class="header-content">
			<h1 class="page-title">All Projects</h1>
			<p class="page-description">Explore my creative work across different categories</p>
		</div>
	</section>

	<!-- Filter Section -->
	<section class="filter-section">
		<div class="filter-card card">
			<h3 class="filter-title">Filter by Category</h3>
			<div class="filter-buttons">
				<button 
					class="filter-btn {selectedCategory === 'all' ? 'active' : ''}"
					on:click={() => selectedCategory = 'all'}
				>
					All Projects ({$posts.length})
				</button>
				{#each categories as category}
					<button 
						class="filter-btn {selectedCategory === category.id ? 'active' : ''}"
						style="border-color: {category.color};"
						on:click={() => selectedCategory = category.id}
					>
						{category.label} ({$posts.filter(post => post.type === category.id).length})
					</button>
				{/each}
			</div>
		</div>
	</section>

	<!-- Projects Grid -->
	<section class="projects-section">
		{#if filteredPosts.length === 0}
			<div class="no-projects card">
				<h3>No projects found</h3>
				<p>No projects match the selected category.</p>
			</div>
		{:else}
			<div class="projects-grid">
				{#each filteredPosts as post}
					<div class="project-card card" style="border-left-color: {getCategoryColor(post.type)};">
						<div class="project-header">
							<div class="project-meta">
								<span class="project-category" style="color: {getCategoryColor(post.type)};">
									{getCategoryName(post.type)}
								</span>
								<span class="project-date">{formatDate(post.date)}</span>
							</div>
							<h3 class="project-title">{post.title}</h3>
						</div>
						
						<p class="project-excerpt">{post.description}</p>
						
						<div class="project-actions">
							<a href="/posts/{post.id}" class="view-btn">
								View Full Post
							</a>
						</div>
					</div>
				{/each}
			</div>
		{/if}
	</section>

	<!-- Stats Section -->
	<section class="stats-section">
		<div class="stats-card card">
			<h3 class="stats-title">Project Statistics</h3>
			<div class="stats-grid">
				<div class="stat-item">
					<span class="stat-number">{$posts.length}</span>
					<span class="stat-label">Total Projects</span>
				</div>
				{#each categories as category}
					<div class="stat-item">
						<span class="stat-number" style="color: {category.color};">
							{$posts.filter(post => post.type === category.id).length}
						</span>
						<span class="stat-label">{category.label}</span>
					</div>
				{/each}
			</div>
		</div>
	</section>
</PageLayout>

<style>
	/* Header Section */
	.header-section {
		margin-bottom: 40px;
	}

	.header-content {
		text-align: center;
	}

	.page-title {
		font-size: 2.5rem;
		font-weight: bold;
		color: #000000;
		margin-bottom: 15px;
	}

	.page-description {
		font-size: 1.2rem;
		color: #666666;
		margin: 0;
	}

	/* Card Styles */
	.card {
		background: rgba(255, 255, 255, 0.9);
		border: 1px solid #000000;
		padding: 30px;
		margin-bottom: 20px;
	}

	/* Filter Section */
	.filter-section {
		margin-bottom: 40px;
	}

	.filter-title {
		font-size: 1.5rem;
		font-weight: bold;
		color: #000000;
		margin-bottom: 20px;
		text-align: center;
	}

	.filter-buttons {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		justify-content: center;
	}

	.filter-btn {
		background: transparent;
		border: 2px solid #000000;
		padding: 10px 20px;
		font-size: 1rem;
		color: #000000;
		cursor: pointer;
		transition: all 0.3s ease;
		font-family: Arial, sans-serif;
	}

	.filter-btn:hover {
		background: #000000;
		color: #ffffff;
	}

	.filter-btn.active {
		background: #000000;
		color: #ffffff;
	}

	/* Projects Section */
	.projects-section {
		margin-bottom: 40px;
	}

	.projects-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
		gap: 25px;
	}

	.project-card {
		border-left: 4px solid;
		transition: all 0.3s ease;
	}

	.project-card:hover {
		transform: translateY(-5px);
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
	}

	.project-header {
		margin-bottom: 15px;
	}

	.project-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 10px;
	}

	.project-category {
		font-size: 0.9rem;
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.project-date {
		font-size: 0.8rem;
		color: #666666;
	}

	.project-title {
		font-size: 1.4rem;
		font-weight: bold;
		color: #000000;
		margin: 0;
		line-height: 1.3;
	}

	.project-excerpt {
		font-size: 1rem;
		color: #333333;
		line-height: 1.6;
		margin-bottom: 20px;
	}

	.project-actions {
		text-align: right;
	}

	.view-btn {
		display: inline-block;
		background: #000000;
		color: #ffffff;
		padding: 8px 16px;
		text-decoration: none;
		font-size: 0.9rem;
		border: 1px solid #000000;
		transition: all 0.3s ease;
	}

	.view-btn:hover {
		background: #ffffff;
		color: #000000;
	}

	/* No Projects State */
	.no-projects {
		text-align: center;
		padding: 60px 30px;
	}

	.no-projects h3 {
		font-size: 1.5rem;
		color: #000000;
		margin-bottom: 10px;
	}

	.no-projects p {
		color: #666666;
		margin: 0;
	}

	/* Stats Section */
	.stats-section {
		margin-bottom: 40px;
	}

	.stats-title {
		font-size: 1.5rem;
		font-weight: bold;
		color: #000000;
		margin-bottom: 25px;
		text-align: center;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
		gap: 20px;
	}

	.stat-item {
		text-align: center;
		padding: 20px;
		background: #f8f9fa;
		border: 1px solid #000000;
		transition: all 0.3s ease;
	}

	.stat-item:hover {
		background: #e9ecef;
		transform: scale(1.05);
	}

	.stat-number {
		display: block;
		font-size: 2rem;
		font-weight: bold;
		color: #000000;
		margin-bottom: 5px;
	}

	.stat-label {
		font-size: 0.9rem;
		color: #666666;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.page-title {
			font-size: 2rem;
		}

		.page-description {
			font-size: 1rem;
		}

		.filter-buttons {
			flex-direction: column;
			align-items: center;
		}

		.filter-btn {
			width: 100%;
			max-width: 250px;
		}

		.projects-grid {
			grid-template-columns: 1fr;
		}

		.stats-grid {
			grid-template-columns: repeat(2, 1fr);
		}
	}
</style> 