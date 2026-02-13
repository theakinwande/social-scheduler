<script>
  import { createEventDispatcher } from 'svelte';
  import { createPost } from '../stores/posts.js';
  import { format, addHours, addDays, setHours, setMinutes, startOfTomorrow } from 'date-fns';

  const dispatch = createEventDispatcher();

  let content = '';
  let scheduledAt = format(addHours(new Date(), 1), "yyyy-MM-dd'T'HH:mm");
  let saveAsDraft = false;
  let isSubmitting = false;
  let error = '';
  let mediaFiles = [];
  let mediaPreview = [];
  let fileInput;

  const presets = [
    { label: '1h', getValue: () => addHours(new Date(), 1) },
    { label: '3h', getValue: () => addHours(new Date(), 3) },
    { label: '6h', getValue: () => addHours(new Date(), 6) },
    { label: 'Tomorrow 9am', getValue: () => setMinutes(setHours(startOfTomorrow(), 9), 0) },
    { label: 'Tomorrow 6pm', getValue: () => setMinutes(setHours(startOfTomorrow(), 18), 0) },
  ];

  function setPreset(preset) {
    scheduledAt = format(preset.getValue(), "yyyy-MM-dd'T'HH:mm");
  }

  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/quicktime'];
  const maxImageSize = 5 * 1024 * 1024; // 5MB
  const maxVideoSize = 512 * 1024 * 1024; // 512MB

  function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    const hasVideo = mediaFiles.some(f => f.type.startsWith('video/')) || files.some(f => f.type.startsWith('video/'));
    
    // X allows 4 images OR 1 video
    if (hasVideo && (mediaFiles.length + files.length > 1)) {
      error = 'Only a video allowed per post';
      return;
    }
    if (!hasVideo && mediaFiles.length + files.length > 4) {
      error = 'Maximum four images allowed';
      return;
    }
    
    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        error = 'Supported: JPG, PNG, GIF, WebP, MP4, MOV';
        return;
      }
      const isVideo = file.type.startsWith('video/');
      const maxSize = isVideo ? maxVideoSize : maxImageSize;
      if (file.size > maxSize) {
        error = isVideo ? 'Videos must be under 512MB' : 'Images must be under 5MB';
        return;
      }
    }
    
    error = '';
    mediaFiles = [...mediaFiles, ...files];
    
    // Generate previews
    files.forEach(file => {
      const reader = new FileReader();
      const isVideo = file.type.startsWith('video/');
      reader.onload = (e) => {
        mediaPreview = [...mediaPreview, { src: e.target.result, type: isVideo ? 'video' : 'image' }];
      };
      reader.readAsDataURL(file);
    });
  }

  function removeMedia(index) {
    mediaFiles = mediaFiles.filter((_, i) => i !== index);
    mediaPreview = mediaPreview.filter((_, i) => i !== index);
  }

  $: charCount = content.length;
  $: isOverLimit = charCount > 280;
  $: charPercent = Math.min((charCount / 280) * 100, 100);
  $: charColor = charCount > 260 ? (isOverLimit ? '#ef4444' : '#f59e0b') : '#3b82f6';

  async function handleSubmit() {
    if (!content.trim() || isOverLimit) return;
    
    error = '';
    isSubmitting = true;

    try {
      // Convert files to base64 for storage (in production, upload to cloud storage)
      const mediaUrls = mediaPreview.length > 0 ? mediaPreview.map(m => m.src) : undefined;
      
      await createPost({
        content: content.trim(),
        mediaUrls,
        scheduledAt,
        status: saveAsDraft ? 'draft' : 'scheduled'
      });

      content = '';
      mediaFiles = [];
      mediaPreview = [];
      scheduledAt = format(addHours(new Date(), 1), "yyyy-MM-dd'T'HH:mm");
      saveAsDraft = false;
      dispatch('created');
    } catch (err) {
      error = err.message;
    } finally {
      isSubmitting = false;
    }
  }
</script>

<div class="composer">
  <div class="composer-header">
    <h2>New Post</h2>
    <div class="char-indicator" class:warning={charCount > 260} class:over={isOverLimit}>
      <svg viewBox="0 0 36 36" class="circular-chart">
        <path class="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
        <path class="circle" stroke={charColor} stroke-dasharray="{charPercent}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
      </svg>
      <span class="char-text" style="color: {charColor}">{280 - charCount}</span>
    </div>
  </div>
  
  {#if error}
    <div class="error">
      <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/></svg>
      {error}
    </div>
  {/if}

  <form on:submit|preventDefault={handleSubmit}>
    <div class="textarea-wrapper">
      <textarea bind:value={content} placeholder="What's on your mind?" rows="5"></textarea>
    </div>

    {#if mediaPreview.length > 0}
      <div class="media-preview">
        {#each mediaPreview as media, i}
          <div class="media-item">
            {#if media.type === 'video'}
              <video src={media.src} muted></video>
              <div class="video-badge">VIDEO</div>
            {:else}
              <img src={media.src} alt="Preview" />
            {/if}
            <button type="button" class="remove-media" on:click={() => removeMedia(i)}>
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
            </button>
          </div>
        {/each}
      </div>
    {/if}

    <div class="media-section">
      <input type="file" accept="image/jpeg,image/png,image/gif,image/webp,video/mp4,video/quicktime" multiple bind:this={fileInput} on:change={handleFileSelect} style="display: none" />
      <button type="button" class="media-btn" on:click={() => fileInput.click()} disabled={mediaFiles.length >= 4}>
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>
        <span>{mediaFiles.length > 0 ? `${mediaFiles.length} media` : 'Add media'}</span>
      </button>
    </div>

    <div class="schedule-section">
      <div class="schedule-header">
        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
        <span>Schedule for</span>
      </div>
      
      <div class="quick-presets">
        {#each presets as preset}
          <button type="button" class="preset-btn" on:click={() => setPreset(preset)}>
            {preset.label}
          </button>
        {/each}
      </div>
      
      <div class="datetime-inputs">
        <div class="input-group">
          <label for="scheduled-date">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11zM9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2z"/></svg>
            <span>Date</span>
          </label>
          <input id="scheduled-date" type="date" min={format(new Date(), 'yyyy-MM-dd')} value={scheduledAt.split('T')[0]} on:change={e => {
            const time = scheduledAt.split('T')[1] || '12:00';
            scheduledAt = e.target.value + 'T' + time;
          }} />
        </div>
        <div class="input-group">
          <label for="scheduled-time">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
            <span>Time</span>
          </label>
          <input id="scheduled-time" type="time" value={scheduledAt.split('T')[1]} on:change={e => {
            const date = scheduledAt.split('T')[0];
            scheduledAt = date + 'T' + e.target.value;
          }} />
        </div>
      </div>
    </div>

    <div class="composer-footer">
      <label class="draft-toggle">
        <input type="checkbox" bind:checked={saveAsDraft} />
        <span class="toggle-track"><span class="toggle-thumb"></span></span>
        <span class="toggle-label">Save as draft</span>
      </label>

      <button type="submit" class="submit-btn" class:draft={saveAsDraft} disabled={!content.trim() || isOverLimit || isSubmitting}>
        {#if isSubmitting}
          <span class="spinner"></span> Saving...
        {:else if saveAsDraft}
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm2 16H5V5h11.17L19 7.83V19zm-7-7c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3zM6 6h9v4H6z"/></svg>
          Save Draft
        {:else}
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
          Schedule Post
        {/if}
      </button>
    </div>
  </form>
</div>

<style>
  .composer {
    background: #18181b;
    border-radius: 16px;
    padding: 24px;
    border: 1px solid #27272a;
  }

  .composer-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }

  h2 {
    font-size: 16px;
    font-weight: 600;
    color: #e4e4e7;
  }

  .char-indicator {
    position: relative;
    width: 36px;
    height: 36px;
  }

  .circular-chart {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  .circle-bg {
    fill: none;
    stroke: rgba(255, 255, 255, 0.1);
    stroke-width: 3;
  }

  .circle {
    fill: none;
    stroke-width: 3;
    stroke-linecap: round;
    transition: stroke-dasharray 0.3s ease;
  }

  .char-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 10px;
    font-weight: 600;
  }

  .error {
    display: flex;
    align-items: center;
    gap: 10px;
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
    color: #ef4444;
    padding: 12px 16px;
    border-radius: 12px;
    margin-bottom: 16px;
    font-size: 14px;
  }

  .error svg {
    width: 20px;
    height: 20px;
    flex-shrink: 0;
  }

  textarea {
    width: 100%;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 16px;
    color: #e4e4e7;
    font-size: 15px;
    resize: none;
    font-family: inherit;
    line-height: 1.6;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  textarea:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.5);
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  textarea::placeholder {
    color: #52525b;
  }

  .media-preview {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 8px;
    margin-top: 12px;
  }

  .media-item {
    position: relative;
    aspect-ratio: 1;
    border-radius: 12px;
    overflow: hidden;
  }

  .media-item img,
  .media-item video {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .video-badge {
    position: absolute;
    bottom: 6px;
    left: 6px;
    background: rgba(0, 0, 0, 0.75);
    color: white;
    font-size: 9px;
    font-weight: 700;
    padding: 2px 6px;
    border-radius: 4px;
    letter-spacing: 0.5px;
  }

  .remove-media {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 24px;
    height: 24px;
    background: rgba(0, 0, 0, 0.7);
    border: none;
    border-radius: 50%;
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background 0.2s;
  }

  .remove-media:hover {
    background: rgba(239, 68, 68, 0.8);
  }

  .remove-media svg {
    width: 14px;
    height: 14px;
  }

  .media-section {
    margin-top: 12px;
  }

  .media-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: transparent;
    border: 1px dashed rgba(255, 255, 255, 0.15);
    border-radius: 10px;
    padding: 10px 14px;
    color: #71717a;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .media-btn:hover:not(:disabled) {
    border-color: rgba(59, 130, 246, 0.4);
    color: #3b82f6;
  }

  .media-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .media-btn svg {
    width: 18px;
    height: 18px;
  }

  .schedule-section {
    margin-top: 20px;
    background: rgba(0, 0, 0, 0.2);
    border-radius: 16px;
    padding: 16px;
  }

  .schedule-header {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #a1a1aa;
    font-size: 13px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin-bottom: 12px;
  }

  .schedule-header svg {
    width: 16px;
    height: 16px;
  }

  .quick-presets {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    margin-bottom: 14px;
  }

  .preset-btn {
    background: rgba(59, 130, 246, 0.1);
    border: 1px solid rgba(59, 130, 246, 0.2);
    color: #3b82f6;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.15s ease;
  }

  .preset-btn:hover {
    background: rgba(59, 130, 246, 0.2);
    border-color: rgba(59, 130, 246, 0.4);
  }

  .datetime-inputs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
  }

  .input-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .input-group label {
    display: flex;
    align-items: center;
    gap: 6px;
    color: #71717a;
    font-size: 12px;
    font-weight: 500;
  }

  .input-group label svg {
    width: 14px;
    height: 14px;
  }

  .input-group input {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    padding: 10px 12px;
    color: #e4e4e7;
    font-size: 14px;
    font-family: inherit;
    width: 100%;
  }

  .input-group input:focus {
    outline: none;
    border-color: rgba(59, 130, 246, 0.5);
  }

  .input-group input::-webkit-calendar-picker-indicator {
    filter: invert(0.7);
    cursor: pointer;
  }

  .composer-footer {
    margin-top: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .draft-toggle {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
  }

  .draft-toggle input {
    display: none;
  }

  .toggle-track {
    width: 40px;
    height: 22px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 11px;
    position: relative;
    transition: background 0.2s;
  }

  .draft-toggle input:checked + .toggle-track {
    background: #3b82f6;
  }

  .toggle-thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 18px;
    height: 18px;
    background: white;
    border-radius: 50%;
    transition: transform 0.2s;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }

  .draft-toggle input:checked + .toggle-track .toggle-thumb {
    transform: translateX(18px);
  }

  .toggle-label {
    font-size: 14px;
    color: #71717a;
  }

  .submit-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background: #3b82f6;
    color: white;
    border: none;
    padding: 12px 24px;
    border-radius: 10px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }

  .submit-btn svg {
    width: 18px;
    height: 18px;
  }

  .submit-btn:hover:not(:disabled) {
    background: #2563eb;
  }

  .submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  .submit-btn.draft {
    background: #6366f1;
  }

  .spinner {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }
</style>
