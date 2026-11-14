<script>
	// AI-Fixable Problems DB, shown as linked data tables (one tab per table).
	// Data: /ai-problems.json, built by `scripts/export_json.py` in the
	// ai-fixable-problems-db repo and copied here by its sync script.
	import PageLayout from '../../components/PageLayout.svelte';
	import { onMount } from 'svelte';
	import { votesConfigured, submitVote, loadVotes } from '$lib/problemVotes.js';

	/** @type {any[]} */
	let problems = [];
	let loaded = false;
	let error = '';

	let tab = 'datasets';
	let q = '';
	let sdg = 'all';
	let problem = 'all';
	let sortKey = '';
	let sortDir = 1;

	const KIND = { ai: 'AI', other_tech: 'Other tech', policy: 'Policy', funding: 'Funding',
		market: 'Market', community: 'Community', human_connection: 'Human connection', open_data: 'Open data' };
	const EVIDENCE = { rct: 'RCT', quasi_experimental: 'Quasi-exp.', self_reported: 'Self-reported', none: 'None' };
	const EV_RANK = { rct: 0, quasi_experimental: 1, self_reported: 2, none: 3 };

	// --- visitor poll: "what are the world's biggest problems?" ---
	let vCategory = '';
	let vProblem = '';
	let vWhy = '';
	let vTrap = ''; // honeypot: humans never see or fill this
	let vSending = false;
	let vDone = false;
	let vError = '';
	/** @type {{category: string, votes: number}[]} */
	let vStats = [];
	/** @type {{problem: string, mentions: number}[]} */
	let vWriteins = [];
	let vLoaded = false;

	async function refreshVotes() {
		if (!votesConfigured) { vLoaded = true; return; }
		try { const r = await loadVotes(); vStats = r.stats; vWriteins = r.writeins; } catch { /* leave empty */ }
		vLoaded = true;
	}
	async function sendVote() {
		vError = '';
		if (vTrap) { vDone = true; return; }
		if (!vCategory) { vError = 'Pick a problem, or choose "Something else".'; return; }
		if (vCategory === 'other' && !vProblem.trim()) { vError = 'Tell us the problem in your own words.'; return; }
		vSending = true;
		try {
			await submitVote({ category: vCategory, problem: vProblem, why: vWhy });
			vDone = true; vCategory = ''; vProblem = ''; vWhy = '';
			await refreshVotes();
		} catch { vError = 'That didn’t send. Try again?'; }
		vSending = false;
	}
	$: vTotal = vStats.reduce((n, r) => n + r.votes, 0);
	$: vRows = vStats
		.map((r) => ({ ...r, name: r.category === 'other' ? 'Something else (see write-ins)' : (problems.find((p) => p.problem_id === r.category)?.name || r.category) }))
		.sort((a, b) => b.votes - a.votes);

	onMount(async () => {
		refreshVotes();
		try {
			const r = await fetch('/ai-problems.json');
			if (!r.ok) throw new Error(String(r.status));
			problems = await r.json();
		} catch (/** @type {any} */ e) {
			error = `Couldn't load the database (${e.message}).`;
		}
		loaded = true;
	});

	// Flatten each linked table into rows that carry their problem.
	const withP = (/** @type {any} */ p, /** @type {any} */ x) => ({ ...x, _p: p });
	$: rows = {
		problems: problems.map((p) => ({ ...p, _p: p, n_solutions: (p.interventions || []).length, n_datasets: (p.datasets || []).length })),
		solutions: problems.flatMap((p) => [
			...(p.interventions || []).map((/** @type {any} */ x) => withP(p, { ...x, _type: KIND[x.kind] || x.kind })),
			...(p.existing_work || []).map((/** @type {any} */ x) => withP(p, { name: x.title, url: x.url, _type: 'Research', featured: 'false' }))
		]),
		datasets: problems.flatMap((p) => (p.datasets || []).map((/** @type {any} */ x) => withP(p, x))),
		research: problems.flatMap((p) => (p.existing_work || []).map((/** @type {any} */ x) => withP(p, x))),
		gaps: problems.flatMap((p) => (p.data_gaps || []).map((/** @type {any} */ x) => withP(p, x))),
		risks: problems.map((p) => withP(p, p.risks || {})),
		votes: []
	};

	const COLS = {
		datasets: [
			['name', 'Dataset'], ['_problem', 'Problem'], ['role', 'What you could study'], ['access', 'Access'], ['license', 'License']
		],
		solutions: [['name', 'Name'], ['_problem', 'Problem'], ['_type', 'Type']],
		problems: [['name', 'Problem'], ['sdg_name', 'UN goal'], ['n_datasets', 'Datasets'], ['description', 'Description']],
		gaps: [['_problem', 'Problem'], ['gap', 'Missing data'], ['why_it_matters', 'Why it matters']],
		risks: [['_problem', 'Problem'], ['ethics', 'Ethics'], ['morality', 'Morality'], ['devils_advocate', "Devil's advocate"]]
	};
	const TABS = [['datasets', 'Open datasets'], ['problems', 'Problems'], ['gaps', 'Missing data'], ['solutions', "Who's working on it"], ['risks', 'Risks'], ['votes', 'What visitors say']];

	const val = (/** @type {any} */ r, /** @type {string} */ k) => (k === '_problem' ? r._p.name : r[k] ?? '');
	const text = (/** @type {any} */ r) => Object.values(r).filter((v) => typeof v === 'string').join(' ').toLowerCase() + ' ' + r._p.name.toLowerCase();

	$: sdgs = [...new Map(problems.map((p) => [p.sdg_goal, p.sdg_name])).entries()].sort((a, b) => Number(a[0]) - Number(b[0]));
	$: shown = (rows[tab] || [])
		.filter((/** @type {any} */ r) =>
			(sdg === 'all' || r._p.sdg_goal === sdg) &&
			(problem === 'all' || r._p.problem_id === problem) &&
			(!q.trim() || q.toLowerCase().split(/\s+/).filter(Boolean).every((w) => text(r).includes(w))))
		.slice()
		.sort((/** @type {any} */ a, /** @type {any} */ b) => {
			if (!sortKey) {
				// default for solutions: well-known first, then strongest evidence
				if (tab === 'datasets') return a._p.name.localeCompare(b._p.name);
				if (tab !== 'solutions') return 0;
				return Number(a.featured !== 'true') - Number(b.featured !== 'true') || (EV_RANK[a.evidence] ?? 9) - (EV_RANK[b.evidence] ?? 9);
			}
			const x = val(a, sortKey), y = val(b, sortKey);
			const nx = Number(x), ny = Number(y);
			const c = x !== '' && y !== '' && !isNaN(nx) && !isNaN(ny) ? nx - ny : String(x).localeCompare(String(y));
			return c * sortDir;
		});

	function sortBy(/** @type {string} */ k) {
		if (sortKey === k) sortDir = -sortDir; else { sortKey = k; sortDir = 1; }
	}
	function setTab(/** @type {string} */ t) { tab = t; sortKey = ''; }
	function pick(/** @type {any} */ p) { problem = p.problem_id; }
</script>

<PageLayout title="AI-Fixable Problems — Rhea Madhogarhia">
	<section class="sheet">
		<div class="titlebar">
			<span class="title">Open Data — {TABS.find((t) => t[0] === tab)?.[1]}</span>
			<span class="winbtns" aria-hidden="true"><i>_</i><i>□</i><i>×</i></span>
		</div>
		<div class="body">
		<header class="head">
			<h1>Open data for the world's biggest problems</h1>
			<p>
				Open datasets you can download and study yourself, organized by the world problem they help with.
				Almost all are free to download; each row says how to get it and what you can do with it. <a href="https://github.com/rheasrepos/ai-fixable-problems-db">Suggest a dataset on GitHub</a>.
			</p>
		</header>

		<p class="disclaimer">
			These are quite obviously simplifications of the "world's biggest problems" and we hope that the users of this
			application can provide more nuance by contributing! You can answer this short anonymous survey or recommend a
			dataset or problem on <a href="https://github.com/rheasrepos/ai-fixable-problems-db">GitHub</a>!
		</p>

		<fieldset class="poll">
			<legend>Contribute your opinion: what are the world's biggest problems?</legend>
			{#if !votesConfigured}
				<p class="muted">The poll isn't open yet.</p>
			{:else if vDone}
				<p>Thanks! Your answer is counted. Written answers show up after a quick review.
					<button class="link" on:click={() => { vDone = false; }}>Answer again</button> ·
					<button class="link" on:click={() => setTab('votes')}>See what others said</button></p>
			{:else}
				<div class="poll-row">
					<label>Problem
						<select bind:value={vCategory}>
							<option value="" disabled>Choose one…</option>
							{#each problems as p}<option value={p.problem_id}>{p.name}</option>{/each}
							<option value="other">Something else</option>
						</select>
					</label>
					<label class="grow">In your own words {vCategory === 'other' ? '' : '(optional)'}
						<input maxlength="200" bind:value={vProblem} placeholder="e.g. loneliness, clean water, misinformation…" />
					</label>
				</div>
				<label>Why? (optional)
					<textarea rows="2" maxlength="500" bind:value={vWhy}></textarea>
				</label>
				<input class="trap" tabindex="-1" autocomplete="off" aria-hidden="true" bind:value={vTrap} />
				<div class="poll-row">
					<button class="btn" on:click={sendVote} disabled={vSending}>{vSending ? 'Sending…' : 'Submit'}</button>
					<span class="muted">Anonymous. Don't include names or personal details.</span>
					{#if vError}<span class="err">{vError}</span>{/if}
				</div>
			{/if}
		</fieldset>

		<nav class="tabs" role="tablist">
			{#each TABS as [id, label]}
				<button role="tab" aria-selected={tab === id} class:on={tab === id} on:click={() => setTab(id)}>
					{label} <span class="n">{id === 'votes' ? vTotal : rows[id]?.length ?? 0}</span>
				</button>
			{/each}
		</nav>

		{#if tab !== 'votes'}
		<div class="bar">
			<input type="search" placeholder="Filter rows…" bind:value={q} />
			<select bind:value={problem} aria-label="Problem">
				<option value="all">All problems</option>
				{#each problems as p}<option value={p.problem_id}>{p.name}</option>{/each}
			</select>
			<select bind:value={sdg} aria-label="SDG">
				<option value="all">All SDGs</option>
				{#each sdgs as [id, name]}<option value={id}>{id}. {name}</option>{/each}
			</select>
		</div>
		{/if}

		{#if tab === 'votes'}
			<div class="grid-wrap">
				<table class="grid">
					<thead><tr><th class="idx"><span class="sort">#</span></th><th><span class="sort">Problem</span></th><th><span class="sort">Votes</span></th><th><span class="sort">Share</span></th></tr></thead>
					<tbody>
						{#each vRows as r, i}
							<tr>
								<td class="idx">{i + 1}</td>
								<td>{r.name}</td>
								<td class="c-n_datasets">{r.votes}</td>
								<td class="c-bar"><span class="vbar" style="width: {vTotal ? (100 * r.votes) / vTotal : 0}%"></span> {vTotal ? Math.round((100 * r.votes) / vTotal) : 0}%</td>
							</tr>
						{:else}
							<tr><td class="empty" colspan="4">{!votesConfigured ? "The poll isn't open yet." : vLoaded ? 'No answers yet. Be the first.' : 'Loading…'}</td></tr>
						{/each}
					</tbody>
				</table>
			</div>
			{#if vWriteins.length}
				<h3 class="sub">In visitors' own words (reviewed)</h3>
				<div class="grid-wrap">
					<table class="grid">
						<thead><tr><th class="idx"><span class="sort">#</span></th><th><span class="sort">Problem</span></th><th><span class="sort">Mentions</span></th></tr></thead>
						<tbody>
							{#each vWriteins as w, i}
								<tr><td class="idx">{i + 1}</td><td>{w.problem}</td><td class="c-n_datasets">{w.mentions}</td></tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/if}
			<div class="statusbar"><span>{vTotal} answers</span><span>Counts include unreviewed answers; written answers appear after review.</span></div>
		{:else if !loaded}
			<p class="status">Loading…</p>
		{:else if error}
			<p class="status">{error}</p>
		{:else}
			<div class="grid-wrap">
				<table class="grid">
					<thead>
						<tr>
							<th class="idx">#</th>
							{#each COLS[tab] as [k, label]}
								<th>
									<button class="sort" on:click={() => sortBy(k)}>
										{label}{sortKey === k ? (sortDir > 0 ? ' ▲' : ' ▼') : ''}
									</button>
								</th>
							{/each}
						</tr>
					</thead>
					<tbody>
						{#each shown as r, i}
							<tr class:featured={tab === 'solutions' && r.featured === 'true'}>
								<td class="idx">{i + 1}</td>
								{#each COLS[tab] as [k]}
									<td class="c-{k}">
										{#if k === '_problem'}
											<button class="link" on:click={() => pick(r._p)}>{r._p.name}</button>
										{:else if (k === 'name' || k === 'title') && r.url}
											<a href={r.url} target="_blank" rel="noopener">{r[k]}</a>
										{:else if k === 'name' && tab === 'problems'}
											<button class="link" on:click={() => { pick(r); setTab('solutions'); }}>{r.name}</button>
										{:else if k === '_type'}
											<span class="pill k-{r.kind || 'research'}">{r._type}</span>
										{:else if k === 'evidence'}
											{#if r.effect_source}<a href={r.effect_source} target="_blank" rel="noopener">{EVIDENCE[r.evidence]}</a>{:else}{EVIDENCE[r.evidence] || ''}{/if}
										{:else}
											{val(r, k)}
										{/if}
									</td>
								{/each}
							</tr>
						{:else}
							<tr><td class="empty" colspan={COLS[tab].length + 1}>No rows match.</td></tr>
						{/each}
					</tbody>
				</table>
			</div>
			<div class="statusbar">
				<span>{shown.length} of {rows[tab]?.length ?? 0} rows</span>
				<span>{problem === 'all' ? 'All problems' : problems.find((p) => p.problem_id === problem)?.name}</span>
				<span>{sortKey ? `Sorted by ${COLS[tab].find((c) => c[0] === sortKey)?.[1]}` : tab === 'solutions' ? 'Well-known first' : 'Unsorted'}</span>
			</div>
			<p class="foot">
				Click a column header to sort; click a problem to filter to it.
				{#if problem !== 'all'} <button class="link" on:click={() => (problem = 'all')}>Show all problems</button>{/if}
			</p>
		{/if}
		</div>
	</section>
</PageLayout>

<style>
	/* Classic Windows (95/98) look: grey chrome, bevelled edges, navy title bar. */
	.sheet {
		--face: #c0c0c0; --hi: #ffffff; --lo: #808080; --dk: #000000; --navy: #000080; --row: #d4d0c8; --row2: #c8c4bc;
		font-family: Tahoma, 'MS Sans Serif', 'Segoe UI', Geneva, sans-serif !important;
		font-size: 13px; color: #000; background: var(--face); margin: 1rem 0; padding: 3px;
		border: 2px solid; border-color: var(--hi) var(--dk) var(--dk) var(--hi);
		box-shadow: inset -1px -1px var(--lo), inset 1px 1px #dfdfdf;
	}
	.sheet :global(*) { font-family: inherit !important; }
	.titlebar {
		display: flex; align-items: center; justify-content: space-between; padding: 3px 4px 3px 6px;
		background: linear-gradient(90deg, var(--navy), #1084d0); color: #fff; font-weight: bold;
	}
	.title { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
	.winbtns { display: flex; gap: 2px; }
	.winbtns i {
		font-style: normal; width: 16px; height: 14px; line-height: 12px; text-align: center; font-size: 11px;
		background: var(--face); color: #000; border: 1px solid; border-color: var(--hi) var(--dk) var(--dk) var(--hi);
	}
	.body { padding: 10px; }
	.head h1 { font-size: 18px; font-weight: bold; margin: 0 0 4px; color: #000; }
	.head p { max-width: 80ch; line-height: 1.45; margin: 0 0 12px; }
	a, .link { color: var(--navy); text-decoration: underline; }

	.tabs { display: flex; flex-wrap: wrap; gap: 0; padding-left: 2px; position: relative; z-index: 1; }
	.tabs button {
		background: var(--face); color: #000; font: inherit; cursor: pointer; padding: 3px 10px; margin-top: 2px;
		border: 2px solid; border-bottom: none; border-color: var(--hi) var(--lo) transparent var(--hi);
		border-radius: 3px 3px 0 0;
	}
	.tabs button.on { margin-top: 0; padding-bottom: 5px; margin-bottom: -2px; font-weight: bold; }
	.tabs .n { opacity: 0.6; }

	.bar {
		display: flex; flex-wrap: wrap; gap: 6px; align-items: center; padding: 8px;
		border: 2px solid; border-color: var(--hi) var(--lo) var(--lo) var(--hi);
	}
	.bar input, .bar select {
		background: #fff; color: #000; font: inherit; padding: 2px 4px;
		border: 2px solid; border-color: var(--lo) var(--hi) var(--hi) var(--lo); box-shadow: inset 1px 1px var(--dk);
	}
	.bar input { flex: 1 1 14rem; }
	.bar select { flex: 0 1 auto; min-width: 0; max-width: 100%; }

	.grid-wrap {
		overflow: auto; max-height: 70vh; margin-top: 8px; background: var(--row);
		border: 2px solid; border-color: var(--lo) var(--hi) var(--hi) var(--lo); box-shadow: inset 1px 1px var(--dk);
	}
	.grid { border-collapse: separate; border-spacing: 0; width: 100%; }
	.grid th, .grid td { padding: 3px 6px; text-align: left; vertical-align: top; }
	.grid td { border-right: 1px solid var(--lo); border-bottom: 1px solid var(--lo); }
	.grid thead th {
		position: sticky; top: 0; z-index: 1; white-space: nowrap; background: var(--face); padding: 0;
		border: 1px solid; border-color: var(--hi) var(--dk) var(--dk) var(--hi);
	}
	.sort { display: block; width: 100%; text-align: left; background: none; border: none; color: #000; font: inherit; cursor: pointer; padding: 3px 6px; }
	.sort:active { box-shadow: inset 1px 1px var(--lo); }
	.grid tbody tr:nth-child(even) { background: var(--row2); }
	.grid tbody tr:hover { background: var(--navy); color: #fff; }
	.grid tbody tr:hover a, .grid tbody tr:hover .link { color: #fff; }
	.grid tr.featured td.c-name { font-weight: bold; }
	.grid .idx { width: 2.5rem; min-width: 0; text-align: right; color: #404040; }
	.grid td { min-width: 7rem; max-width: 26rem; }
	td.c-sdg_goal, td.c-year_started, td.c-year, td.c-n_solutions, td.c-n_datasets { min-width: 3rem; }
	.link { background: none; border: none; padding: 0; font: inherit; cursor: pointer; text-align: left; }
	.pill { display: inline-block; padding: 0 4px; font-size: 11px; white-space: nowrap; color: #fff; }
	.k-ai { background: #008080; } .k-policy { background: #808000; } .k-market { background: #000080; }
	.k-community, .k-human_connection { background: #800080; } .k-funding { background: #008000; } .k-research { background: #404040; } .k-open_data { background: #008080; outline: 1px dashed #fff; } .k-other_tech { background: #800000; }
	.empty, .status { padding: 10px; }

	.disclaimer { margin: 0 0 10px; padding: 6px 8px; font-size: 12px; background: #ffffe1; border: 1px solid #000; max-width: 80ch; }
	.poll { margin: 0 0 12px; padding: 8px 10px 10px; border: 2px groove var(--hi); }
	.poll legend { font-weight: bold; padding: 0 4px; }
	.poll label { display: flex; flex-direction: column; gap: 2px; margin-bottom: 6px; }
	.poll-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: flex-end; }
	.poll .grow { flex: 1 1 14rem; }
	.poll input, .poll select, .poll textarea {
		background: #fff; color: #000; font: inherit; padding: 2px 4px; max-width: 100%;
		border: 2px solid; border-color: var(--lo) var(--hi) var(--hi) var(--lo); box-shadow: inset 1px 1px var(--dk);
	}
	.btn { background: var(--face); font: inherit; padding: 3px 14px; cursor: pointer; border: 2px solid; border-color: var(--hi) var(--dk) var(--dk) var(--hi); box-shadow: inset -1px -1px var(--lo); }
	.btn:active { border-color: var(--dk) var(--hi) var(--hi) var(--dk); }
	.trap { position: absolute; left: -9999px; width: 1px; height: 1px; opacity: 0; }
	.muted { color: #404040; font-size: 12px; }
	.err { color: #800000; }
	.sub { font-size: 13px; font-weight: bold; margin: 12px 0 0; }
	td.c-bar { min-width: 12rem; white-space: nowrap; }
	.vbar { display: inline-block; height: 10px; background: var(--navy); vertical-align: middle; margin-right: 6px; }
	.statusbar { display: flex; gap: 2px; margin-top: 4px; }
	.statusbar span {
		flex: 1; padding: 2px 6px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
		border: 1px solid; border-color: var(--lo) var(--hi) var(--hi) var(--lo);
	}
	.foot { font-size: 12px; margin: 6px 0 0; color: #202020; }

	@media (max-width: 768px) {
		.body { padding: 6px; }
		.statusbar span:nth-child(3) { display: none; }
	}
</style>
