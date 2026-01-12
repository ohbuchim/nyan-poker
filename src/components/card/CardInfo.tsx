import React from 'react';
import { COLOR_NAMES, FUR_NAMES, type ColorCode, type FurCode } from '../../types';
import styles from './CardInfo.module.css';

export interface CardInfoProps {
  /** Color code of the card */
  color: ColorCode;
  /** Fur code of the card */
  fur: FurCode;
  /** Show dimmed state (for non-matching cards) */
  isDimmed?: boolean;
  /** Highlight state (for matching cards) */
  isHighlighted?: boolean;
  /** Additional class name */
  className?: string;
}

/**
 * CardInfo component for displaying card attributes
 *
 * Shows:
 * - Color name (e.g., "茶トラ", "三毛")
 * - Fur length (e.g., "長毛", "短毛")
 */
export const CardInfo: React.FC<CardInfoProps> = ({
  color,
  fur,
  isDimmed = false,
  isHighlighted = false,
  className,
}) => {
  const colorName = COLOR_NAMES[color];
  const furName = FUR_NAMES[fur];

  const classes = [
    styles['card-info'],
    isDimmed && styles['card-info--dimmed'],
    isHighlighted && styles['card-info--highlighted'],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      <span className={styles['card-info__color']}>{colorName}</span>
      <span className={styles['card-info__fur']}>{furName}</span>
    </div>
  );
};
