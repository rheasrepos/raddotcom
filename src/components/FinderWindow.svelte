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

	const dispatch = createEventDispatcher();

	let dragging = false;
	let resizing = false;
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
	function startResize(e) {
		if (maximized) return;
		resizing = true;
		start = { mx: e.clientX, my: e.clientY, w, h };
		dispatch('focus');
		e.preventDefault();
		e.stopPropagation();
	}
	function onMove(e) {
		if (dragging) {
			x = Math.max(0, start.x + (e.clientX - start.mx));
			y = Math.max(0, start.y + (e.clientY - start.my));
		} else if (resizing) {
			w = Math.max(260, start.w + (e.clientX - start.mx));
			h = Math.max(160, start.h + (e.clientY - start.my));
		}
	}
	function endDrag() { dragging = false; resizing = false; }

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
		<div class="fw-resize" on:pointerdown={startResize} title="Resize" aria-hidden="true"></div>
	{/if}
</div>

<style>
	.fw {
		position: fixed;
		background: #fff;
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
	.fw-resize {
		position: absolute;
		right: 0;
		bottom: 0;
		width: 16px;
		height: 16px;
		cursor: nwse-resize;
		background: linear-gradient(135deg, transparent 50%, #000 50%, #000 60%, transparent 60%, transparent 72%, #000 72%, #000 82%, transparent 82%);
	}
</style>
