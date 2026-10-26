import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  GitCompare,
  AlertTriangle,
  Users,
  Calendar,
  IndianRupee,
  CheckCircle2,
  Zap,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { EventProfile, BudgetItem, TimelineTask, PlanRevisionAnalysis } from '../../types';
import { analyzePlanRevision } from '../../utils/calculations';
import { formatCurrency } from '../../utils/currency';

interface PlanRevisionSimulatorProps {
  profile: EventProfile;
  budgetItems: BudgetItem[];
  timeline: TimelineTask[];
  onApplyRevisedPlan: (
    revisedProfile: EventProfile,
    revisedBudget: BudgetItem[],
    analysisNotes: string
  ) => void;
}

export const PlanRevisionSimulator: React.FC<PlanRevisionSimulatorProps> = ({
  profile,
  budgetItems,
  timeline,
  onApplyRevisedPlan,
}) => {
  // Start at neutral baseline (0 change) so clicking the stress button has an obvious visual impact
  const [guestDelta, setGuestDelta] = useState<number>(0);
  const [budgetDeltaPercent, setBudgetDeltaPercent] = useState<number>(0);
  const [dateShiftWeeks, setDateShiftWeeks] = useState<number>(0);
  const [scenarioNotification, setScenarioNotification] = useState<string | null>(null);

  // Active analysis results
  const [analysis, setAnalysis] = useState<PlanRevisionAnalysis>(() =>
    analyzePlanRevision(profile, budgetItems, timeline, {
      guestDelta: 0,
      budgetDeltaPercent: 0,
      dateShiftWeeks: 0,
    })
  );

  const handleRunAnalysis = (gDelta: number, bDelta: number, dShift: number) => {
    const res = analyzePlanRevision(profile, budgetItems, timeline, {
      guestDelta: gDelta,
      budgetDeltaPercent: bDelta,
      dateShiftWeeks: dShift,
    });
    setAnalysis(res);
  };

  const handleLoadStressScenario = () => {
    setGuestDelta(50);
    setBudgetDeltaPercent(-15);
    setDateShiftWeeks(-2);
    handleRunAnalysis(50, -15, -2);
    setScenarioNotification(
      '⚡ Stress Scenario Activated: +50 Guests, -15% Budget, -2 Weeks Prep Window. Ripple effects recalculated!'
    );
    try {
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    } catch {
      // safe fallback
    }
  };

  const handleResetToBaseline = () => {
    setGuestDelta(0);
    setBudgetDeltaPercent(0);
    setDateShiftWeeks(0);
    handleRunAnalysis(0, 0, 0);
    setScenarioNotification('↺ Reverted to baseline plan specifications.');
  };

  const handleApply = () => {
    const revisedProfile: EventProfile = {
      ...profile,
      guestCount: Math.max(10, profile.guestCount + analysis.guestCountDelta),
      totalBudget: Math.max(10000, profile.totalBudget + analysis.budgetDelta),
      targetDate: new Date(
        new Date(profile.targetDate).getTime() + analysis.dateShiftWeeks * 7 * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split('T')[0],
      updatedAt: new Date().toISOString(),
    };

    const notes = `Revised plan applied: Guests ${analysis.guestCountDelta > 0 ? '+' : ''}${analysis.guestCountDelta}, Budget ${analysis.budgetDelta >= 0 ? '+' : ''}${analysis.budgetDelta}, Date shift: ${analysis.dateShiftWeeks} wks.`;
    onApplyRevisedPlan(revisedProfile, analysis.newBudgetBreakdown, notes);
  };

  const isScenarioActive = guestDelta !== 0 || budgetDeltaPercent !== 0 || dateShiftWeeks !== 0;

  const currentTotalBudget = profile.totalBudget;
  const newTotalBudget = Math.max(
    10000,
    Math.round(profile.totalBudget * (1 + budgetDeltaPercent / 100))
  );
  const newGuestCount = Math.max(10, profile.guestCount + guestDelta);

  const oldPerGuest = Math.round(currentTotalBudget / Math.max(profile.guestCount, 1));
  const newPerGuest = Math.round(newTotalBudget / Math.max(newGuestCount, 1));

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Banner explaining the Adaptive Revision Engine */}
      <div
        className={`p-5 rounded-2xl border shadow-xs transition-all ${
          isScenarioActive
            ? 'bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-purple-500/15 border-amber-300'
            : 'bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div
              className={`p-2.5 rounded-xl text-white shadow-xs ${isScenarioActive ? 'bg-amber-600' : 'bg-purple-600'}`}
            >
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-900 text-sm">
                  Mid-Flight Plan Revision & Ripple Effect Simulator
                </h3>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    isScenarioActive
                      ? 'bg-amber-200 text-amber-950'
                      : 'bg-purple-100 text-purple-800'
                  }`}
                >
                  {isScenarioActive ? 'Stress Scenario Active' : 'Baseline Active'}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {isScenarioActive
                  ? 'Simulating mid-flight shift: recalculating per-guest allocations, venue capacities, and timeline deadlines dynamically without restarting from scratch.'
                  : 'Currently showing baseline event plan. Click the button below to test how the AI dynamically rebalances when requirements pivot mid-stream.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isScenarioActive && (
              <button
                onClick={handleResetToBaseline}
                className="flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-300 transition-colors shadow-2xs"
                title="Reset sliders back to baseline"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            )}

            <button
              onClick={handleLoadStressScenario}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:opacity-95 text-white font-extrabold text-xs rounded-xl shadow-md shadow-fuchsia-200 transition-all active:scale-95"
            >
              <Zap className="w-4 h-4" />
              <span>Load Stress Scenario (+50G, -15%, -2W)</span>
            </button>
          </div>
        </div>

        {/* Dynamic Notification Banner when button is clicked */}
        {scenarioNotification && (
          <div className="mt-3 p-3 bg-white/90 border border-amber-300/80 rounded-xl text-xs text-amber-950 font-semibold flex items-center justify-between animate-fade-in shadow-2xs">
            <span className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
              {scenarioNotification}
            </span>
            <button
              onClick={() => setScenarioNotification(null)}
              className="text-[11px] text-slate-500 hover:text-slate-800"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>

      {/* Scenario Controls Box */}
      <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <GitCompare className="w-4 h-4 text-purple-600" />
            Interactive Change Parameters (Drag sliders or use preset):
          </h4>
          <span className="text-[11px] text-slate-500">Real-time constraint rebalancing</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Parameter 1: Guest Count Shift */}
          <div
            className={`p-4 rounded-xl border space-y-2 transition-all ${
              guestDelta !== 0 ? 'bg-amber-50/70 border-amber-300' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-blue-600" /> Guest Count Shift
              </span>
              <span
                className={`font-mono font-extrabold text-sm ${guestDelta > 0 ? 'text-amber-700' : guestDelta < 0 ? 'text-blue-700' : 'text-slate-700'}`}
              >
                {guestDelta > 0 ? `+${guestDelta}` : guestDelta} Guests
              </span>
            </div>
            <input
              id="revision-guest-delta"
              type="range"
              min="-100"
              max="200"
              step="10"
              value={guestDelta}
              aria-label="Simulated guest count shift"
              aria-valuenow={guestDelta}
              aria-valuemin={-100}
              aria-valuemax={200}
              onChange={(e) => {
                const val = Number(e.target.value);
                setGuestDelta(val);
                handleRunAnalysis(val, budgetDeltaPercent, dateShiftWeeks);
              }}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-medium">
              <span>Original: {profile.guestCount}</span>
              <span className="font-bold text-slate-800">New Total: {newGuestCount}</span>
            </div>
          </div>

          {/* Parameter 2: Budget Shift */}
          <div
            className={`p-4 rounded-xl border space-y-2 transition-all ${
              budgetDeltaPercent !== 0
                ? 'bg-rose-50/70 border-rose-300'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <IndianRupee className="w-3.5 h-3.5 text-purple-600" /> Target Budget Shift
              </span>
              <span
                className={`font-mono font-extrabold text-sm ${budgetDeltaPercent < 0 ? 'text-rose-600' : budgetDeltaPercent > 0 ? 'text-emerald-700' : 'text-slate-700'}`}
              >
                {budgetDeltaPercent > 0 ? `+${budgetDeltaPercent}` : budgetDeltaPercent}%
              </span>
            </div>
            <input
              id="revision-budget-delta"
              type="range"
              min="-40"
              max="50"
              step="5"
              value={budgetDeltaPercent}
              aria-label="Simulated budget percentage shift"
              aria-valuenow={budgetDeltaPercent}
              aria-valuemin={-40}
              aria-valuemax={50}
              onChange={(e) => {
                const val = Number(e.target.value);
                setBudgetDeltaPercent(val);
                handleRunAnalysis(guestDelta, val, dateShiftWeeks);
              }}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-medium">
              <span>{formatCurrency(currentTotalBudget, profile.currency, true)}</span>
              <span className="font-bold text-slate-800">
                {formatCurrency(newTotalBudget, profile.currency, true)}
              </span>
            </div>
          </div>

          {/* Parameter 3: Date Compression */}
          <div
            className={`p-4 rounded-xl border space-y-2 transition-all ${
              dateShiftWeeks !== 0
                ? 'bg-purple-50/70 border-purple-300'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-rose-600" /> Date Shift
              </span>
              <span
                className={`font-mono font-extrabold text-sm ${dateShiftWeeks < 0 ? 'text-rose-600' : dateShiftWeeks > 0 ? 'text-emerald-700' : 'text-slate-700'}`}
              >
                {dateShiftWeeks < 0
                  ? `${Math.abs(dateShiftWeeks)} Wks Earlier`
                  : dateShiftWeeks > 0
                    ? `+${dateShiftWeeks} Wks Later`
                    : 'No Date Shift'}
              </span>
            </div>
            <input
              id="revision-date-shift"
              type="range"
              min="-6"
              max="6"
              step="1"
              value={dateShiftWeeks}
              aria-label="Simulated timeline shift in weeks"
              aria-valuenow={dateShiftWeeks}
              aria-valuemin={-6}
              aria-valuemax={6}
              onChange={(e) => {
                const val = Number(e.target.value);
                setDateShiftWeeks(val);
                handleRunAnalysis(guestDelta, budgetDeltaPercent, val);
              }}
              className="w-full accent-purple-600 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-500 font-medium">
              <span>Target: {profile.targetDate}</span>
              <span className="font-bold text-slate-800">
                {dateShiftWeeks < 0
                  ? `-${Math.abs(dateShiftWeeks) * 7}d crunch`
                  : dateShiftWeeks > 0
                    ? `+${dateShiftWeeks * 7}d buffer`
                    : 'Same Date'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* METRIC DELTA COMPARISON BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">
              Headcount Capacity
            </span>
            <div className="text-lg font-black text-slate-900 mt-0.5">
              {profile.guestCount} →{' '}
              <span className={guestDelta > 0 ? 'text-purple-700' : 'text-slate-800'}>
                {newGuestCount}
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              {guestDelta > 0
                ? `+${guestDelta} additional attendees`
                : guestDelta < 0
                  ? `${guestDelta} attendees`
                  : 'Baseline headcount'}
            </span>
          </div>
          <div className="text-xl">👥</div>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase">Budget Pool</span>
            <div className="text-lg font-black text-slate-900 mt-0.5">
              {formatCurrency(currentTotalBudget, profile.currency, true)} →{' '}
              <span
                className={
                  budgetDeltaPercent < 0
                    ? 'text-rose-600'
                    : budgetDeltaPercent > 0
                      ? 'text-emerald-700'
                      : 'text-slate-800'
                }
              >
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
              <span
                className={
                  newPerGuest < oldPerGuest ? 'text-amber-600 font-bold' : 'text-slate-800'
                }
              >
                {formatCurrency(newPerGuest, profile.currency)}
              </span>
            </div>
            <span className="text-[11px] text-slate-500">
              {newPerGuest < oldPerGuest
                ? 'Variable item squeeze'
                : newPerGuest > oldPerGuest
                  ? 'Expanded headroom'
                  : 'Equal to baseline'}
            </span>
          </div>
          <div className="text-xl">📉</div>
        </div>
      </div>

      {/* RIPPLE EFFECT ANALYSIS CARDS */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Detected Ripple Effects & Recommended Mitigations ({analysis.impacts.length}):
          </h4>
          {!isScenarioActive && (
            <span className="text-[11px] text-slate-400">
              (Move sliders or load stress scenario above to see ripple warnings)
            </span>
          )}
        </div>

        {analysis.impacts.length === 0 ? (
          <div className="p-6 bg-slate-50 rounded-2xl border border-slate-200 text-center text-slate-500 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <span className="font-bold text-slate-700 block">Baseline Plan Stable</span>
            <span>
              No shifts applied. Click <strong>"Load Stress Scenario"</strong> above to test how
              EventCraft AI rebalances unexpected changes.
            </span>
          </div>
        ) : (
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
                <div
                  key={impact.id}
                  className={`p-4 rounded-2xl border shadow-2xs space-y-2 ${severityStyle} animate-fade-in`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs">{impact.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${badgeStyle}`}
                    >
                      {impact.severity}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed opacity-90">{impact.description}</p>
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
        )}
      </div>

      {/* APPLY REVISED PLAN ACTION BAR */}
      <div className="p-5 bg-white rounded-2xl border border-purple-200 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-extrabold text-slate-900">Adopt Rebalanced Plan</h4>
          <p className="text-xs text-slate-500 mt-0.5">
            Applies the recalculated budget items and updates affected milestones in the roadmap
            without losing previous customizations.
          </p>
        </div>

        <button
          onClick={handleApply}
          disabled={!isScenarioActive}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-pink-600 hover:opacity-95 text-white font-extrabold text-xs rounded-xl shadow-md shadow-fuchsia-200 transition-all shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <CheckCircle2 className="w-4 h-4" />
          Apply Revised Plan to Event
        </button>
      </div>
    </div>
  );
};
