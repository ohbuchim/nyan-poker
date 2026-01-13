import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Card } from '../Card';
import type { Card as CardType } from '../../../types';

// Sample card data for testing
const createMockCard = (overrides?: Partial<CardType>): CardType => ({
  id: 0,
  image: '/images/image_000.jpg',
  color: 4,
  fur: 1,
  ...overrides,
});

describe('Card', () => {
  describe('Rendering', () => {
    it('renders card with image when not back', () => {
      const card = createMockCard();
      render(<Card card={card} />);

      const image = screen.getByRole('img');
      expect(image).toBeInTheDocument();
      expect(image).toHaveAttribute('src', card.image);
      // Alt text now includes color and fur type for accessibility
      expect(image).toHaveAttribute('alt', '茶白の短毛猫');
    });

    it('renders card back when isBack is true', () => {
      const card = createMockCard();
      const { container } = render(<Card card={card} isBack />);

      expect(screen.queryByRole('img')).not.toBeInTheDocument();
      expect(container.querySelector('[class*="card__back"]')).toBeInTheDocument();
    });

    it('applies card class by default', () => {
      const card = createMockCard();
      const { container } = render(<Card card={card} />);

      const cardElement = container.firstChild;
      expect(cardElement?.className).toContain('card');
    });

    it('merges custom className', () => {
      const card = createMockCard();
      const { container } = render(<Card card={card} className="custom-class" />);

      const cardElement = container.firstChild;
      expect(cardElement?.className).toContain('custom-class');
      expect(cardElement?.className).toContain('card');
    });
  });

  describe('States', () => {
    it('applies selected class when isSelected is true', () => {
      const card = createMockCard();
      const { container } = render(<Card card={card} isSelected />);

      const cardElement = container.firstChild;
      expect(cardElement?.className).toContain('card--selected');
    });

    it('applies matching class when isMatching is true', () => {
      const card = createMockCard();
      const { container } = render(<Card card={card} isMatching />);

      const cardElement = container.firstChild;
      expect(cardElement?.className).toContain('card--matching');
    });

    it('applies not-matching class when isNotMatching is true', () => {
      const card = createMockCard();
      const { container } = render(<Card card={card} isNotMatching />);

      const cardElement = container.firstChild;
      expect(cardElement?.className).toContain('card--not-matching');
    });

    it('applies back class when isBack is true', () => {
      const card = createMockCard();
      const { container } = render(<Card card={card} isBack />);

      const cardElement = container.firstChild;
      expect(cardElement?.className).toContain('card--back');
    });

    it('applies disabled class when disabled is true', () => {
      const card = createMockCard();
      const { container } = render(<Card card={card} disabled />);

      const cardElement = container.firstChild;
      expect(cardElement?.className).toContain('card--disabled');
    });

    it('applies clickable class when onClick is provided and not disabled', () => {
      const card = createMockCard();
      const { container } = render(<Card card={card} onClick={() => {}} />);

      const cardElement = container.firstChild;
      expect(cardElement?.className).toContain('card--clickable');
    });

    it('does not apply clickable class when disabled even with onClick', () => {
      const card = createMockCard();
      const { container } = render(<Card card={card} onClick={() => {}} disabled />);

      const cardElement = container.firstChild;
      expect(cardElement?.className).not.toContain('card--clickable');
    });
  });

  describe('Animations', () => {
    it('applies deal animation class', () => {
      const card = createMockCard();
      const { container } = render(<Card card={card} animationType="deal" />);

      const cardElement = container.firstChild;
      expect(cardElement?.className).toContain('card--deal');
    });

    it('applies enter animation class', () => {
      const card = createMockCard();
      const { container } = render(<Card card={card} animationType="enter" />);

      const cardElement = container.firstChild;
      expect(cardElement?.className).toContain('card--enter');
    });

    it('applies exchange animation class', () => {
      const card = createMockCard();
      const { container } = render(<Card card={card} animationType="exchange" />);

      const cardElement = container.firstChild;
      expect(cardElement?.className).toContain('card--exchange');
    });

    it('does not apply animation class when animationType is none', () => {
      const card = createMockCard();
      const { container } = render(<Card card={card} animationType="none" />);

      const cardElement = container.firstChild;
      expect(cardElement?.className).not.toContain('card--deal');
      expect(cardElement?.className).not.toContain('card--enter');
      expect(cardElement?.className).not.toContain('card--exchange');
    });

    it('applies animation delay style', () => {
      const card = createMockCard();
      const { container } = render(<Card card={card} animationType="deal" animationDelay={200} />);

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement.style.animationDelay).toBe('200ms');
    });

    it('does not apply animation delay when 0', () => {
      const card = createMockCard();
      const { container } = render(<Card card={card} animationType="deal" animationDelay={0} />);

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement.style.animationDelay).toBe('');
    });
  });

  describe('Interactions', () => {
    it('calls onClick when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      const card = createMockCard();

      render(<Card card={card} onClick={handleClick} />);

      const cardElement = screen.getByRole('button');
      await user.click(cardElement);

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      const card = createMockCard();

      const { container } = render(<Card card={card} onClick={handleClick} disabled />);

      // Disabled cards don't have button role
      const cardElement = container.firstChild as HTMLElement;
      await user.click(cardElement);

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('calls onClick on Enter key press', () => {
      const handleClick = vi.fn();
      const card = createMockCard();

      const { container } = render(<Card card={card} onClick={handleClick} />);

      const cardElement = container.firstChild as HTMLElement;
      fireEvent.keyDown(cardElement, { key: 'Enter' });

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('calls onClick on Space key press', () => {
      const handleClick = vi.fn();
      const card = createMockCard();

      const { container } = render(<Card card={card} onClick={handleClick} />);

      const cardElement = container.firstChild as HTMLElement;
      fireEvent.keyDown(cardElement, { key: ' ' });

      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick on other key presses', () => {
      const handleClick = vi.fn();
      const card = createMockCard();

      const { container } = render(<Card card={card} onClick={handleClick} />);

      const cardElement = container.firstChild as HTMLElement;
      fireEvent.keyDown(cardElement, { key: 'a' });

      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onClick on key press when disabled', () => {
      const handleClick = vi.fn();
      const card = createMockCard();

      const { container } = render(<Card card={card} onClick={handleClick} disabled />);

      const cardElement = container.firstChild as HTMLElement;
      fireEvent.keyDown(cardElement, { key: 'Enter' });

      expect(handleClick).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('has button role when clickable', () => {
      const card = createMockCard();
      render(<Card card={card} onClick={() => {}} />);

      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('does not have button role when not clickable', () => {
      const card = createMockCard();
      render(<Card card={card} />);

      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('has tabIndex 0 when clickable', () => {
      const card = createMockCard();
      const { container } = render(<Card card={card} onClick={() => {}} />);

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveAttribute('tabIndex', '0');
    });

    it('does not have tabIndex when not clickable', () => {
      const card = createMockCard();
      const { container } = render(<Card card={card} />);

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).not.toHaveAttribute('tabIndex');
    });

    it('has aria-selected attribute when clickable and selected', () => {
      const card = createMockCard();
      const { container } = render(<Card card={card} onClick={() => {}} isSelected />);

      const cardElement = container.firstChild as HTMLElement;
      // Changed from aria-pressed to aria-selected for card selection context
      expect(cardElement).toHaveAttribute('aria-selected', 'true');
    });

    it('has aria-disabled attribute when disabled', () => {
      const card = createMockCard();
      const { container } = render(<Card card={card} disabled />);

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveAttribute('aria-disabled', 'true');
    });

    it('image has descriptive alt text with color and fur type', () => {
      const card = createMockCard({ id: 42, color: 4, fur: 1 });
      render(<Card card={card} />);

      const image = screen.getByRole('img');
      // Alt text now includes color and fur type for better accessibility
      expect(image).toHaveAttribute('alt', '茶白の短毛猫');
    });

    it('has aria-label for the card element', () => {
      const card = createMockCard({ color: 0, fur: 0 }); // 茶トラ, 長毛
      const { container } = render(<Card card={card} />);

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveAttribute('aria-label', '茶トラの長毛猫');
    });

    it('has aria-label for back card', () => {
      const card = createMockCard();
      const { container } = render(<Card card={card} isBack />);

      const cardElement = container.firstChild as HTMLElement;
      expect(cardElement).toHaveAttribute('aria-label', '裏向きのカード');
    });

    it('image is not draggable', () => {
      const card = createMockCard();
      render(<Card card={card} />);

      const image = screen.getByRole('img');
      expect(image).toHaveAttribute('draggable', 'false');
    });
  });

  describe('Multiple states', () => {
    it('can be both selected and matching', () => {
      const card = createMockCard();
      const { container } = render(<Card card={card} isSelected isMatching />);

      const cardElement = container.firstChild;
      expect(cardElement?.className).toContain('card--selected');
      expect(cardElement?.className).toContain('card--matching');
    });

    it('can combine animation with other states', () => {
      const card = createMockCard();
      const { container } = render(<Card card={card} isSelected animationType="deal" />);

      const cardElement = container.firstChild;
      expect(cardElement?.className).toContain('card--selected');
      expect(cardElement?.className).toContain('card--deal');
    });
  });
});
