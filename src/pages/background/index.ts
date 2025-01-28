interface MovieData {
  title: string;
  timestamp: number;
  url: string;
}

interface TVShowData {
  title: string;
  episodeTitle: string;
  episodeNumber: number;
}

chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error(error));

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'new_movie') {
    handleNewMovie(message as MovieData);
  } else if (message.type === 'new_tvshow') {
    handleNewTVShow(message as TVShowData);
  }
});

async function handleNewMovie(movieData: MovieData): Promise<void> {
  try {
    // Send movie data to the panel
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]?.id) {
      chrome.runtime.sendMessage({
        type: 'update_panel',
        data: {
          mediaType: 'movie',
          ...movieData,
        },
      });
    }
  } catch (error) {
    console.error('Error handling new movie in background:', error);
  }
}

async function handleNewTVShow(tvShowData: TVShowData): Promise<void> {
  try {
    // Send TV show data to the panel
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]?.id) {
      chrome.runtime.sendMessage({
        type: 'update_panel',
        data: {
          mediaType: 'tvShow',
          ...tvShowData,
        },
      });
    }
  } catch (error) {
    console.error('Error handling new TV show in background:', error);
  }
}

export {};
