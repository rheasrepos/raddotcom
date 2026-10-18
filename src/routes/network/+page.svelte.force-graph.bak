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
	let alpha = 1; // simulation "heat" — decays so the graph SETTLES and stops

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
		reheat(0.25); // let neighbours follow the node you're dragging
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
		// Each category gets a fixed ANCHOR spread around a ring, so categories
		// form distinct clusters instead of piling into the middle.
		const wantedList = cats.filter((c) => wanted.has(c.id));
		wantedList.forEach((c, i) => {
			const ang = (2 * Math.PI * i) / Math.max(1, wantedList.length) - Math.PI / 2;
			const ax = cx + Math.cos(ang) * 270, ay = cy + Math.sin(ang) * 200;
			const n = {
				id: 'cat:' + c.id, kind: 'cat', label: c.label, color: getCategoryColor(c.id),
				r: 15, ax, ay, x: ax, y: ay, vx: 0, vy: 0
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
			const h = hubs[p.type];
			const ax = h ? h.ax : cx, ay = h ? h.ay : cy;
			const n = {
				id: 'post:' + p.id, kind: 'post', label: p.title, type: p.type,
				color: getCategoryColor(p.type), tags: tagsOf(p), post: p,
				r: 6, ax, ay,
				x: ax + (Math.random() - 0.5) * 120, y: ay + (Math.random() - 0.5) * 120, vx: 0, vy: 0
			};
			nodeMap[n.id] = n;
			if (hubs[p.type]) L.push({ source: n.id, target: 'cat:' + p.type, w: 1 });
		});

		// --- TOPIC NODES ---------------------------------------------------
		// Every tag becomes a node in its own right, and its SIZE is how many
		// notes carry it. So the graph shows which ideas you return to — a
		// post is always the same small dot; topics are what grow.
		const tagCount = {};
		posts.forEach((p) => {
			const seen = new Set();
			tagsOf(p).forEach((t) => {
				String(t).split('/').reduce((acc, part) => {
					const path = acc ? acc + '/' + part : part;
					seen.add(path);
					return path;
				}, '');
			});
			seen.forEach((t) => (tagCount[t] = (tagCount[t] || 0) + 1));
		});
		// Skip bookkeeping tags and any tag on only one note (nothing to connect).
		const SKIP = /^(affiliation|meta|artifact|analog-archive|scraps|daily|seed|links|list)\b/;
		Object.entries(tagCount).forEach(([t, count]) => {
			if (count < 2 || SKIP.test(t)) return;
			const n = {
				id: 'tag:' + t, kind: 'tag', label: '#' + t, count,
				color: '#cfcfcf',
				r: 5 + Math.sqrt(count) * 3.4, // area ∝ how many notes share the idea
				ax: cx, ay: cy,
				x: cx + (Math.random() - 0.5) * 300, y: cy + (Math.random() - 0.5) * 300, vx: 0, vy: 0
			};
			nodeMap[n.id] = n;
		});
		// Attach each post to its topics.
		posts.forEach((p) => {
			const seen = new Set();
			tagsOf(p).forEach((t) => {
				String(t).split('/').reduce((acc, part) => {
					const path = acc ? acc + '/' + part : part;
					seen.add(path);
					return path;
				}, '');
			});
			seen.forEach((t) => {
				if (nodeMap['tag:' + t]) L.push({ source: 'post:' + p.id, target: 'tag:' + t, w: 0.8 });
			});
		});
		// Nest topics: academic/philosophy → academic
		Object.keys(tagCount).forEach((t) => {
			const parent = t.split('/').slice(0, -1).join('/');
			if (parent && nodeMap['tag:' + t] && nodeMap['tag:' + parent]) {
				L.push({ source: 'tag:' + t, target: 'tag:' + parent, w: 1 });
			}
		});

		// Posts connect THROUGH topics now, not directly to each other — the
		// topic node is the shared thing, so it carries the weight and grows.
		nodes = Object.values(nodeMap);
		links = L;
	}

	// --- force-directed simulation with cooling (settles, then stops) ---
	function reheat(a = 0.6) {
		alpha = Math.max(alpha, a);
		if (!running) { running = true; loop(); }
	}
	function step() {
		const REP = 2200, SPRING = 0.04, DAMP = 0.82, GRAV = 0.018;
		// Repulsion + hard collision (short range → fast and keeps clusters tight)
		for (let i = 0; i < nodes.length; i++) {
			const a = nodes[i];
			for (let j = i + 1; j < nodes.length; j++) {
				const b = nodes[j];
				let dx = a.x - b.x, dy = a.y - b.y;
				let d2 = dx * dx + dy * dy || 0.01;
				const d = Math.sqrt(d2);
				if (d > 240) continue; // ignore far pairs — big speedup at 200+ nodes
				const f = REP / d2;
				let fx = (dx / d) * f, fy = (dy / d) * f;
				// collision: never let two circles overlap
				const min = a.r + b.r + 12;   // wider keep-apart gap → less visual overlap
				if (d < min) {
					const push = (min - d) * 0.9;
					fx += (dx / d) * push; fy += (dy / d) * push;
				}
				a.vx += fx; a.vy += fy; b.vx -= fx; b.vy -= fy;
			}
		}
		const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
		links.forEach((l) => {
			const s = byId[l.source], t = byId[l.target];
			if (!s || !t) return;
			const dx = t.x - s.x, dy = t.y - s.y;
			const dist = Math.sqrt(dx * dx + dy * dy) || 0.01;
			const target = l.w >= 1 ? 74 : 58;
			const f = (dist - target) * SPRING * l.w;
			const fx = (dx / dist) * f, fy = (dy / dist) * f;
			s.vx += fx; s.vy += fy; t.vx -= fx; t.vy -= fy;
		});
		nodes.forEach((n) => {
			if (n === dragging) { n.vx = 0; n.vy = 0; return; }
			// pull toward the node's category anchor → visible per-category clusters
			n.vx += (n.ax - n.x) * GRAV;
			n.vy += (n.ay - n.y) * GRAV;
			n.vx *= DAMP; n.vy *= DAMP;
			// movement scales with alpha, so the whole thing cools to a stop
			n.x += n.vx * alpha; n.y += n.vy * alpha;
			n.x = Math.max(n.r, Math.min(W - n.r, n.x));
			n.y = Math.max(n.r, Math.min(H - n.r, n.y));
		});
		alpha *= 0.985; // cool down
		nodes = nodes; // trigger reactivity
	}
	function loop() {
		step();
		if (running && alpha > 0.02) raf = requestAnimationFrame(loop);
		else { running = false; }
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
		alpha = 1;
		reheat(1);
	});
	onDestroy(() => { running = false; if (raf) cancelAnimationFrame(raf); });
</script>

<svelte:window on:pointermove={onPointerMove} on:pointerup={endDrag} on:pointercancel={endDrag} />

<PageLayout title="Obsidian - Rhea Madhogarhia">
<div class="net-page">
	<header class="net-head">
		<h1>Obsidian</h1>
		<p><AIText>Posts are small, fixed dots. <strong>Topics grow</strong> — a topic node's size is how many pieces of writing carry it, so the ideas I keep returning to are the biggest things here. Drag anything; click a post to open it.</AIText></p>
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
					<circle r={n.kind === 'post' && hovered && hovered.id === n.id ? n.r + 3 : n.r} fill={n.color} />
					{#if n.kind === 'cat' || (n.kind === 'tag' && n.count >= 4) || (hovered && (hovered.id === n.id || (hi && hi.has(n.id))))}
						<text y={n.r + (n.kind === 'cat' ? 16 : 12)} class="node-label {n.kind}">
							{n.label.length > 34 ? n.label.slice(0, 34) + '…' : n.label}{#if n.kind === 'tag'} ({n.count}){/if}
						</text>
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
		background: #0c0c0c;
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
	/* Labels: terminal/mono, single flat colour, no halo */
	.node-label { text-anchor: middle; font-size: 10.5px; fill: #eaeaea; font-family: 'SF Mono', ui-monospace, Menlo, monospace; letter-spacing: -0.02em; }
	.node-label.cat { font-weight: 700; font-size: 12px; fill: #ffffff; text-transform: lowercase; }
	.node-label.tag { fill: #b8b8b8; font-size: 10.5px; }
	.node.tag circle { stroke: #777; stroke-width: 1; }
	.net-tooltip {
		position: absolute; left: 50%; bottom: 10px; transform: translateX(-50%);
		background: #000; color: #fff; padding: 6px 12px; border-radius: 0;
		font-size: 0.85rem; max-width: 90%; pointer-events: none;
	}
</style>
