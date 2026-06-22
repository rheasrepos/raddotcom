<script>
    import PageLayout from '../../components/PageLayout.svelte';
    const resumePdfUrl = '/resume.pdf';
</script>

<PageLayout title="Resume - Rhea Madhogarhia">
    <section class="resume-section">
        <div class="resume-header">
            <h1 class="page-title">Resume</h1>
            <a href={resumePdfUrl} class="download-btn" download="Rhea Madhogarhia CV 2026.pdf">
                Download PDF
            </a>
        </div>

        <div class="pdf-container card">
            <iframe
                src={resumePdfUrl}
                title="Rhea Madhogarhia CV"
                width="100%"
                height="100%"
                style="border: none;"
            ></iframe>
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
        padding: 0;
        margin-bottom: 20px;
    }

    .pdf-container {
        width: 100%;
        height: 80vh;
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
            height: 70vh;
        }
    }
</style>
