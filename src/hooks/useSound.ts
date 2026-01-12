// hooks/useSound.ts

import { useCallback, useRef, useEffect } from 'react';
import { Howl } from 'howler';
import { useSettings } from '../context/SettingsContext';

/** Sound names available in the game */
export type SoundName = 'deal' | 'flip' | 'win' | 'lose';

/** Sound paths configuration */
const SOUND_PATHS: Record<SoundName, string> = {
  deal: '/sounds/deal.mp3',
  flip: '/sounds/flip.mp3',
  win: '/sounds/win.mp3',
  lose: '/sounds/lose.mp3',
};

/** Sound instances cache */
type SoundCache = Record<SoundName, Howl | null>;

/**
 * useSound hook for managing game sound effects
 *
 * Features:
 * - Lazy loading of sound files
 * - Integration with SettingsContext for sound enabled/volume
 * - Error handling for failed sound loads
 * - Individual play functions for each sound effect
 *
 * Usage:
 * ```tsx
 * const { playDeal, playFlip, playWin, playLose } = useSound();
 * playDeal(); // Play card deal sound
 * ```
 */
export function useSound() {
  const { soundEnabled, volume } = useSettings();
  const soundsRef = useRef<SoundCache>({
    deal: null,
    flip: null,
    win: null,
    lose: null,
  });
  const loadAttemptedRef = useRef<Record<SoundName, boolean>>({
    deal: false,
    flip: false,
    win: false,
    lose: false,
  });

  /**
   * Get or create a Howl instance for the given sound
   */
  const getSound = useCallback((name: SoundName): Howl | null => {
    // Return cached sound if available
    if (soundsRef.current[name]) {
      return soundsRef.current[name];
    }

    // Don't retry if we already tried and failed
    if (loadAttemptedRef.current[name]) {
      return null;
    }

    // Mark as attempted
    loadAttemptedRef.current[name] = true;

    try {
      const sound = new Howl({
        src: [SOUND_PATHS[name]],
        preload: true,
        onloaderror: (_id, error) => {
          console.warn(`Failed to load sound ${name}:`, error);
          soundsRef.current[name] = null;
        },
      });

      soundsRef.current[name] = sound;
      return sound;
    } catch (error) {
      console.warn(`Failed to create Howl for ${name}:`, error);
      return null;
    }
  }, []);

  /**
   * Play a sound by name
   */
  const play = useCallback(
    (name: SoundName) => {
      // Don't play if sound is disabled
      if (!soundEnabled) return;

      const sound = getSound(name);
      if (!sound) return;

      try {
        // Set volume (convert from 0-100 to 0-1)
        sound.volume(volume / 100);
        sound.play();
      } catch (error) {
        // Silently ignore playback errors to not affect game flow
        console.warn(`Failed to play sound ${name}:`, error);
      }
    },
    [soundEnabled, volume, getSound]
  );

  /**
   * Preload all sounds
   * Called on mount to ensure sounds are ready when needed
   */
  useEffect(() => {
    // Preload sounds in the background
    const soundNames: SoundName[] = ['deal', 'flip', 'win', 'lose'];
    soundNames.forEach((name) => {
      getSound(name);
    });
  }, [getSound]);

  /**
   * Cleanup sounds on unmount
   */
  useEffect(() => {
    return () => {
      // Unload all sounds to free resources
      const sounds = soundsRef.current;
      Object.values(sounds).forEach((sound) => {
        if (sound) {
          try {
            sound.unload();
          } catch {
            // Ignore unload errors
          }
        }
      });
    };
  }, []);

  // Create individual play functions for each sound
  const playDeal = useCallback(() => play('deal'), [play]);
  const playFlip = useCallback(() => play('flip'), [play]);
  const playWin = useCallback(() => play('win'), [play]);
  const playLose = useCallback(() => play('lose'), [play]);

  return {
    playDeal,
    playFlip,
    playWin,
    playLose,
    /** Generic play function for playing any sound by name */
    play,
  };
}
