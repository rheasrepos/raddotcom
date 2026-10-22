<script>
	// Universal switch in the top bar: show or hide all synthetic (AI-drafted)
	// text on the site. Remembered per browser (src/lib/aiReveal.js).
	import { aiHidden } from '$lib/aiReveal.js';
</script>

<button class="syn" class:off={$aiHidden} on:click={() => aiHidden.set(!$aiHidden)}
	title={$aiHidden ? 'Synthetic (AI-drafted) text is hidden — click to show it' : 'Hide all synthetic (AI-drafted) text'}>
	<span class="syn-dot"></span> synthetic text: {$aiHidden ? 'off' : 'on'}
</button>

<style>
	.syn { background: transparent; border: 1px solid #777; color: #fff; font: inherit; font-size: 0.72rem; padding: 3px 8px; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; white-space: nowrap; margin-right: 10px; }
	.syn:hover { border-color: #fff; }
	.syn-dot { width: 8px; height: 8px; background: #7cf29a; display: inline-block; }
	.syn.off .syn-dot { background: #666; }
	.syn.off { color: #aaa; text-decoration: line-through; }
</style>
