import cron from 'node-cron';
import { postQueries } from '../db/database.js';
import { postTweet } from './twitter.js';

/**
 * Process scheduled posts that are due
 */
async function processScheduledPosts() {
  const duePosts = postQueries.getScheduled.all();

  if (duePosts.length === 0) return;

  console.log(`📬 Processing ${duePosts.length} scheduled post(s)...`);

  for (const post of duePosts) {
    try {
      const mediaUrls = post.media_urls ? JSON.parse(post.media_urls) : [];
      const result = await postTweet(post.content, mediaUrls);

      if (result.success) {
        postQueries.updateStatus.run('posted', result.tweetId, null, post.id);
        console.log(`✅ Post ${post.id} published successfully`);
      } else {
        postQueries.updateStatus.run('failed', null, result.error, post.id);
        console.log(`❌ Post ${post.id} failed: ${result.error}`);
      }
    } catch (error) {
      postQueries.updateStatus.run('failed', null, error.message, post.id);
      console.error(`❌ Error processing post ${post.id}:`, error.message);
    }
  }
}

/**
 * Start the scheduler - runs every minute
 */
export function startScheduler() {
  // Run every minute
  cron.schedule('* * * * *', () => {
    processScheduledPosts();
  });

  console.log('⏰ Scheduler started - checking every minute');

  // Also run immediately on startup
  processScheduledPosts();
}
