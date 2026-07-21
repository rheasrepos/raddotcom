<script>
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { loadPosts } from '$lib/posts.js';
	import { categoryConfig, getCategoryColor, getCategoryLabel } from '$lib/categories.js';
	import PageLayout from '../../components/PageLayout.svelte';
	import AIText from '../../components/AIText.svelte';

	const W = 1000;
	const H = 680;

	let nodes = [];
	let links = [];
	let hovered = null;
	let raf = null;
	let running = false;

	// --- node dragging (like Obsidian's graph view) ---
	let svgEl;
	let dragging = null;
	let dragMoved = false;

	function toGraphCoords(e) {
		const rect = svgEl.getBoundingClientRect();
		return {
			x: ((e.clientX - rect.left) / rect.width) * W,
			y: ((e.clientY - rect.top) / rect.height) * H
		};
	}
	function startDrag(n, e) {
		e.preventDefault();
		dragging = n;
		dragMoved = false;
	}
	function onPointerMove(e) {
		if (!dragging) return;
		const p = toGraphCoords(e);
		dragging.x = Math.max(dragging.r, Math.min(W - dragging.r, p.x));
		dragging.y = Math.max(dragging.r, Math.min(H - dragging.r, p.y));
		dragging.vx = 0;
		dragging.vy = 0;
		dragMoved = true;
		nodes = nodes; // trigger reactivity so edges follow while held
	}
	function endDrag() {
		dragging = null;
	}

	function tagsOf(p) {
		if (Array.isArray(p.tags)) return p.tags;
		if (typeof p.tags === 'string') return p.tags.split(',').map((t) => t.trim()).filter(Boolean);
		return [];
	}

	function buildGraph(posts) {
		const cx = W / 2, cy = H / 2;
		const nodeMap = {};
		const hubs = {};

		// Category hub nodes. A hub exists if it has posts, or if it's the
		// parent of a category that has posts (so e.g. Creative appears to
		// tie Comedy and Music together even before it has posts of its own).
		const cats = Object.values(categoryConfig);
		const wanted = new Set();
		cats.forEach((c) => {
			if (posts.some((p) => p.type === c.id)) {
				wanted.add(c.id);
				if (c.parent) wanted.add(c.parent);
			}
		});
		cats.forEach((c) => {
			if (!wanted.has(c.id)) return;
			const n = {
				id: 'cat:' + c.id, kind: 'cat', label: c.label, color: getCategoryColor(c.id),
				r: 16, x: cx + (Math.random() - 0.5) * 200, y: cy + (Math.random() - 0.5) * 200, vx: 0, vy: 0
			};
			hubs[c.id] = n; nodeMap[n.id] = n;
		});

		const L = [];

		// Hub-to-hub family links (comedy → creative, music → creative, …)
		cats.forEach((c) => {
			if (c.parent && hubs[c.id] && hubs[c.parent]) {
				L.push({ source: 'cat:' + c.id, target: 'cat:' + c.parent, w: 1 });
			}
		});
		posts.forEach((p) => {
			const n = {
				id: 'post:' + p.id, kind: 'post', label: p.title, type: p.type,
				color: getCategoryColor(p.type), tags: tagsOf(p), post: p,
				r: 7, x: cx + (Math.random() - 0.5) * 400, y: cy + (Math.random() - 0.5) * 400, vx: 0, vy: 0
			};
			nodeMap[n.id] = n;
			if (hubs[p.type]) L.push({ source: n.id, target: 'cat:' + p.type, w: 1 });
		});

		// Cross-links: posts sharing a tag. Very common tags (e.g. "essay" on
		// dozens of posts) are treated like stop-words — linking every pair
		// would produce a hairball, so only tags shared by ≤ MAX_TAG posts
		// create edges. Nested tags also match on their parent path, so
		// academic/philosophy/x still links to academic/philosophy/y.
		const list = Object.values(nodeMap).filter((n) => n.kind === 'post');
		const expand = (tags) => {
			const out = new Set();
			(tags || []).forEach((t) => {
				const parts = String(t).split('/');
				for (let k = 1; k <= parts.length; k++) out.add(parts.slice(0, k).join('/'));
			});
			return [...out];
		};
		const freq = {};
		list.forEach((n) => { n.xtags = expand(n.tags); n.xtags.forEach((t) => (freq[t] = (freq[t] || 0) + 1)); });
		const MAX_TAG = 10;
		for (let i = 0; i < list.length; i++) {
			for (let j = i + 1; j < list.length; j++) {
				const shared = list[i].xtags.filter((t) => freq[t] <= MAX_TAG && list[j].xtags.includes(t));
				if (shared.length) L.push({ source: list[i].id, target: list[j].id, w: 0.5, tag: shared[0] });
			}
		}
		nodes = Object.values(nodeMap);
		links = L;
	}

	// --- simple force-directed simulation ---
	function step() {
		const cx = W / 2, cy = H / 2;
		const REP = 2600, SPRING = 0.02, DAMP = 0.86, CENTER = 0.006;
		for (let i = 0; i < nodes.length; i++) {
			const a = nodes[i];
			for (let j = i + 1; j < nodes.length; j++) {
				const b = nodes[j];
				let dx = a.x - b.x, dy = a.y - b.y;
				let d2 = dx * dx + dy * dy || 0.01;
				const f = REP / d2;
				const d = Math.sqrt(d2);
				const fx = (dx / d) * f, fy = (dy / d) * f;
				a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy;
			}
		}
		const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
		links.forEach((l) => {
			const s = byId[l.source], t = byId[l.target];
			if (!s || !t) return;
			const dx = t.x - s.x, dy = t.y - s.y;
			const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
			const target = l.w >= 1 ? 70 : 130;
			const f = (dist - target) * SPRING * l.w;
			const fx = (dx / dist) * f, fy = (dy / dist) * f;
			s.vx += fx; s.vy += fy; t.vx -= fx; t.vy -= fy;
		});
		nodes.forEach((n) => {
			// A held node is pinned to the cursor — the sim doesn't move it,
			// but it still repels/pulls its neighbours.
			if (n === dragging) { n.vx = 0; n.vy = 0; return; }
			n.vx += (cx - n.x) * CENTER;
			n.vy += (cy - n.y) * CENTER;
			n.vx *= DAMP; n.vy *= DAMP;
			n.x += n.vx; n.y += n.vy;
			n.x = Math.max(n.r, Math.min(W - n.r, n.x));
			n.y = Math.max(n.r, Math.min(H - n.r, n.y));
		});
		nodes = nodes; // trigger reactivity
	}
	function loop() {
		step();
		if (running) raf = requestAnimationFrame(loop);
	}

	function neighbors(id) {
		const set = new Set();
		links.forEach((l) => {
			if (l.source === id) set.add(l.target);
			if (l.target === id) set.add(l.source);
		});
		return set;
	}
	$: hi = hovered ? neighbors(hovered.id) : null;

	function openNode(n) {
		if (n.kind === 'post') goto('/posts/' + n.post.id);
	}

	onMount(async () => {
		const posts = await loadPosts();
		buildGraph(posts);
		running = true;
		loop();
	});
	onDestroy(() => { running = false; if (raf) cancelAnimationFrame(raf); });
</script>

<svelte:window on:pointermove={onPointerMove} on:pointerup={endDrag} on:pointercancel={endDrag} />

<PageLayout title="Obsidian - Rhea Madhogarhia">
<div class="net-page">
	<header class="net-head">
		<h1>Obsidian</h1>
		<p><AIText>Every post as a node — clustered by category, linked where they share a tag. Like my brain, hopefully. Click a node to open it.</AIText></p>
	</header>

	<div class="net-stage">
		<svg viewBox="0 0 {W} {H}" preserveAspectRatio="xMidYMid meet" class="net-svg" bind:this={svgEl}>
			{#each links as l}
				{@const byId = Object.fromEntries(nodes.map((n) => [n.id, n]))}
				{@const s = byId[l.source]}
				{@const t = byId[l.target]}
				{#if s && t}
					<line
						x1={s.x} y1={s.y} x2={t.x} y2={t.y}
						class="edge {hovered && (l.source === hovered.id || l.target === hovered.id) ? 'hot' : ''}"
						class:dim={hovered && !(l.source === hovered.id || l.target === hovered.id)}
					/>
				{/if}
			{/each}

			{#each nodes as n}
				<g
					class="node {n.kind}"
					class:dim={hovered && hovered.id !== n.id && !(hi && hi.has(n.id))}
					transform="translate({n.x},{n.y})"
					on:mouseenter={() => (hovered = n)}
					on:mouseleave={() => (hovered = null)}
					on:pointerdown={(e) => startDrag(n, e)}
					on:click={() => { if (!dragMoved) openNode(n); }}
					role="button"
					tabindex="0"
				>
					<circle r={n.kind === 'cat' ? n.r : (hovered && hovered.id === n.id ? n.r + 3 : n.r)} fill={n.color} />
					{#if n.kind === 'cat' || (hovered && (hovered.id === n.id || (hi && hi.has(n.id))))}
						<text y={n.kind === 'cat' ? n.r + 16 : n.r + 12} class="node-label {n.kind}">{n.label.length > 34 ? n.label.slice(0, 34) + '…' : n.label}</text>
					{/if}
				</g>
			{/each}
		</svg>

		{#if hovered && hovered.kind === 'post'}
			<div class="net-tooltip">{hovered.label}</div>
		{/if}
	</div>
</div>
</PageLayout>

<style>
	.net-page {
		padding: 4px 0 20px;
		font-family: var(--font-family, Arial, sans-serif);
		color: #111;
	}
	.net-head { max-width: 720px; margin: 0 auto 12px; text-align: center; }
	.net-head h1 { font-size: 2rem; margin: 4px 0; }
	.net-head p { color: #333; font-size: 1rem; margin: 0; }
	.net-stage {
		position: relative;
		max-width: 1100px;
		margin: 10px auto 0;
		background: #191919;
		border: 1px solid #000;
		overflow: hidden;
	}
	.net-svg { width: 100%; height: auto; display: block; touch-action: none; }
	.edge { stroke: rgba(255, 255, 255, 0.22); stroke-width: 1; }
	.edge.hot { stroke: #ffffff; stroke-width: 1.8; }
	.edge.dim { stroke: rgba(255, 255, 255, 0.07); }
	.node { cursor: grab; }
	.node:active { cursor: grabbing; }
	.node.post:hover circle { stroke: #ffffff; stroke-width: 2; }
	.node.cat circle { stroke: #ffffff; stroke-width: 2; }
	.node.dim { opacity: 0.25; }
	/* Labels: single flat colour, no white halo behind the text */
	.node-label { text-anchor: middle; font-size: 11px; fill: #ffffff; }
	.node-label.cat { font-weight: 700; font-size: 12.5px; fill: #ffffff; }
	.net-tooltip {
		position: absolute; left: 50%; bottom: 10px; transform: translateX(-50%);
		background: #000; color: #fff; padding: 6px 12px; border-radius: 0;
		font-size: 0.85rem; max-width: 90%; pointer-events: none;
	}
</style>
