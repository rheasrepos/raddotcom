// Utility functions for managing posts - Git-based system

import { writable } from 'svelte/store';

// Define types for better type safety
/** @typedef {Object} Post
 * @property {number} id
 * @property {string} title
 * @property {string} description
 * @property {string} type
 * @property {string} date
 * @property {string} image
 * @property {string} content
 */

// Create a writable store for posts
export const posts = writable(/** @type {Post[]} */ ([]));

// Hardcoded posts - these are your base posts that never get lost
const hardcodedPosts = [
	{
		id: 1,
		title: "My First Blog Post",
		description: "Welcome to my eclectic personal website!",
		type: "writing",
		date: "2024-01-15",
		image: "https://picsum.photos/400/300?random=1",
		content: "This is my first blog post. I'm excited to share my thoughts, projects, and creative endeavors here."
	},
	{
		id: 2,
		title: "A Cool Programming Project",
		description: "Building something awesome with code",
		type: "programming",
		date: "2024-01-20",
		image: "https://picsum.photos/400/300?random=2",
		content: "I've been working on this really cool programming project. It involves lots of interesting algorithms and creative problem-solving."
	},
	{
		id: 3,
		title: "New Music Track",
		description: "Just finished recording a new song",
		type: "music",
		date: "2024-02-01",
		image: "https://picsum.photos/400/300?random=3",
		content: "I've been in the studio working on some new music. This track has been in my head for months and I'm finally happy with how it turned out."
	},
	{
		id: 4,
		title: "Comedy Sketch",
		description: "A funny bit I've been working on",
		type: "comedy",
		date: "2024-02-10",
		image: "https://picsum.photos/400/300?random=4",
		content: "Here's a comedy sketch I've been developing. It's about the absurdity of everyday life and I think it's pretty funny."
	},
	{
		id: 5,
		title: "Digital Art Piece",
		description: "Exploring new artistic techniques",
		type: "art",
		date: "2024-02-15",
		image: "https://picsum.photos/400/300?random=5",
		content: "I've been experimenting with digital art lately. This piece explores themes of connection and isolation in the modern world."
	}
];

/**
 * Load all posts (hardcoded + Git-based posts)
 * This ensures you never lose posts
 * @returns {Promise<Post[]>}
 */
export async function loadPosts() {
	try {
		// Start with hardcoded posts
		let allPosts = [...hardcodedPosts];
		
		// Load Git-based posts from API (if in browser)
		if (typeof window !== 'undefined') {
			try {
				const response = await fetch('/api/posts');
				if (response.ok) {
					const gitPosts = await response.json();
					// Merge Git posts with hardcoded posts
					allPosts = [...allPosts, ...gitPosts];
				}
			} catch (error) {
				console.warn('Could not load Git posts:', error);
			}
		}
		
		// Sort by date (newest first)
		const sortedPosts = allPosts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
		
		// Update the store
		posts.set(sortedPosts);
		
		return sortedPosts;
	} catch (error) {
		console.warn('Error loading posts:', error);
		// Fallback to hardcoded posts only
		posts.set(hardcodedPosts);
		return hardcodedPosts;
	}
}

/**
 * Create a new post (saves to Git via API)
 * @param {Post} postData
 * @returns {Promise<Object>}
 */
export async function createPost(postData) {
	try {
		// Generate a unique ID (higher than hardcoded posts)
		const existingPosts = await loadPosts();
		const maxId = Math.max(...existingPosts.map((/** @type {Post} */ p) => p.id));
		const newPost = {
			...postData,
			id: maxId + 1
		};
		
		// Send post to API for Git commit
		const response = await fetch('/api/posts', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(newPost)
		});
		
		const result = await response.json();
		
		if (result.success) {
			// Reload posts to update the store
			await loadPosts();
			return { success: true, post: newPost, message: result.message };
		} else {
			throw new Error(result.message || 'Failed to create post');
		}
	} catch (error) {
		console.error('Error creating post:', error);
		throw error;
	}
}

/**
 * Delete an admin-created post
 * @param {number} postId
 * @returns {Promise<Object>}
 */
export async function deletePost(postId) {
	try {
		// Don't allow deletion of hardcoded posts
		const hardcodedIds = hardcodedPosts.map(p => p.id);
		if (hardcodedIds.includes(postId)) {
			throw new Error('Cannot delete hardcoded posts');
		}
		
		// Load existing admin posts
		let adminPosts = [];
		if (typeof window !== 'undefined') {
			const savedPosts = localStorage.getItem('adminPosts');
			if (savedPosts) {
				try {
					adminPosts = JSON.parse(savedPosts);
				} catch (error) {
					console.warn('Error parsing existing admin posts:', error);
				}
			}
		}
		
		// Remove the post
		adminPosts = adminPosts.filter((/** @type {Post} */ p) => p.id !== postId);
		
		// Save to localStorage
		if (typeof window !== 'undefined') {
			localStorage.setItem('adminPosts', JSON.stringify(adminPosts));
		}
		
		// Reload posts to update the store
		await loadPosts();
		
		return { success: true };
	} catch (error) {
		console.error('Error deleting post:', error);
		throw error;
	}
}

/**
 * Get project color by type
 * @param {string} type
 * @returns {string}
 */
export function getProjectColor(type) {
	const colors = {
		writing: '#3498db',
		programming: '#2ecc71',
		music: '#e74c3c',
		comedy: '#f39c12',
		art: '#9b59b6'
	};
	return colors[/** @type {keyof typeof colors} */ (type)] || '#95a5a6';
}

/**
 * Format date for display
 * @param {string} dateString
 * @returns {string}
 */
export function formatDate(dateString) {
	const date = new Date(dateString);
	return date.toLocaleDateString('en-US', { 
		year: 'numeric', 
		month: 'long', 
		day: 'numeric' 
	});
}

/**
 * Filter projects by type and date range
 * @param {Post[]} projects
 * @param {string} filter
 * @param {string|null} startDate
 * @param {string|null} endDate
 * @returns {Post[]}
 */
export function filterProjects(projects, filter = 'all', startDate = null, endDate = null) {
	return projects.filter((/** @type {Post} */ project) => {
		const typeMatch = filter === 'all' || project.type === filter;
		const dateMatch = !startDate || !endDate || (
			new Date(project.date) >= new Date(startDate) && 
			new Date(project.date) <= new Date(endDate)
		);
		return typeMatch && dateMatch;
	});
}

/**
 * Get a single post by ID
 * @param {Post[]} posts
 * @param {string|number} id
 * @returns {Post|undefined}
 */
export function getPostById(posts, id) {
	return posts.find(post => post.id === parseInt(String(id)));
}

/**
 * Get unique months/years from posts for navigation
 * @param {Post[]} posts
 * @returns {string[]}
 */
export function getUniqueMonths(posts) {
	const months = new Set();
	posts.forEach((/** @type {Post} */ post) => {
		const date = new Date(post.date);
		const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
		months.add(monthYear);
	});
	
	return Array.from(months).sort().reverse();
}

/**
 * Get posts by month/year
 * @param {Post[]} posts
 * @param {string} monthYear
 * @returns {Post[]}
 */
export function getPostsByMonth(posts, monthYear) {
	return posts.filter((/** @type {Post} */ post) => {
		const date = new Date(post.date);
		const postMonthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
		return postMonthYear === monthYear;
	});
}

/**
 * Export all posts (hardcoded + admin) for backup
 * @returns {Promise<Post[]>}
 */
export async function exportAllPosts() {
	const allPosts = await loadPosts();
	return allPosts;
}

/**
 * Import posts (for backup restoration)
 * @param {Post[]} postsToImport
 * @returns {Promise<Object>}
 */
export async function importPosts(postsToImport) {
	try {
		// Separate hardcoded and admin posts
		const hardcodedIds = hardcodedPosts.map(p => p.id);
		const adminPosts = postsToImport.filter(p => !hardcodedIds.includes(p.id));
		
		// Save admin posts to localStorage
		if (typeof window !== 'undefined') {
			localStorage.setItem('adminPosts', JSON.stringify(adminPosts));
		}
		
		// Reload posts
		await loadPosts();
		
		return { success: true, imported: adminPosts.length };
	} catch (error) {
		console.error('Error importing posts:', error);
		throw error;
	}
} 