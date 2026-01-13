// context/SettingsContext.tsx

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';

import { DEFAULT_SETTINGS, type SettingsData } from '../types';
import { useLocalStorage, STORAGE_KEYS } from '../hooks';

/** SettingsContext の値の型 */
interface SettingsContextValue {
  soundEnabled: boolean;
  volume: number;
  toggleSound: () => void;
  setVolume: (value: number) => void;
}

/** SettingsContext */
const SettingsContext = createContext<SettingsContextValue | null>(null);

/** SettingsContext の Provider Props */
interface SettingsProviderProps {
  children: ReactNode;
}

/**
 * SettingsContext Provider
 * 効果音と音量の設定を管理する
 * useLocalStorageフックを使用してデータを永続化する
 */
export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useLocalStorage<SettingsData>(
    STORAGE_KEYS.SETTINGS,
    DEFAULT_SETTINGS
  );

  /**
   * 効果音のON/OFFを切り替える
   */
  const toggleSound = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled,
    }));
  }, [setSettings]);

  /**
   * 音量を設定する
   * @param value - 音量 (0-100)
   */
  const setVolume = useCallback(
    (value: number) => {
      // 0-100の範囲に制限
      const clampedValue = Math.max(0, Math.min(100, value));
      setSettings((prev) => ({
        ...prev,
        volume: clampedValue,
      }));
    },
    [setSettings]
  );

  const value = useMemo(
    () => ({
      soundEnabled: settings.soundEnabled,
      volume: settings.volume,
      toggleSound,
      setVolume,
    }),
    [settings.soundEnabled, settings.volume, toggleSound, setVolume]
  );

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

/**
 * SettingsContext を使用するカスタムフック
 * Provider の外で使用された場合はエラーをスローする
 */
export function useSettings(): SettingsContextValue {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

export { SettingsContext };
