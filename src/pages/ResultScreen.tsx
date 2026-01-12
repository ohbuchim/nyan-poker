import React, { useMemo } from 'react';
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

/** Battle result summary for display */
interface BattleResultSummary {
  wins: number;
  losses: number;
  draws: number;
  finalResult: 'win' | 'lose' | 'draw';
  dealerTotalScore: number;
  scoreDifference: number;
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
   * Calculate battle result summary
   */
  const battleSummary = useMemo((): BattleResultSummary | null => {
    if (!isBattleMode) return null;

    const wins = history.filter((r) => r.result === 'win').length;
    const losses = history.filter((r) => r.result === 'lose').length;
    const draws = history.filter((r) => r.result === 'draw').length;

    // Calculate dealer's total score (sum of dealer's points)
    const dealerTotalScore = history.reduce((sum, r) => {
      return sum + (r.dealerPoints ?? 0);
    }, 0);

    const scoreDifference = totalScore - dealerTotalScore;

    // Determine final result based on total score difference
    let finalResult: 'win' | 'lose' | 'draw';
    if (scoreDifference > 0) {
      finalResult = 'win';
    } else if (scoreDifference < 0) {
      finalResult = 'lose';
    } else {
      finalResult = 'draw';
    }

    return {
      wins,
      losses,
      draws,
      finalResult,
      dealerTotalScore,
      scoreDifference,
    };
  }, [history, isBattleMode, totalScore]);

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
   * Get result icon for battle mode (circle/cross/triangle)
   */
  const getResultIcon = (result?: 'win' | 'lose' | 'draw'): string => {
    switch (result) {
      case 'win':
        return '\u25CB'; // Circle (maru)
      case 'lose':
        return '\u00D7'; // Cross (batsu)
      case 'draw':
        return '\u25B3'; // Triangle (sankaku)
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

  /**
   * Get final result display text
   */
  const getFinalResultText = (
    result: 'win' | 'lose' | 'draw'
  ): string => {
    switch (result) {
      case 'win':
        return 'WIN';
      case 'lose':
        return 'LOSE';
      case 'draw':
        return 'DRAW';
    }
  };

  /**
   * Get final result CSS class
   */
  const getFinalResultClass = (
    result: 'win' | 'lose' | 'draw'
  ): string => {
    switch (result) {
      case 'win':
        return styles.resultWin;
      case 'lose':
        return styles.resultLose;
      case 'draw':
        return styles.resultDraw;
    }
  };

  return (
    <div className={styles.container} data-testid="result-screen">
      <div className={styles.content}>
        {/* Battle Mode: Final Result Display */}
        {isBattleMode && battleSummary && (
          <div className={styles.battleResultSection} data-testid="battle-result-section">
            {/* Final Result (WIN/LOSE/DRAW) */}
            <div
              className={`${styles.finalResult} ${getFinalResultClass(battleSummary.finalResult)}`}
              data-testid="final-result"
              aria-label={`最終結果: ${getFinalResultText(battleSummary.finalResult)}`}
            >
              {getFinalResultText(battleSummary.finalResult)}
            </div>

            {/* Win/Loss Count */}
            <div className={styles.battleRecord} data-testid="battle-record">
              <span className={styles.recordWins}>{battleSummary.wins}勝</span>
              <span className={styles.recordSeparator}>-</span>
              <span className={styles.recordLosses}>{battleSummary.losses}敗</span>
              {battleSummary.draws > 0 && (
                <>
                  <span className={styles.recordSeparator}>-</span>
                  <span className={styles.recordDraws}>{battleSummary.draws}分</span>
                </>
              )}
            </div>

            {/* Score Difference */}
            <div
              className={`${styles.scoreDifference} ${getPointsClass(battleSummary.scoreDifference)}`}
              data-testid="score-difference"
            >
              {formatPoints(battleSummary.scoreDifference)} pt
            </div>
          </div>
        )}

        {/* Score Summary Section */}
        {isBattleMode && battleSummary ? (
          <div className={styles.scoreSummarySection} data-testid="score-summary">
            <h3 className={styles.scoreSummaryTitle}>スコアサマリー</h3>
            <div className={styles.scoreSummaryGrid}>
              <div className={styles.scoreSummaryItem}>
                <span className={styles.scoreSummaryLabel}>あなた</span>
                <span
                  className={`${styles.scoreSummaryValue} ${getPointsClass(totalScore)}`}
                  data-testid="player-final-score"
                >
                  {totalScore}
                </span>
              </div>
              <div className={styles.scoreSummaryVs}>VS</div>
              <div className={styles.scoreSummaryItem}>
                <span className={styles.scoreSummaryLabel}>ディーラー</span>
                <span
                  className={`${styles.scoreSummaryValue} ${getPointsClass(battleSummary.dealerTotalScore)}`}
                  data-testid="dealer-final-score"
                >
                  {battleSummary.dealerTotalScore}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Solo Mode: Final Score Display */
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
        )}

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
                className={`${styles.historyItem} ${isBattleMode ? styles.historyItemBattle : ''}`}
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
                  <span className={isBattleMode ? styles.roundNumber : styles.roundName}>
                    {isBattleMode ? `R${round.round}` : `ラウンド${round.round}`}
                  </span>
                </div>

                {isBattleMode ? (
                  /* Battle Mode: Show both player and dealer info */
                  <div className={styles.battleRoundDetails}>
                    <div className={styles.playerRoundInfo}>
                      <span className={styles.roleLabel}>You</span>
                      <span className={styles.roleName}>{round.playerRole.name}</span>
                      <span className={styles.rolePoints}>{round.playerRole.points}pt</span>
                    </div>
                    <div className={styles.dealerRoundInfo}>
                      <span className={styles.roleLabel}>Dealer</span>
                      <span className={styles.roleName}>{round.dealerRole?.name ?? '-'}</span>
                      <span className={styles.rolePoints}>{round.dealerRole?.points ?? 0}pt</span>
                    </div>
                  </div>
                ) : (
                  /* Solo Mode: Show only player role */
                  <span className={styles.roleName}>{round.playerRole.name}</span>
                )}

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
