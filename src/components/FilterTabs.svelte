<script>
	import { createEventDispatcher } from 'svelte';
	
	const dispatch = createEventDispatcher();
	
	export let projectTypes = [];
	export let activeFilter = 'all';
	
	function handleFilter(type) {
		dispatch('filter', type);
	}
</script>

<div class="filter-tabs">
	<div class="tabs-container">
		{#each projectTypes as type}
			<button 
				class="filter-tab {activeFilter === type.id ? 'active' : ''}"
				on:click={() => handleFilter(type.id)}
				style="--tab-color: {type.color}"
			>
				<span class="tab-label">{type.label}</span>
				{#if activeFilter === type.id}
					<span class="active-indicator"></span>
				{/if}
			</button>
		{/each}
	</div>
</div>

<style>
	.filter-tabs {
		margin: 30px 0;
	}

	.tabs-container {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 15px;
		padding: 20px;
		background: rgba(255, 255, 255, 0.8);
		border: 1px solid #000000;
	}

	.filter-tab {
		position: relative;
		padding: 12px 24px;
		background: rgba(255, 255, 255, 0.9);
		border: 2px solid transparent;
		cursor: pointer;
		font-weight: 600;
		color: #2d3436;
		transition: all 0.3s ease;
		overflow: hidden;
	}

	.filter-tab:hover {
		border-color: var(--tab-color);
	}

	.filter-tab.active {
		background: var(--tab-color);
		color: white;
	}

	.tab-label {
		position: relative;
		z-index: 2;
	}





	/* Responsive Design */
	@media (max-width: 768px) {
		.tabs-container {
			padding: 15px;
			gap: 10px;
		}

		.filter-tab {
			padding: 10px 18px;
			font-size: 0.9rem;
		}
	}

	@media (max-width: 480px) {
		.tabs-container {
			flex-direction: column;
			align-items: center;
		}

		.filter-tab {
			width: 100%;
			max-width: 200px;
		}
	}
</style> 