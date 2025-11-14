import { json } from '@sveltejs/kit';
import { exec } from 'child_process';
import { promisify } from 'node:util'; // <-- FIX: Changed to 'node:util'
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { dev } from '$app/environment'; // <-- FIX: Import dev environment

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

export async function GET() {
	try {
		// Read all post files from the data directory
		const { readdir, readFile } = await import('fs/promises');
		const { join } = await import('path');

		const postsDir = join(process.cwd(), 'src', 'data', 'posts');
		const files = await readdir(postsDir);

		const posts = [];
		for (const file of files) {
			if (file.endsWith('.json')) {
				const filePath = join(postsDir, file);
				const content = await readFile(filePath, 'utf-8');
				posts.push(JSON.parse(content));
			}
		}

		// Sort by date (newest first)
		posts.sort((a, b) => new Date(b.date) - new Date(a.date));

		return json(posts);
	} catch (error) {
		console.error('Error reading posts:', error);
		return json([]);
	}
}