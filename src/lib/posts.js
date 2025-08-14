// Utility functions for managing posts

/**
 * Load all posts from the data directory and merge with localStorage posts
 * This automatically includes any posts created through the admin panel
 */
export function loadPosts() {
	// Base hardcoded posts
	const basePosts = [
		{
			id: 1,
			title: "My First Blog Post",
			description: "A deep dive into web development and creativity, exploring the intersection of code and art. This post covers everything from basic HTML to advanced CSS animations.",
			type: "writing",
			date: "2024-01-15",
			image: "https://picsum.photos/300/200?random=1",
			content: "This is a comprehensive blog post about web development and the creative process. I explore how coding can be both technical and artistic, sharing insights from my journey as a developer. The post includes practical examples, code snippets, and personal reflections on the evolution of web technologies."
		},
		{
			id: 2,
			title: "React vs Svelte Comparison",
			description: "Technical analysis of modern frameworks with performance benchmarks and real-world examples",
			type: "programming",
			date: "2024-01-10",
			image: "https://picsum.photos/300/200?random=2",
			content: "A comprehensive comparison of React and Svelte frameworks, including performance benchmarks, developer experience analysis, and real-world use cases. This technical deep-dive explores the pros and cons of each framework, helping developers make informed decisions about their next project."
		},
		{
			id: 3,
			title: "Acoustic Guitar Cover",
			description: "Cover of 'Wonderwall' by Oasis with original arrangement and fingerpicking style",
			type: "music",
			date: "2024-01-05",
			image: "https://picsum.photos/300/200?random=3",
			content: "A beautiful acoustic cover of the classic Oasis song 'Wonderwall'. I've arranged it with my own fingerpicking style and added some personal touches to make it unique. The recording was done in my home studio with a vintage Martin guitar."
		},
		{
			id: 4,
			title: "Stand-up Comedy Set",
			description: "5-minute set about daily life observations, technology, and the absurdity of modern living",
			type: "comedy",
			date: "2024-01-01",
			image: "https://picsum.photos/300/200?random=4",
			content: "A hilarious 5-minute stand-up comedy set performed at the local comedy club. The material covers everything from smartphone addiction to the weirdness of social media algorithms. It's a lighthearted take on the quirks of modern life that had the audience laughing throughout."
		},
		{
			id: 5,
			title: "Digital Art Collection",
			description: "Abstract geometric patterns and colors inspired by mathematical principles and nature",
			type: "art",
			date: "2023-12-28",
			image: "https://picsum.photos/300/200?random=5",
			content: "A collection of digital art pieces exploring geometric patterns, mathematical principles, and natural forms. Each piece is created using digital tools and inspired by everything from fractals to architectural designs. The collection showcases the intersection of technology and artistic expression."
		},
		{
			id: 6,
			title: "JavaScript Tips & Tricks",
			description: "Advanced JavaScript techniques and best practices for modern web development",
			type: "programming",
			date: "2023-12-20",
			image: "https://picsum.photos/300/200?random=6",
			content: "Essential JavaScript tips and tricks that every developer should know. This comprehensive guide covers advanced concepts like closures, promises, async/await, and modern ES6+ features. Includes practical examples and real-world applications."
		},
		{
			id: 7,
			title: "Creative Writing Workshop",
			description: "Leading a workshop on creative writing techniques and storytelling fundamentals",
			type: "writing",
			date: "2023-12-15",
			image: "https://picsum.photos/300/200?random=7",
			content: "I led a creative writing workshop for aspiring authors, covering essential storytelling techniques, character development, and narrative structure. The workshop included interactive exercises and feedback sessions, helping participants develop their unique voice and style."
		},
		{
			id: 8,
			title: "Jazz Piano Improvisation",
			description: "Original jazz piano piece with complex chord progressions and melodic improvisation",
			type: "music",
			date: "2023-12-10",
			image: "https://picsum.photos/300/200?random=8",
			content: "An original jazz piano composition featuring complex chord progressions and melodic improvisation. The piece explores various jazz styles and incorporates elements of bebop, modal jazz, and contemporary jazz fusion. Recorded live in a studio session."
		},
		{
			id: 9,
			title: "Sketch Comedy Video",
			description: "Short comedy sketch about office life and workplace dynamics",
			type: "comedy",
			date: "2023-12-05",
			image: "https://picsum.photos/300/200?random=9",
			content: "A short comedy sketch about the absurdities of office life and workplace dynamics. The video features multiple characters and explores themes of corporate culture, team meetings, and the daily grind. Filmed and edited entirely by myself."
		},
		{
			id: 10,
			title: "Watercolor Landscape Series",
			description: "Collection of watercolor paintings inspired by local landscapes and natural scenery",
			type: "art",
			date: "2023-11-30",
			image: "https://picsum.photos/300/200?random=10",
			content: "A series of watercolor paintings inspired by local landscapes and natural scenery. Each piece captures the changing seasons and the beauty of the natural world. The collection explores different techniques and color palettes while maintaining a cohesive artistic vision."
		},
		{
			id: 11,
			title: "Web Development Tutorial",
			description: "Step-by-step tutorial on building a responsive website from scratch",
			type: "programming",
			date: "2023-11-25",
			image: "https://picsum.photos/300/200?random=11",
			content: "A comprehensive web development tutorial that guides beginners through building a responsive website from scratch. Covers HTML structure, CSS styling, JavaScript functionality, and responsive design principles. Includes downloadable code examples and resources."
		},
		{
			id: 12,
			title: "Poetry Collection",
			description: "Original poetry exploring themes of technology, nature, and human connection",
			type: "writing",
			date: "2023-11-20",
			image: "https://picsum.photos/300/200?random=12",
			content: "A collection of original poetry exploring themes of technology, nature, and human connection. The poems range from haikus to free verse, each offering a unique perspective on modern life and the intersection of the digital and natural worlds."
		},
		{
			id: 13,
			title: "Summer Coding Bootcamp",
			description: "Teaching web development fundamentals to high school students",
			type: "programming",
			date: "2025-08-25",
			image: "https://picsum.photos/300/200?random=13",
			content: "This summer, I had the incredible opportunity to teach web development fundamentals to a group of enthusiastic high school students. The bootcamp covered HTML, CSS, JavaScript, and basic web design principles. Watching these young minds grasp complex concepts and build their first websites was truly inspiring. Many students went from knowing nothing about coding to creating fully functional personal portfolios by the end of the program."
		},
		{
			id: 14,
			title: "Late Night Jazz Session",
			description: "Impromptu jazz performance at a local coffee shop",
			type: "music",
			date: "2025-08-20",
			image: "https://picsum.photos/300/200?random=14",
			content: "An unforgettable evening at the local coffee shop where I was invited to join an impromptu jazz session. The atmosphere was electric as we played late into the night, exploring classic jazz standards and original compositions. The intimate setting created a magical connection between the musicians and the audience, with everyone swaying to the rhythm of the music. It's moments like these that remind me why I love playing music."
		},
		{
			id: 15,
			title: "The Art of Procrastination",
			description: "A humorous take on productivity and time management",
			type: "comedy",
			date: "2025-08-15",
			image: "https://picsum.photos/300/200?random=15",
			content: "My latest comedy set explores the universal struggle of procrastination. From the art of 'productive procrastination' (cleaning your entire house instead of working) to the classic 'I'll start tomorrow' mentality, this material resonates with everyone who has ever stared at a blank screen or empty page. The audience was in stitches as I shared my personal experiences with deadline-induced creativity and the mysterious phenomenon of sudden motivation at 2 AM."
		},
		{
			id: 16,
			title: "Digital Art: AI Collaboration",
			description: "Exploring the intersection of human creativity and artificial intelligence",
			type: "art",
			date: "2025-08-10",
			image: "https://picsum.photos/300/200?random=16",
			content: "This project explores the fascinating intersection of human creativity and artificial intelligence. I collaborated with AI tools to create a series of digital artworks that blend traditional artistic techniques with cutting-edge technology. The process involved using AI to generate initial concepts, which I then refined and enhanced with my own artistic vision. The result is a collection that challenges our understanding of creativity and authorship in the digital age."
		},
		{
			id: 17,
			title: "The Future of Web Development",
			description: "Predictions and insights about the next decade of web technologies",
			type: "writing",
			date: "2025-08-05",
			image: "https://picsum.photos/300/200?random=17",
			content: "As we approach the mid-2020s, I've been reflecting on the rapid evolution of web development and what the future might hold. This article explores emerging trends like WebAssembly, the growing importance of performance optimization, and the rise of AI-assisted development tools. I also discuss the shifting landscape of frameworks and the increasing focus on accessibility and sustainability in web development. The pace of change in our field is both exciting and challenging."
		},
		{
			id: 18,
			title: "Acoustic Cover: 'Bohemian Rhapsody'",
			description: "A stripped-down acoustic version of the Queen classic",
			type: "music",
			date: "2025-08-01",
			image: "https://picsum.photos/300/200?random=18",
			content: "I've always been fascinated by how songs can be completely transformed when stripped down to their acoustic essence. This cover of Queen's 'Bohemian Rhapsody' reimagines the epic rock opera as an intimate acoustic piece. Using just guitar and vocals, I've tried to capture the emotional core of the song while maintaining its dramatic structure. The challenge was to convey the same intensity and range without the full orchestration, relying instead on dynamic playing and vocal expression."
		}
	];

	// Get admin-created posts from localStorage (if in browser) - temporary storage
	let adminPosts = [];
	if (typeof window !== 'undefined') {
		try {
			const storedPosts = localStorage.getItem('tempPosts');
			if (storedPosts) {
				adminPosts = JSON.parse(storedPosts);
			}
		} catch (error) {
			console.warn('Error loading admin posts from localStorage:', error);
		}
	}

	// Merge base posts with admin posts, ensuring no duplicate IDs
	const allPosts = [...basePosts];
	
	// Add localStorage posts (temporary)
	adminPosts.forEach(adminPost => {
		// Check if this admin post already exists
		const exists = allPosts.some(post => post.id === adminPost.id);
		if (!exists) {
			allPosts.push(adminPost);
		}
	});

	// Sort by date (newest first)
	return allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
}

/**
 * Get project color by type
 */
export function getProjectColor(type) {
	const colors = {
		writing: '#3498db',
		programming: '#2ecc71',
		music: '#e74c3c',
		comedy: '#f39c12',
		art: '#9b59b6'
	};
	return colors[type] || '#95a5a6';
}

/**
 * Format date for display
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
 */
export function filterProjects(projects, filter = 'all', startDate = null, endDate = null) {
	return projects.filter(project => {
		const typeMatch = filter === 'all' || project.type === filter;
		const dateMatch = !startDate || !endDate || (
			new Date(project.date) >= new Date(startDate) && 
			new Date(project.date) <= new Date(endDate)
		);
		return typeMatch && dateMatch;
	});
}

/**
 * Load Git-based posts from the API (client-side only)
 */
export async function loadGitPosts() {
	try {
		const response = await fetch('/api/posts');
		if (response.ok) {
			const data = await response.json();
			return data.posts || [];
		}
	} catch (error) {
		console.warn('Could not load Git posts:', error);
	}
	return [];
} 