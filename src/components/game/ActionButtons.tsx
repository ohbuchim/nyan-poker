import React from 'react';
import { Button } from '../common/Button';
import styles from './ActionButtons.module.css';

export interface ActionButtonsProps {
  selectedCount: number;
  maxSelectable?: number;
  exchanged: boolean;
  isRevealing: boolean;
  isLastRound: boolean;
  onExchange: () => void;
  onSkipExchange: () => void;
  onClearSelection: () => void;
  onNextRound: () => void;
  onFinish: () => void;
  variant?: 'column' | 'inline';
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  selectedCount,
  maxSelectable = 3,
  exchanged,
  isRevealing,
  isLastRound,
  onExchange,
  onSkipExchange,
  onClearSelection,
  onNextRound,
  onFinish,
  variant = 'column',
}) => {
  const containerClasses = [styles.container, styles[`container--${variant}`]]
    .filter(Boolean)
    .join(' ');

  if (isRevealing || exchanged) {
    return (
      <div className={containerClasses}>
        {isLastRound ? (
          <Button variant="primary" onClick={onFinish}>
            結果を見る
          </Button>
        ) : (
          <Button variant="primary" onClick={onNextRound}>
            次のラウンドへ
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={containerClasses}>
      <p className={styles['action-hint']}>
        交換するカードを選択してください（
        <span className={styles['selected-count']} aria-live="polite">
          {selectedCount}
        </span>
        /{maxSelectable}枚選択中）
      </p>
      <div className={styles['button-group']}>
        <Button
          variant="primary"
          onClick={onExchange}
          disabled={selectedCount === 0}
          size={variant === 'inline' ? 'sm' : 'md'}
        >
          交換する
        </Button>
        <Button
          variant="secondary"
          onClick={onSkipExchange}
          size={variant === 'inline' ? 'sm' : 'md'}
        >
          交換しない
        </Button>
        {selectedCount > 0 && (
          <Button variant="text" onClick={onClearSelection}>
            {variant === 'inline' ? '解除' : '選択を解除'}
          </Button>
        )}
      </div>
    </div>
  );
};
