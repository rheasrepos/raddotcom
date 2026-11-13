<script context="module">
	// Images for the "sort from most complex to least complex" question. All drawn
	// here as SVG from a fixed seed, so every visitor sorts identical pictures and
	// nothing is borrowed: generic versions of the kinds Rhea named (blocks and
	// patterns, a gestalt figure, an inkblot, a drip painting, visual noise).
	export const STIMULI = [
		{ id: 'blocks', label: 'four blocks' },
		{ id: 'grid', label: 'block grid' },
		{ id: 'gestalt', label: 'gestalt triangle' },
		{ id: 'inkblot', label: 'inkblot' },
		{ id: 'drip', label: 'drip painting' },
		{ id: 'noise', label: 'noise' }
	];
	function rng(seed) { return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646; }

	function make(id) {
		const r = rng(id.length * 7919 + id.charCodeAt(0));
		if (id === 'blocks') return { rects: [[0, 0, 50, 50], [50, 50, 50, 50]].map(([x, y, w, h]) => ({ x, y, w, h, f: '#000' })) };
		if (id === 'grid') {
			const rects = [];
			for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) if (r() < 0.45) rects.push({ x: i * 12.5, y: j * 12.5, w: 12.5, h: 12.5, f: '#000' });
			return { rects };
		}
		if (id === 'noise') {
			const rects = [];
			for (let i = 0; i < 40; i++) for (let j = 0; j < 40; j++) if (r() < 0.5) rects.push({ x: i * 2.5, y: j * 2.5, w: 2.5, h: 2.5, f: '#000' });
			return { rects };
		}
		if (id === 'inkblot') {
			// blobs on the left half, mirrored onto the right
			const blobs = [];
			for (let k = 0; k < 22; k++) {
				const y = 15 + r() * 70, x = 50 - Math.pow(r(), 1.6) * 38, rad = 2 + r() * 9;
				blobs.push({ x, y, rad }, { x: 100 - x, y, rad });
			}
			return { blobs };
		}
		if (id === 'drip') {
			const cols = ['#000', '#000', '#7a5c3a', '#c9c2b0', '#3b4a6b'];
			const paths = [];
			for (let k = 0; k < 26; k++) {
				let x = r() * 100, y = r() * 100, d = `M${x.toFixed(1)} ${y.toFixed(1)}`;
				for (let s = 0; s < 6; s++) {
					const cx = x + (r() - 0.5) * 60, cy = y + (r() - 0.5) * 60;
					x = Math.max(0, Math.min(100, x + (r() - 0.5) * 50)); y = Math.max(0, Math.min(100, y + (r() - 0.5) * 50));
					d += ` Q${cx.toFixed(1)} ${cy.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
				}
				paths.push({ d, c: cols[k % cols.length], w: 0.4 + r() * 1.8 });
			}
			return { paths };
		}
		return {}; // gestalt is static markup
	}
</script>

<script>
	export let id;
	$: g = make(id);
</script>

<svg viewBox="0 0 100 100" role="img" aria-label={STIMULI.find((s) => s.id === id)?.label}>
	<rect width="100" height="100" fill={id === 'drip' ? '#efe9dc' : '#fff'} />
	{#if id === 'gestalt'}
		<!-- three "pac-man" discs whose mouths imply a white triangle that isn't drawn -->
		{#each [[50, 18, 90], [18, 78, -30], [82, 78, 210]] as [cx, cy, a]}
			<g transform="translate({cx} {cy}) rotate({a})">
				<path d="M0 0 L{12 * Math.cos(Math.PI / 6)} {-12 * Math.sin(Math.PI / 6)} A12 12 0 1 0 {12 * Math.cos(Math.PI / 6)} {12 * Math.sin(Math.PI / 6)} Z" fill="#000" />
			</g>
		{/each}
	{/if}
	{#each g.rects || [] as b}<rect x={b.x} y={b.y} width={b.w} height={b.h} fill={b.f} />{/each}
	{#each g.blobs || [] as b}<circle cx={b.x} cy={b.y} r={b.rad} fill="#000" />{/each}
	{#each g.paths || [] as p}<path d={p.d} stroke={p.c} stroke-width={p.w} fill="none" stroke-linecap="round" />{/each}
</svg>

<style>
	svg { display: block; width: 100%; height: auto; border: 1px solid #000; }
</style>
