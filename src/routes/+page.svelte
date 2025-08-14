<script>
	import { onMount } from 'svelte';
	import ProjectPane from '../components/ProjectPane.svelte';
	import Navigation from '../components/Navigation.svelte';
	import FilterTabs from '../components/FilterTabs.svelte';
	import { loadPosts, getProjectColor, formatDate } from '../lib/posts.js';

	// Load projects from the posts utility
	let projects = loadPosts();

	let filteredProjects = [...projects];
	let activeFilter = 'all';
	let selectedProject = null;
	// Get all unique month/year combinations that have projects
	$: availableMonths = projects
		.map(project => {
			const date = new Date(project.date);
			return { month: date.getMonth(), year: date.getFullYear() };
		})
		.filter((monthYear, index, array) => 
			array.findIndex(m => m.month === monthYear.month && m.year === monthYear.year) === index
		)
		.sort((a, b) => {
			// Sort by year first, then by month (newest first)
			if (a.year !== b.year) return b.year - a.year;
			return b.month - a.month;
		});

	// Initialize current month/year
	let currentDate = new Date();
	let currentMonth = currentDate.getMonth();
	let currentYear = currentDate.getFullYear();
	let expandedProjects = [];
	let selectedFilter = 'all';
	let initialized = false;

	const projectTypes = [
		{ id: 'all', label: 'All Projects', color: '#ff6b6b' },
		{ id: 'writing', label: 'Writing', color: '#4ecdc4' },
		{ id: 'programming', label: 'Programming', color: '#45b7d1' },
		{ id: 'music', label: 'Music', color: '#96ceb4' },
		{ id: 'comedy', label: 'Comedy', color: '#feca57' },
		{ id: 'art', label: 'Art', color: '#ff9ff3' }
	];

	function filterProjects(type) {
		activeFilter = type;
		if (type === 'all') {
			filteredProjects = [...projects];
		} else {
			filteredProjects = projects.filter(project => project.type === type);
		}
	}

	function selectProject(project) {
		selectedProject = project;
	}

	function closeProject() {
		selectedProject = null;
	}



	function generateCalendarDays() {
		const firstDay = new Date(currentYear, currentMonth, 1);
		const lastDay = new Date(currentYear, currentMonth + 1, 0);
		const startDate = new Date(firstDay);
		startDate.setDate(startDate.getDate() - firstDay.getDay());
		
		const days = [];
		const currentDate = new Date(startDate);
		
		while (currentDate.getMonth() <= currentMonth) {
			const dateStr = currentDate.toISOString().split('T')[0];
			const project = projects.find(p => p.date === dateStr);
			
			days.push({
				date: currentDate.getDate(),
				project: project,
				isPlaceholder: currentDate.getMonth() < currentMonth || currentDate.getMonth() > currentMonth
			});
			
			currentDate.setDate(currentDate.getDate() + 1);
		}
		
		return days;
	}

	// Initialize to the most recent month only once when the component loads
	$: if (availableMonths && availableMonths.length > 0 && !initialized) {
		const mostRecent = availableMonths[0];
		currentMonth = mostRecent.month;
		currentYear = mostRecent.year;
		initialized = true;
	}

	// Find the current month/year index in available months
	$: currentMonthIndex = availableMonths ? availableMonths.findIndex(m => 
		m.month === currentMonth && m.year === currentYear
	) : -1;
	


	function changeMonth(delta) {
		console.log('changeMonth called with delta:', delta);
		console.log('availableMonths:', availableMonths);
		console.log('currentMonthIndex:', currentMonthIndex);
		
		if (!availableMonths || availableMonths.length === 0) {
			console.log('No available months');
			return;
		}
		
		let newIndex = currentMonthIndex + delta;
		console.log('newIndex before wrap:', newIndex);
		
		// Wrap around if needed
		if (newIndex < 0) {
			newIndex = availableMonths.length - 1;
		} else if (newIndex >= availableMonths.length) {
			newIndex = 0;
		}
		
		console.log('newIndex after wrap:', newIndex);
		const newMonthYear = availableMonths[newIndex];
		console.log('newMonthYear:', newMonthYear);
		
		// Update the variables to trigger reactivity
		currentMonth = newMonthYear.month;
		currentYear = newMonthYear.year;
		
		console.log('Updated currentMonth:', currentMonth, 'currentYear:', currentYear);
	}

	function toggleProject(projectId) {
		if (!expandedProjects) {
			expandedProjects = [];
		}
		if (expandedProjects.includes(projectId)) {
			expandedProjects = expandedProjects.filter(id => id !== projectId);
		} else {
			expandedProjects = [...expandedProjects, projectId];
		}
	}



	$: projectsWithDates = projects
		.filter(project => {
			const projectDate = new Date(project.date);
			const monthMatch = projectDate.getMonth() === currentMonth && projectDate.getFullYear() === currentYear;
			const filterMatch = selectedFilter === 'all' || project.type === selectedFilter;
			return monthMatch && filterMatch;
		})
		.sort((a, b) => new Date(a.date) - new Date(b.date));
	
	$: console.log('Reactive update - currentMonth:', currentMonth, 'currentYear:', currentYear, 'projectsWithDates length:', projectsWithDates.length);

	$: currentMonthYear = new Date(currentYear, currentMonth).toLocaleDateString('en-US', { 
		month: 'long', 
		year: 'numeric' 
	});
</script>

<svelte:head>
	<title>rhea web</title>
</svelte:head>

<div class="homepage">
	<Navigation />
	
	<div class="container">
		<header class="hero fade-in">
			<h1 class="title">RAD.COM</h1>
			<p class="subtitle">RheamADhogarhia's public journal</p>
		</header>



		<div class="expandable-list-container">
			<div class="list-header">
				<h2 class="list-title">Creative Projects</h2>
				<div class="list-nav">
					<button 
						class="list-nav-btn" 
						on:click={() => changeMonth(-1)}
						disabled={availableMonths.length <= 1}
					>←</button>
					<span class="current-month">{currentMonthYear}</span>
					<button 
						class="list-nav-btn" 
						on:click={() => changeMonth(1)}
						disabled={availableMonths.length <= 1}
					>→</button>
				</div>
			</div>
			
			<!-- Filter Tabs -->
			<div class="filter-tabs">
				<button 
					class="filter-tab {selectedFilter === 'all' ? 'active' : ''}"
					on:click={() => selectedFilter = 'all'}
					style="--tab-color: #000000;"
				>
					All Projects
				</button>
				<button 
					class="filter-tab {selectedFilter === 'writing' ? 'active' : ''}"
					on:click={() => selectedFilter = 'writing'}
					style="--tab-color: #3498db;"
				>
					Writing
				</button>
				<button 
					class="filter-tab {selectedFilter === 'programming' ? 'active' : ''}"
					on:click={() => selectedFilter = 'programming'}
					style="--tab-color: #2ecc71;"
				>
					Programming
				</button>
				<button 
					class="filter-tab {selectedFilter === 'music' ? 'active' : ''}"
					on:click={() => selectedFilter = 'music'}
					style="--tab-color: #e74c3c;"
				>
					Music
				</button>
				<button 
					class="filter-tab {selectedFilter === 'comedy' ? 'active' : ''}"
					on:click={() => selectedFilter = 'comedy'}
					style="--tab-color: #f39c12;"
				>
					Comedy
				</button>
				<button 
					class="filter-tab {selectedFilter === 'art' ? 'active' : ''}"
					on:click={() => selectedFilter = 'art'}
					style="--tab-color: #9b59b6;"
				>
					Art
				</button>
			</div>
			
			<div class="expandable-list">
				{#each projectsWithDates as project}
					<div class="list-item">
						<div 
							class="list-item-header"
							on:click={() => toggleProject(project.id)}
							on:keydown={(e) => e.key === 'Enter' && toggleProject(project.id)}
							tabindex="0"
							role="button"
							aria-label="Toggle {project.title}"
						>
							<div class="item-info">
								<span class="item-date">{formatDate(project.date)}</span>
								<span class="item-title">{project.title}</span>
								<span class="item-type" style="color: {getProjectColor(project.type)}">{project.type}</span>
							</div>
							<div class="expand-icon {(expandedProjects || []).includes(project.id) ? 'expanded' : ''}">▶</div>
						</div>
						
						{#if (expandedProjects || []).includes(project.id)}
							<div class="list-item-content">
								<div class="content-image">
									<img src={project.image} alt={project.title} />
								</div>
								<div class="content-details">
									<h3 class="content-title">{project.title}</h3>
									<p class="content-description">{project.description}</p>
									<div class="content-body">
										{project.content}
									</div>
									<div class="content-actions">
										<a 
											href="/posts/{project.id}" 
											class="view-post-btn"
											on:click|stopPropagation
										>
											View Full Post →
										</a>
									</div>
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>

		{#if projectsWithDates.length === 0}
			<div class="no-projects">
				<h3>No projects this month</h3>
				<p>Try navigating to a different month or check back later!</p>
			</div>
		{/if}
	</div>

	<!-- Project Modal -->
	{#if selectedProject}
		<div class="modal-overlay" on:click={closeProject}>
			<div class="modal-content" on:click|stopPropagation>
				<button class="close-btn" on:click={closeProject}>×</button>
				<div class="modal-body">
					<img src={selectedProject.image} alt={selectedProject.title} />
					<h2>{selectedProject.title}</h2>
					<p class="project-date">{new Date(selectedProject.date).toLocaleDateString()}</p>
					<p class="project-description">{selectedProject.description}</p>
					<div class="project-content">
						{selectedProject.content}
					</div>
				</div>
			</div>
		</div>
	{/if}
</div>

<style>
	.homepage {
		min-height: 100vh;
		padding: 20px 0;
	}

	.hero {
		text-align: center;
		margin-bottom: 40px;
		padding: 60px 0;
	}

	.title {
		font-size: 3.5rem;
		font-weight: bold;
		color: #000000;
		margin-bottom: 20px;
	}

	.subtitle {
		font-size: 1.3rem;
		color: #636e72;
		max-width: 600px;
		margin: 0 auto;
		line-height: 1.6;
	}

	.expandable-list-container {
		margin-top: 40px;
		background: rgba(255, 255, 255, 0.9);
		border: 2px solid #000000;
		padding: 30px;
	}

	.list-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 20px;
		padding-bottom: 20px;
		border-bottom: 2px solid #000000;
	}

	.filter-tabs {
		display: flex;
		justify-content: center;
		gap: 1rem;
		margin-bottom: 20px;
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

	.list-title {
		font-size: 2rem;
		font-weight: bold;
		color: #000000;
		margin: 0;
	}

	.list-nav {
		display: flex;
		align-items: center;
		gap: 20px;
	}

	.list-nav-btn {
		background: #000000;
		color: white;
		border: none;
		padding: 8px 12px;
		cursor: pointer;
		font-size: 1.2rem;
		font-weight: bold;
		transition: opacity 0.3s ease;
	}

	.list-nav-btn:hover {
		opacity: 0.8;
	}

	.list-nav-btn:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	.list-nav-btn:disabled:hover {
		opacity: 0.3;
	}

	.current-month {
		font-size: 1.2rem;
		font-weight: bold;
		color: #000000;
		min-width: 150px;
		text-align: center;
	}

	.expandable-list {
		display: flex;
		flex-direction: column;
		gap: 5px;
	}

	.list-item {
		border: 1px solid #000000;
		background: rgba(255, 255, 255, 0.8);
		transition: all 0.3s ease;
	}

	.list-item:hover {
		background: rgba(255, 255, 255, 1);
	}

	.list-item-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 15px 20px;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.list-item-header:hover {
		background: rgba(0, 0, 0, 0.05);
	}

	.item-info {
		display: flex;
		align-items: center;
		gap: 20px;
		flex: 1;
	}

	.item-date {
		font-size: 0.9rem;
		color: #636e72;
		min-width: 80px;
	}

	.item-title {
		font-size: 1.1rem;
		font-weight: bold;
		color: #000000;
		flex: 1;
	}

	.item-type {
		font-size: 0.8rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
		min-width: 100px;
		text-align: right;
	}

	.expand-icon {
		font-size: 1rem;
		color: #000000;
		transition: transform 0.3s ease;
		margin-left: 15px;
	}

	.expand-icon.expanded {
		transform: rotate(90deg);
	}

	.list-item-content {
		border-top: 1px solid #000000;
		padding: 20px;
		background: rgba(255, 255, 255, 0.9);
		display: grid;
		grid-template-columns: 300px 1fr;
		gap: 30px;
		align-items: start;
	}

	.content-image {
		width: 100%;
		height: 200px;
		overflow: hidden;
	}

	.content-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.content-details {
		display: flex;
		flex-direction: column;
		gap: 15px;
	}

	.content-title {
		font-size: 1.5rem;
		font-weight: bold;
		color: #000000;
		margin: 0;
	}

	.content-description {
		font-size: 1rem;
		color: #636e72;
		line-height: 1.6;
		margin: 0;
	}

	.content-body {
		font-size: 1rem;
		color: #2d3436;
		line-height: 1.8;
	}

	.content-actions {
		margin-top: 20px;
		padding-top: 20px;
		border-top: 1px solid #000000;
	}

	.view-post-btn {
		display: inline-block;
		background: #000000;
		color: #ffffff;
		text-decoration: none;
		padding: 0.75rem 1.5rem;
		font-family: Arial, sans-serif;
		font-size: 1rem;
		border: 1px solid #000000;
		transition: all 0.3s ease;
	}

	.view-post-btn:hover {
		opacity: 0.8;
	}

	.no-projects {
		text-align: center;
		padding: 60px 20px;
		color: #636e72;
	}

	.no-projects h3 {
		font-size: 1.5rem;
		margin-bottom: 10px;
	}

	/* Modal Styles */
	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 1000;
		backdrop-filter: blur(5px);
	}

	.modal-content {
		background: white;
		max-width: 600px;
		width: 90%;
		max-height: 80vh;
		overflow-y: auto;
		position: relative;
		animation: fadeIn 0.3s ease-out;
		border: 2px solid #000000;
	}

	.close-btn {
		position: absolute;
		top: 15px;
		right: 20px;
		background: none;
		border: none;
		font-size: 2rem;
		cursor: pointer;
		color: #636e72;
		z-index: 1;
	}

	.close-btn:hover {
		color: #ff6b6b;
	}

	.modal-body {
		padding: 30px;
	}

	.modal-body img {
		width: 100%;
		height: 200px;
		object-fit: cover;
		margin-bottom: 20px;
	}

	.modal-body h2 {
		font-size: 1.8rem;
		margin-bottom: 10px;
		color: #2d3436;
	}

	.project-date {
		color: #636e72;
		font-size: 0.9rem;
		margin-bottom: 15px;
	}

	.project-description {
		font-size: 1.1rem;
		color: #2d3436;
		margin-bottom: 20px;
		line-height: 1.6;
	}

	.project-content {
		line-height: 1.8;
		color: #2d3436;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.title {
			font-size: 2.5rem;
		}

		.subtitle {
			font-size: 1.1rem;
		}

		.list-item-content {
			grid-template-columns: 1fr;
			gap: 20px;
		}

		.item-info {
			flex-direction: column;
			align-items: flex-start;
			gap: 10px;
		}

		.item-date, .item-type {
			min-width: auto;
		}

		.hero {
			padding: 40px 0;
		}
	}
</style> 