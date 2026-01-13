// utils/__tests__/cardAnalysis.test.ts

import { describe, it, expect } from 'vitest';
import {
  countByColor,
  countByFur,
  analyzeHand,
  findDominantColor,
  findMaxCountColor,
} from '../cardAnalysis';
import type { Card, ColorCode } from '../../types/card';

/** テスト用のカード生成ヘルパー */
function createTestCard(id: number, color: number, fur: number): Card {
  return {
    id,
    image: `/images/image_${String(id).padStart(3, '0')}.jpg`,
    color: color as ColorCode,
    fur: fur as 0 | 1,
  };
}

describe('countByColor', () => {
  it('各色のカード枚数をカウントする', () => {
    const cards: Card[] = [
      createTestCard(0, 0, 1),  // 茶トラ
      createTestCard(1, 0, 1),  // 茶トラ
      createTestCard(2, 1, 1),  // 三毛
      createTestCard(3, 2, 1),  // 白猫
      createTestCard(4, 3, 1),  // 黒猫
    ];

    const counts = countByColor(cards);

    expect(counts.get(0)).toBe(2);  // 茶トラは2枚
    expect(counts.get(1)).toBe(1);  // 三毛は1枚
    expect(counts.get(2)).toBe(1);  // 白猫は1枚
    expect(counts.get(3)).toBe(1);  // 黒猫は1枚
  });

  it('空の配列を渡すと空のMapを返す', () => {
    const counts = countByColor([]);
    expect(counts.size).toBe(0);
  });

  it('同じ色のカードだけの場合', () => {
    const cards: Card[] = [
      createTestCard(0, 5, 1),
      createTestCard(1, 5, 1),
      createTestCard(2, 5, 1),
      createTestCard(3, 5, 1),
      createTestCard(4, 5, 1),
    ];

    const counts = countByColor(cards);
    expect(counts.get(5)).toBe(5);
    expect(counts.size).toBe(1);
  });
});

describe('countByFur', () => {
  it('毛の長さごとのカード枚数をカウントする', () => {
    const cards: Card[] = [
      createTestCard(0, 0, 0),  // 長毛
      createTestCard(1, 1, 0),  // 長毛
      createTestCard(2, 2, 1),  // 短毛
      createTestCard(3, 3, 1),  // 短毛
      createTestCard(4, 4, 1),  // 短毛
    ];

    const counts = countByFur(cards);

    expect(counts[0]).toBe(2);  // 長毛は2枚
    expect(counts[1]).toBe(3);  // 短毛は3枚
  });

  it('空の配列を渡すと両方0を返す', () => {
    const counts = countByFur([]);
    expect(counts[0]).toBe(0);
    expect(counts[1]).toBe(0);
  });

  it('すべて長毛の場合', () => {
    const cards: Card[] = [
      createTestCard(0, 0, 0),
      createTestCard(1, 1, 0),
      createTestCard(2, 2, 0),
      createTestCard(3, 3, 0),
      createTestCard(4, 4, 0),
    ];

    const counts = countByFur(cards);
    expect(counts[0]).toBe(5);
    expect(counts[1]).toBe(0);
  });
});

describe('analyzeHand', () => {
  it('手札を分析してcolorCounts、furCounts、sortedColorCountsを返す', () => {
    const cards: Card[] = [
      createTestCard(0, 0, 1),  // 茶トラ、短毛
      createTestCard(1, 0, 1),  // 茶トラ、短毛
      createTestCard(2, 1, 0),  // 三毛、長毛
      createTestCard(3, 2, 0),  // 白猫、長毛
      createTestCard(4, 3, 1),  // 黒猫、短毛
    ];

    const analysis = analyzeHand(cards);

    // colorCounts
    expect(analysis.colorCounts.get(0)).toBe(2);
    expect(analysis.colorCounts.get(1)).toBe(1);

    // furCounts
    expect(analysis.furCounts.get(0)).toBe(2);
    expect(analysis.furCounts.get(1)).toBe(3);

    // sortedColorCounts (枚数の多い順)
    expect(analysis.sortedColorCounts[0][0]).toBe(0);  // 茶トラが最初
    expect(analysis.sortedColorCounts[0][1]).toBe(2);
  });

  it('同じ枚数の場合はレアリティの高い方が先に来る', () => {
    // レアリティ: 茶トラ(0)=5, 白猫(2)=7
    // 同じ枚数（2枚ずつ）にして、レアリティの高い白猫が先に来ることを確認
    const cards: Card[] = [
      createTestCard(0, 0, 1),  // 茶トラ (レアリティ5)
      createTestCard(1, 0, 1),  // 茶トラ (レアリティ5)
      createTestCard(2, 2, 1),  // 白猫 (レアリティ7)
      createTestCard(3, 2, 1),  // 白猫 (レアリティ7)
      createTestCard(4, 5, 1),  // キジ白 (レアリティ2)
    ];

    const analysis = analyzeHand(cards);

    // 茶トラと白猫は両方2枚
    expect(analysis.colorCounts.get(0)).toBe(2);
    expect(analysis.colorCounts.get(2)).toBe(2);

    // sortedColorCountsでは、枚数が同じ場合はレアリティの高い方が先に来る
    // 白猫(レアリティ7)が茶トラ(レアリティ5)より先にある
    const indexOfWhite = analysis.sortedColorCounts.findIndex(([c]) => c === 2);
    const indexOfChaTora = analysis.sortedColorCounts.findIndex(([c]) => c === 0);
    expect(indexOfWhite).toBeLessThan(indexOfChaTora);
  });
});

describe('findDominantColor', () => {
  it('指定枚数以上ある最もレアリティの高い色を返す', () => {
    const colorCounts = new Map<ColorCode, number>();
    colorCounts.set(0, 3);  // 茶トラ3枚 (レアリティ5)
    colorCounts.set(2, 2);  // 白猫2枚 (レアリティ7)

    const result = findDominantColor(colorCounts, 2);
    // 2枚以上で最もレアリティの高いのは白猫(7)
    expect(result).toBe(2);
  });

  it('条件を満たす色がない場合はnullを返す', () => {
    const colorCounts = new Map<ColorCode, number>();
    colorCounts.set(0, 1);
    colorCounts.set(1, 1);

    const result = findDominantColor(colorCounts, 2);
    expect(result).toBeNull();
  });

  it('空のMapを渡すとnullを返す', () => {
    const colorCounts = new Map<ColorCode, number>();
    const result = findDominantColor(colorCounts, 1);
    expect(result).toBeNull();
  });

  it('5枚以上を指定した場合', () => {
    const colorCounts = new Map<ColorCode, number>();
    colorCounts.set(0, 5);  // 茶トラ5枚

    const result = findDominantColor(colorCounts, 5);
    expect(result).toBe(0);
  });
});

describe('findMaxCountColor', () => {
  it('最も枚数の多い色を返す', () => {
    const colorCounts = new Map<ColorCode, number>();
    colorCounts.set(0, 2);  // 茶トラ2枚
    colorCounts.set(1, 3);  // 三毛3枚
    colorCounts.set(2, 1);  // 白猫1枚

    const result = findMaxCountColor(colorCounts);
    expect(result).toBe(1);  // 三毛が最多
  });

  it('同数の場合はレアリティの高い方を返す', () => {
    const colorCounts = new Map<ColorCode, number>();
    colorCounts.set(0, 2);  // 茶トラ2枚 (レアリティ5)
    colorCounts.set(2, 2);  // 白猫2枚 (レアリティ7)

    const result = findMaxCountColor(colorCounts);
    expect(result).toBe(2);  // 白猫のレアリティが高い
  });

  it('空のMapを渡すとnullを返す', () => {
    const colorCounts = new Map<ColorCode, number>();
    const result = findMaxCountColor(colorCounts);
    expect(result).toBeNull();
  });

  it('1色だけの場合その色を返す', () => {
    const colorCounts = new Map<ColorCode, number>();
    colorCounts.set(5, 5);

    const result = findMaxCountColor(colorCounts);
    expect(result).toBe(5);
  });
});
