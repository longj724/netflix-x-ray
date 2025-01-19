interface VideoData {
  title: string;
  timestamp: number;
  url: string;
}

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

// Listen for messages from content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'new_video') {
    handleNewVideo(message.data as VideoData);
  }
});

async function handleNewVideo(videoData: VideoData): Promise<void> {
  try {
    // Send video to api
    // chrome.action.setBadgeText({ text: count.toString() });
  } catch (error) {
    console.error('Error handling new video in background:', error);
  }
}

export {};
