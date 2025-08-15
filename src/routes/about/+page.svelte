<script>
	import PageLayout from '../../components/PageLayout.svelte';
	
	// Sample about data - easy to customize
	let aboutData = {
		name: "Rhea Madhogarhia",
		title: "Creative Developer & Content Creator",
		bio: "I'm a passionate developer who loves creating meaningful digital experiences. When I'm not coding, you'll find me writing, making music, or exploring new creative outlets.",
		
		skills: [
			"JavaScript/TypeScript",
			"React & Svelte",
			"Node.js & Python",
			"UI/UX Design",
			"Content Creation",
			"Music Production"
		],
		
		interests: [
			{
				title: "Writing",
				description: "Sharing thoughts and stories",
				icon: "",
				color: "#ff6b6b"
			},
			{
				title: "Programming",
				description: "Building cool things with code",
				icon: "",
				color: "#4ecdc4"
			},
			{
				title: "Music",
				description: "Creating melodies and beats",
				icon: "",
				color: "#45b7d1"
			},
			{
				title: "Comedy",
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

<PageLayout title="About - Rhea Madhogarhia">
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

	<!-- Skills Section -->
	<section class="skills-section">
		<div class="skills-card card">
			<h3 class="section-title">Skills & Technologies</h3>
			<div class="skills-grid">
				{#each aboutData.skills as skill}
					<div class="skill-item">
						<span class="skill-name">{skill}</span>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Interests Section -->
	<section class="interests-section">
		<div class="interests-card card">
			<h3 class="section-title">What I Love</h3>
			<div class="interests-grid">
				{#each aboutData.interests as interest}
					<div class="interest-item" style="border-left-color: {interest.color};">
						<h4 class="interest-title">{interest.title}</h4>
						<p class="interest-description">{interest.description}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Values Section -->
	<section class="values-section">
		<div class="values-card card">
			<h3 class="section-title">What Drives Me</h3>
			<div class="values-grid">
				{#each aboutData.values as value}
					<div class="value-item">
						<span class="value-text">{value}</span>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Fun Facts Section -->
	<section class="facts-section">
		<div class="facts-card card">
			<h3 class="section-title">Fun Facts</h3>
			<div class="facts-grid">
				{#each aboutData.funFacts as fact}
					<div class="fact-item">
						<span class="fact-text">{fact}</span>
					</div>
				{/each}
			</div>
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
</PageLayout>

<style>
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

	.hero-text {
		text-align: left;
	}

	.hero-title {
		font-size: 3rem;
		font-weight: bold;
		color: #000000;
		margin-bottom: 10px;
		line-height: 1.2;
	}

	.hero-subtitle {
		font-size: 1.5rem;
		color: #666666;
		margin-bottom: 20px;
		font-weight: normal;
	}

	.hero-bio {
		font-size: 1.1rem;
		line-height: 1.6;
		color: #333333;
		margin-bottom: 0;
	}

	.hero-image {
		display: flex;
		justify-content: center;
		align-items: center;
	}

	.profile-placeholder {
		width: 200px;
		height: 200px;
		background: #f0f0f0;
		border: 2px solid #000000;
		display: flex;
		align-items: center;
		justify-content: center;
		color: #666666;
		font-size: 1rem;
	}

	/* Card Styles */
	.card {
		background: rgba(255, 255, 255, 0.9);
		border: 1px solid #000000;
		padding: 30px;
		margin-bottom: 20px;
	}

	.section-title {
		font-size: 2rem;
		font-weight: bold;
		color: #000000;
		margin-bottom: 30px;
		text-align: center;
	}

	/* Skills Section */
	.skills-section {
		margin-bottom: 60px;
	}

	.skills-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 15px;
	}

	.skill-item {
		background: #f8f9fa;
		border: 1px solid #000000;
		padding: 15px;
		text-align: center;
		transition: all 0.3s ease;
	}

	.skill-item:hover {
		background: #e9ecef;
		transform: translateY(-2px);
	}

	.skill-name {
		font-size: 1rem;
		font-weight: 500;
		color: #000000;
	}

	/* Interests Section */
	.interests-section {
		margin-bottom: 60px;
	}

	.interests-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 20px;
	}

	.interest-item {
		border-left: 4px solid;
		padding: 20px;
		background: #f8f9fa;
		border: 1px solid #000000;
		border-left-width: 4px;
		transition: all 0.3s ease;
	}

	.interest-item:hover {
		background: #e9ecef;
		transform: translateX(5px);
	}

	.interest-title {
		font-size: 1.2rem;
		font-weight: bold;
		color: #000000;
		margin-bottom: 10px;
	}

	.interest-description {
		font-size: 1rem;
		color: #666666;
		line-height: 1.5;
		margin: 0;
	}

	/* Values Section */
	.values-section {
		margin-bottom: 60px;
	}

	.values-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 15px;
	}

	.value-item {
		background: #f8f9fa;
		border: 1px solid #000000;
		padding: 20px;
		text-align: center;
		transition: all 0.3s ease;
	}

	.value-item:hover {
		background: #e9ecef;
		transform: scale(1.02);
	}

	.value-text {
		font-size: 1.1rem;
		font-weight: 500;
		color: #000000;
	}

	/* Facts Section */
	.facts-section {
		margin-bottom: 60px;
	}

	.facts-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 15px;
	}

	.fact-item {
		background: #f8f9fa;
		border: 1px solid #000000;
		padding: 20px;
		text-align: center;
		transition: all 0.3s ease;
	}

	.fact-item:hover {
		background: #e9ecef;
		transform: rotate(1deg);
	}

	.fact-text {
		font-size: 1rem;
		color: #000000;
		line-height: 1.5;
	}

	/* Contact Section */
	.contact-section {
		margin-bottom: 40px;
	}

	.contact-message {
		font-size: 1.1rem;
		line-height: 1.6;
		color: #333333;
		margin-bottom: 30px;
		text-align: center;
	}

	.contact-btn {
		display: inline-block;
		background: #000000;
		color: #ffffff;
		padding: 15px 30px;
		text-decoration: none;
		font-size: 1.1rem;
		font-weight: 500;
		border: 1px solid #000000;
		transition: all 0.3s ease;
		text-align: center;
	}

	.contact-btn:hover {
		background: #ffffff;
		color: #000000;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.hero-content {
			grid-template-columns: 1fr;
			gap: 30px;
		}

		.hero-title {
			font-size: 2.5rem;
		}

		.hero-subtitle {
			font-size: 1.3rem;
		}

		.skills-grid {
			grid-template-columns: 1fr;
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