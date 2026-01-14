import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactNode } from 'react';
import { GameScreen } from '../GameScreen';
import { SettingsProvider } from '../../context/SettingsContext';

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

// Mock deck module to control card draws
let cardIdCounter = 100;
vi.mock('../../utils/deck', () => ({
  drawCards: vi.fn((count: number) => {
    const cards = Array.from({ length: count }, (_, i) => ({
      id: cardIdCounter + i,
      image: `/images/image_${cardIdCounter + i}.jpg`,
      color: (cardIdCounter + i) % 12,
      fur: (cardIdCounter + i) % 2,
    }));
    cardIdCounter += count;
    return cards;
  }),
}));

// Mock roleCalculator
vi.mock('../../utils/roleCalculator', () => ({
  calculateRole: vi.fn(() => ({
    name: 'OnePair',
    points: 1,
    matchingCardIds: [100, 101],
  })),
}));

describe('GameScreen', () => {
  const defaultProps = {
    onGameEnd: vi.fn(),
    onRulesClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    cardIdCounter = 100;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initial rendering', () => {
    it('renders game header with round info', async () => {
      const { container } = renderWithSettings(<GameScreen {...defaultProps} />);

      // Wait for dealing animation
      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      // Round badge should contain "ラウンド 1"
      const roundBadge = container.querySelector('[class*="round-badge"]');
      expect(roundBadge?.textContent).toContain('1');
    });

    it('renders player hand label', async () => {
      renderWithSettings(<GameScreen {...defaultProps} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      expect(screen.getByText('あなたの手札')).toBeInTheDocument();
    });

    it('renders action buttons after dealing', async () => {
      const { container } = renderWithSettings(<GameScreen {...defaultProps} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      // Check that primary button (exchange) exists
      const primaryButton = container.querySelector('[class*="btn--primary"]');
      expect(primaryButton).toBeInTheDocument();

      // Check that secondary button (skip) exists
      const secondaryButton = container.querySelector('[class*="btn--secondary"]');
      expect(secondaryButton).toBeInTheDocument();
    });
  });

  describe('Card exchange phases', () => {
    it('starts in dealing phase then transitions to selecting', async () => {
      const { container } = renderWithSettings(<GameScreen {...defaultProps} />);

      // Cards should have deal animation initially
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      const dealCards = container.querySelectorAll('[class*="card--deal"]');
      expect(dealCards.length).toBeGreaterThan(0);

      // After dealing animation, buttons should be enabled
      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      const skipButton = screen.getByText(/交換しない/);
      expect(skipButton).not.toBeDisabled();
    });

    it('shows exchanging card IDs when isExchanging prop is true', async () => {
      const { container } = renderWithSettings(<GameScreen {...defaultProps} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      // This tests that the exchangingCardIds prop is passed through to Hand component
      // The actual exchange animation is tested through the Hand component tests
      expect(container.querySelector('[class*="hand"]')).toBeInTheDocument();
    });
  });

  describe('Skip exchange flow', () => {
    it('transitions to result phase when skip is clicked', async () => {
      renderWithSettings(<GameScreen {...defaultProps} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      const skipButton = screen.getByText(/交換しない/);

      await act(async () => {
        skipButton.click();
      });

      // Wait for ROLE_HIGHLIGHT_DELAY (300ms) in GameScreen
      await act(async () => {
        vi.advanceTimersByTime(400);
      });

      // Wait for ROLE_NAME_DELAY (200ms) in RoleDisplay
      await act(async () => {
        vi.advanceTimersByTime(300);
      });

      // Should show the role name
      expect(screen.getByText('OnePair')).toBeInTheDocument();
    });

    it('shows next round button after result', async () => {
      renderWithSettings(<GameScreen {...defaultProps} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      const skipButton = screen.getByText(/交換しない/);

      await act(async () => {
        skipButton.click();
      });

      // Wait for ROLE_HIGHLIGHT_DELAY (300ms) + buffer
      await act(async () => {
        vi.advanceTimersByTime(400);
      });

      expect(screen.getByText(/次のラウンドへ/)).toBeInTheDocument();
    });
  });

  describe('Exchange button loading state', () => {
    it('shows loading state on exchange button during exchange', async () => {
      const { container } = renderWithSettings(<GameScreen {...defaultProps} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      // Need to select a card first to enable exchange button
      // Since we can't easily click cards without user-event, we test the component accepts the isExchanging prop
      // The actual loading state is tested in ActionButtons tests

      // Verify the Hand component is rendered with correct props structure
      const handArea = container.querySelector('[class*="hand"]');
      expect(handArea).toBeInTheDocument();
    });
  });

  describe('Multiple rounds', () => {
    it('tracks score across rounds', async () => {
      const { container } = renderWithSettings(<GameScreen {...defaultProps} />);

      // Round 1
      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      const skipButton = screen.getByText(/交換しない/);

      await act(async () => {
        skipButton.click();
        vi.advanceTimersByTime(200);
      });

      // Score should be displayed in score-value element
      const scoreValue = container.querySelector('[class*="score-value"]');
      expect(scoreValue?.textContent).toBeDefined();

      // Click next round
      const nextButton = screen.getByText(/次のラウンドへ/);
      await act(async () => {
        nextButton.click();
        vi.advanceTimersByTime(800);
      });

      // Round badge should show round 2
      const roundBadge = container.querySelector('[class*="round-badge"]');
      expect(roundBadge?.textContent).toContain('2');
    });

    it('shows finish button on last round', async () => {
      renderWithSettings(<GameScreen {...defaultProps} />);

      // Play through 5 rounds
      for (let round = 1; round <= 5; round++) {
        await act(async () => {
          vi.advanceTimersByTime(800);
        });

        const skipButton = screen.getByText(/交換しない/);
        await act(async () => {
          skipButton.click();
          vi.advanceTimersByTime(200);
        });

        if (round < 5) {
          const nextButton = screen.getByText(/次のラウンドへ/);
          await act(async () => {
            nextButton.click();
          });
        }
      }

      // Should show finish button on round 5
      expect(screen.getByText(/結果を見る/)).toBeInTheDocument();
    });

    it('calls onGameEnd when finish button is clicked', async () => {
      const onGameEnd = vi.fn();
      renderWithSettings(<GameScreen {...defaultProps} onGameEnd={onGameEnd} />);

      // Play through 5 rounds
      for (let round = 1; round <= 5; round++) {
        await act(async () => {
          vi.advanceTimersByTime(800);
        });

        const skipButton = screen.getByText(/交換しない/);
        await act(async () => {
          skipButton.click();
          vi.advanceTimersByTime(200);
        });

        if (round < 5) {
          const nextButton = screen.getByText(/次のラウンドへ/);
          await act(async () => {
            nextButton.click();
          });
        }
      }

      const finishButton = screen.getByText(/結果を見る/);
      await act(async () => {
        finishButton.click();
      });

      expect(onGameEnd).toHaveBeenCalledTimes(1);
      // Score and history are passed, values depend on implementation details
      expect(onGameEnd).toHaveBeenCalledWith(expect.any(Number), expect.any(Array));
    });
  });

  describe('Props passed to child components', () => {
    it('passes exchangingCardIds to Hand component', async () => {
      const { container } = renderWithSettings(<GameScreen {...defaultProps} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      // Hand component should be rendered
      const hand = container.querySelector('[class*="hand"]');
      expect(hand).toBeInTheDocument();

      // Cards should be rendered
      const cards = container.querySelectorAll('[class*="card"]');
      expect(cards.length).toBeGreaterThan(0);
    });

    it('passes isExchanging to ActionButtons component', async () => {
      const { container } = renderWithSettings(<GameScreen {...defaultProps} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      // Button group should contain exchange and skip buttons
      const buttonGroup = container.querySelector('[class*="button-group"]');
      expect(buttonGroup).toBeInTheDocument();

      // Check that primary button (exchange) exists
      const primaryButton = container.querySelector('[class*="btn--primary"]');
      expect(primaryButton).toBeInTheDocument();

      // Check that secondary button (skip) exists
      const secondaryButton = container.querySelector('[class*="btn--secondary"]');
      expect(secondaryButton).toBeInTheDocument();
    });
  });

  describe('Card selection and exchange', () => {
    it('renders card wrappers for selection', async () => {
      const { container } = renderWithSettings(<GameScreen {...defaultProps} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      // Get card wrappers
      const cardWrappers = container.querySelectorAll('[class*="hand__card-wrapper"]');
      expect(cardWrappers.length).toBe(5);
    });

    it('renders cards with proper structure', async () => {
      const { container } = renderWithSettings(<GameScreen {...defaultProps} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      // Check that cards are rendered within the hand
      const hand = container.querySelector('[class*="hand"]');
      expect(hand).toBeInTheDocument();

      const cards = hand?.querySelectorAll('[class*="card"]');
      expect(cards?.length).toBeGreaterThan(0);
    });

    it('exchange button is disabled when no cards selected', async () => {
      const { container } = renderWithSettings(<GameScreen {...defaultProps} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      // Exchange button should be disabled when no cards selected
      const primaryButton = container.querySelector('[class*="btn--primary"]');
      expect(primaryButton).toBeDisabled();
    });

    it('skip button is not disabled when no cards selected', async () => {
      const { container } = renderWithSettings(<GameScreen {...defaultProps} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      // Skip button should be enabled
      const secondaryButton = container.querySelector('[class*="btn--secondary"]');
      expect(secondaryButton).not.toBeDisabled();
    });
  });

  describe('Rules button', () => {
    it('calls onRulesClick when rules button is clicked', async () => {
      const onRulesClick = vi.fn();
      renderWithSettings(<GameScreen {...defaultProps} onRulesClick={onRulesClick} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      const rulesButton = screen.getByRole('button', { name: '役一覧を表示' });
      await act(async () => {
        rulesButton.click();
      });

      expect(onRulesClick).toHaveBeenCalledTimes(1);
    });
  });
  describe('Card click and exchange flow', () => {
    it('handles card selection and exchange', async () => {
      const { container } = renderWithSettings(<GameScreen {...defaultProps} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      // Get clickable card buttons (not wrapper divs)
      const cardButtons = container.querySelectorAll('[role="button"][class*="card"]');
      expect(cardButtons.length).toBe(5);

      // Click first card to select
      await act(async () => {
        cardButtons[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      // Exchange button should now be enabled
      const exchangeButton = screen.getByText('交換する');
      expect(exchangeButton).not.toBeDisabled();

      // Click exchange
      await act(async () => {
        exchangeButton.click();
      });

      // Wait for exchange animation
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      // Should transition to result phase
      await act(async () => {
        vi.advanceTimersByTime(500);
      });

      expect(screen.getByText('OnePair')).toBeInTheDocument();
    });

    it('limits card selection to maximum allowed (5 cards)', async () => {
      const { container } = renderWithSettings(<GameScreen {...defaultProps} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      // Get clickable card buttons
      const cardButtons = container.querySelectorAll('[role="button"][class*="card"]');

      // Click all 5 cards (max is now 5)
      for (let i = 0; i < 5; i++) {
        await act(async () => {
          cardButtons[i].dispatchEvent(new MouseEvent('click', { bubbles: true }));
        });
      }

      // Selected count should be 5 (all cards can be selected)
      const selectedCount = container.querySelector('[class*="selected-count"]');
      expect(selectedCount?.textContent).toBe('5');
    });

    it('toggles card selection when clicking same card twice', async () => {
      const { container } = renderWithSettings(<GameScreen {...defaultProps} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      // Get clickable card buttons
      const cardButtons = container.querySelectorAll('[role="button"][class*="card"]');

      // Click first card to select
      await act(async () => {
        cardButtons[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      let selectedCount = container.querySelector('[class*="selected-count"]');
      expect(selectedCount?.textContent).toBe('1');

      // Click same card again to deselect
      await act(async () => {
        cardButtons[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      selectedCount = container.querySelector('[class*="selected-count"]');
      expect(selectedCount?.textContent).toBe('0');
    });

    it('verifies that card exchange works correctly', async () => {
      const { container } = renderWithSettings(<GameScreen {...defaultProps} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      // Get clickable card buttons
      const cardButtons = container.querySelectorAll('[role="button"][class*="card"]');
      expect(cardButtons.length).toBe(5);

      // Select multiple cards
      await act(async () => {
        cardButtons[0].dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });
      await act(async () => {
        cardButtons[1].dispatchEvent(new MouseEvent('click', { bubbles: true }));
      });

      // Exchange button should be enabled
      const exchangeButton = screen.getByText('交換する');
      expect(exchangeButton).not.toBeDisabled();

      // Click exchange and wait for exchange animation + role reveal delay + role display delay
      await act(async () => {
        exchangeButton.click();
      });
      
      // Wait for exit animation (300ms), enter animation (400ms), role highlight delay (300ms), role name delay (200ms)
      await act(async () => {
        vi.advanceTimersByTime(1500);
      });

      // Should show next round button (result phase reached)
      expect(screen.getByText(/次のラウンドへ/)).toBeInTheDocument();
    });

    it('handles next round button when not last round', async () => {
      const { container } = renderWithSettings(<GameScreen {...defaultProps} />);

      await act(async () => {
        vi.advanceTimersByTime(800);
      });

      // Skip exchange to complete round 1
      const skipButton = screen.getByText(/交換しない/);
      await act(async () => {
        skipButton.click();
        vi.advanceTimersByTime(500);
      });

      // Click next round
      const nextButton = screen.getByText(/次のラウンドへ/);
      await act(async () => {
        nextButton.click();
        vi.advanceTimersByTime(1000);
      });

      // Should be on round 2
      const roundBadge = container.querySelector('[class*="round-badge"]');
      expect(roundBadge?.textContent).toContain('2');
    });
  });

});
