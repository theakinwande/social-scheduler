<script>
  import Header from './components/Header.svelte';
  import PostComposer from './components/PostComposer.svelte';
  import PostList from './components/PostList.svelte';
  import { posts, loadPosts, twitterStatus, checkTwitterStatus } from './stores/posts.js';
  import { onMount } from 'svelte';

  let activeTab = 'scheduled';

  onMount(() => {
    loadPosts();
    checkTwitterStatus();
  });

  $: filteredPosts = $posts.filter(post => {
    if (activeTab === 'scheduled') return post.status === 'scheduled';
    if (activeTab === 'posted') return post.status === 'posted';
    if (activeTab === 'drafts') return post.status === 'draft';
    if (activeTab === 'failed') return post.status === 'failed';
    return true;
  });
</script>

<main>
  <Header twitterStatus={$twitterStatus} />
  
  <div class="container">
    <PostComposer on:created={loadPosts} />
    
    <section class="posts-section">
      <div class="tabs">
        <button 
          class:active={activeTab === 'scheduled'} 
          on:click={() => activeTab = 'scheduled'}
        >
          📅 Scheduled
        </button>
        <button 
          class:active={activeTab === 'posted'} 
          on:click={() => activeTab = 'posted'}
        >
          ✅ Posted
        </button>
        <button 
          class:active={activeTab === 'drafts'} 
          on:click={() => activeTab = 'drafts'}
        >
          📝 Drafts
        </button>
        <button 
          class:active={activeTab === 'failed'} 
          on:click={() => activeTab = 'failed'}
        >
          ❌ Failed
        </button>
      </div>

      <PostList posts={filteredPosts} on:updated={loadPosts} />
    </section>
  </div>
</main>

<style>
  :global(*) {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  :global(body) {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    background: #0a0a0b;
    color: #fafafa;
    min-height: 100vh;
  }

  main {
    min-height: 100vh;
  }

  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 20px;
  }

  .posts-section {
    margin-top: 30px;
  }

  .tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    border-bottom: 1px solid #38444d;
    padding-bottom: 10px;
  }

  .tabs button {
    background: none;
    border: none;
    color: #8899a6;
    padding: 10px 20px;
    cursor: pointer;
    font-size: 14px;
    border-radius: 20px;
    transition: all 0.2s;
  }

  .tabs button:hover {
    background: rgba(29, 161, 242, 0.1);
    color: #1da1f2;
  }

  .tabs button.active {
    background: #3b82f6;
    color: white;
  }
</style>
