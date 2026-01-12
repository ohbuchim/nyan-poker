import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
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

    it('allows selecting up to 3 cards', async () => {
      const handleCardClick = vi.fn();
      const user = userEvent.setup();
      const cards = createMockCards();

      render(<Hand cards={cards} onCardClick={handleCardClick} selectedCardIds={[0, 1, 2]} />);

      const buttons = screen.getAllByRole('button');
      await user.click(buttons[3]); // Try to select 4th card

      expect(handleCardClick).not.toHaveBeenCalled();
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
