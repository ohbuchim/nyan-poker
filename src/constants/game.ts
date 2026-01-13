// constants/game.ts
// ゲームに関する共通定数を管理するファイル

/**
 * ゲームの総ラウンド数
 * ひとりで遊ぶモード、対戦モードともに5ラウンド
 */
export const TOTAL_ROUNDS = 5;

/**
 * 手札の枚数
 * プレイヤー、ディーラーともに5枚
 */
export const HAND_SIZE = 5;

/**
 * 交換可能なカードの最大枚数
 * 1回の交換で最大3枚まで選択可能
 */
export const MAX_SELECTABLE_CARDS = 3;

/**
 * カードの総数
 * 全229枚の猫カード
 */
export const TOTAL_CARDS = 229;

/**
 * 毛色の種類数
 */
export const COLOR_COUNT = 12;

/**
 * 毛の長さの種類数（長毛、短毛）
 */
export const FUR_COUNT = 2;

/**
 * アイコン定数
 */
export const ICONS = {
  /** ディーラーのアイコン（シルクハット絵文字） */
  DEALER: '\uD83C\uDFA9',
  /** プレイヤーのアイコン（猫絵文字） */
  PLAYER: '\uD83D\uDC31',
} as const;
