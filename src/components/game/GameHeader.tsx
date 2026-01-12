import React from 'react';
import styles from './GameHeader.module.css';

export interface GameHeaderProps {
  round: number;
  totalRounds: number;
  score: number;
  onRulesClick?: () => void;
}

export const GameHeader: React.FC<GameHeaderProps> = ({
  round,
  totalRounds,
  score,
  onRulesClick,
}) => {
  const progressPercent = (round / totalRounds) * 100;

  return (
    <header className={styles.header}>
      <div className={styles['round-info']}>
        <span className={styles['round-badge']}>
          ラウンド <span>{round}</span>/{totalRounds}
        </span>
        <div
          className={styles['progress-bar']}
          role="progressbar"
          aria-label="ゲーム進行状況"
          aria-valuenow={round}
          aria-valuemin={1}
          aria-valuemax={totalRounds}
        >
          <div
            className={styles['progress-fill']}
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      <div className={styles['score-display']}>
        <span className={styles['score-label']}>スコア</span>
        <span className={styles['score-value']}>{score}</span>
      </div>

      {onRulesClick && (
        <button
          className={styles['rules-button']}
          onClick={onRulesClick}
          aria-label="役一覧を表示"
        >
          ?
        </button>
      )}
    </header>
  );
};
