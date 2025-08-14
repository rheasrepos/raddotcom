<script>
	import { createEventDispatcher } from 'svelte';
	
	const dispatch = createEventDispatcher();
	
	export let project;
	
	const typeColors = {
		writing: '#4ecdc4',
		programming: '#45b7d1',
		music: '#96ceb4',
		comedy: '#feca57',
		art: '#ff9ff3'
	};
	
	const typeIcons = {
		writing: '',
		programming: '',
		music: '',
		comedy: '',
		art: ''
	};
	
	function handleClick() {
		dispatch('click');
	}
	
	function formatDate(dateString) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
	}
</script>

<div class="project-pane card" on:click={handleClick}>
	<div class="project-image">
		<img src={project.image} alt={project.title} />
		<div class="project-type-badge" style="background-color: {typeColors[project.type]}">
		</div>
	</div>
	
	<div class="project-content">
		<div class="project-header">
			<h3 class="project-title">{project.title}</h3>
			<span class="project-date">{formatDate(project.date)}</span>
		</div>
		
		<p class="project-description">{project.description}</p>
		
		<div class="project-footer">
			<span class="project-type" style="color: {typeColors[project.type]}">
				{project.type.charAt(0).toUpperCase() + project.type.slice(1)}
			</span>
			<button class="view-btn">
				<span>View Details</span>
				<span class="arrow">→</span>
			</button>
		</div>
	</div>
</div>

<style>
	.project-pane {
		cursor: pointer;
		position: relative;
		overflow: hidden;
		transition: all 0.3s ease;
	}

	.project-pane:hover {
		background: rgba(255, 255, 255, 1);
	}

	.project-image {
		position: relative;
		width: 100%;
		height: 200px;
		overflow: hidden;
		margin-bottom: 15px;
	}

	.project-image img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s ease;
	}

	.project-pane:hover .project-image img {
		transform: scale(1.1);
	}

	.project-type-badge {
		position: absolute;
		top: 10px;
		right: 10px;
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
	}



	.project-content {
		padding: 0 5px;
	}

	.project-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 10px;
	}

	.project-title {
		font-size: 1.3rem;
		font-weight: bold;
		color: #2d3436;
		margin: 0;
		line-height: 1.3;
		flex: 1;
	}

	.project-date {
		font-size: 0.85rem;
		color: #636e72;
		white-space: nowrap;
		margin-left: 10px;
	}

	.project-description {
		color: #636e72;
		line-height: 1.5;
		margin-bottom: 15px;
		font-size: 0.95rem;
	}

	.project-footer {
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.project-type {
		font-size: 0.85rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.view-btn {
		display: flex;
		align-items: center;
		gap: 5px;
		background: none;
		border: none;
		color: #ff6b6b;
		font-weight: 600;
		font-size: 0.9rem;
		cursor: pointer;
		transition: all 0.3s ease;
	}

	.view-btn:hover {
		color: #4ecdc4;
		transform: translateX(3px);
	}

	.arrow {
		transition: transform 0.3s ease;
	}

	.view-btn:hover .arrow {
		transform: translateX(3px);
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.project-title {
			font-size: 1.1rem;
		}

		.project-description {
			font-size: 0.9rem;
		}

		.project-image {
			height: 180px;
		}
	}
</style> 