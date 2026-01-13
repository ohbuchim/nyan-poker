// hooks/__tests__/useSoundPlayedFlag.test.ts

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSoundPlayedFlag } from '../useSoundPlayedFlag';

describe('useSoundPlayedFlag', () => {
  describe('初期状態', () => {
    it('初期状態ではサウンドは未再生', () => {
      const { result } = renderHook(() => useSoundPlayedFlag());

      expect(result.current.hasPlayedDealSound()).toBe(false);
      expect(result.current.hasPlayedResultSound()).toBe(false);
    });
  });

  describe('tryPlayDealSound', () => {
    it('初回呼び出しでtrueを返す', () => {
      const { result } = renderHook(() => useSoundPlayedFlag());

      let shouldPlay: boolean;
      act(() => {
        shouldPlay = result.current.tryPlayDealSound();
      });

      expect(shouldPlay!).toBe(true);
      expect(result.current.hasPlayedDealSound()).toBe(true);
    });

    it('2回目以降の呼び出しでfalseを返す', () => {
      const { result } = renderHook(() => useSoundPlayedFlag());

      act(() => {
        result.current.tryPlayDealSound();
      });

      let shouldPlaySecond: boolean;
      act(() => {
        shouldPlaySecond = result.current.tryPlayDealSound();
      });

      expect(shouldPlaySecond!).toBe(false);
    });
  });

  describe('tryPlayResultSound', () => {
    it('初回呼び出しでtrueを返す', () => {
      const { result } = renderHook(() => useSoundPlayedFlag());

      let shouldPlay: boolean;
      act(() => {
        shouldPlay = result.current.tryPlayResultSound();
      });

      expect(shouldPlay!).toBe(true);
      expect(result.current.hasPlayedResultSound()).toBe(true);
    });

    it('2回目以降の呼び出しでfalseを返す', () => {
      const { result } = renderHook(() => useSoundPlayedFlag());

      act(() => {
        result.current.tryPlayResultSound();
      });

      let shouldPlaySecond: boolean;
      act(() => {
        shouldPlaySecond = result.current.tryPlayResultSound();
      });

      expect(shouldPlaySecond!).toBe(false);
    });
  });

  describe('resetFlags', () => {
    it('フラグがリセットされる', () => {
      const { result } = renderHook(() => useSoundPlayedFlag());

      // フラグを立てる
      act(() => {
        result.current.tryPlayDealSound();
        result.current.tryPlayResultSound();
      });

      expect(result.current.hasPlayedDealSound()).toBe(true);
      expect(result.current.hasPlayedResultSound()).toBe(true);

      // リセット
      act(() => {
        result.current.resetFlags();
      });

      expect(result.current.hasPlayedDealSound()).toBe(false);
      expect(result.current.hasPlayedResultSound()).toBe(false);
    });

    it('リセット後に再度再生可能になる', () => {
      const { result } = renderHook(() => useSoundPlayedFlag());

      // フラグを立ててリセット
      act(() => {
        result.current.tryPlayDealSound();
        result.current.resetFlags();
      });

      // 再度再生可能
      let shouldPlay: boolean;
      act(() => {
        shouldPlay = result.current.tryPlayDealSound();
      });

      expect(shouldPlay!).toBe(true);
    });
  });

  describe('独立性', () => {
    it('DealSoundとResultSoundは独立して管理される', () => {
      const { result } = renderHook(() => useSoundPlayedFlag());

      // DealSoundだけ再生
      act(() => {
        result.current.tryPlayDealSound();
      });

      expect(result.current.hasPlayedDealSound()).toBe(true);
      expect(result.current.hasPlayedResultSound()).toBe(false);

      // ResultSoundはまだ再生可能
      let shouldPlayResult: boolean;
      act(() => {
        shouldPlayResult = result.current.tryPlayResultSound();
      });

      expect(shouldPlayResult!).toBe(true);
    });
  });
});
