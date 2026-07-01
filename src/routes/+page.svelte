<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { transitionActions } from '../lib/pageTransition.js';
	import ProjectPane from '../components/ProjectPane.svelte';
	import Navigation from '../components/Navigation.svelte';
	import DesktopNavigation from '../components/DesktopNavigation.svelte';
	import FilterTabs from '../components/FilterTabs.svelte';
	import { loadPosts, getProjectColor, formatDate } from '$lib/posts.js';
	import { categoryConfig, getCategoryLabel } from '$lib/categories.js';
	import QuickLook from '../components/QuickLook.svelte';
	import Spotlight from '../components/Spotlight.svelte';

	// --- NEW: SVG Icon Definitions ---
	const categoryIcons = {
		thesis: `
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M15.2 3H18a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2.8"/>
				<path d="M8 3h8v3H8z"/>
				<line x1="8" y1="12" x2="16" y2="12"/>
				<line x1="8" y1="16" x2="16" y2="16"/>
			</svg>
		`,
		programming: `
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
				<line x1="2" y1="20" x2="22" y2="20"/>
			</svg>
		`,
		comedy: `
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M18 13a6 6 0 0 1-6 5 6 6 0 0 1-6-5h12Z"/>
				<path d="M6 8.8A8.5 8.5 0 0 1 12 5a8.5 8.5 0 0 1 6 3.8"/>
			</svg>
		`,
		music: `
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M9 18V5l12-2v13"/>
				<circle cx="6" cy="18" r="3"/>
				<circle cx="18" cy="16" r="3"/>
			</svg>
		`,
		research: `
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<circle cx="6" cy="15" r="3" />
				<circle cx="18" cy="15" r="3" />
				<path d="M10.5 15H13.5"/>
				<path d="M8.3 13.5A6 6 0 0 1 12 9a6 6 0 0 1 3.7 4.5"/>
			</svg>
		`,
		writing: `
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>
			</svg>
		`,
		art: `
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M7 21h10"/>
				<path d="M12 11l-4.04 4.04a2.83 2.83 0 0 0 4.04 4.04l4.04-4.04"/>
				<path d="M12.01 11.01L15.5 7.5a2.83 2.83 0 0 0-4-4L8 7"/>
				<path d="M3 21h4"/>
			</svg>
		`,
		default: `
			<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
			</svg>
		`
	};
	// --- END SVG Icon Definitions ---

	// Load projects from the Git-based API
	let projects = [];
	let categories = Object.values(categoryConfig); // Get dynamic categories

	let filteredProjects = [...(projects || [])];
	let activeFilter = 'all';
	
	// Get all unique month/year combinations that have projects
	// This will be reactively calculated *after* projects are loaded
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

	// Initialize current month/year with today's date
	let currentDate = new Date();
	let currentMonth = currentDate.getMonth();
	let currentYear = currentDate.getFullYear();
	
	let expandedProjects = [];
	let selectedFilter = 'all';
	let initialized = false;
	let viewMode = 'desktop'; // Default view mode: combined folders + loose files
	let selectedProject = null;
	let modalScrollPosition = 0;
	let folderOpening = false;
	let openingFolder = null;
	let zoomLevel = 1;
	let isDragging = false;
	let wallpaperColor = '#ff8c42'; // Default orange
	let showWallpaperToolbar = false;
	let breadcrumbPath = ['Desktop'];
	let previousView = null;
	let showSearch = false;
	let searchQuery = '';
	let isNavigating = false;
	let isClosingSearch = false;
	let isContracting = false;
	let dragStart = { x: 0, y: 0 };
	let panOffset = { x: 0, y: 0 };
	let currentTime = new Date().toLocaleTimeString();

	// --- Surf zoom, Quick Look (spacebar), Spotlight search ---
	let hoveredProject = null;
	let quickLookItem = null;
	let spotlightOpen = false;

	// "Surf my web" — the monitor SCREEN expands to fill the whole window (go inside).
	let surfing = false;
	function surf() {
		surfing = !surfing;
		zoomLevel = 1;
		panOffset = { x: 0, y: 0 };
	}
	function handleQuickLookOpen(e) {
		quickLookItem = null;
		if (e && e.detail && e.detail.id) toggleProject(e.detail.id);
	}
	function onSpotlightSelect(e) {
		spotlightOpen = false;
		selectProject(e.detail);
	}
	function onWindowKeydown(e) {
		if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
			e.preventDefault();
			spotlightOpen = true;
			return;
		}
		const tag = (e.target && e.target.tagName ? e.target.tagName : '').toLowerCase();
		if (tag === 'input' || tag === 'textarea' || spotlightOpen || selectedProject) return;
		if (e.key === ' ' || e.code === 'Space') {
			e.preventDefault();
			if (quickLookItem) quickLookItem = null;
			else if (hoveredProject) quickLookItem = { kind: 'file', ...hoveredProject };
		} else if (e.key === 'Escape') {
			if (quickLookItem) quickLookItem = null;
		}
	}
	


	// Load posts and update time on mount
	onMount(async () => {
		console.log('Component mounted, loading posts...');

		// Only run in browser
		if (typeof window !== 'undefined') {

			// Load wallpaper color from localStorage
			const savedColor = localStorage.getItem('wallpaperColor');
			if (savedColor) {
				wallpaperColor = savedColor;
			}

			// If we arrived here from a page's search icon, open Spotlight.
			if (window.location.search.includes('spotlight=1')) {
				spotlightOpen = true;
				window.history.replaceState({}, '', '/');
			}

			// Load posts from Git-based API
			try {
				// This line triggers the reactive calculation of availableMonths
				projects = await loadPosts(); 
				console.log('Loaded projects:', projects.length);

				// --- FIX: ---
				// After posts are loaded, set the currentMonth/Year
				// to the *newest available month* from the posts.
				if (availableMonths.length > 0) {
					currentMonth = availableMonths[0].month;
					currentYear = availableMonths[0].year;
				}
				// --- END FIX ---

			} catch (error) {
				console.warn('Error loading posts:', error);
				projects = [];
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

	// Renamed "Rad Stuff" to "Posts"
	$: projectTypes = [
		{ id: 'all', label: 'All Posts', color: '#ff6b6b' },
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
		// Capture current scroll position
		modalScrollPosition = window.scrollY;
		selectedProject = project;
	}

	function closeProject() {
		selectedProject = null;
	}

	function navigateBack() {
		if (previousView) {
			if (previousView.mode === 'folders') {
				viewMode = 'folders';
				currentMonth = previousView.month;
				currentYear = previousView.year;
				breadcrumbPath = ['Desktop'];
			} else if (previousView.mode === 'categories') {
				viewMode = 'categories';
				selectedFilter = previousView.category || 'all';
				breadcrumbPath = ['Desktop'];
			}
			previousView = null;
		}
	}

	async function handleNavigation(path) {
		// Don't navigate if already on the target page
		if (path === $page.url.pathname) {
			return;
		}
		
		// Start transition immediately to show overlay during frame animation
		transitionActions.startTransition($page.url.pathname, path);
		
		isNavigating = true;
		// Let the monitor finish expanding to full-screen, then swap in the
		// page so it lands seamlessly (destination pages mount full-screen too).
		setTimeout(async () => {
			await goto(path);
			isNavigating = false;
			setTimeout(() => {
				transitionActions.completeTransition();
			}, 50);
		}, 380);
	}

	function closeSearch() {
		isClosingSearch = true;
		// Wait for animation to complete before hiding
		setTimeout(() => {
			showSearch = false;
			isClosingSearch = false;
		}, 300);
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
			// Capture current scroll position
			modalScrollPosition = window.scrollY;
			selectedProject = project;
		}
	}

	function openMonthFolder(monthYear) {
		folderOpening = true;
		openingFolder = new Date(monthYear.year, monthYear.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
		
		// Simulate folder opening animation
		setTimeout(() => {
			previousView = { mode: 'folders', month: currentMonth, year: currentYear };
			currentMonth = monthYear.month;
			currentYear = monthYear.year;
			viewMode = 'all';
			breadcrumbPath = ['Desktop', new Date(monthYear.year, monthYear.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })];
			folderOpening = false;
			openingFolder = null;
		}, 300);
	}

	function openCategoryFolder(category) {
		folderOpening = true;
		openingFolder = categoryConfig[category].label;
		
		// Simulate folder opening animation
		setTimeout(() => {
			previousView = { mode: 'categories', category: selectedFilter };
			selectedFilter = category;
			viewMode = 'all'; // Switch to all view to show the filtered projects
			breadcrumbPath = ['Desktop', categoryConfig[category].label];
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
		// Zoom only on Ctrl/Cmd + wheel or trackpad pinch — never plain scroll.
		if (event.ctrlKey || event.metaKey) {
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
			// First apply search filter if there's a search query
			if (searchQuery.trim()) {
				const query = searchQuery.toLowerCase();
				const titleMatch = project.title.toLowerCase().includes(query);
				const descriptionMatch = project.description?.toLowerCase().includes(query) ?? false;
				// Strip HTML tags and search raw content text
				const contentText = project.content ? String(project.content).replace(/<[^>]*>/g, ' ') : '';
				const contentMatch = contentText.toLowerCase().includes(query);
				if (!titleMatch && !descriptionMatch && !contentMatch) {
					return false;
				}
			}

			// This logic was incorrect. It should only filter when inside a folder.
			// The default view (viewMode === 'all' and breadcrumbPath.length === 1)
			// should show all posts.
			if (viewMode === 'all') {
				if (breadcrumbPath.length > 1) {
					// We're inside a folder, so filter accordingly
					if (/\d{4}/.test(breadcrumbPath[1])) {
						// We're in a month folder, show all projects from this month
						const projectDate = new Date(project.date);
						const monthMatch = projectDate.getMonth() === currentMonth && projectDate.getFullYear() === currentYear;
						return monthMatch;
					} else {
						// We're in a category folder, show projects from this category
						return project.type === selectedFilter;
					}
				} else {
					// We're at the root, show all projects
					return true; 
				}
			}

			// Filter for 'By Month' view (which shows folders)
			// This logic seems to be incorrectly placed in the 'projectsWithDates' filter.
			// The 'folders' view iterates over 'availableMonths', not 'projectsWithDates'.
			// We'll rely on the viewMode = 'all' logic above.
			if (viewMode === 'folders') {
				// This block is technically not used by the 'folders' view template,
				// but we'll correct it for robustness anyway.
				const projectDate = new Date(project.date);
				const monthMatch = projectDate.getMonth() === currentMonth && projectDate.getFullYear() === currentYear;
				return monthMatch;
			}
			
			// Filter for 'By Category' view
			if (viewMode === 'categories') {
				// This block is also not used by the 'categories' view template,
				// but it's harmless to leave.
				return selectedFilter === 'all' || project.type === selectedFilter;
			}
			
			return true;
		})
		.sort((a, b) => new Date(a.date) - new Date(b.date));
	
	$: console.log('Reactive update - currentMonth:', currentMonth, 'currentYear:', currentYear, 'projectsWithDates length:', projectsWithDates.length);
</script>



<svelte:window on:keydown={onWindowKeydown} />

<div class="laptop-frame" class:navigating={isNavigating} class:contracting={isContracting} class:surfing={surfing}>
	<!-- Brand sits on the orange desktop, outside the monitor -->
	<div class="desktop-brand">
		<span class="title">RAD.COM</span>
		<span class="subtitle">Rhea Madhogarhia's public journal</span>
	</div>
	<div class="laptop-screen" style="background: {wallpaperColor};">
		<!-- Navigation and Controls in the frame bezel -->
		<div class="frame-topbar">
			<div class="topbar-left">
				<a href="/" class="about-link">Rhea Madhogarhia</a>
			</div>
			<div class="topbar-center">
				<DesktopNavigation on:navigate={({ detail }) => handleNavigation(detail.path)} />
			</div>
			<div class="topbar-right">
				<!-- Search Button and Input -->
				<div class="search-container">
					{#if showSearch}
						<input 
							type="text" 
							class="search-input {isClosingSearch ? 'closing' : ''}" 
							placeholder="Search posts..."
							bind:value={searchQuery}
							on:blur={() => {
								if (!searchQuery.trim()) {
									closeSearch();
								}
							}}
							on:keydown={(e) => {
								if (e.key === 'Escape') {
									closeSearch();
									searchQuery = '';
								}
							}}
						/>
					{:else}
						<button 
							class="search-btn" 
							on:click={() => spotlightOpen = true}
							title="Spotlight search (⌘K)"
						>
							<svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<circle cx="11" cy="11" r="8"></circle>
								<path d="m21 21-4.35-4.35"></path>
							</svg>
						</button>
					{/if}
				</div>
					<span class="system-time">{currentTime}</span>
			</div>
		</div>

		<div
			class="homepage"
			class:zoomed={zoomLevel > 1}
			class:navigating={isNavigating}
			style="--zoom: {zoomLevel}; --label-lines: {zoomLevel >= 1.8 ? 6 : zoomLevel >= 1.4 ? 4 : zoomLevel >= 1.15 ? 3 : 2};"
			on:wheel={handleWheel}
		>
			
			<div class="container">
			<!-- Old-school filter toolbar, above the surf button -->
			<div class="filter-toolbar">
				<span class="tb-label">View:</span>
				<select class="tb-select" bind:value={viewMode} on:change={() => { if (viewMode === 'desktop') breadcrumbPath = ['Desktop']; }}>
					<option value="desktop">Desktop</option>
					<option value="all">All Posts</option>
					<option value="folders">By Month</option>
					<option value="categories">By Category</option>
				</select>
				{#if viewMode === 'folders'}
					<span class="tb-sep"></span>
					<button class="tb-btn" on:click={() => changeMonth(-1)} disabled={availableMonths.length <= 1}>←</button>
					<button class="tb-btn" on:click={() => changeMonth(1)} disabled={availableMonths.length <= 1}>→</button>
				{/if}
				<span class="tb-sep"></span>
				<button class="tb-btn" on:click={zoomOut} title="Zoom Out">−</button>
				<span class="tb-zoom">{Math.round(zoomLevel * 100)}%</span>
				<button class="tb-btn" on:click={zoomIn} title="Zoom In">+</button>
				<button class="tb-btn" on:click={resetZoom} title="Reset Zoom">⌂</button>
			</div>

		<header class="hero">
			<div class="hero-content">
				<button class="surf-btn hero-surf" on:click={surf} title="Zoom into the desktop">
					{surfing ? 'Back out' : "Surf Rhea's Web"}
				</button>
			</div>
		</header>

		<!-- Desktop View -->
		<div class="desktop-container">
			<!-- Breadcrumb only appears once you've drilled into a folder -->
			{#if breadcrumbPath.length > 1 || previousView}
			<div class="breadcrumb-nav">
				{#each breadcrumbPath as path, index}
					<span class="breadcrumb-item">
						{#if index > 0}
							<span class="breadcrumb-separator">/</span>
						{/if}
						{#if index === breadcrumbPath.length - 1}
							<span class="breadcrumb-current">{path}</span>
						{:else}
							<button class="breadcrumb-link" on:click={() => {
								if (index === 0) {
									// Go back to the root view (month folders)
									viewMode = 'folders';
									selectedFilter = 'all';
									breadcrumbPath = ['Desktop'];
									previousView = null;
									// Reset to the first available month
									if (availableMonths && availableMonths.length > 0) {
										currentMonth = availableMonths[0].month;
										currentYear = availableMonths[0].year;
									}
								}
							}}>
								{path}
							</button>
						{/if}
					</span>
				{/each}
				{#if previousView}
					<button class="back-btn" on:click={navigateBack} title="Go Back">
						← Back
					</button>
				{/if}
				{#if breadcrumbPath.length > 1 && !previousView}
					<button class="back-btn" on:click={() => {
						viewMode = 'folders';
						selectedFilter = 'all';
						breadcrumbPath = ['Desktop'];
						// Reset to the first available month
						if (availableMonths && availableMonths.length > 0) {
							currentMonth = availableMonths[0].month;
							currentYear = availableMonths[0].year;
						}
					}} title="Back to Folders">
						← Back to Folders
					</button>
				{/if}
			</div>
			{/if}

			<!-- Desktop Icons -->
			<div class="desktop-icons">
				{#if viewMode === 'desktop'}
					<!-- Music: opens the video gallery (embeds both YouTube channels) -->
					<div
						class="desktop-icon"
						on:click={() => handleNavigation('/videos')}
						on:keydown={(e) => e.key === 'Enter' && handleNavigation('/videos')}
						tabindex="0"
						role="button"
						aria-label="Open Music folder"
					>
						<div class="mac-icon">
							<svg viewBox="0 0 56 46" fill="none" xmlns="http://www.w3.org/2000/svg" class="mac-icon-svg">
								<path d="M0 12 L0 8 Q0 6 2 6 L20 6 L24 12 Z" fill="#d8d8d8" stroke="#999999" stroke-width="1.2"/>
								<rect x="0" y="11" width="56" height="35" rx="3" fill="#e8e8e8" stroke="#999999" stroke-width="1.2"/>
								<path d="M34 20 L34 33" stroke="#333333" stroke-width="2" stroke-linecap="round"/>
								<path d="M34 20 L44 17 L44 30" stroke="#333333" stroke-width="2" stroke-linecap="round" fill="none"/>
								<circle cx="31" cy="33" r="3.2" fill="#333333"/>
								<circle cx="41" cy="30" r="3.2" fill="#333333"/>
							</svg>
						</div>
						<div class="mac-icon-label">Music</div>
					</div>
					<!-- Desktop: category folders + any loose files -->
					{#each categories as category}
						{@const categoryInfo = categoryConfig[category.id]}
						{@const count = (projects || []).filter(p => p.type === category.id).length}
						{#if count > 0}
							<div
								class="desktop-icon"
								on:click={() => openCategoryFolder(category.id)}
								on:keydown={(e) => e.key === 'Enter' && openCategoryFolder(category.id)}
								tabindex="0"
								role="button"
								aria-label="Open {categoryInfo.label} folder"
							>
								<div class="mac-icon">
									{#if categoryInfo.iconImage}
										<img src={categoryInfo.iconImage} alt={categoryInfo.label} class="mac-icon-img" />
									{:else}
										<svg viewBox="0 0 56 46" fill="none" xmlns="http://www.w3.org/2000/svg" class="mac-icon-svg">
											<path d="M0 12 L0 8 Q0 6 2 6 L20 6 L24 12 Z" fill="#d8d8d8" stroke="#999999" stroke-width="1.2"/>
											<rect x="0" y="11" width="56" height="35" rx="3" fill="#e8e8e8" stroke="#999999" stroke-width="1.2"/>
										</svg>
									{/if}
								</div>
								<div class="mac-icon-label">{categoryInfo.label}</div>
							</div>
						{/if}
					{/each}
					<!-- Loose files float directly on the desktop (set loose: true in frontmatter) -->
					{#each (projects || []).filter(p => p.loose === true) as project (project.id)}
						<div
							class="desktop-icon"
							on:click={() => toggleProject(project.id)}
							on:keydown={(e) => e.key === 'Enter' && toggleProject(project.id)}
							on:mouseenter={() => (hoveredProject = project)}
							on:focus={() => (hoveredProject = project)}
							tabindex="0"
							role="button"
							aria-label="Open {project.title}"
						>
							<div class="mac-icon">
								{#if project.iconImage}
									<img src={project.iconImage} alt={project.title} class="mac-icon-img" />
								{:else}
									<svg viewBox="0 0 44 56" fill="none" xmlns="http://www.w3.org/2000/svg" class="mac-icon-svg">
										<path d="M4 0 L30 0 L44 14 L44 54 Q44 56 42 56 L4 56 Q2 56 0 54 L0 2 Q0 0 4 0 Z" fill="#f8f8f8" stroke="#aaaaaa" stroke-width="1.5"/>
										<path d="M30 0 L30 14 L44 14" stroke="#aaaaaa" stroke-width="1.5" fill="none"/>
									</svg>
								{/if}
							</div>
							<div class="mac-icon-label">{project.title}</div>
						</div>
					{/each}
				{:else if viewMode === 'all'}
					<!-- Posts as Mac-style document icons -->
					{#each projectsWithDates as project (project.id)}
						<div
							class="desktop-icon"
							on:click={() => toggleProject(project.id)}
							on:keydown={(e) => e.key === 'Enter' && toggleProject(project.id)}
							on:mouseenter={() => (hoveredProject = project)}
							on:focus={() => (hoveredProject = project)}
							tabindex="0"
							role="button"
							aria-label="Open {project.title}"
						>
							<div class="mac-icon">
								{#if project.iconImage}
									<img src={project.iconImage} alt={project.title} class="mac-icon-img" />
								{:else}
									<svg viewBox="0 0 44 56" fill="none" xmlns="http://www.w3.org/2000/svg" class="mac-icon-svg">
										<path d="M4 0 L30 0 L44 14 L44 54 Q44 56 42 56 L4 56 Q2 56 0 54 L0 2 Q0 0 4 0 Z" fill="#f8f8f8" stroke="#aaaaaa" stroke-width="1.5"/>
										<path d="M30 0 L30 14 L44 14" stroke="#aaaaaa" stroke-width="1.5" fill="none"/>
									</svg>
								{/if}
							</div>
							<div class="mac-icon-label">{project.title}</div>
						</div>
					{/each}
				{:else if viewMode === 'folders'}
					<!-- Month folders as Mac-style folder icons -->
					{#each availableMonths as monthYear}
						{@const label = new Date(monthYear.year, monthYear.month).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
						<div
							class="desktop-icon"
							on:click={() => openMonthFolder(monthYear)}
							on:keydown={(e) => e.key === 'Enter' && openMonthFolder(monthYear)}
							tabindex="0"
							role="button"
							aria-label="Open {label} folder"
						>
							<div class="mac-icon">
								<svg viewBox="0 0 56 46" fill="none" xmlns="http://www.w3.org/2000/svg" class="mac-icon-svg">
									<path d="M0 12 L0 8 Q0 6 2 6 L20 6 L24 12 Z" fill="#d8d8d8" stroke="#999999" stroke-width="1.2"/>
									<rect x="0" y="11" width="56" height="35" rx="3" fill="#e8e8e8" stroke="#999999" stroke-width="1.2"/>
								</svg>
							</div>
							<div class="mac-icon-label">{label}</div>
						</div>
					{/each}
				{:else if viewMode === 'categories'}
					<!-- Category folders as Mac-style folder icons -->
					{#each categories as category}
						{@const categoryInfo = categoryConfig[category.id]}
						<div
							class="desktop-icon"
							on:click={() => openCategoryFolder(category.id)}
							on:keydown={(e) => e.key === 'Enter' && openCategoryFolder(category.id)}
							tabindex="0"
							role="button"
							aria-label="Open {categoryInfo.label} folder"
						>
							<div class="mac-icon">
								{#if categoryInfo.iconImage}
									<img src={categoryInfo.iconImage} alt={categoryInfo.label} class="mac-icon-img" />
								{:else}
									<svg viewBox="0 0 56 46" fill="none" xmlns="http://www.w3.org/2000/svg" class="mac-icon-svg">
										<path d="M0 12 L0 8 Q0 6 2 6 L20 6 L24 12 Z" fill="#d8d8d8" stroke="#999999" stroke-width="1.2"/>
										<rect x="0" y="11" width="56" height="35" rx="3" fill="#e8e8e8" stroke="#999999" stroke-width="1.2"/>
									</svg>
								{/if}
							</div>
							<div class="mac-icon-label">{categoryInfo.label}</div>
						</div>
					{/each}
				{/if}
			</div>

			<!-- Folder Opening Animation -->
			{#if folderOpening}
				<div class="folder-opening-overlay">
					<div class="folder-opening-content">
						<div class="folder-icon-opening">
						<svg viewBox="0 0 56 46" fill="none" xmlns="http://www.w3.org/2000/svg" style="width:84px;height:auto;">
							<path d="M0 12 L0 8 Q0 6 2 6 L20 6 L24 12 Z" fill="#d8d8d8" stroke="#999999" stroke-width="1.2" />
							<rect x="0" y="11" width="56" height="35" rx="3" fill="#e8e8e8" stroke="#999999" stroke-width="1.2" />
						</svg>
					</div>
						<div class="folder-opening-text">Opening {openingFolder}...</div>
						<div class="folder-opening-progress">
							<div class="progress-bar"></div>
						</div>
					</div>
				</div>
			{/if}





		</div>
	</div>
		</div>

		<!-- Project Modal (outside scrollable homepage so it always covers the full screen) -->
		{#if selectedProject}
			<div class="modal-overlay" on:click={closeProject}>
				<div class="modal-content" on:click|stopPropagation>
					<button class="close-btn" on:click={closeProject}>×</button>
					<div class="modal-body">
						{#if selectedProject.image}
							<img src={selectedProject.image} alt={selectedProject.title} />
						{/if}
						<h2>{selectedProject.title}</h2>
						<p class="project-date">{new Date(selectedProject.date).toLocaleDateString()}</p>
						<p class="project-description">{selectedProject.description}</p>
						<div class="project-content">
							{selectedProject.content}
						</div>
						<div class="project-actions">
							<a href="/posts/{selectedProject.id}" class="view-post-btn">View Full Post →</a>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Quick Look (spacebar preview) + Spotlight search -->
		<QuickLook item={quickLookItem} on:close={() => (quickLookItem = null)} on:open={handleQuickLookOpen} />
		{#if spotlightOpen}
			<Spotlight posts={projects} on:select={onSpotlightSelect} on:close={() => (spotlightOpen = false)} />
		{/if}

		<!-- Wallpaper Toolbar -->
		<div class="wallpaper-toolbar">
			<div class="toolbar-section">
				<span class="toolbar-label">Wallpaper:</span>
				<div class="color-picker">
					<button 
						class="color-btn {wallpaperColor === '#ff8c42' ? 'active' : ''}"
						style="background: #ff8c42;"
						on:click={() => {
							wallpaperColor = '#ff8c42';
							localStorage.setItem('wallpaperColor', '#ff8c42');
							document.body.style.background = '#ff8c42';
						}}
						title="Orange"
					></button>
					<button 
						class="color-btn {wallpaperColor === '#4ecdc4' ? 'active' : ''}"
						style="background: #4ecdc4;"
						on:click={() => {
							wallpaperColor = '#4ecdc4';
							localStorage.setItem('wallpaperColor', '#4ecdc4');
							document.body.style.background = '#4ecdc4';
						}}
						title="Teal"
					></button>
					<button 
						class="color-btn {wallpaperColor === '#45b7d1' ? 'active' : ''}"
						style="background: #45b7d1;"
						on:click={() => {
							wallpaperColor = '#45b7d1';
							localStorage.setItem('wallpaperColor', '#45b7d1');
							document.body.style.background = '#45b7d1';
						}}
						title="Blue"
					></button>
					<button 
						class="color-btn {wallpaperColor === '#4caf3f' ? 'active' : ''}"
						style="background: #4caf3f;"
						on:click={() => {
							wallpaperColor = '#4caf3f';
							localStorage.setItem('wallpaperColor', '#4caf3f');
							document.body.style.background = '#4caf3f';
						}}
						title="Green"
					></button>
					<button 
						class="color-btn {wallpaperColor === '#feca57' ? 'active' : ''}"
						style="background: #feca57;"
						on:click={() => {
							wallpaperColor = '#feca57';
							localStorage.setItem('wallpaperColor', '#feca57');
							document.body.style.background = '#feca57';
						}}
						title="Yellow"
					></button>
					<button 
						class="color-btn {wallpaperColor === '#9b59b6' ? 'active' : ''}"
						style="background: #9b59b6;"
						on:click={() => {
							wallpaperColor = '#9b59b6';
							localStorage.setItem('wallpaperColor', '#9b59b6');
							document.body.style.background = '#9b59b6';
						}}
						title="Purple"
					></button>
				</div>
			</div>
			
			<!-- Social Media Icons -->
			<div class="social-icons">
				<a href="https://www.linkedin.com/in/rhea-mad/" target="_blank" rel="noopener noreferrer" class="social-icon" title="LinkedIn">
					<svg viewBox="0 0 24 24" fill="currentColor">
						<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
					</svg>
				</a>
				<a href="https://github.com/rheasrepos" target="_blank" rel="noopener noreferrer" class="social-icon" title="GitHub">
					<svg viewBox="0 0 24 24" fill="currentColor">
						<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
					</svg>
				</a>
				<a href="mailto:rheamad@uchicago.edu" class="social-icon" title="Email">
					<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
						<polyline points="22,6 12,13 2,6"/>
					</svg>
				</a>
				<a href="https://youtube.com/@rheamad" target="_blank" rel="noopener noreferrer" class="social-icon" title="YouTube">
					<svg viewBox="0 0 24 24" fill="currentColor">
						<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
					</svg>
				</a>
			</div>
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
		height: 100vh;
		background: #ff8c42;
		padding: 10px 10px 0 10px;
		position: relative;
		overflow: hidden;
		transition: all 0.3s ease-out;
	}

	.laptop-frame.navigating {
		padding: 0 !important;
		overflow: hidden !important;
		transition: all 0.3s ease-out !important;
	}

	.laptop-frame.navigating .laptop-screen {
		width: 100vw !important;
		height: 100vh !important;
		max-width: none !important;
		border: 4px solid #333333 !important;
		border-radius: 0 !important;
		box-shadow: none !important;
		transition: all 0.34s cubic-bezier(0.22, 1, 0.36, 1) !important;
	}

	/* Surf my web: the monitor screen fills the whole window (go inside the computer) */
	.laptop-frame.surfing {
		padding: 0;
	}
	.laptop-frame.surfing .laptop-screen {
		width: 100vw;
		height: 100vh;
		max-width: none;
		border: none;
		border-radius: 0;
		box-shadow: none;
	}
	.laptop-frame.surfing .desktop-stand {
		display: none;
	}

	.laptop-frame.contracting {
		animation: frameContract 0.45s cubic-bezier(0.22, 1, 0.36, 1) forwards;
	}

	@keyframes frameContract {
		0% {
			transform: scale(1.04);
			opacity: 0.85;
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	.laptop-screen {
		width: 90%;
		max-width: 1080px;
		height: 82vh;
		background: #ff8c42;
		border: 3px solid #333333;
		overflow: hidden; /* Prevent content from overflowing the screen */
		position: relative;
		box-shadow:
			0 0 0 1px #222222,
			0 10px 25px rgba(0, 0, 0, 0.5),
			inset 0 0 10px rgba(0, 0, 0, 0.2);
		transition: width 0.35s ease-out, height 0.35s ease-out, border-radius 0.35s ease-out, max-width 0.35s ease-out;
	}

	/* Desktop Stand — anchored to frame bottom, extends upward */
	.desktop-stand {
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		z-index: 10;
		pointer-events: none;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	/* Sized in vh so the whole stand always fits in the gap BELOW the screen
	   (~9vh) and never pokes up into the screen / bottom toolbar. */
	.stand-vertical {
		width: 42px;
		height: 6.6vh;
		background: #1a1a1a;
		border: 2px solid #000000;
	}

	.stand-base {
		width: 210px;
		height: 1.9vh;
		min-height: 14px;
		background: #1a1a1a;
		border: 2px solid #000000;
		clip-path: polygon(10% 0%, 90% 0%, 100% 100%, 0% 100%);
		margin-top: -2px;
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
		background: #333333; /* Opaque so desktop icons hide behind it, not over it */
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

	.about-link {
		color: #ffffff;
		font-family: Arial, sans-serif;
		font-size: 0.85rem;
		text-decoration: none;
		padding: 4px 8px;
		border: 1px solid transparent;
		transition: all 0.2s ease;
	}

	.about-link:hover {
		border-color: #ffffff;
		background: rgba(255, 255, 255, 0.1);
	}

	.topbar-center {
		display: flex;
		align-items: center;
	}

	.topbar-right {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.surf-btn {
		background: rgba(255, 255, 255, 0.92);
		color: #111;
		border: 1px solid rgba(0, 0, 0, 0.25);
		padding: 4px 10px;
		font-family: Arial, sans-serif;
		font-size: 0.8rem;
		font-weight: 700;
		cursor: pointer;
		white-space: nowrap;
	}
	.surf-btn:hover { background: #ffffff; }

	.system-time {
		color: #ffffff;
		font-family: Arial, sans-serif;
		font-size: 0.8rem;
	}

	/* Social Media Icons in Toolbar */
	.social-icons {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-left: auto;
	}

	.social-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 20px;
		color: #ffffff;
		text-decoration: none;
		transition: all 0.2s ease;
		padding: 2px;
	}

	.social-icon:hover {
		background: rgba(255, 255, 255, 0.1);
		transform: scale(1.1);
	}

	.social-icon svg {
		width: 16px;
		height: 16px;
	}

	/* Search Styles */
	.search-container {
		display: flex;
		align-items: center;
		margin-right: 15px;
		transition: all 0.3s ease-out;
	}

	.search-btn {
		background: none;
		border: none;
		color: #ffffff;
		cursor: pointer;
		padding: 4px;
		transition: all 0.2s ease;
		display: flex;
		align-items: center;
		justify-content: center;
		animation: searchBtnFadeIn 0.3s ease-out;
	}

	@keyframes searchBtnFadeIn {
		from {
			opacity: 0;
			transform: scale(0.8);
		}
		to {
			opacity: 1;
			transform: scale(1);
		}
	}

	.search-btn:hover {
		background: rgba(255, 255, 255, 0.1);
	}

	.search-icon {
		width: 16px;
		height: 16px;
	}

	.search-input {
		background: rgba(255, 255, 255, 0.9);
		border: 1px solid #ffffff;
		color: #000000;
		padding: 4px 8px;
		font-size: 0.8rem;
		font-family: Arial, sans-serif;
		width: 150px;
		outline: none;
		animation: searchExpand 0.3s ease-out;
		transform-origin: right center;
	}

	.search-input.closing {
		animation: searchCollapse 0.3s ease-out forwards;
	}

	@keyframes searchExpand {
		from {
			width: 0;
			opacity: 0;
			transform: scaleX(0);
		}
		to {
			width: 150px;
			opacity: 1;
			transform: scaleX(1);
		}
	}

	@keyframes searchCollapse {
		from {
			width: 150px;
			opacity: 1;
			transform: scaleX(1);
		}
		to {
			width: 0;
			opacity: 0;
			transform: scaleX(0);
		}
	}

	.search-input::placeholder {
		color: #666;
	}

	.search-input:focus {
		border-color: #ffffff;
		background: #ffffff;
	}

	.homepage {
		height: 100%;
		/* FIX: 
		  - Added box-sizing: border-box;
		  - Set padding-bottom to 45px (35px bar + 10px space)
		*/
		box-sizing: border-box;
		padding: 110px 10px 45px 10px; 
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
	/* Old-school retro filter toolbar (sits above the surf button) */
	.filter-toolbar {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 8px;
		width: fit-content;
		max-width: 100%;
		margin: 0 auto 16px;
		padding: 5px 8px;
		background: #c0c0c0;
		border: 2px solid;
		border-color: #ffffff #808080 #808080 #ffffff;
		color: #000000;
		font-size: 0.82rem;
	}
	.tb-label {
		font-weight: 700;
	}
	.tb-select {
		background: #ffffff;
		color: #000;
		border: 2px solid;
		border-color: #808080 #ffffff #ffffff #808080;
		padding: 2px 6px;
		font-size: 0.82rem;
		cursor: pointer;
	}
	.tb-btn {
		background: #c0c0c0;
		color: #000;
		border: 2px solid;
		border-color: #ffffff #808080 #808080 #ffffff;
		padding: 1px 9px;
		font-size: 0.82rem;
		line-height: 1.4;
		cursor: pointer;
	}
	.tb-btn:active {
		border-color: #808080 #ffffff #ffffff #808080;
	}
	.tb-btn:disabled {
		color: #808080;
		cursor: default;
	}
	.tb-zoom {
		min-width: 42px;
		text-align: center;
	}
	.tb-sep {
		width: 0;
		align-self: stretch;
		margin: 0 2px;
		border-left: 1px solid #808080;
		border-right: 1px solid #ffffff;
	}



	.hero {
		text-align: center;
		margin-bottom: 20px;
		padding: 6px 0 14px;
	}

	.hero-content {
		max-width: 900px;
		margin: 0 auto;
	}

	/* Surf button, now living inside the monitor where the brand used to be */
	.surf-btn.hero-surf {
		font-family: 'Akzidenz-Grotesk', 'Akzidenz-Grotesk BQ', 'Helvetica Neue', Helvetica, Arial, sans-serif;
		font-size: 1.05rem;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		padding: 10px 26px;
		border: 2px solid #000000;
		background: #ffffff;
		transition: background 0.12s ease, color 0.12s ease;
	}
	.surf-btn.hero-surf:hover {
		background: #000000;
		color: #ffffff;
	}

	/* RAD.COM brand on the orange desktop, above the monitor */
	.desktop-brand {
		position: absolute;
		top: 1.4vh;
		left: 50%;
		transform: translateX(-50%);
		z-index: 5;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		pointer-events: none;
	}
	.laptop-frame.surfing .desktop-brand,
	.laptop-frame.navigating .desktop-brand {
		display: none;
	}

	.title {
		font-family: 'Akzidenz-Grotesk', 'Akzidenz-Grotesk BQ', 'Helvetica Neue', Helvetica, Arial, sans-serif;
		font-size: clamp(1.4rem, 3.4vh, 2.4rem);
		font-weight: bold;
		letter-spacing: 0.04em;
		color: #1a1a1a;
		line-height: 1;
		margin: 0;
	}

	.subtitle {
		font-family: 'Akzidenz-Grotesk', 'Akzidenz-Grotesk BQ', 'Helvetica Neue', Helvetica, Arial, sans-serif;
		font-size: clamp(0.68rem, 1.4vh, 0.9rem);
		font-weight: 500;
		color: #2a2a2a;
		margin: 4px 0 0;
		line-height: 1.3;
	}

	/* Desktop Styles */
	.desktop-container {
		min-height: 70vh;
		position: relative;
	}


	/* Breadcrumb Navigation */
	.breadcrumb-nav {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 0.9rem;
		font-family: Arial, sans-serif;
	}

	.breadcrumb-item {
		display: flex;
		align-items: center;
	}

	.breadcrumb-separator {
		color: #666;
		margin: 0 4px;
	}

	.breadcrumb-current {
		color: #000000;
		font-weight: bold;
	}

	.breadcrumb-link {
		background: none;
		border: none;
		color: #0066cc;
		cursor: pointer;
		text-decoration: underline;
		font-size: 0.9rem;
		padding: 2px 4px;
		transition: all 0.2s ease;
	}

	.breadcrumb-link:hover {
		background: rgba(0, 102, 204, 0.1);
	}

	.back-btn {
		background: #f0f0f0;
		border: 1px solid #ccc;
		color: #333;
		cursor: pointer;
		padding: 4px 8px;
		font-size: 0.8rem;
		margin-left: 10px;
		transition: all 0.2s ease;
	}

	.back-btn:hover {
		background: #e0e0e0;
		border-color: #999;
	}



	.view-post-btn {
		display: inline-block;
		padding: 8px 16px;
		background: #000000;
		color: #ffffff;
		text-decoration: none;
		border: 1px solid #000000;
		transition: all 0.2s ease;
	}

	.view-post-btn:hover {
		background: #ffffff;
		color: #000000;
	}

	.project-actions {
		margin-top: 15px;
		text-align: center;
	}

	.desktop-icons {
		display: grid;
		/* Icon cell + gap grow with --zoom so zooming enlarges the icons
		   (and reveals more of each title) instead of scaling the desktop. */
		grid-template-columns: repeat(auto-fill, minmax(calc(100px * var(--zoom, 1)), 1fr));
		gap: calc(25px * var(--zoom, 1));
		padding: 20px;
		max-width: 1200px;
		margin: 0 auto;
		transition: gap 0.15s ease;
	}

	.desktop-icon {
		display: flex;
		flex-direction: column;
		align-items: center;
		/* UPDATED: Reduced gap and padding */
		gap: 5px;
		padding: 10px;
		border: 1px solid transparent;
		cursor: pointer;
		transition: all 0.3s ease;
		text-align: center;
	}


	/* Mac-style icon container */
	.mac-icon {
		width: calc(56px * var(--zoom, 1));
		height: calc(56px * var(--zoom, 1));
		display: flex;
		align-items: center;
		justify-content: center;
		flex-shrink: 0;
		transition: width 0.15s ease, height 0.15s ease;
	}

	.mac-icon-svg {
		width: 100%;
		height: 100%;
	}

	.mac-icon-img {
		width: 100%;
		height: 100%;
		object-fit: contain;
	}

	.mac-icon-label {
		/* Font, width and visible line-count all grow with zoom, so more of
		   each title becomes readable the further you zoom in. */
		font-size: calc(0.72rem * var(--zoom, 1));
		color: #ffffff;
		font-family: Arial, sans-serif;
		word-wrap: break-word;
		max-width: calc(80px * var(--zoom, 1));
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: var(--label-lines, 2);
		overflow: hidden;
		text-overflow: ellipsis;
		line-height: 1.3;
		text-align: center;
		background: transparent;
		text-shadow: 0 1px 2px rgba(0, 0, 0, 0.55);
		padding: 1px 3px;
		margin-top: 2px;
		transition: font-size 0.15s ease, max-width 0.15s ease;
	}

	.folder-count {
		font-size: 0.7rem;
		color: #636e72;
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



	/* Modal Styles */
	.modal-overlay {
		position: absolute;
		top: 50px; /* Below the topbar */
		left: 0;
		right: 0;
		bottom: 35px; /* Above the wallpaper toolbar */
		background: rgba(0, 0, 0, 0.4);
		z-index: 500;
		backdrop-filter: blur(5px);
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.modal-content {
		background: white;
		width: 90%;
		max-width: 600px;
		max-height: 70vh;
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
		/* UPDATED: Made font smaller and added truncation */
		font-size: 1rem;
		color: #2d3436;
		margin-bottom: 20px;
		line-height: 1.5;
		display: -webkit-box;
		-webkit-box-orient: vertical;
		-webkit-line-clamp: 3; /* Show 3 lines */
		overflow: hidden;
		text-overflow: ellipsis;
		max-height: calc(1.5em * 3); /* line-height * 3 lines */
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

	/* Wallpaper Toolbar */
	.wallpaper-toolbar {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 35px;
		background: #222222;
		border-top: 1px solid rgba(255, 255, 255, 0.3);
		display: flex;
		align-items: center;
		padding: 0 15px;
		z-index: 1000;
	}

	.toolbar-section {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.toolbar-label {
		color: white;
		font-size: 0.75rem;
		font-family: Arial, sans-serif;
	}

	.color-picker {
		display: flex;
		gap: 5px;
	}

	.color-btn {
		width: 20px;
		height: 20px;
		border: 2px solid transparent;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.color-btn:hover {
		border-color: white;
		transform: scale(1.1);
	}

	.color-btn.active {
		border-color: white;
		box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
	}




</style>