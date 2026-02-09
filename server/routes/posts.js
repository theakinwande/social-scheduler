import { Router } from 'express';
import { postQueries } from '../db/database.js';

const router = Router();

// Get all posts
router.get('/', (req, res) => {
  try {
    const posts = postQueries.getAll.all();
    res.json(posts.map(parsePost));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get upcoming scheduled posts
router.get('/upcoming', (req, res) => {
  try {
    const posts = postQueries.getUpcoming.all();
    res.json(posts.map(parsePost));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single post
router.get('/:id', (req, res) => {
  try {
    const post = postQueries.getById.get(req.params.id);
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }
    res.json(parsePost(post));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new post
router.post('/', (req, res) => {
  try {
    const { content, mediaUrls, scheduledAt, status = 'scheduled' } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content is required' });
    }

    if (content.length > 280) {
      return res.status(400).json({ error: 'Content exceeds 280 characters' });
    }

    if (!scheduledAt) {
      return res.status(400).json({ error: 'Scheduled time is required' });
    }

    const mediaUrlsJson = mediaUrls ? JSON.stringify(mediaUrls) : null;
    const result = postQueries.create.run(content, mediaUrlsJson, scheduledAt, status);

    const newPost = postQueries.getById.get(result.lastInsertRowid);
    res.status(201).json(parsePost(newPost));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update post
router.put('/:id', (req, res) => {
  try {
    const { content, mediaUrls, scheduledAt, status } = req.body;
    const post = postQueries.getById.get(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    if (post.status === 'posted') {
      return res.status(400).json({ error: 'Cannot edit posted tweets' });
    }

    if (content && content.length > 280) {
      return res.status(400).json({ error: 'Content exceeds 280 characters' });
    }

    const mediaUrlsJson = mediaUrls ? JSON.stringify(mediaUrls) : post.media_urls;
    postQueries.update.run(
      content || post.content,
      mediaUrlsJson,
      scheduledAt || post.scheduled_at,
      status || post.status,
      req.params.id
    );

    const updatedPost = postQueries.getById.get(req.params.id);
    res.json(parsePost(updatedPost));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete post
router.delete('/:id', (req, res) => {
  try {
    const post = postQueries.getById.get(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    postQueries.delete.run(req.params.id);
    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Helper to parse post data
function parsePost(post) {
  return {
    ...post,
    media_urls: post.media_urls ? JSON.parse(post.media_urls) : []
  };
}

export default router;
