<script>
    import PageLayout from '../../components/PageLayout.svelte';
  
    // About / Bio
    const aboutText = `
  I’m a fourth year student pursuing a B.S. in Computer Science and a B.A. in Cognitive Science at the University of Chicago, graduating 2026. 
  I am seeking a full-time position in software engineering, machine learning engineering, or computational cognitive neuro research. 
  I am an eager learner with a passion for research and interdisciplinary application of my education into industry settings. 
  My Cognitive Science background allows me to inform responsible development practices, focus on robust design docs, and integrate ethical, human-centered thinking into technical projects. 
  I keep the big picture in focus and advocate for dialogue and responsible decision-making in collaborative work.
  `;
  
    const skills = {
      languages: ["Java", "Python", "Bash", "Batch", "JSON", "HTML", "CSS", "JavaScript", "Go", "C", "SQL"],
      frameworks: ["React", "Grafana"],
      tools: ["MySQL", "BigQuery", "Cursor", "HuggingFace", "Prompt Engineering"],
      programmingSkills: [
        "Algorithm theory & data structures",
        "Backend development",
        "UI design",
        "Machine learning (NLP, Bayesian Optimization, Randomized & Grid Search, model fine-tuning, experiment design)",
        "OOP",
        "Mobile app development",
        "Web development",
        "Data analysis"
      ],
      gitDevPractices: [
        "Branching & pull requests",
        "Communication & collaboration",
        "Technical documentation",
        "Code reviews",
        "Design documents",
        "Merge conflict resolution",
        "Agile practices",
        "Writing sustainable code",
        "Peer-review process"
      ]
    };
  
    // Portfolio Items
    let portfolioItems = [
      // Reddit Intern
      {
        name: "Machine Learning Engineering Intern - Reddit",
        type: "Professional",
        period: "May 2025 – Aug 2025",
        description: [
          "Enhanced Reddit’s search infrastructure via First Pass Ranker (FPR) in Go and Python.",
          "Used Bayesian Optimization to tune boosting algorithms improving search relevance.",
          "Managed end-to-end project: design docs, implementation, experiments, and deployment."
        ],
        tech: ["Go", "Python", "Bayesian Optimization"],
        links: [{ label: "Reddit", url: "https://www.redditinc.com" }]
      },
      {
        name: "Summer 2024 AI/Software Engineering Intern - CharacTour",
        type: "Professional",
        period: "May 2024 – Aug 2024",
        description: [
          "Applied BERT regression to uncover relationships between media properties and user personality.",
          "Built predictive models and integrated NLTK pipelines for text preprocessing."
        ],
        tech: ["Python", "BERT", "MLP", "Elastic Net", "NLTK"],
        links: [{ label: "CharacTour", url: "https://www.charactour.com" }]
      },
      {
        name: "Research Assistant - CAB Lab, University of Chicago",
        type: "Research",
        period: "May 2024 – Present",
        description: [
          "Studying onset of insight moments using fMRI, ML, and NLP.",
          "Preprocessing large datasets, ML-assisted transcription, and sentiment analysis."
        ]
      },
      {
        name: "Research Assistant - Data Cognition Lab, University of Chicago",
        type: "Research",
        period: "May 2024 – Jan 2025",
        description: [
          "Built a web platform for studying complexity and risk aversion with data visualizations.",
          "Developed interactive Vega-Lite visualizations for hypothesis testing."
        ],
        tech: ["Svelte", "Vega-Lite", "JavaScript", "CSS"]
      },
      {
        name: "Co-Creator & Co-Host - Finders, Keepers (WHPK 88.5FM Chicago)",
        type: "Creative",
        period: "Dec 2023 – Present",
        description: [
          "Weekly interview-style radio show exploring music and culture.",
          "Managed content creation, guest outreach, and episode archiving on YouTube and WHPK."
        ],
        links: [
          { label: "Listen Live", url: "https://www.whpk.org" },
          { label: "YouTube Archive", url: "https://www.youtube.com/playlist?list=PLf3EpC2O4d30LgWtIL77xZMWupDfTQf1a" }
        ]
      },
      {
        name: "Machine Learning & Data Intern - Blue Fever",
        type: "Professional",
        period: "May 2023 – Sep 2023",
        description: [
          "Developed automated customer reply bot using ChatGPT prompts, Python, SQL (BigQuery).",
          "Collaborated with leadership to define voice & branding and performed sentiment analysis."
        ],
        tech: ["Python", "SQL", "BigQuery", "Prompt Engineering"],
        links: [{ label: "Blue Fever", url: "https://www.bluefever.com" }]
      },
      {
        name: "Web Development & Product Design Intern - GumGum",
        type: "Technical Project",
        period: "Jul 2019 – Aug 2019",
        description: [
          "Redesigned interactive company website using JavaScript, HTML, CSS.",
          "Collaborated across teams to implement new features and improve communication."
        ],
        tech: ["JavaScript", "HTML", "CSS"]
      },
      // NLP Class Project
      {
        name: "Analyzing Linguistic Differences Between Spoken and Written Text Using BERT",
        type: "Technical Project",
        period: "CS 257 Final Project",
        description: [
          "Classified text as spoken or written using BERT and baseline linear regression, achieving 98% accuracy with BERT.",
          "Performed interpretability analysis with SHAP and POS tagging to identify key linguistic features.",
          "Analyzed misclassifications to explore the influence of formality and domain on classification."
        ],
        tech: ["Python", "BERT", "SHAP", "NLP"],
        links: [
          { label: "Kaggle Notebook", url: "https://www.kaggle.com/code/spuli2002/nlpfin/notebook" },
          { label: "GitHub Code", url: "https://github.com/rheasrepos/nlpfinal/tree/final_presentation" },
          { label: "Class Wiki", url: "https://github.com/minalee-research/cs257-students/wiki/Analyzing-the-Linguistic-Differences-Between-Spoken-and-Written-Text-Using-BERT#analyzing-the-linguistic-differences-between-spoken-and-written-text-using-bert" }
        ]
      },
      // This Website as Technical Project
      {
        name: "Personal Portfolio Website",
        type: "Technical Project",
        period: "2025",
        description: [
          "Developed personal portfolio website using Svelte, HTML, CSS, and JS.",
          "Implemented dynamic project filtering and responsive grid layout."
        ],
        tech: ["Svelte", "JavaScript", "HTML", "CSS"],
        links: [{ label: "Live Site", url: "/" }]
      }
    ];
  
    let filterTypes = ["All", "Professional", "Research", "Creative", "Technical Project"];
    let selectedFilter = "All";
  
    $: filteredItems = selectedFilter === "All" 
      ? portfolioItems 
      : portfolioItems.filter(item => item.type === selectedFilter);
  </script>
  
  <PageLayout title="Rhea Madhogarhia - Portfolio">
    <!-- Header -->
    <section class="header-section">
      <h1>Rhea Madhogarhia</h1>
      <p>She/Her</p>
      <p>Computer Science & Cognitive Science @ The University of Chicago</p>
      <p>Email: rheamad@uchicago.edu | Phone: +1 (818) 624-0626</p>
    </section>
  
    <!-- About -->
    <section class="about-section">
      <h2>About Me</h2>
      <p>{aboutText}</p>
    </section>
  
    <!-- Skills -->
    <section class="skills-section">
      <h2>Skills & Tools</h2>
      <div class="skills-group">
        <strong>Languages:</strong> {skills.languages.join(", ")}
      </div>
      <div class="skills-group">
        <strong>Frameworks:</strong> {skills.frameworks.join(", ")}
      </div>
      <div class="skills-group">
        <strong>Tools:</strong> {skills.tools.join(", ")}
      </div>
      <div class="skills-group">
        <strong>Programming Skills:</strong>
        <ul>{#each skills.programmingSkills as skill}<li>{skill}</li>{/each}</ul>
      </div>
      <div class="skills-group">
        <strong>Git & Development Practices:</strong>
        <ul>{#each skills.gitDevPractices as practice}<li>{practice}</li>{/each}</ul>
      </div>
    </section>
  
    <!-- Portfolio Filters -->
    <section class="filter-section">
      {#each filterTypes as type}
        <button 
          class:selected={selectedFilter === type} 
          on:click={() => selectedFilter = type}>
          {type}
        </button>
      {/each}
    </section>
  
    <!-- Portfolio Grid -->
    <section class="portfolio-section">
      <div class="portfolio-grid">
        {#each filteredItems as item}
          <div class="portfolio-card {item.type}">
            <div class="portfolio-header">
              <h3>{item.name}</h3>
              {#if item.period}<span class="period">{item.period}</span>{/if}
            </div>
            <ul class="portfolio-description">
              {#each item.description as point}
                <li>{point}</li>
              {/each}
            </ul>
            {#if item.tech && item.tech.length}
              <div class="tech-tags">
                {#each item.tech as tech}<span class="tech-tag">{tech}</span>{/each}
              </div>
            {/if}
            {#if item.links && item.links.length}
              <div class="links">
                {#each item.links as link}
                  <a href={link.url} target="_blank">{link.label}</a>
                {/each}
              </div>
            {/if}
          </div>
        {/each}
      </div>
    </section>
  
    <!-- Resume Download -->
    <section class="download-section">
      <a href="/src/Rhea_Madhogarhia_Resume_2026.pdf" class="download-btn" target="_blank">Download Full Resume</a>
    </section>
  </PageLayout>
  
  <style>
    h1 { font-size: 2.5rem; margin-bottom: 0.2em; }
    h2 { margin-top: 1.5rem; }
    .header-section p { margin: 0.2em 0; color: #333; }
  
    .about-section, .skills-section { margin: 30px 0; }
  
    .skills-group { margin-bottom: 15px; }
    .skills-group ul { padding-left: 20px; margin: 5px 0; }
  
    .filter-section { margin: 20px 0; text-align: center; }
    .filter-section button { background: #fff; border: 1px solid #000; margin: 0 5px; padding: 6px 14px; cursor: pointer; transition: all 0.2s ease; }
    .filter-section button:hover { background: #000; color: #fff; }
    .filter-section button.selected { background: #000; color: #fff; }
  
    .portfolio-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px,1fr)); gap: 20px; margin: 40px 0; }
    .portfolio-card { border: 1px solid #000; padding: 20px; background: #f8f9fa; transition: all 0.3s ease; }
    .portfolio-card:hover { background: #e9ecef; transform: translateY(-2px); }
    .portfolio-card h3 { margin-bottom: 10px; }
    .portfolio-description { padding-left: 20px; margin-bottom: 10px; }
    .tech-tags { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 10px; }
    .tech-tag { border: 1px solid #000; padding: 4px 8px; font-size: 0.8rem; }
    .links a { margin-right: 10px; text-decoration: none; color: #000; border: 1px solid #000; padding: 4px 8px; }
    .links a:hover { background: #000; color: #fff; }
    .download-btn { display: inline-block; margin: 20px 0; padding: 10px 20px; background: #000; color: #fff; text-decoration: none; border: 1px solid #000; transition: all 0.3s ease; }
    .download-btn:hover { background: #fff; color: #000; }
    .period { font-size: 0.9rem; color: #666; }
  </style>