interface MovieData {
  title: string;
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
  } else if (message.type === 'close_panel') {
    chrome.sidePanel.setOptions({ enabled: false });
    chrome.sidePanel.setOptions({ enabled: true });
  }
});

async function handleNewMovie(netflixData: MovieData): Promise<void> {
  try {
    const movieResponse = await fetch(
      `http://localhost:9999/search/movie?title=${encodeURIComponent(
        netflixData.title
      )}`
    );

    const movieData = await movieResponse.json();

    chrome.storage.local.set({
      currentMediaData: { ...movieData, mediaType: 'movie' },
    });

    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]?.id) {
      chrome.runtime.sendMessage({
        type: 'update_panel_movie',
        data: {
          ...movieData,
        },
      });
    }
  } catch (error) {
    console.error('Error handling new movie in background:', error);
  }
}

async function handleNewTVShow(netflixData: TVShowData): Promise<void> {
  try {
    const showResponse = await fetch(
      `http://localhost:9999/search/tv?title=${encodeURIComponent(
        netflixData.title
      )}&episodeTitle=${encodeURIComponent(netflixData.episodeTitle)}`
    );

    const showData = await showResponse.json();

    chrome.storage.local.set({
      currentMediaData: { ...showData, mediaType: 'tv' },
    });

    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]?.id) {
      chrome.runtime.sendMessage({
        type: 'update_panel_tv_show',
        data: {
          ...showData,
        },
      });
    }
  } catch (error) {
    console.error('Error handling new TV show in background:', error);
  }
}

export {};
