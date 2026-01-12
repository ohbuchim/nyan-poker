// context/__tests__/StatsContext.test.tsx

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { StatsProvider, useStats } from '../StatsContext';
import { STORAGE_KEY, CURRENT_VERSION, DEFAULT_STATS } from '../../types';

/** Wrapper コンポーネント */
function wrapper({ children }: { children: ReactNode }) {
  return <StatsProvider>{children}</StatsProvider>;
}

describe('StatsContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('初期状態', () => {
    it('デフォルト統計が正しく読み込まれる', () => {
      const { result } = renderHook(() => useStats(), { wrapper });

      expect(result.current.soloStats).toEqual(DEFAULT_STATS.solo);
      expect(result.current.battleStats).toEqual(DEFAULT_STATS.battle);
      expect(result.current.roleAchievements).toEqual(DEFAULT_STATS.roleAchievements);
    });

    it('ローカルストレージから統計を読み込む', () => {
      const savedData = {
        settings: {
          soundEnabled: true,
          volume: 80,
        },
        stats: {
          solo: { playCount: 10, highScore: 150, totalScore: 800 },
          battle: { playCount: 5, wins: 3, losses: 2 },
          roleAchievements: { flush: 2, fourColor: 5 },
        },
        version: CURRENT_VERSION,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));

      const { result } = renderHook(() => useStats(), { wrapper });

      act(() => {
        vi.runAllTimers();
      });

      expect(result.current.soloStats.playCount).toBe(10);
      expect(result.current.soloStats.highScore).toBe(150);
      expect(result.current.battleStats.wins).toBe(3);
      expect(result.current.roleAchievements.flush).toBe(2);
    });

    it('バージョンが異なる場合はデフォルト統計を使用', () => {
      const savedData = {
        settings: {
          soundEnabled: true,
          volume: 80,
        },
        stats: {
          solo: { playCount: 10, highScore: 150, totalScore: 800 },
          battle: { playCount: 5, wins: 3, losses: 2 },
          roleAchievements: {},
        },
        version: 999,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));

      const { result } = renderHook(() => useStats(), { wrapper });

      act(() => {
        vi.runAllTimers();
      });

      expect(result.current.soloStats).toEqual(DEFAULT_STATS.solo);
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
        vi.runAllTimers();
      });

      act(() => {
        result.current.updateSoloStats(75);
      });

      act(() => {
        vi.runAllTimers();
      });

      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      expect(saved.stats.solo.playCount).toBe(1);
      expect(saved.stats.solo.highScore).toBe(75);
    });
  });

  describe('updateBattleStats', () => {
    it('勝利を記録できる', () => {
      const { result } = renderHook(() => useStats(), { wrapper });

      act(() => {
        result.current.updateBattleStats(true);
      });

      expect(result.current.battleStats.playCount).toBe(1);
      expect(result.current.battleStats.wins).toBe(1);
      expect(result.current.battleStats.losses).toBe(0);
    });

    it('敗北を記録できる', () => {
      const { result } = renderHook(() => useStats(), { wrapper });

      act(() => {
        result.current.updateBattleStats(false);
      });

      expect(result.current.battleStats.playCount).toBe(1);
      expect(result.current.battleStats.wins).toBe(0);
      expect(result.current.battleStats.losses).toBe(1);
    });

    it('複数回の対戦で統計が累積される', () => {
      const { result } = renderHook(() => useStats(), { wrapper });

      act(() => {
        result.current.updateBattleStats(true);  // 勝利
      });

      act(() => {
        result.current.updateBattleStats(true);  // 勝利
      });

      act(() => {
        result.current.updateBattleStats(false); // 敗北
      });

      expect(result.current.battleStats.playCount).toBe(3);
      expect(result.current.battleStats.wins).toBe(2);
      expect(result.current.battleStats.losses).toBe(1);
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
  });

  describe('resetStats', () => {
    it('統計をリセットできる', () => {
      const { result } = renderHook(() => useStats(), { wrapper });

      // 統計を追加
      act(() => {
        result.current.updateSoloStats(100);
        result.current.updateBattleStats(true);
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
        vi.runAllTimers();
      });

      act(() => {
        result.current.updateSoloStats(100);
      });

      act(() => {
        vi.runAllTimers();
      });

      act(() => {
        result.current.resetStats();
      });

      act(() => {
        vi.runAllTimers();
      });

      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      expect(saved.stats.solo.playCount).toBe(0);
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

  describe('ローカルストレージへの保存', () => {
    it('既存データがある場合は統計のみ更新される', () => {
      const existingData = {
        settings: {
          soundEnabled: false,
          volume: 30,
        },
        stats: {
          solo: { playCount: 0, highScore: 0, totalScore: 0 },
          battle: { playCount: 0, wins: 0, losses: 0 },
          roleAchievements: {},
        },
        version: CURRENT_VERSION,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingData));

      const { result } = renderHook(() => useStats(), { wrapper });

      act(() => {
        vi.runAllTimers();
      });

      act(() => {
        result.current.updateSoloStats(50);
      });

      act(() => {
        vi.runAllTimers();
      });

      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      // 統計は更新される
      expect(saved.stats.solo.playCount).toBe(1);
      // 設定は保持される
      expect(saved.settings.soundEnabled).toBe(false);
      expect(saved.settings.volume).toBe(30);
    });
  });
});
