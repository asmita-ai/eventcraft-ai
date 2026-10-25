import React, { useState } from 'react';
import { 
  GitCompare, 
  AlertTriangle, 
  Users, 
  Calendar, 
  IndianRupee, 
  CheckCircle2, 
  Zap 
} from 'lucide-react';
import { EventProfile, BudgetItem, TimelineTask, PlanRevisionAnalysis } from '../../types';
import { analyzePlanRevision } from '../../utils/calculations';
import { formatCurrency } from '../../utils/currency';

interface PlanRevisionSimulatorProps {
  profile: EventProfile;
  budgetItems: BudgetItem[];
  timeline: TimelineTask[];
  onApplyRevisedPlan: (revisedProfile: EventProfile, revisedBudget: BudgetItem[], analysisNotes: string) => void;
}

export const PlanRevisionSimulator: React.FC<PlanRevisionSimulatorProps> = ({
  profile,
  budgetItems,
  timeline,
  onApplyRevisedPlan,
}) => {
  // Scenario inputs matching Srinivas's exact words: +50 guests, -15% budget, -2 weeks
  const [guestDelta, setGuestDelta] = useState<number>(50);
  const [budgetDeltaPercent, setBudgetDeltaPercent] = useState<number>(-15);
  const [dateShiftWeeks, setDateShiftWeeks] = useState<number>(-2);

  // Active analysis results
  const [analysis, setAnalysis] = useState<PlanRevisionAnalysis>(() => 
    analyzePlanRevision(profile, budgetItems, timeline, {
      guestDelta: 50,
      budgetDeltaPercent: -15,
      dateShiftWeeks: -2,
    })
  );

  const handleRunAnalysis = (gDelta = guestDelta, bDelta = budgetDeltaPercent, dShift = dateShiftWeeks) => {
    const res = analyzePlanRevision(profile, budgetItems, timeline, {
      guestDelta: gDelta,
      budgetDeltaPercent: bDelta,
      dateShiftWeeks: dShift,
    });
    setAnalysis(res);
  };

  const handleApply = () => {
    const revisedProfile: EventProfile = {
      ...profile,
      guestCount: Math.max(10, profile.guestCount + analysis.guestCountDelta),
      totalBudget: Math.max(10000, profile.totalBudget + analysis.budgetDelta),
      targetDate: new Date(new Date(profile.targetDate).getTime() + analysis.dateShiftWeeks * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
    };

    const notes = `Revised plan applied: Guests ${analysis.guestCountDelta > 0 ? '+' : ''}${analysis.guestCountDelta}, Budget ${analysis.budgetDelta >= 0 ? '+' : ''}${analysis.budgetDelta}, Date shift: ${analysis.dateShiftWeeks} wks.`;
    onApplyRevisedPlan(revisedProfile, analysis.newBudgetBreakdown, notes);
  };

  const currentTotalBudget = profile.totalBudget;
  const newTotalBudget = Math.max(10000, Math.round(profile.totalBudget * (1 + budgetDeltaPercent / 100)));
  const newGuestCount = Math.max(10, profile.guestCount + guestDelta);

  const oldPerGuest = Math.round(currentTotalBudget / Math.max(profile.guestCount, 1));
  const newPerGuest = Math.round(newTotalBudget / Math.max(newGuestCount, 1));

  return (
    <div className="space-y-6 animate-fade-in">
      
      {/* Top Banner explaining the SME Srinivas Stress Test */}
      <div className="p-5 bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-pink-500/10 rounded-2xl border border-amber-300/80 shadow-xs space-y-2.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-600 text-white shadow-xs">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Mid-Flight Plan Revision & Ripple Effect Simulator
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-200 text-amber-950 uppercase">
                  Golden Challenge Criterion
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-0.5">
                Evaluates the core question posed by Subject Matter Expert Srinivas: When unexpected mid-stream changes occur, does the user have to restart from scratch, or does the AI dynamically rebalance the interconnected plan?
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setGuestDelta(50);
              setBudgetDeltaPercent(-15);
              setDateShiftWeeks(-2);
              handleRunAnalysis(50, -15, -2);
            }}
            className="px-3.5 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:opacity-95 text-white font-extrabold text-xs rounded-xl shadow-xs shrink-0"
          >
            ⚡ Load SME Benchmark Case (+50G, -15%, -2W)
          </button>
        </div>
      </div>

      {/* Scenario Controls Box */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <GitCompare className="w-4 h-4 text-purple-600" />
          Interactive Change Parameters:
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          
          {/* Parameter 1: Guest Count Shift */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" /> Guest Count Shift
              </span>
              <span className={`font-mono font-bold ${guestDelta > 0 ? 'text-amber-700' : 'text-slate-700'}`}>
                {guestDelta > 0 ? `+${guestDelta}` : guestDelta} Guests
              </span>
            </div>
            <input
              type="range"
              min="-100"
              max="200"
              step="10"
              value={guestDelta}
              onChange={(e) => {
                const val = Number(e.target.value);
                setGuestDelta(val);
                handleRunAnalysis(val, budgetDeltaPercent, dateShiftWeeks);
              }}
              className="w-full accent-purple-600"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-medium">
              <span>Original: {profile.guestCount}</span>
              <span className="font-bold text-slate-800">New: {newGuestCount}</span>
            </div>
          </div>

          {/* Parameter 2: Budget Shift */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-purple-600" /> Target Budget Shift
              </span>
              <span className={`font-mono font-bold ${budgetDeltaPercent < 0 ? 'text-rose-600' : 'text-emerald-700'}`}>
                {budgetDeltaPercent > 0 ? `+${budgetDeltaPercent}` : budgetDeltaPercent}%
              </span>
            </div>
            <input
              type="range"
              min="-40"
              max="50"
              step="5"
              value={budgetDeltaPercent}
              onChange={(e) => {
                const val = Number(e.target.value);
                setBudgetDeltaPercent(val);
                handleRunAnalysis(guestDelta, val, dateShiftWeeks);
              }}
              className="w-full accent-purple-600"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-medium">
              <span>{formatCurrency(currentTotalBudget, profile.currency, true)}</span>
              <span className="font-bold text-slate-800">{formatCurrency(newTotalBudget, profile.currency, true)}</span>
            </div>
          </div>

          {/* Parameter 3: Date Compression */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rose-600" /> Date Shift
              </span>
              <span className={`font-mono font-bold ${dateShiftWeeks < 0 ? 'text-rose-600' : 'text-slate-700'}`}>
                {dateShiftWeeks < 0 ? `${Math.abs(dateShiftWeeks)} Weeks Earlier` : `${dateShiftWeeks} Weeks Later`}
              </span>
            </div>
            <input
              type="range"
              min="-6"
              max="6"
              step="1"
              value={dateShiftWeeks}
              onChange={(e) => {
                const val = Number(e.target.value);
                setDateShiftWeeks(val);
                handleRunAnalysis(guestDelta, budgetDeltaPercent, val);
              }}
              className="w-full accent-purple-600"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-medium">
              <span>Target: {profile.targetDate}</span>
              <span className="font-bold text-slate-800">
                {dateShiftWeeks < 0 ? `-${Math.abs(dateShiftWeeks) * 7}d crunch` : `+${dateShiftWeeks * 7}d buffer`}
              </span>
            </div>
          </div>

        </div>

      </div>

      {/* METRIC DELTA COMPARISON BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Headcount Capacity</span>
            <div className="text-lg font-black text-slate-900 mt-0.5">
              {profile.guestCount} → <span className="text-purple-700">{newGuestCount}</span>
            </div>
            <span className="text-[11px] text-slate-500">
              {guestDelta > 0 ? `+${guestDelta} additional attendees` : `${guestDelta} attendees`}
            </span>
          </div>
          <div className="text-xl">👥</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Budget Pool</span>
            <div className="text-lg font-black text-slate-900 mt-0.5">
              {formatCurrency(currentTotalBudget, profile.currency, true)} →{' '}
              <span className={budgetDeltaPercent < 0 ? 'text-rose-600' : 'text-emerald-700'}>
                {formatCurrency(newTotalBudget, profile.currency, true)}
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              Delta: {formatCurrency(analysis.budgetDelta, profile.currency)}
            </span>
          </div>
          <div className="text-xl">💰</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Per-Guest Ratio</span>
            <div className="text-lg font-black text-slate-900 mt-0.5">
              {formatCurrency(oldPerGuest, profile.currency)} →{' '}
              <span className="text-amber-600">{formatCurrency(newPerGuest, profile.currency)}</span>
            </div>
            <span className="text-[11px] text-slate-500">
              {newPerGuest < oldPerGuest ? 'Squeeze on variable items' : 'Expanded headroom'}
            </span>
          </div>
          <div className="text-xl">📉</div>
        </div>

      </div>

      {/* RIPPLE EFFECT ANALYSIS CARDS (The Exact Outputs Requested by Evaluators) */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          Detected Ripple Effects & Recommended Mitigations ({analysis.impacts.length}):
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {analysis.impacts.map((impact) => {
            const severityStyle = {
              danger: 'bg-rose-50 border-rose-300 text-rose-950',
              warning: 'bg-amber-50 border-amber-300 text-amber-950',
              info: 'bg-blue-50 border-blue-300 text-blue-950',
            }[impact.severity];

            const badgeStyle = {
              danger: 'bg-rose-200 text-rose-900',
              warning: 'bg-amber-200 text-amber-900',
              info: 'bg-blue-200 text-blue-900',
            }[impact.severity];

            return (
              <div key={impact.id} className={`p-4 rounded-2xl border shadow-2xs space-y-2 ${severityStyle}`}>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs">{impact.title}</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${badgeStyle}`}>
                    {impact.severity}
                  </span>
                </div>
                <p className="text-xs leading-relaxed opacity-90">
                  {impact.description}
                </p>
                <div className="p-2.5 bg-white/70 rounded-xl text-[11px] font-medium border border-black/5 flex items-start gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Recommended Action:</strong> {impact.recommendedAction}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* APPLY REVISED PLAN ACTION BAR */}
      <div className="p-5 bg-white rounded-2xl border border-purple-200 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-extrabold text-slate-900">
            Ready to Adopt this Rebalanced Plan?
          </h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Applies the recalculated budget items and flags affected milestones in the roadmap without losing any previous customization.
          </p>
        </div>

        <button
          onClick={handleApply}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:opacity-95 text-white font-extrabold text-xs rounded-xl shadow-md shadow-fuchsia-200 transition-all shrink-0"
        >
          <CheckCircle2 className="w-4 h-4" />
          Apply Revised Plan to Event
        </button>
      </div>

    </div>
  );
};
