# Posts Data Directory

This directory contains JSON files for each blog post. Each file should be named with a unique ID (timestamp) and contain the post data in JSON format.

## File Structure

Each post file should follow this structure:

```json
{
  "id": 1703123456789,
  "title": "Your Post Title",
  "description": "Brief description of the post",
  "type": "writing",
  "date": "2024-01-15",
  "image": "https://picsum.photos/300/200?random=123",
  "content": "Full content of your blog post..."
}
```

## Post Types

- `writing` - Blog posts, articles, poetry
- `programming` - Technical tutorials, code examples
- `music` - Music covers, compositions
- `comedy` - Stand-up, sketches, humor
- `art` - Digital art, paintings, creative work

## Adding New Posts

1. Use the Admin Panel at `/admin` to create a new post
2. Copy the generated JSON from the success message
3. Create a new file in this directory with the filename: `{timestamp}.json`
4. Paste the JSON content into the file
5. Import and add the post to your projects array in the main pages

## Example

File: `1703123456789.json`
```json
{
  "id": 1703123456789,
  "title": "My New Blog Post",
  "description": "This is a sample blog post about web development",
  "type": "writing",
  "date": "2024-01-15",
  "image": "https://picsum.photos/300/200?random=123",
  "content": "This is the full content of my blog post..."
}
``` 