<script>
	// A draggable, resizable Finder-style window. Several can be open at once;
	// the last one you touch stacks on top. Minimize docks it as a tab at the
	// bottom (like a Gmail draft); maximize fills the screen; close removes it.
	import { createEventDispatcher, onMount } from 'svelte';

	export let title = '';
	export let x = 80;
	export let y = 80;
	export let w = 620;
	export let h = 420;
	export let z = 10;
	export let canBack = false; // show a back arrow in the toolbar
	export let hidden = false;  // keep mounted (e.g. music playing) but not shown

	const dispatch = createEventDispatcher();

	let dragging = false;
	let resizeCorner = null; // 'nw' | 'ne' | 'sw' | 'se'
	let maximized = false;
	let start = { mx: 0, my: 0, x: 0, y: 0, w: 0, h: 0 };

	// Position is FIXED (viewport-relative) so the cursor tracks the title bar
	// exactly — an offset parent was what caused the earlier drift.
	function startDrag(e) {
		if (e.target.closest('.fw-btn') || maximized) return;
		dragging = true;
		start = { mx: e.clientX, my: e.clientY, x, y };
		dispatch('focus');
		e.preventDefault();
	}
	function startResize(e, corner) {
		if (maximized) return;
		resizeCorner = corner;
		start = { mx: e.clientX, my: e.clientY, x, y, w, h };
		dispatch('focus');
		e.preventDefault();
		e.stopPropagation();
	}
	function onMove(e) {
		if (dragging) {
			x = Math.max(0, start.x + (e.clientX - start.mx));
			y = Math.max(0, start.y + (e.clientY - start.my));
		} else if (resizeCorner) {
			const dx = e.clientX - start.mx;
			const dy = e.clientY - start.my;
			const east = resizeCorner.includes('e');
			const south = resizeCorner.includes('s');
			if (east) {
				w = Math.max(260, start.w + dx);
			} else {
				const nw = Math.max(260, start.w - dx);
				x = start.x + (start.w - nw);
				w = nw;
			}
			if (south) {
				h = Math.max(160, start.h + dy);
			} else {
				const nh = Math.max(160, start.h - dy);
				y = start.y + (start.h - nh);
				h = nh;
			}
		}
	}
	function endDrag() { dragging = false; resizeCorner = null; }

	function toggleMax() { maximized = !maximized; dispatch('focus'); }

	onMount(() => {
		window.addEventListener('pointermove', onMove);
		window.addEventListener('pointerup', endDrag);
		return () => {
			window.removeEventListener('pointermove', onMove);
			window.removeEventListener('pointerup', endDrag);
		};
	});
</script>

<div
	class="fw"
	class:max={maximized}
	class:fw-hidden={hidden}
	style={maximized ? `z-index:${z};` : `left:${x}px; top:${y}px; width:${w}px; height:${h}px; z-index:${z};`}
	on:pointerdown={() => dispatch('focus')}
	role="dialog"
	aria-label={title}
>
	<header class="fw-bar" on:pointerdown={startDrag}>
		<div class="fw-traffic">
			<button class="fw-btn tl close" on:click={() => dispatch('close')} title="Close" aria-label="Close"></button>
			<button class="fw-btn tl min" on:click={() => dispatch('minimize')} title="Minimize" aria-label="Minimize"></button>
			<button class="fw-btn tl max" on:click={toggleMax} title="Zoom" aria-label="Zoom"></button>
		</div>
		{#if canBack}
			<button class="fw-btn fw-back" on:click={() => dispatch('back')} title="Back" aria-label="Back">←</button>
		{/if}
		<span class="fw-title">{title}</span>
		<span class="fw-spacer"></span>
	</header>
	<div class="fw-body">
		<slot />
	</div>
	{#if !maximized}
		<div class="fw-rz nw" on:pointerdown={(e) => startResize(e, 'nw')} aria-hidden="true"></div>
		<div class="fw-rz ne" on:pointerdown={(e) => startResize(e, 'ne')} aria-hidden="true"></div>
		<div class="fw-rz sw" on:pointerdown={(e) => startResize(e, 'sw')} aria-hidden="true"></div>
		<div class="fw-rz se" on:pointerdown={(e) => startResize(e, 'se')} aria-hidden="true"></div>
	{/if}
</div>

<style>
	.fw {
		position: fixed;
		/* soft grey window shell (classic Mac), not stark white */
		background: #ececec;
		border: 2px solid #000;
		box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.35);
		display: flex;
		flex-direction: column;
		min-width: 260px;
		min-height: 160px;
		/* Never grow past the screen — the window always stays fully visible. */
		max-width: calc(100vw - 20px);
		max-height: calc(100vh - 96px);
	}
	/* Hidden = moved off-screen, NOT unmounted, so an embedded player keeps
	   playing while minimized. */
	.fw-hidden {
		left: -99999px !important;
		top: -99999px !important;
	}
	.fw.max {
		left: 8px !important;
		right: 8px !important;
		top: 56px !important;
		bottom: 44px !important;
		width: auto !important;
		height: auto !important;
	}
	.fw-bar {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 5px 9px;
		/* allow two-finger pinch-zoom on mobile; one-finger drag still works */
		touch-action: pinch-zoom;
		background: #d9d9d9;
		border-bottom: 2px solid #000;
		cursor: grab;
		user-select: none;
		flex: none;
	}
	.fw-bar:active { cursor: grabbing; }
	.fw-traffic { display: flex; gap: 6px; }
	.tl {
		width: 12px;
		height: 12px;
		border-radius: 50%;
		border: 1px solid rgba(0,0,0,0.4);
		padding: 0;
	}
	.close { background: #ff5f57; }
	.min { background: #febc2e; }
	.max { background: #28c840; }
	.fw-btn { cursor: pointer; }
	.fw-back {
		border: 1px solid #000;
		background: #fff;
		font-size: 0.85rem;
		line-height: 1;
		padding: 2px 7px;
	}
	.fw-back:hover { background: #000; color: #fff; }
	.fw-title {
		flex: 1;
		text-align: center;
		font-size: 0.82rem;
		font-weight: 700;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.fw-spacer { width: 40px; }
	.fw-body {
		padding: 14px;
		overflow: auto;
		flex: 1;
	}
	/* Resize handles on all four corners */
	.fw-rz { position: absolute; width: 16px; height: 16px; z-index: 2; touch-action: pinch-zoom; }
	.fw-rz.nw { top: -3px; left: -3px; cursor: nwse-resize; }
	.fw-rz.ne { top: -3px; right: -3px; cursor: nesw-resize; }
	.fw-rz.sw { bottom: -3px; left: -3px; cursor: nesw-resize; }
	.fw-rz.se {
		bottom: -3px; right: -3px; cursor: nwse-resize;
		background: linear-gradient(135deg, transparent 50%, #000 50%, #000 60%, transparent 60%, transparent 72%, #000 72%, #000 82%, transparent 82%);
	}
</style>
