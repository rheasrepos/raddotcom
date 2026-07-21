<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import DesktopNavigation from './DesktopNavigation.svelte';
	import { transitionActions } from '../lib/pageTransition.js';

	// Props

	export let showSearch = false;
	export let searchQuery = '';
	export let onSearchClose = null;

	// State
	let wallpaperColor = '#ff8c42'; // Default orange
	let currentTime = new Date().toLocaleTimeString();
	let isNavigating = false;
	let isContracting = false;
	// Monitor view: shrink this page into the desktop monitor frame
	let framed = false;

	onMount(() => {
		// Load wallpaper color from localStorage
		if (typeof window !== 'undefined') {
			const savedColor = localStorage.getItem('wallpaperColor');
			if (savedColor) {
				wallpaperColor = savedColor;
			}
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
	});

	async function handleNavigation(path) {
		// Don't navigate if already on the target page
		if (path === $page.url.pathname) {
			return;
		}
		
		// Start transition immediately to show overlay
		transitionActions.startTransition($page.url.pathname, path);
		
		if (path.split('?')[0] === '/') {
			// Returning to the desktop: let the monitor contract into place,
			// then swap in the desktop so it lands seamlessly.
			isContracting = true;
			setTimeout(async () => {
				await goto(path);
				setTimeout(() => transitionActions.completeTransition(), 50);
			}, 380);
		} else {
			// Page -> page: both are full-screen, so nothing resizes. Just swap
			// the content between the fixed navs immediately.
			await goto(path);
			transitionActions.completeTransition();
		}
	}

	function closeSearch() {
		if (onSearchClose) {
			onSearchClose();
		}
	}

	// Search lives on the desktop (Spotlight). From a page, go there and open it.
	function goToSearch() {
		handleNavigation('/?spotlight=1');
	}

	function changeWallpaper(color) {
		wallpaperColor = color;
		localStorage.setItem('wallpaperColor', color);
		document.body.style.background = color;
	}
</script>



<div class="laptop-frame" class:navigating={isNavigating} class:contracting={isContracting} class:framed>
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
				<!-- Search stays present on every page so the bar never shifts. -->
				<div class="search-container">
					{#if showSearch}
						<input
							type="text"
							class="search-input"
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
						<button class="search-btn" on:click={goToSearch} title="Search on the desktop">
							<svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<circle cx="11" cy="11" r="8"></circle>
								<path d="m21 21-4.35-4.35"></path>
							</svg>
						</button>
					{/if}
				</div>
				<!-- Toggle the monitor view: shrink any page into the desktop monitor -->
				<button class="monitor-btn" on:click={() => (framed = !framed)} title={framed ? 'Full screen' : 'Monitor view'}>
					{framed ? '⤢' : '⤡'}
				</button>
				<span class="system-time">{currentTime}</span>
			</div>
		</div>

		<div class="page-content">
			<div class="container">
				<slot />
			</div>
		</div>
		
		<!-- Wallpaper Toolbar -->
		<div class="wallpaper-toolbar">
			<div class="toolbar-section">
				<span class="toolbar-label">Wallpaper:</span>
				<div class="color-picker">
					<button 
						class="color-btn {wallpaperColor === '#ff8c42' ? 'active' : ''}"
						style="background: #ff8c42;"
						on:click={() => changeWallpaper('#ff8c42')}
						title="Orange"
					></button>
					<button 
						class="color-btn {wallpaperColor === '#4ecdc4' ? 'active' : ''}"
						style="background: #4ecdc4;"
						on:click={() => changeWallpaper('#4ecdc4')}
						title="Teal"
					></button>
					<button 
						class="color-btn {wallpaperColor === '#45b7d1' ? 'active' : ''}"
						style="background: #45b7d1;"
						on:click={() => changeWallpaper('#45b7d1')}
						title="Blue"
					></button>
					<button 
						class="color-btn {wallpaperColor === '#4caf3f' ? 'active' : ''}"
						style="background: #4caf3f;"
						on:click={() => changeWallpaper('#4caf3f')}
						title="Green"
					></button>
					<button 
						class="color-btn {wallpaperColor === '#feca57' ? 'active' : ''}"
						style="background: #feca57;"
						on:click={() => changeWallpaper('#feca57')}
						title="Yellow"
					></button>
					<button 
						class="color-btn {wallpaperColor === '#9b59b6' ? 'active' : ''}"
						style="background: #9b59b6;"
						on:click={() => changeWallpaper('#9b59b6')}
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
</div>

<style>
	/* Desktop Frame Styles */
	.laptop-frame {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		background: #ff8c42;
		padding: 0;
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
		border-radius: 0;
		box-shadow: none !important;
		transition: all 0.3s ease-out !important;
	}

	/* End-state matches the homepage's resting monitor exactly so there is
	   no size "pop" when the homepage mounts after navigation. */
	.laptop-frame.contracting {
		padding: 10px 10px 0 10px !important;
	}

	.laptop-frame.contracting .laptop-screen {
		max-width: 1080px !important;
		width: 90% !important;
		height: 82vh !important;
		border: 3px solid #333333 !important;
		border-radius: 0;
		box-shadow:
			0 0 0 1px #222222,
			0 10px 25px rgba(0, 0, 0, 0.5),
			inset 0 0 10px rgba(0, 0, 0, 0.2) !important;
		transition: width 0.34s cubic-bezier(0.22, 1, 0.36, 1),
			height 0.34s cubic-bezier(0.22, 1, 0.36, 1),
			max-width 0.34s cubic-bezier(0.22, 1, 0.36, 1) !important;
	}

	.laptop-screen {
		width: 100vw;
		height: 100vh;
		background: #ff8c42;
		border: 4px solid #333333;
		overflow: hidden;
		position: relative;
		box-shadow: none;
		transition: all 0.3s ease-out;
	}

	/* Monitor view — any page inside the resting desktop monitor, matching
	   the homepage's frame (orange surround, bezel, stand). */
	.laptop-frame.framed {
		padding: 10px 10px 0 10px;
	}
	.laptop-frame.framed .laptop-screen {
		max-width: 1080px;
		width: 90%;
		height: 82vh;
		border: 3px solid #333333;
		box-shadow:
			0 0 0 1px #222222,
			0 10px 25px rgba(0, 0, 0, 0.5),
			inset 0 0 10px rgba(0, 0, 0, 0.2);
	}
	.laptop-frame.framed::after {
		/* monitor stand */
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 42px;
		height: 6.6vh;
		background: #1a1a1a;
		border: 2px solid #000000;
		pointer-events: none;
	}

	.monitor-btn {
		background: transparent;
		border: 1px solid #777;
		color: #fff;
		font-size: 0.85rem;
		line-height: 1;
		padding: 3px 7px;
		cursor: pointer;
		margin-right: 8px;
	}
	.monitor-btn:hover {
		background: #555;
	}

	/* Frame Topbar — height/padding match the desktop's bar exactly so the
	   nav bar doesn't snap size when transitioning between them. */
	.frame-topbar {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 50px;
		background: #333333;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 20px;
		z-index: 100;
	}

	.topbar-left, .topbar-right {
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

	.system-time {
		color: #ffffff;
		font-family: Arial, sans-serif;
		font-size: 0.8rem;
	}

	/* Search Container */
	.search-container {
		display: flex;
		align-items: center;
		margin-right: 15px;
	}

	.search-btn {
		background: none;
		border: none;
		color: #ffffff;
		cursor: pointer;
		padding: 4px;
		display: flex;
		align-items: center;
		justify-content: center;
		transition: background 0.2s ease;
	}
	.search-btn:hover {
		background: rgba(255, 255, 255, 0.1);
	}
	.search-icon {
		width: 16px;
		height: 16px;
	}

	.search-input {
		background: rgba(255, 255, 255, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.3);
		color: white;
		font-family: Arial, sans-serif;
		font-size: 0.8rem;
		padding: 4px 8px;
		width: 150px;
		transition: all 0.3s ease;
	}

	.search-input::placeholder {
		color: rgba(255, 255, 255, 0.7);
	}

	.search-input:focus {
		outline: none;
		border-color: rgba(255, 255, 255, 0.5);
		background: rgba(255, 255, 255, 0.15);
	}

	/* Page Content */
	.page-content {
		height: 100%;
		/* FIX: 
		  - Added box-sizing: border-box;
		  - Set padding-top to 50px (40px bar + 10px space)
		  - Set padding-bottom to 45px (35px bar + 10px space)
		*/
		box-sizing: border-box;
		padding: 60px 10px 45px 10px;
		overflow-y: auto; /* Changed to overflow-y */
		overflow-x: hidden;
	}

	.container {
		max-width: 1200px;
		margin: 0 auto;
		padding: 0 20px;
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

	/* Social Media Icons */
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
</style>