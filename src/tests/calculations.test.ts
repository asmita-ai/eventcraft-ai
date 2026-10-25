import { describe, it, expect } from 'vitest';
import { 
  calculateBudgetAllocation, 
  checkBudgetOverage, 
  generateTradeOffSuggestions, 
  computeTimelineCascade, 
  analyzePlanRevision 
} from '../utils/calculations';
import { formatCurrency, parseCurrencyInput } from '../utils/currency';
import { WEDDING_PRESET } from '../services/heuristicGenerator';
import { TimelineTask } from '../types';

describe('EventCraft Calculation & Logic Engine', () => {

  it('allocates budget proportionally and sums exactly to total budget', () => {
    const items = calculateBudgetAllocation(WEDDING_PRESET);
    expect(items.length).toBeGreaterThan(0);

    const totalAllocated = items.reduce((sum, i) => sum + i.allocatedAmount, 0);
    // Should match budget within rounding margin of error (<= 10 rupees)
    expect(Math.abs(totalAllocated - WEDDING_PRESET.totalBudget)).toBeLessThanOrEqual(10);

    // Initial items must be flagged as estimates per SME Srinivas's transparency rule
    const estimates = items.filter((i) => i.isEstimate);
    expect(estimates.length).toBe(items.length);
  });

  it('correctly detects budget overage and calculates percentage excess', () => {
    const items = calculateBudgetAllocation(WEDDING_PRESET);
    
    // Normal baseline is within budget
    const normalCheck = checkBudgetOverage(items, WEDDING_PRESET.totalBudget);
    expect(normalCheck.isOver).toBe(false);

    // Inflate catering by 1.5x
    const inflatedItems = items.map((i) => 
      i.category === 'catering' ? { ...i, actualAmount: i.allocatedAmount * 1.5 } : i
    );
    const overCheck = checkBudgetOverage(inflatedItems, WEDDING_PRESET.totalBudget);
    expect(overCheck.isOver).toBe(true);
    expect(overCheck.diff).toBeGreaterThan(0);
    expect(overCheck.percentOver).toBeGreaterThan(0);
  });

  it('generates priority-driven trade-offs preserving high food preference', () => {
    const items = calculateBudgetAllocation(WEDDING_PRESET);
    const overage = 100000; // ₹1 Lakh over budget
    const tradeOffs = generateTradeOffSuggestions(WEDDING_PRESET, items, overage);

    expect(tradeOffs.length).toBeGreaterThan(0);
    // Decor is lower priority than catering in WEDDING_PRESET (decor: 2, catering: 5)
    // So decor streamlining should be proposed to protect the food experience
    const decorTradeOff = tradeOffs.find((t) => t.category === 'decoration');
    expect(decorTradeOff).toBeDefined();
    expect(decorTradeOff?.savingsAmount).toBeGreaterThan(0);
  });

  it('computes cascade ripple delays across downstream dependencies', () => {
    const sampleTasks: TimelineTask[] = [
      {
        id: 'task-venue',
        title: 'Lock Venue & Date',
        category: 'venue',
        deadlineDate: '2026-11-01',
        daysBeforeEvent: 90,
        priority: 'critical',
        status: 'pending',
        dependencies: [],
      },
      {
        id: 'task-catering',
        title: 'Book Catering Menu',
        category: 'catering',
        deadlineDate: '2026-11-20',
        daysBeforeEvent: 70,
        priority: 'critical',
        status: 'pending',
        dependencies: ['task-venue'],
      },
      {
        id: 'task-invitations',
        title: 'Send Digital Invites',
        category: 'invitations',
        deadlineDate: '2026-12-01',
        daysBeforeEvent: 60,
        priority: 'high',
        status: 'pending',
        dependencies: ['task-venue'],
      },
      {
        id: 'task-rsvp',
        title: 'Lock Final RSVPs',
        category: 'catering',
        deadlineDate: '2027-01-15',
        daysBeforeEvent: 10,
        priority: 'critical',
        status: 'pending',
        dependencies: ['task-catering', 'task-invitations'],
      },
    ];

    // Simulate delaying 'task-venue' by 14 days
    const result = computeTimelineCascade(sampleTasks, 'task-venue', 14);

    expect(result.cascadeAffectedCount).toBe(3); // Catering, Invitations, and RSVP all blocked!
    expect(result.blockedTasks.map((t) => t.id)).toContain('task-catering');
    expect(result.blockedTasks.map((t) => t.id)).toContain('task-invitations');
    expect(result.blockedTasks.map((t) => t.id)).toContain('task-rsvp');

    const blockedCatering = result.updatedTasks.find((t) => t.id === 'task-catering');
    expect(blockedCatering?.status).toBe('delayed');
    expect(blockedCatering?.cascadeImpactDesc).toContain('Lock Venue & Date');
  });

  it('adapts mid-stream changes dynamically without restarting from scratch', () => {
    const items = calculateBudgetAllocation(WEDDING_PRESET);
    const sampleTasks: TimelineTask[] = [
      {
        id: 't1',
        title: 'Venue',
        category: 'venue',
        deadlineDate: '2026-11-01',
        daysBeforeEvent: 90,
        priority: 'critical',
        status: 'completed',
        dependencies: [],
      },
    ];

    // Scenario: +50 guests, -15% budget, date 2 weeks earlier
    const revision = analyzePlanRevision(WEDDING_PRESET, items, sampleTasks, {
      guestDelta: 50,
      budgetDeltaPercent: -15,
      dateShiftWeeks: -2,
    });

    expect(revision.guestCountDelta).toBe(50);
    expect(revision.dateShiftWeeks).toBe(-2);
    expect(revision.impacts.length).toBeGreaterThan(0);

    // Verify per-guest squeeze detected
    const squeezeImpact = revision.impacts.find((i) => i.id === 'ripple-per-guest-crunch');
    expect(squeezeImpact).toBeDefined();
    expect(squeezeImpact?.severity).toBe('danger');

    // Verify venue capacity check flagged
    const venueCapacity = revision.impacts.find((i) => i.id === 'ripple-venue-capacity');
    expect(venueCapacity).toBeDefined();

    // Verify timeline compression flagged
    const timelineCrunch = revision.impacts.find((i) => i.id === 'ripple-timeline-compression');
    expect(timelineCrunch).toBeDefined();

    // Verify new budget breakdown is generated
    expect(revision.newBudgetBreakdown.length).toBe(items.length);
  });

  it('formats currency cleanly in Indian Rupee format and compact notation', () => {
    const formatted = formatCurrency(800000, 'INR');
    expect(formatted).toContain('8,00,000');

    const compactLakh = formatCurrency(800000, 'INR', true);
    expect(compactLakh).toBe('₹8.00 L');

    const parsed = parseCurrencyInput('₹ 8,00,000');
    expect(parsed).toBe(800000);
  });

});
