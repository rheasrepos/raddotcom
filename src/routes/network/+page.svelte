<script>
	// Obsidian page: every published note is a point in a 3-D space built from
	// the notes' own words (scripts/embed-vault.py → static/vault-space.json).
	// Near points are notes that use the same vocabulary. The line joins them in
	// date order, so it is the path my writing took through that space.
	import { onMount, onDestroy } from 'svelte';
	import { goto } from '$app/navigation';
	import { categoryConfig, getCategoryColor, getCategoryLabel } from '$lib/categories.js';
	import PageLayout from '../../components/PageLayout.svelte';
	import ObsidianGraph from '../../components/ObsidianGraph.svelte';
	import AIText from '../../components/AIText.svelte';

	// Two ways to see the same notes:
	//   'space' — the 3-D embedding (position = what the note is about)
	//   'graph' — a recreation of Obsidian's Graph view (position = what links to what)
	let mode = 'space';

	let stage;            // the div the canvas lives in
	let data = null;      // vault-space.json
	let hovered = null;   // note under the pointer
	let showPath = true;
	let flat = '3d';      // '3d' | '12' | '13' | '23'
	let query = '';
	let upTo = 1;         // how many notes (in date order) are drawn
	let status = 'loading…';

	// three.js state (kept out of Svelte reactivity on purpose)
	let THREE, renderer, scene, persp, ortho, camera, dyn, raf;
	let theta = 0.9, phi = 1.15, dist = 2.6;
	let drag = null, moved = false;
	const target = { x: 0, y: 0, z: 0 };
	let pts = [];         // [{note, v: THREE.Vector3, color: THREE.Color}]

	// resolve `var(--color-x)` category colors to real hex for the GPU
	function cssColor(c) {
		if (!c.startsWith('var(')) return c;
		const name = c.slice(4, -1).trim();
		return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || '#9aa3b2';
	}

	function placeCam() {
		const w = stage.clientWidth, h = stage.clientHeight;
		renderer.setSize(w, h, false);
		persp.aspect = w / h; persp.updateProjectionMatrix();
		const a = w / h, z = dist * 0.42;
		ortho.left = -z * a; ortho.right = z * a; ortho.top = z; ortho.bottom = -z; ortho.updateProjectionMatrix();
		camera.position.set(
			target.x + dist * Math.sin(phi) * Math.cos(theta),
			target.y + dist * Math.cos(phi),
			target.z + dist * Math.sin(phi) * Math.sin(theta)
		);
		camera.lookAt(target.x, target.y, target.z);
	}

	function setView(v) {
		flat = v;
		if (v === '3d') { camera = persp; theta = 0.9; phi = 1.15; }
		else {
			camera = ortho;
			if (v === '12') { theta = Math.PI / 2; phi = Math.PI / 2; }
			if (v === '13') { theta = 0; phi = 1e-3; }
			if (v === '23') { theta = 0; phi = Math.PI / 2; }
		}
		placeCam(); draw();
	}

	function matches(n) {
		if (!query) return false;
		try { const re = new RegExp(query, 'i'); return re.test(n.title) || n.tags.some((t) => re.test(t)) || re.test(n.type); }
		catch { return false; }
	}

	function draw() {
		if (!renderer || !data) return;
		while (dyn.children.length) dyn.remove(dyn.children[0]);
		const shown = pts.slice(0, upTo);
		const anyQuery = !!query;

		// the path through time
		if (showPath && shown.length > 1) {
			const g = new THREE.BufferGeometry().setFromPoints(shown.map((p) => p.v));
			const cols = new Float32Array(shown.flatMap((p) => [p.color.r, p.color.g, p.color.b]));
			g.setAttribute('color', new THREE.BufferAttribute(cols, 3));
			dyn.add(new THREE.Line(g, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0.45 })));
		}
		// the notes
		for (const p of shown) {
			const hit = anyQuery && matches(p.note);
			const isHov = hovered && hovered.id === p.note.id;
			const r = isHov ? 0.03 : hit ? 0.024 : 0.014;
			const m = new THREE.Mesh(new THREE.SphereGeometry(r, 12, 12),
				new THREE.MeshBasicMaterial({ color: p.color, transparent: true, opacity: anyQuery && !hit ? 0.18 : 1 }));
			m.position.copy(p.v); m.userData = p.note; dyn.add(m);
		}
		// thread the search hits in order
		if (anyQuery) {
			const hits = shown.filter((p) => matches(p.note)).map((p) => p.v);
			if (hits.length > 1) dyn.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(hits),
				new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 })));
		}
		// faint axes
		for (const [v, c] of [[[1, 0, 0], 0x7a4a4a], [[0, 1, 0], 0x4a7a55], [[0, 0, 1], 0x4a5a7a]]) {
			const g = new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(...v.map((x) => -x * 1.3)), new THREE.Vector3(...v.map((x) => x * 1.3))]);
			dyn.add(new THREE.Line(g, new THREE.LineBasicMaterial({ color: c, transparent: true, opacity: 0.6 })));
		}
		renderer.render(scene, camera);
	}

	// pointer → which note
	const ray = { caster: null, ndc: null };
	function pick(e) {
		const rect = renderer.domElement.getBoundingClientRect();
		ray.ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
		ray.caster.setFromCamera(ray.ndc, camera);
		const hit = ray.caster.intersectObjects(dyn.children.filter((o) => o.isMesh));
		return hit.length ? hit[0].object.userData : null;
	}
	function onDown(e) { if (mode !== 'space') return; drag = [e.clientX, e.clientY]; moved = false; }
	function onMove(e) {
		if (mode !== 'space') return;
		if (drag) {
			theta += (e.clientX - drag[0]) * 0.008;
			phi = Math.max(0.15, Math.min(Math.PI - 0.15, phi - (e.clientY - drag[1]) * 0.008));
			if (Math.abs(e.clientX - drag[0]) + Math.abs(e.clientY - drag[1]) > 2) moved = true;
			drag = [e.clientX, e.clientY]; placeCam(); draw(); return;
		}
		const n = pick(e);
		if ((n && n.id) !== (hovered && hovered.id)) { hovered = n; draw(); }
	}
	function onUp(e) {
		if (mode !== 'space') return;
		const wasDrag = moved; drag = null;
		if (wasDrag) return;
		const n = pick(e);
		if (n) goto('/posts/' + n.id);
	}
	function onWheel(e) { if (mode !== 'space') return; e.preventDefault(); dist = Math.max(0.6, Math.min(8, dist * (1 + e.deltaY * 0.001))); placeCam(); draw(); }

	onMount(async () => {
		try {
			const r = await fetch('/vault-space.json');
			if (!r.ok) throw new Error('no vault-space.json — run scripts/embed-vault.py');
			data = await r.json();
		} catch (e) { status = e.message; return; }

		// three.js from the CDN (same build the machine-fiddling viewers use)
		await new Promise((res, rej) => {
			if (window.THREE) return res();
			const s = document.createElement('script');
			s.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
			s.onload = res; s.onerror = () => rej(new Error('could not load three.js')); document.head.appendChild(s);
		}).catch((e) => { status = e.message; });
		if (!window.THREE) return;
		THREE = window.THREE;

		renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
		renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
		renderer.setClearColor(0x000000, 0);
		stage.appendChild(renderer.domElement);
		scene = new THREE.Scene(); dyn = new THREE.Group(); scene.add(dyn);
		persp = new THREE.PerspectiveCamera(40, 1, 0.01, 100);
		ortho = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 100);
		camera = persp;
		ray.caster = new THREE.Raycaster(); ray.caster.params.Points = { threshold: 0.02 }; ray.ndc = new THREE.Vector2();

		pts = data.notes.map((n) => ({ note: n, v: new THREE.Vector3(...n.xyz), color: new THREE.Color(cssColor(getCategoryColor(n.type))) }));
		upTo = pts.length;
		status = '';
		placeCam(); draw();
		window.addEventListener('resize', onResize);
	});
	function onResize() { if (renderer) { placeCam(); draw(); } }
	onDestroy(() => { if (typeof window !== 'undefined') window.removeEventListener('resize', onResize); if (renderer) renderer.dispose(); });

	$: if (renderer) { upTo; showPath; query; draw(); }

	const legend = Object.values(categoryConfig).filter((c) => !c.parent || true);
	$: usedTypes = data ? [...new Set(data.notes.map((n) => n.type))] : [];
</script>

<PageLayout title="Obsidian - Rhea Madhogarhia">
<div class="space-page">
	<header class="space-head">
		<h1>Obsidian</h1>
		<div class="mode">
			<button class:on={mode === 'space'} on:click={() => (mode = 'space')}>space</button>
			<button class:on={mode === 'graph'} on:click={() => (mode = 'graph')}>graph</button>
		</div>
		{#if mode === 'space'}
		<p>
			<AIText>Every published note is a point. Its position comes from the words in it, so notes that talk about the same things sit near each other.
			The line joins the notes in the order I wrote them. Drag to turn it, scroll to zoom, click a point to read the note.</AIText>
			{#if data}<span class="meta"><AIText>{data.count} notes with text (the words of an attached PDF count){data.left_out ? ` — ${data.left_out} image-only scans and artworks have no words to place, so they're only in the graph view` : ''} · {data.model} · the 3 axes keep {Math.round(100 * data.variance.reduce((a, b) => a + b, 0))}% of the differences between notes; the rest is flattened out.</AIText></span>{/if}
		</p>
		{:else}
		<p>
			<AIText>The same notes drawn the way Obsidian's Graph view draws them: a node per note, a line per [[link]], bigger nodes have more links.
			Hover to light up a neighbourhood, drag nodes around, scroll to zoom (labels appear as you get closer), click a note to read it.</AIText>
			<span class="meta"><AIText>Obsidian has no way to export its graph, so this is a rebuild from the same links — most of this vault's links run from notes to topic hubs.</AIText></span>
		</p>
		{/if}
	</header>

	<div class="space-stage" bind:this={stage}
		on:pointerdown={onDown} on:pointermove={onMove} on:pointerup={onUp} on:pointerleave={() => { drag = null; if (hovered) { hovered = null; draw(); } }}
		on:wheel={onWheel} role="img" aria-label="3-D map of the notes">
		{#if status}<div class="space-status">{status}</div>{/if}
		{#if mode === 'graph' && data}
			<div class="graph-layer"><ObsidianGraph notes={data.notes} {query} /></div>
		{/if}
		{#if hovered && mode === 'space'}
			<div class="space-tip">
				<span class="dot" style="background:{getCategoryColor(hovered.type)}"></span>
				<strong>{hovered.title}</strong>
				<span class="muted">{hovered.date || 'undated'} · {getCategoryLabel(hovered.type)}{hovered.sub ? ' / ' + hovered.sub : ''}</span>
				{#if hovered.tags.length}<span class="muted">#{hovered.tags.join('  #')}</span>{/if}
			</div>
		{/if}
	</div>

	<div class="space-controls">
		{#if mode === 'space'}
		<label class="grow">
			<span>through time</span>
			<input type="range" min="1" max={pts.length || 1} bind:value={upTo} />
			<span class="muted">{upTo}/{pts.length}{#if pts[upTo - 1]} · {pts[upTo - 1].note.date || 'undated'}{/if}</span>
		</label>
		<label><input type="checkbox" bind:checked={showPath} /> path</label>
		{/if}
		<input class="find" type="text" placeholder="find: title, tag, or category" bind:value={query} />
		{#if mode === 'space'}
		<span class="views">
			{#each [['3d', '3D'], ['12', 'flat 1·2'], ['13', 'flat 1·3'], ['23', 'flat 2·3']] as [v, l]}
				<button class:on={flat === v} on:click={() => setView(v)}>{l}</button>
			{/each}
		</span>
		{/if}
	</div>

	<div class="space-legend">
		{#each legend.filter((c) => usedTypes.includes(c.id)) as c}
			<button class="chip" on:click={() => (query = query === '^' + c.id + '$' ? '' : '^' + c.id + '$')} class:on={query === '^' + c.id + '$'}>
				<span class="dot" style="background:{c.color}"></span>{c.label}
			</button>
		{/each}
	</div>
</div>
</PageLayout>

<style>
	.space-page { padding: 4px 0 20px; }
	.space-head h1 { margin: 0 0 6px; }
	.mode { display: inline-flex; margin: 0 0 10px; border: 1px solid rgba(128, 128, 128, 0.4); border-radius: 3px; overflow: hidden; }
	.mode button { font: inherit; font-size: 0.9em; padding: 3px 12px; border: none; background: transparent; color: inherit; cursor: pointer; }
	.mode button.on { background: rgba(128, 128, 128, 0.35); }
	.graph-layer { position: absolute; inset: 0; z-index: 2; }
	.space-head p { margin: 0 0 12px; max-width: 70ch; opacity: 0.85; }
	.space-head .meta { display: block; margin-top: 6px; font-size: 0.85em; opacity: 0.7; }
	.space-stage { position: relative; width: 100%; height: min(72vh, 760px); border: 1px solid rgba(128, 128, 128, 0.25); border-radius: 6px; overflow: hidden; cursor: grab; touch-action: none; }
	.space-stage:active { cursor: grabbing; }
	.space-stage :global(canvas) { display: block; width: 100%; height: 100%; }
	.space-status { position: absolute; inset: 0; display: grid; place-items: center; opacity: 0.7; }
	.space-tip { position: absolute; left: 12px; bottom: 12px; display: flex; flex-direction: column; gap: 2px; padding: 8px 10px; background: rgba(0, 0, 0, 0.72); color: #fff; border-radius: 4px; font-size: 0.85em; pointer-events: none; max-width: 60%; }
	.space-tip .muted { opacity: 0.7; }
	.dot { display: inline-block; width: 9px; height: 9px; border-radius: 50%; margin-right: 6px; vertical-align: -1px; }
	.space-controls { display: flex; flex-wrap: wrap; gap: 10px 16px; align-items: center; margin: 10px 0 8px; font-size: 0.9em; }
	.space-controls label { display: flex; align-items: center; gap: 8px; }
	.space-controls .grow { flex: 1 1 260px; }
	.space-controls .grow input[type='range'] { flex: 1 1 auto; min-width: 120px; }
	.space-controls .find { flex: 0 1 240px; padding: 4px 8px; font: inherit; }
	.space-controls .views button, .chip { font: inherit; font-size: 0.9em; padding: 3px 9px; border: 1px solid rgba(128, 128, 128, 0.4); background: transparent; color: inherit; border-radius: 3px; cursor: pointer; }
	.space-controls .views button.on, .chip.on { border-color: currentColor; }
	.space-legend { display: flex; flex-wrap: wrap; gap: 6px; }
	.muted { opacity: 0.7; }
</style>
