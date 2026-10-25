import React, { useState } from 'react';
import { 
  TrendingUp, 
  CheckCircle2, 
  Info, 
  ArrowRightLeft, 
  Layers 
} from 'lucide-react';
import { EventProfile, BudgetItem, TradeOffSuggestion } from '../../types';
import { formatCurrency } from '../../utils/currency';
import { checkBudgetOverage } from '../../utils/calculations';

interface BudgetDashboardProps {
  profile: EventProfile;
  budgetItems: BudgetItem[];
  tradeOffs: TradeOffSuggestion[];
  onUpdateBudgetItem: (itemId: string, newAmount: number, isEstimate: boolean) => void;
  onApplyTradeOff: (tradeOffId: string) => void;
  onTriggerOverageSimulation: () => void;
}

export const BudgetDashboard: React.FC<BudgetDashboardProps> = ({
  profile,
  budgetItems,
  tradeOffs,
  onUpdateBudgetItem,
  onApplyTradeOff,
  onTriggerOverageSimulation,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tempAmount, setTempAmount] = useState<number>(0);

  const overageCheck = checkBudgetOverage(budgetItems, profile.totalBudget);
  const totalAllocated = overageCheck.totalAllocated;
  const isOver = overageCheck.isOver;
  const percentOver = Math.round(overageCheck.percentOver);
  const perGuestCost = Math.round(totalAllocated / Math.max(profile.guestCount, 1));

  const startEdit = (item: BudgetItem) => {
    setEditingId(item.id);
    setTempAmount(item.actualAmount ?? item.allocatedAmount);
  };

  const saveEdit = (itemId: string, isEstimate: boolean) => {
    onUpdateBudgetItem(itemId, tempAmount, isEstimate);
    setEditingId(null);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Stat Overview Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Target Budget */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Target Budget
            </span>
            <div className="text-xl font-extrabold text-slate-900 mt-1">
              {formatCurrency(profile.totalBudget, profile.currency)}
            </div>
            <span className="text-[11px] text-purple-700 font-medium">
              {profile.experienceTier.replace('-', ' ').toUpperCase()} Tier
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
            ₹
          </div>
        </div>

        {/* Card 2: Total Allocated */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Total Current Plan
            </span>
            <div className={`text-xl font-extrabold mt-1 ${isOver ? 'text-rose-600' : 'text-emerald-700'}`}>
              {formatCurrency(totalAllocated, profile.currency)}
            </div>
            <span className={`text-[11px] font-medium flex items-center gap-1 ${isOver ? 'text-rose-600' : 'text-emerald-700'}`}>
              {isOver ? `+${percentOver}% above target` : `${Math.abs(percentOver)}% under budget`}
            </span>
          </div>
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
            isOver ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-700'
          }`}>
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        {/* Card 3: Per Guest Investment */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Per-Guest Investment
            </span>
            <div className="text-xl font-extrabold text-slate-900 mt-1">
              {formatCurrency(perGuestCost, profile.currency)}
            </div>
            <span className="text-[11px] text-slate-500 font-medium">
              Across {profile.guestCount} attendees
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            👥
          </div>
        </div>

        {/* Card 4: Estimation vs Confirmed Transparency */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Quote Status
            </span>
            <div className="text-sm font-bold text-slate-800 mt-1">
              {budgetItems.filter((i) => !i.isEstimate).length} Confirmed / {budgetItems.length} Total
            </div>
            <span className="text-[10px] text-slate-500 block">
              SME Rule: Clearly flagged estimates
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Info className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Budget Progress Bar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-2">
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-slate-700">Budget Consumption & Distribution</span>
          <span className={isOver ? 'text-rose-600 font-bold' : 'text-slate-600'}>
            {Math.round((totalAllocated / profile.totalBudget) * 100)}% utilized
          </span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
          {budgetItems.map((item, idx) => {
            const pct = (item.allocatedAmount / Math.max(totalAllocated, 1)) * 100;
            const colors = [
              'bg-fuchsia-500',
              'bg-purple-600',
              'bg-pink-500',
              'bg-indigo-500',
              'bg-blue-500',
              'bg-teal-500',
              'bg-amber-500',
              'bg-slate-400',
            ];
            return (
              <div
                key={item.id}
                style={{ width: `${pct}%` }}
                className={`${colors[idx % colors.length]} transition-all duration-500`}
                title={`${item.label}: ${formatCurrency(item.allocatedAmount, profile.currency)} (${Math.round(pct)}%)`}
              />
            );
          })}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-slate-500 pt-1">
          {budgetItems.slice(0, 5).map((item) => (
            <span key={item.id} className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-600" />
              {item.label}: {formatCurrency(item.allocatedAmount, profile.currency, true)}
            </span>
          ))}
        </div>
      </div>

      {/* OVER-BUDGET TRADE-OFF ENGINE (Srinivas Explainer Highlight!) */}
      <div className={`p-5 rounded-2xl border transition-all ${
        isOver
          ? 'bg-rose-50/70 border-rose-200'
          : 'bg-gradient-to-r from-purple-50/60 to-pink-50/60 border-purple-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className={`p-2 rounded-xl text-white ${isOver ? 'bg-rose-600' : 'bg-purple-600'}`}>
              <ArrowRightLeft className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 text-sm">
                  {isOver ? `Over-Budget Detected (+${percentOver}%) — Intelligent Trade-Off Engine` : 'Priority-Driven Trade-Off Explorer'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-purple-100 text-purple-800">
                  SME Srinivas Principle
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                {isOver
                  ? `Your expenses exceed target by ${formatCurrency(overageCheck.diff, profile.currency)}. Instead of blindly slashing costs everywhere, review trade-offs customized to your priorities:`
                  : 'Simulate or apply smart trade-offs to protect your top priorities (e.g. food quality) while trimming non-essentials.'}
              </p>
            </div>
          </div>

          <button
            onClick={onTriggerOverageSimulation}
            className="self-start sm:self-center px-3.5 py-1.5 text-xs font-bold bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 rounded-xl transition-all shadow-2xs whitespace-nowrap"
            title="Simulate 20% over-budget situation as described by Srinivas"
          >
            🧪 Simulate 20% Over-Budget Case
          </button>
        </div>

        {/* Trade-off Recommendations Grid */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
          {tradeOffs.map((tradeoff) => (
            <div
              key={tradeoff.id}
              className={`p-3.5 rounded-xl border bg-white shadow-2xs transition-all flex flex-col justify-between ${
                tradeoff.applied ? 'border-emerald-300 ring-1 ring-emerald-400 bg-emerald-50/40' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">{tradeoff.title}</span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                    Saves ~{formatCurrency(tradeoff.savingsAmount, profile.currency)}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  {tradeoff.impactExplanation}
                </p>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  Impact: <span className="text-slate-700">{tradeoff.impactLevel}</span>
                </span>
                <button
                  onClick={() => onApplyTradeOff(tradeoff.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    tradeoff.applied
                      ? 'bg-emerald-600 text-white'
                      : 'bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200'
                  }`}
                >
                  {tradeoff.applied ? '✓ Applied' : 'Apply Trade-Off'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORY-BY-CATEGORY BREAKDOWN TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-purple-600" />
            <h3 className="text-sm font-bold text-slate-900">Categorized Expense Breakdown</h3>
          </div>
          <span className="text-xs text-slate-500">
            Click any row to adjust amounts or toggle confirmed vendor contract status
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Allocated / Quoted</th>
                <th className="py-3 px-4">Cost / Guest</th>
                <th className="py-3 px-4">Status & Transparency</th>
                <th className="py-3 px-4">Rationale & Assumptions</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {budgetItems.map((item) => {
                const currentVal = item.actualAmount ?? item.allocatedAmount;
                const perGuest = Math.round(currentVal / Math.max(profile.guestCount, 1));
                const isEditing = editingId === item.id;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Category Label */}
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      {item.label}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-extrabold text-slate-900">
                      {isEditing ? (
                        <input
                          type="number"
                          value={tempAmount}
                          onChange={(e) => setTempAmount(Number(e.target.value))}
                          className="w-28 px-2 py-1 border border-purple-500 rounded text-xs font-bold"
                        />
                      ) : (
                        formatCurrency(currentVal, profile.currency)
                      )}
                    </td>

                    {/* Per Guest */}
                    <td className="py-3.5 px-4 text-slate-600 font-medium">
                      {item.isVariableWithGuests ? (
                        <span className="text-purple-700 font-semibold">
                          ~{formatCurrency(perGuest, profile.currency)}/g
                        </span>
                      ) : (
                        <span className="text-slate-400">Fixed pool</span>
                      )}
                    </td>

                    {/* Transparency Tag */}
                    <td className="py-3.5 px-4">
                      {item.isEstimate ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <Info className="w-3 h-3 text-amber-600" />
                          AI Estimate / Assumption
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          Confirmed Vendor Quote
                        </span>
                      )}
                    </td>

                    {/* Notes */}
                    <td className="py-3.5 px-4 text-slate-500 max-w-xs text-[11px] leading-relaxed">
                      {item.notes}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => saveEdit(item.id, false)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[11px] font-bold"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="px-2 py-1 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded text-[11px]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => startEdit(item)}
                          className="px-2.5 py-1 text-purple-700 hover:bg-purple-50 border border-purple-200 rounded font-semibold text-[11px] transition-colors"
                        >
                          Edit Amount
                        </button>
                      )}
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
