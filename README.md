# Personal Website - Creative Portfolio & Blog

A fun and eclectic personal website built with Svelte, featuring a multimedia blog with filterable project panes, a professional resume, and an engaging about page. Perfect for showcasing your creative work across different mediums.

## ✨ Features

- **Multimedia Blog**: Filter projects by type (writing, programming, music, comedy, art)
- **Interactive Project Panes**: Click to view detailed project information
- **Responsive Design**: Works beautifully on all devices
- **Zen/80s Eclectic Aesthetic**: Calming orange/yellow background with colorful star animations
- **Easy Customization**: Simple structure for easy editing
- **Professional Resume Page**: Clean, organized layout
- **Personal About Page**: Showcase your interests, values, and personality
- **Modern Tech Stack**: Built with Svelte for optimal performance

## 🚀 Quick Start

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. **Clone or download the project**
   ```bash
   git clone <your-repo-url>
   cd personal-website
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🎨 Customization Guide

### 1. Personal Information
Update your personal details in these files:
- `src/routes/+page.svelte` - Homepage projects and title
- `src/routes/resume/+page.svelte` - Resume information
- `src/routes/about/+page.svelte` - About page content
- `src/components/Navigation.svelte` - Navigation name

### 2. Projects
Add your own projects by editing the `projects` array in `src/routes/+page.svelte`:

```javascript
let projects = [
  {
    id: 1,
    title: "Your Project Title",
    description: "Project description",
    type: "writing", // or "programming", "music", "comedy", "art"
    date: "2024-01-15",
    image: "your-image-url.jpg",
    content: "Detailed project content..."
  }
  // Add more projects...
];
```

### 3. Colors and Styling
The website uses a consistent color palette defined in `src/app.css`:
- Primary: `#ff6b6b` (coral)
- Secondary: `#4ecdc4` (teal)
- Accent: `#45b7d1` (blue)
- Success: `#96ceb4` (green)
- Warning: `#feca57` (yellow)
- Purple: `#ff9ff3` (pink)

### 4. Images
- Replace placeholder images with your own
- Update the `image` field in project data
- Add your profile photo in the About page
- Replace `static/favicon.png` with your own favicon

### 5. Social Links
Update social media links in `src/routes/about/+page.svelte`:

```javascript
socialLinks: [
  { platform: "GitHub", url: "https://github.com/yourusername", icon: "🐙" },
  { platform: "LinkedIn", url: "https://linkedin.com/in/yourusername", icon: "💼" },
  // Add more...
]
```

## 📦 Building for Production

### Build the project
```bash
npm run build
```

### Preview the build
```bash
npm run preview
```

## 🌐 Deployment

This website is configured for static hosting. You can deploy it to:

### Netlify
1. Connect your GitHub repository
2. Build command: `npm run build`
3. Publish directory: `build`

### Vercel
1. Import your GitHub repository
2. Framework preset: SvelteKit
3. Build command: `npm run build`

### GitHub Pages
1. Build the project: `npm run build`
2. Push the `build` folder to a `gh-pages` branch
3. Enable GitHub Pages in repository settings

### Any Static Host
The `build` folder contains all static files ready for deployment.

## 🛠️ Project Structure

```
src/
├── app.css              # Global styles
├── app.html             # HTML template
├── routes/
│   ├── +layout.svelte   # Main layout
│   ├── +page.svelte     # Homepage
│   ├── resume/
│   │   └── +page.svelte # Resume page
│   └── about/
│       └── +page.svelte # About page
└── components/
    ├── Navigation.svelte    # Navigation bar
    ├── FilterTabs.svelte    # Project filter tabs
    └── ProjectPane.svelte   # Individual project cards
```

## 🎯 Project Types

The website supports these project categories:
- **Writing**: Blog posts, articles, stories
- **Programming**: Code projects, technical content
- **Music**: Audio recordings, compositions
- **Comedy**: Stand-up, sketches, humorous content
- **Art**: Visual art, digital creations, photography

## 🔧 Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Type check the project

### Adding New Features
1. Create new components in `src/components/`
2. Add new routes in `src/routes/`
3. Update navigation in `src/components/Navigation.svelte`
4. Style consistently with existing design system

## 📱 Responsive Design

The website is fully responsive and optimized for:
- Desktop (1200px+)
- Tablet (768px - 1199px)
- Mobile (320px - 767px)

## 🎨 Design Philosophy

This website embraces a "zen/80s eclectic" aesthetic:
- **Calming colors**: Orange and yellow gradients
- **Playful elements**: Star animations, floating effects
- **Clean typography**: Arial font for readability
- **Glass morphism**: Translucent cards with backdrop blur
- **Smooth animations**: Subtle hover effects and transitions

## 🤝 Contributing

Feel free to fork this project and customize it for your own use. If you make improvements that could benefit others, consider submitting a pull request!

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- Built with [Svelte](https://svelte.dev/)
- Styled with modern CSS features
- Icons from emoji and Unicode symbols
- Placeholder images from [Picsum Photos](https://picsum.photos/)

---

**Happy creating! ✨**

