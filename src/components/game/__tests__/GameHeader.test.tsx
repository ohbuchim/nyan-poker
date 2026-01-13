import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GameHeader } from '../GameHeader';

describe('GameHeader', () => {
  describe('Rendering', () => {
    it('renders round information', () => {
      render(<GameHeader round={2} totalRounds={5} score={100} />);
      expect(screen.getByText(/ラウンド/)).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      // The /5 is split across text nodes, so we search within the badge element
      expect(screen.getByText(/ラウンド/).textContent).toContain('2');
      expect(screen.getByText(/ラウンド/).textContent).toContain('5');
    });

    it('renders score display', () => {
      render(<GameHeader round={1} totalRounds={5} score={150} />);
      expect(screen.getByText('スコア')).toBeInTheDocument();
      expect(screen.getByText('150')).toBeInTheDocument();
    });

    it('renders rules button when onRulesClick is provided', () => {
      const handleRulesClick = vi.fn();
      render(<GameHeader round={1} totalRounds={5} score={0} onRulesClick={handleRulesClick} />);
      expect(screen.getByRole('button', { name: '役一覧を表示' })).toBeInTheDocument();
    });

    it('does not render rules button when onRulesClick is not provided', () => {
      render(<GameHeader round={1} totalRounds={5} score={0} />);
      expect(screen.queryByRole('button', { name: '役一覧を表示' })).not.toBeInTheDocument();
    });
  });

  describe('Progress bar', () => {
    it('has progressbar role', () => {
      render(<GameHeader round={3} totalRounds={5} score={0} />);
      expect(screen.getByRole('progressbar')).toBeInTheDocument();
    });

    it('has aria-label for accessibility', () => {
      render(<GameHeader round={3} totalRounds={5} score={0} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-label', 'ゲーム進行状況');
    });

    it('has aria-valuenow matching current round', () => {
      render(<GameHeader round={3} totalRounds={5} score={0} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuenow', '3');
    });

    it('has aria-valuemin of 1', () => {
      render(<GameHeader round={2} totalRounds={5} score={0} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuemin', '1');
    });

    it('has aria-valuemax matching total rounds', () => {
      render(<GameHeader round={2} totalRounds={5} score={0} />);
      const progressbar = screen.getByRole('progressbar');
      expect(progressbar).toHaveAttribute('aria-valuemax', '5');
    });

    it('progress fill width matches round progress', () => {
      const { container } = render(<GameHeader round={2} totalRounds={5} score={0} />);
      const fill = container.querySelector('[class*="progress-fill"]');
      expect(fill).toHaveStyle({ width: '40%' }); // 2/5 = 40%
    });
  });

  describe('Score accessibility', () => {
    it('score display has aria-live attribute for announcements', () => {
      const { container } = render(<GameHeader round={1} totalRounds={5} score={100} />);
      const scoreDisplay = container.querySelector('[class*="score-display"]');
      expect(scoreDisplay).toHaveAttribute('aria-live', 'polite');
    });

    it('score display has aria-atomic for complete updates', () => {
      const { container } = render(<GameHeader round={1} totalRounds={5} score={100} />);
      const scoreDisplay = container.querySelector('[class*="score-display"]');
      expect(scoreDisplay).toHaveAttribute('aria-atomic', 'true');
    });
  });

  describe('Interactions', () => {
    it('calls onRulesClick when rules button is clicked', async () => {
      const handleRulesClick = vi.fn();
      const user = userEvent.setup();

      render(<GameHeader round={1} totalRounds={5} score={0} onRulesClick={handleRulesClick} />);

      await user.click(screen.getByRole('button', { name: '役一覧を表示' }));
      expect(handleRulesClick).toHaveBeenCalledTimes(1);
    });
  });
});
