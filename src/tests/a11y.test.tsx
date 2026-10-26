import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { App } from '../App';
import { ApiKeyModal } from '../components/common/ApiKeyModal';
import { JudgeGuideModal } from '../components/documentation/JudgeGuideModal';
import { ScopingWizard } from '../components/scoping/ScopingWizard';

describe('Accessibility (a11y) & Keyboard Navigation Suite', () => {
  it('renders skip to main content link with valid target landmark', () => {
    render(<App />);
    const skipLink = screen.getByText(/Skip to main content/i);
    expect(skipLink).toBeInTheDocument();
    expect(skipLink).toHaveAttribute('href', '#main-content');
  });

  it('renders tablist navigation with correct ARIA attributes and selection states', () => {
    render(<App />);
    const tablist = screen.getByRole('tablist', { name: /Event planning modules/i });
    expect(tablist).toBeInTheDocument();

    const tabs = screen.getAllByRole('tab');
    expect(tabs.length).toBe(5);

    // Initial active tab is 'budget'
    const budgetTab = screen.getByRole('tab', { name: /1\. Budget & Trade-Offs/i });
    expect(budgetTab).toHaveAttribute('aria-selected', 'true');
    expect(budgetTab).toHaveAttribute('aria-controls', 'panel-budget');

    // Click on timeline tab
    const timelineTab = screen.getByRole('tab', { name: /2\. Roadmap & Cascade Timeline/i });
    fireEvent.click(timelineTab);
    expect(timelineTab).toHaveAttribute('aria-selected', 'true');
    expect(budgetTab).toHaveAttribute('aria-selected', 'false');
  });

  it('renders ApiKeyModal with accessible dialog attributes and dismisses on Escape key', () => {
    const onClose = vi.fn();
    render(<ApiKeyModal isOpen={true} onClose={onClose} onKeySaved={vi.fn()} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'api-modal-title');

    // Press Escape
    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('renders JudgeGuideModal with dialog semantics and dismisses on Escape key', () => {
    const onClose = vi.fn();
    render(<JudgeGuideModal isOpen={true} onClose={onClose} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'judge-guide-title');

    fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('renders ScopingWizard with dialog semantics and accessible range sliders', () => {
    const onClose = vi.fn();
    render(
      <ScopingWizard isOpen={true} onClose={onClose} onGeneratePlan={vi.fn()} isLoading={false} />
    );

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-modal', 'true');
    expect(dialog).toHaveAttribute('aria-labelledby', 'wizard-modal-title');

    // Navigate to Demographics step (Step 4) to verify sliders
    const nextBtn = screen.getByRole('button', { name: /Next Step/i });
    fireEvent.click(nextBtn); // To Step 2
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i })); // To Step 3
    fireEvent.click(screen.getByRole('button', { name: /Next Step/i })); // To Step 4

    const childrenSlider = screen.getByLabelText(/Children percentage of guests/i);
    expect(childrenSlider).toHaveAttribute('aria-valuenow');
    expect(childrenSlider).toHaveAttribute('aria-valuemin', '0');
    expect(childrenSlider).toHaveAttribute('aria-valuemax', '50');

    const elderlySlider = screen.getByLabelText(/Elderly percentage of guests/i);
    expect(elderlySlider).toHaveAttribute('aria-valuenow');
    expect(elderlySlider).toHaveAttribute('aria-valuemin', '0');
    expect(elderlySlider).toHaveAttribute('aria-valuemax', '60');
  });
});
