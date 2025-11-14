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

// Helper for random dates
function getRandomDate(startDate, endDate) {
  const date = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
  return date.toISOString().split('T')[0];
}
const startDate = new Date(2025, 8, 1); // Sep 1, 2025
const endDate = new Date(2025, 10, 14); // Nov 14, 2025

// --- NEW POSTS PARSED FROM THESIS DUMP ---
// I've taken the blurbs from your document and turned them into individual posts.
const thesisDumpPosts = [
	{
		id: 101,
		title: 'How do we explain neuroscience...',
		description: 'How do we explain the findings of a field like neuroscience while thinking that there is something like a human mind?',
		type: 'thesis',
		date: getRandomDate(startDate, endDate),
		content: 'How do we explain the findings of a field like neuroscience while thinking that there is something like a human mind?'
	},
	{
		id: 102,
		title: 'The Materialist Neuroscientist...',
		description: 'A materialist neuroscientist may do away with the idea that the mind exists, but plenty don’t. I for one, think that the mind exists and that there is something unique about our human species...',
		type: 'thesis',
		date: getRandomDate(startDate, endDate),
		content: 'Well, neuroscience claims to study the brain. Neuroscientistis do not just care about the human brain right? A materialist neuroscientist may do away with the idea that the mind exists, but plenty don’t. I for one, think that the mind exists and that there is something unique about our human species, that our mind is different and unique from any minds that another species may or may not inhabit. Then why do I also believe in the field of neuroscience? I think it’s a fascinating hypothesis. I think that it tells us something about brains. I think it does a really good job of mapping out neural structures that make even conceiving of our minds possible. I don’t think it’s unique to humans though.'
	},
	{
		id: 103,
		title: 'Is a computer a brain?',
		description: 'Many people ask whether the brain is a computer. But I do believe we should flip the question, is a computer a brain.',
		type: 'thesis',
		date: getRandomDate(startDate, endDate),
		content: 'Many people ask whether the brain is a computer. But I do believe we should flip the question, is a computer a brain.'
	},
	{
		id: 104,
		title: 'We designed it as such...',
		description: 'Well we designed it as such, it’s showing signs of working as such, it shows thinking, rationality, intention, and we don’t know how it works. Everything we would ascribe to human brain behavior, multimodal models simulate perception, etc',
		type: 'thesis',
		date: getRandomDate(startDate, endDate),
		content: 'Well we designed it as such, it’s showing signs of working as such, it shows thinking, rationality, intention, and we don’t know how it works. Everything we would ascribe to human brain behavior, multimodal models simulate perception, etc'
	},
	{
		id: 105,
		title: 'Using neuroscience for neural networks...',
		description: 'But if indeed, the computer is a brain, then we should use neuroscience as a way of understanding neural networks, not the human condition or behavior.',
		type: 'thesis',
		date: getRandomDate(startDate, endDate),
		content: 'But if indeed, the computer is a brain, then we should use neuroscience as a way of understanding neural networks, not the human condition or behavior. Many people would concede that they have a mind, many people would also concede that humans are a unique animal. That man is special. SO let me make an argument to all of these people and convince them of the value of neuroscience'
	},
	{
		id: 106,
		title: 'Neuroscience as computational representation...',
		description: 'Neuroscience, as it relates to human brains, is a computational representation of functional states. A map of numbers across the physical structure that we call the human brain.',
		type: 'thesis',
		date: getRandomDate(startDate, endDate),
		content: 'Neuroscience, as it relates to human brains, is a computational representation of functional states. A map of numbers across the physical structure that we call the human brain. Neuroscience does not study the brain in a natural way, it studies physical material and electiricy not by its physical characteristics per say, but through math, through computation, through the changing and swelling of numbers, through activations'
	},
	{
		id: 107,
		title: 'Mimicked in computer systems...',
		description: 'All of these properties are mimicked in computer systems. WE study activation patterns, the numbers of a network are updated and changed and trained through the consumption of data (equivalent of experience).',
		type: 'thesis',
		date: getRandomDate(startDate, endDate),
		content: 'All of these properties are mimicked in computer systems. WE study activation patterns, the numbers of a network are updated and changed and trained through the consumption of data (equivalent of experience). And we use neuroscience to generalize, to make predictions about what a certain activation pattern means. Assuming that our brains work like this prediction machine. Well, Computer ai models are trained to generalize. We have crafted them to do the very same thing neuroscientist think humans do.'
	},
	{
		id: 108,
		title: 'EXACTLY how a model works...',
		description: 'While this is our best guess of how the human brain works, this is EXACTLY how a model works. It was indeed designed this way. Designed based off of the neuroscientific study of the brain.',
		type: 'thesis',
		date: getRandomDate(startDate, endDate),
		content: 'While this is our best guess of how the human brain works, this is EXACTLY how a model works. It was indeed designed this way. Designed based off of the neuroscientific study of the brain.'
	},
	{
		id: 109,
		title: 'Existential and philosophical motivation...',
		description: 'But there is a more existential and philosophical motivation for this essay. Specifically, that if we are to enter a digital age where a computational system exhibits exactly all the behaviors neurosciecnitsis think humans do, then what constitutes our humanity, but the mind?',
		type: 'thesis',
		date: getRandomDate(startDate, endDate),
		content: 'But there is a more existential and philosophical motivation for this essay. Specifically, that if we are to enter a digital age where a computational system exhibits exactly all the behaviors neurosciecnitsis think humans do, then what constitutes our humanity, but the mind? Computers may become embodied through robotics etc, but humans Brians were never constructed by another human’s hands. IF we aim to keep what is special to us about our humanity, then we must care about the mind.'
	},
	{
		id: 110,
		title: 'The Seduction of Language...',
		description: 'If we can do this, we can better understand the danger it may create, we may be better equipped to ward off the mimicry of humans and the seductive language that a chatbot may feed us...',
		type: 'thesis',
		date: getRandomDate(startDate, endDate),
		content: '...if you believe that humanity is something to be preserved, maybe self centeredly, than I urge you to take this view seriously and hopefully it will urge you to invest in the sciences, in neuroscience, in order to better understand the systems we create. If we can do this, we can better understand the danger it may create, we may be better equipped to ward off the mimicry of humans and the seductive language that a chatbot may feed us, we may understand that we are not interacting with systems that care about us, or are doing things in our best interest, or think the way we do. That, even if they outwardly copy us in every way, they do not know why we do things the way we do them, they may say they desire for the same reasons we do but be communicating that desire for a reason other than desire.'
	},
	{
		id: 111,
		title: 'Topics to cover...',
		description: 'The Mind, the materialist, the dualist, the human. Computational Nature of Neuroscience and FMRI. How did we achieve intelligent systems? Daminnig ourselves. The computer is a brain...',
		type: 'thesis',
		date: getRandomDate(startDate, endDate),
		content: 'SO we will talk about: The Mind, the materialist, the dualist, the human. Computational Nature of Neuroscience and FMRI. How did we achieve intelligent systems? Daminnig ourselves. The computer is a brain. Seduction of Language. How neuroscience can study Artifial Neural Networks. Why understanding neural networks is important for computer systems. Is there an ethical issue with controlling these systems. The ways in which ai and llms are diff than humans (esp considering that we cannot call these systems stochastic parrots)'
	},
	{
		id: 112,
		title: 'Is language and data all a human has?',
		description: 'Is language and data all a human has? Do we emote based on data? Do we pull from our data every time we act? Concsicouly? No? So then does a computer have an unconscious?',
		type: 'thesis',
		date: getRandomDate(startDate, endDate),
		content: 'Is language and data all a human has? Do we emote based on data? Do we pull from our data every time we act? Concsicouly? No? So then does a computer have an unconscious?'
	},
	{
		id: 113,
		title: 'What enabled wonder?',
		description: 'Keep dear what you love about humanity, many facets of our live will erode, but save your values pass them down, remember what you thought was special, what enabled you to even think that AI was a worthy innovation rather than just a given of the world- wonder, creativity, exicitement, discovery, where did these things come from',
		type: 'thesis',
		date: getRandomDate(startDate, endDate),
		content: 'Keep dear what you love about humanity, many facets of our live will erode, but save your values pass them down, remember what you thought was special, what enabled you to even think that AI was a worthy innovation rather than just a given of the world- wonder, creativity, exicitement, discovery, where did these things come from'
	},
	{
		id: 114,
		title: 'The meaning of Chat GPT output...',
		description: 'What are we to make of what we read from Chat GPT. It is human nature to find things meaningful.',
		type: 'thesis',
		date: getRandomDate(startDate, endDate),
		content: 'In what sense is an LLM thinking. What are we to make of what we read from Chat GPT. It is human nature to find things meaningful.'
	},
	{
		id: 115,
		title: 'It is too hard to say whether a machine cannot think',
		description: 'It is too hard to say whether a machine cannot think. So let me take that as true. What is still different about the human brain? Its orginin, were were programmed',
		type: 'thesis',
		date: getRandomDate(startDate, endDate),
		content: 'It is too hard to say whether a machine cannot think. So let me take that as true. What is still different about the human brain? Its orginin, were were programmed'
	},
	{
		id: 116,
		title: 'AI is directed intelligence...',
		description: '...we call AI Artificial so as to not mean biological but artificial does not mean fake, it means it was designed with a goal or desire or goal in mind. Its intelligence is directed',
		type: 'thesis',
		date: getRandomDate(startDate, endDate),
		content: 'We do things that are irrational, we do things that are bad for survival, all of our brains are SO different. So it is not that we can think that is different to human to computer, it is how we think that differs. And there is something special about how we think and our kind of intelligence, we call AI Artificial so as to not mean biological but artificial does not mean fake, it means it was designed with a goal or desire or goal in mind. Its intelligence is directed'
	},
	{
		id: 117,
		title: 'Expectations of the system...',
		description: 'These systems are being designed with the goal of reaching intelligence, but a human was not born or created and asked to be an intelligent being. The expectations the system has for itself are different than for humans',
		type: 'thesis',
		date: getRandomDate(startDate, endDate),
		content: 'These systems are being designed with the goal of reaching intelligence, but a human was not born or created and asked to be an intelligent being. The expectations the system has for itself are different than for humans. We often start off with no expectations of ourselves whereas a program does.'
	},
	{
		id: 118,
		title: 'The cruelty of digital qualia...',
		description: 'Do we ant to subject computers to the same conundrum as humans, having a qualia a feeling an intuition that cannot be tractable or defined (SEVERANCE) does that not seem cruel and unethical...',
		type: 'thesis',
		date: getRandomDate(startDate, endDate),
		content: 'Do we ant to subject computers to the same conundrum as humans, having a qualia a feeling an intuition that cannot be tractable or defined (SEVERANCE) does that not seem cruel and unethical, especially if we have no desire to live amongst them as we live amongst each other'
	},
	{
		id: 119,
		title: 'The biological nature of humans...',
		description: 'Biological nature of humans is important, it is the basis of our existence as we know it. Without our bodies, we would not know we existed, and would not realize we can think...',
		type: 'thesis',
		date: getRandomDate(startDate, endDate),
		content: 'Biological nature of humans is important, it is the basis of our existence as we know it. Without our bodies, we would not know we existed, and would not realize we can think, until maybe once we die we persist, but I do not know or think of a time in my life that I was not a biological being attached to maybe my immaterial mind I’ve always been able to transfer my thoughts to my head etc'
	},
	{
		id: 120,
		title: 'Eroding what makes us human...',
		description: 'Our world is becoming less natural and more articial. Design is becoming more pormininet, we are possibly eroding the very thing that makes us human , our mortality, our imperfection...',
		type: 'thesis',
		date: getRandomDate(startDate, endDate),
		content: 'Is natural selection design?? Well as we attempt to reverse biological processes, this no longer becomes the case. Our world is becoming less natural and more articial. Design is becoming more pormininet, we are possibly eroding the very thing that makes us human , our mortality, our imperfection, our biological interconnectedness to time, our irrationality, our feeling, our unexplainable. As ew begin to explain all things away we fail to recognize what those unexplainable things have done for us….. ever.'
	},
];
// --- END OF NEW POSTS ---


// Hardcoded posts - these are your base posts that never get lost
// Updated with projects from Rhea Madhogarhia's CV
const hardcodedPosts = [
	// Your new thesis posts are added first so they show up at the top
	...thesisDumpPosts,
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
 * @param {Omit<Post, 'id'>} postData
 * @returns {Promise<Object>}
 */
export async function createPost(postData) {
	try {
		// Generate a unique ID (higher than hardcoded posts)
		const existingPosts = await loadPosts();
		// Ensure all IDs are numbers before comparing
		const maxId = Math.max(...existingPosts.map((/** @type {Post} */ p) => Number(p.id)));
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
		research: '#3498db',
		thesis: '#8e44ad' // Added thesis color
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