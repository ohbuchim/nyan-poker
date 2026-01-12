// context/__tests__/index.test.ts

import { describe, it, expect } from 'vitest';
import {
  GameContext,
  GameProvider,
  useGame,
  initialGameState,
  SettingsContext,
  SettingsProvider,
  useSettings,
  StatsContext,
  StatsProvider,
  useStats,
} from '../index';

describe('context/index.ts exports', () => {
  describe('GameContext exports', () => {
    it('GameContext がエクスポートされている', () => {
      expect(GameContext).toBeDefined();
    });

    it('GameProvider がエクスポートされている', () => {
      expect(GameProvider).toBeDefined();
      expect(typeof GameProvider).toBe('function');
    });

    it('useGame がエクスポートされている', () => {
      expect(useGame).toBeDefined();
      expect(typeof useGame).toBe('function');
    });

    it('initialGameState がエクスポートされている', () => {
      expect(initialGameState).toBeDefined();
      expect(initialGameState.mode).toBe('solo');
      expect(initialGameState.phase).toBe('dealing');
      expect(initialGameState.round).toBe(1);
    });
  });

  describe('SettingsContext exports', () => {
    it('SettingsContext がエクスポートされている', () => {
      expect(SettingsContext).toBeDefined();
    });

    it('SettingsProvider がエクスポートされている', () => {
      expect(SettingsProvider).toBeDefined();
      expect(typeof SettingsProvider).toBe('function');
    });

    it('useSettings がエクスポートされている', () => {
      expect(useSettings).toBeDefined();
      expect(typeof useSettings).toBe('function');
    });
  });

  describe('StatsContext exports', () => {
    it('StatsContext がエクスポートされている', () => {
      expect(StatsContext).toBeDefined();
    });

    it('StatsProvider がエクスポートされている', () => {
      expect(StatsProvider).toBeDefined();
      expect(typeof StatsProvider).toBe('function');
    });

    it('useStats がエクスポートされている', () => {
      expect(useStats).toBeDefined();
      expect(typeof useStats).toBe('function');
    });
  });
});
