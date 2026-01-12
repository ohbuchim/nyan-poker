// context/StatsContext.tsx

import {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  type ReactNode,
} from 'react';

import {
  DEFAULT_STATS,
  STORAGE_KEY,
  CURRENT_VERSION,
  type StatsData,
  type SoloStats,
  type BattleStats,
  type RoleAchievements,
  type StorageData,
} from '../types';
import type { RoleType } from '../types';

/** StatsContext の値の型 */
interface StatsContextValue {
  soloStats: SoloStats;
  battleStats: BattleStats;
  roleAchievements: RoleAchievements;
  updateSoloStats: (score: number) => void;
  updateBattleStats: (won: boolean) => void;
  incrementRoleAchievement: (roleType: RoleType) => void;
  resetStats: () => void;
}

/** StatsContext */
const StatsContext = createContext<StatsContextValue | null>(null);

/** StatsContext の Provider Props */
interface StatsProviderProps {
  children: ReactNode;
}

/**
 * ローカルストレージから統計を読み込む
 */
function loadStats(): StatsData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data: StorageData = JSON.parse(stored);
      if (data.version === CURRENT_VERSION && data.stats) {
        return data.stats;
      }
    }
  } catch (error) {
    console.error('Failed to load stats from localStorage:', error);
  }
  return DEFAULT_STATS;
}

/**
 * ローカルストレージに統計を保存する
 */
function saveStats(stats: StatsData): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let data: StorageData;

    if (stored) {
      data = JSON.parse(stored);
      data.stats = stats;
    } else {
      data = {
        settings: {
          soundEnabled: true,
          volume: 80,
        },
        stats,
        version: CURRENT_VERSION,
      };
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save stats to localStorage:', error);
  }
}

/**
 * StatsContext Provider
 * ゲーム統計を管理する
 */
export function StatsProvider({ children }: StatsProviderProps) {
  const [stats, setStats] = useState<StatsData>(DEFAULT_STATS);
  const [isInitialized, setIsInitialized] = useState(false);

  // 初回マウント時にローカルストレージから統計を読み込む
  useEffect(() => {
    const loadedStats = loadStats();
    setStats(loadedStats);
    setIsInitialized(true);
  }, []);

  // 統計変更時にローカルストレージに保存する
  useEffect(() => {
    if (isInitialized) {
      saveStats(stats);
    }
  }, [stats, isInitialized]);

  /**
   * ひとりモード統計を更新する
   * @param score - 獲得スコア
   */
  const updateSoloStats = useCallback((score: number) => {
    setStats((prev) => ({
      ...prev,
      solo: {
        playCount: prev.solo.playCount + 1,
        highScore: Math.max(prev.solo.highScore, score),
        totalScore: prev.solo.totalScore + score,
      },
    }));
  }, []);

  /**
   * 対戦モード統計を更新する
   * @param won - 勝利したかどうか
   */
  const updateBattleStats = useCallback((won: boolean) => {
    setStats((prev) => ({
      ...prev,
      battle: {
        playCount: prev.battle.playCount + 1,
        wins: won ? prev.battle.wins + 1 : prev.battle.wins,
        losses: won ? prev.battle.losses : prev.battle.losses + 1,
      },
    }));
  }, []);

  /**
   * 役達成回数を更新する
   * @param roleType - 役の種類
   */
  const incrementRoleAchievement = useCallback((roleType: RoleType) => {
    setStats((prev) => ({
      ...prev,
      roleAchievements: {
        ...prev.roleAchievements,
        [roleType]: (prev.roleAchievements[roleType] || 0) + 1,
      },
    }));
  }, []);

  /**
   * 統計をリセットする
   */
  const resetStats = useCallback(() => {
    setStats(DEFAULT_STATS);
  }, []);

  const value = useMemo(
    () => ({
      soloStats: stats.solo,
      battleStats: stats.battle,
      roleAchievements: stats.roleAchievements,
      updateSoloStats,
      updateBattleStats,
      incrementRoleAchievement,
      resetStats,
    }),
    [
      stats.solo,
      stats.battle,
      stats.roleAchievements,
      updateSoloStats,
      updateBattleStats,
      incrementRoleAchievement,
      resetStats,
    ]
  );

  return (
    <StatsContext.Provider value={value}>{children}</StatsContext.Provider>
  );
}

/**
 * StatsContext を使用するカスタムフック
 * Provider の外で使用された場合はエラーをスローする
 */
export function useStats(): StatsContextValue {
  const context = useContext(StatsContext);
  if (!context) {
    throw new Error('useStats must be used within a StatsProvider');
  }
  return context;
}

export { StatsContext };
