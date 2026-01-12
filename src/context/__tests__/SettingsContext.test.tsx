// context/__tests__/SettingsContext.test.tsx

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { SettingsProvider, useSettings } from '../SettingsContext';
import { STORAGE_KEY, CURRENT_VERSION, DEFAULT_SETTINGS } from '../../types';

/** Wrapper コンポーネント */
function wrapper({ children }: { children: ReactNode }) {
  return <SettingsProvider>{children}</SettingsProvider>;
}

describe('SettingsContext', () => {
  beforeEach(() => {
    // ローカルストレージをクリア
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('初期状態', () => {
    it('デフォルト設定が正しく読み込まれる', () => {
      const { result } = renderHook(() => useSettings(), { wrapper });

      expect(result.current.soundEnabled).toBe(true);
      expect(result.current.volume).toBe(80);
    });

    it('ローカルストレージから設定を読み込む', () => {
      const savedData = {
        settings: {
          soundEnabled: false,
          volume: 50,
        },
        stats: {
          solo: { playCount: 0, highScore: 0, totalScore: 0 },
          battle: { playCount: 0, wins: 0, losses: 0 },
          roleAchievements: {},
        },
        version: CURRENT_VERSION,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));

      const { result } = renderHook(() => useSettings(), { wrapper });

      // useEffectを実行
      act(() => {
        vi.runAllTimers();
      });

      expect(result.current.soundEnabled).toBe(false);
      expect(result.current.volume).toBe(50);
    });

    it('バージョンが異なる場合はデフォルト設定を使用', () => {
      const savedData = {
        settings: {
          soundEnabled: false,
          volume: 50,
        },
        stats: {
          solo: { playCount: 0, highScore: 0, totalScore: 0 },
          battle: { playCount: 0, wins: 0, losses: 0 },
          roleAchievements: {},
        },
        version: 999,  // 無効なバージョン
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedData));

      const { result } = renderHook(() => useSettings(), { wrapper });

      act(() => {
        vi.runAllTimers();
      });

      expect(result.current.soundEnabled).toBe(DEFAULT_SETTINGS.soundEnabled);
      expect(result.current.volume).toBe(DEFAULT_SETTINGS.volume);
    });

    it('無効なJSONの場合はデフォルト設定を使用', () => {
      localStorage.setItem(STORAGE_KEY, 'invalid json');

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useSettings(), { wrapper });

      act(() => {
        vi.runAllTimers();
      });

      expect(result.current.soundEnabled).toBe(DEFAULT_SETTINGS.soundEnabled);
      expect(result.current.volume).toBe(DEFAULT_SETTINGS.volume);

      consoleSpy.mockRestore();
    });
  });

  describe('toggleSound', () => {
    it('効果音のON/OFFを切り替えられる', () => {
      const { result } = renderHook(() => useSettings(), { wrapper });

      expect(result.current.soundEnabled).toBe(true);

      act(() => {
        result.current.toggleSound();
      });

      expect(result.current.soundEnabled).toBe(false);

      act(() => {
        result.current.toggleSound();
      });

      expect(result.current.soundEnabled).toBe(true);
    });

    it('切り替えがローカルストレージに保存される', () => {
      const { result } = renderHook(() => useSettings(), { wrapper });

      act(() => {
        vi.runAllTimers();
      });

      act(() => {
        result.current.toggleSound();
      });

      act(() => {
        vi.runAllTimers();
      });

      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      expect(saved.settings.soundEnabled).toBe(false);
    });
  });

  describe('setVolume', () => {
    it('音量を設定できる', () => {
      const { result } = renderHook(() => useSettings(), { wrapper });

      act(() => {
        result.current.setVolume(50);
      });

      expect(result.current.volume).toBe(50);
    });

    it('0未満の値は0にクランプされる', () => {
      const { result } = renderHook(() => useSettings(), { wrapper });

      act(() => {
        result.current.setVolume(-10);
      });

      expect(result.current.volume).toBe(0);
    });

    it('100を超える値は100にクランプされる', () => {
      const { result } = renderHook(() => useSettings(), { wrapper });

      act(() => {
        result.current.setVolume(150);
      });

      expect(result.current.volume).toBe(100);
    });

    it('音量がローカルストレージに保存される', () => {
      const { result } = renderHook(() => useSettings(), { wrapper });

      act(() => {
        vi.runAllTimers();
      });

      act(() => {
        result.current.setVolume(30);
      });

      act(() => {
        vi.runAllTimers();
      });

      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      expect(saved.settings.volume).toBe(30);
    });
  });

  describe('Provider外での使用', () => {
    it('Provider外で使用するとエラーがスローされる', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useSettings());
      }).toThrow('useSettings must be used within a SettingsProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('ローカルストレージへの保存', () => {
    it('既存データがある場合は設定のみ更新される', () => {
      const existingData = {
        settings: {
          soundEnabled: true,
          volume: 80,
        },
        stats: {
          solo: { playCount: 10, highScore: 100, totalScore: 500 },
          battle: { playCount: 5, wins: 3, losses: 2 },
          roleAchievements: { flush: 1 },
        },
        version: CURRENT_VERSION,
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existingData));

      const { result } = renderHook(() => useSettings(), { wrapper });

      act(() => {
        vi.runAllTimers();
      });

      act(() => {
        result.current.setVolume(50);
      });

      act(() => {
        vi.runAllTimers();
      });

      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      // 設定は更新される
      expect(saved.settings.volume).toBe(50);
      // 統計は保持される
      expect(saved.stats.solo.playCount).toBe(10);
      expect(saved.stats.roleAchievements.flush).toBe(1);
    });
  });
});
