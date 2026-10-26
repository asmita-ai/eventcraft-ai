import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, ArrowLeft, X } from 'lucide-react';
import { EventProfile, EventType, ExperienceTier, CurrencyCode } from '../../types';
import { sanitizeString, validateEventConstraints } from '../../utils/security';
import { Step1Basics } from './steps/Step1Basics';
import { Step2Budget } from './steps/Step2Budget';
import { Step3Priorities } from './steps/Step3Priorities';
import { Step4Demographics } from './steps/Step4Demographics';

interface ScopingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onGeneratePlan: (profile: EventProfile) => void;
  isLoading: boolean;
}

/**
 * Event Scoping & Intake Wizard Component
 * Modular 4-step wizard for capturing multidimensional event constraints.
 */
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
  const [dietaryList, setDietaryList] = useState<string>(
    'Pure Veg Counters, Jain Options, Live Chaat'
  );
  const [accessibilityList, setAccessibilityList] = useState<string>(
    'Wheelchair access, Senior seating near entrance'
  );

  // Must haves and flexibles
  const [mustHavesInput, setMustHavesInput] = useState<string>(
    'Hot live dessert station, Candid storytelling photography'
  );
  const [flexiblesInput, setFlexiblesInput] = useState<string>(
    'Physical invites (can be digital), Stage floral complexity'
  );

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
        dietaryRestrictions: dietaryList
          .split(',')
          .map((s) => sanitizeString(s, 50))
          .filter(Boolean),
        accessibilityNeeds: accessibilityList
          .split(',')
          .map((s) => sanitizeString(s, 50))
          .filter(Boolean),
      },
      mustHaves: mustHavesInput
        .split(',')
        .map((s) => sanitizeString(s, 100))
        .filter(Boolean),
      flexibles: flexiblesInput
        .split(',')
        .map((s) => sanitizeString(s, 100))
        .filter(Boolean),
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
              <h2 id="wizard-modal-title" className="text-base font-bold text-slate-900">
                Event Scoping & Intake Wizard
              </h2>
              <p className="text-xs text-slate-500">
                Step {step} of 4 — Tailoring your plan constraints
              </p>
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
          {step === 1 && (
            <Step1Basics
              eventType={eventType}
              setEventType={setEventType}
              title={title}
              setTitle={setTitle}
              occasion={occasion}
              setOccasion={setOccasion}
              targetDate={targetDate}
              setTargetDate={setTargetDate}
              city={city}
              setCity={setCity}
              onLoadPreset={loadPresetData}
            />
          )}

          {step === 2 && (
            <Step2Budget
              totalBudget={totalBudget}
              setTotalBudget={setTotalBudget}
              currency={currency}
              setCurrency={setCurrency}
              guestCount={guestCount}
              setGuestCount={setGuestCount}
              experienceTier={experienceTier}
              setExperienceTier={setExperienceTier}
            />
          )}

          {step === 3 && <Step3Priorities priorities={priorities} setPriorities={setPriorities} />}

          {step === 4 && (
            <Step4Demographics
              childrenPercent={childrenPercent}
              setChildrenPercent={setChildrenPercent}
              elderlyPercent={elderlyPercent}
              setElderlyPercent={setElderlyPercent}
              culturalBackground={culturalBackground}
              setCulturalBackground={setCulturalBackground}
              dietaryList={dietaryList}
              setDietaryList={setDietaryList}
              accessibilityList={accessibilityList}
              setAccessibilityList={setAccessibilityList}
              mustHavesInput={mustHavesInput}
              setMustHavesInput={setMustHavesInput}
              flexiblesInput={flexiblesInput}
              setFlexiblesInput={setFlexiblesInput}
            />
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
