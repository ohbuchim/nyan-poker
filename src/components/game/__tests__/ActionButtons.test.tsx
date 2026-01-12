import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ActionButtons } from '../ActionButtons';

describe('ActionButtons', () => {
  const defaultProps = {
    selectedCount: 0,
    exchanged: false,
    isRevealing: false,
    isLastRound: false,
    onExchange: vi.fn(),
    onSkipExchange: vi.fn(),
    onClearSelection: vi.fn(),
    onNextRound: vi.fn(),
    onFinish: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Selection phase', () => {
    it('renders exchange and skip buttons', () => {
      render(<ActionButtons {...defaultProps} />);

      expect(screen.getByRole('button', { name: /交換する/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /交換しない/i })).toBeInTheDocument();
    });

    it('disables exchange button when no cards selected', () => {
      render(<ActionButtons {...defaultProps} selectedCount={0} />);

      const exchangeButton = screen.getByRole('button', { name: /交換する/i });
      expect(exchangeButton).toBeDisabled();
    });

    it('enables exchange button when cards are selected', () => {
      render(<ActionButtons {...defaultProps} selectedCount={2} />);

      const exchangeButton = screen.getByRole('button', { name: /交換する/i });
      expect(exchangeButton).not.toBeDisabled();
    });

    it('shows selected count', () => {
      render(<ActionButtons {...defaultProps} selectedCount={2} maxSelectable={3} />);

      expect(screen.getByText('2')).toBeInTheDocument();
      // Text is split across elements, so check for partial match
      expect(screen.getByText(/枚選択中/)).toBeInTheDocument();
    });

    it('shows clear selection button when cards are selected', () => {
      render(<ActionButtons {...defaultProps} selectedCount={2} />);

      expect(screen.getByRole('button', { name: /選択を解除/i })).toBeInTheDocument();
    });

    it('hides clear selection button when no cards are selected', () => {
      render(<ActionButtons {...defaultProps} selectedCount={0} />);

      expect(screen.queryByRole('button', { name: /選択を解除/i })).not.toBeInTheDocument();
    });

    it('calls onExchange when exchange button is clicked', async () => {
      const user = userEvent.setup();
      const onExchange = vi.fn();
      render(<ActionButtons {...defaultProps} selectedCount={2} onExchange={onExchange} />);

      await user.click(screen.getByRole('button', { name: /交換する/i }));

      expect(onExchange).toHaveBeenCalledTimes(1);
    });

    it('calls onSkipExchange when skip button is clicked', async () => {
      const user = userEvent.setup();
      const onSkipExchange = vi.fn();
      render(<ActionButtons {...defaultProps} onSkipExchange={onSkipExchange} />);

      await user.click(screen.getByRole('button', { name: /交換しない/i }));

      expect(onSkipExchange).toHaveBeenCalledTimes(1);
    });

    it('calls onClearSelection when clear button is clicked', async () => {
      const user = userEvent.setup();
      const onClearSelection = vi.fn();
      render(<ActionButtons {...defaultProps} selectedCount={2} onClearSelection={onClearSelection} />);

      await user.click(screen.getByRole('button', { name: /選択を解除/i }));

      expect(onClearSelection).toHaveBeenCalledTimes(1);
    });
  });

  describe('Exchanging phase (loading state)', () => {
    it('shows loading state on exchange button when isExchanging is true', () => {
      const { container } = render(<ActionButtons {...defaultProps} selectedCount={2} isExchanging />);

      // Button should have loading class
      const loadingButton = container.querySelector('[class*="btn--loading"]');
      expect(loadingButton).toBeInTheDocument();
    });

    it('disables exchange button when isExchanging is true', () => {
      render(<ActionButtons {...defaultProps} selectedCount={2} isExchanging />);

      // Find the loading button (it doesn't have the same name since it shows spinner)
      const buttons = screen.getAllByRole('button');
      const primaryButton = buttons.find(btn => btn.className.includes('primary'));
      expect(primaryButton).toBeDisabled();
    });

    it('disables skip button when isExchanging is true', () => {
      render(<ActionButtons {...defaultProps} isExchanging />);

      const skipButton = screen.getByRole('button', { name: /交換しない/i });
      expect(skipButton).toBeDisabled();
    });

    it('hides clear selection button when isExchanging is true', () => {
      render(<ActionButtons {...defaultProps} selectedCount={2} isExchanging />);

      expect(screen.queryByRole('button', { name: /選択を解除/i })).not.toBeInTheDocument();
    });

    it('does not call onExchange when button is clicked during exchanging', async () => {
      const user = userEvent.setup();
      const onExchange = vi.fn();
      render(<ActionButtons {...defaultProps} selectedCount={2} isExchanging onExchange={onExchange} />);

      // Find the disabled primary button
      const buttons = screen.getAllByRole('button');
      const primaryButton = buttons.find(btn => btn.className.includes('primary'));
      if (primaryButton) {
        await user.click(primaryButton);
      }

      expect(onExchange).not.toHaveBeenCalled();
    });
  });

  describe('Revealed phase', () => {
    it('shows next round button after exchange', () => {
      render(<ActionButtons {...defaultProps} exchanged isLastRound={false} />);

      expect(screen.getByRole('button', { name: /次のラウンドへ/i })).toBeInTheDocument();
    });

    it('shows finish button on last round', () => {
      render(<ActionButtons {...defaultProps} exchanged isLastRound />);

      expect(screen.getByRole('button', { name: /結果を見る/i })).toBeInTheDocument();
    });

    it('calls onNextRound when next round button is clicked', async () => {
      const user = userEvent.setup();
      const onNextRound = vi.fn();
      render(<ActionButtons {...defaultProps} exchanged onNextRound={onNextRound} />);

      await user.click(screen.getByRole('button', { name: /次のラウンドへ/i }));

      expect(onNextRound).toHaveBeenCalledTimes(1);
    });

    it('calls onFinish when finish button is clicked', async () => {
      const user = userEvent.setup();
      const onFinish = vi.fn();
      render(<ActionButtons {...defaultProps} exchanged isLastRound onFinish={onFinish} />);

      await user.click(screen.getByRole('button', { name: /結果を見る/i }));

      expect(onFinish).toHaveBeenCalledTimes(1);
    });
  });

  describe('Revealing phase', () => {
    it('shows next round button when isRevealing is true', () => {
      render(<ActionButtons {...defaultProps} isRevealing isLastRound={false} />);

      expect(screen.getByRole('button', { name: /次のラウンドへ/i })).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('applies column variant by default', () => {
      const { container } = render(<ActionButtons {...defaultProps} />);

      // Check that the container has the column class (CSS modules mangles the name)
      expect(container.firstChild?.className).toContain('container--column');
    });

    it('applies inline variant when specified', () => {
      const { container } = render(<ActionButtons {...defaultProps} variant="inline" />);

      // Check that the container has the inline class (CSS modules mangles the name)
      expect(container.firstChild?.className).toContain('container--inline');
    });

    it('shows shorter clear button text in inline variant', () => {
      render(<ActionButtons {...defaultProps} selectedCount={2} variant="inline" />);

      expect(screen.getByRole('button', { name: '解除' })).toBeInTheDocument();
    });

    it('shows full clear button text in column variant', () => {
      render(<ActionButtons {...defaultProps} selectedCount={2} variant="column" />);

      expect(screen.getByRole('button', { name: '選択を解除' })).toBeInTheDocument();
    });
  });
});
