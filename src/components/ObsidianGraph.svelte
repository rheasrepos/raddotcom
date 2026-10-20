<script>
	// A recreation of Obsidian's own Graph view for the published vault.
	// Obsidian has no API that exports its graph (it's drawn inside the app),
	// so this draws the same thing from the same data: every note is a node,
	// every [[wikilink]] is an edge, node size grows with link count, hovering
	// a node lights up its neighbourhood and fades the rest, labels fade in as
	// you zoom. Force layout + interaction are written here (no d3) so the
	// page stays dependency-free.
	//
	// props: notes  — vault-space.json `notes` (needs `links`, `tags`, `type`)
	//        query  — regex string; matching nodes are highlighted
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { getCategoryColor, getCategoryLabel } from '$lib/categories.js';

	export let notes = [];
	export let query = '';

	// Obsidian's Filters / Groups panel, reduced to what matters here
	let showTopics = true;   // the "Topic - …" hub notes
	let showTags = false;    // Obsidian: Filters → Tags
	let showOrphans = true;  // Obsidian: Filters → Orphans
	let showLabels = true;   // text
	let groups = false;      // Obsidian: Groups → colour by folder (off = all grey, the default)

	// Obsidian default-dark palette
	const C = { bg: '#1e1e1e', node: '#a6a6a6', hub: '#8a8a8a', tag: '#6f6f6f', line: '#4a4a4a', text: '#dcddde', accent: '#a882ff' };

	let canvas, wrap, ctx, raf;
	let nodes = [], edges = [], byId = new Map();
	let hovered = null, dragging = null, panning = null, moved = false;
	let view = { x: 0, y: 0, k: 1 };     // pan + zoom
	let alpha = 1;                        // simulation "temperature"

	function cssColor(c) {
		if (!c || !c.startsWith('var(')) return c || C.node;
		return getComputedStyle(document.documentElement).getPropertyValue(c.slice(4, -1).trim()).trim() || C.node;
	}

	// ---- build graph from notes -------------------------------------------
	function build() {
		const keep = new Map();
		const add = (id, n) => { if (!keep.has(id)) keep.set(id, { id, vx: 0, vy: 0, x: (Math.random() - 0.5) * 600, y: (Math.random() - 0.5) * 600, deg: 0, ...n }); return keep.get(id); };
		const links = [];
		for (const n of notes) {
			add(n.id, { kind: 'note', label: n.title, note: n });
			for (const t of n.links || []) {
				if (t.startsWith('topic:')) { if (!showTopics) continue; add(t, { kind: 'topic', label: t.slice(6) }); }
				links.push([n.id, t]);
			}
			if (showTags) for (const tg of n.tags || []) { const id = 'tag:' + tg; add(id, { kind: 'tag', label: '#' + tg }); links.push([n.id, id]); }
		}
		edges = [];
		for (const [a, b] of links) {
			const A = keep.get(a), B = keep.get(b);
			if (!A || !B) continue; // link to an unpublished note: dropped
			edges.push([A, B]); A.deg++; B.deg++;
		}
		let list = [...keep.values()];
		if (!showOrphans) list = list.filter((n) => n.deg > 0);
		// keep positions of nodes that already existed so toggles don't reshuffle
		for (const n of list) { const old = byId.get(n.id); if (old) { n.x = old.x; n.y = old.y; } }
		nodes = list; byId = new Map(nodes.map((n) => [n.id, n]));
		for (const n of nodes) n.r = 3 + 1.8 * Math.sqrt(n.deg);
		alpha = 1;
	}
	$: if (ctx) { showTopics; showTags; showOrphans; build(); }

	// ---- force simulation (centre + repel + link, like Obsidian's sliders) ---
	function tick() {
		const REPEL = 1400, LINK = 90, CENTER = 0.012, DAMP = 0.86;
		for (let i = 0; i < nodes.length; i++) {
			const a = nodes[i];
			a.vx -= a.x * CENTER; a.vy -= a.y * CENTER;
			for (let j = i + 1; j < nodes.length; j++) {
				const b = nodes[j];
				let dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy + 0.01;
				if (d2 > 250000) continue;
				const f = REPEL / d2, d = Math.sqrt(d2);
				dx = (dx / d) * f; dy = (dy / d) * f;
				a.vx += dx; a.vy += dy; b.vx -= dx; b.vy -= dy;
			}
		}
		for (const [a, b] of edges) {
			const dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) + 0.01;
			const f = ((d - LINK) / d) * 0.05;
			a.vx += dx * f; a.vy += dy * f; b.vx -= dx * f; b.vy -= dy * f;
		}
		for (const n of nodes) {
			if (n === dragging) { n.vx = n.vy = 0; continue; }
			n.vx *= DAMP; n.vy *= DAMP;
			n.x += n.vx * alpha; n.y += n.vy * alpha;
		}
		alpha = Math.max(0.02, alpha * 0.995);
	}

	// ---- drawing ------------------------------------------------------------
	function matches(n) {
		if (!query) return false;
		try { const re = new RegExp(query, 'i'); return re.test(n.label) || (n.note && (n.note.tags.some((t) => re.test(t)) || re.test(n.note.type))); } catch { return false; }
	}
	function neighbours(n) {
		const s = new Set([n]);
		for (const [a, b] of edges) { if (a === n) s.add(b); if (b === n) s.add(a); }
		return s;
	}
	function colorOf(n) {
		if (n.kind === 'topic') return C.hub;
		if (n.kind === 'tag') return C.tag;
		return groups ? cssColor(getCategoryColor(n.note.type)) : C.node;
	}
	function draw() {
		const W = canvas.width / devicePixelRatio, H = canvas.height / devicePixelRatio;
		ctx.save(); ctx.setTransform(devicePixelRatio, 0, 0, devicePixelRatio, 0, 0);
		ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
		ctx.translate(W / 2 + view.x, H / 2 + view.y); ctx.scale(view.k, view.k);
		const focus = hovered ? neighbours(hovered) : null;
		const anyQ = !!query;
		// edges
		ctx.lineWidth = 1 / view.k;
		for (const [a, b] of edges) {
			const lit = focus ? (a === hovered || b === hovered) : true;
			ctx.strokeStyle = lit && focus ? C.accent : C.line;
			ctx.globalAlpha = focus ? (lit ? 0.9 : 0.06) : 0.6;
			ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
		}
		// nodes
		for (const n of nodes) {
			const inFocus = !focus || focus.has(n);
			const hit = anyQ && matches(n);
			ctx.globalAlpha = focus ? (inFocus ? 1 : 0.12) : anyQ ? (hit ? 1 : 0.18) : 1;
			ctx.fillStyle = n === hovered || hit ? C.accent : colorOf(n);
			ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2); ctx.fill();
		}
		// labels fade in with zoom (Obsidian behaviour); always on for the focus set
		const labelAlpha = Math.max(0, Math.min(1, (view.k - 0.55) / 0.7));
		if (showLabels || focus) {
			ctx.fillStyle = C.text; ctx.textAlign = 'center'; ctx.textBaseline = 'top';
			ctx.font = `${11 / view.k}px -apple-system, "Segoe UI", sans-serif`;
			for (const n of nodes) {
				const inFocus = focus && focus.has(n);
				const a = inFocus ? 1 : focus ? 0 : showLabels ? labelAlpha * (anyQ && !matches(n) ? 0.2 : 1) : 0;
				if (a <= 0.02) continue;
				ctx.globalAlpha = a;
				ctx.fillText(n.label, n.x, n.y + n.r + 3 / view.k);
			}
		}
		ctx.restore();
	}
	function loop() { tick(); draw(); raf = requestAnimationFrame(loop); }

	// ---- interaction ----------------------------------------------------------
	function toWorld(e) {
		const r = canvas.getBoundingClientRect();
		return { x: (e.clientX - r.left - r.width / 2 - view.x) / view.k, y: (e.clientY - r.top - r.height / 2 - view.y) / view.k };
	}
	function pick(e) {
		const p = toWorld(e); let best = null, bd = Infinity;
		for (const n of nodes) { const d = Math.hypot(n.x - p.x, n.y - p.y); if (d < Math.max(n.r + 3, 7 / view.k) && d < bd) { best = n; bd = d; } }
		return best;
	}
	function onDown(e) {
		moved = false;
		const n = pick(e);
		if (n) { dragging = n; alpha = Math.max(alpha, 0.3); }
		else panning = { x: e.clientX - view.x, y: e.clientY - view.y };
		canvas.setPointerCapture(e.pointerId);
	}
	function onMove(e) {
		if (dragging) { const p = toWorld(e); dragging.x = p.x; dragging.y = p.y; moved = true; alpha = Math.max(alpha, 0.3); return; }
		if (panning) { view.x = e.clientX - panning.x; view.y = e.clientY - panning.y; moved = true; return; }
		hovered = pick(e);
		canvas.style.cursor = hovered ? 'pointer' : 'grab';
	}
	function onUp(e) {
		const n = dragging; dragging = null; panning = null;
		if (n && !moved && n.kind === 'note') goto('/posts/' + n.id);
	}
	function onWheel(e) {
		e.preventDefault();
		const r = canvas.getBoundingClientRect();
		const mx = e.clientX - r.left - r.width / 2, my = e.clientY - r.top - r.height / 2;
		const k = Math.max(0.15, Math.min(6, view.k * Math.exp(-e.deltaY * 0.0015)));
		// zoom around the cursor
		view.x = mx - (mx - view.x) * (k / view.k); view.y = my - (my - view.y) * (k / view.k); view.k = k;
	}
	function resize() {
		const w = wrap.clientWidth, h = wrap.clientHeight;
		canvas.width = w * devicePixelRatio; canvas.height = h * devicePixelRatio;
		canvas.style.width = w + 'px'; canvas.style.height = h + 'px';
	}

	onMount(() => {
		ctx = canvas.getContext('2d');
		resize(); build(); loop();
		window.addEventListener('resize', resize);
	});
	onDestroy(() => { if (typeof window !== 'undefined') { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); } });
</script>

<div class="og-wrap" bind:this={wrap}>
	<canvas bind:this={canvas}
		on:pointerdown={onDown} on:pointermove={onMove} on:pointerup={onUp} on:pointerleave={() => (hovered = null)}
		on:wheel={onWheel} role="img" aria-label="Graph of the notes and their links"></canvas>
	{#if hovered}
		<div class="og-tip">
			<strong>{hovered.label}</strong>
			<span class="muted">
				{#if hovered.kind === 'note'}{hovered.note.date || 'undated'} · {getCategoryLabel(hovered.note.type)}{:else if hovered.kind === 'topic'}topic{:else}tag{/if}
				· {hovered.deg} link{hovered.deg === 1 ? '' : 's'}
			</span>
		</div>
	{/if}
	<!-- Obsidian's Filters / Groups panel, in miniature -->
	<div class="og-panel">
		<label><input type="checkbox" bind:checked={showTopics} /> topics</label>
		<label><input type="checkbox" bind:checked={showTags} /> tags</label>
		<label><input type="checkbox" bind:checked={showOrphans} /> orphans</label>
		<label><input type="checkbox" bind:checked={showLabels} /> text</label>
		<label><input type="checkbox" bind:checked={groups} /> groups (colour by folder)</label>
		<span class="muted">{nodes.length} nodes · {edges.length} links</span>
	</div>
</div>

<style>
	.og-wrap { position: relative; width: 100%; height: 100%; background: #1e1e1e; }
	canvas { display: block; cursor: grab; touch-action: none; }
	.og-tip { position: absolute; left: 12px; bottom: 12px; display: flex; flex-direction: column; gap: 2px; padding: 8px 10px; background: rgba(0, 0, 0, 0.72); color: #fff; border-radius: 4px; font-size: 0.85em; pointer-events: none; max-width: 60%; }
	.og-panel { position: absolute; right: 10px; top: 10px; display: flex; flex-direction: column; gap: 4px; padding: 8px 10px; background: rgba(30, 30, 30, 0.9); border: 1px solid #3a3a3a; border-radius: 6px; color: #dcddde; font-size: 0.78em; }
	.og-panel label { display: flex; align-items: center; gap: 6px; cursor: pointer; }
	.muted { opacity: 0.65; }
</style>
