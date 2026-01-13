// data/roleDefinitions.ts

import type { ColorCode, FurCode } from '../types/card';

/** 毛色のレアリティスコア（ポイント計算用） */
export const COLOR_RARITY: Record<ColorCode, number> = {
  11: 12, // サビ（最レア）
  1: 11,  // 三毛
  10: 10, // トビ
  2: 9,   // 白猫
  3: 8,   // 黒猫
  8: 7,   // サバトラ
  7: 6,   // 白黒
  5: 5,   // キジ白
  9: 4,   // グレー
  0: 3,   // 茶トラ
  6: 2,   // キジトラ
  4: 1,   // 茶白（最コモン）
};

// === フラッシュ系（5枚同色）: 12種類 ===
export const FLUSH_ROLES: Record<ColorCode, { name: string; points: number }> = {
  11: { name: 'サビフラッシュ', points: 300 },
  1: { name: '三毛フラッシュ', points: 299 },
  10: { name: 'トビフラッシュ', points: 298 },
  2: { name: '白猫フラッシュ', points: 296 },
  3: { name: '黒猫フラッシュ', points: 295 },
  8: { name: 'サバトラフラッシュ', points: 288 },
  7: { name: '白黒フラッシュ', points: 282 },
  5: { name: 'キジ白フラッシュ', points: 258 },
  9: { name: 'グレーフラッシュ', points: 250 },
  0: { name: '茶トラフラッシュ', points: 226 },
  6: { name: 'キジトラフラッシュ', points: 225 },
  4: { name: '茶白フラッシュ', points: 198 },
};

// === フォーカラー系（同色4枚）: 12種類 ===
export const FOUR_COLOR_ROLES: Record<ColorCode, { name: string; points: number }> = {
  11: { name: 'サビフォーカラー', points: 277 },
  1: { name: '三毛フォーカラー', points: 213 },
  10: { name: 'トビフォーカラー', points: 197 },
  2: { name: '白猫フォーカラー', points: 180 },
  3: { name: '黒猫フォーカラー', points: 166 },
  8: { name: 'サバトラフォーカラー', points: 143 },
  7: { name: '白黒フォーカラー', points: 123 },
  5: { name: 'キジ白フォーカラー', points: 98 },
  9: { name: 'グレーフォーカラー', points: 92 },
  0: { name: '茶トラフォーカラー', points: 80 },
  6: { name: 'キジトラフォーカラー', points: 79 },
  4: { name: '茶白フォーカラー', points: 63 },
};

// === スリーカラー系（同色3枚、残り2枚が異なる色）: 12種類 ===
export const THREE_COLOR_ROLES: Record<ColorCode, { name: string; points: number }> = {
  11: { name: 'サビスリーカラー', points: 112 },
  1: { name: '三毛スリーカラー', points: 70 },
  10: { name: 'トビスリーカラー', points: 60 },
  2: { name: '白猫スリーカラー', points: 50 },
  3: { name: '黒猫スリーカラー', points: 42 },
  8: { name: 'サバトラスリーカラー', points: 35 },
  7: { name: '白黒スリーカラー', points: 29 },
  5: { name: 'キジ白スリーカラー', points: 22 },
  9: { name: 'グレースリーカラー', points: 19 },
  0: { name: '茶トラスリーカラー', points: 18 },
  6: { name: 'キジトラスリーカラー', points: 17 },
  4: { name: '茶白スリーカラー', points: 16 },
};

// === ワンペア系（同色2枚、残り3枚が異なる色）: 12種類 ===
export const ONE_PAIR_ROLES: Record<ColorCode, { name: string; points: number }> = {
  11: { name: 'サビワンペア', points: 21 },
  1: { name: '三毛ワンペア', points: 15 },
  10: { name: 'トビワンペア', points: 13 },
  2: { name: '白猫ワンペア', points: 12 },
  3: { name: '黒猫ワンペア', points: 11 },
  8: { name: 'サバトラワンペア', points: 10 },
  7: { name: '白黒ワンペア', points: 8 },
  5: { name: 'キジ白ワンペア', points: 7 },
  9: { name: 'グレーワンペア', points: 6 },
  0: { name: '茶トラワンペア', points: 5 },
  6: { name: 'キジトラワンペア', points: 4 },
  4: { name: '茶白ワンペア', points: 2 },
};

// === ファー系（毛の長さ5枚統一）: 2種類 ===
export const FUR_ROLES: Record<FurCode, { name: string; points: number }> = {
  0: { name: 'ロングファー', points: 100 },
  1: { name: 'ショートファー', points: 1 },
};

// === ツーペアのポイント計算 ===

/** ツーペアのポイント計算用の線形マッピング係数 */
const TWO_PAIR_COEFFICIENT = 6.55;
const TWO_PAIR_INTERCEPT = 3.35;

/**
 * ツーペアのポイントを計算
 * 2色のレアリティスコアの合計を23〜154にマッピング
 */
export function calculateTwoPairPoints(color1: ColorCode, color2: ColorCode): number {
  const score = COLOR_RARITY[color1] + COLOR_RARITY[color2];
  // スコア範囲: 3（最低: 茶白+キジトラ）〜23（最高: サビ+三毛）→ ポイント範囲: 23〜154
  // 線形マッピング: points = TWO_PAIR_COEFFICIENT * score + TWO_PAIR_INTERCEPT
  return Math.round(TWO_PAIR_COEFFICIENT * score + TWO_PAIR_INTERCEPT);
}

// === フルハウスのポイント計算 ===

/** フルハウスのポイント計算用の線形マッピング係数 */
const FULL_HOUSE_COEFFICIENT = 6.097;
const FULL_HOUSE_INTERCEPT = 80.613;

/**
 * フルハウスのポイントを計算
 * 3枚の色を重み付けして105〜294にマッピング
 */
export function calculateFullHousePoints(threeColor: ColorCode, twoColor: ColorCode): number {
  const score = COLOR_RARITY[threeColor] * 2 + COLOR_RARITY[twoColor];
  // スコア範囲: 4（最低: 茶白×キジトラ）〜35（最高: サビ×三毛）→ ポイント範囲: 105〜294
  // 線形マッピング: points = FULL_HOUSE_COEFFICIENT * score + FULL_HOUSE_INTERCEPT
  return Math.round(FULL_HOUSE_COEFFICIENT * score + FULL_HOUSE_INTERCEPT);
}

// === ノーペア ===
export const NO_PAIR = { name: 'ノーペア', points: 0 };
