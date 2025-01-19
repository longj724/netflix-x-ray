// External Dependencies
import { useState } from 'react';
import { X } from 'lucide-react';

// Internal Dependencies
import '@pages/panel/Panel.css';
import { CastMember } from '@src/components/CastMember';
import { TriviaItem } from '@src/components/TriviaItem';

type Tab = 'in-scene' | 'cast' | 'trivia';

export default function Panel() {
  const [activeTab, setActiveTab] = useState<Tab>('cast');

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-gray-800">
        <h1 className="text-2xl font-bold">X-Ray</h1>
        <div className="flex gap-4">
          <button>
            <X className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex border-b border-gray-800">
        <button
          className={`px-6 py-3 ${
            activeTab === 'in-scene'
              ? 'border-b-2 border-white'
              : 'text-gray-400'
          }`}
          onClick={() => setActiveTab('in-scene')}
        >
          In Scene
        </button>
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
            <CastMember
              name="Zachary Quinto"
              role="Peter Sullivan"
              imageUrl="https://place-hold.it/100x100"
            />
            <CastMember
              name="Penn Badgley"
              role="Seth Bregman"
              imageUrl="https://place-hold.it/100x100"
            />
            <CastMember
              name="Paul Bettany"
              role="Will Emerson"
              imageUrl="https://place-hold.it/100x100"
            />
            <CastMember
              name="Ashley Williams"
              role="Heather Burke"
              imageUrl="https://place-hold.it/100x100"
            />
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
