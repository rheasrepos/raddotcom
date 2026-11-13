<script>
	// The Library as a map, in concentric rings around Rhea (Rhea, 2026-11-13):
	//   centre  — Rhea
	//   ring 1  — everything she saved or published herself (degree 1), arranged
	//             around the ring by topic, joined to its most similar items
	//   ring 2  — publishers who posted something ABOUT her (`via` in the data)
	//   ring 3  — those things (degree 2: Rhea → publisher → item)
	// Similarity links follow the "connected papers" style of research graphs.
	// Force layout + canvas, no libraries. Hover a dot to see it and its
	// neighbours; click to open it; drag to pan; scroll to zoom.
	import { onMount, onDestroy, createEventDispatcher } from 'svelte';
	import AIText from './AIText.svelte';
	export let items = [];
	export let highlight = null; // optional predicate: item → bool (search / topic filter)
	export let colors = null;    // topic → colour, from the page (its sidebar shows the key)
	const dispatch = createEventDispatcher();

	const PALETTE = ['#e6194b', '#3cb44b', '#4363d8', '#f58231', '#911eb4', '#42d4f4', '#f032e6', '#9a6324', '#469990', '#800000', '#808000', '#000075', '#e6a800', '#7a7a7a', '#bfef45', '#dcbeff', '#aaffc3', '#ffd8b1', '#fabed4'];
	let canvas, wrap, ctx, raf;
	let nodes = [], edges = [], spokes = [], hovered = null, center = null;
	const R1 = 420, R2 = 640, R3 = 780; // ring radii
	let view = { x: 0, y: 0, k: 0.42 }, panning = null, alpha = 1;

	$: topicList = [...new Set(items.map((i) => i.topic))].sort((a, b) => (a === 'Wild card' ? -1 : b === 'Wild card' ? 1 : 0));
	$: colorOf = (t) => (colors && colors[t]) || (t === 'Wild card' ? '#000' : PALETTE[topicList.indexOf(t) % PALETTE.length]);

	// each node's border: its own colour, a little darker
	const darkCache = {};
	function darker(hex) {
		if (darkCache[hex]) return darkCache[hex];
		let h = hex.replace('#', ''); if (h.length === 3) h = [...h].map((c) => c + c).join('');
		const v = parseInt(h, 16), f = 0.65;
		return (darkCache[hex] = `rgb(${Math.round((v >> 16) * f)},${Math.round(((v >> 8) & 255) * f)},${Math.round((v & 255) * f)})`);
	}

	function build() {
		// seed each topic in its own sector of ring 1 so groups start apart
		const sector = (t) => (topicList.indexOf(t) / topicList.length) * Math.PI * 2;
		nodes = items.map((it, i) => {
			const a = sector(it.topic) + (Math.random() - 0.5) * 0.6;
			const ring = it.via ? R3 : R1, r = ring + (Math.random() - 0.5) * 60;
			return { i, it, x: Math.cos(a) * r, y: Math.sin(a) * r, vx: 0, vy: 0, deg: 0, ring };
		});
		center = { center: true, x: 0, y: 0, vx: 0, vy: 0, r: 14, ring: 0, label: 'Rhea' };
		// one hub per publisher, on ring 2, placed at the average angle of its items
		const hubs = {};
		for (const n of nodes) if (n.it.via) (hubs[n.it.via] ||= []).push(n);
		spokes = [];
		const hubNodes = Object.entries(hubs).map(([label, kids]) => {
			const a = Math.atan2(kids.reduce((s, k) => s + k.y, 0), kids.reduce((s, k) => s + k.x, 0));
			const h = { hub: true, label, x: Math.cos(a) * R2, y: Math.sin(a) * R2, vx: 0, vy: 0, r: 7, ring: R2, kids };
			spokes.push([center, h]);
			for (const k of kids) spokes.push([h, k]);
			return h;
		});
		for (const n of nodes) if (!n.it.via) spokes.push([center, n]);
		nodes = [...nodes, ...hubNodes];
		const seen = new Set();
		edges = [];
		for (const n of nodes) if (n.it) for (const j of n.it.near || []) { // hubs have no item
			const key = n.i < j ? `${n.i}-${j}` : `${j}-${n.i}`;
			if (seen.has(key) || !nodes[j]) continue;
			seen.add(key); edges.push([n, nodes[j]]); n.deg++; nodes[j].deg++;
		}
		for (const n of nodes) if (!n.hub) n.r = 2.5 + Math.sqrt(n.deg) * 0.9;
		alpha = 1;
	}

	function tick() {
		if (alpha < 0.03) return;
		const REPEL = 260, LINK = 28;
		// grid-bucketed repulsion so 700 nodes stay fast
		const cell = 60, grid = new Map();
		for (const n of nodes) { const k = `${Math.floor(n.x / cell)},${Math.floor(n.y / cell)}`; (grid.get(k) || grid.set(k, []).get(k)).push(n); }
		for (const a of nodes) {
			// pull each dot onto its ring (radial spring) instead of to the centre
			const rr = Math.hypot(a.x, a.y) + 0.01, pull = ((a.ring - rr) / rr) * 0.05;
			a.vx += a.x * pull; a.vy += a.y * pull;
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
		// degree-2 items stay near their publisher's angle
		for (const n of nodes) if (n.hub) for (const k of n.kids) {
			const x = n.x - k.x, y = n.y - k.y; k.vx += x * 0.01; k.vy += y * 0.01;
		}
		for (const n of nodes) { n.vx *= 0.82; n.vy *= 0.82; n.x += n.vx * alpha; n.y += n.vy * alpha; }
		alpha *= 0.992;
	}

	function draw() {
		const W = canvas.width / devicePixelRatio, H = canvas.height / devicePixelRatio;
		ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
		ctx.clearRect(0, 0, W, H); // transparent: the page shows through
		ctx.translate(W / 2 + view.x, H / 2 + view.y); ctx.scale(view.k, view.k);
		const near = hovered ? new Set([hovered, ...(hovered.hub ? hovered.kids : (hovered.it.near || []).map((j) => nodes[j]))]) : null;
		// the rings themselves
		ctx.lineWidth = 1 / view.k; ctx.strokeStyle = 'rgba(0,0,0,0.07)'; ctx.setLineDash([4 / view.k, 6 / view.k]);
		for (const r of [R1, R2, R3]) { ctx.beginPath(); ctx.arc(0, 0, r, 0, Math.PI * 2); ctx.stroke(); }
		ctx.setLineDash([]);
		// spokes (Rhea → item, Rhea → publisher → item): faint, darker for the hovered dot's path
		ctx.lineWidth = 0.5 / view.k;
		for (const [a, b] of spokes) {
			const lit = hovered && (b === hovered || a === hovered || (hovered.it && hovered.it.via && a.hub && a.kids.includes(hovered) ) || (hovered.it && hovered.it.via && b.hub && b.kids.includes(hovered)));
			if (!lit && !b.hub && !a.hub) continue; // the 700 plain spokes are implied by the ring
			ctx.strokeStyle = lit ? 'rgba(0,0,0,0.7)' : 'rgba(0,0,0,0.18)';
			ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
		}
		ctx.lineWidth = 0.6 / view.k;
		for (const [a, b] of edges) {
			const lit = near && (a === hovered || b === hovered);
			ctx.strokeStyle = lit ? '#000' : 'rgba(0,0,0,0.09)';
			ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
		}
		for (const n of nodes) {
			if (n.hub) {
				ctx.globalAlpha = 1; ctx.fillStyle = '#fff'; ctx.strokeStyle = '#000'; ctx.lineWidth = 1.5 / view.k;
				ctx.beginPath(); ctx.arc(n.x, n.y, n === hovered ? n.r + 3 : n.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
				ctx.fillStyle = '#000'; ctx.font = `${10 / view.k}px sans-serif`; ctx.textAlign = 'center';
				ctx.fillText(n.label, n.x, n.y - n.r - 4 / view.k);
				continue;
			}
			const dim = (near && !near.has(n)) || (highlight && !highlight(n.it));
			ctx.globalAlpha = dim ? 0.15 : 1;
			const col = colorOf(n.it.topic);
			ctx.fillStyle = col; ctx.strokeStyle = darker(col); ctx.lineWidth = 1 / view.k;
			ctx.beginPath(); ctx.arc(n.x, n.y, n === hovered ? n.r + 3 : n.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
		}
		ctx.globalAlpha = 1;
		// Rhea, in the middle
		ctx.fillStyle = '#ff8c42'; ctx.strokeStyle = '#000'; ctx.lineWidth = 2 / view.k;
		ctx.beginPath(); ctx.arc(0, 0, center.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
		ctx.fillStyle = '#000'; ctx.font = `bold ${13 / view.k}px sans-serif`; ctx.textAlign = 'center';
		ctx.fillText('Rhea', 0, center.r + 15 / view.k);
		if (near) {
			ctx.fillStyle = '#000'; ctx.font = `${11 / view.k}px sans-serif`; ctx.textAlign = 'center';
			for (const n of near) if (n.it) ctx.fillText(n.it.title.slice(0, 48), n.x, n.y - n.r - 4 / view.k);
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
		if (!moved) { const n = pick(e); if (n && n.it) dispatch('open', n.it); }
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
	{#if hovered && hovered.it}
		<div class="tip" data-no-reveal><b>{hovered.it.title}</b><span>{hovered.it.topic} · {hovered.it.kind}{#if hovered.it.via} · <AIText>posted by {hovered.it.via}</AIText>{/if}</span></div>
	{:else if hovered && hovered.hub}
		<div class="tip" data-no-reveal><b>{hovered.label}</b><span><AIText>{hovered.kids.length} posted about Rhea</AIText></span></div>
	{/if}
</div>

<style>
	.map { position: relative; width: 100%; height: min(72vh, 720px); border: 1px solid #000; background: transparent; }
	canvas { display: block; touch-action: none; cursor: grab; }
	.tip { position: absolute; left: 10px; bottom: 10px; background: #000; color: #fff; padding: 6px 9px; font-size: 0.8rem; max-width: 60%; display: flex; flex-direction: column; gap: 2px; pointer-events: none; }
	.tip span { opacity: 0.7; font-size: 0.72rem; }
</style>
