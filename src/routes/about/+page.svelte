<script>
    import PageLayout from '../../components/PageLayout.svelte';
    import AIText from '../../components/AIText.svelte';

    const aboutText = `
    Hi, I'm Rhea — a fourth-year at the University of Chicago finishing a B.S. in Computer Science and a B.A. in Cognitive Science (2026). Most of my thinking circles one question: what's the difference between a mind and a model — is a computer a brain, or a brain a computer?
    That question shows up everywhere here. I write essays about AI, attention, and meaning; I do improv and sketch with Off-Off Campus; I sing alto in Voices in Your Head; and I co-host Finders Keepers on WHPK. I've also built machine-learning systems (most recently as an ML engineering intern at Reddit) and study cognition in the CAB Lab.
    This site is a desktop because I've always organized my world in folders — color-coded, inspect-element, a little obsessive. Click around: most folders are things I wrote, made, or sang.
    I'm currently looking for full-time work in software / ML engineering or computational cognitive research.
    `;

    const links = [
        {
            label: 'LinkedIn',
            url: 'https://www.linkedin.com/in/rhea-mad/',
            description: 'Work, experience, and professional updates',
            icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>`
        },
        {
            label: 'YouTube',
            url: 'https://youtube.com/@rheamad',
            description: 'Videos, comedy, and more',
            icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>`
        },
        {
            label: 'GitHub',
            url: 'https://github.com/rheasrepos',
            description: 'Code and projects',
            icon: `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>`
        },
        {
            label: 'CAB Lab',
            url: 'https://cablab.uchicago.edu',
            description: 'Cognition, Attention, and Brain Lab @ UChicago — where I do research',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="15" r="3"/><circle cx="18" cy="15" r="3"/><path d="M10.5 15H13.5"/><path d="M8.3 13.5A6 6 0 0 1 12 9a6 6 0 0 1 3.7 4.5"/></svg>`
        },
        {
            label: 'Voices in Your Head',
            url: 'https://www.instagram.com/uchicagovoices/',
            description: 'A cappella at UChicago — Instagram @uchicagovoices',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`
        },
        {
            label: 'Off-Off Campus',
            url: 'https://www.instagram.com/offoffcampus/',
            description: 'Improv & sketch comedy at UChicago — Instagram @offoffcampus',
            icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13a6 6 0 0 1-6 5 6 6 0 0 1-6-5h12Z"/><path d="M6 8.8A8.5 8.5 0 0 1 12 5a8.5 8.5 0 0 1 6 3.8"/></svg>`
        }
    ];
</script>

<PageLayout title="About - Rhea Madhogarhia">
    <!-- Hero Section -->
    <section class="hero-section">
        <div class="hero-content">
            <div class="hero-text">
                <h1>Hello, I'm Rhea Madhogarhia</h1>
                <p><AIText note="This bio was drafted with AI assistance, based on Rhea's own writing and notes.">{aboutText}</AIText></p>
            </div>
        </div>
    </section>

    <!-- Links Section -->
    <section class="links-section">
        <h2 class="links-title">Links</h2>
        <div class="links-grid">
            {#each links as link}
                <a href={link.url} target="_blank" rel="noopener noreferrer" class="link-card">
                    <div class="link-icon">
                        {@html link.icon}
                    </div>
                    <div class="link-info">
                        <span class="link-label">{link.label}</span>
                        <span class="link-description">{link.description}</span>
                    </div>
                    <div class="link-arrow">→</div>
                </a>
            {/each}
        </div>
    </section>
</PageLayout>

<style>
    .hero-section {
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 60px 0 40px 0;
        padding: 0 20px;
        border-bottom: 1px solid #000000;
        padding-bottom: 40px;
    }

    .hero-content {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 60px;
        max-width: 1000px;
        flex-wrap: wrap;
        text-align: left;
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

    /* Links Section */
    .links-section {
        max-width: 800px;
        margin: 40px auto;
        padding: 0 20px;
    }

    .links-title {
        font-size: 1.5rem;
        font-weight: bold;
        color: #000000;
        margin-bottom: 20px;
        font-family: Arial, sans-serif;
    }

    .links-grid {
        display: flex;
        flex-direction: column;
        gap: 0;
    }

    .link-card {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px 20px;
        border: 1px solid #000000;
        border-bottom: none;
        text-decoration: none;
        color: #000000;
        background: rgba(255, 255, 255, 0.85);
        transition: background 0.15s ease;
    }

    .link-card:last-child {
        border-bottom: 1px solid #000000;
    }

    .link-card:hover {
        background: #000000;
        color: #ffffff;
    }

    .link-icon {
        width: 28px;
        height: 28px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .link-icon :global(svg) {
        width: 100%;
        height: 100%;
    }

    .link-info {
        display: flex;
        flex-direction: column;
        gap: 2px;
        flex: 1;
    }

    .link-label {
        font-family: Arial, sans-serif;
        font-size: 0.95rem;
        font-weight: bold;
    }

    .link-description {
        font-family: Arial, sans-serif;
        font-size: 0.8rem;
        color: #666666;
    }

    .link-card:hover .link-description {
        color: rgba(255, 255, 255, 0.75);
    }

    .link-arrow {
        font-size: 1rem;
        flex-shrink: 0;
        transition: transform 0.15s ease;
    }

    .link-card:hover .link-arrow {
        transform: translateX(4px);
    }

    @media (max-width: 768px) {
        .hero-content {
            flex-direction: column;
            gap: 30px;
            text-align: center;
        }

        .hero-text h1 {
            font-size: 2rem;
        }

        .hero-text p {
            font-size: 1.1rem;
        }
    }
</style>
