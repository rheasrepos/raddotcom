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
	
	// Sample resume data - easy to customize
	let resumeData = {
		name: "Your Name",
		title: "Creative Developer & Content Creator",
		email: "your.email@example.com",
		phone: "+1 (555) 123-4567",
		location: "San Francisco, CA",
		website: "yourwebsite.com",
		
		summary: "Passionate creative professional with expertise in web development, content creation, and multimedia production. Combining technical skills with artistic vision to create engaging digital experiences.",
		
		skills: {
			technical: ["JavaScript", "React", "Svelte", "Node.js", "Python", "HTML/CSS", "Git", "AWS"],
			creative: ["Content Writing", "Digital Art", "Music Production", "Video Editing", "Photography"],
			soft: ["Project Management", "Team Collaboration", "Creative Problem Solving", "Communication"]
		},
		
		experience: [
			{
				title: "Senior Frontend Developer",
				company: "Tech Innovations Inc.",
				period: "2022 - Present",
				description: "Lead frontend development for web applications using React and Svelte. Collaborated with design and backend teams to deliver high-quality user experiences.",
				achievements: [
					"Reduced page load times by 40% through optimization",
					"Mentored 3 junior developers",
					"Implemented new CI/CD pipeline"
				]
			},
			{
				title: "Content Creator",
				company: "Creative Studio",
				period: "2020 - 2022",
				description: "Produced engaging content across multiple platforms including blog posts, videos, and social media content.",
				achievements: [
					"Grew audience by 200% in 18 months",
					"Created 50+ high-performing blog posts",
					"Managed brand partnerships"
				]
			},
			{
				title: "Junior Developer",
				company: "StartupXYZ",
				period: "2019 - 2020",
				description: "Full-stack development using modern web technologies. Contributed to product development and user experience improvements.",
				achievements: [
					"Built 3 major features from concept to deployment",
					"Improved user engagement by 25%",
					"Participated in agile development process"
				]
			}
		],
		
		education: [
			{
				degree: "Bachelor of Science in Computer Science",
				school: "University of Technology",
				period: "2015 - 2019",
				gpa: "3.8/4.0"
			},
			{
				degree: "Certificate in Digital Marketing",
				school: "Online Learning Platform",
				period: "2020",
				gpa: "N/A"
			}
		],
		
		projects: [
			{
				name: "Personal Website",
				description: "Built this website using Svelte and modern web technologies",
				tech: ["Svelte", "JavaScript", "CSS3"],
				link: "#"
			},
			{
				name: "E-commerce Platform",
				description: "Full-stack e-commerce solution with payment integration",
				tech: ["React", "Node.js", "MongoDB", "Stripe"],
				link: "#"
			},
			{
				name: "Music Production App",
				description: "Web-based music creation tool with real-time collaboration",
				tech: ["Web Audio API", "WebRTC", "React"],
				link: "#"
			}
		]
	};
</script>

<svelte:head>
	<title>Resume - Your Name</title>
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
		<div class="resume-container card">
			<!-- Header -->
			<header class="resume-header">
				<div class="header-main">
					<h1 class="name">{resumeData.name}</h1>
					<h2 class="title">{resumeData.title}</h2>
					<p class="summary">{resumeData.summary}</p>
				</div>
				<div class="contact-info">
					<div class="contact-item">
						<span class="icon">Email:</span>
						<span>{resumeData.email}</span>
					</div>
					<div class="contact-item">
						<span class="icon">Phone:</span>
						<span>{resumeData.phone}</span>
					</div>
					<div class="contact-item">
						<span class="icon">Location:</span>
						<span>{resumeData.location}</span>
					</div>
					<div class="contact-item">
						<span class="icon">Website:</span>
						<span>{resumeData.website}</span>
					</div>
				</div>
			</header>

			<!-- Skills -->
			<section class="resume-section">
				<h3 class="section-title">Skills</h3>
				<div class="skills-grid">
					<div class="skill-category">
						<h4>Technical</h4>
						<div class="skill-tags">
							{#each resumeData.skills.technical as skill}
								<span class="skill-tag technical">{skill}</span>
							{/each}
						</div>
					</div>
					<div class="skill-category">
						<h4>Creative</h4>
						<div class="skill-tags">
							{#each resumeData.skills.creative as skill}
								<span class="skill-tag creative">{skill}</span>
							{/each}
						</div>
					</div>
					<div class="skill-category">
						<h4>Soft Skills</h4>
						<div class="skill-tags">
							{#each resumeData.skills.soft as skill}
								<span class="skill-tag soft">{skill}</span>
							{/each}
						</div>
					</div>
				</div>
			</section>

			<!-- Experience -->
			<section class="resume-section">
				<h3 class="section-title">Experience</h3>
				<div class="experience-list">
					{#each resumeData.experience as job}
						<div class="experience-item">
							<div class="job-header">
								<h4 class="job-title">{job.title}</h4>
								<span class="job-period">{job.period}</span>
							</div>
							<div class="job-company">{job.company}</div>
							<p class="job-description">{job.description}</p>
							<ul class="job-achievements">
								{#each job.achievements as achievement}
									<li>{achievement}</li>
								{/each}
							</ul>
						</div>
					{/each}
				</div>
			</section>

			<!-- Education -->
			<section class="resume-section">
				<h3 class="section-title">Education</h3>
				<div class="education-list">
					{#each resumeData.education as edu}
						<div class="education-item">
							<div class="edu-header">
								<h4 class="edu-degree">{edu.degree}</h4>
								<span class="edu-period">{edu.period}</span>
							</div>
							<div class="edu-school">{edu.school}</div>
							{#if edu.gpa !== 'N/A'}
								<div class="edu-gpa">GPA: {edu.gpa}</div>
							{/if}
						</div>
					{/each}
				</div>
			</section>

			<!-- Rad Stuff -->
			<section class="resume-section">
				<h3 class="section-title">Rad Stuff</h3>
				<div class="projects-grid">
					{#each resumeData.projects as project}
						<div class="project-item">
							<h4 class="project-name">{project.name}</h4>
							<p class="project-description">{project.description}</p>
							<div class="project-tech">
								{#each project.tech as tech}
									<span class="tech-tag">{tech}</span>
								{/each}
							</div>
						</div>
					{/each}
				</div>
			</section>
		</div>
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

	.resume-page {
		min-height: 100vh;
		padding: 20px 0;
	}

	.card {
		background: rgba(255, 255, 255, 0.9);
		border: 1px solid #000000;
		padding: 30px;
		margin-bottom: 20px;
	}

	.resume-container {
		max-width: 900px;
		margin: 0 auto;
		padding: 40px;
	}

	/* Header Styles */
	.resume-header {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 40px;
		margin-bottom: 40px;
		padding-bottom: 30px;
		border-bottom: 2px solid #000000;
	}

	.name {
		font-size: 2.5rem;
		font-weight: bold;
		color: #000000;
		margin-bottom: 10px;
	}

	.title {
		font-size: 1.3rem;
		color: #636e72;
		margin-bottom: 15px;
		font-weight: 500;
	}

	.summary {
		line-height: 1.6;
		color: #2d3436;
	}

	.contact-info {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.contact-item {
		display: flex;
		align-items: center;
		gap: 10px;
		font-size: 0.95rem;
		color: #2d3436;
	}

	.icon {
		font-size: 1.1rem;
		width: 20px;
	}

	/* Section Styles */
	.resume-section {
		margin-bottom: 40px;
	}

	.section-title {
		font-size: 1.5rem;
		font-weight: bold;
		color: #000000;
		margin-bottom: 20px;
		padding-bottom: 10px;
		border-bottom: 2px solid #000000;
	}

	/* Skills Styles */
	.skills-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 30px;
	}

	.skill-category h4 {
		font-size: 1.1rem;
		color: #2d3436;
		margin-bottom: 15px;
		font-weight: 600;
	}

	.skill-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.skill-tag {
		padding: 6px 12px;
		font-size: 0.85rem;
		font-weight: 500;
	}

	.skill-tag.technical {
		background: rgba(69, 183, 209, 0.2);
		color: #45b7d1;
	}

	.skill-tag.creative {
		background: rgba(255, 159, 243, 0.2);
		color: #ff9ff3;
	}

	.skill-tag.soft {
		background: rgba(150, 206, 180, 0.2);
		color: #96ceb4;
	}

	/* Experience Styles */
	.experience-list {
		display: flex;
		flex-direction: column;
		gap: 30px;
	}

	.experience-item {
		padding: 20px;
		background: rgba(255, 255, 255, 0.5);
		border-left: 4px solid #000000;
	}

	.job-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 5px;
	}

	.job-title {
		font-size: 1.2rem;
		font-weight: bold;
		color: #2d3436;
		margin: 0;
	}

	.job-period {
		font-size: 0.9rem;
		color: #636e72;
		font-weight: 500;
	}

	.job-company {
		font-size: 1rem;
		color: #4ecdc4;
		font-weight: 600;
		margin-bottom: 10px;
	}

	.job-description {
		color: #2d3436;
		line-height: 1.6;
		margin-bottom: 15px;
	}

	.job-achievements {
		list-style: none;
		padding: 0;
	}

	.job-achievements li {
		position: relative;
		padding-left: 20px;
		margin-bottom: 8px;
		color: #636e72;
	}

	.job-achievements li::before {
		content: '•';
		position: absolute;
		left: 0;
		color: #000000;
		font-weight: bold;
	}

	/* Education Styles */
	.education-list {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.education-item {
		padding: 20px;
		background: rgba(255, 255, 255, 0.5);
		border-left: 4px solid #000000;
	}

	.edu-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 5px;
	}

	.edu-degree {
		font-size: 1.1rem;
		font-weight: bold;
		color: #2d3436;
		margin: 0;
	}

	.edu-period {
		font-size: 0.9rem;
		color: #636e72;
	}

	.edu-school {
		font-size: 1rem;
		color: #4ecdc4;
		font-weight: 600;
		margin-bottom: 5px;
	}

	.edu-gpa {
		font-size: 0.9rem;
		color: #636e72;
	}

	/* Rad Stuff Styles */
	.projects-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 20px;
	}

	.project-item {
		padding: 20px;
		background: rgba(255, 255, 255, 0.5);
		border-left: 4px solid #000000;
	}

	.project-name {
		font-size: 1.1rem;
		font-weight: bold;
		color: #2d3436;
		margin-bottom: 10px;
	}

	.project-description {
		color: #636e72;
		line-height: 1.5;
		margin-bottom: 15px;
	}

	.project-tech {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}

	.tech-tag {
		padding: 4px 10px;
		background: rgba(0, 0, 0, 0.1);
		color: #000000;
		font-size: 0.8rem;
		font-weight: 500;
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.resume-container {
			padding: 20px;
		}

		.resume-header {
			grid-template-columns: 1fr;
			gap: 20px;
		}

		.name {
			font-size: 2rem;
		}

		.job-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 5px;
		}

		.edu-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 5px;
		}

		.skills-grid {
			grid-template-columns: 1fr;
		}
	}
</style> 