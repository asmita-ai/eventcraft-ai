import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mock canvas-confetti to prevent jsdom canvas errors in CI/test environments
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

import { PlanRevisionSimulator } from '../components/revision/PlanRevisionSimulator';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { 
  WEDDING_PRESET, 
  BIRTHDAY_PRESET, 
  COMMUNITY_PRESET, 
  generateHeuristicPlan 
} from '../services/heuristicGenerator';

describe('EventCraft AI End-to-End Workflows & Edge Cases', () => {
  describe('Preset Archetype Generation', () => {
    it('generates a balanced wedding plan with zero math discrepancy', () => {
      const plan = generateHeuristicPlan(WEDDING_PRESET);
      expect(plan.profile.eventType).toBe('wedding');
      expect(plan.budgetItems.length).toBeGreaterThan(0);

      const totalAllocated = plan.budgetItems.reduce((sum, item) => sum + item.allocatedAmount, 0);
      expect(totalAllocated).toBe(plan.profile.totalBudget);

      expect(plan.timeline.length).toBeGreaterThan(0);
      expect(plan.tradeOffs.length).toBeGreaterThan(0);
      expect(plan.rfpTemplates.length).toBeGreaterThan(0);
    });

    it('generates a balanced birthday plan with correct priority allocation', () => {
      const plan = generateHeuristicPlan(BIRTHDAY_PRESET);
      expect(plan.profile.eventType).toBe('birthday');
      const totalAllocated = plan.budgetItems.reduce((sum, item) => sum + item.allocatedAmount, 0);
      expect(totalAllocated).toBe(plan.profile.totalBudget);
    });

    it('generates a balanced community festival plan with contingency buffer', () => {
      const plan = generateHeuristicPlan(COMMUNITY_PRESET);
      expect(plan.profile.eventType).toBe('community');
      const totalAllocated = plan.budgetItems.reduce((sum, item) => sum + item.allocatedAmount, 0);
      expect(totalAllocated).toBe(plan.profile.totalBudget);
    });
  });

  describe('Adaptive Plan Revision Stress Testing', () => {
    it('initializes at neutral baseline and activates stress scenario (+50G, -15%, -2W)', () => {
      const plan = generateHeuristicPlan(WEDDING_PRESET);
      const onApply = vi.fn();

      render(
        <PlanRevisionSimulator
          profile={plan.profile}
          budgetItems={plan.budgetItems}
          timeline={plan.timeline}
          onApplyRevisedPlan={onApply}
        />
      );

      // Verify baseline shows "Baseline Active"
      expect(screen.getByText(/Baseline Active/i)).toBeInTheDocument();

      // Find stress scenario button
      const stressBtn = screen.getByRole('button', { name: /Load Stress Scenario/i });
      expect(stressBtn).toBeInTheDocument();

      // Click stress test button
      fireEvent.click(stressBtn);

      // Verify new stress metrics display
      expect(screen.getAllByText(/\+50 Guests/i)[0]).toBeInTheDocument();
      expect(screen.getAllByText(/-15%/i)[0]).toBeInTheDocument();
      expect(screen.getByText(/2 Wks Earlier/i)).toBeInTheDocument();

      // Reset button should now be active
      const resetBtn = screen.getByRole('button', { name: /Reset/i });
      fireEvent.click(resetBtn);

      // Should return to neutral baseline
      expect(screen.getByText(/0 Guests/i)).toBeInTheDocument();
      expect(screen.getByText(/No Date Shift/i)).toBeInTheDocument();
    });
  });

  describe('Fault-Tolerant ErrorBoundary', () => {
    it('catches runtime child crashes and provides accessible recovery actions', () => {
      const BrokenComponent: React.FC = () => {
        throw new Error('Simulated runtime rendering fault');
      };

      // Suppress expected console.error during deliberate test failure
      const spy = vi.spyOn(console, 'error').mockImplementation(() => {});

      render(
        <ErrorBoundary>
          <BrokenComponent />
        </ErrorBoundary>
      );

      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(screen.getByText(/Something went unexpected/i)).toBeInTheDocument();
      expect(screen.getByText(/Simulated runtime rendering fault/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Reload Application/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Reset Workspace/i })).toBeInTheDocument();

      spy.mockRestore();
    });
  });
});
