// hooks/useLocalStorage.ts

import { useState, useCallback, useEffect } from 'react';

/** ストレージのバージョン（マイグレーション用） */
export const STORAGE_VERSION = 1;

/** ストレージキー */
export const STORAGE_KEYS = {
  SETTINGS: 'nyan-poker-settings',
  SOLO_STATS: 'nyan-poker-solo-stats',
  BATTLE_STATS: 'nyan-poker-battle-stats',
  ACHIEVEMENTS: 'nyan-poker-achievements',
} as const;

/** バージョン付きストレージデータ型 */
interface VersionedData<T> {
  version: number;
  data: T;
}

/**
 * ローカルストレージからデータを読み込む
 * @param key - ストレージキー
 * @returns パースされたデータまたはnull
 */
export function getItem<T>(key: string): T | null {
  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return null;
    }

    const parsed: VersionedData<T> = JSON.parse(item);

    // バージョンチェック
    if (typeof parsed.version !== 'number' || parsed.data === undefined) {
      console.warn(`Invalid data format for key: ${key}`);
      return null;
    }

    // バージョンマイグレーション（必要に応じて）
    if (parsed.version !== STORAGE_VERSION) {
      const migrated = migrateData<T>(parsed.data, parsed.version);
      if (migrated !== null) {
        setItem(key, migrated);
        return migrated;
      }
      return null;
    }

    return parsed.data;
  } catch (error) {
    console.error(`Failed to read from localStorage (key: ${key}):`, error);
    return null;
  }
}

/**
 * ローカルストレージにデータを保存する
 * @param key - ストレージキー
 * @param value - 保存するデータ
 * @returns 保存成功したかどうか
 */
export function setItem<T>(key: string, value: T): boolean {
  try {
    const versionedData: VersionedData<T> = {
      version: STORAGE_VERSION,
      data: value,
    };
    localStorage.setItem(key, JSON.stringify(versionedData));
    return true;
  } catch (error) {
    console.error(`Failed to write to localStorage (key: ${key}):`, error);
    return false;
  }
}

/**
 * ローカルストレージからデータを削除する
 * @param key - ストレージキー
 * @returns 削除成功したかどうか
 */
export function removeItem(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Failed to remove from localStorage (key: ${key}):`, error);
    return false;
  }
}

/**
 * データをマイグレーションする
 * 古いバージョンのデータを新しいバージョンに変換する
 * @param data - 古いデータ
 * @param fromVersion - 古いバージョン番号
 * @returns マイグレーション後のデータまたはnull
 */
function migrateData<T>(data: unknown, fromVersion: number): T | null {
  // 現在はバージョン1のみなので、古いバージョンからの変換は行わない
  // 将来のバージョンアップ時にここにマイグレーションロジックを追加
  console.warn(`Cannot migrate data from version ${fromVersion} to ${STORAGE_VERSION}`);
  return null;
}

/**
 * ローカルストレージを使用するカスタムフック
 * @param key - ストレージキー
 * @param defaultValue - デフォルト値
 * @returns [値, 値を設定する関数, 値を削除する関数]
 */
export function useLocalStorage<T>(
  key: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // 初期化時にローカルストレージから読み込む
  const [storedValue, setStoredValue] = useState<T>(() => {
    const item = getItem<T>(key);
    return item !== null ? item : defaultValue;
  });

  // ストレージに保存
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      setStoredValue((prev) => {
        const newValue = value instanceof Function ? value(prev) : value;
        setItem(key, newValue);
        return newValue;
      });
    },
    [key]
  );

  // ストレージから削除してデフォルト値に戻す
  const removeValue = useCallback(() => {
    removeItem(key);
    setStoredValue(defaultValue);
  }, [key, defaultValue]);

  // 他のタブでの変更を検知する
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key) {
        if (event.newValue === null) {
          setStoredValue(defaultValue);
        } else {
          try {
            const parsed: VersionedData<T> = JSON.parse(event.newValue);
            if (parsed.version === STORAGE_VERSION && parsed.data !== undefined) {
              setStoredValue(parsed.data);
            }
          } catch {
            // パースエラーは無視
          }
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [key, defaultValue]);

  return [storedValue, setValue, removeValue];
}
