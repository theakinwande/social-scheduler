<script>
  import { createEventDispatcher } from 'svelte';
  import PostCard from './PostCard.svelte';

  export let posts = [];
  export let activeTab = 'scheduled';
  
  const dispatch = createEventDispatcher();

  function handleUpdated() {
    dispatch('updated');
  }

  const emptyStates = {
    scheduled: { icon: '📅', title: 'No scheduled posts', desc: 'Create a new post and schedule it for later' },
    posted: { icon: '✨', title: 'No posted tweets yet', desc: 'Scheduled posts will appear here after publishing' },
    drafts: { icon: '📝', title: 'No drafts saved', desc: 'Save posts as drafts to work on them later' },
    failed: { icon: '🎉', title: 'No failed posts', desc: 'All your posts are publishing successfully!' }
  };

  $: emptyState = emptyStates[activeTab] || emptyStates.scheduled;
</script>

<div class="post-list">
  {#if posts.length === 0}
    <div class="empty-state">
      <span class="empty-icon">{emptyState.icon}</span>
      <h3>{emptyState.title}</h3>
      <p>{emptyState.desc}</p>
    </div>
  {:else}
    <div class="posts-grid">
      {#each posts as post (post.id)}
        <PostCard {post} on:updated={handleUpdated} />
      {/each}
    </div>
  {/if}
</div>

<style>
  .post-list {
    min-height: 200px;
  }

  .posts-grid {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }

  .empty-state {
    text-align: center;
    padding: 60px 40px;
    background: rgba(255, 255, 255, 0.02);
    border-radius: 20px;
    border: 1px dashed rgba(255, 255, 255, 0.1);
  }

  .empty-icon {
    font-size: 48px;
    display: block;
    margin-bottom: 16px;
  }

  .empty-state h3 {
    font-size: 18px;
    font-weight: 600;
    color: #e4e4e7;
    margin-bottom: 8px;
  }

  .empty-state p {
    font-size: 14px;
    color: #71717a;
  }
</style>
