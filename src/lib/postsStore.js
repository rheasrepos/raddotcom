import { writable } from 'svelte/store';
import { loadPosts, loadGitPosts } from './posts.js';

// Initialize the store with empty array for SSR
const initialPosts = [];

// Create a writable store for posts
export const posts = writable(initialPosts);

// Initialize posts on client side only
if (typeof window !== 'undefined') {
	// Load hardcoded posts immediately for SSR compatibility
	posts.set(loadPosts());
	
	// Then try to load Git posts in the background
	loadGitPosts().then(gitPosts => {
		if (gitPosts && gitPosts.length > 0) {
			posts.set(gitPosts);
		}
	}).catch(() => {
		// Keep hardcoded posts if Git fails
		console.warn('Could not load Git posts, using hardcoded posts');
	});
}

// Actions for managing posts
export const postsActions = {
	// Add a new post
	addPost: (newPost) => {
		posts.update(currentPosts => {
			// Ensure the post has a unique ID
			const postWithId = {
				...newPost,
				id: newPost.id || Date.now()
			};
			return [...currentPosts, postWithId];
		});
	},

	// Remove a post
	removePost: (postId) => {
		posts.update(currentPosts => 
			currentPosts.filter(post => post.id !== postId)
		);
	},

	// Update a post
	updatePost: (postId, updates) => {
		posts.update(currentPosts =>
			currentPosts.map(post => 
				post.id === postId ? { ...post, ...updates } : post
			)
		);
	},

	// Get a specific post by ID
	getPost: (postId) => {
		let foundPost = null;
		posts.subscribe(currentPosts => {
			foundPost = currentPosts.find(post => post.id === postId);
		})();
		return foundPost;
	},

	// Refresh posts from Git
	refreshFromGit: async () => {
		try {
			const gitPosts = await loadGitPosts();
			if (gitPosts && gitPosts.length > 0) {
				posts.set(gitPosts);
				return true;
			}
		} catch (error) {
			console.warn('Could not refresh posts from Git:', error);
		}
		return false;
	}
}; 