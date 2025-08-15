# Rhea's Personal Website

A fun, eclectic personal website built with SvelteKit featuring a desktop-like interface with folder navigation, project display, and an admin panel for content management.

## 🎯 Features

- **Desktop-like Interface**: Folder icons, project windows, and desktop navigation
- **Git-Based Content Management**: Admin panel that automatically commits posts to Git
- **Never Lose Posts**: All posts are stored in Git and version controlled
- **Responsive Design**: Works on desktop and mobile
- **Search & Filter**: Find posts by title, category, or date
- **Zoom & Pan**: Interactive desktop experience
- **Cross-Device Sync**: Posts available on all devices via Git

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**: Navigate to `http://localhost:5178`

## 📝 Content Management

### Creating Posts

1. **Go to Admin Panel**: `http://localhost:5178/admin`
2. **Enter Code**: `rad2024`
3. **Fill Form**: Title, description, content, type, image URL, and date
4. **Submit**: Post is automatically committed to Git and appears on your site

### How It Works

- **Admin Panel**: Creates posts via web interface
- **Auto-Git Commit**: Each post is saved as a JSON file and committed to Git
- **File Storage**: Posts stored in `src/data/posts/` directory
- **Version Control**: Full Git history of all your posts
- **Deployment**: Just `git push` to update your live site

### Post Types

- **Writing**: Blog posts, articles, tutorials
- **Music**: Audio recordings, covers, compositions
- **Comedy**: Stand-up, sketches, humorous content
- **Art**: Digital art, paintings, creative projects
- **Programming**: Code projects, technical content

## 🛠️ Development

### Project Structure

```
src/
├── components/          # Reusable UI components
├── lib/                # Utility functions and stores
├── routes/             # SvelteKit pages and API endpoints
│   ├── admin/          # Admin panel for content management
│   ├── api/posts/      # Git-based post API
│   └── posts/[id]/     # Individual post pages
└── data/posts/         # Git-tracked post files
```

### Key Files

- `src/routes/+page.svelte` - Homepage with desktop interface
- `src/routes/admin/+page.svelte` - Admin panel for creating posts
- `src/routes/api/posts/+server.js` - API for Git-based post management
- `src/lib/posts.js` - Post loading and management utilities

## 🚀 Deployment

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Deploy to your hosting platform**:
   - Vercel: `vercel --prod`
   - Netlify: `netlify deploy --prod`
   - GitHub Pages: Push to main branch

3. **Posts are automatically included** in your deployment since they're part of your Git repository.

## 💡 Tips

- **Backup**: Your posts are automatically backed up in Git
- **Version Control**: See the history of all your posts with `git log`
- **Collaboration**: Share your repository to let others contribute posts
- **Customization**: Modify the admin panel to add new post types or fields

## 🎨 Customization

### Adding New Post Types

1. Edit `src/lib/categories.js` to add new categories
2. Update the admin form in `src/routes/admin/+page.svelte`
3. Add corresponding styling and icons

### Styling

- Main styles are in `src/routes/+page.svelte`
- Component styles are co-located with their components
- Uses CSS custom properties for easy theming

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

