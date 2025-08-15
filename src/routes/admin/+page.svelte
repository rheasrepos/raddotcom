<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import DesktopNavigation from '../../components/DesktopNavigation.svelte';
	
	let wallpaperColor = '#ff8c42'; // Default orange
	let currentTime = new Date().toLocaleTimeString();
	let isNavigating = false;
	let isContracting = false;

	onMount(() => {
		// Load wallpaper color from localStorage
		if (typeof window !== 'undefined') {
			const savedColor = localStorage.getItem('wallpaperColor');
			if (savedColor) {
				wallpaperColor = savedColor;
			}
		}

		// Update time every second
		const timeInterval = setInterval(() => {
			currentTime = new Date().toLocaleTimeString();
		}, 1000);

		// Cleanup on component destroy
		return () => {
			if (timeInterval) {
				clearInterval(timeInterval);
			}
		};
	});

	function handleNavigation(path) {
		// Don't navigate if already on the target page
		if (path === $page.url.pathname) {
			return;
		}
		
		if (path === '/') {
			// If navigating to homepage, use contraction animation
			isContracting = true;
			setTimeout(() => {
				goto(path);
			}, 300);
		} else {
			// For other pages, navigate immediately without animation
			goto(path);
		}
	}

	let isLoggedIn = false;
	let loginCode = '';
	let errorMessage = '';
	let successMessage = '';

	// Admin credentials - you can change this
	const ADMIN_CODE = 'rad2024';

	// New post form
	let newPost = {
		title: '',
		description: '',
		type: 'writing',
		date: new Date().toISOString().split('T')[0],
		content: '',
		image: 'https://picsum.photos/300/200?random=' + Math.floor(Math.random() * 1000)
	};

	const projectTypes = [
		{ value: 'writing', label: 'Notes App', color: '#3498db' },
		{ value: 'programming', label: 'Programming', color: '#2ecc71' },
		{ value: 'music', label: 'Music', color: '#e74c3c' },
		{ value: 'comedy', label: 'Comedy', color: '#f39c12' },
		{ value: 'art', label: 'Art', color: '#9b59b6' }
	];

	function handleLogin() {
		if (loginCode === ADMIN_CODE) {
			isLoggedIn = true;
			errorMessage = '';
			successMessage = 'Successfully logged in!';
		} else {
			errorMessage = 'Invalid login code';
			successMessage = '';
		}
	}

	function handleLogout() {
		isLoggedIn = false;
		loginCode = '';
		errorMessage = '';
		successMessage = '';
	}

	async function handleSubmit() {
		try {
			// Create a unique ID for the post
			const postId = Date.now();
			
			// Prepare the post data
			const postData = {
				id: postId,
				...newPost
			};

			// Try to save to Git-based file system first
			try {
				const response = await fetch('/api/posts', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(postData)
				});

				if (response.ok) {
					const result = await response.json();
					successMessage = `Post "${newPost.title}" created and committed to Git successfully! 
					
The post has been saved as a permanent file and is now part of your repository. It will be visible on your website immediately.`;
				} else {
					throw new Error('Failed to save to Git');
				}
			} catch (gitError) {
				// Fallback to localStorage if Git save fails
				console.warn('Git save failed, falling back to localStorage:', gitError);
				
				if (typeof window !== 'undefined') {
					const existingPosts = JSON.parse(localStorage.getItem('tempPosts') || '[]');
					existingPosts.push(postData);
					localStorage.setItem('tempPosts', JSON.stringify(existingPosts));
				}

				successMessage = `Post "${newPost.title}" created successfully! 
				
The post has been saved to temporary storage. For permanent storage, ensure Git is configured properly.`;
			}

			// Reset form
			newPost = {
				title: '',
				description: '',
				type: 'writing',
				date: new Date().toISOString().split('T')[0],
				content: '',
				image: 'https://picsum.photos/300/200?random=' + Math.floor(Math.random() * 1000)
			};

			errorMessage = '';
			
			// Auto-refresh the page after a short delay to show the new post
			setTimeout(() => {
				window.location.reload();
			}, 2000);
		} catch (error) {
			errorMessage = 'Error creating post: ' + error.message;
			successMessage = '';
		}
	}

	function getProjectColor(type) {
		const colors = {
			writing: '#3498db',
			programming: '#2ecc71',
			music: '#e74c3c',
			comedy: '#f39c12',
			art: '#9b59b6'
		};
		return colors[type] || '#95a5a6';
	}
</script>

<svelte:head>
	<title>Admin - Personal Portfolio</title>
	<meta name="description" content="Admin panel for managing blog posts" />
</svelte:head>

<div class="laptop-frame" class:navigating={isNavigating} class:contracting={isContracting}>
	<div class="laptop-screen" style="background: {wallpaperColor};">
		<!-- Navigation and Controls in the frame bezel -->
		<div class="frame-topbar">
			<div class="topbar-left">
				<a href="/" class="about-link">Rhea Madhogarhia</a>
			</div>
			<div class="topbar-center">
				<DesktopNavigation on:navigate={({ detail }) => handleNavigation(detail.path)} />
			</div>
			<div class="topbar-right">
				<span class="system-time">{currentTime}</span>
			</div>
		</div>

		<div class="page-content">
			<div class="container">
		<h1 class="page-title">Admin Panel</h1>

		{#if !isLoggedIn}
			<!-- Login Form -->
			<div class="login-section">
				<h2>Login</h2>
				<div class="login-form">
					<div class="form-group">
						<label for="loginCode">Admin Code:</label>
						<input 
							type="password" 
							id="loginCode"
							bind:value={loginCode}
							placeholder="Enter admin code"
							on:keydown={(e) => e.key === 'Enter' && handleLogin()}
						/>
					</div>
					<button class="btn" on:click={handleLogin}>Login</button>
				</div>
			</div>
		{:else}
			<!-- Admin Dashboard -->
			<div class="admin-dashboard">
				<div class="dashboard-header">
					<h2>Add New Post</h2>
					<div class="header-actions">
						<a href="/" class="btn view-posts-btn">View Website</a>
						<a href="/projects" class="btn view-posts-btn">View All Posts</a>
						<button class="btn logout-btn" on:click={handleLogout}>Logout</button>
					</div>
				</div>

				<form class="post-form" on:submit|preventDefault={handleSubmit}>
					<div class="form-row">
						<div class="form-group">
							<label for="title">Title *</label>
							<input 
								type="text" 
								id="title"
								bind:value={newPost.title}
								placeholder="Enter post title"
								required
							/>
						</div>
						<div class="form-group">
							<label for="type">Category *</label>
							<select id="type" bind:value={newPost.type} required>
								{#each projectTypes as type}
									<option value={type.value}>{type.label}</option>
								{/each}
							</select>
						</div>
					</div>

					<div class="form-row">
						<div class="form-group">
							<label for="date">Date *</label>
							<input 
								type="date" 
								id="date"
								bind:value={newPost.date}
								required
							/>
						</div>
						<div class="form-group">
							<label for="image">Image URL</label>
							<input 
								type="url" 
								id="image"
								bind:value={newPost.image}
								placeholder="https://picsum.photos/300/200?random=123"
							/>
						</div>
					</div>

					<div class="form-group">
						<label for="description">Description *</label>
						<textarea 
							id="description"
							bind:value={newPost.description}
							placeholder="Brief description of the post"
							rows="3"
							required
						></textarea>
					</div>

					<div class="form-group">
						<label for="content">Content *</label>
						<textarea 
							id="content"
							bind:value={newPost.content}
							placeholder="Full content of your post"
							rows="10"
							required
						></textarea>
					</div>

					<div class="form-actions">
						<button type="submit" class="btn submit-btn">Create Post</button>
					</div>
				</form>

				<!-- Preview Section -->
				{#if newPost.title}
					<div class="preview-section">
						<h3>Preview</h3>
						<div class="post-preview">
							<div class="preview-header">
								<h4>{newPost.title}</h4>
								<span 
									class="preview-type"
									style="background-color: {getProjectColor(newPost.type)}"
								>
									{newPost.type}
								</span>
							</div>
							<p class="preview-date">{new Date(newPost.date).toLocaleDateString()}</p>
							<p class="preview-description">{newPost.description}</p>
							{#if newPost.image}
								<img src={newPost.image} alt="Preview" class="preview-image" />
							{/if}
						</div>
					</div>
				{/if}
			</div>
		{/if}

		<!-- Messages -->
		{#if errorMessage}
			<div class="message error">
				{errorMessage}
			</div>
		{/if}

		{#if successMessage}
			<div class="message success">
				{successMessage}
			</div>
		{/if}
		</div>
	</div>
	
	<!-- Wallpaper Toolbar -->
	<div class="wallpaper-toolbar">
		<div class="toolbar-section">
			<span class="toolbar-label">Wallpaper:</span>
			<div class="color-picker">
				<button 
					class="color-btn {wallpaperColor === '#ff8c42' ? 'active' : ''}"
					style="background: #ff8c42;"
					on:click={() => {
						wallpaperColor = '#ff8c42';
						localStorage.setItem('wallpaperColor', '#ff8c42');
						document.body.style.background = '#ff8c42';
					}}
					title="Orange"
				></button>
				<button 
					class="color-btn {wallpaperColor === '#4ecdc4' ? 'active' : ''}"
					style="background: #4ecdc4;"
					on:click={() => {
						wallpaperColor = '#4ecdc4';
						localStorage.setItem('wallpaperColor', '#4ecdc4');
						document.body.style.background = '#4ecdc4';
					}}
					title="Teal"
				></button>
				<button 
					class="color-btn {wallpaperColor === '#45b7d1' ? 'active' : ''}"
					style="background: #45b7d1;"
					on:click={() => {
						wallpaperColor = '#45b7d1';
						localStorage.setItem('wallpaperColor', '#45b7d1');
						document.body.style.background = '#45b7d1';
					}}
					title="Blue"
				></button>
				<button 
					class="color-btn {wallpaperColor === '#96ceb4' ? 'active' : ''}"
					style="background: #96ceb4;"
					on:click={() => {
						wallpaperColor = '#96ceb4';
						localStorage.setItem('wallpaperColor', '#96ceb4');
						document.body.style.background = '#96ceb4';
					}}
					title="Green"
				></button>
				<button 
					class="color-btn {wallpaperColor === '#feca57' ? 'active' : ''}"
					style="background: #feca57;"
					on:click={() => {
						wallpaperColor = '#feca57';
						localStorage.setItem('wallpaperColor', '#feca57');
						document.body.style.background = '#feca57';
					}}
					title="Yellow"
				></button>
				<button 
					class="color-btn {wallpaperColor === '#9b59b6' ? 'active' : ''}"
					style="background: #9b59b6;"
					on:click={() => {
						wallpaperColor = '#9b59b6';
						localStorage.setItem('wallpaperColor', '#9b59b6');
						document.body.style.background = '#9b59b6';
					}}
					title="Purple"
				></button>
			</div>
		</div>
		
		<!-- Social Media Icons -->
		<div class="social-icons">
			<a href="https://linkedin.com/in/your-profile" target="_blank" rel="noopener noreferrer" class="social-icon" title="LinkedIn">
				<svg viewBox="0 0 24 24" fill="currentColor">
					<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
				</svg>
			</a>
			<a href="https://github.com/your-username" target="_blank" rel="noopener noreferrer" class="social-icon" title="GitHub">
				<svg viewBox="0 0 24 24" fill="currentColor">
					<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
				</svg>
			</a>
			<a href="mailto:your-email@example.com" class="social-icon" title="Email">
				<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
					<polyline points="22,6 12,13 2,6"/>
				</svg>
			</a>
			<a href="https://youtube.com/@your-channel" target="_blank" rel="noopener noreferrer" class="social-icon" title="YouTube">
				<svg viewBox="0 0 24 24" fill="currentColor">
					<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
				</svg>
			</a>
		</div>
	</div>
	</div>
</div>

<style>
	/* Desktop Frame Styles */
	.laptop-frame {
		display: flex;
		justify-content: center;
		align-items: center;
		min-height: 100vh;
		background: #ff8c42;
		padding: 0;
		position: relative;
		overflow: hidden;
		transition: all 0.3s ease-out;
	}

	.laptop-frame.navigating {
		transform: scale(1.1);
		opacity: 0.8;
		animation: frameExpand 0.3s ease-out forwards;
	}

	@keyframes frameExpand {
		0% {
			transform: scale(1);
			opacity: 1;
		}
		50% {
			transform: scale(1.05);
			opacity: 0.9;
		}
		100% {
			transform: scale(1.2);
			opacity: 0.7;
		}
	}


	.laptop-frame.contracting .laptop-screen {
		max-width: 1400px !important;
		width: 100% !important;
		height: 85vh !important;
		border: 3px solid #333333 !important;
		border-radius: 6px !important;
		box-shadow: 
			0 0 0 1px #222222,
			0 10px 25px rgba(0, 0, 0, 0.5),
			inset 0 0 10px rgba(0, 0, 0, 0.2) !important;
		transition: all 0.3s ease-out !important;
	}

	.laptop-screen {
		width: 100vw;
		height: 100vh;
		background: #ff8c42;
		border: 4px solid #333333;
		border-radius: 0;
		overflow: hidden;
		position: relative;
		box-shadow: none;
		transition: all 0.3s ease-out;
	}

	/* Frame Topbar */
	.frame-topbar {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 40px;
		background: #333333;
		border-bottom: 1px solid #222222;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0 20px;
		z-index: 100;
	}

	.topbar-left, .topbar-right {
		display: flex;
		align-items: center;
	}

	.about-link {
		color: #ffffff;
		font-family: Arial, sans-serif;
		font-size: 0.85rem;
		text-decoration: none;
		padding: 4px 8px;
		border: 1px solid transparent;
		transition: all 0.2s ease;
	}

	.about-link:hover {
		border-color: #ffffff;
		background: rgba(255, 255, 255, 0.1);
	}

	.system-time {
		color: #ffffff;
		font-family: Arial, sans-serif;
		font-size: 0.8rem;
	}

	/* Page Content */
	.page-content {
		height: 100%;
		padding: 50px 10px 10px 10px;
		overflow: auto;
	}

	/* Wallpaper Toolbar */
	.wallpaper-toolbar {
		position: absolute;
		bottom: 0;
		left: 0;
		right: 0;
		height: 35px;
		background: rgba(0, 0, 0, 0.8);
		border-top: 1px solid rgba(255, 255, 255, 0.3);
		display: flex;
		align-items: center;
		padding: 0 15px;
		z-index: 1000;
	}

	.toolbar-section {
		display: flex;
		align-items: center;
		gap: 10px;
	}

	.toolbar-label {
		color: white;
		font-size: 0.75rem;
		font-family: Arial, sans-serif;
	}

	.color-picker {
		display: flex;
		gap: 5px;
	}

	.color-btn {
		width: 20px;
		height: 20px;
		border: 2px solid transparent;
		border-radius: 3px;
		cursor: pointer;
		transition: all 0.2s ease;
	}

	.color-btn:hover {
		border-color: white;
		transform: scale(1.1);
	}

	.color-btn.active {
		border-color: white;
		box-shadow: 0 0 5px rgba(255, 255, 255, 0.5);
	}

	/* Social Media Icons */
	.social-icons {
		display: flex;
		align-items: center;
		gap: 8px;
		margin-left: auto;
	}

	.social-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 20px;
		height: 20px;
		color: #ffffff;
		text-decoration: none;
		border-radius: 3px;
		transition: all 0.2s ease;
		padding: 2px;
	}

	.social-icon:hover {
		background: rgba(255, 255, 255, 0.1);
		transform: scale(1.1);
	}

	.social-icon svg {
		width: 16px;
		height: 16px;
	}

	.admin-page {
		padding: 2rem 0;
		min-height: 100vh;
	}

	.page-title {
		font-size: 2.5rem;
		margin-bottom: 2rem;
		color: #000000;
		text-align: center;
	}

	.login-section {
		max-width: 400px;
		margin: 0 auto;
		padding: 2rem;
		border: 1px solid #000000;
		background: rgba(255, 255, 255, 0.9);
	}

	.login-section h2 {
		text-align: center;
		margin-bottom: 1.5rem;
		color: #000000;
	}

	.login-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.admin-dashboard {
		max-width: 800px;
		margin: 0 auto;
	}

	.dashboard-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 2rem;
		padding-bottom: 1rem;
		border-bottom: 2px solid #000000;
	}

	.header-actions {
		display: flex;
		gap: 10px;
		align-items: center;
	}

	.view-posts-btn {
		background: #3498db;
		text-decoration: none;
	}

	.dashboard-header h2 {
		color: #000000;
		margin: 0;
	}

	.logout-btn {
		background: #e74c3c;
	}

	.post-form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		margin-bottom: 2rem;
		padding: 2rem;
		border: 1px solid #000000;
		background: rgba(255, 255, 255, 0.9);
	}

	.form-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 1rem;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.form-group label {
		font-weight: bold;
		color: #000000;
	}

	.form-group input,
	.form-group select,
	.form-group textarea {
		padding: 0.75rem;
		border: 1px solid #000000;
		font-family: Arial, sans-serif;
		font-size: 1rem;
		background: #ffffff;
	}

	.form-group textarea {
		resize: vertical;
		min-height: 100px;
	}

	.form-actions {
		display: flex;
		justify-content: center;
		margin-top: 1rem;
	}

	.submit-btn {
		background: #2ecc71;
		font-size: 1.1rem;
		padding: 1rem 2rem;
	}

	.preview-section {
		margin-top: 2rem;
		padding: 2rem;
		border: 1px solid #000000;
		background: rgba(255, 255, 255, 0.9);
	}

	.preview-section h3 {
		color: #000000;
		margin-bottom: 1rem;
	}

	.post-preview {
		border: 1px solid #000000;
		padding: 1.5rem;
		background: #ffffff;
	}

	.preview-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 1rem;
	}

	.preview-header h4 {
		color: #000000;
		margin: 0;
		font-size: 1.2rem;
	}

	.preview-type {
		padding: 0.25rem 0.75rem;
		color: #ffffff;
		font-size: 0.8rem;
		font-weight: bold;
		text-transform: uppercase;
	}

	.preview-date {
		color: #636e72;
		font-size: 0.9rem;
		margin-bottom: 0.5rem;
	}

	.preview-description {
		color: #2d3436;
		line-height: 1.6;
		margin-bottom: 1rem;
	}

	.preview-image {
		width: 100%;
		max-width: 300px;
		height: 200px;
		object-fit: cover;
		border: 1px solid #000000;
	}

	.message {
		padding: 1rem;
		margin: 1rem 0;
		border: 1px solid #000000;
		font-weight: bold;
	}

	.message.error {
		background: #ffebee;
		color: #c62828;
	}

	.message.success {
		background: #e8f5e8;
		color: #2e7d32;
		white-space: pre-line;
	}

	.btn {
		padding: 0.75rem 1.5rem;
		border: 1px solid #000000;
		background: #000000;
		color: #ffffff;
		cursor: pointer;
		font-family: Arial, sans-serif;
		font-size: 1rem;
		transition: all 0.3s ease;
	}

	.btn:hover {
		opacity: 0.8;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.form-row {
			grid-template-columns: 1fr;
		}

		.dashboard-header {
			flex-direction: column;
			gap: 1rem;
			align-items: stretch;
		}

		.page-title {
			font-size: 2rem;
		}
	}
</style> 