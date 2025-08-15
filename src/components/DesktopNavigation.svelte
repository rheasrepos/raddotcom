<script>
	import { page } from '$app/stores';
	import { createEventDispatcher } from 'svelte';
	
	const dispatch = createEventDispatcher();
	
	const navItems = [
		{ path: '/', label: 'Home' },
		{ path: '/projects', label: 'Rad Stuff' },
		{ path: '/resume', label: 'Resume' },
		{ path: '/about', label: 'About' },
		{ path: '/admin', label: 'Admin' }
	];

	function handleClick(event, path) {
		event.preventDefault();
		dispatch('navigate', { path });
	}
</script>

<nav class="desktop-nav">
	<ul class="desktop-nav-links">
		{#each navItems as item}
			<li>
				<a 
					href={item.path} 
					class="desktop-nav-link {$page.url.pathname === item.path ? 'active' : ''}"
					on:click={(e) => handleClick(e, item.path)}
				>
					{item.label}
				</a>
			</li>
		{/each}
	</ul>
</nav>

<style>
	.desktop-nav {
		display: flex;
		align-items: center;
	}

	.desktop-nav-links {
		display: flex;
		list-style: none;
		gap: 20px;
		margin: 0;
		padding: 0;
	}

	.desktop-nav-link {
		text-decoration: none;
		color: #ffffff;
		font-family: Arial, sans-serif;
		font-size: 0.85rem;
		font-weight: 500;
		padding: 6px 12px;
		transition: all 0.3s ease;
		border-radius: 3px;
	}

	.desktop-nav-link:hover {
		background: rgba(255, 255, 255, 0.2);
		color: #ffffff;
	}

	.desktop-nav-link.active {
		background: rgba(255, 255, 255, 0.3);
		color: #ffffff;
		font-weight: bold;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.desktop-nav-links {
			gap: 10px;
		}

		.desktop-nav-link {
			font-size: 0.75rem;
			padding: 4px 8px;
		}
	}
</style> 