<script>
	import PageLayout from '../../components/PageLayout.svelte';
	
	// Sample resume data - easy to customize
	let resumeData = {
		name: "Rhea Madhogarhia",
		title: "Creative Developer & Content Creator",
		email: "rhea@example.com",
		phone: "+1 (555) 123-4567",
		location: "San Francisco, CA",
		website: "rad.com",
		
		summary: "Passionate developer with 5+ years of experience creating engaging digital experiences. Skilled in full-stack development, UI/UX design, and content creation. Love combining technical skills with creative storytelling.",
		
		skills: {
			technical: [
				"JavaScript (ES6+)", "TypeScript", "React", "Svelte", "Node.js", 
				"Python", "HTML5/CSS3", "Git", "AWS", "Docker", "PostgreSQL", "MongoDB"
			],
			creative: [
				"UI/UX Design", "Content Creation", "Video Editing", "Music Production",
				"Creative Writing", "Digital Art", "Photography"
			],
			soft: [
				"Project Management", "Team Leadership", "Public Speaking", 
				"Problem Solving", "Creative Thinking", "Collaboration"
			]
		},
		
		experience: [
			{
				title: "Senior Frontend Developer",
				company: "TechCorp Inc.",
				location: "San Francisco, CA",
				period: "2022 - Present",
				achievements: [
					"Led development of 3 major web applications used by 100K+ users",
					"Mentored 5 junior developers and improved team productivity by 40%",
					"Implemented new CI/CD pipeline reducing deployment time by 60%",
					"Designed and built reusable component library used across 10+ projects"
				]
			},
			{
				title: "Full Stack Developer",
				company: "StartupXYZ",
				location: "Remote",
				period: "2020 - 2022",
				achievements: [
					"Built complete e-commerce platform from scratch using React and Node.js",
					"Optimized database queries improving page load times by 50%",
					"Integrated payment systems and inventory management",
					"Collaborated with design team to implement responsive UI/UX"
				]
			},
			{
				title: "Junior Developer",
				company: "Digital Agency ABC",
				location: "New York, NY",
				period: "2019 - 2020",
				achievements: [
					"Developed 15+ client websites using modern web technologies",
					"Worked with clients to understand requirements and deliver solutions",
					"Participated in code reviews and improved code quality standards",
					"Learned agile development methodologies and best practices"
				]
			}
		],
		
		education: [
			{
				degree: "Bachelor of Science in Computer Science",
				school: "University of Technology",
				location: "San Francisco, CA",
				period: "2015 - 2019",
				gpa: "3.8/4.0",
				relevant: "Data Structures, Algorithms, Web Development, Database Systems"
			}
		],
		
		projects: [
			{
				name: "Personal Portfolio Website",
				description: "Built this website using Svelte and modern web technologies",
				tech: ["Svelte", "JavaScript", "CSS3", "Vite"],
				link: "https://rad.com"
			},
			{
				name: "E-commerce Platform",
				description: "Full-stack e-commerce solution with payment integration",
				tech: ["React", "Node.js", "MongoDB", "Stripe"],
				link: "https://github.com/yourusername/ecommerce"
			},
			{
				name: "Task Management App",
				description: "Collaborative task management tool with real-time updates",
				tech: ["Vue.js", "Firebase", "Vuex", "Vue Router"],
				link: "https://github.com/yourusername/taskapp"
			}
		],
		
		certifications: [
			"AWS Certified Developer Associate",
			"Google Cloud Professional Developer",
			"Certified Scrum Master (CSM)",
			"React Developer Certification"
		],
		
		languages: [
			{ language: "English", proficiency: "Native" },
			{ language: "Spanish", proficiency: "Conversational" },
			{ language: "French", proficiency: "Basic" }
		],
		
		interests: [
			"Open Source Contribution",
			"Tech Blogging",
			"Music Production",
			"Creative Writing",
			"Photography",
			"Travel"
		]
	};
</script>

<PageLayout title="Resume - Rhea Madhogarhia">
	<!-- Header Section -->
	<section class="header-section">
		<div class="header-content">
			<div class="header-left">
				<h1 class="resume-name">{resumeData.name}</h1>
				<h2 class="resume-title">{resumeData.title}</h2>
			</div>
			<div class="header-right">
				<div class="contact-info">
					<p><strong>Email:</strong> {resumeData.email}</p>
					<p><strong>Phone:</strong> {resumeData.phone}</p>
					<p><strong>Location:</strong> {resumeData.location}</p>
					<p><strong>Website:</strong> {resumeData.website}</p>
				</div>
			</div>
		</div>
		<p class="resume-summary">{resumeData.summary}</p>
	</section>

	<!-- Skills Section -->
	<section class="skills-section">
		<div class="skills-card card">
			<h3 class="section-title">Skills</h3>
			<div class="skills-grid">
				<div class="skill-category">
					<h4 class="category-title">Technical Skills</h4>
					<div class="skill-tags">
						{#each resumeData.skills.technical as skill}
							<span class="skill-tag">{skill}</span>
						{/each}
					</div>
				</div>
				<div class="skill-category">
					<h4 class="category-title">Creative Skills</h4>
					<div class="skill-tags">
						{#each resumeData.skills.creative as skill}
							<span class="skill-tag">{skill}</span>
						{/each}
					</div>
				</div>
				<div class="skill-category">
					<h4 class="category-title">Soft Skills</h4>
					<div class="skill-tags">
						{#each resumeData.skills.soft as skill}
							<span class="skill-tag">{skill}</span>
						{/each}
					</div>
				</div>
			</div>
		</div>
	</section>

	<!-- Experience Section -->
	<section class="experience-section">
		<div class="experience-card card">
			<h3 class="section-title">Professional Experience</h3>
			<div class="experience-list">
				{#each resumeData.experience as job}
					<div class="job-item">
						<div class="job-header">
							<div class="job-title-info">
								<h4 class="job-title">{job.title}</h4>
								<p class="job-company">{job.company}</p>
							</div>
							<div class="job-meta">
								<p class="job-location">{job.location}</p>
								<p class="job-period">{job.period}</p>
							</div>
						</div>
						<ul class="job-achievements">
							{#each job.achievements as achievement}
								<li class="achievement-item">{achievement}</li>
							{/each}
						</ul>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Education Section -->
	<section class="education-section">
		<div class="education-card card">
			<h3 class="section-title">Education</h3>
			<div class="education-list">
				{#each resumeData.education as edu}
					<div class="education-item">
						<div class="education-header">
							<div class="education-info">
								<h4 class="education-degree">{edu.degree}</h4>
								<p class="education-school">{edu.school}</p>
								<p class="education-location">{edu.location}</p>
							</div>
							<div class="education-meta">
								<p class="education-period">{edu.period}</p>
								<p class="education-gpa">GPA: {edu.gpa}</p>
							</div>
						</div>
						<p class="education-relevant"><strong>Relevant Coursework:</strong> {edu.relevant}</p>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Projects Section -->
	<section class="projects-section">
		<div class="projects-card card">
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
						<a href={project.link} target="_blank" rel="noopener noreferrer" class="project-link">
							View Project
						</a>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Additional Info Section -->
	<section class="additional-section">
		<div class="additional-grid">
			<!-- Certifications -->
			<div class="additional-card card">
				<h4 class="additional-title">Certifications</h4>
				<ul class="certification-list">
					{#each resumeData.certifications as cert}
						<li class="certification-item">{cert}</li>
					{/each}
				</ul>
			</div>

			<!-- Languages -->
			<div class="additional-card card">
				<h4 class="additional-title">Languages</h4>
				<div class="language-list">
					{#each resumeData.languages as lang}
						<div class="language-item">
							<span class="language-name">{lang.language}</span>
							<span class="language-level">{lang.proficiency}</span>
						</div>
					{/each}
				</div>
			</div>

			<!-- Interests -->
			<div class="additional-card card">
				<h4 class="additional-title">Interests</h4>
				<div class="interests-list">
					{#each resumeData.interests as interest}
						<span class="interest-tag">{interest}</span>
					{/each}
				</div>
			</div>
		</div>
	</section>
</PageLayout>

<style>
	/* Header Section */
	.header-section {
		margin-bottom: 40px;
	}

	.header-content {
		display: grid;
		grid-template-columns: 2fr 1fr;
		gap: 40px;
		margin-bottom: 20px;
	}

	.header-left {
		text-align: left;
	}

	.resume-name {
		font-size: 2.5rem;
		font-weight: bold;
		color: #000000;
		margin-bottom: 10px;
		line-height: 1.2;
	}

	.resume-title {
		font-size: 1.3rem;
		color: #666666;
		margin-bottom: 0;
		font-weight: normal;
	}

	.header-right {
		display: flex;
		align-items: center;
	}

	.contact-info p {
		margin: 5px 0;
		font-size: 0.9rem;
		color: #333333;
	}

	.resume-summary {
		font-size: 1.1rem;
		line-height: 1.6;
		color: #333333;
		margin: 0;
		padding: 20px;
		background: #f8f9fa;
		border: 1px solid #000000;
	}

	/* Card Styles */
	.card {
		background: rgba(255, 255, 255, 0.9);
		border: 1px solid #000000;
		padding: 30px;
		margin-bottom: 20px;
	}

	.section-title {
		font-size: 1.8rem;
		font-weight: bold;
		color: #000000;
		margin-bottom: 25px;
		text-align: center;
		border-bottom: 2px solid #000000;
		padding-bottom: 10px;
	}

	/* Skills Section */
	.skills-section {
		margin-bottom: 40px;
	}

	.skills-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 30px;
	}

	.skill-category {
		text-align: center;
	}

	.category-title {
		font-size: 1.2rem;
		font-weight: bold;
		color: #000000;
		margin-bottom: 15px;
	}

	.skill-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		justify-content: center;
	}

	.skill-tag {
		background: #f8f9fa;
		border: 1px solid #000000;
		padding: 6px 12px;
		font-size: 0.9rem;
		color: #000000;
		transition: all 0.3s ease;
	}

	.skill-tag:hover {
		background: #e9ecef;
		transform: translateY(-1px);
	}

	/* Experience Section */
	.experience-section {
		margin-bottom: 40px;
	}

	.experience-list {
		display: flex;
		flex-direction: column;
		gap: 25px;
	}

	.job-item {
		border-left: 3px solid #000000;
		padding-left: 20px;
	}

	.job-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 15px;
	}

	.job-title {
		font-size: 1.3rem;
		font-weight: bold;
		color: #000000;
		margin-bottom: 5px;
	}

	.job-company {
		font-size: 1.1rem;
		color: #666666;
		margin-bottom: 0;
	}

	.job-meta {
		text-align: right;
	}

	.job-location, .job-period {
		font-size: 0.9rem;
		color: #666666;
		margin: 2px 0;
	}

	.job-achievements {
		margin: 0;
		padding-left: 20px;
	}

	.achievement-item {
		margin-bottom: 8px;
		color: #333333;
		line-height: 1.5;
	}

	/* Education Section */
	.education-section {
		margin-bottom: 40px;
	}

	.education-list {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}

	.education-item {
		border-left: 3px solid #000000;
		padding-left: 20px;
	}

	.education-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 10px;
	}

	.education-degree {
		font-size: 1.2rem;
		font-weight: bold;
		color: #000000;
		margin-bottom: 5px;
	}

	.education-school, .education-location {
		font-size: 1rem;
		color: #666666;
		margin-bottom: 2px;
	}

	.education-meta {
		text-align: right;
	}

	.education-period, .education-gpa {
		font-size: 0.9rem;
		color: #666666;
		margin: 2px 0;
	}

	.education-relevant {
		font-size: 0.9rem;
		color: #333333;
		margin: 0;
	}

	/* Projects Section */
	.projects-section {
		margin-bottom: 40px;
	}

	.projects-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 20px;
	}

	.project-item {
		background: #f8f9fa;
		border: 1px solid #000000;
		padding: 20px;
		transition: all 0.3s ease;
	}

	.project-item:hover {
		background: #e9ecef;
		transform: translateY(-2px);
	}

	.project-name {
		font-size: 1.2rem;
		font-weight: bold;
		color: #000000;
		margin-bottom: 10px;
	}

	.project-description {
		font-size: 0.9rem;
		color: #666666;
		line-height: 1.5;
		margin-bottom: 15px;
	}

	.project-tech {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		margin-bottom: 15px;
	}

	.tech-tag {
		background: #ffffff;
		border: 1px solid #000000;
		padding: 4px 8px;
		font-size: 0.8rem;
		color: #000000;
	}

	.project-link {
		display: inline-block;
		background: #000000;
		color: #ffffff;
		padding: 8px 16px;
		text-decoration: none;
		font-size: 0.9rem;
		border: 1px solid #000000;
		transition: all 0.3s ease;
	}

	.project-link:hover {
		background: #ffffff;
		color: #000000;
	}

	/* Additional Info Section */
	.additional-section {
		margin-bottom: 40px;
	}

	.additional-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
		gap: 20px;
	}

	.additional-card {
		text-align: center;
	}

	.additional-title {
		font-size: 1.2rem;
		font-weight: bold;
		color: #000000;
		margin-bottom: 15px;
	}

	.certification-list {
		list-style: none;
		padding: 0;
		margin: 0;
	}

	.certification-item {
		padding: 8px 0;
		border-bottom: 1px solid #e9ecef;
		color: #333333;
	}

	.certification-item:last-child {
		border-bottom: none;
	}

	.language-list {
		display: flex;
		flex-direction: column;
		gap: 10px;
	}

	.language-item {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 8px 0;
		border-bottom: 1px solid #e9ecef;
	}

	.language-item:last-child {
		border-bottom: none;
	}

	.language-name {
		font-weight: 500;
		color: #000000;
	}

	.language-level {
		font-size: 0.9rem;
		color: #666666;
	}

	.interests-list {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		justify-content: center;
	}

	.interest-tag {
		background: #f8f9fa;
		border: 1px solid #000000;
		padding: 6px 12px;
		font-size: 0.9rem;
		color: #000000;
		transition: all 0.3s ease;
	}

	.interest-tag:hover {
		background: #e9ecef;
		transform: scale(1.05);
	}

	/* Responsive Design */
	@media (max-width: 768px) {
		.header-content {
			grid-template-columns: 1fr;
			gap: 20px;
			text-align: center;
		}

		.resume-name {
			font-size: 2rem;
		}

		.job-header, .education-header {
			flex-direction: column;
			align-items: flex-start;
			gap: 10px;
		}

		.job-meta, .education-meta {
			text-align: left;
		}

		.skills-grid {
			grid-template-columns: 1fr;
		}

		.projects-grid {
			grid-template-columns: 1fr;
		}

		.additional-grid {
			grid-template-columns: 1fr;
		}
	}
</style> 