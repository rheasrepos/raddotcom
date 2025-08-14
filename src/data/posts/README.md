# Posts Directory

This directory contains all blog posts created through the admin panel. Each post is stored as a separate JSON file and automatically committed to Git.

## How It Works

1. **Admin Panel**: When you create a post through `/admin`, it's saved as a JSON file here
2. **Git Integration**: The file is automatically added and committed to your repository
3. **Permanent Storage**: Posts survive browser clearing, computer restarts, etc.
4. **Version Control**: You can see the history of all your posts in Git

## File Structure

Each post is saved as: `{id}-{sanitized-title}.json`

Example: `1734123456789-my-awesome-blog-post.json`

## File Format

```json
{
  "id": 1734123456789,
  "title": "My Awesome Blog Post",
  "description": "A brief description of the post",
  "type": "writing",
  "date": "2025-08-14",
  "image": "https://picsum.photos/300/200?random=123",
  "content": "The full content of your blog post..."
}
```

## Benefits

- ✅ **Permanent**: Posts are saved as actual files
- ✅ **Versioned**: Git tracks all changes
- ✅ **Backup**: Your posts are backed up with your code
- ✅ **Portable**: Easy to migrate or share
- ✅ **Collaborative**: Others can contribute if you want

## Manual Management

You can also manually add/edit posts by:
1. Creating JSON files in this directory
2. Following the format above
3. Committing them to Git

## Fallback System

If Git operations fail, posts are temporarily stored in localStorage until you can fix the Git configuration. 