import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Calendar, 
  MapPin, 
  Users, 
  IndianRupee, 
  ArrowRight, 
  ArrowLeft, 
  X 
} from 'lucide-react';
import { EventProfile, EventType, ExperienceTier, CurrencyCode } from '../../types';
import { WEDDING_PRESET, BIRTHDAY_PRESET, COMMUNITY_PRESET } from '../../services/heuristicGenerator';
import { sanitizeString, validateEventConstraints } from '../../utils/security';

interface ScopingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onGeneratePlan: (profile: EventProfile) => void;
  isLoading: boolean;
}

export const ScopingWizard: React.FC<ScopingWizardProps> = ({
  isOpen,
  onClose,
  onGeneratePlan,
  isLoading,
}) => {
  const [step, setStep] = useState<number>(1);

  // Form State
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [title, setTitle] = useState<string>('My Dream Celebration');
  const [occasion, setOccasion] = useState<string>('Grand Wedding Celebration');
  const [targetDate, setTargetDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 100);
    return d.toISOString().split('T')[0];
  });
  const [city, setCity] = useState<string>('Bengaluru');
  const [totalBudget, setTotalBudget] = useState<number>(800000);
  const [currency, setCurrency] = useState<CurrencyCode>('INR');
  const [guestCount, setGuestCount] = useState<number>(200);
  const [experienceTier, setExperienceTier] = useState<ExperienceTier>('balanced-comfort');

  // Priorities (1 to 5 scale)
  const [priorities, setPriorities] = useState({
    catering: 5,
    venue: 4,
    decoration: 3,
    photography: 4,
    entertainment: 3,
    contingency: 4,
  });

  // Demographics
  const [childrenPercent, setChildrenPercent] = useState<number>(15);
  const [elderlyPercent, setElderlyPercent] = useState<number>(20);
  const [culturalBackground, setCulturalBackground] = useState<string>('Fusion Traditional');
  const [dietaryList, setDietaryList] = useState<string>('Pure Veg Counters, Jain Options, Live Chaat');
  const [accessibilityList, setAccessibilityList] = useState<string>('Wheelchair access, Senior seating near entrance');

  // Must haves and flexibles
  const [mustHavesInput, setMustHavesInput] = useState<string>('Hot live dessert station, Candid storytelling photography');
  const [flexiblesInput, setFlexiblesInput] = useState<string>('Physical invites (can be digital), Stage floral complexity');

  // Escape key handler for accessible modal dismissal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const loadPresetData = (preset: EventProfile) => {
    setEventType(preset.eventType);
    setTitle(preset.title);
    setOccasion(preset.occasion);
    setTargetDate(preset.targetDate);
    setCity(preset.city);
    setTotalBudget(preset.totalBudget);
    setCurrency(preset.currency);
    setGuestCount(preset.guestCount);
    setExperienceTier(preset.experienceTier);
    setPriorities(preset.priorities);
    setChildrenPercent(preset.demographics.childrenPercent);
    setElderlyPercent(preset.demographics.elderlyPercent);
    setCulturalBackground(preset.demographics.culturalBackground);
    setDietaryList(preset.demographics.dietaryRestrictions.join(', '));
    setAccessibilityList(preset.demographics.accessibilityNeeds.join(', '));
    setMustHavesInput(preset.mustHaves.join(', '));
    setFlexiblesInput(preset.flexibles.join(', '));
  };

  const handleSubmit = () => {
    const validation = validateEventConstraints(totalBudget, guestCount, targetDate);
    if (!validation.isValid) {
      alert(validation.errors.join('\n'));
      return;
    }

    const profile: EventProfile = {
      id: `event-${Date.now()}`,
      title: sanitizeString(title, 100) || 'Custom Celebration',
      eventType,
      occasion: sanitizeString(occasion, 150) || 'Special Gathering',
      targetDate,
      city: sanitizeString(city, 80) || 'Metro City',
      totalBudget,
      currency,
      guestCount,
      experienceTier,
      priorities,
      demographics: {
        childrenPercent,
        elderlyPercent,
        culturalBackground: sanitizeString(culturalBackground, 120),
        dietaryRestrictions: dietaryList.split(',').map((s) => sanitizeString(s, 50)).filter(Boolean),
        accessibilityNeeds: accessibilityList.split(',').map((s) => sanitizeString(s, 50)).filter(Boolean),
      },
      mustHaves: mustHavesInput.split(',').map((s) => sanitizeString(s, 100)).filter(Boolean),
      flexibles: flexiblesInput.split(',').map((s) => sanitizeString(s, 100)).filter(Boolean),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onGeneratePlan(profile);
  };

  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="wizard-modal-title" 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Wizard Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-gradient-to-r from-purple-50 via-fuchsia-50 to-pink-50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-600 rounded-xl text-white shadow-xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 id="wizard-modal-title" className="text-base font-bold text-slate-900">Event Scoping & Intake Wizard</h2>
              <p className="text-xs text-slate-500">Step {step} of 4 — Tailoring your plan constraints</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close wizard"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progress Indicator */}
        <div className="w-full bg-slate-100 h-1.5 flex">
          {[1, 2, 3, 4].map((s) => (
            <div
              key={s}
              className={`flex-1 transition-all duration-300 ${
                s <= step ? 'bg-gradient-to-r from-purple-600 to-pink-500' : 'bg-transparent'
              }`}
            />
          ))}
        </div>

        {/* Wizard Body (Scrollable) */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          
          {/* Quick Preset Buttons on Step 1 */}
          {step === 1 && (
            <div className="p-3.5 bg-purple-50/70 border border-purple-200/60 rounded-xl space-y-2">
              <span className="text-xs font-semibold text-purple-900 block">
                ⚡ Or auto-fill with a challenge preset:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => loadPresetData(WEDDING_PRESET)}
                  className="px-2.5 py-1 text-xs bg-white text-purple-700 font-medium rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors"
                >
                  💍 Wedding (₹8L, 200 Guests)
                </button>
                <button
                  type="button"
                  onClick={() => loadPresetData(BIRTHDAY_PRESET)}
                  className="px-2.5 py-1 text-xs bg-white text-purple-700 font-medium rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors"
                >
                  🎂 50th Birthday (₹1.5L)
                </button>
                <button
                  type="button"
                  onClick={() => loadPresetData(COMMUNITY_PRESET)}
                  className="px-2.5 py-1 text-xs bg-white text-purple-700 font-medium rounded-lg border border-purple-200 hover:bg-purple-100 transition-colors"
                >
                  🎪 Community Fest (₹3.5L)
                </button>
              </div>
            </div>
          )}

          {/* STEP 1: Occasion & Basics */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Event Archetype
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { id: 'wedding', label: 'Wedding / Sangeet', icon: '💍' },
                    { id: 'birthday', label: 'Milestone Birthday', icon: '🎂' },
                    { id: 'community', label: 'Community Festival', icon: '🎪' },
                    { id: 'anniversary', label: 'Anniversary', icon: '🥂' },
                    { id: 'corporate', label: 'Corporate Gala', icon: '💼' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        setEventType(item.id as EventType);
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
                  <label htmlFor="wizard-occasion" className="block text-xs font-semibold text-slate-700 mb-1">
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
                  <label htmlFor="wizard-date" className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
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
                  <label htmlFor="wizard-city" className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
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
          )}

          {/* STEP 2: Scale & Budget Constraints */}
          {step === 2 && (
            <div className="space-y-5 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="wizard-total-budget" className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <IndianRupee className="w-3.5 h-3.5 text-purple-600" />
                      Total Event Target Budget
                    </span>
                    <select
                      aria-label="Currency"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                      className="text-[11px] font-bold border border-slate-300 rounded px-1.5 py-0.5 bg-slate-50"
                    >
                      <option value="INR">INR (₹)</option>
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                    </select>
                  </label>
                  <input
                    id="wizard-total-budget"
                    type="number"
                    min="10000"
                    step="10000"
                    value={totalBudget}
                    onChange={(e) => setTotalBudget(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Example: ₹8,00,000 for standard wedding case.
                  </p>
                </div>

                <div>
                  <label htmlFor="wizard-guest-count" className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-purple-600" />
                    Expected Guest Count
                  </label>
                  <input
                    id="wizard-guest-count"
                    type="number"
                    min="10"
                    max="5000"
                    value={guestCount}
                    onChange={(e) => setGuestCount(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-purple-500"
                  />
                  <p className="text-[11px] text-slate-500 mt-1">
                    Average allocated per guest: ~{currency} {Math.round(totalBudget / Math.max(guestCount, 1))}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Experience Tier
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'budget-smart', label: 'Budget-Smart', desc: 'Focus on essentials & DIY charm' },
                    { id: 'balanced-comfort', label: 'Balanced Comfort', desc: 'Premium food, curated decor' },
                    { id: 'premium-luxury', label: 'Premium Luxury', desc: 'Bespoke setups & lavish hospitality' },
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setExperienceTier(tier.id as ExperienceTier)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        experienceTier === tier.id
                          ? 'border-purple-600 bg-purple-50/80 text-purple-950 font-bold shadow-xs'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="text-xs font-bold">{tier.label}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5 leading-tight">{tier.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Priority Hierarchy (The Core Decision Driver) */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-xs text-purple-900">
                <strong>Why priorities matter:</strong> When trade-offs arise, the system must never cut costs blindly. Weighting these categories directs where the AI invests versus economizes!
              </div>

              <div className="space-y-3">
                {[
                  { key: 'catering', label: '🍲 Food & Beverage (Per-plate quality & live counters)', val: priorities.catering },
                  { key: 'venue', label: '🏛️ Venue & Ambience (Central location, AC banquet, capacity)', val: priorities.venue },
                  { key: 'decoration', label: '🌸 Decor & Stage (Floral arches, photobooth, lighting)', val: priorities.decoration },
                  { key: 'photography', label: '📸 Photography & Cinematography (Candid album & teaser reel)', val: priorities.photography },
                  { key: 'entertainment', label: '🎵 Music & Entertainment (Live DJ, sound, performers)', val: priorities.entertainment },
                ].map((item) => (
                  <div key={item.key} className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4">
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
          )}

          {/* STEP 4: Demographics & Sensitivities */}
          {step === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="wizard-children-pct" className="block text-xs font-semibold text-slate-700 mb-1">
                    Children (% of Guests): {childrenPercent}%
                  </label>
                  <input
                    id="wizard-children-pct"
                    type="range"
                    min="0"
                    max="50"
                    step="5"
                    value={childrenPercent}
                    aria-label="Children percentage of guests"
                    aria-valuenow={childrenPercent}
                    aria-valuemin={0}
                    aria-valuemax={50}
                    onChange={(e) => setChildrenPercent(Number(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                </div>
                <div>
                  <label htmlFor="wizard-elderly-pct" className="block text-xs font-semibold text-slate-700 mb-1">
                    Elderly / Seniors (% of Guests): {elderlyPercent}%
                  </label>
                  <input
                    id="wizard-elderly-pct"
                    type="range"
                    min="0"
                    max="60"
                    step="5"
                    value={elderlyPercent}
                    aria-label="Elderly percentage of guests"
                    aria-valuenow={elderlyPercent}
                    aria-valuemin={0}
                    aria-valuemax={60}
                    onChange={(e) => setElderlyPercent(Number(e.target.value))}
                    className="w-full accent-purple-600"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="wizard-cultural-bg" className="block text-xs font-semibold text-slate-700 mb-1">
                  Cultural / Regional Nuances
                </label>
                <input
                  id="wizard-cultural-bg"
                  type="text"
                  value={culturalBackground}
                  onChange={(e) => setCulturalBackground(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g. Punjabi-South Indian fusion, Bengali traditional, Contemporary secular"
                />
              </div>

              <div>
                <label htmlFor="wizard-dietary-needs" className="block text-xs font-semibold text-slate-700 mb-1">
                  Dietary Restrictions (comma-separated)
                </label>
                <input
                  id="wizard-dietary-needs"
                  type="text"
                  value={dietaryList}
                  onChange={(e) => setDietaryList(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g. Jain food, Vegan options, Nut allergy precautions"
                />
              </div>

              <div>
                <label htmlFor="wizard-accessibility" className="block text-xs font-semibold text-slate-700 mb-1">
                  Accessibility & Comfort Requirements
                </label>
                <input
                  id="wizard-accessibility"
                  type="text"
                  value={accessibilityList}
                  onChange={(e) => setAccessibilityList(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g. Wheelchair ramp, low-noise quiet zone, ground floor seating"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="wizard-must-haves" className="block text-xs font-semibold text-slate-700 mb-1 text-emerald-700">
                    Non-Negotiable Must Haves
                  </label>
                  <textarea
                    id="wizard-must-haves"
                    rows={2}
                    value={mustHavesInput}
                    onChange={(e) => setMustHavesInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500"
                  />
                </div>
                <div>
                  <label htmlFor="wizard-flexibles" className="block text-xs font-semibold text-slate-700 mb-1 text-amber-700">
                    Flexible / Willing to Compromise
                  </label>
                  <textarea
                    id="wizard-flexibles"
                    rows={2}
                    value={flexiblesInput}
                    onChange={(e) => setFlexiblesInput(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-purple-500"
                  />
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Wizard Footer Navigation */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200 rounded-xl transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl transition-colors shadow-xs"
            >
              Next Step <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isLoading}
              onClick={handleSubmit}
              className="flex items-center gap-2 px-6 py-2.5 text-xs font-extrabold text-white bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:opacity-95 rounded-xl transition-all shadow-md shadow-fuchsia-200 disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Orchestrating Plan...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Generate Connected Plan
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
