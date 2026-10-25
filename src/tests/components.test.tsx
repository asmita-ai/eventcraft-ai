import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Header } from '../components/common/Header';
import { BudgetDashboard } from '../components/budget/BudgetDashboard';
import { TimelineManager } from '../components/timeline/TimelineManager';
import { WEDDING_PRESET, generateHeuristicPlan } from '../services/heuristicGenerator';

describe('EventCraft UI Components & Accessibility', () => {

  const plan = generateHeuristicPlan(WEDDING_PRESET);

  it('renders Header with logo, presets, and accessibility labels', () => {
    render(
      <Header
        currentProfile={plan.profile}
        hasApiKey={false}
        onOpenApiKeyModal={() => {}}
        onOpenJudgeGuide={() => {}}
        onSelectPreset={() => {}}
        onOpenNewWizard={() => {}}
        onExportPlan={() => {}}
      />
    );

    expect(screen.getByText(/EventCraft AI/i)).toBeInTheDocument();
    expect(screen.getByText(/Challenge 5/i)).toBeInTheDocument();
    expect(screen.getByText(/Quota-Safe Mode/i)).toBeInTheDocument();
    expect(screen.getByText(/System Architecture/i)).toBeInTheDocument();
  });

  it('renders BudgetDashboard with categorized expenses and over-budget engine', () => {
    render(
      <BudgetDashboard
        profile={plan.profile}
        budgetItems={plan.budgetItems}
        tradeOffs={plan.tradeOffs}
        onUpdateBudgetItem={() => {}}
        onApplyTradeOff={() => {}}
        onTriggerOverageSimulation={() => {}}
      />
    );

    expect(screen.getByText(/Target Budget/i)).toBeInTheDocument();
    expect(screen.getByText(/Per-Guest Investment/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Catering & Food Service/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText(/Venue & Hall Rental/i).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText(/Priority-Driven Trade-Off Explorer/i)).toBeInTheDocument();
  });

  it('renders TimelineManager with milestones and cascade simulator', () => {
    render(
      <TimelineManager
        tasks={plan.timeline}
        targetDate={plan.profile.targetDate}
        onUpdateTaskStatus={() => {}}
        onSimulateDelay={() => {}}
        onAddTask={() => {}}
      />
    );

    expect(screen.getByText(/Dependency-Aware Execution Roadmap/i)).toBeInTheDocument();
    expect(screen.getByText(/Cascade Ripple Simulator:/i)).toBeInTheDocument();
    expect(screen.getAllByText(/Lock Venue & Contractually Confirm Event Date/i).length).toBeGreaterThanOrEqual(1);
  });

});
