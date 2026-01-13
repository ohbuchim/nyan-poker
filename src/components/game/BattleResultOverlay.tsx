import React, { useCallback, useEffect, useState, useRef } from 'react';
import type { Role } from '../../types';
import { Button } from '../common';
import { Confetti } from '../effects';
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
  const [showConfetti, setShowConfetti] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Start confetti when visible and result is 'win'
  useEffect(() => {
    if (visible && result === 'win') {
      setShowConfetti(true);
    } else {
      setShowConfetti(false);
    }
  }, [visible, result]);

  // Focus management: focus button when visible, restore focus when hidden
  useEffect(() => {
    if (visible) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      // Small delay to ensure button is rendered
      setTimeout(() => {
        buttonRef.current?.focus();
      }, 100);
    } else {
      previousActiveElement.current?.focus();
    }
  }, [visible]);

  const handleConfettiComplete = useCallback(() => {
    setShowConfetti(false);
  }, []);

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

  // Generate aria-label for accessibility announcement
  const getResultAriaLabel = (): string => {
    const resultText = result === 'win' ? '勝利' : result === 'lose' ? '敗北' : '引き分け';
    const roleText = getRoleDisplay();
    const pointsText = pointsChange > 0 ? `${pointsChange}ポイント獲得` : pointsChange < 0 ? `${Math.abs(pointsChange)}ポイント減少` : 'ポイント変動なし';
    return `${resultText}！${roleText}で${pointsText}`;
  };

  return (
    <>
      <Confetti
        active={showConfetti}
        duration={5000}
        particleCount={150}
        onComplete={handleConfettiComplete}
      />
      <div
        className={styles.overlay}
        onClick={handleOverlayClick}
        role="dialog"
        aria-modal="true"
        aria-labelledby="battle-result-title"
        aria-describedby="battle-result-description"
      >
        <div className={styles.content} aria-live="assertive" aria-atomic="true">
          <h2 id="battle-result-title" className={getResultTextClass()}>
            {getResultText()}
          </h2>
          <p id="battle-result-description" className={styles['result-role']}>{getRoleDisplay()}</p>
          <p className={getPointsClass()} aria-label={getResultAriaLabel()}>{getPointsDisplay()}</p>
          <Button ref={buttonRef} variant="primary" onClick={onClose}>
            OK
          </Button>
        </div>
      </div>
    </>
  );
};
