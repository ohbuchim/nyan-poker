import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResultScreen } from '../ResultScreen';
import type { RoundHistory, GameMode } from '../../types';
import type { Role } from '../../types/role';

// Helper to create mock role
const createMockRole = (name: string, points: number): Role => ({
  type: 'onePair',
  name,
  points,
  matchingCardIds: [0, 1],
});

// Helper to create mock round history
const createMockHistory = (
  round: number,
  roleName: string,
  points: number,
  result?: 'win' | 'lose' | 'draw'
): RoundHistory => ({
  round,
  playerRole: createMockRole(roleName, points),
  playerPoints: points,
  result,
});

describe('ResultScreen', () => {
  const defaultProps = {
    totalScore: 85,
    history: [
      createMockHistory(1, '茶トラワンペア', 11),
      createMockHistory(2, 'キジトラツーペア', 29),
      createMockHistory(3, '茶白スリーカラー', 25),
      createMockHistory(4, 'ノーペア', 0),
      createMockHistory(5, '白猫×黒猫ツーペア', 20),
    ],
    mode: 'solo' as GameMode,
    onPlayAgain: vi.fn(),
    onReturnToTitle: vi.fn(),
  };

  describe('Basic Rendering', () => {
    it('renders the result screen', () => {
      render(<ResultScreen {...defaultProps} />);
      expect(screen.getByTestId('result-screen')).toBeInTheDocument();
    });

    it('displays the final score title', () => {
      render(<ResultScreen {...defaultProps} />);
      expect(screen.getByText('最終スコア')).toBeInTheDocument();
    });

    it('displays the total score', () => {
      render(<ResultScreen {...defaultProps} />);
      expect(screen.getByTestId('final-score')).toHaveTextContent('85');
    });

    it('displays the points label', () => {
      render(<ResultScreen {...defaultProps} />);
      expect(screen.getByText('ポイント')).toBeInTheDocument();
    });

    it('displays the round history title', () => {
      render(<ResultScreen {...defaultProps} />);
      expect(screen.getByText('ラウンド履歴')).toBeInTheDocument();
    });

    it('displays all round history items', () => {
      render(<ResultScreen {...defaultProps} />);
      expect(screen.getByTestId('round-1')).toBeInTheDocument();
      expect(screen.getByTestId('round-2')).toBeInTheDocument();
      expect(screen.getByTestId('round-3')).toBeInTheDocument();
      expect(screen.getByTestId('round-4')).toBeInTheDocument();
      expect(screen.getByTestId('round-5')).toBeInTheDocument();
    });
  });

  describe('Solo Mode Display', () => {
    it('displays round numbers', () => {
      render(<ResultScreen {...defaultProps} />);
      expect(screen.getByText('ラウンド1')).toBeInTheDocument();
      expect(screen.getByText('ラウンド2')).toBeInTheDocument();
      expect(screen.getByText('ラウンド5')).toBeInTheDocument();
    });

    it('displays role names', () => {
      render(<ResultScreen {...defaultProps} />);
      expect(screen.getByText('茶トラワンペア')).toBeInTheDocument();
      expect(screen.getByText('キジトラツーペア')).toBeInTheDocument();
      expect(screen.getByText('茶白スリーカラー')).toBeInTheDocument();
    });

    it('displays positive points with + sign', () => {
      render(<ResultScreen {...defaultProps} />);
      expect(screen.getByText('+11')).toBeInTheDocument();
      expect(screen.getByText('+29')).toBeInTheDocument();
    });

    it('displays zero points without sign', () => {
      render(<ResultScreen {...defaultProps} />);
      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('does not display result icons in solo mode', () => {
      render(<ResultScreen {...defaultProps} />);
      expect(screen.queryByText('W')).not.toBeInTheDocument();
      expect(screen.queryByText('L')).not.toBeInTheDocument();
      expect(screen.queryByText('D')).not.toBeInTheDocument();
    });
  });

  describe('Battle Mode Display', () => {
    const battleHistory = [
      createMockHistory(1, '茶トラワンペア', 11, 'win'),
      createMockHistory(2, 'キジトラツーペア', -15, 'lose'),
      createMockHistory(3, '茶白スリーカラー', 0, 'draw'),
    ];

    const battleProps = {
      ...defaultProps,
      mode: 'battle' as GameMode,
      history: battleHistory,
      totalScore: -4,
    };

    it('displays result icons in battle mode', () => {
      render(<ResultScreen {...battleProps} />);
      expect(screen.getByText('W')).toBeInTheDocument();
    });

    it('displays lose icon for losing rounds', () => {
      render(<ResultScreen {...battleProps} />);
      expect(screen.getByText('L')).toBeInTheDocument();
    });

    it('displays draw icon for draw rounds', () => {
      render(<ResultScreen {...battleProps} />);
      expect(screen.getByText('D')).toBeInTheDocument();
    });

    it('displays negative points for losing rounds', () => {
      render(<ResultScreen {...battleProps} />);
      expect(screen.getByText('-15')).toBeInTheDocument();
    });
  });

  describe('Score Display', () => {
    it('displays positive total score correctly', () => {
      render(<ResultScreen {...defaultProps} totalScore={150} />);
      expect(screen.getByTestId('final-score')).toHaveTextContent('150');
    });

    it('displays zero total score correctly', () => {
      render(<ResultScreen {...defaultProps} totalScore={0} />);
      expect(screen.getByTestId('final-score')).toHaveTextContent('0');
    });

    it('displays negative total score correctly', () => {
      render(<ResultScreen {...defaultProps} totalScore={-25} />);
      expect(screen.getByTestId('final-score')).toHaveTextContent('-25');
    });

    it('has accessible label for score', () => {
      render(<ResultScreen {...defaultProps} totalScore={85} />);
      expect(screen.getByLabelText('最終スコア: 85ポイント')).toBeInTheDocument();
    });
  });

  describe('Button Interactions', () => {
    it('calls onPlayAgain when play again button is clicked', () => {
      const onPlayAgain = vi.fn();
      render(<ResultScreen {...defaultProps} onPlayAgain={onPlayAgain} />);

      fireEvent.click(screen.getByTestId('play-again-button'));
      expect(onPlayAgain).toHaveBeenCalledTimes(1);
    });

    it('calls onReturnToTitle when return to title button is clicked', () => {
      const onReturnToTitle = vi.fn();
      render(<ResultScreen {...defaultProps} onReturnToTitle={onReturnToTitle} />);

      fireEvent.click(screen.getByTestId('return-to-title-button'));
      expect(onReturnToTitle).toHaveBeenCalledTimes(1);
    });

    it('renders play again button with correct text', () => {
      render(<ResultScreen {...defaultProps} />);
      expect(screen.getByText('もう一度遊ぶ')).toBeInTheDocument();
    });

    it('renders return to title button with correct text', () => {
      render(<ResultScreen {...defaultProps} />);
      expect(screen.getByText('タイトルに戻る')).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has accessible history list', () => {
      render(<ResultScreen {...defaultProps} />);
      expect(screen.getByRole('list', { name: 'ラウンド履歴' })).toBeInTheDocument();
    });

    it('has list items for each round', () => {
      render(<ResultScreen {...defaultProps} />);
      const listItems = screen.getAllByRole('listitem');
      expect(listItems).toHaveLength(5);
    });

    it('has accessible labels for result icons in battle mode', () => {
      const battleHistory = [
        createMockHistory(1, '茶トラワンペア', 11, 'win'),
        createMockHistory(2, 'キジトラツーペア', -15, 'lose'),
        createMockHistory(3, '茶白スリーカラー', 0, 'draw'),
      ];

      render(
        <ResultScreen
          {...defaultProps}
          mode="battle"
          history={battleHistory}
        />
      );

      expect(screen.getByLabelText('勝利')).toBeInTheDocument();
      expect(screen.getByLabelText('敗北')).toBeInTheDocument();
      expect(screen.getByLabelText('引き分け')).toBeInTheDocument();
    });

    it('buttons are focusable', () => {
      render(<ResultScreen {...defaultProps} />);

      const playAgainButton = screen.getByTestId('play-again-button');
      const returnButton = screen.getByTestId('return-to-title-button');

      expect(playAgainButton).not.toHaveAttribute('disabled');
      expect(returnButton).not.toHaveAttribute('disabled');
    });
  });

  describe('Empty History', () => {
    it('renders correctly with empty history', () => {
      render(<ResultScreen {...defaultProps} history={[]} totalScore={0} />);

      expect(screen.getByText('最終スコア')).toBeInTheDocument();
      expect(screen.getByTestId('final-score')).toHaveTextContent('0');
      expect(screen.getByText('ラウンド履歴')).toBeInTheDocument();
    });
  });

  describe('Points Styling', () => {
    it('applies positive styling class for positive points', () => {
      const history = [createMockHistory(1, 'テスト役', 25)];
      render(<ResultScreen {...defaultProps} history={history} />);

      const pointsElement = screen.getByText('+25');
      expect(pointsElement.className).toContain('positive');
    });

    it('applies negative styling class for negative points', () => {
      const history = [createMockHistory(1, 'テスト役', -10)];
      history[0].playerPoints = -10;
      render(<ResultScreen {...defaultProps} history={history} />);

      const pointsElement = screen.getByText('-10');
      expect(pointsElement.className).toContain('negative');
    });

    it('does not apply special styling for zero points', () => {
      const history = [createMockHistory(1, 'ノーペア', 0)];
      render(<ResultScreen {...defaultProps} history={history} />);

      // Find the points element (not the score value)
      const historyItem = screen.getByTestId('round-1');
      const pointsElement = historyItem.querySelector('[class*="points"]');
      expect(pointsElement?.className).not.toContain('positive');
      expect(pointsElement?.className).not.toContain('negative');
    });
  });
});

describe('ResultScreen index export', () => {
  it('exports ResultScreen from index', async () => {
    const { ResultScreen } = await import('../index');
    expect(ResultScreen).toBeDefined();
  });
});
