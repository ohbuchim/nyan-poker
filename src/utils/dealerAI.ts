// utils/dealerAI.ts

import type { Card, ColorCode } from '../types/card';
import { COLOR_RARITY } from '../data/roleDefinitions';
import {
  countByColor,
  countByFur,
  findDominantColor,
  findMaxCountColor,
} from './cardAnalysis';

// 後方互換のため、カード分析関数を再エクスポート
export { countByColor, countByFur, findDominantColor };

/** ディーラーの交換戦略結果 */
export interface ExchangeStrategy {
  cardsToExchange: number[]; // 交換するカードのID
  reason: string; // デバッグ用
}

/**
 * 毛色のレアリティ（ポイント）を取得
 *
 * @param color - 毛色コード
 * @returns レアリティスコア（1-12）
 */
export function getColorRarity(color: ColorCode): number {
  return COLOR_RARITY[color];
}

/**
 * ディーラーの交換判断
 *
 * 以下の優先順位で交換を判断（上から順に評価し、最初に該当した戦略を採用）：
 * 1. フラッシュが狙える場合（同色4枚以上）→ 他の色を交換
 * 2. ロングファーが狙える場合（長毛4枚以上）→ 短毛を交換
 * 3. フォーカラー/スリーカラーがある場合 → 他の色を交換して狙う
 * 4. ペアがある場合 → ペア以外を交換
 * 5. 役なしの場合 → 最も枚数の多い色を残して他を交換
 */
export function decideDealerExchange(hand: Card[]): ExchangeStrategy {
  const colorCounts = countByColor(hand);
  const furCounts = countByFur(hand);

  // 1. フラッシュ狙い（同色4枚以上）
  const flushColor = findDominantColor(colorCounts, 4);
  if (flushColor !== null) {
    const count = colorCounts.get(flushColor) || 0;
    // 5枚同色（フラッシュ成立）の場合は交換しない
    if (count === 5) {
      return {
        cardsToExchange: [],
        reason: 'フラッシュ成立（交換不要）',
      };
    }
    const toExchange = hand
      .filter((c) => c.color !== flushColor)
      .map((c) => c.id);
    return {
      cardsToExchange: toExchange,
      reason: `フラッシュ狙い（${flushColor}を${count}枚保持）`,
    };
  }

  // 2. ロングファー狙い（長毛4枚以上）
  if (furCounts[0] >= 4) {
    // 5枚長毛（ロングファー成立）の場合は交換しない
    if (furCounts[0] === 5) {
      return {
        cardsToExchange: [],
        reason: 'ロングファー成立（交換不要）',
      };
    }
    const toExchange = hand.filter((c) => c.fur !== 0).map((c) => c.id);
    return {
      cardsToExchange: toExchange,
      reason: `ロングファー狙い（長毛${furCounts[0]}枚保持）`,
    };
  }

  // 3. フォーカラー/スリーカラーがある場合（同色3枚以上）
  const threeColorMatch = findDominantColor(colorCounts, 3);
  if (threeColorMatch !== null) {
    const toExchange = hand
      .filter((c) => c.color !== threeColorMatch)
      .map((c) => c.id);
    return {
      cardsToExchange: toExchange,
      reason: `フォーカラー狙い（${threeColorMatch}を3枚保持）`,
    };
  }

  // 4. ペアがある場合（同色2枚以上）
  const pairColor = findDominantColor(colorCounts, 2);
  if (pairColor !== null) {
    const toExchange = hand
      .filter((c) => c.color !== pairColor)
      .map((c) => c.id);
    return {
      cardsToExchange: toExchange,
      reason: `スリーカラー以上狙い（${pairColor}を2枚保持）`,
    };
  }

  // 5. 役なしの場合 - 最も枚数の多い色を残す
  const maxColor = findMaxCountColor(colorCounts);
  if (maxColor !== null) {
    const toExchange = hand.filter((c) => c.color !== maxColor).map((c) => c.id);
    return {
      cardsToExchange: toExchange,
      reason: `最多色（${maxColor}）を残して交換`,
    };
  }

  // フォールバック: 交換しない
  return {
    cardsToExchange: [],
    reason: '交換なし',
  };
}

/**
 * ディーラーの手札交換を実行
 *
 * @param hand - 現在の手札
 * @param newCards - 新しく引いたカード
 * @param cardsToExchange - 交換するカードのID
 * @returns 交換後の手札
 */
export function executeDealerExchange(
  hand: Card[],
  newCards: Card[],
  cardsToExchange: number[]
): Card[] {
  let newCardIndex = 0;
  return hand.map((card) => {
    if (cardsToExchange.includes(card.id) && newCardIndex < newCards.length) {
      return newCards[newCardIndex++];
    }
    return card;
  });
}
