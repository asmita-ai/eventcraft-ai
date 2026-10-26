import React from 'react';

interface PrioritiesState {
  catering: number;
  venue: number;
  decoration: number;
  photography: number;
  entertainment: number;
  contingency: number;
}

interface Step3PrioritiesProps {
  priorities: PrioritiesState;
  setPriorities: React.Dispatch<React.SetStateAction<PrioritiesState>>;
}

export const Step3Priorities: React.FC<Step3PrioritiesProps> = ({ priorities, setPriorities }) => {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900">
        <strong>Why priorities matter:</strong> When trade-offs arise, the system must never cut
        costs blindly. Weighting these categories directs where the AI invests versus economizes!
      </div>

      <div className="space-y-3">
        {[
          {
            key: 'catering' as const,
            label: '🍲 Food & Beverage (Per-plate quality & live counters)',
            val: priorities.catering,
          },
          {
            key: 'venue' as const,
            label: '🏛️ Venue & Ambience (Central location, AC banquet, capacity)',
            val: priorities.venue,
          },
          {
            key: 'decoration' as const,
            label: '🌸 Decor & Stage (Floral arches, photobooth, lighting)',
            val: priorities.decoration,
          },
          {
            key: 'photography' as const,
            label: '📸 Photography & Cinematography (Candid album & teaser reel)',
            val: priorities.photography,
          },
          {
            key: 'entertainment' as const,
            label: '🎵 Music & Entertainment (Live DJ, sound, performers)',
            val: priorities.entertainment,
          },
        ].map((item) => (
          <div
            key={item.key}
            className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4"
          >
            <span className="text-xs font-semibold text-slate-800 flex-1">{item.label}</span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setPriorities((prev) => ({ ...prev, [item.key]: lvl }))}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                    item.val >= lvl
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
