console.log('content script loaded');

interface VideoTitleCallback {
  (title: string): void;
}

interface VideoData {
  title: string;
  timestamp: number;
  url: string;
}

class NetflixVideoTitleTracker {
  private observer: MutationObserver;
  private callbacks: VideoTitleCallback[] = [];

  constructor() {
    // Initialize MutationObserver
    this.observer = new MutationObserver(this.handleMutations.bind(this));
    this.startObserving();

    // Also check URL changes for SPA navigation
    this.watchUrlChanges();
  }

  private handleMutations(mutations: MutationRecord[]): void {
    // Only proceed if we're on a watch page
    if (!window.location.href.includes('netflix.com/watch')) {
      return;
    }

    const titleElement = document.querySelector('[data-uia="video-title"]');
    if (titleElement && titleElement.textContent) {
      const title = titleElement.textContent.trim();
      this.notifyCallbacks(title);
    }
  }

  private startObserving(): void {
    // Observe the entire document for changes
    this.observer.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  private stopObserving(): void {
    this.observer.disconnect();
  }

  private watchUrlChanges(): void {
    let lastUrl = window.location.href;

    // Create another observer just for URL changes
    const urlObserver = new MutationObserver(() => {
      if (window.location.href !== lastUrl) {
        lastUrl = window.location.href;

        // If we navigate to a watch page, ensure we're observing
        if (lastUrl.includes('netflix.com/watch')) {
          this.startObserving();
        } else {
          this.stopObserving();
        }
      }
    });

    // Observe URL changes
    urlObserver.observe(document.documentElement, {
      childList: true,
      subtree: true,
    });
  }

  private notifyCallbacks(title: string): void {
    this.callbacks.forEach((callback) => callback(title));
  }

  // Public method to subscribe to title changes
  public onTitleChange(callback: VideoTitleCallback): void {
    this.callbacks.push(callback);
  }

  // Public method to unsubscribe
  public offTitleChange(callback: VideoTitleCallback): void {
    this.callbacks = this.callbacks.filter((cb) => cb !== callback);
  }
}

// Usage example:
const titleTracker = new NetflixVideoTitleTracker();

// Subscribe to title changes
titleTracker.onTitleChange(async (title: string) => {
  console.log('New video title detected:', title);

  const result = await chrome.storage.local.get('currentVideo');
  const storedVideo = result.currentVideo as VideoData | undefined;
  if (!storedVideo || storedVideo.title !== title) {
    console.log('saving');
    chrome.storage.local.set({
      currentVideo: {
        title,
        timestamp: Date.now(),
        url: window.location.href,
      },
    });

    chrome.runtime.sendMessage({
      type: 'new_video',
      title,
    });
  } else {
    console.log('not saving');
  }
});

export { NetflixVideoTitleTracker };
