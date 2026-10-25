import React from 'react';
import { Sparkles, FileText, Download, ShieldCheck, Zap } from 'lucide-react';
import { EventProfile } from '../../types';
import { WEDDING_PRESET, BIRTHDAY_PRESET, COMMUNITY_PRESET } from '../../services/heuristicGenerator';

interface HeaderProps {
  currentProfile: EventProfile;
  hasApiKey: boolean;
  onOpenApiKeyModal: () => void;
  onOpenJudgeGuide: () => void;
  onSelectPreset: (preset: EventProfile) => void;
  onOpenNewWizard: () => void;
  onExportPlan: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentProfile,
  hasApiKey,
  onOpenApiKeyModal,
  onOpenJudgeGuide,
  onSelectPreset,
  onOpenNewWizard,
  onExportPlan,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Hackathon Badge */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-purple-600 via-fuchsia-600 to-pink-500 flex items-center justify-center text-white shadow-md shadow-fuchsia-200">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-purple-700 via-fuchsia-700 to-pink-600 bg-clip-text text-transparent">
                  EventCraft AI
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                  Challenge 5
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden md:block">
                GenAI Celebration & Adaptive Event Orchestrator
              </p>
            </div>
          </div>

          {/* Preset Selector Dropdown / Shortcuts */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-medium text-slate-700">
              <span className="px-2.5 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                Presets:
              </span>
              <button
                onClick={() => onSelectPreset(WEDDING_PRESET)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  currentProfile.id === 'preset-wedding'
                    ? 'bg-white text-purple-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
                title="Srinivas Explainer Case: ₹8 Lakh, 200 Guests, 4 Months"
              >
                💍 Wedding (₹8L)
              </button>
              <button
                onClick={() => onSelectPreset(BIRTHDAY_PRESET)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  currentProfile.id === 'preset-birthday'
                    ? 'bg-white text-purple-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                🎂 50th Birthday (₹1.5L)
              </button>
              <button
                onClick={() => onSelectPreset(COMMUNITY_PRESET)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  currentProfile.id === 'preset-community'
                    ? 'bg-white text-purple-700 shadow-xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                🎪 Community Fest (₹3.5L)
              </button>
              <button
                onClick={onOpenNewWizard}
                className="ml-1 px-3 py-1.5 rounded-lg text-purple-700 hover:bg-purple-50 font-semibold"
              >
                + New Event
              </button>
            </div>

            {/* Mobile / Compact Preset Selector */}
            <select
              aria-label="Select Event Preset"
              className="lg:hidden text-xs bg-slate-100 border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 focus:ring-2 focus:ring-purple-500 font-medium"
              value={currentProfile.id}
              onChange={(e) => {
                if (e.target.value === 'preset-wedding') onSelectPreset(WEDDING_PRESET);
                else if (e.target.value === 'preset-birthday') onSelectPreset(BIRTHDAY_PRESET);
                else if (e.target.value === 'preset-community') onSelectPreset(COMMUNITY_PRESET);
                else if (e.target.value === 'new') onOpenNewWizard();
              }}
            >
              <option value="preset-wedding">💍 Wedding (₹8L, 200G)</option>
              <option value="preset-birthday">🎂 50th Birthday (₹1.5L, 65G)</option>
              <option value="preset-community">🎪 Community Fest (₹3.5L, 350G)</option>
              <option value="new">+ Custom Event...</option>
            </select>
          </div>

          {/* Action Tools & Evaluator Shortcuts */}
          <div className="flex items-center gap-2">
            
            {/* AI Engine Status Pill */}
            <button
              onClick={onOpenApiKeyModal}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                hasApiKey
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
              }`}
              title="Click to configure Gemini API Key or review resilience status"
            >
              {hasApiKey ? (
                <>
                  <Zap className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden sm:inline">Gemini 2.5 Active</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span className="hidden sm:inline">Quota-Safe Mode</span>
                </>
              )}
            </button>

            {/* Judge & Documentation Modal Trigger */}
            <button
              onClick={onOpenJudgeGuide}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 rounded-lg text-xs font-semibold transition-all shadow-2xs"
              title="View Challenge 5 requirements mapping, prompt flow & evaluation checklist"
            >
              <FileText className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Judge Guide</span>
            </button>

            {/* Export Plan */}
            <button
              onClick={onExportPlan}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-xs font-medium transition-all"
              title="Export complete plan as JSON or print summary"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Export</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
