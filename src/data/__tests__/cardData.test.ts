import { describe, expect, it } from 'vitest';
import { CARD_DATA } from '../cardData';

describe('cardData', () => {
  it('should have exactly 229 cards', () => {
    expect(CARD_DATA).toHaveLength(229);
  });

  it('should have valid color codes (0-11)', () => {
    CARD_DATA.forEach((card, index) => {
      expect(card.color).toBeGreaterThanOrEqual(0);
      expect(card.color).toBeLessThanOrEqual(11);
      expect(Number.isInteger(card.color)).toBe(true);
    });
  });

  it('should have valid fur codes (0-1)', () => {
    CARD_DATA.forEach((card, index) => {
      expect(card.fur).toBeGreaterThanOrEqual(0);
      expect(card.fur).toBeLessThanOrEqual(1);
      expect(Number.isInteger(card.fur)).toBe(true);
    });
  });

  it('should have correct distribution of fur codes', () => {
    const furCounts = CARD_DATA.reduce(
      (acc, card) => {
        acc[card.fur]++;
        return acc;
      },
      { 0: 0, 1: 0 },
    );

    // According to requirements.md:
    // - 長毛 (0): 48枚
    // - 短毛 (1): 181枚
    expect(furCounts[0]).toBe(48);
    expect(furCounts[1]).toBe(181);
  });

  it('should have correct distribution of color codes', () => {
    const colorCounts = CARD_DATA.reduce(
      (acc, card) => {
        acc[card.color] = (acc[card.color] || 0) + 1;
        return acc;
      },
      {} as Record<number, number>,
    );

    // According to requirements.md, verify the total card counts
    // 茶トラ (0): 27枚
    expect(colorCounts[0]).toBe(27);
    // 三毛 (1): 12枚
    expect(colorCounts[1]).toBe(12);
    // 白猫 (2): 14枚
    expect(colorCounts[2]).toBe(14);
    // 黒猫 (3): 15枚
    expect(colorCounts[3]).toBe(15);
    // 茶白 (4): 30枚
    expect(colorCounts[4]).toBe(30);
    // キジ白 (5): 23枚
    expect(colorCounts[5]).toBe(23);
    // キジトラ (6): 27枚
    expect(colorCounts[6]).toBe(27);
    // 白黒 (7): 19枚
    expect(colorCounts[7]).toBe(19);
    // サバトラ (8): 17枚
    expect(colorCounts[8]).toBe(17);
    // グレー (9): 24枚
    expect(colorCounts[9]).toBe(24);
    // トビ (10): 13枚
    expect(colorCounts[10]).toBe(13);
    // サビ (11): 8枚
    expect(colorCounts[11]).toBe(8);
  });

  it('should have all cards with proper structure', () => {
    CARD_DATA.forEach((card, index) => {
      expect(card).toHaveProperty('color');
      expect(card).toHaveProperty('fur');
      expect(typeof card.color).toBe('number');
      expect(typeof card.fur).toBe('number');
    });
  });
});
