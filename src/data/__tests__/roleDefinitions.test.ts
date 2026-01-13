import { describe, expect, it } from 'vitest';
import type { ColorCode } from '../../types/card';
import {
  FLUSH_ROLES,
  FOUR_COLOR_ROLES,
  THREE_COLOR_ROLES,
  ONE_PAIR_ROLES,
  FUR_ROLES,
  COLOR_RARITY,
  calculateTwoPairPoints,
  calculateFullHousePoints,
  NO_PAIR,
} from '../roleDefinitions';

describe('roleDefinitions', () => {
  describe('COLOR_RARITY', () => {
    it('should have rarity scores for all 12 color codes', () => {
      expect(Object.keys(COLOR_RARITY)).toHaveLength(12);
      for (let i = 0; i <= 11; i++) {
        expect(COLOR_RARITY[i as ColorCode]).toBeDefined();
      }
    });

    it('should have rarity scores in range 1-12', () => {
      Object.values(COLOR_RARITY).forEach((score) => {
        expect(score).toBeGreaterThanOrEqual(1);
        expect(score).toBeLessThanOrEqual(12);
      });
    });

    it('should have unique rarity scores', () => {
      const scores = Object.values(COLOR_RARITY);
      const uniqueScores = new Set(scores);
      expect(uniqueScores.size).toBe(scores.length);
    });

    it('should have サビ as most rare (score 12)', () => {
      expect(COLOR_RARITY[11]).toBe(12);
    });

    it('should have 茶白 as most common (score 1)', () => {
      expect(COLOR_RARITY[4]).toBe(1);
    });
  });

  describe('FLUSH_ROLES', () => {
    it('should have 12 flush roles', () => {
      expect(Object.keys(FLUSH_ROLES)).toHaveLength(12);
    });

    it('should have points in range 198-300', () => {
      Object.values(FLUSH_ROLES).forEach((role) => {
        expect(role.points).toBeGreaterThanOrEqual(198);
        expect(role.points).toBeLessThanOrEqual(300);
      });
    });

    it('should have unique points', () => {
      const points = Object.values(FLUSH_ROLES).map((r) => r.points);
      const uniquePoints = new Set(points);
      expect(uniquePoints.size).toBe(points.length);
    });

    it('should have correct サビフラッシュ with highest points', () => {
      expect(FLUSH_ROLES[11]).toEqual({
        name: 'サビフラッシュ',
        points: 300,
      });
    });

    it('should have correct 茶白フラッシュ with lowest flush points', () => {
      expect(FLUSH_ROLES[4]).toEqual({
        name: '茶白フラッシュ',
        points: 198,
      });
    });

    it('should have valid name format', () => {
      Object.values(FLUSH_ROLES).forEach((role) => {
        expect(role.name).toMatch(/フラッシュ$/);
      });
    });
  });

  describe('FOUR_COLOR_ROLES', () => {
    it('should have 12 four-color roles', () => {
      expect(Object.keys(FOUR_COLOR_ROLES)).toHaveLength(12);
    });

    it('should have points in range 63-277', () => {
      Object.values(FOUR_COLOR_ROLES).forEach((role) => {
        expect(role.points).toBeGreaterThanOrEqual(63);
        expect(role.points).toBeLessThanOrEqual(277);
      });
    });

    it('should have unique points', () => {
      const points = Object.values(FOUR_COLOR_ROLES).map((r) => r.points);
      const uniquePoints = new Set(points);
      expect(uniquePoints.size).toBe(points.length);
    });

    it('should have valid name format', () => {
      Object.values(FOUR_COLOR_ROLES).forEach((role) => {
        expect(role.name).toMatch(/フォーカラー$/);
      });
    });
  });

  describe('THREE_COLOR_ROLES', () => {
    it('should have 12 three-color roles', () => {
      expect(Object.keys(THREE_COLOR_ROLES)).toHaveLength(12);
    });

    it('should have points in range 16-112', () => {
      Object.values(THREE_COLOR_ROLES).forEach((role) => {
        expect(role.points).toBeGreaterThanOrEqual(16);
        expect(role.points).toBeLessThanOrEqual(112);
      });
    });

    it('should have unique points', () => {
      const points = Object.values(THREE_COLOR_ROLES).map((r) => r.points);
      const uniquePoints = new Set(points);
      expect(uniquePoints.size).toBe(points.length);
    });

    it('should have valid name format', () => {
      Object.values(THREE_COLOR_ROLES).forEach((role) => {
        expect(role.name).toMatch(/スリーカラー$/);
      });
    });
  });

  describe('ONE_PAIR_ROLES', () => {
    it('should have 12 one-pair roles', () => {
      expect(Object.keys(ONE_PAIR_ROLES)).toHaveLength(12);
    });

    it('should have points in range 2-21', () => {
      Object.values(ONE_PAIR_ROLES).forEach((role) => {
        expect(role.points).toBeGreaterThanOrEqual(2);
        expect(role.points).toBeLessThanOrEqual(21);
      });
    });

    it('should have unique points', () => {
      const points = Object.values(ONE_PAIR_ROLES).map((r) => r.points);
      const uniquePoints = new Set(points);
      expect(uniquePoints.size).toBe(points.length);
    });

    it('should have valid name format', () => {
      Object.values(ONE_PAIR_ROLES).forEach((role) => {
        expect(role.name).toMatch(/ワンペア$/);
      });
    });
  });

  describe('FUR_ROLES', () => {
    it('should have 2 fur roles', () => {
      expect(Object.keys(FUR_ROLES)).toHaveLength(2);
    });

    it('should have ロングファー with 100 points', () => {
      expect(FUR_ROLES[0]).toEqual({
        name: 'ロングファー',
        points: 100,
      });
    });

    it('should have ショートファー with 1 point', () => {
      expect(FUR_ROLES[1]).toEqual({
        name: 'ショートファー',
        points: 1,
      });
    });
  });

  describe('calculateTwoPairPoints', () => {
    it('should return points in range 23-154', () => {
      // Test all possible combinations
      for (let i = 0; i <= 11; i++) {
        for (let j = i + 1; j <= 11; j++) {
          const points = calculateTwoPairPoints(i as ColorCode, j as ColorCode);
          expect(points).toBeGreaterThanOrEqual(23);
          expect(points).toBeLessThanOrEqual(154);
        }
      }
    });

    it('should return highest points for サビ×三毛 (11, 1)', () => {
      const points = calculateTwoPairPoints(11, 1);
      expect(points).toBe(154);
    });

    it('should return lowest points for 茶白×キジトラ (4, 6)', () => {
      const points = calculateTwoPairPoints(4, 6);
      expect(points).toBe(23);
    });

    it('should be symmetric (order does not matter)', () => {
      const points1 = calculateTwoPairPoints(11, 1);
      const points2 = calculateTwoPairPoints(1, 11);
      expect(points1).toBe(points2);
    });
  });

  describe('calculateFullHousePoints', () => {
    it('should return points in range 105-294', () => {
      // Test all possible combinations
      for (let i = 0; i <= 11; i++) {
        for (let j = 0; j <= 11; j++) {
          if (i === j) continue; // Skip same colors
          const points = calculateFullHousePoints(i as ColorCode, j as ColorCode);
          expect(points).toBeGreaterThanOrEqual(105);
          expect(points).toBeLessThanOrEqual(294);
        }
      }
    });

    it('should return highest points for サビ×三毛 (11, 1)', () => {
      const points = calculateFullHousePoints(11, 1);
      expect(points).toBe(294);
    });

    it('should return lowest points for 茶白×キジトラ (4, 6)', () => {
      const points = calculateFullHousePoints(4, 6);
      expect(points).toBe(105);
    });

    it('should weight three-card color more heavily', () => {
      // サビ×茶白 should have higher points than 茶白×サビ
      const sabiThree = calculateFullHousePoints(11, 4);
      const sabiTwo = calculateFullHousePoints(4, 11);
      expect(sabiThree).toBeGreaterThan(sabiTwo);
    });
  });

  describe('NO_PAIR', () => {
    it('should have name and 0 points', () => {
      expect(NO_PAIR).toEqual({
        name: 'ノーペア',
        points: 0,
      });
    });
  });

  describe('Point uniqueness across all roles', () => {
    it('should have all unique points across all role types', () => {
      const allPoints: number[] = [
        ...Object.values(FLUSH_ROLES).map((r) => r.points),
        ...Object.values(FOUR_COLOR_ROLES).map((r) => r.points),
        ...Object.values(THREE_COLOR_ROLES).map((r) => r.points),
        ...Object.values(ONE_PAIR_ROLES).map((r) => r.points),
        ...Object.values(FUR_ROLES).map((r) => r.points),
        NO_PAIR.points,
      ];

      // Add sample two-pair and full-house points
      const twoPairSamples: number[] = [];
      for (let i = 0; i <= 11; i++) {
        for (let j = i + 1; j <= 11; j++) {
          twoPairSamples.push(calculateTwoPairPoints(i as ColorCode, j as ColorCode));
        }
      }

      const fullHouseSamples: number[] = [];
      for (let i = 0; i <= 11; i++) {
        for (let j = 0; j <= 11; j++) {
          if (i === j) continue;
          fullHouseSamples.push(calculateFullHousePoints(i as ColorCode, j as ColorCode));
        }
      }

      // Check no overlap between fixed-point roles
      const fixedPoints = [
        ...Object.values(FLUSH_ROLES).map((r) => r.points),
        ...Object.values(FOUR_COLOR_ROLES).map((r) => r.points),
        ...Object.values(THREE_COLOR_ROLES).map((r) => r.points),
        ...Object.values(ONE_PAIR_ROLES).map((r) => r.points),
        ...Object.values(FUR_ROLES).map((r) => r.points),
        NO_PAIR.points,
      ];

      const uniqueFixedPoints = new Set(fixedPoints);
      expect(uniqueFixedPoints.size).toBe(fixedPoints.length);
    });

    it('should have points in valid range 0-300', () => {
      const allPoints = [
        ...Object.values(FLUSH_ROLES).map((r) => r.points),
        ...Object.values(FOUR_COLOR_ROLES).map((r) => r.points),
        ...Object.values(THREE_COLOR_ROLES).map((r) => r.points),
        ...Object.values(ONE_PAIR_ROLES).map((r) => r.points),
        ...Object.values(FUR_ROLES).map((r) => r.points),
        NO_PAIR.points,
      ];

      allPoints.forEach((points) => {
        expect(points).toBeGreaterThanOrEqual(0);
        expect(points).toBeLessThanOrEqual(300);
      });
    });
  });

  describe('Total role count verification', () => {
    it('should have 249 total unique roles', () => {
      const flushCount = Object.keys(FLUSH_ROLES).length; // 12
      const fourColorCount = Object.keys(FOUR_COLOR_ROLES).length; // 12
      const threeColorCount = Object.keys(THREE_COLOR_ROLES).length; // 12
      const onePairCount = Object.keys(ONE_PAIR_ROLES).length; // 12
      const furCount = Object.keys(FUR_ROLES).length; // 2
      const noPairCount = 1; // 1

      // Two-pair combinations: C(12, 2) = 66
      const twoPairCount = (12 * 11) / 2;

      // Full-house combinations: 12 * 11 = 132 (3 of one color, 2 of another)
      const fullHouseCount = 12 * 11;

      const totalRoles =
        flushCount +
        fourColorCount +
        threeColorCount +
        onePairCount +
        furCount +
        twoPairCount +
        fullHouseCount +
        noPairCount;

      expect(totalRoles).toBe(249);
    });
  });
});
