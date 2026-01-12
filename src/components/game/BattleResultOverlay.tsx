import React, { useCallback, useEffect } from 'react';
import type { Role } from '../../types';
import { Button } from '../common';
import styles from './BattleResultOverlay.module.css';

export type BattleResult = 'win' | 'lose' | 'draw';

export interface BattleResultOverlayProps {
  /** Whether the overlay is visible */
  visible: boolean;
  /** Battle result: win, lose, or draw */
  result: BattleResult;
  /** Player's role */
  playerRole: Role | null;
  /** Dealer's role */
  dealerRole: Role | null;
  /** Points change for this round */
  pointsChange: number;
  /** Callback when overlay is closed */
  onClose: () => void;
}

/**
 * BattleResultOverlay displays the battle result after a round ends.
 * Shows WIN/LOSE/DRAW text, role names, and points change.
 */
export const BattleResultOverlay: React.FC<BattleResultOverlayProps> = ({
  visible,
  result,
  playerRole,
  dealerRole,
  pointsChange,
  onClose,
}) => {
  const handleOverlayClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (visible && (e.key === 'Escape' || e.key === 'Enter')) {
        onClose();
      }
    },
    [visible, onClose]
  );

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  if (!visible) {
    return null;
  }

  const getResultText = (): string => {
    switch (result) {
      case 'win':
        return 'WIN';
      case 'lose':
        return 'LOSE';
      case 'draw':
        return 'DRAW';
    }
  };

  const getResultTextClass = (): string => {
    const baseClass = styles['result-text'];
    switch (result) {
      case 'win':
        return `${baseClass} ${styles['result-text--win']}`;
      case 'lose':
        return `${baseClass} ${styles['result-text--lose']}`;
      case 'draw':
        return `${baseClass} ${styles['result-text--draw']}`;
    }
  };

  const getRoleDisplay = (): string => {
    switch (result) {
      case 'win':
        return playerRole?.name || '';
      case 'lose':
        return dealerRole?.name || '';
      case 'draw':
        return playerRole?.name || '';
    }
  };

  const getPointsDisplay = (): string => {
    if (pointsChange > 0) {
      return `+${pointsChange} pt`;
    } else if (pointsChange < 0) {
      return `${pointsChange} pt`;
    }
    return '+-0 pt';
  };

  const getPointsClass = (): string => {
    const baseClass = styles['result-points'];
    if (pointsChange > 0) {
      return `${baseClass} ${styles['result-points--positive']}`;
    } else if (pointsChange < 0) {
      return `${baseClass} ${styles['result-points--negative']}`;
    }
    return `${baseClass} ${styles['result-points--neutral']}`;
  };

  return (
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="battle-result-title"
    >
      <div className={styles.content}>
        <h2 id="battle-result-title" className={getResultTextClass()}>
          {getResultText()}
        </h2>
        <p className={styles['result-role']}>{getRoleDisplay()}</p>
        <p className={getPointsClass()}>{getPointsDisplay()}</p>
        <Button variant="primary" onClick={onClose}>
          OK
        </Button>
      </div>
    </div>
  );
};
