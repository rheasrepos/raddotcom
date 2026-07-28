<script>
	// A draggable Finder-style window. Several can be open at once; each one
	// stacks above the last you touched. Replaces the on-screen back button —
	// you close a window instead of navigating "back".
	import { createEventDispatcher, onMount } from 'svelte';

	export let title = '';
	export let x = 80;
	export let y = 80;
	export let w = 560;
	export let z = 10;

	const dispatch = createEventDispatcher();

	let el;
	let dragging = false;
	let offset = { x: 0, y: 0 };

	function startDrag(e) {
		// Don't start a drag from the traffic-light buttons
		if (e.target.closest('.fw-traffic')) return;
		dragging = true;
		const r = el.getBoundingClientRect();
		offset = { x: e.clientX - r.left, y: e.clientY - r.top };
		dispatch('focus');
		e.preventDefault();
	}
	function onMove(e) {
		if (!dragging) return;
		x = Math.max(0, e.clientX - offset.x);
		y = Math.max(0, e.clientY - offset.y);
	}
	function endDrag() {
		dragging = false;
	}
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
	bind:this={el}
	style="left:{x}px; top:{y}px; width:{w}px; z-index:{z};"
	on:pointerdown={() => dispatch('focus')}
	role="dialog"
	aria-label={title}
>
	<header class="fw-bar" on:pointerdown={startDrag}>
		<div class="fw-traffic">
			<button class="tl close" on:click={() => dispatch('close')} title="Close" aria-label="Close"></button>
			<span class="tl min" aria-hidden="true"></span>
			<span class="tl max" aria-hidden="true"></span>
		</div>
		<span class="fw-title">{title}</span>
		<span class="fw-spacer"></span>
	</header>
	<div class="fw-body">
		<slot />
	</div>
</div>

<style>
	.fw {
		position: absolute;
		background: #fff;
		border: 2px solid #000;
		box-shadow: 3px 3px 0 rgba(0, 0, 0, 0.35);
		display: flex;
		flex-direction: column;
		max-height: 74vh;
		min-width: 260px;
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
	}
	.fw-bar:active { cursor: grabbing; }
	.fw-traffic { display: flex; gap: 6px; }
	.tl {
		width: 11px;
		height: 11px;
		border-radius: 50%;
		border: 1px solid #000;
		padding: 0;
		display: inline-block;
	}
	.close { background: #ff5f57; cursor: pointer; }
	.min { background: #febc2e; }
	.max { background: #28c840; }
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
	}
</style>
