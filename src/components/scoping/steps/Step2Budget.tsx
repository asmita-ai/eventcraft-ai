import React from 'react';
import { IndianRupee, Users } from 'lucide-react';
import { CurrencyCode, ExperienceTier } from '../../../types';

interface Step2BudgetProps {
  totalBudget: number;
  setTotalBudget: (b: number) => void;
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  guestCount: number;
  setGuestCount: (g: number) => void;
  experienceTier: ExperienceTier;
  setExperienceTier: (tier: ExperienceTier) => void;
}

export const Step2Budget: React.FC<Step2BudgetProps> = ({
  totalBudget,
  setTotalBudget,
  currency,
  setCurrency,
  guestCount,
  setGuestCount,
  experienceTier,
  setExperienceTier,
}) => {
  return (
    <div className="space-y-5 animate-fade-in">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="wizard-total-budget"
            className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between"
          >
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
          <label
            htmlFor="wizard-guest-count"
            className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5"
          >
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
            Average allocated per guest: ~{currency}{' '}
            {Math.round(totalBudget / Math.max(guestCount, 1))}
          </p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
          Experience Tier
        </label>
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              id: 'budget-smart' as const,
              label: 'Budget-Smart',
              desc: 'Focus on essentials & DIY charm',
            },
            {
              id: 'balanced-comfort' as const,
              label: 'Balanced Comfort',
              desc: 'Premium food, curated decor',
            },
            {
              id: 'premium-luxury' as const,
              label: 'Premium Luxury',
              desc: 'Bespoke setups & lavish hospitality',
            },
          ].map((tier) => (
            <button
              key={tier.id}
              type="button"
              onClick={() => setExperienceTier(tier.id)}
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
  );
};
