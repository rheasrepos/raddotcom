<script>
	// THE DESKTOP. This file owns the monitor frame, the topbar, the draggable
	// icons, zoom, search and the "View:" modes. The bigger pieces live in
	// their own files:
	//   src/components/desktop/IntroOverlay.svelte     — typewriter landing beat
	//   src/components/desktop/ProjectModal.svelte     — the grey file dialog
	//   src/components/desktop/DesktopWindows.svelte   — Finder windows + dock
	//   src/components/desktop/WallpaperToolbar.svelte — colour picker + socials
	//   src/lib/desktop/layout.js   — icon grid math (where icons sit)
	//   src/lib/desktop/content.js  — what's in which folder, previews, search
	//   src/lib/desktop/windows.js  — open/close/navigate window operations
	import { onMount, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { transitionActions } from '../lib/pageTransition.js';
	import DesktopNavigation from '../components/DesktopNavigation.svelte';
	import ImageViewer from '../components/ImageViewer.svelte';
	import QuickLook from '../components/QuickLook.svelte';
	import Spotlight from '../components/Spotlight.svelte';
	import IntroOverlay from '../components/desktop/IntroOverlay.svelte';
	import ProjectModal from '../components/desktop/ProjectModal.svelte';
	import DesktopWindows from '../components/desktop/DesktopWindows.svelte';
	import WallpaperToolbar from '../components/desktop/WallpaperToolbar.svelte';
	import SyntheticToggle from '../components/SyntheticToggle.svelte';
	import { redactionClass } from '$lib/redaction.js';
	import { loadPosts } from '$lib/posts.js';
	import { categoryConfig } from '$lib/categories.js';
	import { siteName, SITE_TAGLINE } from '$lib/site.js';
	import { spaceFactor, defaultIconPos } from '$lib/desktop/layout.js';
	import { hasPostsDeep } from '$lib/desktop/content.js';
	import { openFolder } from '$lib/desktop/windows.js';

	// Posts arrive from the page `load` function (+page.js), so the desktop
	// renders WITH content immediately — no blank-until-reload flash.
	export let data;
	let projects = (data && data.posts) || [];
	let categories = Object.values(categoryConfig);

	// --- Full-screen zoomable image viewer — set to an image URL to open ---
	let viewerSrc = null;
	let viewerAlt = '';
	function openViewer(src, alt = '') { viewerSrc = src; viewerAlt = alt; }

	// --- Finder-style windows (see DesktopWindows + $lib/desktop/windows.js) ---
	let windows = [];

	// --- Draggable desktop icons (like real Mac desktop objects) ---
	// Saved drag positions. The key is VERSIONED: bump it whenever the default
	// layout changes, so visitors' old saved spots don't keep the old layout alive.
	const ICON_POS_KEY = 'iconPos.v2';
	let iconPos = {};          // id -> {x, y}; persisted in localStorage
	let iconDragging = null;
	let iconMoved = false;
	let iconStart = { mx: 0, my: 0, x: 0, y: 0 };
	let deskW = 1200;          // measured desktop width (bind:clientWidth)
	function iconDown(e, id, pos) {
		iconDragging = id;
		iconMoved = false;
		iconStart = { mx: e.clientX, my: e.clientY, x: pos.x, y: pos.y };
		// capture the pointer so the drag keeps tracking even if the cursor
		// leaves the icon.
		try { e.currentTarget.setPointerCapture(e.pointerId); } catch {}
	}
	function iconMove(e) {
		if (!iconDragging) return;
		const dx = e.clientX - iconStart.mx, dy = e.clientY - iconStart.my;
		if (Math.abs(dx) > 3 || Math.abs(dy) > 3) iconMoved = true;
		iconPos = { ...iconPos, [iconDragging]: { x: Math.max(0, iconStart.x + dx), y: Math.max(0, iconStart.y + dy) } };
	}
	function iconUp() {
		if (iconDragging) {
			try { localStorage.setItem(ICON_POS_KEY, JSON.stringify(iconPos)); } catch {}
			iconDragging = null;
		}
	}
	// Put every dragged folder / floating item back to its default spot.
	function resetIconPositions() {
		iconPos = {};
		try { localStorage.removeItem(ICON_POS_KEY); } catch {}
	}

	// --- What's on the desktop ---
	// Top-level folders: the groups that have content. Referencing `projects`
	// makes Svelte recompute when posts load.
	$: topFolders = projects
		? categories.filter((c) => !categoryConfig[c.id].parent && hasPostsDeep(projects, c.id))
		: [];
	// Free-floating items: notes marked loose, plus Rhea's own ART (type: art).
	// The img* scans of belongings (type: artifacts = "Collected & Kept") pile
	// into a single expandable "hoard" stack so the desktop isn't buried.
	let hoardOpen = false;
	// (before-college art stays in Art / Before College, not loose on the desktop)
	$: looseFloat = projects ? projects.filter((p) => p.loose === true || (p.type === 'art' && p.era !== 'before-college')) : [];
	$: hoardItems = projects ? projects.filter((p) => p.type === 'artifacts') : [];
	// What actually gets laid out: the loose art, then the hoard stack icon,
	// then (only when opened) the hoard's contents fanned out after it.
	$: floatingItems = [
		...looseFloat,
		...(hoardItems.length ? [{ id: '__hoard__', hoard: true, title: `hoard (${hoardItems.length})` }] : []),
		...(hoardOpen ? hoardItems : [])
	];
	function toggleHoard() { hoardOpen = !hoardOpen; }

	// --- View state ---
	let selectedProject = null;   // open file dialog
	let zoomLevel = 1;
	let panOffset = { x: 0, y: 0 };
	let wallpaperColor = '#ff8c42';
	let isNavigating = false;   // monitor expanding to full screen before a page change
	let isContracting = false;
	let currentTime = new Date().toLocaleTimeString();

	// --- Quick Look (spacebar), Spotlight search ---
	let hoveredProject = null;
	let quickLookItem = null;
	let spotlightOpen = false;

	// --- Landing beat: typewriter intro shown once per session ---
	let showIntro = false;
	let typed = '';
	let thisVisitName = '';
	onMount(() => {
		// MOBILE: render the desktop at desktop width, zoomed out to fit the
		// phone screen — you pinch-zoom to look around instead of everything
		// cramming/overlapping at phone width. Restored on leaving the page so
		// blog/posts stay normally responsive.
		const vp = document.querySelector('meta[name="viewport"]');
		const prevVp = vp ? vp.getAttribute('content') : null;
		if (vp && window.innerWidth < 768) vp.setAttribute('content', 'width=1024');

		thisVisitName = siteName();
		if (typeof sessionStorage !== 'undefined' && !sessionStorage.getItem('introSeen')) {
			showIntro = true;
			let i = 0;
			const t = setInterval(() => {
				typed = thisVisitName.slice(0, ++i);
				if (i >= thisVisitName.length) clearInterval(t);
			}, 150);
		}
		return () => { if (vp && prevVp) vp.setAttribute('content', prevVp); };
	});
	function enterSite() {
		showIntro = false;
		try { sessionStorage.setItem('introSeen', '1'); } catch {}
	}

	// --- Full screen: the monitor SCREEN expands to fill the whole window ---
	let surfing = false;
	// FLIP animation: layout jumps to its final state in ONE reflow, then we
	// animate a compositor-only transform from the old position to the new one.
	// Animating width/height instead re-lays-out the entire desktop every frame,
	// which is what made the expand/contract feel choppy.
	async function animateScreenFlip() {
		const screen = document.querySelector('.laptop-screen');
		if (!screen) return;
		const first = screen.getBoundingClientRect();
		await tick();
		const last = screen.getBoundingClientRect();
		if (!last.width || !last.height) return;
		const sx = first.width / last.width;
		const sy = first.height / last.height;
		const dx = first.left + first.width / 2 - (last.left + last.width / 2);
		const dy = first.top + first.height / 2 - (last.top + last.height / 2);
		if (Math.abs(sx - 1) < 0.001 && Math.abs(sy - 1) < 0.001 && !dx && !dy) return;
		screen.animate(
			[{ transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` }, { transform: 'none' }],
			{ duration: 380, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
		);
	}
	function surf() {
		surfing = !surfing;
		zoomLevel = 1;
		panOffset = { x: 0, y: 0 };
		animateScreenFlip();
	}

	// --- Keyboard: ⌘K spotlight, space = Quick Look, Esc ---
	function handleQuickLookOpen(e) {
		quickLookItem = null;
		if (e && e.detail && e.detail.id) toggleProject(e.detail.id);
	}
	function onSpotlightSelect(e) {
		spotlightOpen = false;
		selectedProject = e.detail;
	}
	function onWindowKeydown(e) {
		if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
			e.preventDefault();
			spotlightOpen = true;
			return;
		}
		// Esc exits full screen (unless a modal/search layer is open and wants it)
		if (e.key === 'Escape' && surfing && !spotlightOpen && !quickLookItem && !selectedProject) {
			surf();
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

	// --- Browser-only setup ---
	onMount(async () => {
		if (typeof window === 'undefined') return;
		const savedColor = localStorage.getItem('wallpaperColor');
		if (savedColor) wallpaperColor = savedColor;
		// Restore any dragged desktop icon positions
		try { iconPos = JSON.parse(localStorage.getItem(ICON_POS_KEY) || '{}'); } catch {}

		// If we arrived here from a page's search icon, open Spotlight.
		if (window.location.search.includes('spotlight=1')) {
			spotlightOpen = true;
			window.history.replaceState({}, '', '/');
		}
		// Arriving from a post's breadcrumb (?open=<cat>&sub=<subfolder>):
		// open that folder window on the desktop, then clean the URL.
		const params = new URL(window.location.href).searchParams;
		const openId = params.get('open');
		if (openId) {
			await tick();
			windows = openFolder(windows, openId, params.get('sub') || null);
			window.history.replaceState({}, '', '/');
		}

		// Posts already came from +page.js `load`. Only fetch as a fallback
		// if for some reason none arrived, so the desktop is never blank.
		try {
			if (!projects || projects.length === 0) projects = await loadPosts();
		} catch (error) {
			console.warn('Error loading posts:', error);
			projects = [];
		}

		const timeInterval = setInterval(() => { currentTime = new Date().toLocaleTimeString(); }, 1000);
		return () => clearInterval(timeInterval);
	});

	// --- Opening things ---
	function toggleProject(projectId) {
		const project = (projects || []).find((p) => p.id === projectId);
		if (project) selectedProject = project;
	}
	function closeProject() { selectedProject = null; }

	async function handleNavigation(path) {
		if (path === $page.url.pathname) return;
		// Start transition immediately to show overlay during frame animation
		transitionActions.startTransition($page.url.pathname, path);
		isNavigating = true;
		animateScreenFlip();
		// Let the monitor finish expanding to full-screen, then swap in the
		// page so it lands seamlessly (destination pages mount full-screen too).
		setTimeout(async () => {
			await goto(path);
			isNavigating = false;
			setTimeout(() => transitionActions.completeTransition(), 50);
		}, 380);
	}

	// --- Zoom (toolbar buttons + ⌘/ctrl-wheel) ---
	function zoomIn() { zoomLevel = Math.min(zoomLevel + 0.2, 3); }
	function zoomOut() { zoomLevel = Math.max(zoomLevel - 0.2, 1.0); }
	function resetZoom() { zoomLevel = 1; panOffset = { x: 0, y: 0 }; }
	$: if (zoomLevel === 1) panOffset = { x: 0, y: 0 };
	function handleWheel(event) {
		// Zoom only on Ctrl/Cmd + wheel or trackpad pinch — never plain scroll.
		if (event.ctrlKey || event.metaKey) {
			event.preventDefault();
			const delta = event.deltaY > 0 ? -0.1 : 0.1;
			zoomLevel = Math.max(1.0, Math.min(3, zoomLevel + delta));
		}
	}

</script>

<svelte:window on:keydown={onWindowKeydown} on:pointermove={iconMove} on:pointerup={iconUp} />

{#if showIntro}
	<IntroOverlay {typed} tagline={SITE_TAGLINE} on:enter={enterSite} />
{/if}

<div class="laptop-frame" class:navigating={isNavigating} class:contracting={isContracting} class:surfing={surfing}>
	<!-- Brand sits on the orange desktop, outside the monitor -->
	<div class="desktop-brand">
		<span class="title">{thisVisitName || 'RAD.COM'}</span>
		<span class="subtitle">a web portal</span>
	</div>
	<div class="laptop-screen" style="background: {wallpaperColor};">
		<!-- Navigation and Controls in the frame bezel -->
		<div class="frame-topbar">
			<div class="topbar-left">
				<a href="/about" class="about-link" title="About Rhea"><img class="about-tag" src="/hello-my-name-is-rhea.png" alt="HELLO my name is RHEA — about" /></a>
			</div>
			<div class="topbar-center">
				<DesktopNavigation on:navigate={({ detail }) => handleNavigation(detail.path)} />
			</div>
			<div class="topbar-right">
				<SyntheticToggle />
				<!-- Search Button and Input -->
				<div class="search-container">
					<button class="search-btn" on:click={() => spotlightOpen = true} title="Spotlight search (⌘K)">
						<svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
							<circle cx="11" cy="11" r="8"></circle>
							<path d="m21 21-4.35-4.35"></path>
						</svg>
					</button>
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
		<!-- Desktop View (click an empty spot on the desktop to go full screen) -->
		<div
			class="desktop-container"
			on:click={(e) => { if (!surfing && e.target === e.currentTarget) surf(); }}
		>

			<!-- Desktop Icons (empty-space clicks bubble up as "go full screen") -->
			<div class="desktop-icons" bind:clientWidth={deskW} on:click={(e) => { if (!surfing && e.target === e.currentTarget) surf(); }}>
					<!-- Videos are posts (form: video), not a folder — they live in
					     Creative / Comedy / Music alongside everything else. -->
					<!-- Desktop: top-level category folders only. Child categories
					     (Comedy, Music) live inside their parent (Creative). -->
					{#each topFolders as category, i}
						{@const categoryInfo = categoryConfig[category.id]}
						{@const pos = iconPos[category.id] || defaultIconPos(i, zoomLevel, deskW)}
							<div
								class="desktop-icon draggable"
								style="left:{pos.x}px; top:{pos.y}px;"
								on:pointerdown={(e) => iconDown(e, category.id, pos)}
								on:click={() => { if (!iconMoved) windows = openFolder(windows, category.id); }}
								on:keydown={(e) => e.key === 'Enter' && (windows = openFolder(windows, category.id))}
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
					<!-- Loose files + the whole analog archive float directly on the
					     desktop as draggable objects (no folder). -->
					{#each floatingItems as project, i (project.id)}
						{@const fpos = iconPos[project.id] || defaultIconPos(topFolders.length + i, zoomLevel, deskW) /* same grid as the folders: art flows right after them */}
						{#if project.hoard}
							<!-- The "hoard": one stack that fans open to reveal the img* scans -->
							<div
								class="desktop-icon draggable float-item hoard-stack"
								style="left:{fpos.x}px; top:{fpos.y}px;"
								on:pointerdown={(e) => iconDown(e, project.id, fpos)}
								on:click={() => { if (!iconMoved) toggleHoard(); }}
								on:keydown={(e) => e.key === 'Enter' && toggleHoard()}
								tabindex="0"
								role="button"
								aria-label={hoardOpen ? 'Collapse hoard' : 'Expand hoard'}
							>
								<div class="mac-icon hoard-visual">
									{#each hoardItems.slice(0, 30) as h, k}
										{@const rot = ((k * 41) % 15) - 7}
										{@const dx = ((k * 29) % 15) - 7}
										{@const dy = ((k * 17) % 11) - 4}
										<img src={h.thumb || h.image} alt="" class="hoard-layer" style="transform: rotate({rot}deg) translate({dx}px, {dy}px); z-index:{k};" loading="lazy" />
									{/each}
								</div>
								<div class="mac-icon-label">{hoardOpen ? 'hoard ▾' : project.title}</div>
							</div>
						{:else}
							<div
								class="desktop-icon draggable float-item"
								style="left:{fpos.x}px; top:{fpos.y}px;"
								on:pointerdown={(e) => iconDown(e, project.id, fpos)}
								on:click={() => { if (!iconMoved) toggleProject(project.id); }}
								on:keydown={(e) => e.key === 'Enter' && toggleProject(project.id)}
								on:mouseenter={() => (hoveredProject = project)}
								on:focus={() => (hoveredProject = project)}
								tabindex="0"
								role="button"
								aria-label="Open {project.title}"
							>
								<div class="mac-icon">
									{#if project.image || project.thumb || project.iconImage}
										<img src={project.image || project.thumb || project.iconImage} alt={project.title} class="float-thumb" loading="lazy" />
									{:else}
										<svg viewBox="0 0 44 56" fill="none" xmlns="http://www.w3.org/2000/svg" class="mac-icon-svg">
											<path d="M4 0 L30 0 L44 14 L44 54 Q44 56 42 56 L4 56 Q2 56 0 54 L0 2 Q0 0 4 0 Z" fill="#f8f8f8" stroke="#aaaaaa" stroke-width="1.5"/>
											<path d="M30 0 L30 14 L44 14" stroke="#aaaaaa" stroke-width="1.5" fill="none"/>
										</svg>
									{/if}
								</div>
								<div class="mac-icon-label {redactionClass(project.date)}">{project.title}{#if project.dateApprox && !project.undated} · {new Date(project.date).getFullYear()}{/if}</div>
							</div>
						{/if}
					{/each}
			</div>






		</div>
	</div>
		</div>

		<!-- Project Modal (outside scrollable homepage so it always covers the full screen) -->
		{#if selectedProject}
			<ProjectModal project={selectedProject} on:close={closeProject} on:viewimage={(e) => openViewer(e.detail.src, e.detail.alt)} />
		{/if}

		<!-- Full-screen zoomable image viewer (opens from any clicked image) -->
		<ImageViewer src={viewerSrc} alt={viewerAlt} on:close={() => (viewerSrc = null)} />

		<!-- Draggable / resizable Finder windows + the dock of minimized ones -->
		<DesktopWindows bind:windows {projects} on:viewimage={(e) => openViewer(e.detail.src, e.detail.alt)} />

		<!-- Quick Look (spacebar preview) + Spotlight search -->
		<QuickLook item={quickLookItem} on:close={() => (quickLookItem = null)} on:open={handleQuickLookOpen} />
		{#if spotlightOpen}
			<Spotlight posts={projects} on:select={onSpotlightSelect} on:close={() => (spotlightOpen = false)} />
		{/if}

		<WallpaperToolbar bind:wallpaperColor {zoomLevel} {surfing}
			on:zoomin={zoomIn} on:zoomout={zoomOut} on:zoomreset={resetZoom} on:reseticons={resetIconPositions} on:surf={surf} />
	</div>
	
	<!-- Desktop Stand (moved outside laptop screen) -->
	<!-- Stand only exists in monitor mode — removed from the DOM entirely in
	     any fullscreen state so it can never flash or linger. -->
	{#if !surfing && !isNavigating && !isContracting}
		<div class="desktop-stand">
			<div class="stand-vertical"></div>
			<div class="stand-base"></div>
		</div>
	{/if}
</div>

<style>
	.desktop-icon:hover { transform: scale(1.05); }
	.desktop-icon:active { transform: scale(0.95); }
	/* Space/Dark Grey Laptop Frame */
	.laptop-frame {
		display: flex;
		justify-content: center;
		align-items: flex-start; /* monitor sits high; the stand gets the room below */
		height: 100vh;
		background: #ff8c42;
		padding: 9vh 10px 0 10px; /* brand lives in the 9vh above the screen */
		position: relative;
		overflow: hidden;
	}

	.laptop-frame.navigating {
		padding: 0 !important;
		overflow: hidden !important;
	}

	.laptop-frame.navigating .laptop-screen {
		width: 100vw !important;
		height: 100vh !important;
		max-width: none !important;
		border: 4px solid #333333 !important;
		border-radius: 0;
		box-shadow: none !important;
		/* Sizing snaps instantly; animateScreenFlip() supplies the motion. */
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
	.laptop-frame.surfing .desktop-stand,
	.laptop-frame.navigating .desktop-stand {
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
		height: 78vh; /* 9vh + 78vh → bottom edge at 87vh; the stand takes the 13vh below */
		background: #ff8c42;
		border: 3px solid #333333;
		overflow: hidden; /* Prevent content from overflowing the screen */
		position: relative;
		z-index: 2; /* above the stand, which tucks under this bottom edge */
		box-shadow:
			0 0 0 1px #222222,
			0 10px 25px rgba(0, 0, 0, 0.5),
			inset 0 0 10px rgba(0, 0, 0, 0.2);
		/* No width/height transition here — expand/contract is animated with a
		   transform (FLIP) in animateScreenFlip() so layout only happens once. */
		will-change: transform;
		transition: border-color 0.18s ease;
	}

	/* Hovering the monitor lightens its bezel — "selected", click to go inside */
	.laptop-frame:not(.surfing):not(.navigating) .laptop-screen:hover {
		border-color: #6e6e6e;
	}
	.laptop-frame:not(.surfing) .desktop-container {
		cursor: zoom-in; /* icons/buttons override with their own cursors */
	}

	/* Desktop Stand — anchored to frame bottom, extends upward */
	.desktop-stand {
		position: absolute;
		bottom: 2.5vh; /* a little "desk" under the base */
		z-index: 1;  /* under the screen, so the neck tucks behind its bottom edge (no hairline gap) */
		left: 50%;
		transform: translateX(-50%);
		z-index: 10;
		pointer-events: none;
		display: flex;
		flex-direction: column;
		align-items: center;
	}

	/* Sized in vh so the stand fills the gap BELOW the screen and overlaps its
	   bottom edge by ~1vh (it sits UNDER the screen, so no hairline gap can
	   show): screen bottom 87vh → neck 8.5vh + base 3vh + 2.5vh desk. Widths
	   scale with the viewport like clipart monitor stands: neck ≈ 7% /
	   base ≈ 30% of the screen width. */
	.stand-vertical {
		width: min(7vw, 76px);
		height: 8.5vh;
		background: #1a1a1a;
		border: 2px solid #000000;
	}

	.stand-base {
		width: min(30vw, 320px);
		height: 3vh;
		min-height: 16px;
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
		border-radius: 0;
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

	/* the name tag, shrunk to a button → /about */
	.about-link {
		display: inline-flex;
		align-items: center;
		padding: 2px 4px;
		border: 1px solid transparent;
		transition: all 0.2s ease;
		line-height: 0;
	}
	.about-tag { height: 36px; width: auto; display: block; }

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

	.system-time {
		color: #ffffff;
		font-family: Arial, sans-serif;
		font-size: 0.8rem;
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

	/* RAD.COM brand on the orange desktop, above the monitor */
	.desktop-brand {
		position: absolute;
		top: 1.6vh;
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
		margin: 0.9vh 0 0;
		line-height: 1.3;
	}

	/* Desktop Styles */
	.desktop-container {
		min-height: 70vh;
		position: relative;
		/* Fixed side borders: the desktop never scrolls horizontally. Icons
		   that would run past the edge (e.g. when zoomed way in) are clipped,
		   not reachable by scrolling. Applies to monitor + fullscreen views.
		   `clip` (not hidden) so vertical scrolling is unaffected. */
		overflow-x: clip;
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
		position: relative;
		min-height: 60vh;
	}

	/* Draggable desktop folders sit as free objects, not in the grid flow */
	.desktop-icon.draggable {
		position: absolute;
		width: calc(110px * var(--zoom, 1));
		cursor: grab;
		/* pinch-zoom (not none) so two-finger zoom still works on mobile;
		   one-finger drag keeps working via pointer events */
		touch-action: pinch-zoom;
		user-select: none;
	}
	.desktop-icon.draggable:active { cursor: grabbing; }
	/* Free-floating scans/notes: show the actual image as the object. The
	   thumbnail and label BOTH scale with zoom (not just the text), and the
	   label is clamped so long titles don't overlap neighbouring scans. */
	.float-item { width: calc(96px * var(--zoom, 1)); }
	.float-thumb {
		max-width: calc(88px * var(--zoom, 1));
		max-height: calc(88px * var(--zoom, 1));
		object-fit: contain;
		display: block;
		/* let the whole tile be dragged: the image itself must not capture the
		   pointer or start the browser's native image-drag. */
		pointer-events: none;
		-webkit-user-drag: none;
		user-select: none;
	}
	/* The hoard: the whole pile of scans stacked on top of each other. Explicit
	   size (higher specificity than the auto-sizing .float-item .mac-icon rule,
	   which was collapsing it to nothing → the "tiny dots"). */
	.float-item .mac-icon.hoard-visual {
		position: relative;
		width: calc(96px * var(--zoom, 1));
		height: calc(112px * var(--zoom, 1));
		max-height: none;
	}
	.hoard-layer {
		position: absolute;
		top: 8%; left: 8%;
		width: 84%;
		height: 84%;
		object-fit: cover;
		border: 1px solid #888;
		background: #fff;
		box-shadow: 1px 1px 2px rgba(0, 0, 0, 0.35);
	}
	/* The scan is bigger than the default 56px icon box — let the box grow to
	   the image so the label sits BELOW it instead of under the overflow. */
	.float-item .mac-icon {
		width: auto;
		height: auto;
		max-height: calc(88px * var(--zoom, 1));
	}
	.float-item .mac-icon-label {
		max-width: calc(96px * var(--zoom, 1));
		max-height: 2.6em;
		overflow: hidden;
		text-overflow: ellipsis;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		word-break: break-word;
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
		transition: background 0.15s ease, border-color 0.15s ease; /* NOT left/top — dragging must track the cursor instantly */
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
		pointer-events: none;
	}

	/* Icons show the real thing: a video's still, the artwork, or the first
	   page of the document — cropped to the icon like a Finder preview. */
	.mac-icon-img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: top center;
		border: 1px solid #888;
		background: #fff;
		pointer-events: none;
		-webkit-user-drag: none;
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

	/* Responsive Design */
	@media (max-width: 768px) {
		.title { font-size: 2.5rem; }
		.subtitle { font-size: 1.1rem; }
	}

	/* Enhanced Desktop Icon Animations */
	.desktop-icon {
		transition: background 0.15s ease, border-color 0.15s ease; /* NOT left/top — dragging must track the cursor instantly */
		position: relative;
	}

	/* Smooth transitions for view mode changes */
	.desktop-icons {
		transition: all 0.3s ease;
	}
</style>
