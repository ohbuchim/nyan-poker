import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Hand } from '../Hand';
import type { Card as CardType } from '../../../types';

// Helper to create mock cards
const createMockCards = (count: number = 5): CardType[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    image: `/images/image_00${i}.jpg`,
    color: (i % 12) as CardType['color'],
    fur: (i % 2) as CardType['fur'],
  }));
};

describe('Hand', () => {
  describe('Rendering', () => {
    it('renders 5 cards', () => {
      const cards = createMockCards();
      render(<Hand cards={cards} />);

      const images = screen.getAllByRole('img');
      expect(images).toHaveLength(5);
    });

    it('renders cards with correct images', () => {
      const cards = createMockCards();
      render(<Hand cards={cards} />);

      const images = screen.getAllByRole('img');
      images.forEach((img, index) => {
        expect(img).toHaveAttribute('src', cards[index].image);
      });
    });

    it('renders card info for each card when showCards is true', () => {
      const cards = createMockCards();
      render(<Hand cards={cards} showCards />);

      // Each card should have color and fur info
      expect(screen.getByText('茶トラ')).toBeInTheDocument();
    });

    it('does not render card info when showCards is false', () => {
      const cards = createMockCards();
      render(<Hand cards={cards} showCards={false} />);

      // Card info should not be visible
      expect(screen.queryByText('茶トラ')).not.toBeInTheDocument();
    });

    it('applies hand class', () => {
      const cards = createMockCards();
      const { container } = render(<Hand cards={cards} />);

      expect(container.firstChild?.className).toContain('hand');
    });

    it('merges custom className', () => {
      const cards = createMockCards();
      const { container } = render(<Hand cards={cards} className="custom-class" />);

      expect(container.firstChild?.className).toContain('custom-class');
      expect(container.firstChild?.className).toContain('hand');
    });
  });

  describe('Card backs', () => {
    it('shows card backs when showCards is false', () => {
      const cards = createMockCards();
      const { container } = render(<Hand cards={cards} showCards={false} />);

      // No images should be visible (cards are face down)
      expect(screen.queryAllByRole('img')).toHaveLength(0);
      // Card back style should be applied to card elements
      const cardsWithBackStyle = container.querySelectorAll('[class*="card--back"]');
      expect(cardsWithBackStyle.length).toBe(5);
    });

    it('shows card fronts when showCards is true', () => {
      const cards = createMockCards();
      const { container } = render(<Hand cards={cards} showCards />);

      expect(screen.getAllByRole('img')).toHaveLength(5);
      expect(container.querySelectorAll('[class*="card__back"]')).toHaveLength(0);
    });
  });

  describe('Selection', () => {
    it('marks selected cards with selected state', () => {
      const cards = createMockCards();
      const { container } = render(<Hand cards={cards} selectedCardIds={[0, 2]} />);

      const cardElements = container.querySelectorAll('[class*="card--"]');
      const selectedCards = Array.from(cardElements).filter((el) =>
        el.className.includes('card--selected')
      );
      expect(selectedCards.length).toBe(2);
    });

    it('calls onCardClick when card is clicked', async () => {
      const handleCardClick = vi.fn();
      const user = userEvent.setup();
      const cards = createMockCards();

      render(<Hand cards={cards} onCardClick={handleCardClick} />);

      const buttons = screen.getAllByRole('button');
      await user.click(buttons[0]);

      expect(handleCardClick).toHaveBeenCalledWith(0);
    });

    it('allows selecting up to 5 cards (all cards)', async () => {
      const handleCardClick = vi.fn();
      const user = userEvent.setup();
      const cards = createMockCards();

      render(<Hand cards={cards} onCardClick={handleCardClick} selectedCardIds={[0, 1, 2, 3, 4]} />);

      // All 5 cards are already selected, clicking any card should deselect it
      const buttons = screen.getAllByRole('button');
      await user.click(buttons[0]); // Click an already selected card to deselect

      expect(handleCardClick).toHaveBeenCalledWith(0);
    });

    it('allows deselecting when at max selection', async () => {
      const handleCardClick = vi.fn();
      const user = userEvent.setup();
      const cards = createMockCards();

      render(<Hand cards={cards} onCardClick={handleCardClick} selectedCardIds={[0, 1, 2]} />);

      const buttons = screen.getAllByRole('button');
      await user.click(buttons[0]); // Deselect already selected card

      expect(handleCardClick).toHaveBeenCalledWith(0);
    });

    it('does not call onCardClick when disabled', async () => {
      const handleCardClick = vi.fn();
      const user = userEvent.setup();
      const cards = createMockCards();

      const { container } = render(<Hand cards={cards} onCardClick={handleCardClick} disabled />);

      // Disabled cards don't have button role
      const cardElements = container.querySelectorAll('[class*="card"]');
      await user.click(cardElements[0]);

      expect(handleCardClick).not.toHaveBeenCalled();
    });
  });

  describe('Dealer hand', () => {
    it('applies dealer class when isDealer is true', () => {
      const cards = createMockCards();
      const { container } = render(<Hand cards={cards} isDealer />);

      expect(container.firstChild?.className).toContain('hand--dealer');
    });

    it('does not allow clicking dealer cards', async () => {
      const handleCardClick = vi.fn();
      const user = userEvent.setup();
      const cards = createMockCards();

      render(<Hand cards={cards} isDealer onCardClick={handleCardClick} />);

      // Dealer cards should not have button role
      expect(screen.queryAllByRole('button')).toHaveLength(0);
    });

    it('renders card info for dealer when showCards is true', () => {
      const cards = createMockCards();
      render(<Hand cards={cards} isDealer showCards />);

      expect(screen.getByText('茶トラ')).toBeInTheDocument();
    });

    it('applies compact style to card info when isDealer is true', () => {
      const cards = createMockCards();
      const { container } = render(<Hand cards={cards} isDealer showCards />);

      const compactInfos = container.querySelectorAll('[class*="card-info--compact"]');
      expect(compactInfos.length).toBe(5);
    });

    it('does not apply compact style to card info for player hand', () => {
      const cards = createMockCards();
      const { container } = render(<Hand cards={cards} showCards />);

      const compactInfos = container.querySelectorAll('[class*="card-info--compact"]');
      expect(compactInfos.length).toBe(0);
    });

    it('applies compact style to cards when isDealer is true', () => {
      const cards = createMockCards();
      const { container } = render(<Hand cards={cards} isDealer showCards />);

      const compactCards = container.querySelectorAll('[class*="card--compact"]');
      expect(compactCards.length).toBe(5);
    });

    it('does not apply compact style to cards for player hand', () => {
      const cards = createMockCards();
      const { container } = render(<Hand cards={cards} showCards />);

      const compactCards = container.querySelectorAll('[class*="card--compact"]');
      expect(compactCards.length).toBe(0);
    });
  });

  describe('Matching cards', () => {
    it('marks matching cards with matching state', () => {
      const cards = createMockCards();
      const { container } = render(<Hand cards={cards} matchingCardIds={[0, 1]} />);

      const matchingCards = container.querySelectorAll('[class*="card--matching"]');
      expect(matchingCards.length).toBe(2);
    });

    it('marks non-matching cards with not-matching state when there are matching cards', () => {
      const cards = createMockCards();
      const { container } = render(<Hand cards={cards} matchingCardIds={[0, 1]} />);

      const notMatchingCards = container.querySelectorAll('[class*="card--not-matching"]');
      expect(notMatchingCards.length).toBe(3);
    });

    it('does not apply not-matching state when there are no matching cards', () => {
      const cards = createMockCards();
      const { container } = render(<Hand cards={cards} matchingCardIds={[]} />);

      const notMatchingCards = container.querySelectorAll('[class*="card--not-matching"]');
      expect(notMatchingCards.length).toBe(0);
    });

    it('dims card info for non-matching cards', () => {
      const cards = createMockCards();
      const { container } = render(<Hand cards={cards} matchingCardIds={[0, 1]} />);

      const dimmedInfos = container.querySelectorAll('[class*="card-info--dimmed"]');
      expect(dimmedInfos.length).toBe(3);
    });

    it('highlights card info for matching cards', () => {
      const cards = createMockCards();
      const { container } = render(<Hand cards={cards} matchingCardIds={[0, 1]} />);

      const highlightedInfos = container.querySelectorAll('[class*="card-info--highlighted"]');
      expect(highlightedInfos.length).toBe(2);
    });
  });

  describe('Animations', () => {
    it('applies deal animation to all cards', () => {
      const cards = createMockCards();
      const { container } = render(<Hand cards={cards} animationType="deal" />);

      const dealCards = container.querySelectorAll('[class*="card--deal"]');
      expect(dealCards.length).toBe(5);
    });

    it('applies enter animation to new cards', () => {
      const cards = createMockCards();
      const { container } = render(<Hand cards={cards} newCardIds={[1, 3]} />);

      const enterCards = container.querySelectorAll('[class*="card--enter"]');
      expect(enterCards.length).toBe(2);
    });

    it('does not apply enter animation to existing cards', () => {
      const cards = createMockCards();
      const { container } = render(<Hand cards={cards} newCardIds={[1, 3]} />);

      const allCards = container.querySelectorAll('[class*="card"]');
      const enterCards = container.querySelectorAll('[class*="card--enter"]');
      expect(allCards.length).toBeGreaterThan(enterCards.length);
    });

    it('applies exchange animation to exchanging cards', () => {
      const cards = createMockCards();
      const { container } = render(<Hand cards={cards} exchangingCardIds={[0, 2]} />);

      const exchangeCards = container.querySelectorAll('[class*="card--exchange"]');
      expect(exchangeCards.length).toBe(2);
    });

    it('does not apply exchange animation to non-exchanging cards', () => {
      const cards = createMockCards();
      const { container } = render(<Hand cards={cards} exchangingCardIds={[0, 2]} />);

      // Count all card elements (not wrappers)
      const allCardElements = container.querySelectorAll('[class*="card_"]');
      // Filter for those that don't have exchange animation
      const exchangeCards = container.querySelectorAll('[class*="card--exchange"]');
      // We have 5 cards total, 2 with exchange, so 3 without
      expect(exchangeCards.length).toBe(2);
      expect(allCardElements.length - exchangeCards.length).toBeGreaterThanOrEqual(3);
    });

    it('exchange animation takes priority over enter animation', () => {
      const cards = createMockCards();
      const { container } = render(
        <Hand cards={cards} exchangingCardIds={[0]} newCardIds={[0]} />
      );

      const exchangeCards = container.querySelectorAll('[class*="card--exchange"]');
      expect(exchangeCards.length).toBe(1);

      // The same card should not have enter animation
      const enterCards = container.querySelectorAll('[class*="card--enter"]');
      expect(enterCards.length).toBe(0);
    });

    it('does not apply enter animation to matching cards (Issue #62 fix)', () => {
      // This test verifies the fix for Issue #62: Two-pair animation bug
      // When cards are both new and matching, they should show matching animation
      // instead of enter animation to avoid CSS animation conflict
      const cards = createMockCards();
      const { container } = render(
        <Hand cards={cards} newCardIds={[0, 1]} matchingCardIds={[0, 1, 2, 3]} />
      );

      // New cards that are also matching should NOT have enter animation
      const enterCards = container.querySelectorAll('[class*="card--enter"]');
      expect(enterCards.length).toBe(0);

      // All matching cards should have matching class
      const matchingCards = container.querySelectorAll('[class*="card--matching"]');
      expect(matchingCards.length).toBe(4);
    });

    it('applies enter animation to new cards that are not matching', () => {
      const cards = createMockCards();
      const { container } = render(
        <Hand cards={cards} newCardIds={[0, 1]} matchingCardIds={[2, 3]} />
      );

      // New cards that are NOT matching should have enter animation
      const enterCards = container.querySelectorAll('[class*="card--enter"]');
      expect(enterCards.length).toBe(2);

      // Matching cards should have matching class
      const matchingCards = container.querySelectorAll('[class*="card--matching"]');
      expect(matchingCards.length).toBe(2);
    });

    it('matching animation takes priority over enter animation for new matching cards', () => {
      // Simulates the scenario: exchange cards to get two-pair
      // Cards 0, 1 were exchanged (newCardIds), all 4 cards form two-pair (matchingCardIds)
      const cards = createMockCards();
      const { container } = render(
        <Hand cards={cards} newCardIds={[0, 1]} matchingCardIds={[0, 1, 2, 3]} />
      );

      // Get all card wrappers and then find the actual card elements within
      const cardWrappers = container.querySelectorAll('[class*="hand__card-wrapper"]');

      // Card 0 is both new and matching - should have matching but NOT enter
      const card0 = cardWrappers[0].querySelector('[class*="card_"]');
      expect(card0?.className).toContain('card--matching');
      expect(card0?.className).not.toContain('card--enter');

      // Card 1 is both new and matching - should have matching but NOT enter
      const card1 = cardWrappers[1].querySelector('[class*="card_"]');
      expect(card1?.className).toContain('card--matching');
      expect(card1?.className).not.toContain('card--enter');

      // Card 2 is matching but not new - should only have matching
      const card2 = cardWrappers[2].querySelector('[class*="card_"]');
      expect(card2?.className).toContain('card--matching');
      expect(card2?.className).not.toContain('card--enter');
    });
  });

  describe('Deal Animation Callback', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('calls onDealAnimationComplete after deal animation finishes', async () => {
      const onDealAnimationComplete = vi.fn();

      // First render with empty cards
      const { rerender } = render(
        <Hand cards={[]} animationType="deal" onDealAnimationComplete={onDealAnimationComplete} />
      );

      // Then add cards (simulating game start)
      const cards = createMockCards();
      rerender(
        <Hand cards={cards} animationType="deal" onDealAnimationComplete={onDealAnimationComplete} />
      );

      // Animation should not have completed yet
      expect(onDealAnimationComplete).not.toHaveBeenCalled();

      // Wait for animation to complete (5 cards: 4 * 100ms intervals + 300ms duration = 700ms)
      await act(async () => {
        vi.advanceTimersByTime(700);
      });

      expect(onDealAnimationComplete).toHaveBeenCalledTimes(1);
    });

    it('does not call onDealAnimationComplete when animationType is not deal', async () => {
      const onDealAnimationComplete = vi.fn();
      const cards = createMockCards();

      render(
        <Hand cards={cards} animationType="none" onDealAnimationComplete={onDealAnimationComplete} />
      );

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(onDealAnimationComplete).not.toHaveBeenCalled();
    });

    it('does not call onDealAnimationComplete when cards array is empty', async () => {
      const onDealAnimationComplete = vi.fn();

      render(
        <Hand cards={[]} animationType="deal" onDealAnimationComplete={onDealAnimationComplete} />
      );

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      expect(onDealAnimationComplete).not.toHaveBeenCalled();
    });

    it('calculates correct animation duration based on card count', async () => {
      const onDealAnimationComplete = vi.fn();

      // First render with empty cards
      const { rerender } = render(
        <Hand cards={[]} animationType="deal" onDealAnimationComplete={onDealAnimationComplete} />
      );

      // Add only 3 cards
      const cards = createMockCards(3);
      rerender(
        <Hand cards={cards} animationType="deal" onDealAnimationComplete={onDealAnimationComplete} />
      );

      // 3 cards: 2 * 100ms intervals + 300ms duration = 500ms
      await act(async () => {
        vi.advanceTimersByTime(400);
      });
      expect(onDealAnimationComplete).not.toHaveBeenCalled();

      await act(async () => {
        vi.advanceTimersByTime(100);
      });
      expect(onDealAnimationComplete).toHaveBeenCalledTimes(1);
    });

    it('only triggers animation once per deal cycle', async () => {
      const onDealAnimationComplete = vi.fn();

      // First render with empty cards
      const { rerender } = render(
        <Hand cards={[]} animationType="deal" onDealAnimationComplete={onDealAnimationComplete} />
      );

      // Add cards
      const cards = createMockCards();
      rerender(
        <Hand cards={cards} animationType="deal" onDealAnimationComplete={onDealAnimationComplete} />
      );

      // Complete animation
      await act(async () => {
        vi.advanceTimersByTime(700);
      });

      expect(onDealAnimationComplete).toHaveBeenCalledTimes(1);

      // Rerender with same cards and animationType
      rerender(
        <Hand cards={cards} animationType="deal" onDealAnimationComplete={onDealAnimationComplete} />
      );

      await act(async () => {
        vi.advanceTimersByTime(700);
      });

      // Should still be 1, not 2
      expect(onDealAnimationComplete).toHaveBeenCalledTimes(1);
    });

    it('cleans up timer on unmount', async () => {
      const onDealAnimationComplete = vi.fn();

      // First render with empty cards
      const { rerender, unmount } = render(
        <Hand cards={[]} animationType="deal" onDealAnimationComplete={onDealAnimationComplete} />
      );

      // Add cards to start animation
      const cards = createMockCards();
      rerender(
        <Hand cards={cards} animationType="deal" onDealAnimationComplete={onDealAnimationComplete} />
      );

      // Unmount before animation completes
      unmount();

      // Advance timers
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      // Callback should not have been called
      expect(onDealAnimationComplete).not.toHaveBeenCalled();
    });
  });

  describe('Edge cases', () => {
    it('handles empty cards array', () => {
      const { container } = render(<Hand cards={[]} />);
      expect(container.querySelector('[class*="hand"]')).toBeInTheDocument();
      expect(screen.queryAllByRole('img')).toHaveLength(0);
    });

    it('handles fewer than 5 cards', () => {
      const cards = createMockCards(3);
      render(<Hand cards={cards} />);

      expect(screen.getAllByRole('img')).toHaveLength(3);
    });

    it('handles more than 5 cards', () => {
      const cards = createMockCards(7);
      render(<Hand cards={cards} />);

      expect(screen.getAllByRole('img')).toHaveLength(7);
    });

    it('handles empty selectedCardIds array', () => {
      const cards = createMockCards();
      const { container } = render(<Hand cards={cards} selectedCardIds={[]} />);

      const selectedCards = container.querySelectorAll('[class*="card--selected"]');
      expect(selectedCards.length).toBe(0);
    });

    it('handles empty matchingCardIds array', () => {
      const cards = createMockCards();
      const { container } = render(<Hand cards={cards} matchingCardIds={[]} />);

      const matchingCards = container.querySelectorAll('[class*="card--matching"]');
      expect(matchingCards.length).toBe(0);
    });
  });

  describe('Accessibility', () => {
    it('cards are focusable when interactive', () => {
      const cards = createMockCards();
      render(<Hand cards={cards} onCardClick={() => {}} />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(5);
    });

    it('cards are not focusable when dealer hand', () => {
      const cards = createMockCards();
      render(<Hand cards={cards} isDealer />);

      expect(screen.queryAllByRole('button')).toHaveLength(0);
    });

    it('cards are not focusable when disabled', () => {
      const cards = createMockCards();
      const { container } = render(<Hand cards={cards} disabled onCardClick={() => {}} />);

      // Disabled cards don't have button role
      expect(screen.queryAllByRole('button')).toHaveLength(0);

      // Cards should have aria-disabled
      const cardElements = container.querySelectorAll('[aria-disabled="true"]');
      expect(cardElements.length).toBe(5);
    });
  });
});
