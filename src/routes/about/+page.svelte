<script>
    import PageLayout from '../../components/PageLayout.svelte';
  
    const aboutText = `
    I’m a fourth year student pursuing a B.S. in Computer Science and a B.A. in Cognitive Science at the University of Chicago, graduating 2026. 
    I am seeking a full-time position in software engineering, machine learning engineering, or computational cognitive neuro research. 
    I am an eager learner with a passion for research and interdisciplinary application of my education into industry settings. 
    My Cognitive Science background allows me to inform responsible development practices, focus on robust design docs, and integrate ethical, human-centered thinking into technical projects. 
    I keep the big picture in focus and advocate for dialogue and responsible decision-making in collaborative work.
    `;
  </script>
  
  <PageLayout title="About - Rhea Madhogarhia">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <div class="hero-image">
          <div class="profile-placeholder">
            <p>Your Photo Here</p>
          </div>
        </div>
        <div class="hero-text">
          <h1>Hello, I'm Rhea Madhogarhia</h1>
          <p>{aboutText}</p>
        </div>
      </div>
    </section>
  </PageLayout>
  
  <style>
    .hero-section {
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 60px 0;
      padding: 0 20px;
    }
  
    .hero-content {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 60px;
      max-width: 1000px;
      flex-wrap: wrap;
      text-align: center;
    }
  
    .hero-image {
      flex: 0 0 200px;
    }
  
    .profile-placeholder {
      width: 200px;
      height: 200px;
      background: #f0f0f0;
      border: 2px solid #000;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #666;
      font-size: 1rem;
      border-radius: 50%;
    }
  
    .hero-text {
      flex: 1 1 400px;
    }
  
    .hero-text h1 {
      font-size: 2.5rem;
      margin-bottom: 20px;
    }
  
    .hero-text p {
      font-size: 1.2rem;
      line-height: 1.6;
    }
  
    @media (max-width: 768px) {
      .hero-content {
        flex-direction: column;
        gap: 30px;
      }
  
      .hero-text h1 {
        font-size: 2rem;
      }
  
      .hero-text p {
        font-size: 1.1rem;
      }
    }
  </style>
  