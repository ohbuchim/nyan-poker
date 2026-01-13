// hooks/__tests__/useLocalStorage.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  useLocalStorage,
  getItem,
  setItem,
  removeItem,
  STORAGE_VERSION,
  STORAGE_KEYS,
} from '../useLocalStorage';

describe('useLocalStorage', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('STORAGE_KEYS', () => {
    it('defines correct storage keys', () => {
      expect(STORAGE_KEYS.SETTINGS).toBe('nyan-poker-settings');
      expect(STORAGE_KEYS.SOLO_STATS).toBe('nyan-poker-solo-stats');
      expect(STORAGE_KEYS.BATTLE_STATS).toBe('nyan-poker-battle-stats');
      expect(STORAGE_KEYS.ACHIEVEMENTS).toBe('nyan-poker-achievements');
    });
  });

  describe('STORAGE_VERSION', () => {
    it('has version 1', () => {
      expect(STORAGE_VERSION).toBe(1);
    });
  });

  describe('getItem', () => {
    it('returns null for non-existent key', () => {
      const result = getItem('non-existent-key');
      expect(result).toBeNull();
    });

    it('returns stored value with correct version', () => {
      const testData = { name: 'test', value: 123 };
      localStorage.setItem(
        'test-key',
        JSON.stringify({ version: STORAGE_VERSION, data: testData })
      );

      const result = getItem<typeof testData>('test-key');
      expect(result).toEqual(testData);
    });

    it('returns null for invalid JSON', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      localStorage.setItem('test-key', 'invalid json');

      const result = getItem('test-key');
      expect(result).toBeNull();

      consoleSpy.mockRestore();
    });

    it('returns null for invalid data format (missing version)', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      localStorage.setItem('test-key', JSON.stringify({ data: 'test' }));

      const result = getItem('test-key');
      expect(result).toBeNull();

      consoleSpy.mockRestore();
    });

    it('returns null for invalid data format (missing data)', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      localStorage.setItem('test-key', JSON.stringify({ version: 1 }));

      const result = getItem('test-key');
      expect(result).toBeNull();

      consoleSpy.mockRestore();
    });

    it('returns null for different version (migration fails)', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      localStorage.setItem(
        'test-key',
        JSON.stringify({ version: 999, data: { test: true } })
      );

      const result = getItem('test-key');
      expect(result).toBeNull();

      consoleSpy.mockRestore();
    });
  });

  describe('setItem', () => {
    it('saves data with version wrapper', () => {
      const testData = { name: 'test', value: 456 };
      const success = setItem('test-key', testData);

      expect(success).toBe(true);

      const stored = JSON.parse(localStorage.getItem('test-key') || '');
      expect(stored.version).toBe(STORAGE_VERSION);
      expect(stored.data).toEqual(testData);
    });

    it('overwrites existing data', () => {
      setItem('test-key', { value: 'old' });
      setItem('test-key', { value: 'new' });

      const result = getItem<{ value: string }>('test-key');
      expect(result).toEqual({ value: 'new' });
    });
  });

  describe('removeItem', () => {
    it('removes item from storage', () => {
      localStorage.setItem('test-key', 'test-value');
      expect(localStorage.getItem('test-key')).toBe('test-value');

      const success = removeItem('test-key');
      expect(success).toBe(true);
      expect(localStorage.getItem('test-key')).toBeNull();
    });

    it('returns true even if item does not exist', () => {
      const success = removeItem('non-existent-key');
      expect(success).toBe(true);
    });

  });

  describe('useLocalStorage hook', () => {
    it('returns default value when storage is empty', () => {
      const defaultValue = { count: 0 };
      const { result } = renderHook(() =>
        useLocalStorage('test-key', defaultValue)
      );

      expect(result.current[0]).toEqual(defaultValue);
    });

    it('returns stored value when available', () => {
      const storedData = { count: 42 };
      localStorage.setItem(
        'test-key',
        JSON.stringify({ version: STORAGE_VERSION, data: storedData })
      );

      const { result } = renderHook(() =>
        useLocalStorage('test-key', { count: 0 })
      );

      expect(result.current[0]).toEqual(storedData);
    });

    it('updates value with direct value', () => {
      const { result } = renderHook(() =>
        useLocalStorage('test-key', { count: 0 })
      );

      act(() => {
        result.current[1]({ count: 10 });
      });

      expect(result.current[0]).toEqual({ count: 10 });

      // Check localStorage
      const stored = JSON.parse(localStorage.getItem('test-key') || '');
      expect(stored.data).toEqual({ count: 10 });
    });

    it('updates value with updater function', () => {
      const { result } = renderHook(() =>
        useLocalStorage('test-key', { count: 5 })
      );

      act(() => {
        result.current[1]((prev) => ({ count: prev.count + 1 }));
      });

      expect(result.current[0]).toEqual({ count: 6 });
    });

    it('removes value and resets to default', () => {
      localStorage.setItem(
        'test-key',
        JSON.stringify({ version: STORAGE_VERSION, data: { count: 100 } })
      );

      const defaultValue = { count: 0 };
      const { result } = renderHook(() =>
        useLocalStorage('test-key', defaultValue)
      );

      expect(result.current[0]).toEqual({ count: 100 });

      act(() => {
        result.current[2](); // removeValue
      });

      expect(result.current[0]).toEqual(defaultValue);
      expect(localStorage.getItem('test-key')).toBeNull();
    });

    it('handles storage event from other tabs', () => {
      const defaultValue = { count: 0 };
      const { result } = renderHook(() =>
        useLocalStorage('test-key', defaultValue)
      );

      expect(result.current[0]).toEqual({ count: 0 });

      // Simulate storage event from another tab
      act(() => {
        const newData = { version: STORAGE_VERSION, data: { count: 99 } };
        const event = new StorageEvent('storage', {
          key: 'test-key',
          newValue: JSON.stringify(newData),
        });
        window.dispatchEvent(event);
      });

      expect(result.current[0]).toEqual({ count: 99 });
    });

    it('handles storage event with null value (item removed)', () => {
      localStorage.setItem(
        'test-key',
        JSON.stringify({ version: STORAGE_VERSION, data: { count: 50 } })
      );

      const defaultValue = { count: 0 };
      const { result } = renderHook(() =>
        useLocalStorage('test-key', defaultValue)
      );

      expect(result.current[0]).toEqual({ count: 50 });

      // Simulate storage event with null (item removed from another tab)
      act(() => {
        const event = new StorageEvent('storage', {
          key: 'test-key',
          newValue: null,
        });
        window.dispatchEvent(event);
      });

      expect(result.current[0]).toEqual(defaultValue);
    });

    it('ignores storage events for other keys', () => {
      const defaultValue = { count: 0 };
      const { result } = renderHook(() =>
        useLocalStorage('test-key', defaultValue)
      );

      act(() => {
        result.current[1]({ count: 10 });
      });

      // Simulate storage event for a different key
      act(() => {
        const event = new StorageEvent('storage', {
          key: 'other-key',
          newValue: JSON.stringify({ version: STORAGE_VERSION, data: { count: 999 } }),
        });
        window.dispatchEvent(event);
      });

      expect(result.current[0]).toEqual({ count: 10 });
    });

    it('ignores storage events with invalid JSON', () => {
      const defaultValue = { count: 0 };
      const { result } = renderHook(() =>
        useLocalStorage('test-key', defaultValue)
      );

      act(() => {
        result.current[1]({ count: 10 });
      });

      // Simulate storage event with invalid JSON
      act(() => {
        const event = new StorageEvent('storage', {
          key: 'test-key',
          newValue: 'invalid json',
        });
        window.dispatchEvent(event);
      });

      // Value should remain unchanged
      expect(result.current[0]).toEqual({ count: 10 });
    });

    it('ignores storage events with wrong version', () => {
      const defaultValue = { count: 0 };
      const { result } = renderHook(() =>
        useLocalStorage('test-key', defaultValue)
      );

      act(() => {
        result.current[1]({ count: 10 });
      });

      // Simulate storage event with wrong version
      act(() => {
        const event = new StorageEvent('storage', {
          key: 'test-key',
          newValue: JSON.stringify({ version: 999, data: { count: 999 } }),
        });
        window.dispatchEvent(event);
      });

      // Value should remain unchanged
      expect(result.current[0]).toEqual({ count: 10 });
    });

    it('cleans up event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = renderHook(() =>
        useLocalStorage('test-key', { count: 0 })
      );

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'storage',
        expect.any(Function)
      );

      removeEventListenerSpy.mockRestore();
    });
  });
});
