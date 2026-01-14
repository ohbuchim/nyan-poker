// context/StatsContext.tsx

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';

import {
  DEFAULT_STATS,
  type SoloStats,
  type BattleStats,
  type RoleAchievements,
} from '../types';
import type { RoleType } from '../types';
import { useLocalStorage, STORAGE_KEYS } from '../hooks';

/** 対戦結果の型 */
export type BattleResult = 'win' | 'lose' | 'draw';

/** StatsContext の値の型 */
interface StatsContextValue {
  soloStats: SoloStats;
  battleStats: BattleStats;
  roleAchievements: RoleAchievements;
  updateSoloStats: (score: number) => void;
  updateBattleStats: (result: BattleResult) => void;
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
 * StatsContext Provider
 * ゲーム統計を管理する
 * useLocalStorageフックを使用してデータを永続化する
 */
export function StatsProvider({ children }: StatsProviderProps) {
  const [soloStats, setSoloStats] = useLocalStorage<SoloStats>(
    STORAGE_KEYS.SOLO_STATS,
    DEFAULT_STATS.solo
  );

  const [battleStats, setBattleStats] = useLocalStorage<BattleStats>(
    STORAGE_KEYS.BATTLE_STATS,
    DEFAULT_STATS.battle
  );

  const [roleAchievements, setRoleAchievements, resetRoleAchievements] =
    useLocalStorage<RoleAchievements>(
      STORAGE_KEYS.ACHIEVEMENTS,
      DEFAULT_STATS.roleAchievements
    );

  /**
   * ひとりモード統計を更新する
   * @param score - 獲得スコア
   */
  const updateSoloStats = useCallback(
    (score: number) => {
      setSoloStats((prev) => ({
        playCount: prev.playCount + 1,
        highScore: Math.max(prev.highScore, score),
        totalScore: prev.totalScore + score,
      }));
    },
    [setSoloStats]
  );

  /**
   * 対戦モード統計を更新する
   * @param result - 対戦結果（'win' | 'lose' | 'draw'）
   */
  const updateBattleStats = useCallback(
    (result: BattleResult) => {
      setBattleStats((prev) => ({
        playCount: prev.playCount + 1,
        wins: result === 'win' ? prev.wins + 1 : prev.wins,
        losses: result === 'lose' ? prev.losses + 1 : prev.losses,
      }));
    },
    [setBattleStats]
  );

  /**
   * 役達成回数を更新する
   * @param roleType - 役の種類
   */
  const incrementRoleAchievement = useCallback(
    (roleType: RoleType) => {
      setRoleAchievements((prev) => ({
        ...prev,
        [roleType]: (prev[roleType] || 0) + 1,
      }));
    },
    [setRoleAchievements]
  );

  /**
   * 統計をリセットする
   */
  const resetStats = useCallback(() => {
    setSoloStats(DEFAULT_STATS.solo);
    setBattleStats(DEFAULT_STATS.battle);
    resetRoleAchievements();
  }, [setSoloStats, setBattleStats, resetRoleAchievements]);

  const value = useMemo(
    () => ({
      soloStats,
      battleStats,
      roleAchievements,
      updateSoloStats,
      updateBattleStats,
      incrementRoleAchievement,
      resetStats,
    }),
    [
      soloStats,
      battleStats,
      roleAchievements,
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
