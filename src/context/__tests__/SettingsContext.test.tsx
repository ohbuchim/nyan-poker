// context/__tests__/SettingsContext.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { SettingsProvider, useSettings } from '../SettingsContext';
import { DEFAULT_SETTINGS } from '../../types';
import { STORAGE_VERSION, STORAGE_KEYS } from '../../hooks';

/** Wrapper コンポーネント */
function wrapper({ children }: { children: ReactNode }) {
  return <SettingsProvider>{children}</SettingsProvider>;
}

describe('SettingsContext', () => {
  beforeEach(() => {
    // ローカルストレージをクリア
    localStorage.clear();
  });

  describe('初期状態', () => {
    it('デフォルト設定が正しく読み込まれる', () => {
      const { result } = renderHook(() => useSettings(), { wrapper });

      expect(result.current.soundEnabled).toBe(true);
      expect(result.current.volume).toBe(80);
    });

    it('ローカルストレージから設定を読み込む', () => {
      const savedData = {
        version: STORAGE_VERSION,
        data: {
          soundEnabled: false,
          volume: 50,
        },
      };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(savedData));

      const { result } = renderHook(() => useSettings(), { wrapper });

      expect(result.current.soundEnabled).toBe(false);
      expect(result.current.volume).toBe(50);
    });

    it('バージョンが異なる場合はデフォルト設定を使用', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const savedData = {
        version: 999, // 無効なバージョン
        data: {
          soundEnabled: false,
          volume: 50,
        },
      };
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(savedData));

      const { result } = renderHook(() => useSettings(), { wrapper });

      expect(result.current.soundEnabled).toBe(DEFAULT_SETTINGS.soundEnabled);
      expect(result.current.volume).toBe(DEFAULT_SETTINGS.volume);

      consoleSpy.mockRestore();
    });

    it('無効なJSONの場合はデフォルト設定を使用', () => {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, 'invalid json');

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { result } = renderHook(() => useSettings(), { wrapper });

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
        result.current.toggleSound();
      });

      const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
      expect(saved.data.soundEnabled).toBe(false);
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
        result.current.setVolume(30);
      });

      const saved = JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
      expect(saved.data.volume).toBe(30);
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

  describe('データ分離', () => {
    it('設定と統計は別々のストレージキーで保存される', () => {
      const { result } = renderHook(() => useSettings(), { wrapper });

      act(() => {
        result.current.setVolume(50);
      });

      // 設定キーにのみデータが保存される
      const settingsData = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      expect(settingsData).not.toBeNull();

      // 他の統計キーには影響しない
      const soloStatsData = localStorage.getItem(STORAGE_KEYS.SOLO_STATS);
      const battleStatsData = localStorage.getItem(STORAGE_KEYS.BATTLE_STATS);
      const achievementsData = localStorage.getItem(STORAGE_KEYS.ACHIEVEMENTS);

      expect(soloStatsData).toBeNull();
      expect(battleStatsData).toBeNull();
      expect(achievementsData).toBeNull();
    });
  });
});
