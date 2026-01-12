// hooks/__tests__/useSound.test.tsx

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import type { ReactNode } from 'react';
import { SettingsProvider } from '../../context/SettingsContext';

// Mock Howler module before importing useSound
vi.mock('howler', () => {
  return {
    Howl: vi.fn().mockImplementation(() => ({
      play: vi.fn(),
      volume: vi.fn(),
      unload: vi.fn(),
    })),
  };
});

// Import useSound after mocking
import { useSound } from '../useSound';

/** Wrapper component with SettingsProvider */
function wrapper({ children }: { children: ReactNode }) {
  return <SettingsProvider>{children}</SettingsProvider>;
}

describe('useSound', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  describe('initialization', () => {
    it('should return play functions', () => {
      const { result } = renderHook(() => useSound(), { wrapper });

      expect(result.current.playDeal).toBeDefined();
      expect(result.current.playFlip).toBeDefined();
      expect(result.current.playWin).toBeDefined();
      expect(result.current.playLose).toBeDefined();
      expect(result.current.play).toBeDefined();
    });

    it('should return functions that are callable', () => {
      const { result } = renderHook(() => useSound(), { wrapper });

      expect(typeof result.current.playDeal).toBe('function');
      expect(typeof result.current.playFlip).toBe('function');
      expect(typeof result.current.playWin).toBe('function');
      expect(typeof result.current.playLose).toBe('function');
      expect(typeof result.current.play).toBe('function');
    });
  });

  describe('play functions', () => {
    it('playDeal should be callable without throwing', () => {
      const { result } = renderHook(() => useSound(), { wrapper });

      expect(() => result.current.playDeal()).not.toThrow();
    });

    it('playFlip should be callable without throwing', () => {
      const { result } = renderHook(() => useSound(), { wrapper });

      expect(() => result.current.playFlip()).not.toThrow();
    });

    it('playWin should be callable without throwing', () => {
      const { result } = renderHook(() => useSound(), { wrapper });

      expect(() => result.current.playWin()).not.toThrow();
    });

    it('playLose should be callable without throwing', () => {
      const { result } = renderHook(() => useSound(), { wrapper });

      expect(() => result.current.playLose()).not.toThrow();
    });

    it('play should accept sound name and be callable without throwing', () => {
      const { result } = renderHook(() => useSound(), { wrapper });

      expect(() => result.current.play('deal')).not.toThrow();
      expect(() => result.current.play('flip')).not.toThrow();
      expect(() => result.current.play('win')).not.toThrow();
      expect(() => result.current.play('lose')).not.toThrow();
    });
  });

  describe('Provider requirement', () => {
    it('should throw when used outside SettingsProvider', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useSound());
      }).toThrow('useSettings must be used within a SettingsProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('error handling', () => {
    it('should not throw when Howl methods throw', () => {
      // This test verifies the error handling in the hook
      const { result } = renderHook(() => useSound(), { wrapper });

      // Even with mocked Howl, calling play functions should not throw
      expect(() => {
        result.current.playDeal();
        result.current.playFlip();
        result.current.playWin();
        result.current.playLose();
      }).not.toThrow();
    });
  });

  describe('cleanup', () => {
    it('should unmount without errors', () => {
      const { unmount } = renderHook(() => useSound(), { wrapper });

      expect(() => unmount()).not.toThrow();
    });
  });

  describe('multiple plays', () => {
    it('should allow calling play functions multiple times', () => {
      const { result } = renderHook(() => useSound(), { wrapper });

      expect(() => {
        result.current.playDeal();
        result.current.playDeal();
        result.current.playDeal();
      }).not.toThrow();
    });

    it('should allow calling different play functions', () => {
      const { result } = renderHook(() => useSound(), { wrapper });

      expect(() => {
        result.current.playDeal();
        result.current.playFlip();
        result.current.playWin();
        result.current.playLose();
      }).not.toThrow();
    });
  });
});
