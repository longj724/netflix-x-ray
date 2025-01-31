// External Dependencies
import { useState, useEffect } from 'react';
import { X, Star, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';

// Internal Dependencies
import '@pages/panel/Panel.css';
import { CastMember } from '@src/components/CastMember';

type Tab = 'cast' | 'recommendations';

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
      details?: {
        biography: string;
        birthday?: string;
        place_of_birth?: string;
        known_for_department?: string;
        deathday?: string | null;
      };
    }>;
    guest_stars?: Array<{
      name: string;
      character: string;
      profile_path?: string;
      details?: {
        biography: string;
        birthday?: string;
        place_of_birth?: string;
        known_for_department?: string;
        deathday?: string | null;
      };
    }>;
  };
  imdb_id?: string;
  recommendations?: {
    results: Array<{
      id: number;
      title?: string;
      name?: string;
      poster_path?: string;
      vote_average: number;
      overview: string;
      media_type?: 'movie' | 'tv';
    }>;
  };
}

// Utility function to format date
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  const date = new Date(dateString);
  return date
    .toLocaleDateString(undefined, options)
    .replace(/(\d+)(?=\s)/, (match) => `${match}${getOrdinalSuffix(match)}`);
};

// Function to get ordinal suffix for a number
const getOrdinalSuffix = (num: string) => {
  const n = parseInt(num);
  if (n % 100 >= 11 && n % 100 <= 13) return 'th';
  switch (n % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
};

export default function Panel() {
  const [activeTab, setActiveTab] = useState<Tab>('cast');
  const [mediaData, setMediaData] = useState<MediaData | null>(null);
  const [selectedActorIndex, setSelectedActorIndex] = useState<number | null>(
    null
  );
  const [selectedGuestIndex, setSelectedGuestIndex] = useState<number | null>(
    null
  );

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

  const handleActorClick = (index: number, isGuestStar: boolean = false) => {
    if (isGuestStar) {
      setSelectedGuestIndex(selectedGuestIndex === index ? null : index);
      setSelectedActorIndex(null);
    } else {
      setSelectedActorIndex(selectedActorIndex === index ? null : index);
      setSelectedGuestIndex(null);
    }
  };

  const renderActorDetails = (actor: MediaData['credits']['cast'][0]) => {
    if (!actor.details) return null;

    return (
      <div className="mt-2 p-4 bg-gray-900 rounded-md space-y-2">
        {actor.details.birthday && (
          <p className="text-sm">
            <span className="font-semibold">Born:</span>{' '}
            {formatDate(actor.details.birthday)}
            {actor.details.place_of_birth &&
              ` in ${actor.details.place_of_birth}`}
          </p>
        )}
        {actor.details.deathday && (
          <p className="text-sm">
            <span className="font-semibold">Died:</span>{' '}
            {actor.details.deathday}
          </p>
        )}
        {actor.details.known_for_department && (
          <p className="text-sm">
            <span className="font-semibold">Known for:</span>{' '}
            {actor.details.known_for_department}
          </p>
        )}
        {actor.details.biography && (
          <div>
            <p className="text-sm font-semibold mb-1">Biography:</p>
            <p className="text-sm text-gray-300">{actor.details.biography}</p>
          </div>
        )}
      </div>
    );
  };

  const renderRecommendations = () => {
    if (!mediaData?.recommendations?.results.length) {
      return <p className="text-gray-400">No recommendations available.</p>;
    }

    return (
      <div className="grid grid-cols-2 gap-4">
        {mediaData.recommendations.results.slice(0, 6).map((item) => (
          <div key={item.id} className="space-y-2">
            <img
              src={
                item.poster_path
                  ? `https://image.tmdb.org/t/p/w200${item.poster_path}`
                  : 'https://place-hold.it/200x300'
              }
              alt={`${item.title || item.name} poster`}
              className="w-full h-auto rounded-md"
            />
            <div>
              <h3 className="font-semibold">{item.title || item.name}</h3>
              {item.vote_average > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                  <span className="text-sm">
                    {item.vote_average.toFixed(1)}/10
                  </span>
                </div>
              )}
              <p className="text-sm text-gray-400 mt-1 line-clamp-2">
                {item.overview}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  console.log('mediaData', mediaData);

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-800">
        <div>
          <h1 className="text-2xl font-bold">Movie Lens</h1>
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
              {mediaData.imdb_id && (
                <a
                  href={`https://www.imdb.com/title/${mediaData.imdb_id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-yellow-400 hover:text-yellow-300 mt-2"
                >
                  IMDb <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 mt-4 text-sm text-gray-400">
            <span>Powered by:</span>
            <img
              src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
              alt="TMDB Logo"
              className="h-3"
            />
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
            activeTab === 'recommendations'
              ? 'border-b-2 border-white'
              : 'text-gray-400'
          }`}
          onClick={() => setActiveTab('recommendations')}
        >
          Recommendations
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
                  <div key={index} className="space-y-2">
                    <div
                      className="cursor-pointer relative w-full"
                      onClick={() => handleActorClick(index)}
                    >
                      <CastMember
                        name={actor.name}
                        role={actor.character}
                        imageUrl={
                          actor.profile_path
                            ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
                            : 'https://place-hold.it/100x100'
                        }
                      />
                      {actor.details && (
                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                          {selectedActorIndex === index ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </div>
                      )}
                    </div>
                    {selectedActorIndex === index && renderActorDetails(actor)}
                  </div>
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
                    <div key={index} className="space-y-2">
                      <div
                        className="cursor-pointer relative w-full"
                        onClick={() => handleActorClick(index, true)}
                      >
                        <CastMember
                          name={actor.name}
                          role={actor.character}
                          imageUrl={
                            actor.profile_path
                              ? `https://image.tmdb.org/t/p/w200${actor.profile_path}`
                              : 'https://place-hold.it/100x100'
                          }
                        />
                        {actor.details && (
                          <div className="absolute right-2 top-1/2 -translate-y-1/2">
                            {selectedGuestIndex === index ? (
                              <ChevronUp className="w-5 h-5" />
                            ) : (
                              <ChevronDown className="w-5 h-5" />
                            )}
                          </div>
                        )}
                      </div>
                      {selectedGuestIndex === index &&
                        renderActorDetails(actor)}
                    </div>
                  ))}
                </div>
              )}
          </>
        )}

        {activeTab === 'recommendations' && renderRecommendations()}
      </div>
    </div>
  );
}
