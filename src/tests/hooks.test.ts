import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useEventPlan } from '../hooks/useEventPlan';
import { BIRTHDAY_PRESET, COMMUNITY_PRESET } from '../services/heuristicGenerator';

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

describe('useEventPlan Custom Hook Architecture & State Orchestration', () => {
  it('initializes with default wedding preset and active budget tab', () => {
    const { result } = renderHook(() => useEventPlan());
    expect(result.current.currentPlan.profile.eventType).toBe('wedding');
    expect(result.current.currentPlan.profile.totalBudget).toBe(800000);
    expect(result.current.activeTab).toBe('budget');
    expect(result.current.toast).not.toBeNull();
  });

  it('switches celebration archetypes cleanly via selectPreset', () => {
    const { result } = renderHook(() => useEventPlan());

    act(() => {
      result.current.selectPreset(BIRTHDAY_PRESET);
    });

    expect(result.current.currentPlan.profile.eventType).toBe('birthday');
    expect(result.current.currentPlan.profile.totalBudget).toBe(150000);
    expect(result.current.currentPlan.profile.guestCount).toBe(65);

    act(() => {
      result.current.selectPreset(COMMUNITY_PRESET);
    });

    expect(result.current.currentPlan.profile.eventType).toBe('community');
    expect(result.current.currentPlan.profile.guestCount).toBe(350);
  });

  it('updates individual budget item amount and estimate status immutably', () => {
    const { result } = renderHook(() => useEventPlan());
    const firstItem = result.current.currentPlan.budgetItems[0];

    act(() => {
      result.current.updateBudgetItem(firstItem.id, 99999, false);
    });

    const updated = result.current.currentPlan.budgetItems.find((i) => i.id === firstItem.id);
    expect(updated?.actualAmount).toBe(99999);
    expect(updated?.isEstimate).toBe(false);
  });

  it('enacts trade-off compromises and dynamically adjusts category balance', () => {
    const { result } = renderHook(() => useEventPlan());
    const firstTradeOff = result.current.currentPlan.tradeOffs[0];
    const initialApplied = firstTradeOff.applied;

    act(() => {
      result.current.applyTradeOff(firstTradeOff.id);
    });

    const updatedTradeOff = result.current.currentPlan.tradeOffs.find(
      (t) => t.id === firstTradeOff.id
    );
    expect(updatedTradeOff?.applied).toBe(!initialApplied);
  });

  it('simulates 20% over-budget surge across primary categories', () => {
    const { result } = renderHook(() => useEventPlan());
    const cateringItemBefore = result.current.currentPlan.budgetItems.find(
      (i) => i.category === 'catering'
    )!;

    act(() => {
      result.current.triggerOverageSimulation(0.2);
    });

    const cateringItemAfter = result.current.currentPlan.budgetItems.find(
      (i) => i.category === 'catering'
    )!;
    expect(cateringItemAfter.actualAmount).toBe(
      Math.round(cateringItemBefore.allocatedAmount * 1.2)
    );
  });

  it('applies cascade delay ripple calculations cleanly across dependent milestones', () => {
    const { result } = renderHook(() => useEventPlan());
    const venueTask = result.current.currentPlan.timeline.find((t) =>
      t.title.toLowerCase().includes('venue')
    )!;

    act(() => {
      result.current.simulateDelay(venueTask.id, 10);
    });

    const delayedVenue = result.current.currentPlan.timeline.find((t) => t.id === venueTask.id)!;
    expect(delayedVenue.status).toBe('delayed');

    const downstreamBlocked = result.current.currentPlan.timeline.filter((t) =>
      t.dependencies.includes(venueTask.id)
    );
    expect(downstreamBlocked.length).toBeGreaterThan(0);
    expect(downstreamBlocked[0].status).toBe('delayed');
    expect(downstreamBlocked[0].cascadeImpactDesc).toContain('Directly blocked');
  });

  it('toggles vendor shortlist and favorite ideas without state mutation side-effects', () => {
    const { result } = renderHook(() => useEventPlan());
    const firstQuote = result.current.currentPlan.vendorQuotes[0];
    const firstIdea = result.current.currentPlan.personalizedIdeas[0];

    act(() => {
      result.current.toggleShortlist(firstQuote.id);
      result.current.toggleFavoriteIdea(firstIdea.id);
    });

    const updatedQuote = result.current.currentPlan.vendorQuotes.find(
      (q) => q.id === firstQuote.id
    )!;
    const updatedIdea = result.current.currentPlan.personalizedIdeas.find(
      (i) => i.id === firstIdea.id
    )!;

    expect(updatedQuote.isShortlisted).toBe(!firstQuote.isShortlisted);
    expect(updatedIdea.favorited).toBe(!firstIdea.favorited);
  });
});
