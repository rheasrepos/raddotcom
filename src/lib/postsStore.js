import { writable } from 'svelte/store';
import { loadPosts } from './posts.js';

// Initialize the store with empty array for SSR
const initialPosts = typeof window !== 'undefined' ? loadPosts() : [];

// Create a writable store for posts
export const posts = writable(initialPosts);

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
	}
}; 