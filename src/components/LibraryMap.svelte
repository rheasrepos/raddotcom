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
	let R1 = 420, R2 = 640, R3 = 780; // ring radii, sized in build() to fit the islands
	let view = { x: 0, y: 0, k: 0.5 }, panning = null, alpha = 1;

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

	// Layout: an embedding map. Each item's text is turned into a vector (by
	// scripts/build-library.py) and squeezed to 2-D with t-SNE, the way word
	// embeddings are plotted, so distance on screen = how similar two items are.
	// Topics are k-means clusters of the same vectors, so each colour is a group of
	// nearby points. All of that sits inside ring 1; the publisher ring and the
	// posts about Rhea sit outside it. A light collision pass keeps dots from
	// stacking exactly on top of each other.
	let centers = {}; // topic → { x, y } (median of its points), for the labels
	const S = 560;    // world units for the unit circle of the embedding
	function build() {
		R1 = S * 1.08; R2 = R1 + 150; R3 = R2 + 120;
		nodes = items.map((it, i) => {
			const [x, y] = it.xy || [0, 0];
			return { i, it, x: x * S, y: y * S, vx: 0, vy: 0, deg: 0, home: { x: x * S, y: y * S } };
		});
		centers = {};
		const groups = {};
		for (const n of nodes) if (!n.it.via) (groups[n.it.topic] ||= []).push(n);
		const med = (v) => { const s = [...v].sort((a, b) => a - b); return s[Math.floor(s.length / 2)]; };
		for (const [t, list] of Object.entries(groups)) centers[t] = { x: med(list.map((n) => n.x)), y: med(list.map((n) => n.y)) };
		center = { center: true, x: 0, y: 0, r: 14, label: 'Rhea' };
		// one hub per publisher on ring 2, beside the "Me online" island; its posts on ring 3
		const hubs = {};
		for (const n of nodes) if (n.it.via) (hubs[n.it.via] ||= []).push(n);
		spokes = [];
		const me = centers['Me online'], base = me ? Math.atan2(me.y, me.x) : 0, H = Object.keys(hubs).length;
		const hubNodes = Object.entries(hubs).map(([label, kids], h) => {
			const a = base + (h - (H - 1) / 2) * 0.16;
			const hub = { hub: true, label, x: Math.cos(a) * R2, y: Math.sin(a) * R2, r: 7, kids };
			kids.forEach((k, j) => { const ka = a + (j - (kids.length - 1) / 2) * 0.03; Object.assign(k, { x: Math.cos(ka) * R3, y: Math.sin(ka) * R3, home: { x: Math.cos(ka) * R3, y: Math.sin(ka) * R3 } }); });
			spokes.push([center, hub]);
			for (const k of kids) spokes.push([hub, k]);
			return hub;
		});
		for (const n of nodes) if (!n.it.via) spokes.push([center, n]);
		nodes = [...nodes, ...hubNodes];
		const seen = new Set();
		edges = [];
		for (const n of nodes) if (n.it) for (const j of n.it.near || []) { // hubs have no item
			const key = n.i < j ? `${n.i}-${j}` : `${j}-${n.i}`;
			if (seen.has(key) || !nodes[j]) continue;
			seen.add(key); edges.push([n, nodes[j], n.it.topic === nodes[j].it.topic]); n.deg++; nodes[j].deg++;
		}
		for (const n of nodes) if (!n.hub) n.r = 2.5 + Math.sqrt(n.deg) * 0.7;
		alpha = 1;
	}

	// a short collision pass: dots push apart only when overlapping, and each is
	// pulled back to its island's centre, so islands stay round and separate
	function tick() {
		if (alpha < 0.02) return;
		const cell = 14, grid = new Map();
		for (const n of nodes) if (n.it) { const k = `${Math.floor(n.x / cell)},${Math.floor(n.y / cell)}`; (grid.get(k) || grid.set(k, []).get(k)).push(n); }
		for (const a of nodes) {
			if (!a.it) continue;
			a.vx += (a.home.x - a.x) * 0.01; a.vy += (a.home.y - a.y) * 0.01;
			const cx = Math.floor(a.x / cell), cy = Math.floor(a.y / cell);
			for (let dx = -1; dx <= 1; dx++) for (let dy = -1; dy <= 1; dy++) for (const b of grid.get(`${cx + dx},${cy + dy}`) || []) {
				if (b === a) continue;
				const x = a.x - b.x, y = a.y - b.y, d = Math.hypot(x, y) + 0.01, min = a.r + b.r + 2.5;
				if (d < min) { const f = ((min - d) / d) * 0.25; a.vx += x * f; a.vy += y * f; }
			}
		}
		for (const n of nodes) if (n.it) { n.vx *= 0.7; n.vy *= 0.7; n.x += n.vx * alpha; n.y += n.vy * alpha; }
		alpha *= 0.985;
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
		for (const [a, b, same] of edges) {
			const lit = near && (a === hovered || b === hovered);
			if (!lit && !same) continue; // links between islands only show on hover
			ctx.strokeStyle = lit ? '#000' : 'rgba(0,0,0,0.12)';
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
		// each topic's name at the middle of its points.
		// Machine-made names get the dashed AI underline, as in the sidebar.
		ctx.font = `bold ${11 / view.k}px sans-serif`; ctx.textAlign = 'center';
		for (const [t, c] of Object.entries(centers)) {
			const lx = c.x, ly = c.y - 10 / view.k;
			const dim = highlight && !nodes.some((n) => n.it && n.it.topic === t && highlight(n.it));
			ctx.globalAlpha = dim ? 0.25 : 1; ctx.fillStyle = darker(colorOf(t));
			ctx.fillText(t, lx, ly);
			if (t !== 'Wild card' && t !== 'Me online') {
				const w = ctx.measureText(t).width;
				ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 1 / view.k; ctx.setLineDash([3 / view.k, 2 / view.k]);
				ctx.beginPath(); ctx.moveTo(lx - w / 2, ly + 3 / view.k); ctx.lineTo(lx + w / 2, ly + 3 / view.k); ctx.stroke(); ctx.setLineDash([]);
			}
		}
		ctx.globalAlpha = 1;
		// Rhea, in the middle
		ctx.strokeStyle = '#000'; ctx.lineWidth = 2 / view.k;
		ctx.beginPath(); ctx.arc(0, 0, center.r, 0, Math.PI * 2); ctx.stroke(); // hollow: dots under it stay visible
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
	// zoom about a screen point (mx, my measured from the canvas centre)
	function zoomAt(k, mx = 0, my = 0) {
		k = Math.max(0.15, Math.min(8, k));
		view.x = mx - (mx - view.x) * (k / view.k); view.y = my - (my - view.y) * (k / view.k); view.k = k;
	}
	function wheel(e) {
		e.preventDefault(); // registered non-passive, so the page doesn't scroll and a trackpad pinch doesn't zoom the browser
		const r = canvas.getBoundingClientRect();
		zoomAt(view.k * Math.exp(-e.deltaY * (e.ctrlKey ? 0.01 : 0.0015)), e.clientX - r.left - r.width / 2, e.clientY - r.top - r.height / 2);
	}
	function resize() {
		canvas.width = wrap.clientWidth * devicePixelRatio; canvas.height = wrap.clientHeight * devicePixelRatio;
		canvas.style.width = wrap.clientWidth + 'px'; canvas.style.height = wrap.clientHeight + 'px';
	}
	onMount(() => { ctx = canvas.getContext('2d'); resize(); build(); loop(); window.addEventListener('resize', resize); canvas.addEventListener('wheel', wheel, { passive: false }); });
	onDestroy(() => { if (typeof window !== 'undefined') { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); } });
</script>

<div class="map" bind:this={wrap}>
	<canvas bind:this={canvas} on:pointerdown={down} on:pointermove={move} on:pointerup={up} on:pointerleave={() => { panning = null; hovered = null; }}		role="img" aria-label="Map of the library: items joined to their most similar items, coloured by topic"></canvas>
	<div class="zoom">
		<button on:click={() => zoomAt(view.k * 1.4)} aria-label="zoom in">+</button>
		<button on:click={() => zoomAt(view.k / 1.4)} aria-label="zoom out">−</button>
		<button on:click={() => { view = { x: 0, y: 0, k: 0.5 }; }}>reset</button>
	</div>
	{#if hovered && hovered.it}
		<div class="tip" data-no-reveal><b>{#if hovered.it.ai_title}<AIText>{hovered.it.title}</AIText>{:else}{hovered.it.title}{/if}</b><span>{hovered.it.topic} · {hovered.it.kind}{#if hovered.it.via} · <AIText>posted by {hovered.it.via}</AIText>{/if}</span></div>
	{:else if hovered && hovered.hub}
		<div class="tip" data-no-reveal><b>{hovered.label}</b><span><AIText>{hovered.kids.length} posted about Rhea</AIText></span></div>
	{/if}
</div>

<style>
	.map { position: relative; width: 100%; height: min(72vh, 720px); border: 1px solid #000; background: transparent; }
	canvas { display: block; touch-action: none; cursor: grab; }
	.tip { position: absolute; left: 10px; bottom: 10px; background: #000; color: #fff; padding: 6px 9px; font-size: 0.8rem; max-width: 60%; display: flex; flex-direction: column; gap: 2px; pointer-events: none; }
	.zoom { position: absolute; top: 8px; right: 8px; display: flex; gap: 4px; }
	.zoom button { font: inherit; font-size: 0.8rem; min-width: 26px; padding: 2px 8px; border: 1px solid #000; background: #c0c0c0; cursor: pointer; }
	.tip span { opacity: 0.7; font-size: 0.72rem; }
</style>
