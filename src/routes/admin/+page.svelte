<script>
	import PageLayout from '../../components/PageLayout.svelte';
	import { categoryConfig } from '../../lib/categories.js';
	import { posts, postsActions } from '../../lib/postsStore.js';
	
	// Admin state
	let isLoggedIn = false;
	let adminCode = '';
	let showLoginForm = true;
	
	// Get categories from the config
	let categories = Object.values(categoryConfig);
	
	// Post creation state
	let newPost = {
		title: '',
		description: '',
		content: '',
		type: 'writing',
		date: new Date().toISOString().split('T')[0]
	};
	
	let isSubmitting = false;
	let submitMessage = '';
	let submitError = '';
	
	// Admin code (you can change this)
	const ADMIN_CODE = 'rad2024';
	
	function formatDate(dateString) {
		const date = new Date(dateString);
		return date.toLocaleDateString('en-US', { 
			year: 'numeric', 
			month: 'long', 
			day: 'numeric' 
		});
	}
	
	function handleLogin() {
		if (adminCode === ADMIN_CODE) {
			isLoggedIn = true;
			showLoginForm = false;
			adminCode = '';
		} else {
			alert('Incorrect admin code!');
		}
	}
	
	function handleLogout() {
		isLoggedIn = false;
		showLoginForm = true;
		newPost = {
			title: '',
			description: '',
			content: '',
			type: 'writing',
			date: new Date().toISOString().split('T')[0]
		};
		submitMessage = '';
		submitError = '';
	}
	
	async function submitPost() {
		if (!newPost.title.trim() || !newPost.content.trim()) {
			submitError = 'Please fill in all required fields.';
			return;
		}
		
		isSubmitting = true;
		submitError = '';
		submitMessage = '';
		
		// Generate a unique ID for the new post
		const postWithId = {
			...newPost,
			id: Date.now() // Use timestamp as unique ID
		};
		
		try {
			const response = await fetch('/api/posts', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(postWithId)
			});
			
			if (response.ok) {
				submitMessage = 'Post created successfully!';
				
				// Refresh posts from Git to get the updated list
				const refreshed = await postsActions.refreshFromGit();
				if (!refreshed) {
					// Fallback: add to store manually
					postsActions.addPost(postWithId);
				}
				
				// Reset form
				newPost = {
					title: '',
					description: '',
					content: '',
					type: 'writing',
					date: new Date().toISOString().split('T')[0]
				};
			} else {
				const error = await response.text();
				submitError = `Error creating post: ${error}`;
			}
		} catch (error) {
			submitError = `Network error: ${error.message}`;
		} finally {
			isSubmitting = false;
		}
	}
</script>

<PageLayout title="Admin - Rhea Madhogarhia">
	<!-- Header Section -->
	<section class="header-section">
		<div class="header-content">
			<h1 class="page-title">Admin Panel</h1>
			<p class="page-description">Manage your content and create new posts</p>
		</div>
	</section>

	<!-- Login Section -->
	{#if showLoginForm}
		<section class="login-section">
			<div class="login-card card">
				<h3 class="section-title">Admin Login</h3>
				<div class="login-form">
					<div class="form-group">
						<label for="adminCode" class="form-label">Admin Code:</label>
						<input 
							type="password" 
							id="adminCode"
							class="form-input"
							bind:value={adminCode}
							placeholder="Enter admin code"
							on:keydown={(e) => e.key === 'Enter' && handleLogin()}
						/>
					</div>
					<button class="login-btn btn" on:click={handleLogin}>
						Login
					</button>
				</div>
			</div>
		</section>
	{:else}
		<!-- Admin Dashboard -->
		<section class="dashboard-section">
			<div class="dashboard-header card">
				<div class="dashboard-info">
					<h3 class="section-title">Welcome, Admin!</h3>
					<p class="dashboard-stats">
						Total Posts: {$posts.length} | 
						Categories: {categories.length}
					</p>
				</div>
				<button class="logout-btn btn" on:click={handleLogout}>
					Logout
				</button>
			</div>
		</section>

		<!-- Create New Post Section -->
		<section class="create-post-section">
			<div class="create-post-card card">
				<h3 class="section-title">Create New Post</h3>
				
				{#if submitMessage}
					<div class="success-message">
						{submitMessage}
					</div>
				{/if}
				
				{#if submitError}
					<div class="error-message">
						{submitError}
					</div>
				{/if}
				
				<form class="post-form" on:submit|preventDefault={submitPost}>
					<div class="form-row">
						<div class="form-group">
							<label for="postTitle" class="form-label">Title</label>
							<input 
								type="text" 
								id="postTitle"
								class="form-input"
								bind:value={newPost.title}
								placeholder="Enter post title"
								required
							/>
						</div>
						
						<div class="form-group">
							<label for="postCategory" class="form-label">Category</label>
							<select id="postCategory" class="form-select" bind:value={newPost.type}>
								{#each categories as category}
									<option value={category.id}>{category.label}</option>
								{/each}
							</select>
						</div>
					</div>
					
					<div class="form-group">
						<label for="postExcerpt" class="form-label">Description</label>
						<textarea 
							id="postExcerpt"
							class="form-textarea"
							bind:value={newPost.description}
							placeholder="Brief description of the post"
							rows="3"
						></textarea>
					</div>
					
					<div class="form-group">
						<label for="postContent" class="form-label">Content</label>
						<textarea 
							id="postContent"
							class="form-textarea"
							bind:value={newPost.content}
							placeholder="Write your post content here..."
							rows="10"
							required
						></textarea>
					</div>
					
					<div class="form-group">
						<label for="postDate" class="form-label">Date</label>
						<input 
							type="date" 
							id="postDate"
							class="form-input"
							bind:value={newPost.date}
						/>
					</div>
					
					<div class="form-actions">
						<button 
							type="submit" 
							class="submit-btn btn"
							disabled={isSubmitting}
						>
							{isSubmitting ? 'Creating...' : 'Create Post'}
						</button>
					</div>
				</form>
			</div>
		</section>

		<!-- Recent Posts Section -->
		<section class="recent-posts-section">
			<div class="recent-posts-card card">
				<h3 class="section-title">Recent Posts</h3>
				<div class="posts-list">
					{#each $posts.slice(0, 5) as post}
						<div class="post-item">
							<div class="post-info">
								<h4 class="post-title">{post.title}</h4>
								<p class="post-meta">
									{formatDate(post.date)} • {post.type}
								</p>
							</div>
							<a href="/posts/{post.id}" class="view-post-btn" target="_blank">
								View Post
							</a>
						</div>
					{/each}
				</div>
			</div>
		</section>
	{/if}
</PageLayout>

<style>
	/* Header Section */
	.header-section {
		margin-bottom: 2rem;
	}

	.header-content {
		text-align: center;
	}

	.page-title {
		font-size: 2.5rem;
		font-weight: bold;
		margin-bottom: 0.5rem;
		color: #333;
	}

	.page-description {
		font-size: 1.1rem;
		color: #666;
	}

	/* Login Section */
	.login-section {
		max-width: 400px;
		margin: 0 auto;
	}

	.login-card {
		padding: 2rem;
	}

	.login-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.login-btn {
		background: #4ecdc4;
		color: white;
		border: none;
		padding: 12px 24px;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1rem;
		transition: background 0.3s ease;
	}

	.login-btn:hover {
		background: #45b7d1;
	}

	/* Dashboard Section */
	.dashboard-section {
		margin-bottom: 2rem;
	}

	.dashboard-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
	}

	.dashboard-stats {
		color: #666;
		margin: 0;
	}

	.logout-btn {
		background: #e74c3c;
		color: white;
		border: none;
		padding: 8px 16px;
		border-radius: 4px;
		cursor: pointer;
		font-size: 0.9rem;
	}

	.logout-btn:hover {
		background: #c0392b;
	}

	/* Create Post Section */
	.create-post-section {
		margin-bottom: 2rem;
	}

	.create-post-card {
		padding: 2rem;
	}

	.post-form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
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

	.form-label {
		font-weight: 600;
		color: #333;
	}

	.form-input,
	.form-select,
	.form-textarea {
		padding: 10px 12px;
		border: 2px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
		font-family: Arial, sans-serif;
		transition: border-color 0.3s ease;
	}

	.form-input:focus,
	.form-select:focus,
	.form-textarea:focus {
		outline: none;
		border-color: #4ecdc4;
	}

	.form-textarea {
		resize: vertical;
		min-height: 100px;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
	}

	.submit-btn {
		background: #4ecdc4;
		color: white;
		border: none;
		padding: 12px 24px;
		border-radius: 4px;
		cursor: pointer;
		font-size: 1rem;
		transition: background 0.3s ease;
	}

	.submit-btn:hover:not(:disabled) {
		background: #45b7d1;
	}

	.submit-btn:disabled {
		background: #ccc;
		cursor: not-allowed;
	}

	/* Messages */
	.success-message {
		background: #d4edda;
		color: #155724;
		padding: 12px;
		border-radius: 4px;
		margin-bottom: 1rem;
		border: 1px solid #c3e6cb;
	}

	.error-message {
		background: #f8d7da;
		color: #721c24;
		padding: 12px;
		border-radius: 4px;
		margin-bottom: 1rem;
		border: 1px solid #f5c6cb;
	}

	/* Recent Posts Section */
	.recent-posts-section {
		margin-bottom: 2rem;
	}

	.recent-posts-card {
		padding: 1.5rem;
	}

	.posts-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.post-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		background: #f9f9f9;
	}

	.post-title {
		margin: 0 0 0.25rem 0;
		font-size: 1.1rem;
		color: #333;
	}

	.post-meta {
		margin: 0;
		color: #666;
		font-size: 0.9rem;
	}

	.view-post-btn {
		background: #4ecdc4;
		color: white;
		text-decoration: none;
		padding: 6px 12px;
		border-radius: 4px;
		font-size: 0.9rem;
		transition: background 0.3s ease;
	}

	.view-post-btn:hover {
		background: #45b7d1;
	}

	/* Card Styles */
	.card {
		background: white;
		border: 2px solid #333;
		border-radius: 0;
		box-shadow: none;
	}

	/* Section Titles */
	.section-title {
		font-size: 1.5rem;
		font-weight: bold;
		margin-bottom: 1rem;
		color: #333;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.form-row {
			grid-template-columns: 1fr;
		}
		
		.dashboard-header {
			flex-direction: column;
			gap: 1rem;
			text-align: center;
		}
		
		.post-item {
			flex-direction: column;
			gap: 0.5rem;
			text-align: center;
		}
	}
</style> 