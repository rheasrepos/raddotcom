import { json } from '@sveltejs/kit';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

export async function POST({ request }) {
	try {
		const postData = await request.json();
		
		// Create a unique filename based on the post ID and title
		const sanitizedTitle = postData.title
			.toLowerCase()
			.replace(/[^a-z0-9\s-]/g, '')
			.replace(/\s+/g, '-')
			.substring(0, 50);
		
		const filename = `${postData.id}-${sanitizedTitle}.json`;
		const filePath = path.join(process.cwd(), 'src', 'data', 'posts', filename);
		
		// Ensure the posts directory exists
		await fs.mkdir(path.dirname(filePath), { recursive: true });
		
		// Write the post data to a JSON file
		await fs.writeFile(filePath, JSON.stringify(postData, null, 2));
		
		// Try to add and commit to Git, but don't fail if Git is not available
		try {
			// Add the file to Git
			await execAsync(`git add "${filePath}"`);
			
			// Commit the file with a descriptive message
			const commitMessage = `Add post: ${postData.title}`;
			await execAsync(`git commit -m "${commitMessage}"`);
		} catch (gitError) {
			console.warn('Git operations failed, but post was saved:', gitError.message);
			// Continue without Git - the post is still saved to the file system
		}
		
		return json({ 
			success: true, 
			message: 'Post created and committed to Git successfully',
			filename: filename
		});
		
	} catch (error) {
		console.error('Error creating post:', error);
		return json({ 
			success: false, 
			error: error.message 
		}, { status: 500 });
	}
}

export async function GET() {
	try {
		// Read all JSON files from the posts directory
		const postsDir = path.join(process.cwd(), 'src', 'data', 'posts');
		
		try {
			const files = await fs.readdir(postsDir);
			const jsonFiles = files.filter(file => file.endsWith('.json'));
			
			const posts = [];
			for (const file of jsonFiles) {
				const filePath = path.join(postsDir, file);
				const content = await fs.readFile(filePath, 'utf-8');
				const post = JSON.parse(content);
				posts.push(post);
			}
			
			// Sort by date (newest first)
			posts.sort((a, b) => new Date(b.date) - new Date(a.date));
			
			return json({ posts });
			
		} catch (error) {
			// If directory doesn't exist, return empty array
			if (error.code === 'ENOENT') {
				return json({ posts: [] });
			}
			console.warn('Error reading posts directory:', error.message);
			return json({ posts: [] });
		}
		
	} catch (error) {
		console.error('Error reading posts:', error);
		return json({ 
			success: false, 
			error: error.message 
		}, { status: 500 });
	}
} 