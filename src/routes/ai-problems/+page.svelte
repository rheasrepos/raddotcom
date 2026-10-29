<script>
	// AI-Fixable Problems DB — a searchable table over /ai-problems.json.
	// The JSON is produced by `scripts/export_json.py` in the
	// ai-fixable-problems-db repo and copied into static/ by its sync script.
	import PageLayout from '../../components/PageLayout.svelte';
	import { onMount } from 'svelte';

	let problems = [];
	let loaded = false;
	let error = '';

	let q = '';
	let sdg = 'all';
	let kind = 'all';
	let maturity = 'all';
	let open = new Set();

	const KINDS = ['digital', 'physical', 'hybrid'];
	const MATURITY = ['idea', 'research', 'pilot', 'deployed'];

	onMount(async () => {
		try {
			const r = await fetch('/ai-problems.json');
			if (!r.ok) throw new Error(`${r.status}`);
			problems = await r.json();
		} catch (e) {
			error = `Couldn't load the database (${e.message}).`;
		}
		loaded = true;
	});

	const text = (p) =>
		[p.name, p.description, p.solution_summary, p.sdg_name,
		 ...(p.datasets || []).map((d) => d.name),
		 ...(p.existing_work || []).map((w) => w.title)]
			.join(' ').toLowerCase();

	$: sdgs = [...new Map(problems.map((p) => [p.sdg_goal, p.sdg_name])).entries()]
		.sort((a, b) => Number(a[0]) - Number(b[0]));
	$: shown = problems.filter((p) =>
		(sdg === 'all' || p.sdg_goal === sdg) &&
		(kind === 'all' || p.solution_kind === kind) &&
		(maturity === 'all' || p.maturity === maturity) &&
		(!q.trim() || text(p).includes(q.trim().toLowerCase()))
	);

	function toggle(id) {
		open.has(id) ? open.delete(id) : open.add(id);
		open = open;
	}
</script>

<PageLayout title="AI-Fixable Problems — Rhea Madhogarhia">
	<section class="db">
		<header class="db-header">
			<h1 class="page-title">AI-Fixable Problems</h1>
			<p class="lede">
				Problems in the world that AI could help with, given datasets that already exist.
				Each one carries the data behind it, what's been tried, what data is still missing,
				and a required risk case: ethics, morality, and a devil's advocate.
				Organized by UN Sustainable Development Goal.
				<a href="https://github.com/rheasrepos/ai-fixable-problems-db">Contribute on GitHub.</a>
			</p>
		</header>

		<div class="controls card">
			<input class="search" type="search" placeholder="Search problems, datasets, work…" bind:value={q} />
			<select bind:value={sdg} aria-label="SDG">
				<option value="all">All SDGs</option>
				{#each sdgs as [id, name]}<option value={id}>{id}. {name}</option>{/each}
			</select>
			<select bind:value={kind} aria-label="Solution kind">
				<option value="all">Any kind</option>
				{#each KINDS as k}<option value={k}>{k}</option>{/each}
			</select>
			<select bind:value={maturity} aria-label="Maturity">
				<option value="all">Any maturity</option>
				{#each MATURITY as m}<option value={m}>{m}</option>{/each}
			</select>
			<span class="count">{shown.length} of {problems.length}</span>
		</div>

		{#if !loaded}
			<p class="status">Loading…</p>
		{:else if error}
			<p class="status">{error}</p>
		{:else if problems.length === 0}
			<p class="status">Nothing here yet. The first problems are being written.</p>
		{:else if shown.length === 0}
			<p class="status">No problems match.</p>
		{:else}
			<table class="card">
				<thead>
					<tr><th>Problem</th><th>SDG</th><th>Kind</th><th>Maturity</th><th>Datasets</th></tr>
				</thead>
				<tbody>
					{#each shown as p (p.problem_id)}
						<tr class="row" class:open={open.has(p.problem_id)} on:click={() => toggle(p.problem_id)}>
							<td><strong>{p.name}</strong><div class="desc">{p.description}</div></td>
							<td><span class="pill">{p.sdg_goal}</span> {p.sdg_name}</td>
							<td>{p.solution_kind}</td>
							<td>{p.maturity}</td>
							<td>{(p.datasets || []).length}</td>
						</tr>
						{#if open.has(p.problem_id)}
							<tr class="detail"><td colspan="5">
								<div class="grid">
									<div>
										<h3>What the AI would do</h3>
										<p>{p.solution_summary}</p>
										{#if p.sdg_targets}<p class="muted">SDG targets: {p.sdg_targets.split(';').join(', ')}</p>{/if}

										<h3>Datasets</h3>
										{#if (p.datasets || []).length}
											<ul>{#each p.datasets as d}
												<li><a href={d.url} target="_blank" rel="noopener">{d.name}</a>
													<span class="muted">({d.access}{d.license ? `, ${d.license}` : ''}{d.size ? `, ${d.size}` : ''})</span>
													— {d.role}</li>
											{/each}</ul>
										{:else}<p class="muted">None listed.</p>{/if}

										<h3>Existing work</h3>
										{#if (p.existing_work || []).length}
											<ul>{#each p.existing_work as w}
												<li><a href={w.url} target="_blank" rel="noopener">{w.title}</a>
													<span class="muted">({w.kind}{w.year ? `, ${w.year}` : ''}, {w.maturity})</span>{w.notes ? ` — ${w.notes}` : ''}</li>
											{/each}</ul>
										{:else}<p class="muted">None listed.</p>{/if}

										<h3>Data gaps</h3>
										{#if (p.data_gaps || []).length}
											<ul>{#each p.data_gaps as g}
												<li><strong>{g.gap}</strong> — {g.why_it_matters}{g.how_to_close ? ` (${g.how_to_close})` : ''}</li>
											{/each}</ul>
										{:else}<p class="muted">None listed.</p>{/if}
									</div>
									<div class="risks">
										<h3>Risks</h3>
										<p><strong>Who could be harmed.</strong> {p.risks.who_could_be_harmed}</p>
										{#if p.risks.dual_use}<p><strong>Dual use.</strong> {p.risks.dual_use}</p>{/if}
										{#if p.risks.bias_and_representation}<p><strong>Bias and representation.</strong> {p.risks.bias_and_representation}</p>{/if}
										<p><strong>Ethics.</strong> {p.risks.ethics}</p>
										<p><strong>Morality.</strong> {p.risks.morality}</p>
										<p class="devil"><strong>Devil's advocate.</strong> {p.risks.devils_advocate}</p>
										<p class="muted">Added by {p.contributor}, {p.date_added}</p>
									</div>
								</div>
							</td></tr>
						{/if}
					{/each}
				</tbody>
			</table>
		{/if}
	</section>
</PageLayout>

<style>
	.db { padding: 2rem 0; }
	.page-title { font-size: 2.5rem; font-weight: bold; color: #000; margin-bottom: 0.5rem; }
	.lede { max-width: 60ch; margin-bottom: 1.5rem; line-height: 1.5; }
	.card { background: rgba(255, 255, 255, 0.9); border: 1px solid #000; }
	.controls { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; padding: 0.75rem; margin-bottom: 1rem; }
	.search { flex: 1 1 16rem; }
	.controls input, .controls select { padding: 0.5rem; border: 1px solid #000; background: #fff; font: inherit; }
	.count { margin-left: auto; font-size: 0.9rem; }
	.status { padding: 1rem 0; }
	table { width: 100%; border-collapse: collapse; }
	th, td { text-align: left; padding: 0.6rem 0.75rem; border-bottom: 1px solid #000; vertical-align: top; }
	th { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.04em; }
	.row { cursor: pointer; }
	.row:hover, .row.open { background: #f3f3f3; }
	.desc { font-size: 0.9rem; margin-top: 0.2rem; }
	.pill { display: inline-block; min-width: 1.6em; text-align: center; padding: 0 0.35em; border: 1px solid #000; font-size: 0.8rem; }
	.detail td { background: #fafafa; }
	.grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
	.grid h3 { font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.04em; margin: 0.9rem 0 0.3rem; }
	.grid ul { padding-left: 1.2rem; margin: 0; }
	.grid p { margin: 0.3rem 0; line-height: 1.45; }
	.muted { font-size: 0.85rem; opacity: 0.7; }
	.risks { border-left: 1px solid #000; padding-left: 1.5rem; }
	.devil { border: 1px dashed #000; padding: 0.5rem; margin-top: 0.6rem; }
	@media (max-width: 768px) {
		.page-title { font-size: 1.8rem; }
		.grid { grid-template-columns: 1fr; }
		.risks { border-left: 0; padding-left: 0; border-top: 1px solid #000; padding-top: 1rem; }
		th:nth-child(5), td:nth-child(5) { display: none; }
	}
</style>
