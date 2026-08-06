import { json } from '@sveltejs/kit';
import { exec } from 'child_process';
import { promisify } from 'node:util';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { dev } from '$app/environment';
import matter from 'gray-matter';
import pdfManifest from '$lib/pdf-manifest.json';

// PDFs are named after their post's slug and auto-attached (single source of
// truth — no hand-typed pdf: line to drift). Keep this slugify IN SYNC with
// scripts/sync-pdfs.py.
const pdfSet = new Set(pdfManifest);
function slugify(s) {
	return s
		.toLowerCase()
		.replace(/['’"]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/-+/g, '-')
		.replace(/^-|-$/g, '');
}

// This tells SvelteKit that this API route is dynamic and should not be
// pre-rendered. This is especially important for routes with POST handlers.
export const prerender = false;

const execAsync = promisify(exec);

export async function POST({ request }) {
	// FIX: This POST handler should only work in development (locally)
	// Vercel has a read-only filesystem and cannot run git commands.
	if (!dev) {
		return json({
			success: false,
			message: 'Admin panel is only available in development mode.'
		}, { status: 403 }); // 403 Forbidden
	}

	try {
		const post = await request.json();

		// Ensure post has a proper ID
		if (!post.id || post.id === null) {
			post.id = Date.now();
		}

		// Generate a unique filename
		const timestamp = Date.now();
		const filename = `post-${timestamp}.json`;
		const postsDir = join(process.cwd(), 'src', 'data', 'posts');
		const filePath = join(postsDir, filename);

		// Ensure posts directory exists
		await mkdir(postsDir, { recursive: true });

		// Write post to file
		await writeFile(filePath, JSON.stringify(post, null, 2));

		// Git operations
		try {
			// Add the file to git
			await execAsync(`git add "${filePath}"`);

			// Commit the file
			const commitMessage = `Add post: ${post.title}`;
			await execAsync(`git commit -m "${commitMessage}"`);

			console.log(`Post "${post.title}" committed to Git successfully`);

			return json({
				success: true,
				message: 'Post created and committed to Git successfully',
				postId: post.id
			});
		} catch (gitError) {
			console.error('Git operation failed:', gitError);
			return json({
				success: false,
				message: 'Post created but Git commit failed. Please commit manually.',
				postId: post.id,
				filePath: filePath
			}, { status: 500 });
		}
	} catch (error) {
		console.error('Error creating post:', error);
		return json({
			success: false,
			message: 'Failed to create post'
		}, { status: 500 });
	}
}

// What KIND of writing is this? Derived from form tags / genre so the site
// can distinguish a term paper from a discussion post from a blog post.
function deriveForm(frontmatter) {
	// `form:` is now an explicit frontmatter field (forms are genre, not subject —
	// they live outside `tags:` so they never appear as topics in the graph).
	if (Array.isArray(frontmatter.form) && frontmatter.form.length) {
		const LABEL = {
			'discussion-post': 'discussion post', 'reading-response': 'reading response',
			'journal-critique': 'journal critique', 'personal-essay': 'personal essay',
			'think-piece': 'think piece', 'college-essays': 'college essay',
			'meeting-notes': 'meeting notes', 'project-planning': 'project planning',
			'personal-statement': 'personal statement', 'teaching-philosophy': 'teaching philosophy',
			'lab-research': 'lab research', 'research-paper': 'research paper',
			essay: 'paper', blog: 'blog post'
		};
		const f = String(frontmatter.form[0]);
		return LABEL[f] || f;
	}
	if (typeof frontmatter.form === 'string' && frontmatter.form) return frontmatter.form;

	const tags = (Array.isArray(frontmatter.tags) ? frontmatter.tags : []).map(String);
	const genre = String(frontmatter.genre || '').toLowerCase();
	const has = (t) => tags.some((x) => x === t || x.startsWith(t + '/'));
	if (has('discussion-post') || has('reading-response') || genre === 'discussion-post') return 'discussion post';
	if (has('journal-critique')) return 'journal critique';
	if (has('exam')) return 'exam essay';
	if (has('writing/blog') || genre === 'blog') return 'blog post';
	if (has('writing/opinion') || genre === 'opinion') return 'opinion';
	if (has('creative/comedy/sketch')) return 'sketch';
	if (has('script')) return 'script';
	if (has('creative/poetry')) return 'poems';
	if (has('creative/music/lyrics')) return 'lyrics';
	if (has('research') || has('thesis')) return 'research';
	if (has('essay')) return 'paper';
	return null;
}

// Content is loaded at BUILD time with import.meta.glob, not with fs at
// request time. On Vercel the serverless function only ships traced JS —
// loose files like src/vault/*.md don't exist on its filesystem, which is
// why runtime readdir() silently returned [] in production.
const vaultRaw = import.meta.glob('/src/vault/**/*.md', {
	eager: true,
	query: '?raw',
	import: 'default'
});
const jsonPosts = import.meta.glob('/src/data/posts/*.json', {
	eager: true,
	import: 'default'
});

export async function GET() {
	try {
		const posts = [];

		// 1. JSON posts from src/data/posts/ (admin-panel output)
		for (const post of Object.values(jsonPosts)) {
			posts.push(post);
		}

		// 2. Published Obsidian markdown notes from src/vault/
		for (const [path, raw] of Object.entries(vaultRaw)) {
			const file = path.split('/').pop();
			if (file === 'README.md') continue;
			// Skip iCloud/Obsidian sync-conflict copies ("Foo 2.md") — they'd
			// otherwise show up as duplicate posts.
			if (/ \d+\.md$/.test(file)) continue;
			// /src/vault/<top>/<sub>/file.md → subfolder "sub" (shown as a
			// folder inside the category folder on the desktop)
			const rel = path.replace('/src/vault/', '').split('/');
			const subfolder = rel.length >= 3 ? rel[rel.length - 2] : null;
			const { data: frontmatter, content: body } = matter(raw);
			// Only publish notes with published: true
			if (!frontmatter.published) continue;
			// Resolve the PDF ONCE (manual pdf: override, else auto-attach by
			// slug) so both `pdf` and `thumb` use the same value.
			const slug = slugify(file.replace('.md', ''));
			const resolvedPdf = frontmatter.pdf || (pdfSet.has(`${slug}.pdf`) ? `/docs/${slug}.pdf` : null);
			posts.push({
				id: `vault-${file.replace('.md', '')}`,
				title: frontmatter.title || file.replace('.md', ''),
				description: frontmatter.description || '',
				type: frontmatter.type || 'writing',
				// Real tagged date if present. Undated notes get a sentinel that
				// sorts them to the BOTTOM (not today's date, which used to make
				// them leapfrog the real latest post).
				date: frontmatter.date ? String(frontmatter.date) : '0001-01-01',
				undated: !frontmatter.date,
				content: body.trim(),
				// Support custom icon image per note
				iconImage: frontmatter.iconImage || null,
				// loose: true floats the note directly on the desktop
				loose: frontmatter.loose === true,
				// ai_title / ai_description mark AI-drafted text (dashed underline)
				aiTitle: frontmatter.ai_title === true || frontmatter.aiTitle === true,
				aiDescription: frontmatter.ai_description === true || frontmatter.aiDescription === true,
				// PDF auto-attached by slug (static/docs/<slug>.pdf); manual pdf: overrides.
				pdf: resolvedPdf,
				// tags power the /network graph cross-links between posts
				tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
				// form badge: paper | discussion post | blog post | …
				form: deriveForm(frontmatter),
				// vault subfolder (e.g. "media-aesthetics") for on-site folders
				subfolder,
				// link: external project URL — shows an "Open project ↗" action
				link: frontmatter.link || null,
				// video: a YouTube URL — the post embeds the player
				video: frontmatter.video || null,
				// youtube_playlist: a channel's uploads playlist — embeds as a
				// gallery/player cycling through every video
				youtubePlaylist: frontmatter.youtube_playlist || frontmatter.youtubePlaylist || null,
				// doi / paperUrl: publications link out to the real record
				doi: frontmatter.doi || null,
				// featured: pin this post to the top of the blog
				featured: frontmatter.featured === true,
				// image: cover scan; images: all sides/pages of the same artifact
				image: frontmatter.image || null,
				images: Array.isArray(frontmatter.images) ? frontmatter.images : (frontmatter.image ? [frontmatter.image] : []),
				// thumb: what the desktop icon should actually SHOW —
				// the video's still, the artwork itself, or the PDF's first page.
				thumb: (() => {
					if (frontmatter.iconImage) return frontmatter.iconImage;
					if (frontmatter.video) {
						const v = String(frontmatter.video).match(/(?:v=|youtu\.be\/|embed\/)([\w-]{6,})/);
						if (v) return `https://i.ytimg.com/vi/${v[1]}/hqdefault.jpg`;
					}
					if (frontmatter.image) return frontmatter.image;
					if (resolvedPdf) {
						return '/docs/covers/' + String(resolvedPdf).split('/').pop().replace(/\.pdf$/, '') + '.png';
					}
					return null;
				})()
			});
		}

		// Sort by date (newest first)
		posts.sort((a, b) => new Date(b.date) - new Date(a.date));

		return json(posts);
	} catch (error) {
		console.error('Error reading posts:', error);
		return json([]);
	}
}