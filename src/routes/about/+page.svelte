<script>
	import Navigation from '../../components/Navigation.svelte';
	
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

<div class="about-page">
	<Navigation />
	
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
			</div>
		</section>

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
</div>

<style>
	.about-page {
		min-height: 100vh;
		padding: 20px 0;
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
</style> 