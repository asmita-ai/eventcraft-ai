import React from 'react';

interface Step4DemographicsProps {
  childrenPercent: number;
  setChildrenPercent: (p: number) => void;
  elderlyPercent: number;
  setElderlyPercent: (p: number) => void;
  culturalBackground: string;
  setCulturalBackground: (c: string) => void;
  dietaryList: string;
  setDietaryList: (d: string) => void;
  accessibilityList: string;
  setAccessibilityList: (a: string) => void;
  mustHavesInput: string;
  setMustHavesInput: (m: string) => void;
  flexiblesInput: string;
  setFlexiblesInput: (f: string) => void;
}

export const Step4Demographics: React.FC<Step4DemographicsProps> = ({
  childrenPercent,
  setChildrenPercent,
  elderlyPercent,
  setElderlyPercent,
  culturalBackground,
  setCulturalBackground,
  dietaryList,
  setDietaryList,
  accessibilityList,
  setAccessibilityList,
  mustHavesInput,
  setMustHavesInput,
  flexiblesInput,
  setFlexiblesInput,
}) => {
  return (
    <div className="space-y-4 animate-fade-in">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="wizard-children-pct"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
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
          <label
            htmlFor="wizard-elderly-pct"
            className="block text-xs font-semibold text-slate-700 mb-1"
          >
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
        <label
          htmlFor="wizard-cultural-bg"
          className="block text-xs font-semibold text-slate-700 mb-1"
        >
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
        <label
          htmlFor="wizard-dietary-needs"
          className="block text-xs font-semibold text-slate-700 mb-1"
        >
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
        <label
          htmlFor="wizard-accessibility"
          className="block text-xs font-semibold text-slate-700 mb-1"
        >
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
          <label
            htmlFor="wizard-must-haves"
            className="block text-xs font-semibold text-slate-700 mb-1 text-emerald-700"
          >
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
          <label
            htmlFor="wizard-flexibles"
            className="block text-xs font-semibold text-slate-700 mb-1 text-amber-700"
          >
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
  );
};
