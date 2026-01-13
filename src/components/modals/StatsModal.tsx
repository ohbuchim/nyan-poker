// components/modals/StatsModal.tsx

import { useCallback, type FC } from 'react';
import { Modal } from '../common/Modal';
import { useStats } from '../../context/StatsContext';
import { getAverageScore, getWinRate } from '../../types/storage';
import type { RoleType } from '../../types';
import styles from './StatsModal.module.css';

export interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/** Role type to display name mapping */
const ROLE_TYPE_DISPLAY_NAMES: Record<RoleType, string> = {
  flush: 'フラッシュ',
  fullHouse: 'フルハウス',
  fourColor: 'フォーカラー',
  threeColor: 'スリーカラー',
  twoPair: 'ツーペア',
  onePair: 'ワンペア',
  fur: 'ファー',
  noPair: 'ノーペア',
};

/** Order of role types for display */
const ROLE_TYPE_ORDER: RoleType[] = [
  'flush',
  'fullHouse',
  'fourColor',
  'fur',
  'threeColor',
  'twoPair',
  'onePair',
  'noPair',
];

/**
 * Format a number for display
 * Returns '-' if the value is 0 or undefined
 */
function formatValue(value: number | undefined): string {
  if (value === undefined || value === 0) {
    return '-';
  }
  return String(value);
}

/**
 * Format percentage for display
 * Returns '-' if the value is 0
 */
function formatPercentage(value: number): string {
  if (value === 0) {
    return '-';
  }
  return `${value.toFixed(1)}%`;
}

/**
 * Format average score for display
 * Returns '-' if the value is 0
 */
function formatAverageScore(value: number): string {
  if (value === 0) {
    return '-';
  }
  return String(value);
}

/**
 * StatsModal component
 *
 * Displays game statistics including:
 * - Solo mode stats (play count, high score, average score)
 * - Battle mode stats (play count, wins, win rate)
 * - Role achievement counts
 */
export const StatsModal: FC<StatsModalProps> = ({ isOpen, onClose }) => {
  const { soloStats, battleStats, roleAchievements } = useStats();

  const averageScore = getAverageScore(soloStats);
  const winRate = getWinRate(battleStats);

  /**
   * Get the count for a specific role type
   */
  const getRoleCount = useCallback(
    (roleType: RoleType): number => {
      return roleAchievements[roleType] || 0;
    },
    [roleAchievements]
  );

  /**
   * Calculate draws from play count, wins, and losses
   */
  const getDraws = useCallback((): number => {
    return battleStats.playCount - battleStats.wins - battleStats.losses;
  }, [battleStats]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="戦績">
      <div className={styles.container}>
        {/* Solo mode stats section */}
        <section className={styles.section} aria-labelledby="solo-stats-title">
          <h3 id="solo-stats-title" className={styles.sectionTitle}>
            ひとりで遊ぶ
          </h3>
          <div className={styles.statsGrid}>
            <div className={styles.statsItem}>
              <span className={styles.statsValue} data-testid="solo-play-count">
                {formatValue(soloStats.playCount)}
              </span>
              <span className={styles.statsLabel}>プレイ回数</span>
            </div>
            <div className={styles.statsItem}>
              <span className={styles.statsValue} data-testid="solo-high-score">
                {formatValue(soloStats.highScore)}
              </span>
              <span className={styles.statsLabel}>最高スコア</span>
            </div>
            <div className={styles.statsItem}>
              <span
                className={styles.statsValue}
                data-testid="solo-average-score"
              >
                {formatAverageScore(averageScore)}
              </span>
              <span className={styles.statsLabel}>平均スコア</span>
            </div>
          </div>
        </section>

        {/* Battle mode stats section */}
        <section
          className={styles.section}
          aria-labelledby="battle-stats-title"
        >
          <h3 id="battle-stats-title" className={styles.sectionTitle}>
            対戦モード
          </h3>
          <div className={styles.statsGrid}>
            <div className={styles.statsItem}>
              <span
                className={styles.statsValue}
                data-testid="battle-play-count"
              >
                {formatValue(battleStats.playCount)}
              </span>
              <span className={styles.statsLabel}>プレイ回数</span>
            </div>
            <div className={styles.statsItem}>
              <span className={styles.statsValue} data-testid="battle-wins">
                {formatValue(battleStats.wins)}
              </span>
              <span className={styles.statsLabel}>勝利数</span>
            </div>
            <div className={styles.statsItem}>
              <span className={styles.statsValue} data-testid="battle-win-rate">
                {formatPercentage(winRate)}
              </span>
              <span className={styles.statsLabel}>勝率</span>
            </div>
          </div>
          <div className={styles.statsGridSecondary}>
            <div className={styles.statsItemSmall}>
              <span
                className={styles.statsValueSmall}
                data-testid="battle-losses"
              >
                {formatValue(battleStats.losses)}
              </span>
              <span className={styles.statsLabelSmall}>敗北数</span>
            </div>
            <div className={styles.statsItemSmall}>
              <span
                className={styles.statsValueSmall}
                data-testid="battle-draws"
              >
                {formatValue(getDraws())}
              </span>
              <span className={styles.statsLabelSmall}>引き分け数</span>
            </div>
          </div>
        </section>

        {/* Role achievements section */}
        <section className={styles.section} aria-labelledby="roles-stats-title">
          <h3 id="roles-stats-title" className={styles.sectionTitle}>
            役の達成回数
          </h3>
          <div className={styles.rolesList}>
            {ROLE_TYPE_ORDER.map((roleType) => {
              const count = getRoleCount(roleType);
              return (
                <div key={roleType} className={styles.roleItem}>
                  <span className={styles.roleName}>
                    {ROLE_TYPE_DISPLAY_NAMES[roleType]}
                  </span>
                  <span
                    className={styles.roleCount}
                    data-testid={`role-count-${roleType}`}
                  >
                    {count > 0 ? `${count}回` : '-'}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </Modal>
  );
};
