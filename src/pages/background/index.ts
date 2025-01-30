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
  }
});

async function handleNewMovie(movieData: MovieData): Promise<void> {
  try {
    const movieResponse = await fetch(
      `http://localhost:9999/search/movie?title=${encodeURIComponent(
        movieData.title
      )}`
    );

    const data = await movieResponse.json();

    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tabs[0]?.id) {
      chrome.runtime.sendMessage({
        type: 'update_panel_movie',
        data: {
          ...data,
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
