<script>
	import { onMount, tick } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { transitionActions } from '../lib/pageTransition.js';
	import ProjectPane from '../components/ProjectPane.svelte';
	import Navigation from '../components/Navigation.svelte';
	import DesktopNavigation from '../components/DesktopNavigation.svelte';
	import FilterTabs from '../components/FilterTabs.svelte';
	import PostPreview from '../components/PostPreview.svelte';
	import { loadPosts, getProjectColor, formatDate } from '$lib/posts.js';
	import { categoryConfig, getCategoryLabel } from '$lib/categories.js';
	import { siteName, SITE_TAGLINE } from '$lib/site.js';
	import QuickLook from '../components/QuickLook.svelte';
	import Spotlight from '../components/Spotlight.svelte';
	import FinderWindow from '../components/FinderWindow.svelte';

	// --- Finder-style windows: draggable, resizable, many at once, minimize to
	//     a bottom tab. A FOLDER window navigates in place (breadcrumb stack +
	//     back button); opening a subfolder changes the same window, not a new
	//     one. A FILE window shows a real preview. ---
	let windows = [];
	let winSeq = 1;
	let winZ = 20;

	// --- Draggable desktop folder icons (like real Mac desktop objects) ---
	let iconPos = {};          // folderId -> {x, y}
	let iconDragging = null;
	let iconMoved = false;
	let iconStart = { mx: 0, my: 0, x: 0, y: 0 };
	let deskW = 1200;          // measured desktop width (bind:clientWidth)
	// Spacing scales with zoom so icons don't pile up when enlarged. Up to
	// 175% the gap tracks the icon size (keeps the slight overlap Rhea likes);
	// past 175% spacing grows slower, so they deliberately overlap.
	function spaceFactor(z) {
		z = z || 1;
		return z <= 1.75 ? z : 1.75 + (z - 1.75) * 0.5;
	}
	// Lay items on a grid that WRAPS to the measured desktop width and hard-
	// clamps every icon fully inside it — so at high zoom they overlap but no
	// icon is ever clipped or pushed off-screen (no horizontal scroll).
	// Lay items on a grid that FILLS the desktop width: pick the column count
	// from an ideal step, then JUSTIFY the row so the last item's right edge
	// meets the right margin — no dead space on the right, and the gap shrinks
	// as items grow. Every icon stays fully on-screen (overlap allowed).
	function gridPos(i, z, baseStep, iconW, startY, rowH, w, justify = true) {
		const margin = 24;
		const W = w || deskW || (typeof window !== 'undefined' ? window.innerWidth : 1200);
		const iw = iconW * z;
		const step0 = baseStep * spaceFactor(z);
		const cols = Math.max(1, Math.round((W - 2 * margin) / step0));
		// justify=true → spread the row so the last item meets the right margin
		// (fills the width). justify=false → compact, left-aligned (folders).
		const step = justify && cols > 1 ? (W - 2 * margin - iw) / (cols - 1) : step0;
		const col = i % cols, row = Math.floor(i / cols);
		let x = margin + col * step;
		x = Math.min(Math.max(margin, x), W - margin - iw);
		return { x, y: startY + row * rowH };
	}
	function defaultIconPos(i, z = 1, w) {
		// folders: compact row(s) at the top-left, like a real desktop
		return gridPos(i, z, 150, 110, 30, 150 * spaceFactor(z), w, false);
	}
	function iconXY(id, i) { return iconPos[id] || defaultIconPos(i); }
	function iconDown(e, id, pos) {
		iconDragging = id;
		iconMoved = false;
		iconStart = { mx: e.clientX, my: e.clientY, x: pos.x, y: pos.y };
		// capture the pointer so the drag keeps tracking even if the cursor
		// leaves the icon — this is what was missing (drag "did nothing").
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
			try { localStorage.setItem('iconPos', JSON.stringify(iconPos)); } catch {}
			iconDragging = null;
		}
	}
	function focusWindow(id) {
		const w = windows.find((x) => x.id === id);
		if (w) { w.z = ++winZ; w.minimized = false; windows = windows; }
	}
	function closeWindow(id) { windows = windows.filter((x) => x.id !== id); }
	function minimizeWindow(id) {
		const w = windows.find((x) => x.id === id);
		if (w) { w.minimized = true; windows = windows; }
	}
	function cascade() {
		const n = windows.length;
		return { x: 60 + n * 34, y: 70 + n * 30 };
	}
	// Open a top-level category folder (its stack starts at that category).
	function openFolderWindow(categoryId) {
		const info = categoryConfig[categoryId];
		if (!info) return;
		const { x, y } = cascade();
		windows = [...windows, {
			id: winSeq++, kind: 'folder',
			stack: [{ category: categoryId, subfolder: null, title: info.label }],
			x, y, w: 640, h: 440, z: ++winZ, minimized: false
		}];
	}
	// Open a folder window straight to a category (and optionally a subfolder) —
	// used when arriving from a post's clickable breadcrumb (/?open=…&sub=…).
	function openFolderFromParam(categoryId, subfolder) {
		const info = categoryConfig[categoryId];
		if (!info) return;
		const { x, y } = cascade();
		const stack = [{ category: categoryId, subfolder: null, title: info.label }];
		if (subfolder) stack.push({ category: categoryId, subfolder, title: prettyFolder(subfolder) });
		windows = [...windows, {
			id: winSeq++, kind: 'folder', stack,
			x, y, w: 640, h: 440, z: ++winZ, minimized: false
		}];
	}
	// Navigate INSIDE a folder window (push a subfolder / child category).
	function navInto(win, category, subfolder, title) {
		win.stack = [...win.stack, { category, subfolder, title }];
		win.z = ++winZ;
		windows = windows;
	}
	function navBack(win) {
		if (win.stack.length > 1) { win.stack = win.stack.slice(0, -1); windows = windows; }
	}
	// Open a file as its own preview window.
	function openFileWindow(project) {
		const { x, y } = cascade();
		windows = [...windows, {
			id: winSeq++, kind: 'file', post: project,
			x, y, w: 680, h: 560, z: ++winZ, minimized: false
		}];
	}
	// A post belongs to a category if it's its primary `type` OR it's listed
	// in the post's extra `categories` (from `also_in:`). This is what lets a
	// file live in multiple folders at once.
	function inCat(p, catId) {
		return p.type === catId || (Array.isArray(p.categories) && p.categories.includes(catId));
	}
	// Does a category (or any category nested under it) contain posts?
	function hasPostsDeep(catId) {
		if ((projects || []).some((p) => inCat(p, catId))) return true;
		return Object.values(categoryConfig)
			.filter((c) => c.parent === catId)
			.some((c) => hasPostsDeep(c.id));
	}
	// Reactive: the top-level desktop folders (the 4 groups that have content).
	// Referencing `projects` here makes Svelte recompute when posts load —
	// without it the desktop renders once while projects is empty and never
	// updates (which made all folders vanish).
	$: topFolders = projects
		? categories.filter((c) => !categoryConfig[c.id].parent && c.id !== 'artifacts' && hasPostsDeep(c.id))
		: [];
	// Free-floating desktop items: notes marked loose, plus the pieces that are
	// actually Rhea's ART (image filenames with "myart"). The rest of the
	// analog archive (the "img*" scans of belongings) collapses into a single
	// expandable "hoard" stack so the desktop isn't buried in 70+ scans.
	let hoardOpen = false;
	// Rhea's own pieces (art + tools) float loose; the plain "img*" scans hoard.
	function isMyArt(p) { return /myart|tools/i.test(p.image || p.thumb || ''); }
	$: looseFloat = projects
		? projects.filter((p) => p.loose === true || (p.type === 'artifacts' && isMyArt(p)))
		: [];
	$: hoardItems = projects
		? projects.filter((p) => p.type === 'artifacts' && !isMyArt(p))
		: [];
	// What actually gets laid out: the loose art, then the hoard stack icon,
	// then (only when opened) the hoard's contents fanned out after it.
	$: floatingItems = [
		...looseFloat,
		...(hoardItems.length ? [{ id: '__hoard__', hoard: true, title: `hoard (${hoardItems.length})` }] : []),
		...(hoardOpen ? hoardItems : [])
	];
	function toggleHoard() { hoardOpen = !hoardOpen; }
	// Default scatter for loose items: a wrapping grid BELOW the folder row.
	function defaultFloatPos(i, z = 1, w) {
		const sf = spaceFactor(z);
		// start clearly BELOW the folder row (which scales with zoom), and give
		// each row enough height that a tall scan + a 2-line label never spill
		// into the row beneath it.
		const startY = 60 + 130 * sf;
		return gridPos(i, z, 116, 96, startY, 162 * sf, w);
	}
	function xyFloat(id, i) { return iconPos[id] || defaultFloatPos(i); }
	// Contents of the folder window's CURRENT level (top of its stack).
	// A level shows: its direct child-category folders (that contain posts),
	// its own subfolders, and its own posts — never grandchildren directly.
	function folderContents(win) {
		const cur = win.stack[win.stack.length - 1];
		const childCats = Object.values(categoryConfig)
			.filter((c) => c.parent === cur.category && hasPostsDeep(c.id));
		const own = (projects || []).filter((p) => inCat(p, cur.category));
		if (cur.subfolder) {
			return { childCats: [], subs: [], posts: own.filter((p) => p.subfolder === cur.subfolder) };
		}
		const subs = [...new Set(own.filter((p) => p.subfolder).map((p) => p.subfolder))].sort();
		return { childCats, subs, posts: own.filter((p) => !p.subfolder) };
	}
	function ytId(url) {
		const m = String(url || '').match(/(?:v=|youtu\.be\/|embed\/)([\w-]{6,})/);
		return m ? m[1] : null;
	}
	// A plain-text excerpt of a post's body for the tile "page" preview.
	function excerpt(md, max = 320) {
		const t = String(md || '')
			.replace(/\n#+\s*(Topics|Related)\s*\n(?:\s*[-*]\s*\[\[.*?\]\].*\n?)+/gi, '')
			.replace(/\[\[.*?\]\]/g, '')
			.replace(/<[^>]*>/g, ' ')
			.replace(/[#>*_`]/g, '')
			.replace(/\s+/g, ' ')
			.trim();
		return t.length > max ? t.slice(0, max) + '…' : t || '(no text yet)';
	}
	// Preview a post's body, minus the Obsidian graph plumbing, as plain text.
	function renderMarkdownSafe(md) {
		const t = String(md || '')
			.replace(/\n#+\s*(Topics|Related)\s*\n(?:\s*[-*]\s*\[\[.*?\]\].*\n?)+/gi, '')
			.replace(/\[\[.*?\]\]/g, '')
			.replace(/[#>*_`]/g, '')
			.trim();
		const esc = t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
		return esc.split(/\n{2,}/).slice(0, 6).map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`).join('');
	}

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

	// Posts arrive from the page `load` function (+page.js), so the desktop
	// renders WITH content immediately — no blank-until-reload flash.
	export let data;
	let projects = (data && data.posts) || [];
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

		thisVisitName = siteName(); // rotates per visit
		if (typeof sessionStorage !== 'undefined' && !sessionStorage.getItem('introSeen')) {
			showIntro = true;
			let i = 0;
			const t = setInterval(() => {
				typed = thisVisitName.slice(0, ++i);
				if (i >= thisVisitName.length) clearInterval(t);
			}, 150);
		}
		// restore the normal responsive viewport when leaving the desktop
		return () => { if (vp && prevVp) vp.setAttribute('content', prevVp); };
	});
	function enterSite() {
		showIntro = false;
		try { sessionStorage.setItem('introSeen', '1'); } catch {}
	}

	// "Surf my web" — the monitor SCREEN expands to fill the whole window (go inside).
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
			[
				{ transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
				{ transform: 'none' }
			],
			{ duration: 380, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' }
		);
	}

	function surf() {
		surfing = !surfing;
		zoomLevel = 1;
		panOffset = { x: 0, y: 0 };
		animateScreenFlip();
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
		// Esc exits full screen (unless a modal/search layer is open and wants it)
		if (e.key === 'Escape' && surfing && !spotlightOpen && !quickLookItem && !selectedProject && !showSearch) {
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
			// Restore any dragged desktop icon positions
			try { iconPos = JSON.parse(localStorage.getItem('iconPos') || '{}'); } catch {}

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
				openFolderFromParam(openId, params.get('sub') || null);
				window.history.replaceState({}, '', '/');
			}

			// Posts already came from +page.js `load`. Only fetch as a fallback
			// if for some reason none arrived, so the desktop is never blank.
			try {
				if (!projects || projects.length === 0) {
					projects = await loadPosts();
				}

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
			filteredProjects = (projects || []).filter(project => inCat(project, type));
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
		animateScreenFlip();
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

	// Subfolder navigation inside a category folder (essays/media-aesthetics …)
	let selectedSubfolder = null;
	function prettyFolder(s) {
		return String(s).replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
	}
	function openSubfolder(s) {
		selectedSubfolder = s;
		breadcrumbPath = [...breadcrumbPath.slice(0, 2), prettyFolder(s)];
	}
	// Subfolders present in the currently-open category folder
	$: catSubfolders =
		breadcrumbPath.length > 1 && !/\d{4}/.test(breadcrumbPath[1])
			? [...new Set((projects || []).filter((p) => inCat(p, selectedFilter) && p.subfolder).map((p) => p.subfolder))].sort()
			: [];

	// Breadcrumb helpers — one Back button that does the natural thing
	function goToDesktop() {
		viewMode = 'desktop';
		selectedFilter = 'all';
		breadcrumbPath = ['Desktop'];
		previousView = null;
		selectedSubfolder = null;
	}
	function goBackNav() {
		if (selectedSubfolder) {
			// step out of the subfolder, back to the category folder
			selectedSubfolder = null;
			breadcrumbPath = breadcrumbPath.slice(0, 2);
			return;
		}
		if (previousView) { navigateBack(); return; }
		if (breadcrumbPath.length > 1 && /\d{4}/.test(breadcrumbPath[1])) {
			// Came from the By Month folder grid — return there
			viewMode = 'folders';
			selectedFilter = 'all';
			breadcrumbPath = ['Desktop'];
			if (availableMonths && availableMonths.length > 0) {
				currentMonth = availableMonths[0].month;
				currentYear = availableMonths[0].year;
			}
			return;
		}
		goToDesktop();
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
			selectedSubfolder = null;
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
		zoomLevel = 1;
		panOffset = { x: 0, y: 0 };
		zoomLevel = zoomLevel;
	}
	// Put every dragged folder / floating item back to its default spot.
	function resetIconPositions() {
		iconPos = {};
		try { localStorage.removeItem('iconPos'); } catch {}
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





	// When searching from the Desktop view, flip to All Posts so matches are
	// actually visible (the desktop only shows category folders). Restore the
	// desktop when the query is cleared.
	let searchCameFromDesktop = false;
	$: if (searchQuery.trim() && viewMode === 'desktop') {
		searchCameFromDesktop = true;
		viewMode = 'all';
	} else if (!searchQuery.trim() && searchCameFromDesktop) {
		searchCameFromDesktop = false;
		viewMode = 'desktop';
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
						// We're in a category folder. If a subfolder is open, show
						// its posts; otherwise show only posts that sit at the
						// category root (subfoldered posts appear as folders).
						// A parent category (Creative) also holds its children's posts.
						const childIds = Object.values(categoryConfig)
							.filter((c) => c.parent === selectedFilter)
							.map((c) => c.id);
						if (project.type !== selectedFilter && !childIds.includes(project.type)) return false;
						return selectedSubfolder
							? project.subfolder === selectedSubfolder
							: !project.subfolder;
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
				return selectedFilter === 'all' || inCat(project, selectedFilter);
			}
			
			return true;
		})
		.sort((a, b) => new Date(a.date) - new Date(b.date));
	
	$: console.log('Reactive update - currentMonth:', currentMonth, 'currentYear:', currentYear, 'projectsWithDates length:', projectsWithDates.length);
</script>



<svelte:window on:keydown={onWindowKeydown} on:pointermove={iconMove} on:pointerup={iconUp} />

{#if showIntro}
	<!-- Landing beat: click anywhere to enter the desktop -->
	<div class="intro-overlay" on:click={enterSite} on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && enterSite()} role="button" tabindex="0">
		<div class="intro-inner">
			<h1 class="intro-title">{typed}<span class="intro-caret">&nbsp;</span></h1>
			<div class="intro-sub">{SITE_TAGLINE}</div>
			<div class="intro-hint">[ click anywhere to enter ]</div>
		</div>
		<div class="intro-ticker"><span>double-click a folder to open it · press space to preview any file · ⌘K to search everything · drag the obsidian graph · wallpaper picker bottom-left · welcome to my desktop ·</span></div>
	</div>
{/if}

<div class="laptop-frame" class:navigating={isNavigating} class:contracting={isContracting} class:surfing={surfing}>
	<!-- Brand sits on the orange desktop, outside the monitor -->
	<div class="desktop-brand">
		<span class="title">{thisVisitName || 'RAD.COM'}</span>
		<span class="subtitle">A Personal [Public] Archive by Rhea Madhogarhia</span>
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
			{#if breadcrumbPath.length > 1 || previousView}
			<!-- Finder-style path bar: back arrow + clickable crumbs (sits above the View toolbar) -->
			<div class="breadcrumb-nav">
				<button class="crumb-back" on:click={goBackNav} title="Back">←</button>
				{#each breadcrumbPath as path, index}
					{#if index > 0}
						<span class="breadcrumb-separator">›</span>
					{/if}
					{#if index === breadcrumbPath.length - 1 && breadcrumbPath.length > 1}
						<span class="breadcrumb-current">{path}</span>
					{:else}
						<button class="breadcrumb-link" on:click={() => { if (index === 0) goToDesktop(); else { selectedSubfolder = null; breadcrumbPath = breadcrumbPath.slice(0, 2); } }}>{path}</button>
					{/if}
				{/each}
			</div>
			{/if}
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
				<button class="tb-btn" on:click={resetIconPositions} title="Reset icon positions">⇱</button>
				<span class="tb-sep"></span>
				<button class="tb-btn" on:click={surf} title={surfing ? 'Exit full screen (Esc)' : 'Full screen'}>
					{surfing ? '⤡' : '⤢'}
				</button>
			</div>

		<!-- Desktop View (click an empty spot on the desktop to go full screen) -->
		<div
			class="desktop-container"
			on:click={(e) => { if (!surfing && e.target === e.currentTarget) surf(); }}
		>

			<!-- Desktop Icons (empty-space clicks bubble up as "go full screen") -->
			<div class="desktop-icons" bind:clientWidth={deskW} on:click={(e) => { if (!surfing && e.target === e.currentTarget) surf(); }}>
				{#if viewMode === 'desktop'}
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
								on:click={() => { if (!iconMoved) openFolderWindow(category.id); }}
								on:keydown={(e) => e.key === 'Enter' && openFolderWindow(category.id)}
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
						{@const fpos = iconPos[project.id] || defaultFloatPos(i, zoomLevel, deskW)}
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
									{#each hoardItems.slice(0, 3) as h, k}
										<img src={h.thumb || h.image} alt="" class="hoard-layer" style="transform: rotate({(k - 1) * 5}deg) translate({(k - 1) * 3}px, {k * 2}px);" loading="lazy" />
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
								<div class="mac-icon-label">{project.title}</div>
							</div>
						{/if}
					{/each}
				{:else if viewMode === 'all'}
					<!-- Child categories appear as folders inside their parent -->
					{#if !selectedSubfolder}
						{#each categories.filter(c => c.parent === selectedFilter) as child (child.id)}
							{@const n = (projects || []).filter(p => inCat(p, child.id)).length}
							{#if n > 0}
								<div
									class="desktop-icon"
									on:click={() => openCategoryFolder(child.id)}
									on:keydown={(e) => e.key === 'Enter' && openCategoryFolder(child.id)}
									tabindex="0"
									role="button"
									aria-label="Open {child.label} folder"
								>
									<div class="mac-icon">
										<svg viewBox="0 0 56 46" fill="none" xmlns="http://www.w3.org/2000/svg" class="mac-icon-svg">
											<path d="M0 12 L0 8 Q0 6 2 6 L20 6 L24 12 Z" fill="#d8d8d8" stroke="#999999" stroke-width="1.2"/>
											<rect x="0" y="11" width="56" height="35" fill="#e8e8e8" stroke="#999999" stroke-width="1.2"/>
										</svg>
									</div>
									<div class="mac-icon-label">{child.label}</div>
								</div>
							{/if}
						{/each}
					{/if}
					<!-- Subfolders inside the open category folder -->
					{#if !selectedSubfolder}
						{#each catSubfolders as sub (sub)}
							<div
								class="desktop-icon"
								on:click={() => openSubfolder(sub)}
								on:keydown={(e) => e.key === 'Enter' && openSubfolder(sub)}
								tabindex="0"
								role="button"
								aria-label="Open {prettyFolder(sub)} folder"
							>
								<div class="mac-icon">
									<svg viewBox="0 0 56 46" fill="none" xmlns="http://www.w3.org/2000/svg" class="mac-icon-svg">
										<path d="M0 12 L0 8 Q0 6 2 6 L20 6 L24 12 Z" fill="#d8d8d8" stroke="#999999" stroke-width="1.2"/>
										<rect x="0" y="11" width="56" height="35" fill="#e8e8e8" stroke="#999999" stroke-width="1.2"/>
									</svg>
								</div>
								<div class="mac-icon-label">{prettyFolder(sub)}</div>
							</div>
						{/each}
					{/if}
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
								{#if project.thumb || project.iconImage}
									<img src={project.thumb || project.iconImage} alt={project.title} class="mac-icon-img" loading="lazy" />
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
						<h2 class:ai-title={selectedProject.aiTitle} title={selectedProject.aiTitle ? 'Title drafted with AI assistance' : undefined}>{selectedProject.title}</h2>
						<p class="project-date">{new Date(selectedProject.date).toLocaleDateString()}</p>
						<p class="project-description" class:ai-desc={selectedProject.aiDescription} title={selectedProject.aiDescription ? 'Description drafted with AI assistance' : undefined}>{selectedProject.description}</p>
						{#if selectedProject.pdf}
							<!-- Original document beats mangled text every time -->
							<iframe src={selectedProject.pdf} title="{selectedProject.title} (PDF)" class="modal-pdf"></iframe>
						{:else}
							<div class="project-content">
								{@html selectedProject.content}
							</div>
						{/if}
						<div class="project-actions">
							{#if selectedProject.link}
								<a href={selectedProject.link} target="_blank" rel="noopener noreferrer" class="view-post-btn">Open project ↗</a>
							{/if}
							<a href="/posts/{selectedProject.id}" class="view-post-btn">View Full Post →</a>
						</div>
					</div>
				</div>
			</div>
		{/if}

		<!-- Draggable / resizable Finder windows -->
		{#each windows as win (win.id)}
			{#if !win.minimized}
				<FinderWindow
					title={win.kind === 'folder' ? win.stack[win.stack.length - 1].title : win.post.title}
					bind:x={win.x} bind:y={win.y} bind:w={win.w} bind:h={win.h} z={win.z}
					canBack={win.kind === 'folder' && win.stack.length > 1}
					on:focus={() => focusWindow(win.id)}
					on:close={() => closeWindow(win.id)}
					on:minimize={() => minimizeWindow(win.id)}
					on:back={() => navBack(win)}
				>
					{#if win.kind === 'folder'}
						{@const c = folderContents(win)}
						{@const cur = win.stack[win.stack.length - 1]}
						{@const total = c.childCats.length + c.subs.length + c.posts.length}
						{@const cols = total <= 1 ? 1 : total <= 4 ? 2 : total <= 9 ? 3 : 4}
						{#if total === 0}
							<p class="win-empty">Empty.</p>
						{:else}
							<!-- One grid; every tile scales to fill the window (fewer items = bigger). -->
							<div class="win-fill" style="grid-template-columns: repeat({cols}, 1fr);">
								{#each c.childCats as child}
									<button class="win-cell folder" on:click={() => navInto(win, child.id, null, child.label)}>
										<svg viewBox="0 0 56 46" class="cell-folder"><path d="M0 12 L0 8 Q0 6 2 6 L20 6 L24 12 Z" fill="#d8d8d8" stroke="#999" stroke-width="1.2"/><rect x="0" y="11" width="56" height="35" fill="#e8e8e8" stroke="#999" stroke-width="1.2"/></svg>
										<span class="cell-cap">{child.label}</span>
									</button>
								{/each}
								{#each c.subs as sub}
									<button class="win-cell folder" on:click={() => navInto(win, cur.category, sub, prettyFolder(sub))}>
										<svg viewBox="0 0 56 46" class="cell-folder"><path d="M0 12 L0 8 Q0 6 2 6 L20 6 L24 12 Z" fill="#d8d8d8" stroke="#999" stroke-width="1.2"/><rect x="0" y="11" width="56" height="35" fill="#e8e8e8" stroke="#999" stroke-width="1.2"/></svg>
										<span class="cell-cap">{prettyFolder(sub)}</span>
									</button>
								{/each}
								{#each c.posts as p (p.id)}
									<button class="win-cell" on:click={() => openFileWindow(p)}>
										<div class="cell-media"><PostPreview post={p} /></div>
										<span class="cell-cap">{p.title}</span>
									</button>
								{/each}
							</div>
						{/if}
					{:else if win.kind === 'file'}
						{@const p = win.post}
						<div class="win-file" class:media={p.image || (p.images && p.images.length) || p.pdf || p.video || p.youtubePlaylist}>
							<div class="win-file-meta">{formatDate(p.date)} · {getCategoryLabel(p.type)}</div>
							{#if p.images && p.images.length > 1}
								<div class="win-gallery">
									{#each p.images as img, i}
										<img class="win-gimg" src={img} alt="{p.title} — {i + 1} of {p.images.length}" loading="lazy" />
									{/each}
								</div>
							{:else if p.image}
								<div class="win-imgwrap"><img class="win-image" src={p.image} alt={p.title} loading="lazy" /></div>
							{:else if p.youtubePlaylist}
								<div class="win-embed"><iframe src="https://www.youtube.com/embed/videoseries?list={p.youtubePlaylist}" title={p.title} allowfullscreen></iframe></div>
							{:else if p.video && ytId(p.video)}
								<div class="win-embed"><iframe src="https://www.youtube.com/embed/{ytId(p.video)}" title={p.title} allowfullscreen></iframe></div>
							{:else if p.pdf}
								<iframe class="win-pdf" src={p.pdf} title={p.title}></iframe>
							{:else if p.link}
								<!-- Live view of the project site (same as blog / post page) -->
								<div class="win-embed"><iframe src={p.link} title={p.title}></iframe></div>
							{:else}
								<div class="win-prose">{@html renderMarkdownSafe(p.content)}</div>
							{/if}
							{#if p.link}
								<a class="win-open" href={p.link} target="_blank" rel="noopener noreferrer">Open ↗</a>
							{/if}
							<a class="win-open" href="/posts/{p.id}">Open full post →</a>
						</div>
					{/if}
				</FinderWindow>
			{/if}
		{/each}

		<!-- Minimized windows dock as tabs along the bottom (like Gmail drafts) -->
		{#if windows.some((w) => w.minimized)}
			<div class="win-dock">
				{#each windows.filter((w) => w.minimized) as win (win.id)}
					<div class="dock-tab">
						<button class="dock-title" on:click={() => focusWindow(win.id)}>
							{win.kind === 'folder' ? win.stack[win.stack.length - 1].title : win.post.title}
						</button>
						<button class="dock-close" on:click={() => closeWindow(win.id)} title="Close" aria-label="Close">×</button>
					</div>
				{/each}
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
	.modal-pdf {
		display: block;
		width: 100%;
		height: 60vh;
		border: 2px solid #000;
		background: #fff;
	}

	/* One fill-the-window grid: rows share the height equally, so fewer items
	   are bigger and a single folder/file fills the whole window. */
	.win-fill {
		display: grid;
		gap: 16px;
		min-height: 100%;
		/* Rows fill the window when there are few items (1fr expands to the
		   min-height), but never shrink below a readable size — with many
		   items the grid grows past the window and it scrolls. */
		grid-auto-rows: minmax(170px, 1fr);
	}
	.win-cell {
		background: #fff;
		border: 2px solid #000;
		padding: 0;
		cursor: pointer;
		font: inherit;
		display: flex;
		flex-direction: column;
		min-height: 0;
		overflow: hidden;
	}
	.win-cell:hover { box-shadow: 4px 4px 0 #000; }
	.cell-thumb {
		flex: 1;
		min-height: 0;
		background: #f2f2f2;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
		padding: 6px;
	}
	/* Show the WHOLE cover fit inside the tile (letterboxed), never cropped. */
	.cell-thumb img { max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain; }
	/* Text-only documents get a real page preview: their opening words on
	   white, like the top of the actual page. */
	.cell-page {
		flex: 1;
		min-height: 0;
		overflow: hidden;
		background: #fff;
		color: #222;
		padding: 14px 16px;
		font-size: 0.72rem;
		line-height: 1.45;
	}
	/* Shared post preview fills the cell above the caption */
	.cell-media { flex: 1; min-height: 0; overflow: hidden; }
	/* Folder cells: the classic icon, centered and scaled to the cell */
	.win-cell.folder { background: #fafafa; align-items: center; justify-content: center; gap: 12px; padding: 12px; }
	.cell-folder { width: 55%; max-width: 160px; height: auto; }
	.cell-cap {
		flex: none;
		padding: 8px 10px;
		font-size: 0.82rem;
		line-height: 1.25;
		border-top: 2px solid #000;
		text-align: center;
		word-break: break-word;
	}
	.win-cell.folder .cell-cap { border-top: none; padding-top: 0; }
	.win-empty { color: #999; font-size: 0.85rem; }
	.win-file-meta { font-size: 0.75rem; color: #777; margin-bottom: 10px; }
	.win-embed { position: relative; padding-top: 56.25%; }
	.win-embed iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 1px solid #000; }
	.win-pdf { width: 100%; height: 60vh; border: 1px solid #000; }
	/* The file window is a flex column filling its window; the image scales
	   to fit (contain) so the WHOLE artifact is always visible, at any window
	   size — resize the window and the image just scales with it. */
	.win-file { display: flex; flex-direction: column; height: 100%; min-height: 0; }
	/* Media (image/pdf/video) fills the window edge-to-edge: pull out the
	   window body padding and shrink the chrome so the content dominates. */
	.win-file.media {
		margin: -14px;
		height: calc(100% + 28px);
	}
	.win-file.media .win-file-meta { padding: 8px 12px 6px; margin: 0; }
	.win-file.media .win-open { margin: 0; border: none; border-top: 1px solid #000; }
	.win-file.media .win-image { border: none; }
	/* Multi-page/side artifact: a scrollable stack of all its images */
	.win-gallery { flex: 1; min-height: 0; overflow: auto; display: flex; flex-direction: column; gap: 10px; }
	.win-gimg { max-width: 100%; border: 1px solid #000; display: block; }
	/* Image wrapper fills remaining height; image fits inside (contain) so the
	   whole scan shows and scales as the window resizes. */
	.win-imgwrap {
		flex: 1;
		min-height: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}
	.win-image {
		max-width: 100%;
		max-height: 100%;
		width: auto;
		height: auto;
		object-fit: contain;
		border: 1px solid #000;
		display: block;
	}
	.win-open {
		display: inline-block;
		margin-top: 12px;
		border: 1px solid #000;
		padding: 5px 12px;
		text-decoration: none;
		color: #000;
	}
	.win-open:hover { background: #000; color: #fff; }
	.win-prose { font-size: 0.9rem; line-height: 1.5; }
	.win-prose :global(p) { margin: 0 0 0.7em; }

	/* Minimized windows dock as tabs at the bottom, like Gmail drafts */
	.win-dock {
		position: fixed;
		bottom: 40px;
		right: 16px;
		display: flex;
		gap: 8px;
		z-index: 400;
	}
	.dock-tab {
		display: flex;
		align-items: center;
		background: #d9d9d9;
		border: 2px solid #000;
		box-shadow: 2px 2px 0 rgba(0,0,0,0.35);
		max-width: 220px;
	}
	.dock-title {
		background: none;
		border: none;
		padding: 6px 10px;
		font-size: 0.78rem;
		font-weight: 700;
		cursor: pointer;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.dock-close {
		background: none;
		border: none;
		border-left: 1px solid #000;
		padding: 6px 9px;
		cursor: pointer;
		font-size: 0.9rem;
	}
	.dock-close:hover { background: #ff5f57; }

	/* File previews fade in quietly. (The old-Windows slit animation is kept
	   for folders only, in QuickLook.) */
	:global(.modal-content) {
		animation: modalFade 0.14s ease-out;
	}
	@keyframes modalFade {
		from { opacity: 0; transform: scale(0.98); }
		to { opacity: 1; transform: scale(1); }
	}

	/* Landing beat */
	.intro-overlay {
		position: fixed;
		inset: 0;
		background: #ff8c42;
		z-index: 5000;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		cursor: pointer;
		overflow: hidden;
	}
	.intro-title {
		font-size: clamp(44px, 10vw, 120px);
		letter-spacing: -2px;
		margin: 0;
		color: #000;
	}
	.intro-caret {
		display: inline-block;
		width: 0.55em;
		background: #000;
		animation: introBlink 1s steps(1) infinite;
	}
	@keyframes introBlink { 50% { opacity: 0; } }
	.intro-sub { font-size: clamp(14px, 2vw, 20px); margin-top: 14px; color: #000; }
	.intro-hint { margin-top: 56px; font-size: 14px; animation: introBlink 1.6s steps(1) infinite; color: #000; }
	.intro-ticker {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		background: #000;
		color: #ff8c42;
		font-size: 12px;
		padding: 6px 0;
		white-space: nowrap;
		overflow: hidden;
	}
	.intro-ticker span { display: inline-block; padding-left: 100%; animation: introTick 18s linear infinite; }
	@keyframes introTick { to { transform: translateX(-100%); } }

	/* AI-generated titles get a dashed underline (same convention as AIText) */
	.ai-title {
		text-decoration: underline dashed;
		text-decoration-thickness: 1px;
		text-underline-offset: 3px;
		cursor: help;
	}

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
		height: 82vh;
		background: #ff8c42;
		border: 3px solid #333333;
		overflow: hidden; /* Prevent content from overflowing the screen */
		position: relative;
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
		/* Fixed side borders: the desktop never scrolls horizontally. Icons
		   that would run past the edge (e.g. when zoomed way in) are clipped,
		   not reachable by scrolling. Applies to monitor + fullscreen views.
		   `clip` (not hidden) so vertical scrolling is unaffected. */
		overflow-x: clip;
	}


	/* Breadcrumb Navigation — quiet Finder-style path bar */
	.breadcrumb-nav {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: 0.85rem;
		font-family: Arial, sans-serif;
		background: rgba(255, 255, 255, 0.7);
		border: 1px solid rgba(0, 0, 0, 0.25);
		border-radius: 0;
		padding: 4px 10px 4px 4px;
		margin-bottom: 14px;
	}

	.crumb-back {
		border: none;
		background: rgba(0, 0, 0, 0.07);
		border-radius: 0;
		width: 26px;
		height: 26px;
		cursor: pointer;
		font-size: 0.95rem;
		line-height: 1;
		color: #222;
		margin-right: 4px;
	}
	.crumb-back:hover {
		background: rgba(0, 0, 0, 0.16);
	}

	.breadcrumb-separator {
		color: #555;
		margin: 0 2px;
	}

	.breadcrumb-current {
		color: #000;
		font-weight: 600;
		padding: 3px 2px;
	}

	.breadcrumb-link {
		background: none;
		border: none;
		color: #222;
		cursor: pointer;
		font-size: 0.85rem;
		padding: 3px 6px;
		border-radius: 0;
	}

	.breadcrumb-link:hover {
		background: rgba(0, 0, 0, 0.08);
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
		box-shadow: 2px 2px 0 rgba(0,0,0,0.28);
		/* let the whole tile be dragged: the image itself must not capture the
		   pointer or start the browser's native image-drag. */
		pointer-events: none;
		-webkit-user-drag: none;
		user-select: none;
	}
	/* The hoard stack: a few scans layered like a messy pile you can fan open */
	.hoard-visual {
		position: relative;
		width: calc(84px * var(--zoom, 1));
		height: calc(84px * var(--zoom, 1));
	}
	.hoard-layer {
		position: absolute;
		top: 0; left: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		border: 1px solid #999;
		background: #fff;
		box-shadow: 1px 1px 0 rgba(0,0,0,0.3);
	}
	.hoard-stack:hover .hoard-layer:nth-child(1) { transform: rotate(-9deg) translate(-5px, 1px) !important; }
	.hoard-stack:hover .hoard-layer:nth-child(3) { transform: rotate(9deg) translate(5px, 3px) !important; }
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
	.player-btn {
		background: #1db954;
		border: 1px solid #000;
		color: #000;
		font-size: 1rem;
		line-height: 1;
		width: 26px;
		height: 22px;
		cursor: pointer;
		margin-right: 12px;
	}
	.player-btn:hover { background: #1ed760; }

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