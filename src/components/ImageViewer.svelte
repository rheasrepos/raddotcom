<script>
	// Full-screen image viewer (lightbox): click any image on the site to open,
	// click the image to zoom in/out, drag or scroll to pan while zoomed,
	// Esc / × / backdrop click to close.
	export let src = null;   // image url, or null = closed
	export let alt = '';
	import { createEventDispatcher } from 'svelte';
	const dispatch = createEventDispatcher();

	let zoomed = false;
	let scroller;

	function close() {
		zoomed = false;
		dispatch('close');
	}
	function toggleZoom(e) {
		zoomed = !zoomed;
		if (zoomed && scroller) {
			// zoom toward where you clicked
			const rect = e.target.getBoundingClientRect();
			const fx = (e.clientX - rect.left) / rect.width;
			const fy = (e.clientY - rect.top) / rect.height;
			requestAnimationFrame(() => {
				scroller.scrollLeft = scroller.scrollWidth * fx - scroller.clientWidth / 2;
				scroller.scrollTop = scroller.scrollHeight * fy - scroller.clientHeight / 2;
			});
		}
	}
	function onKey(e) {
		if (src && e.key === 'Escape') { e.stopPropagation(); close(); }
	}
</script>

<svelte:window on:keydown={onKey} />

{#if src}
	<div class="iv-backdrop" role="presentation" on:click|self={close}>
		<button class="iv-close" on:click={close} aria-label="Close image viewer">×</button>
		<div class="iv-scroll" bind:this={scroller} class:zoomed on:click|self={close}>
			<img
				class="iv-img"
				class:zoomed
				{src}
				{alt}
				on:click={toggleZoom}
				draggable="false"
			/>
		</div>
		<div class="iv-hint">click image to {zoomed ? 'zoom out' : 'zoom in'} · esc to close</div>
	</div>
{/if}

<style>
	.iv-backdrop {
		position: fixed;
		inset: 0;
		background: rgba(0, 0, 0, 0.88);
		z-index: 12000;
		display: flex;
		flex-direction: column;
	}
	.iv-close {
		position: absolute;
		top: 10px;
		right: 16px;
		z-index: 2;
		background: none;
		border: none;
		color: #fff;
		font-size: 2rem;
		line-height: 1;
		cursor: pointer;
	}
	.iv-scroll {
		flex: 1;
		display: flex;
		align-items: center;
		justify-content: center;
		overflow: hidden;
	}
	.iv-scroll.zoomed {
		display: block;
		overflow: auto;
	}
	.iv-img {
		max-width: 94vw;
		max-height: 92vh;
		object-fit: contain;
		cursor: zoom-in;
		user-select: none;
		-webkit-user-drag: none;
	}
	.iv-img.zoomed {
		max-width: none;
		max-height: none;
		width: 200vw;      /* ~2x: big enough to inspect detail, pan by scroll */
		height: auto;
		cursor: zoom-out;
	}
	.iv-hint {
		position: absolute;
		bottom: 10px;
		left: 50%;
		transform: translateX(-50%);
		color: rgba(255, 255, 255, 0.75);
		font-size: 0.78rem;
		pointer-events: none;
	}
</style>
