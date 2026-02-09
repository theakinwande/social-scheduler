import { TwitterApi } from 'twitter-api-v2';
import dotenv from 'dotenv';

dotenv.config();

// Initialize X API client (uses twitter-api-v2 library)
const client = new TwitterApi({
  appKey: process.env.X_API_KEY,
  appSecret: process.env.X_API_SECRET,
  accessToken: process.env.X_ACCESS_TOKEN,
  accessSecret: process.env.X_ACCESS_SECRET,
});

// Read-write client
const rwClient = client.readWrite;

/**
 * Post to X
 * @param {string} content - Post text content
 * @param {string[]} mediaUrls - Optional array of media URLs
 * @returns {Promise<{success: boolean, tweetId?: string, error?: string}>}
 */
export async function postTweet(content, mediaUrls = []) {
  try {
    // Check if X API credentials are configured
    if (!process.env.X_API_KEY) {
      console.log('⚠️ X API not configured - simulating post');
      return {
        success: true,
        tweetId: `sim_${Date.now()}`,
        simulated: true
      };
    }

    const tweetOptions = { text: content };

    // Handle media uploads if provided
    if (mediaUrls && mediaUrls.length > 0) {
      const mediaIds = [];
      for (const url of mediaUrls) {
        const mediaId = await client.v1.uploadMedia(url);
        mediaIds.push(mediaId);
      }
      tweetOptions.media = { media_ids: mediaIds };
    }

    const tweet = await rwClient.v2.tweet(tweetOptions);
    
    console.log(`✅ Posted to X: ${tweet.data.id}`);
    return {
      success: true,
      tweetId: tweet.data.id
    };
  } catch (error) {
    console.error('❌ Failed to post:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Verify X API credentials
 * @returns {Promise<{valid: boolean, user?: object, error?: string}>}
 */
export async function verifyCredentials() {
  try {
    if (!process.env.X_API_KEY) {
      return {
        valid: false,
        error: 'X API credentials not configured'
      };
    }

    const me = await rwClient.v2.me();
    return {
      valid: true,
      user: {
        id: me.data.id,
        username: me.data.username,
        name: me.data.name
      }
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message
    };
  }
}

/**
 * Get recent tweets from the authenticated user
 * @param {number} count - Number of tweets to retrieve
 * @returns {Promise<{tweets?: array, error?: string}>}
 */
export async function getRecentTweets(count = 10) {
  try {
    if (!process.env.X_API_KEY) {
      return { tweets: [], simulated: true };
    }

    const me = await rwClient.v2.me();
    const tweets = await rwClient.v2.userTimeline(me.data.id, {
      max_results: count,
      'tweet.fields': ['created_at', 'public_metrics']
    });

    return {
      tweets: tweets.data.data || []
    };
  } catch (error) {
    return {
      error: error.message
    };
  }
}
