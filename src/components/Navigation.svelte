<script>
	import { page } from '$app/stores';
	
	const navItems = [
		{ path: '/', label: 'Home', icon: '' },
		{ path: '/projects', label: 'Rad Stuff', icon: '' },
		{ path: '/resume', label: 'Resume', icon: '' },
		{ path: '/about', label: 'About', icon: '' },
		{ path: '/admin', label: 'Admin', icon: '' }
	];
</script>

<nav class="navigation">
	<div class="container">
		<div class="nav-content">
			<div class="logo">
				<a href="/" class="logo-link">
					<span class="logo-text">rhea madhogarhia</span>
				</a>
			</div>
			
			<ul class="nav-links">
				{#each navItems as item}
					<li>
						<a 
							href={item.path} 
							class="nav-link {$page.url.pathname === item.path ? 'active' : ''}"
						>
							<span class="nav-icon">{item.icon}</span>
							<span class="nav-label">{item.label}</span>
						</a>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</nav>

<style>
	.navigation {
		background: rgba(255, 255, 255, 0.95);
		backdrop-filter: blur(10px);
		border-bottom: 1px solid rgba(255, 255, 255, 0.2);
		position: sticky;
		top: 0;
		z-index: 100;
		box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
	}

	.nav-content {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 15px 0;
	}

	.logo {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.logo-link {
		text-decoration: none;
		transition: all 0.3s ease;
	}

	.logo-link:hover {
		opacity: 0.8;
	}

	.logo-text {
		font-size: 1.5rem;
		font-weight: bold;
		color: #000000;
	}



	.nav-links {
		display: flex;
		list-style: none;
		gap: 30px;
		margin: 0;
		padding: 0;
	}

	.nav-link {
		display: flex;
		align-items: center;
		gap: 8px;
		text-decoration: none;
		color: #2d3436;
		font-weight: 500;
		padding: 10px 15px;
		transition: all 0.3s ease;
		position: relative;
	}

	.nav-link:hover {
		background: rgba(0, 0, 0, 0.1);
	}

	.nav-link.active {
		background: #000000;
		color: white;
	}

	.nav-icon {
		font-size: 1.1rem;
	}

	.nav-label {
		font-size: 0.95rem;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.nav-links {
			gap: 15px;
		}

		.nav-link {
			padding: 8px 12px;
		}

		.nav-label {
			display: none;
		}

		.logo-text {
			font-size: 1.2rem;
		}
	}
</style> 