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
// Updated with projects from Rhea Madhogarhia's CV
const hardcodedPosts = [
	{
		id: 1,
		title: "ML Engineering Intern @ Reddit",
		description: "Engineered a novel, signal-driven First Pass Ranker (FPR) in Go and Python to improve search relevance.",
		type: "programming",
		date: "2025-08-15",
		image: "https://picsum.photos/400/300?random=1",
		content: "As a Machine Learning Engineering Intern at Reddit, I engineered and productionized a novel, signal-driven First Pass Ranker (FPR) in Go and Python. This was designed to improve search relevance using historical user engagement data. I also designed and tuned a ratio-driven boosting algorithm using Bayesian Optimization to prioritize high-value content and penalize clickbait."
	},
	{
		id: 2,
		title: "Data Science & ML Intern @ Charactour",
		description: "Performed exploratory data analysis on 9M+ users and utilized BERT Regression.",
		type: "programming",
		date: "2024-08-01",
		image: "https://picsum.photos/400/300?random=2",
		content: "During my internship at Charactour, I performed exploratory data analysis on personality traits from over 9 million users using Python (Pandas). I also utilized BERT Regression to discover correlations between media properties and their fanbases."
	},
	{
		id: 3,
		title: "Research Assistant @ CAB Lab",
		description: "Co-authored a preprint on neural reinstatement during narrative comprehension and developed NLP techniques for fMRI data.",
		type: "research",
		date: "2025-03-12",
		image: "https://picsum.photos/400/300?random=3",
		content: "At the Cognition, Attention, and Brain (CAB) Lab, I co-authored a preprint on neural reinstatement during narrative comprehension. My contributions included conceptualization, data curation, investigation, and writing/editing. I am also developing a methodological comparison of NLP techniques (LLMs, BERT, Flair) for sentiment analysis on transcribed fMRI speech data."
	},
	{
		id: 4,
		title: "Publication: Cortical Reinstatement (Preprint)",
		description: "Song, H., Ke, J., Madhogarhia, R., Leong, Y. C., & Rosenberg, M. D. (2025).",
		type: "writing",
		date: "2025-03-12",
		image: "https://picsum.photos/400/300?random=4",
		content: "Full preprint title: Song, H., Ke, J., Madhogarhia, R., Leong, Y. C., & Rosenberg, M. D. (2025). Cortical reinstatement of causally related events sparks narrative insights by updating neural representation patterns. bioRxiv. doi: 10.1101/2025.03.12.642853"
	},
	{
		id: 5,
		title: "Improv & Sketch Comedy @ Off-Off Campus",
		description: "Trainer, Improviser, Writer & Director for the nation's second-oldest collegiate improv group.",
		type: "comedy",
		date: "2024-01-10",
		image: "https://picsum.photos/400/300?random=5",
		content: "I am a Trainer, Improviser, Writer & Director for Off-Off Campus, the nation's second-oldest collegiate improvisational & sketch comedy group."
	},
	{
		id: 6,
		title: "A Cappella Vocalist @ Voices In Your Head",
		description: "A Cappella Vocalist for an award-winning collegiate a cappella group.",
		type: "music",
		date: "2024-01-05",
		image: "https://picsum.photos/400/300?random=6",
		content: "I am an A Cappella Vocalist for Voices In Your Head, an award-winning collegiate a cappella group at the University of Chicago."
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
		writing: '#4ecdc4',
		programming: '#45b7d1',
		music: '#96ceb4',
		comedy: '#feca57',
		research: '#3498db'
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