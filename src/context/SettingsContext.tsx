// context/SettingsContext.tsx

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
  DEFAULT_SETTINGS,
  STORAGE_KEY,
  CURRENT_VERSION,
  type SettingsData,
  type StorageData,
} from '../types';

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
 * ローカルストレージから設定を読み込む
 */
function loadSettings(): SettingsData {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const data: StorageData = JSON.parse(stored);
      if (data.version === CURRENT_VERSION && data.settings) {
        return data.settings;
      }
    }
  } catch (error) {
    console.error('Failed to load settings from localStorage:', error);
  }
  return DEFAULT_SETTINGS;
}

/**
 * ローカルストレージに設定を保存する
 */
function saveSettings(settings: SettingsData): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    let data: StorageData;

    if (stored) {
      data = JSON.parse(stored);
      data.settings = settings;
    } else {
      data = {
        settings,
        stats: {
          solo: { playCount: 0, highScore: 0, totalScore: 0 },
          battle: { playCount: 0, wins: 0, losses: 0 },
          roleAchievements: {},
        },
        version: CURRENT_VERSION,
      };
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to save settings to localStorage:', error);
  }
}

/**
 * SettingsContext Provider
 * 効果音と音量の設定を管理する
 */
export function SettingsProvider({ children }: SettingsProviderProps) {
  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS);
  const [isInitialized, setIsInitialized] = useState(false);

  // 初回マウント時にローカルストレージから設定を読み込む
  useEffect(() => {
    const loadedSettings = loadSettings();
    setSettings(loadedSettings);
    setIsInitialized(true);
  }, []);

  // 設定変更時にローカルストレージに保存する
  useEffect(() => {
    if (isInitialized) {
      saveSettings(settings);
    }
  }, [settings, isInitialized]);

  /**
   * 効果音のON/OFFを切り替える
   */
  const toggleSound = useCallback(() => {
    setSettings((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled,
    }));
  }, []);

  /**
   * 音量を設定する
   * @param value - 音量 (0-100)
   */
  const setVolume = useCallback((value: number) => {
    // 0-100の範囲に制限
    const clampedValue = Math.max(0, Math.min(100, value));
    setSettings((prev) => ({
      ...prev,
      volume: clampedValue,
    }));
  }, []);

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
