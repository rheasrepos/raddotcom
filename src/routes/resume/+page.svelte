<script>
	import Navigation from '../../components/Navigation.svelte';
	
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

<div class="resume-page">
	<Navigation />
	
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

			<!-- Projects -->
			<section class="resume-section">
				<h3 class="section-title">Projects</h3>
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

<style>
	.resume-page {
		min-height: 100vh;
		padding: 20px 0;
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

	/* Projects Styles */
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