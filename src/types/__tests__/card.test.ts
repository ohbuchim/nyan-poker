import { describe, it, expect } from 'vitest';
import { COLOR_NAMES, FUR_NAMES, type ColorCode, type FurCode } from '../card';

describe('card types', () => {
  describe('COLOR_NAMES', () => {
    it('should have all 12 color names', () => {
      expect(Object.keys(COLOR_NAMES)).toHaveLength(12);
    });

    it('should have correct color names for each code', () => {
      expect(COLOR_NAMES[0]).toBe('茶トラ');
      expect(COLOR_NAMES[1]).toBe('三毛');
      expect(COLOR_NAMES[2]).toBe('白猫');
      expect(COLOR_NAMES[3]).toBe('黒猫');
      expect(COLOR_NAMES[4]).toBe('茶白');
      expect(COLOR_NAMES[5]).toBe('キジ白');
      expect(COLOR_NAMES[6]).toBe('キジトラ');
      expect(COLOR_NAMES[7]).toBe('白黒');
      expect(COLOR_NAMES[8]).toBe('サバトラ');
      expect(COLOR_NAMES[9]).toBe('グレー');
      expect(COLOR_NAMES[10]).toBe('トビ');
      expect(COLOR_NAMES[11]).toBe('サビ');
    });

    it('should cover all ColorCode values', () => {
      const colorCodes: ColorCode[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
      colorCodes.forEach((code) => {
        expect(COLOR_NAMES[code]).toBeDefined();
        expect(typeof COLOR_NAMES[code]).toBe('string');
      });
    });
  });

  describe('FUR_NAMES', () => {
    it('should have 2 fur types', () => {
      expect(Object.keys(FUR_NAMES)).toHaveLength(2);
    });

    it('should have correct fur names', () => {
      expect(FUR_NAMES[0]).toBe('長毛');
      expect(FUR_NAMES[1]).toBe('短毛');
    });

    it('should cover all FurCode values', () => {
      const furCodes: FurCode[] = [0, 1];
      furCodes.forEach((code) => {
        expect(FUR_NAMES[code]).toBeDefined();
        expect(typeof FUR_NAMES[code]).toBe('string');
      });
    });
  });
});
