<script>
	// The Library as a map: every saved item is a dot, joined to the items most
	// similar to it (its `near` list from scripts/build-library.py), coloured by
	// topic — loosely after the "connected papers" style of research-paper graphs.
	// Force layout + canvas, no libraries. Hover a dot to see it and its
	// neighbours; click to open it; drag to pan; scroll to zoom.
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	export let items = [];
	export let highlight = null; // optional predicate: item → bool (search / topic filter)
	const dispatch = createEventDispatcher();

	const PALETTE = ['#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4', '#42d4f4', '#f032e6', '#9a6324', '#469990', '#800000', '#808000', '#000075', '#e6a800', '#7a7a7a', '#bfef45', '#dcbeff', '#aaffc3', '#ffd8b1', '#fabed4'];
	let canvas, wrap, ctx, raf;
	let nodes = [], edges = [], hovered = null;
	let view = { x: 0, y: 0, k: 0.55 }, panning = null, alpha = 1;

	$: topicList = [...new Set(items.map((i) => i.topic))].sort((a, b) => (a === 'Wild card' ? -1 : b === 'Wild card' ? 1 : 0));
	$: colorOf = (t) => (t === 'Wild card' ? '#000' : PALETTE[topicList.indexOf(t) % PALETTE.length]);

	function build() {
		// seed each topic in its own sector so groups start apart
		const sector = (t) => (topicList.indexOf(t) / topicList.length) * Math.PI * 2;
		nodes = items.map((it, i) => {
			const a = sector(it.topic) + (Math.random() - 0.5) * 0.6, r = 300 + Math.random() * 200;
			return { i, it, x: Math.cos(a) * r, y: Math.sin(a) * r, vx: 0, vy: 0, deg: 0 };
		});
		const seen = new Set();
		edges = [];
		for (const n of nodes) for (const j of n.it.near || []) {
			const key = n.i < j ? `${n.i}-${j}` : `${j}-${n.i}`;
			if (seen.has(key) || !nodes[j]) continue;
			seen.add(key); edges.push([n, nodes[j]]); n.deg++; nodes[j].deg++;
		}
		for (const n of nodes) n.r = 2.5 + Math.sqrt(n.deg) * 0.9;
		alpha = 1;
	}

	function tick() {
		if (alpha < 0.03) return;
		const REPEL = 260, LINK = 28, CENTER = 0.004;
		// grid-bucketed repulsion so 700 nodes stay fast
		const cell = 60, grid = new Map();
		for (const n of nodes) { const k = `${Math.floor(n.x / cell)},${Math.floor(n.y / cell)}`; (grid.get(k) || grid.set(k, []).get(k)).push(n); }
		for (const a of nodes) {
			a.vx -= a.x * CENTER; a.vy -= a.y * CENTER;
			const cx = Math.floor(a.x / cell), cy = Math.floor(a.y / cell);
			for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) {
				for (const b of grid.get(`${cx + dx},${cy + dy}`) || []) {
					if (b === a) continue;
					let x = a.x - b.x, y = a.y - b.y, d2 = x * x + y * y + 0.01;
					const f = REPEL / d2; a.vx += x * f * 0.5; a.vy += y * f * 0.5;
				}
			}
		}
		for (const [a, b] of edges) {
			const x = b.x - a.x, y = b.y - a.y, d = Math.sqrt(x * x + y * y) + 0.01, f = ((d - LINK) / d) * 0.04;
			a.vx += x * f; a.vy += y * f; b.vx -= x * f; b.vy -= y * f;
		}
		for (const n of nodes) { n.vx *= 0.82; n.vy *= 0.82; n.x += n.vx * alpha; n.y += n.vy * alpha; }
		alpha *= 0.992;
	}

	function draw() {
		const W = canvas.width / devicePixelRatio, H = canvas.height / devicePixelRatio;
		ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
		ctx.fillStyle = '#fafafa'; ctx.fillRect(0, 0, W, H);
		ctx.translate(W / 2 + view.x, H / 2 + view.y); ctx.scale(view.k, view.k);
		const near = hovered ? new Set([hovered, ...(hovered.it.near || []).map((j) => nodes[j])]) : null;
		ctx.lineWidth = 0.6 / view.k;
		for (const [a, b] of edges) {
			const lit = near && (a === hovered || b === hovered);
			ctx.strokeStyle = lit ? '#000' : 'rgba(0,0,0,0.09)';
			ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
		}
		for (const n of nodes) {
			const dim = (near && !near.has(n)) || (highlight && !highlight(n.it));
			ctx.globalAlpha = dim ? 0.15 : 1;
			ctx.fillStyle = colorOf(n.it.topic);
			ctx.beginPath(); ctx.arc(n.x, n.y, n === hovered ? n.r + 3 : n.r, 0, Math.PI * 2); ctx.fill();
		}
		ctx.globalAlpha = 1;
		if (near) {
			ctx.fillStyle = '#000'; ctx.font = `${11 / view.k}px sans-serif`; ctx.textAlign = 'center';
			for (const n of near) ctx.fillText(n.it.title.slice(0, 48), n.x, n.y - n.r - 4 / view.k);
		}
	}
	function loop() { tick(); draw(); raf = requestAnimationFrame(loop); }

	function world(e) {
		const r = canvas.getBoundingClientRect();
		return { x: (e.clientX - r.left - r.width / 2 - view.x) / view.k, y: (e.clientY - r.top - r.height / 2 - view.y) / view.k };
	}
	function pick(e) {
		const p = world(e); let best = null, bd = Infinity;
		for (const n of nodes) { const d = Math.hypot(n.x - p.x, n.y - p.y); if (d < Math.max(n.r + 3, 8 / view.k) && d < bd) { best = n; bd = d; } }
		return best;
	}
	let moved = false;
	function down(e) { moved = false; panning = { x: e.clientX - view.x, y: e.clientY - view.y }; canvas.setPointerCapture(e.pointerId); }
	function move(e) {
		if (panning) { const nx = e.clientX - panning.x, ny = e.clientY - panning.y; if (Math.abs(nx - view.x) + Math.abs(ny - view.y) > 2) moved = true; view.x = nx; view.y = ny; }
		else { hovered = pick(e); canvas.style.cursor = hovered ? 'pointer' : 'grab'; }
	}
	function up(e) {
		panning = null;
		if (!moved) { const n = pick(e); if (n) dispatch('open', n.it); }
	}
	function wheel(e) {
		e.preventDefault();
		const r = canvas.getBoundingClientRect(), mx = e.clientX - r.left - r.width / 2, my = e.clientY - r.top - r.height / 2;
		const k = Math.max(0.15, Math.min(5, view.k * Math.exp(-e.deltaY * 0.0015)));
		view.x = mx - (mx - view.x) * (k / view.k); view.y = my - (my - view.y) * (k / view.k); view.k = k;
	}
	function resize() {
		canvas.width = wrap.clientWidth * devicePixelRatio; canvas.height = wrap.clientHeight * devicePixelRatio;
		canvas.style.width = wrap.clientWidth + 'px'; canvas.style.height = wrap.clientHeight + 'px';
	}
	onMount(() => { ctx = canvas.getContext('2d'); resize(); build(); loop(); window.addEventListener('resize', resize); });
	onDestroy(() => { if (typeof window !== 'undefined') { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); } });
</script>

<div class="map" bind:this={wrap}>
	<canvas bind:this={canvas} on:pointerdown={down} on:pointermove={move} on:pointerup={up} on:pointerleave={() => { panning = null; hovered = null; }} on:wheel={wheel}
		role="img" aria-label="Map of the library: items joined to their most similar items, coloured by topic"></canvas>
	{#if hovered}
		<div class="tip"><b>{hovered.it.title}</b><span>{hovered.it.topic} · {hovered.it.kind}</span></div>
	{/if}
	<div class="legend">
		{#each topicList as t}<span class:machine={t !== 'Wild card'}><i style="background:{colorOf(t)}"></i>{t}</span>{/each}
	</div>
</div>

<style>
	.map { position: relative; width: 100%; height: min(72vh, 720px); border: 1px solid #000; background: #fafafa; }
	canvas { display: block; touch-action: none; cursor: grab; }
	.tip { position: absolute; left: 10px; bottom: 10px; background: #000; color: #fff; padding: 6px 9px; font-size: 0.8rem; max-width: 60%; display: flex; flex-direction: column; gap: 2px; pointer-events: none; }
	.tip span { opacity: 0.7; font-size: 0.72rem; }
	.legend { position: absolute; right: 8px; top: 8px; max-width: 42%; max-height: 60%; overflow: auto; background: rgba(255, 255, 255, 0.9); border: 1px solid #000; padding: 6px 8px; font-size: 0.68rem; display: flex; flex-direction: column; gap: 2px; }
	/* machine-made topic names carry the AI dashed underline; Wild card is Rhea's */
	.legend .machine { text-decoration: underline dashed; text-underline-offset: 2px; }
	.legend i { display: inline-block; width: 8px; height: 8px; margin-right: 5px; vertical-align: 0; }
</style>
