<script>
    import PageLayout from '../../components/PageLayout.svelte';
  
    // IMPORTANT: Make sure you have placed your CV PDF in the `static`
    // folder of your SvelteKit project and named it `Rhea_Madhogarhia_CV_2026.pdf`
    const resumePdfUrl = '/Users/rheamadhogarhia/Desktop/GitHub/raddotcom/static/Rhea_Madhogarhia_Resume_2026.pdf';
  </script>
  
  <PageLayout title="Resume - Rhea Madhogarhia">
    <section class="resume-section">
      <div class="resume-header">
        <h1 class="page-title">Resume</h1>
        <a href={resumePdfUrl} class="download-btn" download="Rhea_Madhogarhia_CV_2026.pdf">
          Download PDF
        </a>
      </div>
  
      <div class="pdf-container card">
        <embed
          src={resumePdfUrl}
          type="application/pdf"
          width="100%"
          height="100%"
        />
        <div class="fallback">
          <p>Your browser doesn't support embedded PDFs.</p>
          <a href={resumePdfUrl} class="download-btn-fallback" download="Rhea_Madhogarhia_CV_2026.pdf">
            Click here to download the PDF
          </a>
        </div>
      </div>
    </section>
  </PageLayout>
  
  <style>
    .resume-section {
      padding: 2rem 0;
    }
  
    .resume-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
  
    .page-title {
      font-size: 2.5rem;
      font-weight: bold;
      color: #000000;
    }
  
    .download-btn {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      background: #000000;
      color: #ffffff;
      text-decoration: none;
      border: 1px solid #000000;
      font-weight: bold;
      transition: all 0.3s ease;
    }
  
    .download-btn:hover {
      background: #ffffff;
      color: #000000;
    }
  
    .card {
      background: rgba(255, 255, 255, 0.9);
      border: 1px solid #000000;
      padding: 0; /* Remove padding for the embed */
      margin-bottom: 20px;
    }
  
    .pdf-container {
      width: 100%;
      height: 100vh; /* Full viewport height */
      max-height: 1200px;
      position: relative;
    }
  
    .pdf-container embed {
      border: none;
    }
  
    .fallback {
      display: none; /* Hide by default */
      padding: 2rem;
      text-align: center;
    }
  
    .pdf-container embed + .fallback {
      display: block; /* Show fallback if embed fails */
    }
  
    .download-btn-fallback {
      display: inline-block;
      padding: 0.75rem 1.5rem;
      background: #4ecdc4;
      color: #ffffff;
      text-decoration: none;
      border: 1px solid #4ecdc4;
      font-weight: bold;
      margin-top: 1rem;
      transition: all 0.3s ease;
    }
  
    .download-btn-fallback:hover {
      background: #45b7d1;
    }
  
    @media (max-width: 768px) {
      .resume-header {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }
  
      .page-title {
        font-size: 2rem;
      }
  
      .pdf-container {
        height: 80vh; /* Adjust height for mobile */
      }
    }
  </style>