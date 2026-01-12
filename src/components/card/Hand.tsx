import React, { useCallback } from 'react';
import type { Card as CardType } from '../../types';
import { Card, type CardAnimationType } from './Card';
import { CardInfo } from './CardInfo';
import styles from './Hand.module.css';

/** Maximum number of cards that can be selected for exchange */
const MAX_SELECTED_CARDS = 3;

export interface HandProps {
  /** Array of cards in hand (should be 5 cards) */
  cards: CardType[];
  /** Show card fronts (true) or backs (false) */
  showCards?: boolean;
  /** Array of selected card IDs for exchange */
  selectedCardIds?: number[];
  /** Array of card IDs that are part of winning hand */
  matchingCardIds?: number[];
  /** Array of card IDs that are being exchanged (for exit animation) */
  exchangingCardIds?: number[];
  /** Callback when a card is clicked */
  onCardClick?: (cardId: number) => void;
  /** Disable all card interactions */
  disabled?: boolean;
  /** Is this the dealer's hand (uses smaller cards) */
  isDealer?: boolean;
  /** Animation type for cards */
  animationType?: CardAnimationType;
  /** Array of card IDs that are newly drawn (for enter animation) */
  newCardIds?: number[];
  /** Additional class name */
  className?: string;
}

/**
 * Hand component for displaying and managing a hand of cards
 *
 * Features:
 * - Displays 5 cards in a row
 * - Manages card selection (max 3 cards for exchange)
 * - Shows card info below each card
 * - Supports dealer hand variant (smaller cards, no interaction)
 * - Responsive layout
 */
export const Hand: React.FC<HandProps> = ({
  cards,
  showCards = true,
  selectedCardIds = [],
  matchingCardIds = [],
  exchangingCardIds = [],
  onCardClick,
  disabled = false,
  isDealer = false,
  animationType = 'none',
  newCardIds = [],
  className,
}) => {
  const hasMatchingCards = matchingCardIds.length > 0;

  const handleCardClick = useCallback(
    (cardId: number) => {
      if (disabled || isDealer || !onCardClick) return;

      // Check if we're at max selection and trying to add more
      const isCurrentlySelected = selectedCardIds.includes(cardId);
      if (!isCurrentlySelected && selectedCardIds.length >= MAX_SELECTED_CARDS) {
        return;
      }

      onCardClick(cardId);
    },
    [disabled, isDealer, onCardClick, selectedCardIds]
  );

  const handClasses = [
    styles.hand,
    isDealer && styles['hand--dealer'],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={handClasses}>
      {cards.map((card, index) => {
        const isSelected = selectedCardIds.includes(card.id);
        const isMatching = matchingCardIds.includes(card.id);
        const isNotMatching = hasMatchingCards && !isMatching;
        const isNew = newCardIds.includes(card.id);
        const isExchanging = exchangingCardIds.includes(card.id);

        // Determine animation type for this specific card
        let cardAnimation: CardAnimationType = animationType;
        if (isExchanging) {
          cardAnimation = 'exchange';
        } else if (isNew && animationType === 'none') {
          cardAnimation = 'enter';
        }

        // Calculate animation delay based on card position
        const animationDelay = animationType === 'deal' ? index * 100 : 0;

        // Only pass onClick if the hand is interactive
        const isInteractive = !isDealer && onCardClick !== undefined;

        return (
          <div key={card.id} className={styles['hand__card-wrapper']}>
            <Card
              card={card}
              isBack={!showCards}
              isSelected={isSelected}
              isMatching={isMatching}
              isNotMatching={isNotMatching}
              animationType={cardAnimation}
              animationDelay={animationDelay}
              onClick={isInteractive ? () => handleCardClick(card.id) : undefined}
              disabled={disabled || isDealer}
            />
            {showCards && (
              <CardInfo
                color={card.color}
                fur={card.fur}
                isDimmed={isNotMatching}
                isHighlighted={isMatching}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
