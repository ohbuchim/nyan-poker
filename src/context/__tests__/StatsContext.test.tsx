// context/__tests__/StatsContext.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { StatsProvider, useStats } from '../StatsContext';
import { DEFAULT_STATS } from '../../types';
import { STORAGE_VERSION, STORAGE_KEYS } from '../../hooks';

/** Wrapper コンポーネント */
function wrapper({ children }: { children: ReactNode }) {
  return <StatsProvider>{children}</StatsProvider>;
}

describe('StatsContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('初期状態', () => {
    it('デフォルト統計が正しく読み込まれる', () => {
      const { result } = renderHook(() => useStats(), { wrapper });

      expect(result.current.soloStats).toEqual(DEFAULT_STATS.solo);
      expect(result.current.battleStats).toEqual(DEFAULT_STATS.battle);
      expect(result.current.roleAchievements).toEqual(DEFAULT_STATS.roleAchievements);
    });

    it('ローカルストレージから統計を読み込む', () => {
      // 各キーに個別にデータを保存
      localStorage.setItem(
        STORAGE_KEYS.SOLO_STATS,
        JSON.stringify({
          version: STORAGE_VERSION,
          data: { playCount: 10, highScore: 150, totalScore: 800 },
        })
      );
      localStorage.setItem(
        STORAGE_KEYS.BATTLE_STATS,
        JSON.stringify({
          version: STORAGE_VERSION,
          data: { playCount: 5, wins: 3, losses: 2 },
        })
      );
      localStorage.setItem(
        STORAGE_KEYS.ACHIEVEMENTS,
        JSON.stringify({
          version: STORAGE_VERSION,
          data: { flush: 2, fourColor: 5 },
        })
      );

      const { result } = renderHook(() => useStats(), { wrapper });

      expect(result.current.soloStats.playCount).toBe(10);
      expect(result.current.soloStats.highScore).toBe(150);
      expect(result.current.battleStats.wins).toBe(3);
      expect(result.current.roleAchievements.flush).toBe(2);
    });

    it('バージョンが異なる場合はデフォルト統計を使用', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      localStorage.setItem(
        STORAGE_KEYS.SOLO_STATS,
        JSON.stringify({
          version: 999, // 無効なバージョン
          data: { playCount: 10, highScore: 150, totalScore: 800 },
        })
      );

      const { result } = renderHook(() => useStats(), { wrapper });

      expect(result.current.soloStats).toEqual(DEFAULT_STATS.solo);

      consoleSpy.mockRestore();
    });
  });

  describe('updateSoloStats', () => {
    it('ひとりモード統計を更新できる', () => {
      const { result } = renderHook(() => useStats(), { wrapper });

      act(() => {
        result.current.updateSoloStats(50);
      });

      expect(result.current.soloStats.playCount).toBe(1);
      expect(result.current.soloStats.highScore).toBe(50);
      expect(result.current.soloStats.totalScore).toBe(50);
    });

    it('複数回プレイで統計が累積される', () => {
      const { result } = renderHook(() => useStats(), { wrapper });

      act(() => {
        result.current.updateSoloStats(50);
      });

      act(() => {
        result.current.updateSoloStats(100);
      });

      act(() => {
        result.current.updateSoloStats(30);
      });

      expect(result.current.soloStats.playCount).toBe(3);
      expect(result.current.soloStats.highScore).toBe(100);
      expect(result.current.soloStats.totalScore).toBe(180);
    });

    it('ハイスコアより低いスコアではハイスコアは更新されない', () => {
      const { result } = renderHook(() => useStats(), { wrapper });

      act(() => {
        result.current.updateSoloStats(100);
      });

      act(() => {
        result.current.updateSoloStats(50);
      });

      expect(result.current.soloStats.highScore).toBe(100);
    });

    it('統計がローカルストレージに保存される', () => {
      const { result } = renderHook(() => useStats(), { wrapper });

      act(() => {
        result.current.updateSoloStats(75);
      });

      const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.SOLO_STATS) || '{}');
      expect(saved.data.playCount).toBe(1);
      expect(saved.data.highScore).toBe(75);
    });
  });

  describe('updateBattleStats', () => {
    it('勝利を記録できる', () => {
      const { result } = renderHook(() => useStats(), { wrapper });

      act(() => {
        result.current.updateBattleStats('win');
      });

      expect(result.current.battleStats.playCount).toBe(1);
      expect(result.current.battleStats.wins).toBe(1);
      expect(result.current.battleStats.losses).toBe(0);
    });

    it('敗北を記録できる', () => {
      const { result } = renderHook(() => useStats(), { wrapper });

      act(() => {
        result.current.updateBattleStats('lose');
      });

      expect(result.current.battleStats.playCount).toBe(1);
      expect(result.current.battleStats.wins).toBe(0);
      expect(result.current.battleStats.losses).toBe(1);
    });

    it('引き分けを記録できる', () => {
      const { result } = renderHook(() => useStats(), { wrapper });

      act(() => {
        result.current.updateBattleStats('draw');
      });

      expect(result.current.battleStats.playCount).toBe(1);
      expect(result.current.battleStats.wins).toBe(0);
      expect(result.current.battleStats.losses).toBe(0);
    });

    it('複数回の対戦で統計が累積される', () => {
      const { result } = renderHook(() => useStats(), { wrapper });

      act(() => {
        result.current.updateBattleStats('win'); // 勝利
      });

      act(() => {
        result.current.updateBattleStats('win'); // 勝利
      });

      act(() => {
        result.current.updateBattleStats('lose'); // 敗北
      });

      act(() => {
        result.current.updateBattleStats('draw'); // 引き分け
      });

      expect(result.current.battleStats.playCount).toBe(4);
      expect(result.current.battleStats.wins).toBe(2);
      expect(result.current.battleStats.losses).toBe(1);
    });

    it('統計がローカルストレージに保存される', () => {
      const { result } = renderHook(() => useStats(), { wrapper });

      act(() => {
        result.current.updateBattleStats('win');
      });

      const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.BATTLE_STATS) || '{}');
      expect(saved.data.playCount).toBe(1);
      expect(saved.data.wins).toBe(1);
    });
  });

  describe('incrementRoleAchievement', () => {
    it('役達成回数を記録できる', () => {
      const { result } = renderHook(() => useStats(), { wrapper });

      act(() => {
        result.current.incrementRoleAchievement('flush');
      });

      expect(result.current.roleAchievements.flush).toBe(1);
    });

    it('同じ役の達成回数が累積される', () => {
      const { result } = renderHook(() => useStats(), { wrapper });

      act(() => {
        result.current.incrementRoleAchievement('fourColor');
      });

      act(() => {
        result.current.incrementRoleAchievement('fourColor');
      });

      act(() => {
        result.current.incrementRoleAchievement('fourColor');
      });

      expect(result.current.roleAchievements.fourColor).toBe(3);
    });

    it('異なる役を記録できる', () => {
      const { result } = renderHook(() => useStats(), { wrapper });

      act(() => {
        result.current.incrementRoleAchievement('flush');
      });

      act(() => {
        result.current.incrementRoleAchievement('fourColor');
      });

      act(() => {
        result.current.incrementRoleAchievement('onePair');
      });

      expect(result.current.roleAchievements.flush).toBe(1);
      expect(result.current.roleAchievements.fourColor).toBe(1);
      expect(result.current.roleAchievements.onePair).toBe(1);
    });

    it('役達成がローカルストレージに保存される', () => {
      const { result } = renderHook(() => useStats(), { wrapper });

      act(() => {
        result.current.incrementRoleAchievement('flush');
      });

      const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS) || '{}');
      expect(saved.data.flush).toBe(1);
    });
  });

  describe('resetStats', () => {
    it('統計をリセットできる', () => {
      const { result } = renderHook(() => useStats(), { wrapper });

      // 統計を追加
      act(() => {
        result.current.updateSoloStats(100);
        result.current.updateBattleStats('win');
        result.current.incrementRoleAchievement('flush');
      });

      // リセット
      act(() => {
        result.current.resetStats();
      });

      expect(result.current.soloStats).toEqual(DEFAULT_STATS.solo);
      expect(result.current.battleStats).toEqual(DEFAULT_STATS.battle);
      expect(result.current.roleAchievements).toEqual(DEFAULT_STATS.roleAchievements);
    });

    it('リセットがローカルストレージに保存される', () => {
      const { result } = renderHook(() => useStats(), { wrapper });

      act(() => {
        result.current.updateSoloStats(100);
      });

      act(() => {
        result.current.resetStats();
      });

      const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.SOLO_STATS) || '{}');
      expect(saved.data.playCount).toBe(0);
    });

    it('リセット時に全ストレージキーが更新される', () => {
      const { result } = renderHook(() => useStats(), { wrapper });

      act(() => {
        result.current.updateSoloStats(100);
        result.current.updateBattleStats('win');
        result.current.incrementRoleAchievement('flush');
      });

      act(() => {
        result.current.resetStats();
      });

      const soloSaved = JSON.parse(localStorage.getItem(STORAGE_KEYS.SOLO_STATS) || '{}');
      const battleSaved = JSON.parse(localStorage.getItem(STORAGE_KEYS.BATTLE_STATS) || '{}');
      // achievementsはremoveItemで削除されるのでnullになる
      const achievementsSaved = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);

      expect(soloSaved.data.playCount).toBe(0);
      expect(battleSaved.data.playCount).toBe(0);
      expect(achievementsSaved).toBeNull();
    });
  });

  describe('Provider外での使用', () => {
    it('Provider外で使用するとエラーがスローされる', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useStats());
      }).toThrow('useStats must be used within a StatsProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('データ分離', () => {
    it('各統計は別々のストレージキーで保存される', () => {
      const { result } = renderHook(() => useStats(), { wrapper });

      act(() => {
        result.current.updateSoloStats(100);
        result.current.updateBattleStats('win');
        result.current.incrementRoleAchievement('flush');
      });

      // 各キーにデータが保存される
      const soloData = localStorage.getItem(STORAGE_KEYS.SOLO_STATS);
      const battleData = localStorage.getItem(STORAGE_KEYS.BATTLE_STATS);
      const achievementsData = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);

      expect(soloData).not.toBeNull();
      expect(battleData).not.toBeNull();
      expect(achievementsData).not.toBeNull();

      // 設定キーには影響しない
      const settingsData = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      expect(settingsData).toBeNull();
    });
  });
});
