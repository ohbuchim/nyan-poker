// utils/cardAnalysis.ts
// カード分析に関する共通関数

import type { Card, ColorCode, FurCode } from '../types/card';
import { COLOR_RARITY } from '../data/roleDefinitions';

/**
 * 毛色ごとのカード枚数をカウントする
 *
 * @param cards - 分析するカードの配列
 * @returns 毛色コードをキー、枚数を値とするMap
 */
export function countByColor(cards: Card[]): Map<ColorCode, number> {
  const counts = new Map<ColorCode, number>();
  cards.forEach((card) => {
    counts.set(card.color, (counts.get(card.color) || 0) + 1);
  });
  return counts;
}

/**
 * 毛の長さごとのカード枚数をカウントする
 *
 * @param cards - 分析するカードの配列
 * @returns 毛の長さコードをキー、枚数を値とするRecord
 */
export function countByFur(cards: Card[]): Record<FurCode, number> {
  return cards.reduce(
    (acc, card) => {
      acc[card.fur] = (acc[card.fur] || 0) + 1;
      return acc;
    },
    { 0: 0, 1: 0 } as Record<FurCode, number>
  );
}

/** 手札分析データ */
export interface HandAnalysis {
  colorCounts: Map<ColorCode, number>; // 毛色ごとの枚数
  furCounts: Map<FurCode, number>; // 毛の長さごとの枚数
  sortedColorCounts: [ColorCode, number][]; // 枚数順にソートされた色リスト
}

/**
 * 手札を分析する
 * 毛色と毛の長さごとのカード枚数をカウントし、分析結果を返す
 *
 * @param cards - 分析する手札
 * @returns 毛色ごとの枚数、毛の長さごとの枚数、枚数順にソートされた色リスト
 */
export function analyzeHand(cards: Card[]): HandAnalysis {
  const colorCounts = new Map<ColorCode, number>();
  const furCounts = new Map<FurCode, number>();

  cards.forEach((card) => {
    colorCounts.set(card.color, (colorCounts.get(card.color) || 0) + 1);
    furCounts.set(card.fur, (furCounts.get(card.fur) || 0) + 1);
  });

  // 枚数の多い順にソート（同数の場合はレアリティの高い方を優先）
  const sortedColorCounts = Array.from(colorCounts.entries()).sort(
    (a, b) => {
      if (b[1] !== a[1]) {
        return b[1] - a[1]; // 枚数の多い順
      }
      // 枚数が同じ場合はレアリティ（COLOR_RARITY）で決定
      // レアリティが高い方を優先（降順）
      return COLOR_RARITY[b[0]] - COLOR_RARITY[a[0]];
    }
  ) as [ColorCode, number][];

  return { colorCounts, furCounts, sortedColorCounts };
}

/**
 * 指定枚数以上ある最もレアリティの高い色を探す
 *
 * @param colorCounts - 毛色ごとのカード枚数Map
 * @param minCount - 最小枚数
 * @returns 条件を満たす最も高いレアリティの毛色コード、見つからない場合はnull
 */
export function findDominantColor(
  colorCounts: Map<ColorCode, number>,
  minCount: number
): ColorCode | null {
  let bestColor: ColorCode | null = null;
  let bestRarity = -1;

  for (const [color, count] of colorCounts) {
    if (count >= minCount) {
      const rarity = COLOR_RARITY[color];
      if (rarity > bestRarity) {
        bestRarity = rarity;
        bestColor = color;
      }
    }
  }

  return bestColor;
}

/**
 * 最も枚数の多い色を探す（同数ならレアリティの高い方を選択）
 *
 * @param colorCounts - 毛色ごとのカード枚数Map
 * @returns 最も枚数が多い毛色コード、見つからない場合はnull
 */
export function findMaxCountColor(colorCounts: Map<ColorCode, number>): ColorCode | null {
  let bestColor: ColorCode | null = null;
  let maxCount = 0;
  let bestRarity = -1;

  for (const [color, count] of colorCounts) {
    if (count > maxCount || (count === maxCount && COLOR_RARITY[color] > bestRarity)) {
      maxCount = count;
      bestColor = color;
      bestRarity = COLOR_RARITY[color];
    }
  }

  return bestColor;
}
