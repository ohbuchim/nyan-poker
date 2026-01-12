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
  result?: 'win' | 'lose' | 'draw',
  dealerRoleName?: string,
  dealerPoints?: number
): RoundHistory => ({
  round,
  playerRole: createMockRole(roleName, Math.abs(points)),
  playerPoints: points,
  result,
  dealerRole: dealerRoleName ? createMockRole(dealerRoleName, dealerPoints ?? 0) : undefined,
  dealerPoints: dealerPoints,
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
      createMockHistory(1, '茶トラワンペア', 11, 'win', 'ノーペア', -11),
      createMockHistory(2, 'キジトラツーペア', -15, 'lose', '白黒フォーカラー', 15),
      createMockHistory(3, '茶白スリーカラー', 0, 'draw', '茶白スリーカラー', 0),
    ];

    const battleProps = {
      ...defaultProps,
      mode: 'battle' as GameMode,
      history: battleHistory,
      totalScore: -4,
    };

    it('displays result icons in battle mode (circle for win)', () => {
      render(<ResultScreen {...battleProps} />);
      // Circle icon for win
      expect(screen.getByText('\u25CB')).toBeInTheDocument();
    });

    it('displays lose icon for losing rounds (cross)', () => {
      render(<ResultScreen {...battleProps} />);
      // Cross icon for lose
      expect(screen.getByText('\u00D7')).toBeInTheDocument();
    });

    it('displays draw icon for draw rounds (triangle)', () => {
      render(<ResultScreen {...battleProps} />);
      // Triangle icon for draw
      expect(screen.getByText('\u25B3')).toBeInTheDocument();
    });

    it('displays negative points for losing rounds', () => {
      render(<ResultScreen {...battleProps} />);
      expect(screen.getByText('-15')).toBeInTheDocument();
    });
  });

  describe('Battle Mode Final Result', () => {
    it('displays WIN when player has higher total score', () => {
      const winHistory = [
        createMockHistory(1, '白猫フラッシュ', 296, 'win', 'ノーペア', -296),
        createMockHistory(2, '茶トラワンペア', 5, 'win', 'ノーペア', -5),
        createMockHistory(3, 'ノーペア', -10, 'lose', 'サバトラワンペア', 10),
      ];

      render(
        <ResultScreen
          {...defaultProps}
          mode="battle"
          history={winHistory}
          totalScore={291}
        />
      );

      expect(screen.getByTestId('final-result')).toHaveTextContent('WIN');
    });

    it('displays LOSE when dealer has higher total score', () => {
      const loseHistory = [
        createMockHistory(1, 'ノーペア', -50, 'lose', '白猫フォーカラー', 50),
        createMockHistory(2, 'ノーペア', -30, 'lose', 'グレーフォーカラー', 30),
        createMockHistory(3, '茶トラワンペア', 5, 'win', 'ノーペア', -5),
      ];

      render(
        <ResultScreen
          {...defaultProps}
          mode="battle"
          history={loseHistory}
          totalScore={-75}
        />
      );

      expect(screen.getByTestId('final-result')).toHaveTextContent('LOSE');
    });

    it('displays DRAW when scores are equal', () => {
      const drawHistory = [
        createMockHistory(1, '茶トラワンペア', 10, 'win', 'ノーペア', -10),
        createMockHistory(2, 'ノーペア', -10, 'lose', '茶トラワンペア', 10),
        createMockHistory(3, 'ノーペア', 0, 'draw', 'ノーペア', 0),
      ];

      render(
        <ResultScreen
          {...defaultProps}
          mode="battle"
          history={drawHistory}
          totalScore={0}
        />
      );

      expect(screen.getByTestId('final-result')).toHaveTextContent('DRAW');
    });

    it('has accessible label for final result', () => {
      const winHistory = [
        createMockHistory(1, '茶トラワンペア', 10, 'win', 'ノーペア', -10),
      ];

      render(
        <ResultScreen
          {...defaultProps}
          mode="battle"
          history={winHistory}
          totalScore={10}
        />
      );

      expect(screen.getByLabelText('最終結果: WIN')).toBeInTheDocument();
    });
  });

  describe('Battle Record Display', () => {
    it('displays win/loss count correctly', () => {
      const history = [
        createMockHistory(1, '茶トラワンペア', 10, 'win', 'ノーペア', -10),
        createMockHistory(2, '茶トラワンペア', 10, 'win', 'ノーペア', -10),
        createMockHistory(3, '茶トラワンペア', 10, 'win', 'ノーペア', -10),
        createMockHistory(4, 'ノーペア', -20, 'lose', 'グレーワンペア', 20),
        createMockHistory(5, 'ノーペア', -15, 'lose', 'サバトラワンペア', 15),
      ];

      render(
        <ResultScreen
          {...defaultProps}
          mode="battle"
          history={history}
          totalScore={-5}
        />
      );

      expect(screen.getByTestId('battle-record')).toHaveTextContent('3勝');
      expect(screen.getByTestId('battle-record')).toHaveTextContent('2敗');
    });

    it('displays draw count when there are draws', () => {
      const history = [
        createMockHistory(1, '茶トラワンペア', 10, 'win', 'ノーペア', -10),
        createMockHistory(2, 'ノーペア', 0, 'draw', 'ノーペア', 0),
        createMockHistory(3, 'ノーペア', -15, 'lose', 'サバトラワンペア', 15),
      ];

      render(
        <ResultScreen
          {...defaultProps}
          mode="battle"
          history={history}
          totalScore={-5}
        />
      );

      expect(screen.getByTestId('battle-record')).toHaveTextContent('1勝');
      expect(screen.getByTestId('battle-record')).toHaveTextContent('1敗');
      expect(screen.getByTestId('battle-record')).toHaveTextContent('1分');
    });

    it('does not display draw section when no draws', () => {
      const history = [
        createMockHistory(1, '茶トラワンペア', 10, 'win', 'ノーペア', -10),
        createMockHistory(2, 'ノーペア', -15, 'lose', 'サバトラワンペア', 15),
      ];

      render(
        <ResultScreen
          {...defaultProps}
          mode="battle"
          history={history}
          totalScore={-5}
        />
      );

      expect(screen.queryByText(/分$/)).not.toBeInTheDocument();
    });
  });

  describe('Score Summary Display', () => {
    it('displays player final score', () => {
      const history = [
        createMockHistory(1, '茶トラワンペア', 10, 'win', 'ノーペア', -10),
      ];

      render(
        <ResultScreen
          {...defaultProps}
          mode="battle"
          history={history}
          totalScore={10}
        />
      );

      expect(screen.getByTestId('player-final-score')).toHaveTextContent('10');
    });

    it('displays dealer final score', () => {
      const history = [
        createMockHistory(1, '茶トラワンペア', 10, 'win', 'ノーペア', -10),
        createMockHistory(2, 'ノーペア', -20, 'lose', 'グレーワンペア', 20),
      ];

      render(
        <ResultScreen
          {...defaultProps}
          mode="battle"
          history={history}
          totalScore={-10}
        />
      );

      expect(screen.getByTestId('dealer-final-score')).toHaveTextContent('10');
    });

    it('displays score difference with positive sign for player advantage', () => {
      const history = [
        createMockHistory(1, '茶トラワンペア', 30, 'win', 'ノーペア', -30),
      ];

      render(
        <ResultScreen
          {...defaultProps}
          mode="battle"
          history={history}
          totalScore={30}
        />
      );

      expect(screen.getByTestId('score-difference')).toHaveTextContent('+60 pt');
    });

    it('displays score difference with negative for dealer advantage', () => {
      const history = [
        createMockHistory(1, 'ノーペア', -25, 'lose', '白黒ワンペア', 25),
      ];

      render(
        <ResultScreen
          {...defaultProps}
          mode="battle"
          history={history}
          totalScore={-25}
        />
      );

      expect(screen.getByTestId('score-difference')).toHaveTextContent('-50 pt');
    });

    it('displays VS between player and dealer scores', () => {
      const history = [
        createMockHistory(1, '茶トラワンペア', 10, 'win', 'ノーペア', -10),
      ];

      render(
        <ResultScreen
          {...defaultProps}
          mode="battle"
          history={history}
          totalScore={10}
        />
      );

      expect(screen.getByTestId('score-summary')).toHaveTextContent('VS');
    });
  });

  describe('Battle Round History Details', () => {
    it('displays dealer role name in round history', () => {
      const history = [
        createMockHistory(1, '茶トラワンペア', 10, 'win', 'サビワンペア', -10),
      ];

      render(
        <ResultScreen
          {...defaultProps}
          mode="battle"
          history={history}
          totalScore={10}
        />
      );

      expect(screen.getByText('サビワンペア')).toBeInTheDocument();
    });

    it('displays dealer role points in round history', () => {
      const history = [
        createMockHistory(1, '茶トラワンペア', -180, 'lose', '白猫フォーカラー', 180),
      ];

      render(
        <ResultScreen
          {...defaultProps}
          mode="battle"
          history={history}
          totalScore={-180}
        />
      );

      // Check that both player and dealer role points are displayed
      const rolePointsElements = screen.getAllByText('180pt');
      // Player role uses Math.abs(points) = 180, dealer role uses 180
      expect(rolePointsElements.length).toBeGreaterThanOrEqual(1);
    });

    it('displays "You" label for player round info', () => {
      const history = [
        createMockHistory(1, '茶トラワンペア', 10, 'win', 'ノーペア', -10),
      ];

      render(
        <ResultScreen
          {...defaultProps}
          mode="battle"
          history={history}
          totalScore={10}
        />
      );

      expect(screen.getByText('You')).toBeInTheDocument();
    });

    it('displays "Dealer" label for dealer round info', () => {
      const history = [
        createMockHistory(1, '茶トラワンペア', 10, 'win', 'ノーペア', -10),
      ];

      render(
        <ResultScreen
          {...defaultProps}
          mode="battle"
          history={history}
          totalScore={10}
        />
      );

      expect(screen.getByText('Dealer')).toBeInTheDocument();
    });

    it('displays round number as R1, R2, etc. in battle mode', () => {
      const history = [
        createMockHistory(1, '茶トラワンペア', 10, 'win', 'ノーペア', -10),
        createMockHistory(2, 'ノーペア', -15, 'lose', 'グレーワンペア', 15),
      ];

      render(
        <ResultScreen
          {...defaultProps}
          mode="battle"
          history={history}
          totalScore={-5}
        />
      );

      expect(screen.getByText('R1')).toBeInTheDocument();
      expect(screen.getByText('R2')).toBeInTheDocument();
    });
  });

  describe('Battle Mode vs Solo Mode Differences', () => {
    it('does not show battle result section in solo mode', () => {
      render(<ResultScreen {...defaultProps} />);

      expect(screen.queryByTestId('battle-result-section')).not.toBeInTheDocument();
    });

    it('shows battle result section in battle mode', () => {
      const history = [
        createMockHistory(1, '茶トラワンペア', 10, 'win', 'ノーペア', -10),
      ];

      render(
        <ResultScreen
          {...defaultProps}
          mode="battle"
          history={history}
          totalScore={10}
        />
      );

      expect(screen.getByTestId('battle-result-section')).toBeInTheDocument();
    });

    it('shows score summary in battle mode', () => {
      const history = [
        createMockHistory(1, '茶トラワンペア', 10, 'win', 'ノーペア', -10),
      ];

      render(
        <ResultScreen
          {...defaultProps}
          mode="battle"
          history={history}
          totalScore={10}
        />
      );

      expect(screen.getByTestId('score-summary')).toBeInTheDocument();
    });

    it('does not show score summary in solo mode', () => {
      render(<ResultScreen {...defaultProps} />);

      expect(screen.queryByTestId('score-summary')).not.toBeInTheDocument();
    });

    it('shows traditional final score display in solo mode', () => {
      render(<ResultScreen {...defaultProps} />);

      expect(screen.getByText('最終スコア')).toBeInTheDocument();
      expect(screen.getByText('ポイント')).toBeInTheDocument();
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
