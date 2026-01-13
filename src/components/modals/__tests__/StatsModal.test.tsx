// components/modals/__tests__/StatsModal.test.tsx

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { StatsModal } from '../StatsModal';
import { StatsProvider } from '../../../context/StatsContext';
import { STORAGE_KEYS, STORAGE_VERSION } from '../../../hooks/useLocalStorage';

/**
 * Helper function to set localStorage data in the new versioned format
 */
function setVersionedStorageData<T>(key: string, data: T): void {
  localStorage.setItem(key, JSON.stringify({ version: STORAGE_VERSION, data }));
}

/** Wrapper component that provides StatsContext */
function TestWrapper({ children }: { children: ReactNode }) {
  return <StatsProvider>{children}</StatsProvider>;
}

describe('StatsModal', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'modal-root';
    document.body.appendChild(container);
    localStorage.clear();
  });

  afterEach(() => {
    document.body.removeChild(container);
    document.body.style.overflow = '';
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders nothing when not open', () => {
      render(
        <TestWrapper>
          <StatsModal isOpen={false} onClose={vi.fn()} />
        </TestWrapper>
      );
      expect(screen.queryByText('戦績')).not.toBeInTheDocument();
    });

    it('renders modal when open', () => {
      render(
        <TestWrapper>
          <StatsModal isOpen={true} onClose={vi.fn()} />
        </TestWrapper>
      );
      expect(screen.getByText('戦績')).toBeInTheDocument();
    });

    it('renders all section titles', () => {
      render(
        <TestWrapper>
          <StatsModal isOpen={true} onClose={vi.fn()} />
        </TestWrapper>
      );
      expect(screen.getByText('ひとりで遊ぶ')).toBeInTheDocument();
      expect(screen.getByText('対戦モード')).toBeInTheDocument();
      expect(screen.getByText('役の達成回数')).toBeInTheDocument();
    });

    it('renders solo stats labels', () => {
      render(
        <TestWrapper>
          <StatsModal isOpen={true} onClose={vi.fn()} />
        </TestWrapper>
      );
      const playCountLabels = screen.getAllByText('プレイ回数');
      expect(playCountLabels.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText('最高スコア')).toBeInTheDocument();
      expect(screen.getByText('平均スコア')).toBeInTheDocument();
    });

    it('renders battle stats labels', () => {
      render(
        <TestWrapper>
          <StatsModal isOpen={true} onClose={vi.fn()} />
        </TestWrapper>
      );
      expect(screen.getByText('勝利数')).toBeInTheDocument();
      expect(screen.getByText('勝率')).toBeInTheDocument();
      expect(screen.getByText('敗北数')).toBeInTheDocument();
      expect(screen.getByText('引き分け数')).toBeInTheDocument();
    });

    it('renders all role types', () => {
      render(
        <TestWrapper>
          <StatsModal isOpen={true} onClose={vi.fn()} />
        </TestWrapper>
      );
      expect(screen.getByText('フラッシュ')).toBeInTheDocument();
      expect(screen.getByText('フルハウス')).toBeInTheDocument();
      expect(screen.getByText('フォーカラー')).toBeInTheDocument();
      expect(screen.getByText('スリーカラー')).toBeInTheDocument();
      expect(screen.getByText('ツーペア')).toBeInTheDocument();
      expect(screen.getByText('ワンペア')).toBeInTheDocument();
      expect(screen.getByText('ファー')).toBeInTheDocument();
      expect(screen.getByText('ノーペア')).toBeInTheDocument();
    });
  });

  describe('Default values display', () => {
    it('displays placeholder for empty solo stats', () => {
      render(
        <TestWrapper>
          <StatsModal isOpen={true} onClose={vi.fn()} />
        </TestWrapper>
      );
      expect(screen.getByTestId('solo-play-count')).toHaveTextContent('-');
      expect(screen.getByTestId('solo-high-score')).toHaveTextContent('-');
      expect(screen.getByTestId('solo-average-score')).toHaveTextContent('-');
    });

    it('displays placeholder for empty battle stats', () => {
      render(
        <TestWrapper>
          <StatsModal isOpen={true} onClose={vi.fn()} />
        </TestWrapper>
      );
      expect(screen.getByTestId('battle-play-count')).toHaveTextContent('-');
      expect(screen.getByTestId('battle-wins')).toHaveTextContent('-');
      expect(screen.getByTestId('battle-win-rate')).toHaveTextContent('-');
      expect(screen.getByTestId('battle-losses')).toHaveTextContent('-');
      expect(screen.getByTestId('battle-draws')).toHaveTextContent('-');
    });

    it('displays placeholder for empty role achievements', () => {
      render(
        <TestWrapper>
          <StatsModal isOpen={true} onClose={vi.fn()} />
        </TestWrapper>
      );
      expect(screen.getByTestId('role-count-flush')).toHaveTextContent('-');
      expect(screen.getByTestId('role-count-fourColor')).toHaveTextContent('-');
      expect(screen.getByTestId('role-count-onePair')).toHaveTextContent('-');
    });
  });

  describe('Stats from localStorage', () => {
    it('displays solo stats from storage', () => {
      // Set up localStorage before rendering
      setVersionedStorageData(STORAGE_KEYS.SOLO_STATS, {
        playCount: 42,
        highScore: 156,
        totalScore: 2827,
      });

      render(
        <TestWrapper>
          <StatsModal isOpen={true} onClose={vi.fn()} />
        </TestWrapper>
      );

      expect(screen.getByTestId('solo-play-count')).toHaveTextContent('42');
      expect(screen.getByTestId('solo-high-score')).toHaveTextContent('156');
      // Average: 2827 / 42 = 67.3
      expect(screen.getByTestId('solo-average-score')).toHaveTextContent(
        '67.3'
      );
    });

    it('displays battle stats from storage', () => {
      // Set up localStorage before rendering
      setVersionedStorageData(STORAGE_KEYS.BATTLE_STATS, {
        playCount: 28,
        wins: 18,
        losses: 8,
      });

      render(
        <TestWrapper>
          <StatsModal isOpen={true} onClose={vi.fn()} />
        </TestWrapper>
      );

      expect(screen.getByTestId('battle-play-count')).toHaveTextContent('28');
      expect(screen.getByTestId('battle-wins')).toHaveTextContent('18');
      expect(screen.getByTestId('battle-losses')).toHaveTextContent('8');
      // Win rate: 18 / 28 * 100 = 64.3%
      expect(screen.getByTestId('battle-win-rate')).toHaveTextContent('64.3%');
      // Draws: 28 - 18 - 8 = 2
      expect(screen.getByTestId('battle-draws')).toHaveTextContent('2');
    });

    it('displays role achievements from storage', () => {
      // Set up localStorage before rendering
      setVersionedStorageData(STORAGE_KEYS.ACHIEVEMENTS, {
        flush: 3,
        fourColor: 15,
        fullHouse: 23,
        threeColor: 47,
        twoPair: 32,
        onePair: 89,
        fur: 29,
        noPair: 10,
      });

      render(
        <TestWrapper>
          <StatsModal isOpen={true} onClose={vi.fn()} />
        </TestWrapper>
      );

      expect(screen.getByTestId('role-count-flush')).toHaveTextContent('3回');
      expect(screen.getByTestId('role-count-fourColor')).toHaveTextContent(
        '15回'
      );
      expect(screen.getByTestId('role-count-fullHouse')).toHaveTextContent(
        '23回'
      );
      expect(screen.getByTestId('role-count-threeColor')).toHaveTextContent(
        '47回'
      );
      expect(screen.getByTestId('role-count-twoPair')).toHaveTextContent(
        '32回'
      );
      expect(screen.getByTestId('role-count-onePair')).toHaveTextContent(
        '89回'
      );
      expect(screen.getByTestId('role-count-fur')).toHaveTextContent('29回');
      expect(screen.getByTestId('role-count-noPair')).toHaveTextContent('10回');
    });
  });

  describe('Close behavior', () => {
    it('calls onClose when close button is clicked', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <StatsModal isOpen={true} onClose={handleClose} />
        </TestWrapper>
      );

      await user.click(screen.getByRole('button', { name: '閉じる' }));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when ESC key is pressed', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <StatsModal isOpen={true} onClose={handleClose} />
        </TestWrapper>
      );

      await user.keyboard('{Escape}');
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when overlay is clicked', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();

      const { container: renderContainer } = render(
        <TestWrapper>
          <StatsModal isOpen={true} onClose={handleClose} />
        </TestWrapper>
      );

      // Find overlay by class name (from Modal component)
      const overlay = renderContainer.parentElement?.querySelector(
        '[class*="overlay"]'
      );
      if (overlay) {
        await user.click(overlay);
        expect(handleClose).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('Accessibility', () => {
    it('has proper section labels for screen readers', () => {
      render(
        <TestWrapper>
          <StatsModal isOpen={true} onClose={vi.fn()} />
        </TestWrapper>
      );

      // Check that sections have proper aria-labelledby
      const soloSection = screen.getByRole('region', {
        name: /ひとりで遊ぶ/,
      });
      const battleSection = screen.getByRole('region', {
        name: /対戦モード/,
      });
      const rolesSection = screen.getByRole('region', {
        name: /役の達成回数/,
      });

      expect(soloSection).toBeInTheDocument();
      expect(battleSection).toBeInTheDocument();
      expect(rolesSection).toBeInTheDocument();
    });
  });

  describe('Edge cases', () => {
    it('handles zero draws correctly (all wins or losses)', () => {
      // Set up localStorage before rendering
      setVersionedStorageData(STORAGE_KEYS.BATTLE_STATS, {
        playCount: 10,
        wins: 10,
        losses: 0, // All wins, no draws
      });

      render(
        <TestWrapper>
          <StatsModal isOpen={true} onClose={vi.fn()} />
        </TestWrapper>
      );

      expect(screen.getByTestId('battle-draws')).toHaveTextContent('-');
    });

    it('handles 100% win rate correctly', () => {
      // Set up localStorage before rendering
      setVersionedStorageData(STORAGE_KEYS.BATTLE_STATS, {
        playCount: 5,
        wins: 5,
        losses: 0,
      });

      render(
        <TestWrapper>
          <StatsModal isOpen={true} onClose={vi.fn()} />
        </TestWrapper>
      );

      expect(screen.getByTestId('battle-win-rate')).toHaveTextContent('100.0%');
    });

    it('handles 0% win rate correctly', () => {
      // Set up localStorage before rendering
      setVersionedStorageData(STORAGE_KEYS.BATTLE_STATS, {
        playCount: 5,
        wins: 0,
        losses: 5,
      });

      render(
        <TestWrapper>
          <StatsModal isOpen={true} onClose={vi.fn()} />
        </TestWrapper>
      );

      // 0% win rate should show placeholder
      expect(screen.getByTestId('battle-win-rate')).toHaveTextContent('-');
    });

    it('handles partial role achievements', () => {
      // Set up localStorage before rendering
      setVersionedStorageData(STORAGE_KEYS.ACHIEVEMENTS, {
        flush: 1,
        // Other roles not present
      });

      render(
        <TestWrapper>
          <StatsModal isOpen={true} onClose={vi.fn()} />
        </TestWrapper>
      );

      expect(screen.getByTestId('role-count-flush')).toHaveTextContent('1回');
      expect(screen.getByTestId('role-count-fourColor')).toHaveTextContent('-');
    });
  });
});
