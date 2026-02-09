import { Router } from 'express';
import { verifyCredentials, getRecentTweets, postTweet } from '../services/twitter.js';

const router = Router();

// Verify Twitter credentials
router.get('/verify', async (req, res) => {
  try {
    const result = await verifyCredentials();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get recent tweets
router.get('/recent', async (req, res) => {
  try {
    const count = parseInt(req.query.count) || 10;
    const result = await getRecentTweets(count);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Post tweet immediately (for testing)
router.post('/tweet', async (req, res) => {
  try {
    const { content, mediaUrls } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ error: 'Content is required' });
    }

    if (content.length > 280) {
      return res.status(400).json({ error: 'Content exceeds 280 characters' });
    }

    const result = await postTweet(content, mediaUrls);
    
    if (result.success) {
      res.json(result);
    } else {
      res.status(500).json({ error: result.error });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
