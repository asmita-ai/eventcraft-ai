import React from 'react';
import { Calendar, MapPin } from 'lucide-react';
import { EventType, EventProfile } from '../../../types';
import {
  WEDDING_PRESET,
  BIRTHDAY_PRESET,
  COMMUNITY_PRESET,
} from '../../../services/heuristicGenerator';

interface Step1BasicsProps {
  eventType: EventType;
  setEventType: (type: EventType) => void;
  title: string;
  setTitle: (title: string) => void;
  occasion: string;
  setOccasion: (occ: string) => void;
  targetDate: string;
  setTargetDate: (date: string) => void;
  city: string;
  setCity: (city: string) => void;
  onLoadPreset: (preset: EventProfile) => void;
}

export const Step1Basics: React.FC<Step1BasicsProps> = ({
  eventType,
  setEventType,
  title,
  setTitle,
  occasion,
  setOccasion,
  targetDate,
  setTargetDate,
  city,
  setCity,
  onLoadPreset,
}) => {
  return (
    <div className="space-y-4 animate-fade-in">
      {/* Quick Preset Buttons on Step 1 */}
      <div className="p-3.5 bg-purple-50/70 border border-purple-200/60 rounded-xl space-y-2">
        <span className="text-xs font-semibold text-purple-900 block">
          ⚡ Or auto-fill with a challenge preset:
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => onLoadPreset(WEDDING_PRESET)}
            className="px-2.5 py-1 text-xs bg-white text-purple-700 font-medium rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors"
          >
            💍 Wedding (₹8L, 200 Guests)
          </button>
          <button
            type="button"
            onClick={() => onLoadPreset(BIRTHDAY_PRESET)}
            className="px-2.5 py-1 text-xs bg-white text-purple-700 font-medium rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors"
          >
            🎂 50th Birthday (₹1.5L)
          </button>
          <button
            type="button"
            onClick={() => onLoadPreset(COMMUNITY_PRESET)}
            className="px-2.5 py-1 text-xs bg-white text-purple-700 font-medium rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors"
          >
            🎪 Community Fest (₹3.5L)
          </button>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Event Archetype
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {[
            { id: 'wedding' as const, label: 'Wedding / Sangeet', icon: '💍' },
            { id: 'birthday' as const, label: 'Milestone Birthday', icon: '🎂' },
            { id: 'community' as const, label: 'Community Festival', icon: '🎪' },
            { id: 'anniversary' as const, label: 'Anniversary', icon: '🥂' },
            { id: 'corporate' as const, label: 'Corporate Gala', icon: '💼' },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setEventType(item.id);
                if (item.id === 'wedding') setOccasion('Traditional & Contemporary Wedding');
                else if (item.id === 'birthday') setOccasion('50th Golden Jubilee Birthday');
                else if (item.id === 'community') setOccasion('Community Cultural Mela');
              }}
              className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                eventType === item.id
                  ? 'border-purple-600 bg-purple-50/80 text-purple-900 font-bold shadow-xs ring-1 ring-purple-500'
                  : 'border-slate-200 hover:bg-slate-50 text-slate-700'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="wizard-title" className="block text-xs font-semibold text-slate-700 mb-1">
            Event Title / Family Names
          </label>
          <input
            id="wizard-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500"
            placeholder="e.g. Sharma Family Wedding"
          />
        </div>
        <div>
          <label
            htmlFor="wizard-occasion"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
            Occasion Subtitle
          </label>
          <input
            id="wizard-occasion"
            type="text"
            value={occasion}
            onChange={(e) => setOccasion(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500"
            placeholder="e.g. 50th Birthday or Wedding Reception"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="wizard-date"
            className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-purple-600" />
            Target Celebration Date
          </label>
          <input
            id="wizard-date"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div>
          <label
            htmlFor="wizard-city"
            className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-purple-600" />
            Location / City
          </label>
          <input
            id="wizard-city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500"
            placeholder="e.g. Bengaluru, Mumbai, Delhi NCR"
          />
        </div>
      </div>
    </div>
  );
};
