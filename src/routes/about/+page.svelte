<script>
	import Navigation from '../../components/Navigation.svelte';
	import DesktopNavigation from '../../components/DesktopNavigation.svelte';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	
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
	
	// Sample about data - easy to customize
	let aboutData = {
		name: "Your Name",
		title: "Creative Developer & Content Creator",
		bio: "I'm a passionate creative professional who loves exploring the intersection of technology and art. When I'm not coding, you'll find me writing, making music, creating digital art, or performing stand-up comedy. I believe in the power of storytelling and the magic of human connection through creative expression.",
		
		interests: [
			{
				title: "Web Development",
				description: "Building beautiful, functional websites and web applications",
				icon: "",
				color: "#45b7d1"
			},
			{
				title: "Creative Writing",
				description: "Crafting stories that connect and inspire",
				icon: "",
				color: "#4ecdc4"
			},
			{
				title: "Music Production",
				description: "Creating melodies that move the soul",
				icon: "",
				color: "#96ceb4"
			},
			{
				title: "Digital Art",
				description: "Visual storytelling through digital mediums",
				icon: "",
				color: "#ff9ff3"
			},
			{
				title: "Stand-up Comedy",
				description: "Finding humor in everyday life",
				icon: "",
				color: "#feca57"
			},
			{
				title: "Photography",
				description: "Capturing moments that tell stories",
				icon: "",
				color: "#ff6b6b"
			}
		],
		
		values: [
			"Creativity in everything I do",
			"Continuous learning and growth",
			"Authentic human connection",
			"Quality over quantity",
			"Empathy and understanding",
			"Joy and playfulness"
		],
		
		funFacts: [
			"I can play 5 different musical instruments",
			"My favorite color changes daily",
			"I've written over 100 blog posts",
			"I once performed stand-up in front of 200 people",
			"I'm learning to paint with my non-dominant hand",
			"I collect vintage typewriters"
		],
		
		socialLinks: [
			{ platform: "GitHub", url: "https://github.com/yourusername", icon: "" },
			{ platform: "LinkedIn", url: "https://linkedin.com/in/yourusername", icon: "" },
			{ platform: "Twitter", url: "https://twitter.com/yourusername", icon: "" },
			{ platform: "Instagram", url: "https://instagram.com/yourusername", icon: "" },
			{ platform: "YouTube", url: "https://youtube.com/@yourusername", icon: "" }
		],
		
		contact: {
			email: "your.email@example.com",
			message: "I love connecting with fellow creatives! Whether you want to collaborate on a project, discuss ideas, or just say hello, I'd love to hear from you."
		}
	};
</script>

<svelte:head>
	<title>About - Your Name</title>
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
		<!-- Hero Section -->
		<section class="hero-section">
			<div class="hero-content">
				<div class="hero-text">
					<h1 class="hero-title">Hello, I'm {aboutData.name}</h1>
					<h2 class="hero-subtitle">{aboutData.title}</h2>
					<p class="hero-bio">{aboutData.bio}</p>
				</div>
				<div class="hero-image">
					<div class="profile-placeholder">
						<p>Your Photo Here</p>
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

		<!-- Interests Section -->
		<section class="interests-section">
			<h3 class="section-title">What I Love to Do</h3>
			<div class="interests-grid">
				{#each aboutData.interests as interest}
					<div class="interest-card" style="--interest-color: {interest.color}">
						<h4 class="interest-title">{interest.title}</h4>
						<p class="interest-description">{interest.description}</p>
					</div>
				{/each}
			</div>
		</section>

		<!-- Values Section -->
		<section class="values-section">
			<h3 class="section-title">My Values</h3>
			<div class="values-grid">
				{#each aboutData.values as value}
					<div class="value-item">
						<span class="value-text">{value}</span>
					</div>
				{/each}
			</div>
		</section>

		<!-- Fun Facts Section -->
		<section class="fun-facts-section">
			<h3 class="section-title">Fun Facts About Me</h3>
			<div class="facts-grid">
				{#each aboutData.funFacts as fact}
					<div class="fact-card">
						<p class="fact-text">{fact}</p>
					</div>
				{/each}
			</div>
		</section>

		<!-- Social Links Section -->
		<section class="social-section">
			<h3 class="section-title">Let's Connect</h3>
			<div class="social-links">
				{#each aboutData.socialLinks as social}
					<a href={social.url} class="social-link" target="_blank" rel="noopener noreferrer">
						<span class="social-platform">{social.platform}</span>
					</a>
				{/each}
			</div>
		</section>

		<!-- Contact Section -->
		<section class="contact-section">
			<div class="contact-card card">
				<h3 class="section-title">Get In Touch</h3>
				<p class="contact-message">{aboutData.contact.message}</p>
				<a href="mailto:{aboutData.contact.email}" class="contact-btn btn">
					Send me an email
				</a>
			</div>
		</section>
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

	.about-page {
		min-height: 100vh;
		padding: 20px 0;
	}

	.card {
		background: rgba(255, 255, 255, 0.9);
		border: 1px solid #000000;
		padding: 30px;
		margin-bottom: 20px;
	}

	/* Hero Section */
	.hero-section {
		margin-bottom: 60px;
	}

	.hero-content {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 40px;
		align-items: center;
	}

	.hero-title {
		font-size: 3rem;
		font-weight: bold;
		color: #000000;
		margin-bottom: 15px;
		line-height: 1.2;
	}

	.hero-subtitle {
		font-size: 1.4rem;
		color: #636e72;
		margin-bottom: 20px;
		font-weight: 500;
	}

	.hero-bio {
		font-size: 1.1rem;
		line-height: 1.7;
		color: #2d3436;
	}

	.hero-image {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.profile-placeholder {
		width: 250px;
		height: 250px;
		background: rgba(255, 255, 255, 0.8);
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		border: 3px solid #000000;
	}



	.profile-placeholder p {
		color: #636e72;
		font-size: 0.9rem;
		text-align: center;
	}

	/* Section Styles */
	.section-title {
		font-size: 2rem;
		font-weight: bold;
		text-align: center;
		color: #2d3436;
		margin-bottom: 40px;
		position: relative;
	}

	.section-title::after {
		content: '';
		position: absolute;
		bottom: -10px;
		left: 50%;
		transform: translateX(-50%);
		width: 60px;
		height: 3px;
		background: #000000;
		border-radius: 2px;
	}

	/* Interests Section */
	.interests-section {
		margin-bottom: 60px;
	}

	.interests-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 30px;
	}

	.interest-card {
		background: rgba(255, 255, 255, 0.9);
		padding: 30px;
		text-align: center;
		transition: all 0.3s ease;
		border: 2px solid transparent;
	}

	.interest-card:hover {
		border-color: var(--interest-color);
	}



	.interest-title {
		font-size: 1.3rem;
		font-weight: bold;
		color: #2d3436;
		margin-bottom: 15px;
	}

	.interest-description {
		color: #636e72;
		line-height: 1.6;
	}

	/* Values Section */
	.values-section {
		margin-bottom: 60px;
	}

	.values-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 20px;
	}

	.value-item {
		display: flex;
		align-items: center;
		gap: 15px;
		padding: 20px;
		background: rgba(255, 255, 255, 0.8);
		border: 1px solid #000000;
		transition: all 0.3s ease;
	}

	.value-item:hover {
		background: rgba(255, 255, 255, 1);
	}



	.value-text {
		font-size: 1.1rem;
		color: #2d3436;
		font-weight: 500;
	}

	/* Fun Facts Section */
	.fun-facts-section {
		margin-bottom: 60px;
	}

	.facts-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 20px;
	}

	.fact-card {
		display: flex;
		align-items: center;
		gap: 15px;
		padding: 20px;
		background: rgba(255, 255, 255, 0.8);
		border: 1px solid #000000;
		transition: all 0.3s ease;
	}

	.fact-card:hover {
		background: rgba(255, 255, 255, 1);
	}



	.fact-text {
		color: #2d3436;
		font-size: 1rem;
		line-height: 1.5;
	}

	/* Social Section */
	.social-section {
		margin-bottom: 60px;
	}

	.social-links {
		display: flex;
		justify-content: center;
		flex-wrap: wrap;
		gap: 20px;
	}

	.social-link {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 15px 25px;
		background: rgba(255, 255, 255, 0.9);
		text-decoration: none;
		color: #2d3436;
		font-weight: 600;
		border: 1px solid #000000;
		transition: all 0.3s ease;
	}

	.social-link:hover {
		background: #000000;
		color: white;
	}



	/* Contact Section */
	.contact-section {
		margin-bottom: 40px;
	}

	.contact-card {
		text-align: center;
		padding: 40px;
		max-width: 600px;
		margin: 0 auto;
	}

	.contact-message {
		font-size: 1.1rem;
		line-height: 1.7;
		color: #2d3436;
		margin-bottom: 30px;
	}

	.contact-btn {
		display: inline-flex;
		align-items: center;
		gap: 10px;
		font-size: 1.1rem;
		padding: 15px 30px;
	}





	/* Responsive Design */
	@media (max-width: 768px) {
		.hero-content {
			grid-template-columns: 1fr;
			text-align: center;
			gap: 30px;
		}

		.hero-title {
			font-size: 2.5rem;
		}

		.hero-subtitle {
			font-size: 1.2rem;
		}

		.profile-placeholder {
			width: 200px;
			height: 200px;
		}

		.interests-grid {
			grid-template-columns: 1fr;
		}

		.values-grid {
			grid-template-columns: 1fr;
		}

		.facts-grid {
			grid-template-columns: 1fr;
		}

		.social-links {
			flex-direction: column;
			align-items: center;
		}

		.social-link {
			width: 100%;
			max-width: 250px;
			justify-content: center;
		}
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

</style> 