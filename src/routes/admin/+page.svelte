<script>
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';

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

<div class="admin-page">
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

<style>
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