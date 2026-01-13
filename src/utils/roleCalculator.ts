// utils/roleCalculator.ts

import type { Card, ColorCode, FurCode } from '../types/card';
import { COLOR_NAMES } from '../types/card';
import type { Role } from '../types/role';
import {
  FLUSH_ROLES,
  FOUR_COLOR_ROLES,
  THREE_COLOR_ROLES,
  ONE_PAIR_ROLES,
  FUR_ROLES,
  NO_PAIR,
  COLOR_RARITY,
  calculateTwoPairPoints,
  calculateFullHousePoints,
} from '../data/roleDefinitions';

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
 * @param cards - 分析する手札（5枚）
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
 * 手札から役を判定する
 * 成立可能なすべての役を列挙し、最もポイントが高い役を返す
 *
 * 判定ロジック：
 * 1. すべての成立可能な役を候補として列挙する
 * 2. 候補をポイントの高い順にソートする
 * 3. 最もポイントが高い役を返す
 *
 * 例：サバトラ×茶トラのツーペア（69pt）と茶トラワンペア（5pt）が同時に成立する状況では、
 * 両方が候補に入るが、ツーペアの方が高ポイントなのでツーペアが返される
 */
export function calculateRole(cards: Card[]): Role {
  if (cards.length !== 5) {
    throw new Error('手札は5枚である必要があります');
  }

  const analysis = analyzeHand(cards);
  const candidates: Role[] = [];
  const counts = analysis.sortedColorCounts.map(([_, count]) => count);

  // === フラッシュ（5枚同色）===
  for (const [color, count] of analysis.colorCounts) {
    if (count === 5) {
      const roleData = FLUSH_ROLES[color];
      candidates.push({
        type: 'flush',
        name: roleData.name,
        points: roleData.points,
        matchingCardIds: cards.map((c) => c.id),
      });
    }
  }

  // === ファー（5枚同じ毛の長さ）===
  for (const [fur, count] of analysis.furCounts) {
    if (count === 5) {
      const roleData = FUR_ROLES[fur as FurCode];
      candidates.push({
        type: 'fur',
        name: roleData.name,
        points: roleData.points,
        matchingCardIds: cards.map((c) => c.id),
      });
    }
  }

  // === フォーカラー（4枚同色）===
  if (counts[0] >= 4) {
    const [matchColor] = analysis.sortedColorCounts[0];
    const roleData = FOUR_COLOR_ROLES[matchColor];
    candidates.push({
      type: 'fourColor',
      name: roleData.name,
      points: roleData.points,
      matchingCardIds: cards.filter((c) => c.color === matchColor).map((c) => c.id),
    });
  }

  // === フルハウス（3枚+2枚）===
  if (counts[0] === 3 && counts[1] === 2) {
    const threeColor = analysis.sortedColorCounts[0][0];
    const twoColor = analysis.sortedColorCounts[1][0];
    const points = calculateFullHousePoints(threeColor, twoColor);

    candidates.push({
      type: 'fullHouse',
      name: `${COLOR_NAMES[threeColor]}×${COLOR_NAMES[twoColor]}フルハウス`,
      points: points,
      matchingCardIds: cards.map((c) => c.id),
    });
  }

  // === スリーカラー（3枚同色、残り2枚が異なる色）===
  if (counts[0] === 3 && counts[1] === 1 && counts[2] === 1) {
    const [matchColor] = analysis.sortedColorCounts[0];
    const roleData = THREE_COLOR_ROLES[matchColor];
    candidates.push({
      type: 'threeColor',
      name: roleData.name,
      points: roleData.points,
      matchingCardIds: cards.filter((c) => c.color === matchColor).map((c) => c.id),
    });
  }

  // === ツーペア（2色のペア）===
  if (counts[0] === 2 && counts[1] === 2) {
    const color1 = analysis.sortedColorCounts[0][0];
    const color2 = analysis.sortedColorCounts[1][0];
    const points = calculateTwoPairPoints(color1, color2);

    candidates.push({
      type: 'twoPair',
      name: `${COLOR_NAMES[color1]}×${COLOR_NAMES[color2]}ツーペア`,
      points: points,
      matchingCardIds: cards
        .filter((c) => c.color === color1 || c.color === color2)
        .map((c) => c.id),
    });
  }

  // === ワンペア（2枚同色、残り3枚がすべて異なる色）===
  if (counts[0] === 2 && counts[1] === 1 && counts[2] === 1 && counts[3] === 1) {
    const [matchColor] = analysis.sortedColorCounts[0];
    const roleData = ONE_PAIR_ROLES[matchColor];
    candidates.push({
      type: 'onePair',
      name: roleData.name,
      points: roleData.points,
      matchingCardIds: cards.filter((c) => c.color === matchColor).map((c) => c.id),
    });
  }

  // === ノーペア（役なし）===
  candidates.push({
    type: 'noPair',
    name: NO_PAIR.name,
    points: NO_PAIR.points,
    matchingCardIds: [],
  });

  // すべての候補役をポイントの高い順にソートし、最高点の役を返す
  // これにより、複数の役が成立する場合でも、必ず最もポイントが高い役が選ばれる
  candidates.sort((a, b) => b.points - a.points);
  return candidates[0];
}

/**
 * 勝敗判定
 * ポイントで比較し、高い方が勝利
 * ノーペア同士（両者0pt）の場合のみ引き分け
 */
export function determineWinner(
  playerRole: Role,
  dealerRole: Role
): 'win' | 'lose' | 'draw' {
  // ノーペア同士は引き分け
  if (playerRole.type === 'noPair' && dealerRole.type === 'noPair') {
    return 'draw';
  }

  if (playerRole.points > dealerRole.points) {
    return 'win';
  } else if (playerRole.points < dealerRole.points) {
    return 'lose';
  }

  // 同ポイントは存在しないはずだが、念のためdraw
  return 'draw';
}

/**
 * 対戦結果に基づくスコア変動を計算
 *
 * - 勝利: 自分の役ポイントを獲得
 * - 敗北: 相手の役ポイントをマイナス
 * - 引き分け: ポイント増減なし
 *
 * @param result - 勝敗結果
 * @param playerRole - プレイヤーの役
 * @param dealerRole - ディーラーの役
 * @returns スコア変動値（正: 獲得、負: 減少、0: 変動なし）
 */
export function calculateScoreChange(
  result: 'win' | 'lose' | 'draw',
  playerRole: Role,
  dealerRole: Role
): number {
  switch (result) {
    case 'win':
      // 勝者は自分の役ポイントを獲得
      return playerRole.points;
    case 'lose':
      // 敗者は勝者（相手）の役ポイント分がマイナス
      return -dealerRole.points;
    case 'draw':
      // 引き分けは変動なし
      return 0;
  }
}
