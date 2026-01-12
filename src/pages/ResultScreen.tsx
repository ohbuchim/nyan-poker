import React from 'react';
import { Button } from '../components/common';
import type { GameMode, RoundHistory } from '../types';
import styles from './ResultScreen.module.css';

export interface ResultScreenProps {
  /** Total score achieved in the game */
  totalScore: number;
  /** Round history with role and points for each round */
  history: RoundHistory[];
  /** Game mode (solo or battle) */
  mode: GameMode;
  /** Callback when "play again" button is clicked */
  onPlayAgain: () => void;
  /** Callback when "return to title" button is clicked */
  onReturnToTitle: () => void;
}

/**
 * ResultScreen component
 *
 * Displays the final score and round history after game completion.
 * Provides options to play again or return to the title screen.
 */
export const ResultScreen: React.FC<ResultScreenProps> = ({
  totalScore,
  history,
  mode,
  onPlayAgain,
  onReturnToTitle,
}) => {
  const isBattleMode = mode === 'battle';

  /**
   * Get CSS class for points based on value
   */
  const getPointsClass = (points: number): string => {
    if (points > 0) return styles.positive;
    if (points < 0) return styles.negative;
    return '';
  };

  /**
   * Format points with sign for display
   */
  const formatPoints = (points: number): string => {
    if (points > 0) return `+${points}`;
    return points.toString();
  };

  /**
   * Get result icon for battle mode
   */
  const getResultIcon = (result?: 'win' | 'lose' | 'draw'): string => {
    switch (result) {
      case 'win':
        return 'W';
      case 'lose':
        return 'L';
      case 'draw':
        return 'D';
      default:
        return '';
    }
  };

  /**
   * Get result icon CSS class
   */
  const getResultIconClass = (result?: 'win' | 'lose' | 'draw'): string => {
    switch (result) {
      case 'win':
        return styles.iconWin;
      case 'lose':
        return styles.iconLose;
      case 'draw':
        return styles.iconDraw;
      default:
        return '';
    }
  };

  return (
    <div className={styles.container} data-testid="result-screen">
      <div className={styles.content}>
        {/* Final Score Display */}
        <div className={styles.scoreSection}>
          <h2 className={styles.scoreTitle}>最終スコア</h2>
          <div
            className={styles.scoreValue}
            data-testid="final-score"
            aria-label={`最終スコア: ${totalScore}ポイント`}
          >
            {totalScore}
          </div>
          <div className={styles.scoreLabel}>ポイント</div>
        </div>

        {/* Round History */}
        <div className={styles.historySection}>
          <h3 className={styles.historyTitle}>ラウンド履歴</h3>
          <div
            className={styles.historyList}
            data-testid="round-history"
            role="list"
            aria-label="ラウンド履歴"
          >
            {history.map((round) => (
              <div
                key={round.round}
                className={styles.historyItem}
                role="listitem"
                data-testid={`round-${round.round}`}
              >
                <div className={styles.roundInfo}>
                  {isBattleMode && round.result && (
                    <span
                      className={`${styles.resultIcon} ${getResultIconClass(round.result)}`}
                      aria-label={
                        round.result === 'win'
                          ? '勝利'
                          : round.result === 'lose'
                            ? '敗北'
                            : '引き分け'
                      }
                    >
                      {getResultIcon(round.result)}
                    </span>
                  )}
                  <span className={styles.roundName}>
                    ラウンド{round.round}
                  </span>
                </div>
                <span className={styles.roleName}>{round.playerRole.name}</span>
                <span
                  className={`${styles.points} ${getPointsClass(round.playerPoints)}`}
                >
                  {formatPoints(round.playerPoints)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className={styles.actions}>
          <Button
            variant="primary"
            onClick={onPlayAgain}
            data-testid="play-again-button"
          >
            もう一度遊ぶ
          </Button>
          <Button
            variant="secondary"
            onClick={onReturnToTitle}
            data-testid="return-to-title-button"
          >
            タイトルに戻る
          </Button>
        </div>
      </div>
    </div>
  );
};
