import React, { useCallback } from 'react';
import type { Card as CardType } from '../../types';
import { COLOR_NAMES, FUR_NAMES } from '../../types';
import styles from './Card.module.css';

/** Animation types for card */
export type CardAnimationType = 'deal' | 'enter' | 'exchange' | 'none';

export interface CardProps {
  /** Card data */
  card: CardType;
  /** Show back side of card */
  isBack?: boolean;
  /** Card is selected for exchange */
  isSelected?: boolean;
  /** Card is part of winning hand */
  isMatching?: boolean;
  /** Card is not part of winning hand (dimmed) */
  isNotMatching?: boolean;
  /** Animation type to apply */
  animationType?: CardAnimationType;
  /** Animation delay in ms */
  animationDelay?: number;
  /** Click handler */
  onClick?: () => void;
  /** Disable card interactions */
  disabled?: boolean;
  /** Additional class name */
  className?: string;
  /** Custom aria-label override */
  'aria-label'?: string;
}

/**
 * Card component for displaying a cat card
 *
 * Supports multiple states:
 * - Front/Back display
 * - Selected state (raised + highlighted border)
 * - Matching state (glowing effect for winning hand)
 * - Not matching state (dimmed for non-winning cards)
 * - Various animations (deal, enter, exchange)
 */
export const Card: React.FC<CardProps> = ({
  card,
  isBack = false,
  isSelected = false,
  isMatching = false,
  isNotMatching = false,
  animationType = 'none',
  animationDelay = 0,
  onClick,
  disabled = false,
  className,
  'aria-label': ariaLabelProp,
}) => {
  const handleClick = useCallback(() => {
    if (!disabled && onClick) {
      onClick();
    }
  }, [disabled, onClick]);

  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (!disabled && onClick && (event.key === 'Enter' || event.key === ' ')) {
        event.preventDefault();
        onClick();
      }
    },
    [disabled, onClick]
  );

  const cardClasses = [
    styles.card,
    isBack && styles['card--back'],
    isSelected && styles['card--selected'],
    isMatching && styles['card--matching'],
    isNotMatching && styles['card--not-matching'],
    animationType !== 'none' && styles[`card--${animationType}`],
    disabled && styles['card--disabled'],
    onClick && !disabled && styles['card--clickable'],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const style: React.CSSProperties = animationDelay > 0 ? { animationDelay: `${animationDelay}ms` } : {};

  // Generate aria-label for accessibility
  const colorName = COLOR_NAMES[card.color];
  const furName = FUR_NAMES[card.fur];
  const defaultAriaLabel = isBack
    ? '裏向きのカード'
    : `${colorName}の${furName}猫`;
  const ariaLabel = ariaLabelProp || defaultAriaLabel;

  // Use aria-selected for interactive cards (selection context)
  const isInteractive = onClick && !disabled;

  return (
    <div
      className={cardClasses}
      style={style}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      aria-label={ariaLabel}
      aria-selected={isInteractive ? isSelected : undefined}
      aria-disabled={disabled || undefined}
    >
      {isBack ? (
        <div className={styles['card__back']}>
          <span className={styles['card__back-icon']} aria-hidden="true">
            {/* Cat emoji as placeholder for card back */}
          </span>
        </div>
      ) : (
        <img
          src={card.image}
          alt={`${colorName}の${furName}猫`}
          className={styles['card__image']}
          draggable={false}
        />
      )}
    </div>
  );
};
