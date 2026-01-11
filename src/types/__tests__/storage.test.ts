import { describe, it, expect } from 'vitest';
import {
  getAverageScore,
  getWinRate,
  DEFAULT_SETTINGS,
  DEFAULT_STATS,
  STORAGE_KEY,
  CURRENT_VERSION,
  type SoloStats,
  type BattleStats,
} from '../storage';

describe('storage types', () => {
  describe('getAverageScore', () => {
    it('should return 0 when playCount is 0', () => {
      const stats: SoloStats = { playCount: 0, highScore: 0, totalScore: 0 };
      expect(getAverageScore(stats)).toBe(0);
    });

    it('should calculate average score correctly', () => {
      const stats: SoloStats = {
        playCount: 5,
        highScore: 100,
        totalScore: 250,
      };
      expect(getAverageScore(stats)).toBe(50);
    });

    it('should round to 1 decimal place', () => {
      const stats: SoloStats = {
        playCount: 3,
        highScore: 100,
        totalScore: 100,
      };
      expect(getAverageScore(stats)).toBe(33.3);
    });

    it('should handle large numbers', () => {
      const stats: SoloStats = {
        playCount: 1000,
        highScore: 500,
        totalScore: 123456,
      };
      expect(getAverageScore(stats)).toBe(123.5);
    });
  });

  describe('getWinRate', () => {
    it('should return 0 when playCount is 0', () => {
      const stats: BattleStats = { playCount: 0, wins: 0, losses: 0 };
      expect(getWinRate(stats)).toBe(0);
    });

    it('should calculate win rate correctly', () => {
      const stats: BattleStats = { playCount: 10, wins: 7, losses: 3 };
      expect(getWinRate(stats)).toBe(70);
    });

    it('should round to 1 decimal place', () => {
      const stats: BattleStats = { playCount: 3, wins: 2, losses: 1 };
      expect(getWinRate(stats)).toBe(66.7);
    });

    it('should return 100 for all wins', () => {
      const stats: BattleStats = { playCount: 5, wins: 5, losses: 0 };
      expect(getWinRate(stats)).toBe(100);
    });

    it('should return 0 for all losses', () => {
      const stats: BattleStats = { playCount: 5, wins: 0, losses: 5 };
      expect(getWinRate(stats)).toBe(0);
    });
  });

  describe('constants', () => {
    it('should have correct DEFAULT_SETTINGS', () => {
      expect(DEFAULT_SETTINGS).toEqual({
        soundEnabled: true,
        volume: 80,
      });
    });

    it('should have correct DEFAULT_STATS', () => {
      expect(DEFAULT_STATS).toEqual({
        solo: { playCount: 0, highScore: 0, totalScore: 0 },
        battle: { playCount: 0, wins: 0, losses: 0 },
        roleAchievements: {},
      });
    });

    it('should have correct STORAGE_KEY', () => {
      expect(STORAGE_KEY).toBe('nyan-poker-data');
    });

    it('should have correct CURRENT_VERSION', () => {
      expect(CURRENT_VERSION).toBe(1);
    });
  });
});
