// External Dependencies
import { useState, useEffect } from 'react';
import { X, Star } from 'lucide-react';

// Internal Dependencies
import '@pages/panel/Panel.css';
import { CastMember } from '@src/components/CastMember';
import { TriviaItem } from '@src/components/TriviaItem';

type Tab = 'in-scene' | 'cast' | 'trivia';

interface MediaData {
  mediaType: 'movie' | 'tv';
  title: string;
  timestamp?: number;
  url?: string;
  seasonNumber?: number;
  episodeNumber?: number;
  overview?: string;
  vote_average?: number;
  poster_path?: string;
  name?: string;
  still_path?: string;
  credits?: {
    cast: Array<{
      name: string;
      character: string;
      profile_path?: string;
    }>;
    guest_stars?: Array<{
      name: string;
      character: string;
      profile_path?: string;
    }>;
  };
}

export default function Panel() {
  const [activeTab, setActiveTab] = useState<Tab>('cast');
  const [mediaData, setMediaData] = useState<MediaData | null>(null);

  // Load saved data when panel opens
  useEffect(() => {
    chrome.storage.local.get(['currentMediaData'], (result) => {
      if (result.currentMediaData) {
        setMediaData(result.currentMediaData);
      }
    });
  }, []);

  useEffect(() => {
    const messageListener = (message: any) => {
      // Arrive here when panel is open and new data is received
      if (message.type === 'update_panel_tv_show') {
        setMediaData(message.data);
      } else if (message.type === 'update_panel_movie') {
        setMediaData(message.data);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      chrome.runtime.onMessage.removeListener(messageListener);
    };
  }, []);

  const handleClose = () => {
    chrome.runtime.sendMessage({ type: 'close_panel' });
  };

  console.log('mediaData', mediaData);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-bold">X-Ray</h1>
          {mediaData && (
            <p className="text-sm text-gray-400">
              {mediaData.mediaType === 'tv' ? (
                <>
                  {mediaData.name}
                  {mediaData.seasonNumber && mediaData.episodeNumber && (
                    <span className="ml-2">
                      S{mediaData.seasonNumber}:E{mediaData.episodeNumber}
                    </span>
                  )}
                </>
              ) : (
                mediaData.title
              )}
            </p>
          )}
        </div>
        <div className="flex gap-4">
          <button onClick={handleClose}>
            <X className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Overview Section */}
      {mediaData && (
        <div className="p-4 border-b border-gray-800">
          <div className="flex gap-4">
            {mediaData.mediaType === 'movie' && mediaData.poster_path ? (
              <img
                src={`https://image.tmdb.org/t/p/w200${mediaData.poster_path}`}
                alt={`${mediaData.title} poster`}
                className="w-32 h-auto rounded-md"
              />
            ) : (
              mediaData.mediaType === 'tv' &&
              mediaData.still_path && (
                <img
                  src={`https://image.tmdb.org/t/p/w300${mediaData.still_path}`}
                  alt={`${mediaData.name} episode still`}
                  className="w-48 h-auto rounded-md"
                />
              )
            )}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                {mediaData.vote_average && (
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                    <span className="text-sm">
                      {mediaData.vote_average.toFixed(1)}/10
                    </span>
                  </div>
                )}
              </div>
              {mediaData.overview && (
                <p className="text-sm text-gray-300">{mediaData.overview}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        <button
          className={`px-6 py-3 ${
            activeTab === 'cast' ? 'border-b-2 border-white' : 'text-gray-400'
          }`}
          onClick={() => setActiveTab('cast')}
        >
          Cast
        </button>
        <button
          className={`px-6 py-3 ${
            activeTab === 'trivia' ? 'border-b-2 border-white' : 'text-gray-400'
          }`}
          onClick={() => setActiveTab('trivia')}
        >
          Trivia
        </button>
      </div>

      {/* Content */}
      <div className="p-4 space-y-4">
        {activeTab === 'cast' && (
          <>
            {/* Main Cast */}
            {mediaData?.credits?.cast && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Cast</h3>
                {mediaData.credits.cast.map((actor, index) => (
                  <CastMember
                    key={index}
                    name={actor.name}
                    role={actor.character}
                    imageUrl={
                      actor.profile_path
                        ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
                        : 'https://place-hold.it/100x100'
                    }
                  />
                ))}
              </div>
            )}

            {/* Guest Stars */}
            {mediaData?.mediaType === 'tv' &&
              mediaData?.credits?.guest_stars &&
              mediaData.credits.guest_stars.length > 0 && (
                <div className="mt-8 space-y-4">
                  <h3 className="text-lg font-semibold">Guest Stars</h3>
                  {mediaData.credits.guest_stars.map((actor, index) => (
                    <CastMember
                      key={index}
                      name={actor.name}
                      role={actor.character}
                      imageUrl={
                        actor.profile_path
                          ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
                          : 'https://place-hold.it/100x100'
                      }
                    />
                  ))}
                </div>
              )}
          </>
        )}

        {activeTab === 'trivia' && (
          <>
            <TriviaItem
              text="As Jeremy Irons was ready to take on the part of CEO John Tuld, his work visa had expired prior to..."
              category="General trivia"
            />
            <TriviaItem
              text="The cast members in the pivotal boardroom scene where Jeremy Irons addresses the board member..."
              category="General trivia"
            />
          </>
        )}
      </div>
    </div>
  );
}
