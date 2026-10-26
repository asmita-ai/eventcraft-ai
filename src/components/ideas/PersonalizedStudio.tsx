import React, { useState } from 'react';
import { 
  Sparkles, 
  Heart, 
  Smile, 
  Accessibility, 
  UtensilsCrossed, 
  Palette, 
  Tag, 
  MessageSquare
} from 'lucide-react';
import { EventProfile, PersonalizedIdea } from '../../types';
import { sanitizeString } from '../../utils/security';

interface PersonalizedStudioProps {
  profile: EventProfile;
  ideas: PersonalizedIdea[];
  onToggleFavorite: (ideaId: string) => void;
  onRefineWithAI: (conceptTitle: string, userFeedback: string) => void;
}

export const PersonalizedStudio: React.FC<PersonalizedStudioProps> = ({
  profile,
  ideas,
  onToggleFavorite,
  onRefineWithAI,
}) => {
  const [filter, setFilter] = useState<string>('all');
  const [activeFeedbackId, setActiveFeedbackId] = useState<string | null>(null);
  const [feedbackText, setFeedbackText] = useState<string>('');

  const d = profile.demographics;

  const categoryIcons: Record<string, React.ReactNode> = {
    theme: <Palette className="w-4 h-4 text-purple-600" />,
    food: <UtensilsCrossed className="w-4 h-4 text-amber-600" />,
    activities: <Smile className="w-4 h-4 text-emerald-600" />,
    accessibility: <Accessibility className="w-4 h-4 text-blue-600" />,
    decor: <Tag className="w-4 h-4 text-pink-600" />,
  };

  const filteredIdeas = filter === 'all'
    ? ideas
    : filter === 'favorites'
    ? ideas.filter((i) => i.favorited)
    : ideas.filter((i) => i.category === filter);

  const handleSendFeedback = (title: string) => {
    const cleanFeedback = sanitizeString(feedbackText, 300);
    if (!cleanFeedback) return;
    onRefineWithAI(title, cleanFeedback);
    setFeedbackText('');
    setActiveFeedbackId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Audience Demographics Header Banner */}
      <div className="p-5 bg-gradient-to-r from-purple-50 via-pink-50 to-amber-50 rounded-2xl border border-purple-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <h3 className="text-base font-bold text-slate-900">
              Personalized Concepts & Demographic Adaptation
            </h3>
          </div>
          <span className="text-xs font-bold text-purple-800 bg-white px-2.5 py-1 rounded-full border border-purple-200">
            {profile.occasion}
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          A truly memorable celebration is tailored specifically to the humans in attendance. These concepts are calibrated to your specific audience mix:
        </p>

        {/* Demographics Pill Bar */}
        <div className="flex flex-wrap gap-2 pt-1 text-xs">
          <span className="px-3 py-1 bg-white rounded-xl border border-purple-200 text-purple-900 font-semibold flex items-center gap-1.5">
            👶 Children: {d.childrenPercent}%
          </span>
          <span className="px-3 py-1 bg-white rounded-xl border border-blue-200 text-blue-900 font-semibold flex items-center gap-1.5">
            👴 Seniors: {d.elderlyPercent}%
          </span>
          <span className="px-3 py-1 bg-white rounded-xl border border-amber-200 text-amber-900 font-semibold flex items-center gap-1.5">
            🏛️ Heritage: {d.culturalBackground}
          </span>
          {d.dietaryRestrictions.map((diet, i) => (
            <span key={i} className="px-3 py-1 bg-white rounded-xl border border-emerald-200 text-emerald-900 font-medium">
              🥗 {diet}
            </span>
          ))}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        {['all', 'favorites', 'accessibility', 'food', 'activities', 'theme'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-xl capitalize transition-all ${
              filter === f
                ? 'bg-purple-600 text-white shadow-xs font-bold'
                : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {f === 'favorites' ? '⭐ Favorites' : f}
          </button>
        ))}
      </div>

      {/* Ideas Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredIdeas.map((idea) => {
          const isFeedbackOpen = activeFeedbackId === idea.id;

          return (
            <div
              key={idea.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                
                {/* Header */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-xl bg-slate-50 border border-slate-200">
                      {categoryIcons[idea.category] || <Sparkles className="w-4 h-4 text-purple-600" />}
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        {idea.category} Concept
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-900">
                        {idea.title}
                      </h4>
                    </div>
                  </div>

                  <button
                    onClick={() => onToggleFavorite(idea.id)}
                    aria-label="Favorite idea"
                    className={`p-2 rounded-xl transition-colors ${
                      idea.favorited ? 'text-rose-600 bg-rose-50' : 'text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${idea.favorited ? 'fill-rose-600' : ''}`} />
                  </button>
                </div>

                {/* Concept Narrative */}
                <p className="text-xs text-slate-700 leading-relaxed">
                  {idea.concept}
                </p>

                {/* Why it fits this audience */}
                <div className="p-2.5 bg-purple-50/70 border border-purple-200/60 rounded-xl text-[11px] text-purple-950 font-medium">
                  🎯 <strong>Demographic Fit:</strong> {idea.whyItFitsThisAudience}
                </div>

                {/* Budget-Friendly Alternative */}
                <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl text-[11px] space-y-1">
                  <div className="flex items-center justify-between text-amber-950 font-bold">
                    <span>💡 Budget-Friendly Alternative:</span>
                    <span className="font-mono text-[10px]">{idea.estimatedCostRange}</span>
                  </div>
                  <p className="text-amber-900 leading-relaxed">
                    {idea.budgetFriendlyAlternative}
                  </p>
                </div>

              </div>

              {/* Bottom Actions */}
              <div className="pt-2 border-t border-slate-100 space-y-2">
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setActiveFeedbackId(isFeedbackOpen ? null : idea.id)}
                    className="text-xs font-semibold text-purple-700 hover:text-purple-900 flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{isFeedbackOpen ? 'Close Feedback' : 'Refine or Adapt with AI'}</span>
                  </button>

                  <span className="text-[11px] font-semibold text-slate-500">
                    Est: {idea.estimatedCostRange}
                  </span>
                </div>

                {/* Feedback Input Box */}
                {isFeedbackOpen && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2 animate-fade-in">
                    <input
                      type="text"
                      placeholder="e.g. 'I love this, but can we adapt it for rainy weather?'"
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-xs"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleSendFeedback(idea.title)}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold"
                      >
                        Submit Feedback
                      </button>
                    </div>
                  </div>
                )}
              </div>

            </div>
          );
        })}
      </div>

    </div>
  );
};
