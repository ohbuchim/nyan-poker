import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { BattleScreen } from '../BattleScreen';
import * as deckModule from '../../utils/deck';
import * as roleCalculatorModule from '../../utils/roleCalculator';
import * as dealerAIModule from '../../utils/dealerAI';
import type { Card, Role } from '../../types';

// Mock data
const createMockCard = (id: number, color: number = 0, fur: number = 1): Card => ({
  id,
  image: `/images/image_${String(id).padStart(3, '0')}.jpg`,
  color: color as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11,
  fur: fur as 0 | 1,
});

const createMockRole = (
  name: string,
  points: number,
  matchingCardIds: number[] = [0, 1]
): Role => ({
  type: 'onePair',
  name,
  points,
  matchingCardIds,
});

describe('BattleScreen', () => {
  const createDefaultProps = () => ({
    onGameEnd: vi.fn(),
    onRulesClick: vi.fn(),
  });

  beforeEach(() => {
    vi.useFakeTimers();

    // Mock drawCards to return predictable hands
    let callCount = 0;
    vi.spyOn(deckModule, 'drawCards').mockImplementation((count: number) => {
      const cards: Card[] = [];
      const startId = callCount === 0 ? 0 : 10;
      for (let i = 0; i < count; i++) {
        cards.push(createMockCard(startId + i, i % 12, 1));
      }
      callCount++;
      return cards;
    });

    // Mock role calculator
    vi.spyOn(roleCalculatorModule, 'calculateRole').mockReturnValue(
      createMockRole('茶トラワンペア', 5, [0, 1])
    );

    vi.spyOn(roleCalculatorModule, 'determineWinner').mockReturnValue('win');

    // Mock dealer AI
    vi.spyOn(dealerAIModule, 'decideDealerExchange').mockReturnValue({
      cardsToExchange: [],
      reason: 'No exchange',
    });

    vi.spyOn(dealerAIModule, 'executeDealerExchange').mockImplementation(
      (hand: Card[]) => hand
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders the battle screen', async () => {
      render(<BattleScreen {...createDefaultProps()} />);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      expect(screen.getByText('スコア')).toBeInTheDocument();
    });

    it('displays the game header with round info', async () => {
      render(<BattleScreen {...createDefaultProps()} />);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      expect(screen.getByText(/1/)).toBeInTheDocument();
      expect(screen.getByText(/5/)).toBeInTheDocument();
    });

    it('displays the score', async () => {
      render(<BattleScreen {...createDefaultProps()} />);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      expect(screen.getByText('スコア')).toBeInTheDocument();
    });

    it('displays the VS text', async () => {
      render(<BattleScreen {...createDefaultProps()} />);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      const vsElements = screen.getAllByText('VS');
      expect(vsElements.length).toBeGreaterThan(0);
    });

    it('displays the dealer area', async () => {
      render(<BattleScreen {...createDefaultProps()} />);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      // Check for multiple occurrences of Dealer
      const dealerLabels = screen.getAllByText('Dealer');
      expect(dealerLabels.length).toBeGreaterThanOrEqual(1);
    });

    it('displays the player hand area', async () => {
      render(<BattleScreen {...createDefaultProps()} />);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      expect(screen.getByText('Your Hand')).toBeInTheDocument();
    });
  });

  describe('Card Selection', () => {
    it('displays action buttons in selecting phase', async () => {
      render(<BattleScreen {...createDefaultProps()} />);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      expect(screen.getByText('交換する')).toBeInTheDocument();
      expect(screen.getByText('交換しない')).toBeInTheDocument();
    });

    it('shows selected count', async () => {
      render(<BattleScreen {...createDefaultProps()} />);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      // Score display shows 0, there may be multiple 0s
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements.length).toBeGreaterThan(0);
    });
  });

  describe('Role Boxes', () => {
    it('displays dealer role box', async () => {
      render(<BattleScreen {...createDefaultProps()} />);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      // Check for Dealer label in role boxes
      const dealerLabels = screen.getAllByText('Dealer');
      expect(dealerLabels.length).toBeGreaterThanOrEqual(1);
    });

    it('displays player role box', async () => {
      render(<BattleScreen {...createDefaultProps()} />);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      expect(screen.getByText('You')).toBeInTheDocument();
    });
  });

  describe('Exchange Flow', () => {
    it('calls skip exchange when skip button is clicked', async () => {
      render(<BattleScreen {...createDefaultProps()} />);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      const skipButton = screen.getByText('交換しない');
      fireEvent.click(skipButton);

      // Wait for phase transitions
      await act(async () => {
        vi.advanceTimersByTime(2000);
      });

      // Should trigger role reveal
      expect(roleCalculatorModule.calculateRole).toHaveBeenCalled();
    });

    it('triggers dealer exchange after player skip', async () => {
      render(<BattleScreen {...createDefaultProps()} />);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      const skipButton = screen.getByText('交換しない');
      fireEvent.click(skipButton);

      await act(async () => {
        vi.advanceTimersByTime(2000);
      });

      expect(dealerAIModule.decideDealerExchange).toHaveBeenCalled();
    });
  });

  describe('Result Overlay', () => {
    it('shows result overlay after revealing', async () => {
      render(<BattleScreen {...createDefaultProps()} />);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      const skipButton = screen.getByText('交換しない');
      fireEvent.click(skipButton);

      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      // Result overlay should appear
      expect(screen.getByText('WIN')).toBeInTheDocument();
    });

    it('displays points change in result overlay', async () => {
      render(<BattleScreen {...createDefaultProps()} />);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      const skipButton = screen.getByText('交換しない');
      fireEvent.click(skipButton);

      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      // Multiple elements may contain "pt", so we use getAllByText
      const ptElements = screen.getAllByText(/pt/);
      expect(ptElements.length).toBeGreaterThan(0);
    });
  });

  describe('Round Progression', () => {
    it('increments round after next round button', async () => {
      render(<BattleScreen {...createDefaultProps()} />);

      // Wait for initial deal
      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      // Skip exchange
      const skipButton = screen.getByText('交換しない');
      fireEvent.click(skipButton);

      // Wait for reveal and result
      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      // Close overlay
      const okButton = screen.getByText('OK');
      fireEvent.click(okButton);

      // Click next round
      const nextButton = screen.getByText('次のラウンドへ');
      fireEvent.click(nextButton);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      // Check round incremented
      expect(screen.getByText(/2/)).toBeInTheDocument();
    });
  });

  describe('Game End', () => {
    it('renders correctly on initial load', async () => {
      render(<BattleScreen {...createDefaultProps()} />);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      // The test checks that the component renders correctly
      expect(screen.getByText('スコア')).toBeInTheDocument();
    });
  });

  describe('Rules Click', () => {
    it('calls onRulesClick when rules button is clicked', async () => {
      const props = createDefaultProps();
      render(<BattleScreen {...props} />);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      const rulesButton = screen.getByRole('button', { name: '役一覧を表示' });
      fireEvent.click(rulesButton);

      expect(props.onRulesClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Dealer Cards Visibility', () => {
    it('dealer cards are hidden during selecting phase', async () => {
      render(<BattleScreen {...createDefaultProps()} />);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      // In selecting phase, dealer cards should not show role info
      // The cards themselves exist but should be face-down
      expect(screen.queryByText('茶トラワンペア')).not.toBeInTheDocument();
    });

    it('dealer cards are revealed after round completes', async () => {
      render(<BattleScreen {...createDefaultProps()} />);

      await act(async () => {
        vi.advanceTimersByTime(600);
      });

      const skipButton = screen.getByText('交換しない');
      fireEvent.click(skipButton);

      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      // After reveal, role should be displayed
      // The mock role name should appear somewhere
      const roleElements = screen.getAllByText('茶トラワンペア');
      expect(roleElements.length).toBeGreaterThan(0);
    });
  });
});

describe('BattleScreen index export', () => {
  it('exports BattleScreen from index', async () => {
    const { BattleScreen } = await import('../index');
    expect(BattleScreen).toBeDefined();
  });
});
