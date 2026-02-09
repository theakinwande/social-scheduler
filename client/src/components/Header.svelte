<script>
  export let twitterStatus;
</script>

<header>
  <div class="header-content">
    <div class="logo">
      <div class="logo-icon">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
        </svg>
      </div>
      <div class="logo-text">
        <h1>Social Scheduler</h1>
        <span class="tagline">Schedule your posts effortlessly</span>
      </div>
    </div>
    
    <div class="status-wrapper">
      {#if twitterStatus?.valid}
        <div class="status connected">
          <div class="status-dot"></div>
          <div class="status-info">
            <span class="status-label">Connected</span>
            <span class="status-user">@{twitterStatus.user?.username}</span>
          </div>
          <div class="avatar">
            {twitterStatus.user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
        </div>
      {:else}
        <div class="status disconnected">
          <div class="status-dot"></div>
          <span class="status-label">Not connected</span>
        </div>
      {/if}
    </div>
  </div>
</header>

<style>
  header {
    background: rgba(15, 15, 26, 0.8);
    backdrop-filter: blur(20px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.06);
    padding: 16px 24px;
    position: sticky;
    top: 0;
    z-index: 100;
  }

  .header-content {
    max-width: 1200px;
    margin: 0 auto;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .logo-icon {
    width: 44px;
    height: 44px;
    background: #3b82f6;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .logo-icon svg {
    width: 24px;
    height: 24px;
    color: white;
  }

  .logo-text {
    display: flex;
    flex-direction: column;
  }

  h1 {
    font-size: 18px;
    font-weight: 700;
    color: #ffffff;
    letter-spacing: -0.02em;
  }

  .tagline {
    font-size: 12px;
    color: #71717a;
    margin-top: 1px;
  }

  .status-wrapper {
    display: flex;
    align-items: center;
  }

  .status {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 16px;
    border-radius: 50px;
    font-size: 14px;
  }

  .status.connected {
    background: rgba(34, 197, 94, 0.1);
    border: 1px solid rgba(34, 197, 94, 0.2);
  }

  .status.disconnected {
    background: rgba(239, 68, 68, 0.1);
    border: 1px solid rgba(239, 68, 68, 0.2);
  }

  .status-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    animation: pulse 2s infinite;
  }

  .connected .status-dot {
    background: #22c55e;
    box-shadow: 0 0 8px rgba(34, 197, 94, 0.5);
  }

  .disconnected .status-dot {
    background: #ef4444;
    box-shadow: 0 0 8px rgba(239, 68, 68, 0.5);
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }

  .status-info {
    display: flex;
    flex-direction: column;
  }

  .status-label {
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #71717a;
  }

  .connected .status-label {
    color: #22c55e;
  }

  .disconnected .status-label {
    color: #ef4444;
  }

  .status-user {
    font-size: 14px;
    font-weight: 600;
    color: #e4e4e7;
  }

  .avatar {
    width: 32px;
    height: 32px;
    background: #3b82f6;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 14px;
    font-weight: 600;
    color: white;
  }

  @media (max-width: 600px) {
    .tagline {
      display: none;
    }

    .status-info {
      display: none;
    }
  }
</style>
