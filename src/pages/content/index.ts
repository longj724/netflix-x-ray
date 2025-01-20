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

  public onTitleChange(callback: VideoTitleCallback): void {
    this.callbacks.push(callback);
  }

  public offTitleChange(callback: VideoTitleCallback): void {
    this.callbacks = this.callbacks.filter((cb) => cb !== callback);
  }
}

const titleTracker = new NetflixVideoTitleTracker();

titleTracker.onTitleChange(async (title: string) => {
  console.log('New video title detected:', title);

  const result = await chrome.storage.local.get('currentVideo');
  const storedVideo = result.currentVideo as VideoData | undefined;

  if (!storedVideo || storedVideo.title !== title) {
    console.log('saving');

    const parsedTitle = NetflixTitleParser.parse(title);

    chrome.storage.local.set({
      currentVideo: {
        title,
        timestamp: Date.now(),
        url: window.location.href,
      },
    });

    if (parsedTitle.type === 'tvshow') {
      chrome.runtime.sendMessage({
        type: 'new_tvshow',
        title: parsedTitle.title,
        episodeNumber: parsedTitle.episodeNumber,
        episodeTitle: parsedTitle.episodeTitle,
      });
    } else {
      chrome.runtime.sendMessage({
        type: 'new_movie',
        title: parsedTitle.title,
      });
    }
  } else {
    console.log('not saving');
  }
});

interface ParsedMovie {
  type: 'movie';
  title: string;
}

interface ParsedTVShow {
  type: 'tvshow';
  title: string;
  episodeNumber: number;
  episodeTitle: string;
}

type ParsedTitle = ParsedMovie | ParsedTVShow;

class NetflixTitleParser {
  /**
   * Parses a Netflix title to extract show/movie information
   * @param rawTitle The raw title from Netflix (e.g., "Band of BrothersE7The Breaking Point")
   * @returns ParsedTitle object containing the parsed information
   */
  public static parse(rawTitle: string): ParsedTitle {
    // Common patterns for TV show titles:
    // "Show NameE1Episode Name"
    // "Show NameS1E1Episode Name"
    // "Show Name: E1Episode Name"
    // "Show Name - E1Episode Name"

    // First, clean up the title
    const cleanTitle = rawTitle.trim();

    // Check for episode indicators
    const episodePatterns = [
      /^(.*?)E(\d+)(.*)$/i, // Basic pattern: ShowE1Episode
      /^(.*?)S\d+E(\d+)(.*)$/i, // With season: ShowS1E1Episode
      /^(.*?)[:\s-]\s*E(\d+)(.*)$/i, // With separator: Show - E1Episode
    ];

    for (const pattern of episodePatterns) {
      const match = cleanTitle.match(pattern);
      if (match) {
        // We found a TV show pattern
        const [_, showTitle, episodeNum, episodeTitle] = match;

        return {
          type: 'tvshow',
          title: showTitle.trim(),
          episodeNumber: parseInt(episodeNum, 10),
          episodeTitle: episodeTitle.trim(),
        };
      }
    }

    // If no TV show pattern was found, treat it as a movie
    return {
      type: 'movie',
      title: cleanTitle,
    };
  }

  /**
   * Attempts to extract season number if present
   * @param title Full title string
   * @returns season number or undefined
   */
  private static extractSeason(title: string): number | undefined {
    const seasonPattern = /S(\d+)E\d+/i;
    const match = title.match(seasonPattern);
    return match ? parseInt(match[1], 10) : undefined;
  }

  /**
   * Validates if a string matches TV show patterns
   * @param title Title to check
   * @returns boolean indicating if it's likely a TV show
   */
  public static isTVShow(title: string): boolean {
    return /E\d+/i.test(title);
  }
}
