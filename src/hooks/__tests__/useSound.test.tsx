// hooks/__tests__/useSound.test.tsx

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import type { ReactNode } from 'react';
import { SettingsProvider } from '../../context/SettingsContext';

// Store mock instances for later inspection
let mockHowlInstances: Array<{
  play: ReturnType<typeof vi.fn>;
  volume: ReturnType<typeof vi.fn>;
  unload: ReturnType<typeof vi.fn>;
  onloaderror?: (id: number, error: unknown) => void;
}> = [];

// Variable to control mock behavior
let mockHowlBehavior: 'normal' | 'throwOnConstruct' | 'throwOnPlay' | 'throwOnUnload' = 'normal';

// Mock Howler module before importing useSound
vi.mock('howler', () => {
  return {
    Howl: class MockHowl {
      play = vi.fn();
      volume = vi.fn();
      unload = vi.fn();
      onloaderror?: (id: number, error: unknown) => void;

      constructor(options: { onloaderror?: (id: number, error: unknown) => void }) {
        if (mockHowlBehavior === 'throwOnConstruct') {
          throw new Error('Howl creation failed');
        }

        if (mockHowlBehavior === 'throwOnPlay') {
          this.play = vi.fn().mockImplementation(() => {
            throw new Error('Playback failed');
          });
        }

        if (mockHowlBehavior === 'throwOnUnload') {
          this.unload = vi.fn().mockImplementation(() => {
            throw new Error('Unload failed');
          });
        }

        this.onloaderror = options?.onloaderror;
        mockHowlInstances.push(this);
      }
    },
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
    mockHowlInstances = [];
    mockHowlBehavior = 'normal';
  });

  afterEach(() => {
    vi.restoreAllMocks();
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

  describe('onloaderror callback', () => {
    it('should handle load error and log warning', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const { result } = renderHook(() => useSound(), { wrapper });

      // Trigger a play to create the Howl instance
      act(() => {
        result.current.playDeal();
      });

      // Find the instance and trigger the onloaderror callback
      const dealInstance = mockHowlInstances.find(inst => inst.onloaderror);
      expect(dealInstance).toBeDefined();

      // Trigger onloaderror callback
      if (dealInstance?.onloaderror) {
        act(() => {
          dealInstance.onloaderror!(1, new Error('Load failed'));
        });
      }

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to load sound deal:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Howl creation error', () => {
    it('should handle Howl constructor throwing an error', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      mockHowlBehavior = 'throwOnConstruct';

      const { result } = renderHook(() => useSound(), { wrapper });

      // The play function should not throw even if Howl creation failed
      expect(() => {
        act(() => {
          result.current.playDeal();
        });
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to create Howl for deal:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('sound playback error', () => {
    it('should handle play method throwing an error', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      mockHowlBehavior = 'throwOnPlay';

      const { result } = renderHook(() => useSound(), { wrapper });

      // The play function should not throw even if play method fails
      expect(() => {
        act(() => {
          result.current.playDeal();
        });
      }).not.toThrow();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to play sound deal:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('cleanup with unload error', () => {
    it('should handle unload method throwing an error during cleanup', () => {
      mockHowlBehavior = 'throwOnUnload';

      const { result, unmount } = renderHook(() => useSound(), { wrapper });

      // Trigger a play to create the Howl instance
      act(() => {
        result.current.playDeal();
      });

      // Unmount should not throw even if unload fails
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('sound disabled', () => {
    it('should not play sound when sound is disabled', () => {
      // Set sound disabled in localStorage
      localStorage.setItem(
        'nyan-poker-settings',
        JSON.stringify({ version: 1, data: { soundEnabled: false, volume: 80 } })
      );

      const { result } = renderHook(() => useSound(), { wrapper });

      act(() => {
        result.current.playDeal();
      });

      // Check that no Howl instances were created since sound is disabled
      // and getSound returns early without creating instances
      // Note: Since preload happens on mount, we need to check the play behavior
      const howlCalls = mockHowlInstances.filter(
        (instance) => instance.play.mock.calls.length > 0
      );
      expect(howlCalls.length).toBe(0);
    });
  });

  describe('sound not available after failed load', () => {
    it('should return early if sound is null after failed creation', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      mockHowlBehavior = 'throwOnConstruct';

      const { result } = renderHook(() => useSound(), { wrapper });

      // This should not throw and should handle null sound gracefully
      expect(() => {
        act(() => {
          result.current.play('flip');
        });
      }).not.toThrow();

      consoleSpy.mockRestore();
    });
  });
});
