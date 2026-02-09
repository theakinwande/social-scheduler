<script>
  import { createEventDispatcher } from 'svelte';
  import { deletePost, updatePost } from '../stores/posts.js';
  import { format, parseISO, formatDistanceToNow } from 'date-fns';

  export let post;

  const dispatch = createEventDispatcher();

  let isEditing = false;
  let editContent = post.content;
  let editScheduledAt = format(parseISO(post.scheduled_at), "yyyy-MM-dd'T'HH:mm");
  let isDeleting = false;
  let isSaving = false;

  $: formattedDate = format(parseISO(post.scheduled_at), 'MMM d, yyyy');
  $: formattedTime = format(parseISO(post.scheduled_at), 'h:mm a');
  $: relativeTime = formatDistanceToNow(parseISO(post.scheduled_at), { addSuffix: true });

  const statusConfig = {
    scheduled: { icon: '🕐', label: 'Scheduled', color: '#3b82f6' },
    posted: { icon: '✓', label: 'Posted', color: '#22c55e' },
    draft: { icon: '📝', label: 'Draft', color: '#8b5cf6' },
    failed: { icon: '!', label: 'Failed', color: '#ef4444' }
  };

  $: status = statusConfig[post.status] || statusConfig.scheduled;

  async function handleDelete() {
    if (!confirm('Delete this post?')) return;
    isDeleting = true;
    try {
      await deletePost(post.id);
      dispatch('updated');
    } catch (error) {
      alert('Failed to delete: ' + error.message);
    } finally {
      isDeleting = false;
    }
  }

  async function handleSave() {
    isSaving = true;
    try {
      await updatePost(post.id, { content: editContent, scheduledAt: editScheduledAt });
      isEditing = false;
      dispatch('updated');
    } catch (error) {
      alert('Failed to save: ' + error.message);
    } finally {
      isSaving = false;
    }
  }

  async function handleSchedule() {
    isSaving = true;
    try {
      await updatePost(post.id, { status: 'scheduled' });
      dispatch('updated');
    } catch (error) {
      alert('Failed to schedule: ' + error.message);
    } finally {
      isSaving = false;
    }
  }

  function startEditing() {
    editContent = post.content;
    editScheduledAt = format(parseISO(post.scheduled_at), "yyyy-MM-dd'T'HH:mm");
    isEditing = true;
  }
</script>

<article class="post-card" class:failed={post.status === 'failed'}>
  <div class="post-header">
    <div class="status-badge" style="--status-color: {status.color}">
      <span class="status-icon">{status.icon}</span>
      {status.label}
    </div>
    <div class="post-time">
      <span class="date">{formattedDate}</span>
      <span class="separator"></span>
      <span class="time">{formattedTime}</span>
    </div>
  </div>

  {#if isEditing}
    <div class="edit-form">
      <textarea bind:value={editContent} rows="3"></textarea>
      <input type="datetime-local" bind:value={editScheduledAt} />
      <div class="edit-actions">
        <button class="btn-cancel" on:click={() => isEditing = false}>Cancel</button>
        <button class="btn-save" on:click={handleSave} disabled={isSaving}>{isSaving ? 'Saving...' : 'Save Changes'}</button>
      </div>
    </div>
  {:else}
    <p class="post-content">{post.content}</p>

    {#if post.status === 'scheduled'}
      <div class="countdown">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
        Posts {relativeTime}
      </div>
    {/if}

    {#if post.error_message}
      <div class="error-message">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
        {post.error_message}
      </div>
    {/if}

    {#if post.twitter_post_id}
      <a href="https://x.com/i/web/status/{post.twitter_post_id}" target="_blank" rel="noopener" class="tweet-link">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
        View on X
        <svg class="external" viewBox="0 0 24 24" fill="currentColor"><path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/></svg>
      </a>
    {/if}
  {/if}

  {#if post.status !== 'posted' && !isEditing}
    <div class="post-actions">
      {#if post.status === 'draft'}
        <button class="btn-action schedule" on:click={handleSchedule} disabled={isSaving}>
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
          Schedule
        </button>
      {/if}
      <button class="btn-action edit" on:click={startEditing}>
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
        Edit
      </button>
      <button class="btn-action delete" on:click={handleDelete} disabled={isDeleting}>
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
        {isDeleting ? '...' : 'Delete'}
      </button>
    </div>
  {/if}
</article>

<style>
  .post-card {
    background: rgba(255, 255, 255, 0.03);
    border-radius: 16px;
    padding: 20px;
    border: 1px solid rgba(255, 255, 255, 0.06);
    transition: all 0.2s;
  }

  .post-card:hover {
    border-color: rgba(255, 255, 255, 0.1);
    background: rgba(255, 255, 255, 0.04);
  }

  .post-card.failed {
    border-color: rgba(239, 68, 68, 0.3);
  }

  .post-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 14px;
  }

  .status-badge {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 600;
    padding: 5px 12px;
    border-radius: 20px;
    background: color-mix(in srgb, var(--status-color) 15%, transparent);
    color: var(--status-color);
    text-transform: uppercase;
    letter-spacing: 0.03em;
  }

  .status-icon {
    font-size: 11px;
  }

  .post-time {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 13px;
    color: #71717a;
  }

  .separator {
    opacity: 0.5;
  }

  .post-content {
    font-size: 15px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
    color: #e4e4e7;
  }

  .countdown {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 12px;
    font-size: 13px;
    color: #3b82f6;
  }

  .countdown svg {
    width: 14px;
    height: 14px;
  }

  .error-message {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    margin-top: 12px;
    font-size: 13px;
    color: #ef4444;
    background: rgba(239, 68, 68, 0.1);
    padding: 10px 14px;
    border-radius: 10px;
  }

  .error-message svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    margin-top: 1px;
  }

  .tweet-link {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    margin-top: 12px;
    font-size: 13px;
    font-weight: 500;
    color: #71717a;
    text-decoration: none;
    transition: color 0.2s;
  }

  .tweet-link:hover {
    color: #e4e4e7;
  }

  .tweet-link svg {
    width: 16px;
    height: 16px;
  }

  .tweet-link .external {
    width: 12px;
    height: 12px;
    opacity: 0.5;
  }

  .post-actions {
    margin-top: 16px;
    padding-top: 16px;
    border-top: 1px solid rgba(255, 255, 255, 0.06);
    display: flex;
    gap: 8px;
  }

  .btn-action {
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: #a1a1aa;
    padding: 8px 14px;
    border-radius: 10px;
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-action svg {
    width: 14px;
    height: 14px;
  }

  .btn-action:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.08);
    color: #e4e4e7;
  }

  .btn-action.schedule:hover:not(:disabled) {
    background: rgba(59, 130, 246, 0.15);
    border-color: rgba(59, 130, 246, 0.3);
    color: #3b82f6;
  }

  .btn-action.delete:hover:not(:disabled) {
    background: rgba(239, 68, 68, 0.15);
    border-color: rgba(239, 68, 68, 0.3);
    color: #ef4444;
  }

  .btn-action:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .edit-form {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .edit-form textarea {
    width: 100%;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 14px;
    color: #e4e4e7;
    font-size: 15px;
    resize: none;
    font-family: inherit;
    line-height: 1.5;
  }

  .edit-form textarea:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.5);
  }

  .edit-form input {
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    padding: 10px 14px;
    color: #e4e4e7;
    font-size: 14px;
    font-family: inherit;
  }

  .edit-actions {
    display: flex;
    gap: 10px;
    justify-content: flex-end;
  }

  .btn-cancel {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: #71717a;
    padding: 10px 18px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
  }

  .btn-cancel:hover {
    background: rgba(255, 255, 255, 0.05);
    color: #e4e4e7;
  }

  .btn-save {
    background: #3b82f6;
    border: none;
    color: white;
    padding: 10px 18px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .btn-save:hover:not(:disabled) {
    background: #2563eb;
  }

  .btn-save:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
</style>
