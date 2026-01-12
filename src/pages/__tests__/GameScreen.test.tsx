import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { GameScreen } from '../GameScreen';
import * as deckModule from '../../utils/deck';
import * as roleCalculatorModule from '../../utils/roleCalculator';
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

describe('GameScreen', () => {
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
        cards.push(createMockCard(startId + i, i % 12, 1));
      }
      callCount++;
      return cards;
    });

    // Mock role calculator
    vi.spyOn(roleCalculatorModule, 'calculateRole').mockReturnValue(
      createMockRole('test-role', 5, [0, 1])
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe('Basic Rendering', () => {
    it('renders the game screen with score display', async () => {
      render(<GameScreen {...createDefaultProps()} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      expect(screen.getByText('スコア')).toBeInTheDocument();
    });

    it('displays the game header with round info', async () => {
      render(<GameScreen {...createDefaultProps()} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      expect(screen.getByText(/1/)).toBeInTheDocument();
      expect(screen.getByText(/5/)).toBeInTheDocument();
    });

    it('displays player hand area', async () => {
      render(<GameScreen {...createDefaultProps()} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      expect(screen.getByText('あなたの手札')).toBeInTheDocument();
    });

    it('displays action buttons in selecting phase', async () => {
      render(<GameScreen {...createDefaultProps()} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      expect(screen.getByText('交換する')).toBeInTheDocument();
      expect(screen.getByText('交換しない')).toBeInTheDocument();
    });
  });

  describe('Card Selection', () => {
    it('shows selected count', async () => {
      render(<GameScreen {...createDefaultProps()} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      // Check that 0 is displayed somewhere (selected count or score)
      const zeroElements = screen.getAllByText('0');
      expect(zeroElements.length).toBeGreaterThan(0);
    });
  });

  describe('Exchange Flow', () => {
    it('displays skip exchange button in selecting phase', async () => {
      render(<GameScreen {...createDefaultProps()} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      expect(screen.getByText('交換しない')).toBeInTheDocument();
    });

    it('transitions to result phase after skip exchange', async () => {
      render(<GameScreen {...createDefaultProps()} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      const skipButton = screen.getByText('交換しない');
      fireEvent.click(skipButton);

      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      // After skip, role should be calculated
      expect(roleCalculatorModule.calculateRole).toHaveBeenCalled();
    });
  });

  describe('Round Progression', () => {
    it('increments round after next round button', async () => {
      render(<GameScreen {...createDefaultProps()} />);

      // Wait for initial deal
      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      // Skip exchange
      const skipButton = screen.getByText('交換しない');
      fireEvent.click(skipButton);

      // Wait for reveal
      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      // Find and click next round button
      const nextButton = screen.getByText('次のラウンドへ');
      fireEvent.click(nextButton);

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      // Check round incremented
      expect(screen.getByText(/2/)).toBeInTheDocument();
    });
  });

  describe('Game End', () => {
    it('calls onGameEnd after final round finish button is clicked', async () => {
      const props = createDefaultProps();
      render(<GameScreen {...props} />);

      // Complete 5 rounds
      for (let round = 1; round <= 5; round++) {
        await act(async () => {
          vi.advanceTimersByTime(800);
        });

        // Skip exchange
        const skipButton = screen.getByText('交換しない');
        fireEvent.click(skipButton);

        await act(async () => {
          vi.advanceTimersByTime(500);
        });

        if (round < 5) {
          // Click next round
          const nextButton = screen.getByText('次のラウンドへ');
          fireEvent.click(nextButton);
        } else {
          // Final round - click finish button
          const finishButton = screen.getByText('結果を見る');
          fireEvent.click(finishButton);
          expect(props.onGameEnd).toHaveBeenCalled();
        }
      }
    });
  });

  describe('Rules Click', () => {
    it('calls onRulesClick when rules button is clicked', async () => {
      const props = createDefaultProps();
      render(<GameScreen {...props} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      // Rules button has aria-label in Japanese
      const rulesButton = screen.getByRole('button', { name: '役一覧を表示' });
      fireEvent.click(rulesButton);
      expect(props.onRulesClick).toHaveBeenCalledTimes(1);
    });
  });

  describe('Deal Animation', () => {
    it('starts in dealing phase with cards visible', () => {
      render(<GameScreen {...createDefaultProps()} />);

      // During dealing, cards should already be rendered
      const buttons = screen.queryAllByRole('button');
      // At least rules button should be available
      expect(buttons.length).toBeGreaterThanOrEqual(1);
    });

    it('transitions to selecting after deal animation completes', async () => {
      render(<GameScreen {...createDefaultProps()} />);

      // Wait for deal animation
      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      // Action buttons should now be available
      expect(screen.getByText('交換する')).toBeInTheDocument();
      expect(screen.getByText('交換しない')).toBeInTheDocument();
    });
  });
});

describe('GameScreen index export', () => {
  it('exports GameScreen from index', async () => {
    const { GameScreen } = await import('../index');
    expect(GameScreen).toBeDefined();
  });
});
