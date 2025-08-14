<script>
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import Navigation from '../../components/Navigation.svelte';
	import { posts } from '$lib/postsStore.js';
	import { getProjectColor, formatDate } from '../../lib/posts.js';

	// Use the posts store
	$: projects = $posts;

	let selectedFilter = 'all';
	let filteredProjects = projects;

	// Filter projects based on selected category
	$: {
		if (selectedFilter === 'all') {
			filteredProjects = projects;
		} else {
			filteredProjects = projects.filter(project => project.type === selectedFilter);
		}
	}



	// Handle filter selection
	function selectFilter(filter) {
		selectedFilter = filter;
	}
</script>

<svelte:head>
	<title>Projects - Personal Portfolio</title>
	<meta name="description" content="Browse all my projects across different categories" />
</svelte:head>

<div class="projects-page">
	<Navigation />
	<div class="container">
		<h1 class="page-title">All Projects</h1>
		
		<!-- Filter Tabs -->
		<div class="filter-tabs">
			<button 
				class="filter-tab {selectedFilter === 'all' ? 'active' : ''}"
				on:click={() => selectFilter('all')}
				style="--tab-color: #000000;"
			>
				All Projects
			</button>
			<button 
				class="filter-tab {selectedFilter === 'writing' ? 'active' : ''}"
				on:click={() => selectFilter('writing')}
				style="--tab-color: #3498db;"
			>
				Notes App
			</button>
			<button 
				class="filter-tab {selectedFilter === 'programming' ? 'active' : ''}"
				on:click={() => selectFilter('programming')}
				style="--tab-color: #2ecc71;"
			>
				Programming
			</button>
			<button 
				class="filter-tab {selectedFilter === 'music' ? 'active' : ''}"
				on:click={() => selectFilter('music')}
				style="--tab-color: #e74c3c;"
			>
				Music
			</button>
			<button 
				class="filter-tab {selectedFilter === 'comedy' ? 'active' : ''}"
				on:click={() => selectFilter('comedy')}
				style="--tab-color: #f39c12;"
			>
				Comedy
			</button>
			<button 
				class="filter-tab {selectedFilter === 'art' ? 'active' : ''}"
				on:click={() => selectFilter('art')}
				style="--tab-color: #9b59b6;"
			>
				Art
			</button>
		</div>

		<!-- Project Count -->
		<div class="project-count">
			Showing {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
			{selectedFilter !== 'all' ? ` in ${selectedFilter}` : ''}
		</div>

		<!-- Projects Grid -->
		<div class="projects-grid">
			{#each filteredProjects as project (project.id)}
				<div 
					class="project-card"
					on:click={() => window.location.href = `/posts/${project.id}`}
					on:keydown={(e) => e.key === 'Enter' && (window.location.href = `/posts/${project.id}`)}
					tabindex="0"
					role="button"
					aria-label="View {project.title}"
				>
					<div class="project-image">
						<img src={project.image} alt={project.title} />
						<div 
							class="project-type-badge"
							style="background-color: {getProjectColor(project.type)};"
						>
							{project.type}
						</div>
					</div>
					<div class="project-content">
						<h3 class="project-title">{project.title}</h3>
						<p class="project-description">{project.description}</p>
						<div class="project-meta">
							<span class="project-date">{formatDate(project.date)}</span>
						</div>
					</div>
				</div>
			{/each}
		</div>

		<!-- No Projects Message -->
		{#if filteredProjects.length === 0}
			<div class="no-projects">
				<p>No projects found in this category.</p>
			</div>
		{/if}
	</div>
</div>

<style>
	.projects-page {
		padding: 2rem 0;
		min-height: 100vh;
	}

	.page-title {
		font-size: 2.5rem;
		margin-bottom: 2rem;
		color: #000000;
		text-align: center;
	}

	.filter-tabs {
		display: flex;
		justify-content: center;
		gap: 1rem;
		margin-bottom: 2rem;
		flex-wrap: wrap;
		border: 1px solid #000000;
		padding: 1rem;
		background: rgba(255, 255, 255, 0.9);
	}

	.filter-tab {
		padding: 0.75rem 1.5rem;
		border: 1px solid #000000;
		background: transparent;
		color: #000000;
		cursor: pointer;
		font-family: Arial, sans-serif;
		font-size: 1rem;
		transition: all 0.3s ease;
	}

	.filter-tab:hover {
		background: rgba(0, 0, 0, 0.1);
	}

	.filter-tab.active {
		background: var(--tab-color);
		color: #ffffff;
	}

	.project-count {
		text-align: center;
		margin-bottom: 2rem;
		color: #000000;
		font-size: 1.1rem;
	}

	.projects-grid {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
		gap: 2rem;
		margin-bottom: 2rem;
	}

	.project-card {
		border: 1px solid #000000;
		background: rgba(255, 255, 255, 0.9);
		overflow: hidden;
		transition: all 0.3s ease;
		cursor: pointer;
	}

	.project-card:hover {
		background: rgba(255, 255, 255, 1);
		transform: translateY(-2px);
	}

	.project-image {
		position: relative;
		height: 200px;
		overflow: hidden;
	}

	.project-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.project-type-badge {
		position: absolute;
		top: 1rem;
		right: 1rem;
		padding: 0.5rem 1rem;
		color: #ffffff;
		font-size: 0.875rem;
		font-weight: bold;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.project-content {
		padding: 1.5rem;
	}

	.project-title {
		font-size: 1.25rem;
		margin-bottom: 0.75rem;
		color: #000000;
	}

	.project-description {
		color: #000000;
		margin-bottom: 1rem;
		line-height: 1.6;
	}

	.project-meta {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.project-date {
		color: #000000;
		font-size: 0.875rem;
	}

	.no-projects {
		text-align: center;
		padding: 3rem;
		color: #000000;
		font-size: 1.2rem;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.projects-grid {
			grid-template-columns: 1fr;
			gap: 1.5rem;
		}

		.filter-tabs {
			flex-direction: column;
			align-items: center;
		}

		.filter-tab {
			width: 100%;
			max-width: 200px;
		}

		.page-title {
			font-size: 2rem;
		}
	}
</style> 