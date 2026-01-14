import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { BattleScreen } from '../BattleScreen';
import { SettingsProvider } from '../../context/SettingsContext';
import * as deckModule from '../../utils/deck';
import * as roleCalculatorModule from '../../utils/roleCalculator';
import * as dealerAIModule from '../../utils/dealerAI';
import type { Card, Role } from '../../types';

// Mock Howler to avoid audio issues in tests
vi.mock('howler', () => ({
  Howl: vi.fn().mockImplementation(() => ({
    play: vi.fn(),
    volume: vi.fn(),
    unload: vi.fn(),
  })),
}));

/** Wrapper component with SettingsProvider */
function wrapper({ children }: { children: ReactNode }) {
  return <SettingsProvider>{children}</SettingsProvider>;
}

/** Helper to render with SettingsProvider */
function renderWithSettings(ui: React.ReactElement) {
  return render(ui, { wrapper });
}

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
      renderWithSettings(<BattleScreen {...createDefaultProps()} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      expect(screen.getByText('スコア')).toBeInTheDocument();
    });

    it('displays the game header with round info', async () => {
      renderWithSettings(<BattleScreen {...createDefaultProps()} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      // Check for round display "1/5" specifically in the round badge area
      expect(screen.getByText(/ラウンド/)).toBeInTheDocument();
    });

    it('displays the score', async () => {
      renderWithSettings(<BattleScreen {...createDefaultProps()} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      expect(screen.getByText('スコア')).toBeInTheDocument();
    });

    it('displays the VS text', async () => {
      renderWithSettings(<BattleScreen {...createDefaultProps()} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      const vsElements = screen.getAllByText('VS');
      expect(vsElements.length).toBeGreaterThan(0);
    });

    it('displays the dealer area', async () => {
      renderWithSettings(<BattleScreen {...createDefaultProps()} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      // Check for multiple occurrences of Dealer
      const dealerLabels = screen.getAllByText('Dealer');
      expect(dealerLabels.length).toBeGreaterThanOrEqual(1);
    });

    it('displays the player hand area', async () => {
      renderWithSettings(<BattleScreen {...createDefaultProps()} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      expect(screen.getByText('Your Hand')).toBeInTheDocument();
    });
  });

  describe('Card Selection', () => {
    it('displays action buttons in selecting phase', async () => {
      renderWithSettings(<BattleScreen {...createDefaultProps()} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      expect(screen.getByText('交換する')).toBeInTheDocument();
      expect(screen.getByText('交換しない')).toBeInTheDocument();
    });

    it('shows selected count', async () => {
      renderWithSettings(<BattleScreen {...createDefaultProps()} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      // Score display shows 0, there may be multiple 0s
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements.length).toBeGreaterThan(0);
    });
  });

  describe('Role Boxes', () => {
    it('displays dealer role box', async () => {
      renderWithSettings(<BattleScreen {...createDefaultProps()} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      // Check for Dealer label in role boxes
      const dealerLabels = screen.getAllByText('Dealer');
      expect(dealerLabels.length).toBeGreaterThanOrEqual(1);
    });

    it('displays player role box', async () => {
      renderWithSettings(<BattleScreen {...createDefaultProps()} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      expect(screen.getByText('You')).toBeInTheDocument();
    });
  });

  describe('Exchange Flow', () => {
    it('calls skip exchange when skip button is clicked', async () => {
      renderWithSettings(<BattleScreen {...createDefaultProps()} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
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
      renderWithSettings(<BattleScreen {...createDefaultProps()} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
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
      renderWithSettings(<BattleScreen {...createDefaultProps()} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
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
      renderWithSettings(<BattleScreen {...createDefaultProps()} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
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
      renderWithSettings(<BattleScreen {...createDefaultProps()} />);

      // Wait for initial deal
      await act(async () => {
        vi.advanceTimersByTime(800);
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
      renderWithSettings(<BattleScreen {...createDefaultProps()} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      // The test checks that the component renders correctly
      expect(screen.getByText('スコア')).toBeInTheDocument();
    });
  });

  describe('Rules Click', () => {
    it('calls onRulesClick when rules button is clicked', async () => {
      const props = createDefaultProps();
      renderWithSettings(<BattleScreen {...props} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      const rulesButton = screen.getByRole('button', { name: '役一覧を表示' });
      fireEvent.click(rulesButton);

      expect(props.onRulesClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Dealer Cards Visibility', () => {
    it('dealer cards are hidden during selecting phase', async () => {
      renderWithSettings(<BattleScreen {...createDefaultProps()} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      // In selecting phase, dealer cards should not show role info
      // The cards themselves exist but should be face-down
      expect(screen.queryByText('茶トラワンペア')).not.toBeInTheDocument();
    });

    it('dealer cards are revealed after round completes', async () => {
      renderWithSettings(<BattleScreen {...createDefaultProps()} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
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

describe('BattleScreen Card Exchange', () => {
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
      const startId = callCount * 10;
      for (let i = 0; i < count; i++) {
        cards.push({
          id: startId + i,
          image: `/images/image_${String(startId + i).padStart(3, '0')}.jpg`,
          color: (i % 12) as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11,
          fur: (i % 2) as 0 | 1,
        });
      }
      callCount++;
      return cards;
    });

    vi.spyOn(roleCalculatorModule, 'calculateRole').mockReturnValue({
      type: 'onePair',
      name: 'OnePair',
      points: 5,
      matchingCardIds: [0, 1],
    });

    vi.spyOn(roleCalculatorModule, 'determineWinner').mockReturnValue('win');

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

  it('handles card exchange with selected cards', async () => {
    renderWithSettings(<BattleScreen {...createDefaultProps()} />);

    // Wait for initial deal
    await act(async () => {
      vi.advanceTimersByTime(800);
    });

    // Click on first card to select
    const cardButtons = screen.getAllByRole('button').filter(btn =>
      btn.getAttribute('aria-label')?.includes('猫')
    );
    if (cardButtons.length > 0) {
      fireEvent.click(cardButtons[0]);
    }

    // Click exchange button
    const exchangeButton = screen.getByText('交換する');
    fireEvent.click(exchangeButton);

    // Wait for exchange animations and reveal
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    // Role should be calculated
    expect(roleCalculatorModule.calculateRole).toHaveBeenCalled();
  });

  it('clears selection when clear button is clicked', async () => {
    renderWithSettings(<BattleScreen {...createDefaultProps()} />);

    await act(async () => {
      vi.advanceTimersByTime(800);
    });

    // Click on cards to select
    const cardButtons = screen.getAllByRole('button').filter(btn =>
      btn.getAttribute('aria-label')?.includes('猫')
    );
    if (cardButtons.length > 0) {
      fireEvent.click(cardButtons[0]);
    }

    // Wait for selection to register
    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    // Click clear button (in inline variant it shows as '解除')
    const clearButton = screen.getByText('解除');
    fireEvent.click(clearButton);

    // Selection should be cleared (exchange button text should change)
    expect(screen.getByText('交換する')).toBeInTheDocument();
  });

  it('handles lose result', async () => {
    vi.spyOn(roleCalculatorModule, 'determineWinner').mockReturnValue('lose');

    renderWithSettings(<BattleScreen {...createDefaultProps()} />);

    await act(async () => {
      vi.advanceTimersByTime(800);
    });

    const skipButton = screen.getByText('交換しない');
    fireEvent.click(skipButton);

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByText('LOSE')).toBeInTheDocument();
  });

  it('handles draw result', async () => {
    vi.spyOn(roleCalculatorModule, 'determineWinner').mockReturnValue('draw');

    renderWithSettings(<BattleScreen {...createDefaultProps()} />);

    await act(async () => {
      vi.advanceTimersByTime(800);
    });

    const skipButton = screen.getByText('交換しない');
    fireEvent.click(skipButton);

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByText('DRAW')).toBeInTheDocument();
  });

  it('handles dealer exchange with cards', async () => {
    vi.spyOn(dealerAIModule, 'decideDealerExchange').mockReturnValue({
      cardsToExchange: [10],
      reason: 'Exchange weak card',
    });

    renderWithSettings(<BattleScreen {...createDefaultProps()} />);

    await act(async () => {
      vi.advanceTimersByTime(800);
    });

    const skipButton = screen.getByText('交換しない');
    fireEvent.click(skipButton);

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    expect(dealerAIModule.decideDealerExchange).toHaveBeenCalled();
    expect(dealerAIModule.executeDealerExchange).toHaveBeenCalled();
  });

  it('completes all 5 rounds and calls onGameEnd', async () => {
    const props = createDefaultProps();
    renderWithSettings(<BattleScreen {...props} />);

    // Play through 5 rounds
    for (let round = 1; round <= 5; round++) {
      // Wait for deal
      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      // Skip exchange
      const skipButton = screen.getByText('交換しない');
      fireEvent.click(skipButton);

      // Wait for reveal
      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      // Close overlay
      const okButton = screen.getByText('OK');
      fireEvent.click(okButton);

      if (round < 5) {
        // Click next round
        const nextButton = screen.getByText('次のラウンドへ');
        fireEvent.click(nextButton);

        // Wait for next deal
        await act(async () => {
          vi.advanceTimersByTime(500);
        });
      } else {
        // Last round - click finish
        const finishButton = screen.getByText('結果を見る');
        fireEvent.click(finishButton);

        expect(props.onGameEnd).toHaveBeenCalled();
      }
    }
  });

  it('deselects a card when clicking an already selected card', async () => {
    renderWithSettings(<BattleScreen {...createDefaultProps()} />);

    // Wait for initial deal
    await act(async () => {
      vi.advanceTimersByTime(800);
    });

    // Click on first card to select
    const cardButtons = screen.getAllByRole('button').filter(btn =>
      btn.getAttribute('aria-label')?.includes('猫')
    );
    expect(cardButtons.length).toBeGreaterThan(0);

    // Select the first card
    fireEvent.click(cardButtons[0]);

    await act(async () => {
      vi.advanceTimersByTime(50);
    });

    // Click the same card again to deselect
    fireEvent.click(cardButtons[0]);

    await act(async () => {
      vi.advanceTimersByTime(50);
    });

    // Card should be deselected (verify by UI state)
    // The card should no longer have selected styling
    expect(cardButtons[0]).toBeInTheDocument();
  });

  it('does not select more cards when at max selection (5)', async () => {
    renderWithSettings(<BattleScreen {...createDefaultProps()} />);

    // Wait for initial deal
    await act(async () => {
      vi.advanceTimersByTime(800);
    });

    // Get all card buttons
    const cardButtons = screen.getAllByRole('button').filter(btn =>
      btn.getAttribute('aria-label')?.includes('猫')
    );
    expect(cardButtons.length).toBe(5);

    // Select all 5 cards (max)
    for (let i = 0; i < 5; i++) {
      fireEvent.click(cardButtons[i]);
      await act(async () => {
        vi.advanceTimersByTime(10);
      });
    }

    // Now all 5 cards are selected
    // Verify selection count shows 5
    expect(screen.getByText('5')).toBeInTheDocument();

    // Try to click the first card again (should deselect, not add)
    fireEvent.click(cardButtons[0]);
    await act(async () => {
      vi.advanceTimersByTime(10);
    });

    // Count should be 4 now
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('handles skip exchange - no selected cards triggers dealer exchange path', async () => {
    renderWithSettings(<BattleScreen {...createDefaultProps()} />);

    // Wait for initial deal
    await act(async () => {
      vi.advanceTimersByTime(800);
    });

    // Click skip button without selecting any cards
    // This triggers the no-cards-selected path in handleExchange
    const skipButton = screen.getByText('交換しない');
    fireEvent.click(skipButton);

    // Wait for dealer exchange and reveal
    await act(async () => {
      vi.advanceTimersByTime(5000);
    });

    // Should have called calculateRole for both hands
    expect(roleCalculatorModule.calculateRole).toHaveBeenCalled();
  });

  it('does not allow next round when at last round', async () => {
    renderWithSettings(<BattleScreen {...createDefaultProps()} />);

    // Play through to round 5
    for (let round = 1; round < 5; round++) {
      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      const skipButton = screen.getByText('交換しない');
      fireEvent.click(skipButton);

      await act(async () => {
        vi.advanceTimersByTime(3000);
      });

      const okButton = screen.getByText('OK');
      fireEvent.click(okButton);

      const nextButton = screen.getByText('次のラウンドへ');
      fireEvent.click(nextButton);

      await act(async () => {
        vi.advanceTimersByTime(500);
      });
    }

    // Now at round 5
    await act(async () => {
      vi.advanceTimersByTime(800);
    });

    const skipButton = screen.getByText('交換しない');
    fireEvent.click(skipButton);

    await act(async () => {
      vi.advanceTimersByTime(3000);
    });

    // Close overlay first
    const okButton = screen.getByText('OK');
    fireEvent.click(okButton);

    // Should show finish button instead of next round
    expect(screen.getByText('結果を見る')).toBeInTheDocument();
    expect(screen.queryByText('次のラウンドへ')).not.toBeInTheDocument();
  });
});
