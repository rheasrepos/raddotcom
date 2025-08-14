<script>
	import { onMount } from 'svelte';
	import ProjectPane from '../components/ProjectPane.svelte';
	import Navigation from '../components/Navigation.svelte';
	import DesktopNavigation from '../components/DesktopNavigation.svelte';
	import FilterTabs from '../components/FilterTabs.svelte';
	import { loadPosts, loadGitPosts, getProjectColor, formatDate } from '$lib/posts.js';
	import { categoryConfig, getCategoryLabel } from '$lib/categories.js';

	// Load projects from the posts utility
	let projects = [];
	
	// Initialize projects safely
	try {
		projects = loadPosts() || [];
	} catch (error) {
		console.warn('Error loading posts:', error);
		projects = [];
	}

	let filteredProjects = [...(projects || [])];
	let activeFilter = 'all';
	// Get all unique month/year combinations that have projects
	$: availableMonths = (projects || [])
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
	let viewMode = 'all';
	let selectedProject = null;
	let folderOpening = false;
	let openingFolder = null;
	let zoomLevel = 1;
	let isDragging = false;
	let dragStart = { x: 0, y: 0 };
	let panOffset = { x: 0, y: 0 };
	let currentTime = new Date().toLocaleTimeString();

	// Load Git posts and update time on mount
	onMount(async () => {
		console.log('Component mounted, projects length:', projects.length);
		
		// Only run in browser
		if (typeof window !== 'undefined') {
			// Load Git-based posts
			try {
				const gitPosts = await loadGitPosts();
				if (gitPosts && gitPosts.length > 0) {
					// Merge Git posts with existing posts
					const allPosts = [...(projects || [])];
					gitPosts.forEach(gitPost => {
						const exists = allPosts.some(post => post.id === gitPost.id);
						if (!exists) {
							allPosts.push(gitPost);
						}
					});
					// Sort by date and update
					projects = allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
					console.log('Updated projects length:', projects.length);
				}
			} catch (error) {
				console.warn('Could not load Git posts:', error);
			}

			// Update time every second
			const timeInterval = setInterval(() => {
				currentTime = new Date().toLocaleTimeString();
			}, 1000);

			// Cleanup on component destroy
			return () => {
				if (timeInterval) {
					clearInterval(timeInterval);
				}
			};
		}
	});

	$: projectTypes = [
		{ id: 'all', label: 'All Projects', color: '#ff6b6b' },
		...Object.values(categoryConfig)
	];

	function filterProjects(type) {
		activeFilter = type;
		if (type === 'all') {
			filteredProjects = [...(projects || [])];
		} else {
			filteredProjects = (projects || []).filter(project => project.type === type);
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
			const project = (projects || []).find(p => p.date === dateStr);
			
			days.push({
				date: currentDate.getDate(),
				project: project,
				isPlaceholder: currentDate.getMonth() < currentMonth || currentDate.getMonth() > currentMonth
			});
			
			currentDate.setDate(currentDate.getDate() + 1);
		}
		
		return days;
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
		const project = (projects || []).find(p => p.id === projectId);
		if (project) {
			selectedProject = project;
		}
	}

	function openMonthFolder(monthYear) {
		folderOpening = true;
		openingFolder = new Date(monthYear.year, monthYear.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
		
		// Simulate folder opening animation
		setTimeout(() => {
			currentMonth = monthYear.month;
			currentYear = monthYear.year;
			viewMode = 'all';
			folderOpening = false;
			openingFolder = null;
		}, 300);
	}

	function openCategoryFolder(category) {
		folderOpening = true;
		openingFolder = categoryConfig[category].label;
		
		// Simulate folder opening animation
		setTimeout(() => {
			selectedFilter = category;
			viewMode = 'categories'; // Stay in categories view instead of switching to 'all'
			folderOpening = false;
			openingFolder = null;
		}, 300);
	}

	function zoomIn() {
		console.log('Zoom in clicked, current level:', zoomLevel);
		zoomLevel = Math.min(zoomLevel + 0.2, 3);
		console.log('New zoom level:', zoomLevel);
		// Force reactivity
		zoomLevel = zoomLevel;
	}

	function zoomOut() {
		console.log('Zoom out clicked, current level:', zoomLevel);
		zoomLevel = Math.max(zoomLevel - 0.2, 1.0); // Prevent zooming out below 100%
		console.log('New zoom level:', zoomLevel);
		// Force reactivity
		zoomLevel = zoomLevel;
	}

	function resetZoom() {
		console.log('Reset zoom clicked');
		zoomLevel = 1;
		panOffset = { x: 0, y: 0 };
		console.log('Reset to zoom level:', zoomLevel);
		// Force reactivity
		zoomLevel = zoomLevel;
	}

	// Reset pan offset when zoom level changes to 1
	$: if (zoomLevel === 1) {
		panOffset = { x: 0, y: 0 };
	}

	function handleMouseDown(event) {
		if (event.button === 0 && zoomLevel > 1) { // Only allow panning when zoomed in
			isDragging = true;
			dragStart = { x: event.clientX - panOffset.x, y: event.clientY - panOffset.y };
		}
	}

	function handleMouseMove(event) {
		if (isDragging && zoomLevel > 1) {
			panOffset = { x: event.clientX - dragStart.x, y: event.clientY - dragStart.y };
		}
	}

	function handleMouseUp() {
		isDragging = false;
	}

	function handleWheel(event) {
		// Handle zoom on Ctrl/Cmd + wheel or trackpad pinch gestures
		if (event.ctrlKey || event.metaKey || Math.abs(event.deltaY) > 50) {
			console.log('Wheel zoom detected:', event.deltaY, 'ctrlKey:', event.ctrlKey, 'metaKey:', event.metaKey);
			event.preventDefault();
			const delta = event.deltaY > 0 ? -0.1 : 0.1;
			const newZoomLevel = Math.max(1.0, Math.min(3, zoomLevel + delta)); // Prevent zooming out below 100%
			zoomLevel = newZoomLevel;
			console.log('Wheel zoom level changed to:', zoomLevel);
		}
		// Don't prevent default for normal scrolling
	}



	$: projectsWithDates = (projects || [])
		.filter(project => {
			if (viewMode === 'folders') {
				const projectDate = new Date(project.date);
				const monthMatch = projectDate.getMonth() === currentMonth && projectDate.getFullYear() === currentYear;
				return monthMatch;
			} else if (viewMode === 'categories') {
				return selectedFilter === 'all' || project.type === selectedFilter;
			} else {
				// All projects view - show all projects when no specific filter is applied
				if (selectedFilter === 'all') {
					const projectDate = new Date(project.date);
					const monthMatch = projectDate.getMonth() === currentMonth && projectDate.getFullYear() === currentYear;
					return monthMatch;
				} else {
					// Show projects filtered by category (when coming from category folder)
					return project.type === selectedFilter;
				}
			}
		})
		.sort((a, b) => new Date(a.date) - new Date(b.date));
	
	$: console.log('Reactive update - currentMonth:', currentMonth, 'currentYear:', currentYear, 'projectsWithDates length:', projectsWithDates.length);
</script>

<svelte:head>
	<title>rhea web</title>
</svelte:head>

<div class="laptop-frame">
	<div class="laptop-screen">
		<!-- Navigation and Controls in the frame bezel -->
		<div class="frame-topbar">
			<div class="topbar-left">
				<span class="user-name">Rhea Madhogarhia</span>
			</div>
			<div class="topbar-center">
				<DesktopNavigation />
			</div>
			<div class="topbar-right">
				<span class="system-time">{currentTime}</span>
			</div>
		</div>

		<div 
			class="homepage"
			class:zoomed={zoomLevel > 1}
			style="transform: scale({zoomLevel}) translate({panOffset.x}px, {panOffset.y}px); transform-origin: center center; transition: transform 0.1s ease;"
			on:mousedown={handleMouseDown}
			on:mousemove={handleMouseMove}
			on:mouseup={handleMouseUp}
			on:wheel={handleWheel}
		>
			
			<div class="container">
		<header class="hero">
			<div class="hero-content">
				<h1 class="title">RAD.COM</h1>
				<p class="subtitle">Rhea Madhogarhia's public journal</p>
			</div>
		</header>

		<!-- Desktop View -->
		<div class="desktop-container">
			<!-- Toolbar -->
			<div class="desktop-toolbar">
				<div class="view-options">
					<button 
						class="view-btn {viewMode === 'all' ? 'active' : ''}"
						on:click={() => viewMode = 'all'}
					>
						All Projects
					</button>
					<button 
						class="view-btn {viewMode === 'folders' ? 'active' : ''}"
						on:click={() => viewMode = 'folders'}
					>
						By Month
					</button>
					<button 
						class="view-btn {viewMode === 'categories' ? 'active' : ''}"
						on:click={() => viewMode = 'categories'}
					>
						By Category
					</button>
				</div>
				
				<div class="filter-controls">
					{#if viewMode === 'folders'}
						<div class="month-nav">
							<button 
								class="nav-btn" 
								on:click={() => changeMonth(-1)}
								disabled={availableMonths.length <= 1}
							>←</button>
							<button 
								class="nav-btn" 
								on:click={() => changeMonth(1)}
								disabled={availableMonths.length <= 1}
							>→</button>
						</div>
					{:else if viewMode === 'categories'}
						<div class="category-filter">
							<button 
								class="cat-btn {selectedFilter === 'all' ? 'active' : ''}"
								on:click={() => selectedFilter = 'all'}
							>
								All
							</button>
							<button 
								class="cat-btn {selectedFilter === 'writing' ? 'active' : ''}"
								on:click={() => selectedFilter = 'writing'}
							>
								Notes App
							</button>
							<button 
								class="cat-btn {selectedFilter === 'programming' ? 'active' : ''}"
								on:click={() => selectedFilter = 'programming'}
							>
								Programming
							</button>
							<button 
								class="cat-btn {selectedFilter === 'music' ? 'active' : ''}"
								on:click={() => selectedFilter = 'music'}
							>
								Music
							</button>
							<button 
								class="cat-btn {selectedFilter === 'comedy' ? 'active' : ''}"
								on:click={() => selectedFilter = 'comedy'}
							>
								Comedy
							</button>
							<button 
								class="cat-btn {selectedFilter === 'art' ? 'active' : ''}"
								on:click={() => selectedFilter = 'art'}
							>
								Art
							</button>
						</div>
					{/if}
					
									<!-- Zoom Controls -->
				<div class="zoom-controls">
					<button class="zoom-btn" on:click={zoomOut} title="Zoom Out">−</button>
					<span class="zoom-level">{Math.round(zoomLevel * 100)}%</span>
					<button class="zoom-btn" on:click={zoomIn} title="Zoom In">+</button>
					<button class="zoom-btn" on:click={resetZoom} title="Reset Zoom">⌂</button>
					<button class="zoom-btn" on:click={() => console.log('Test button clicked, zoomLevel:', zoomLevel)} title="Test">T</button>
				</div>
				</div>
			</div>

			<!-- Desktop Icons -->
			<div class="desktop-icons">
				{#if viewMode === 'all'}
					<!-- All projects as individual icons -->
					{#each projectsWithDates as project}
						<div 
							class="desktop-icon project-icon"
							on:click={() => toggleProject(project.id)}
							on:keydown={(e) => e.key === 'Enter' && toggleProject(project.id)}
							tabindex="0"
							role="button"
							aria-label="Open {project.title}"
						>
							<div class="icon-image">
								<img src={project.image} alt={project.title} />
							</div>
							<div class="icon-label">{project.title}</div>
							<div class="icon-type" style="color: {getProjectColor(project.type)}">{getCategoryLabel(project.type)}</div>
						</div>
					{/each}
				{:else if viewMode === 'folders'}
					<!-- Month folders -->
					{#each availableMonths as monthYear}
						<div 
							class="desktop-icon folder-icon"
							on:click={() => openMonthFolder(monthYear)}
							on:keydown={(e) => e.key === 'Enter' && openMonthFolder(monthYear)}
							tabindex="0"
							role="button"
							aria-label="Open {new Date(monthYear.year, monthYear.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} folder"
						>
							<div class="folder-icon-image">📁</div>
							<div class="icon-label">
								{new Date(monthYear.year, monthYear.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
							</div>
							<div class="folder-count">
								{(projects || []).filter(p => {
									const date = new Date(p.date);
									return date.getMonth() === monthYear.month && date.getFullYear() === monthYear.year;
								}).length} items
							</div>
						</div>
					{/each}
				{:else if viewMode === 'categories'}
					<!-- Category folders -->
					{#each ['writing', 'programming', 'music', 'comedy', 'art'] as category}
						{@const categoryInfo = categoryConfig[category]}
						<div 
							class="desktop-icon folder-icon"
							on:click={() => openCategoryFolder(category)}
							on:keydown={(e) => e.key === 'Enter' && openCategoryFolder(category)}
							tabindex="0"
							role="button"
							aria-label="Open {categoryInfo.label} folder"
						>
							<div class="folder-icon-image" style="color: {categoryInfo.color}">📁</div>
							<div class="icon-label">{categoryInfo.label}</div>
							<div class="folder-count">
								{(projects || []).filter(p => p.type === category).length} items
							</div>
						</div>
					{/each}
				{/if}
			</div>

			<!-- Folder Opening Animation -->
			{#if folderOpening}
				<div class="folder-opening-overlay">
					<div class="folder-opening-content">
						<div class="folder-icon-opening">📁</div>
						<div class="folder-opening-text">Opening {openingFolder}...</div>
						<div class="folder-opening-progress">
							<div class="progress-bar"></div>
						</div>
					</div>
				</div>
			{/if}

			<!-- Project Modal/Window -->
			{#if selectedProject}
				<div class="project-window">
					<div class="window-header">
						<div class="window-title">{selectedProject.title}</div>
						<button class="close-btn" on:click={() => selectedProject = null}>×</button>
					</div>
					<div class="window-content">
						<div class="project-image">
							<img src={selectedProject.image} alt={selectedProject.title} />
						</div>
						<div class="project-details">
							<h3>{selectedProject.title}</h3>
							<p class="project-description">{selectedProject.description}</p>
							<div class="project-body">{selectedProject.content}</div>
							<div class="project-actions">
								<a href="/posts/{selectedProject.id}" class="view-post-btn">View Full Post →</a>
							</div>
						</div>
					</div>
				</div>
			{/if}
		</div>
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
	</div>
	
	<!-- Desktop Stand (moved outside laptop screen) -->
	<div class="desktop-stand">
		<div class="stand-vertical"></div>
		<div class="stand-base"></div>
	</div>
</div>

<style>
	/* Space/Dark Grey Laptop Frame */
	.laptop-frame {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		background: #ff8c42;
		padding: 20px 10px 10px 10px; /* Removed bottom padding */
		position: relative;
		overflow: visible; /* Ensure stand is visible */
	}

	.laptop-screen {
		width: 100%;
		max-width: 1400px;
		height: 85vh;
		background: #ff8c42;
		border: 3px solid #333333;
		border-radius: 6px;
		overflow: hidden; /* Prevent content from overflowing the screen */
		position: relative;
		box-shadow: 
			0 0 0 1px #222222,
			0 10px 25px rgba(0, 0, 0, 0.5),
			inset 0 0 10px rgba(0, 0, 0, 0.2);
	}

	/* Desktop Stand */
	.desktop-stand {
		position: absolute;
		bottom: -74px; /* Position it below the laptop screen, moved 13px up total */
		left: 50%;
		transform: translateX(-50%);
		z-index: 10;
		pointer-events: none;
		display: flex;
		flex-direction: column;
		align-items: center;
		padding-bottom: 20px; /* Add padding to the bottom of the stand */
	}

	.stand-vertical {
		width: 35px;
		height: 85px;
		background: #1a1a1a;
		border: 2px solid #000000;
	}

	.stand-base {
		width: 200px;
		height: 30px;
		background: #1a1a1a;
		border: 2px solid #000000;
		clip-path: polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%);
		margin-top: -3px; /* Slight overlap with vertical part */
	}

	.laptop-screen::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 50px; /* Increased height for navigation */
		background: #333333; /* Solid color instead of gradient */
		border-radius: 3px 3px 0 0;
	}

	/* Frame Top Bar (inside the bezel) */
	.frame-topbar {
		position: absolute;
		top: 0; /* Inside the bezel */
		left: 0;
		right: 0;
		height: 50px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 0 20px;
		z-index: 100;
	}

	.topbar-left {
		display: flex;
		align-items: center;
	}

	.user-name {
		color: #ffffff;
		font-family: Arial, sans-serif;
		font-size: 0.9rem;
		font-weight: bold;
	}

	.topbar-center {
		display: flex;
		align-items: center;
	}

	.topbar-right {
		display: flex;
		align-items: center;
	}

	.system-time {
		color: #ffffff;
		font-family: Arial, sans-serif;
		font-size: 0.8rem;
	}

	.homepage {
		height: 100%;
		padding: 110px 10px 10px 10px; /* Adjusted top padding for larger bezel */
		user-select: none;
		overflow: auto; /* Always allow scrolling */
		cursor: grab; /* Always show grab cursor */
		max-width: 100%;
		max-height: 100%;
	}
	
	.homepage.zoomed {
		cursor: grab; /* Show grab cursor only when zoomed in */
	}
	
	.homepage.zoomed:active {
		cursor: grabbing;
	}

	/* Zoom Controls */
	.zoom-controls {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-left: 20px;
	}

	.zoom-btn {
		padding: 4px 8px;
		border: 1px solid #000000;
		background: transparent;
		color: #ffffff;
		cursor: pointer;
		font-family: Arial, sans-serif;
		font-size: 0.8rem;
		transition: all 0.3s ease;
	}

	.zoom-btn:hover {
		color: #000000;
	}

	.zoom-level {
		font-size: 0.8rem;
		color: #ffffff;
		min-width: 40px;
		text-align: center;
	}



	.hero {
		text-align: center;
		margin-bottom: 40px;
		padding: 40px 0;
		border-bottom: 2px solid #000000;
	}

	.hero-content {
		max-width: 900px;
		margin: 0 auto;
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

	/* Desktop Styles */
	.desktop-container {
		min-height: 70vh;
		position: relative;
	}

	.desktop-toolbar {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 20px;
		background: transparent;
		border: 1px solid #000000;
		margin-bottom: 30px;
	}

	.view-options {
		display: flex;
		gap: 10px;
	}

	.view-btn {
		padding: 8px 16px;
		border: 1px solid #000000;
		background: transparent;
		color: #ffffff;
		cursor: pointer;
		font-family: Arial, sans-serif;
		font-size: 0.9rem;
		transition: all 0.3s ease;
	}

	.view-btn:hover {
		color: #000000;
	}

	.view-btn.active {
		color: #000000;
	}

	.filter-controls {
		display: flex;
		gap: 20px;
	}

	.month-nav, .category-filter {
		display: flex;
		gap: 10px;
		align-items: center;
	}

	.nav-btn, .cat-btn {
		padding: 6px 12px;
		border: 1px solid #000000;
		background: transparent;
		color: #ffffff;
		cursor: pointer;
		font-family: Arial, sans-serif;
		font-size: 0.8rem;
		transition: all 0.3s ease;
	}

	.nav-btn:hover, .cat-btn:hover {
		color: #000000;
	}

	.cat-btn.active {
		color: #000000;
	}

	.desktop-icons {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
		gap: 30px;
		padding: 20px;
		max-width: 1200px;
		margin: 0 auto;
	}

	.desktop-icon {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 8px;
		padding: 15px;
		border: 1px solid transparent;
		cursor: pointer;
		transition: all 0.3s ease;
		text-align: center;
	}

	.desktop-icon:hover {
		border-color: #000000;
		background: rgba(255, 255, 255, 0.9);
	}

	.icon-image {
		width: 60px;
		height: 60px;
		overflow: hidden;
		border: 1px solid #000000;
	}

	.icon-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}

	.folder-icon-image {
		font-size: 60px;
		line-height: 1;
	}

	.icon-label {
		font-size: 0.8rem;
		color: #000000;
		font-weight: bold;
		word-wrap: break-word;
		max-width: 100px;
	}

	.icon-type {
		font-size: 0.7rem;
		color: #636e72;
		text-transform: uppercase;
	}

	.folder-count {
		font-size: 0.7rem;
		color: #636e72;
	}

	/* Project Window */
	.project-window {
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		width: 90%;
		max-width: 800px;
		max-height: 80vh;
		background: #ffffff;
		border: 2px solid #000000;
		z-index: 1000;
		overflow: hidden;
	}

	.window-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 15px 20px;
		background: #000000;
		color: #ffffff;
	}

	.window-title {
		font-weight: bold;
		font-size: 1rem;
	}

	.close-btn {
		background: none;
		border: none;
		color: #ffffff;
		font-size: 1.5rem;
		cursor: pointer;
		padding: 0;
		width: 30px;
		height: 30px;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	.close-btn:hover {
		background: rgba(255, 255, 255, 0.2);
	}

	.window-content {
		padding: 20px;
		max-height: 60vh;
		overflow-y: auto;
	}

	.project-image {
		text-align: center;
		margin-bottom: 20px;
	}

	.project-image img {
		max-width: 100%;
		height: auto;
		border: 1px solid #000000;
	}

	.project-details h3 {
		font-size: 1.5rem;
		color: #000000;
		margin-bottom: 10px;
	}

	.project-description {
		font-size: 1rem;
		color: #636e72;
		margin-bottom: 15px;
		line-height: 1.6;
	}

	.project-body {
		font-size: 0.9rem;
		line-height: 1.7;
		color: #2d3436;
		margin-bottom: 20px;
		white-space: pre-line;
	}

	.project-actions {
		text-align: center;
		padding-top: 20px;
		border-top: 1px solid #000000;
	}

	.view-post-btn {
		display: inline-block;
		background: #000000;
		color: #ffffff;
		text-decoration: none;
		padding: 10px 20px;
		font-family: Arial, sans-serif;
		font-size: 0.9rem;
		border: 1px solid #000000;
		transition: all 0.3s ease;
	}

	.view-post-btn:hover {
		opacity: 0.8;
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

	/* MacBook-style Folder Opening Animation */
	.folder-opening-overlay {
		position: fixed;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		background: rgba(0, 0, 0, 0.8);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 2000;
		animation: fadeIn 0.2s ease-out;
	}

	.folder-opening-content {
		background: rgba(255, 255, 255, 0.95);
		border: 1px solid #000000;
		padding: 40px;
		text-align: center;
		min-width: 300px;
		animation: slideIn 0.3s ease-out;
	}

	.folder-icon-opening {
		font-size: 80px;
		margin-bottom: 20px;
		animation: folderBounce 0.6s ease-in-out;
	}

	.folder-opening-text {
		font-size: 1.2rem;
		color: #000000;
		font-weight: bold;
		margin-bottom: 20px;
		font-family: Arial, sans-serif;
	}

	.folder-opening-progress {
		width: 100%;
		height: 4px;
		background: rgba(0, 0, 0, 0.1);
		border: 1px solid #000000;
		overflow: hidden;
	}

	.progress-bar {
		height: 100%;
		background: #000000;
		width: 0%;
		animation: progressFill 0.3s ease-out forwards;
	}

	/* Animation Keyframes */
	@keyframes fadeIn {
		from {
			opacity: 0;
		}
		to {
			opacity: 1;
		}
	}

	@keyframes slideIn {
		from {
			transform: translateY(-50px);
			opacity: 0;
		}
		to {
			transform: translateY(0);
			opacity: 1;
		}
	}

	@keyframes folderBounce {
		0%, 100% {
			transform: scale(1);
		}
		50% {
			transform: scale(1.1);
		}
	}

	@keyframes progressFill {
		from {
			width: 0%;
		}
		to {
			width: 100%;
		}
	}

	/* Enhanced Desktop Icon Animations */
	.desktop-icon {
		transition: all 0.3s ease;
		position: relative;
	}

	.desktop-icon:hover {
		transform: scale(1.05);
	}

	.desktop-icon:active {
		transform: scale(0.95);
	}

	.folder-icon {
		transition: all 0.3s ease;
	}

	.folder-icon:hover {
		transform: scale(1.1);
	}

	.folder-icon:active {
		transform: scale(0.9);
	}

	/* Smooth transitions for view mode changes */
	.desktop-icons {
		transition: all 0.3s ease;
	}


</style> 