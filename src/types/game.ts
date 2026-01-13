// types/game.ts

import type { Card } from './card';
import type { Role } from './role';

/** ゲームモード */
export type GameMode = 'solo' | 'battle';

/** ゲームフェーズ */
export type GamePhase =
  | 'dealing'       // カード配布中
  | 'selecting'     // カード選択中（交換前）
  | 'exchanging'    // 交換アニメーション中
  | 'revealing'     // 役判定表示中
  | 'result'        // ラウンド結果表示中
  | 'finished';     // ゲーム終了

/** ラウンド履歴 */
export interface RoundHistory {
  round: number;
  playerRole: Role;
  playerPoints: number;
  dealerRole?: Role;      // 対戦モードのみ
  dealerPoints?: number;  // 対戦モードのみ
  result?: 'win' | 'lose' | 'draw'; // 対戦モードのみ
}

/**
 * ゲーム状態（Context用）
 * GameContextで管理されるゲームの状態
 */
export interface GameState {
  mode: GameMode;
  phase: GamePhase;
  round: number;                // 現在のラウンド（1-5）
  playerHand: Card[];           // プレイヤーの手札（5枚）
  dealerHand: Card[];           // ディーラーの手札（対戦モード、5枚）
  selectedCardIds: number[];    // 交換選択中のカードID
  playerRole: Role | null;      // プレイヤーの役（判定後）
  dealerRole: Role | null;      // ディーラーの役（対戦モード、判定後）
  playerScore: number;          // プレイヤーの累計スコア
  dealerScore: number;          // ディーラーの累計スコア（対戦モード）
  roundHistory: RoundHistory[]; // ラウンド履歴
  excludedCardIds: number[];    // 除外されたカードID（同一ラウンド内で重複を防ぐ）
}

/** 初期ゲーム状態 */
export const initialGameState: GameState = {
  mode: 'solo',
  phase: 'dealing',
  round: 1,
  playerHand: [],
  dealerHand: [],
  selectedCardIds: [],
  playerRole: null,
  dealerRole: null,
  playerScore: 0,
  dealerScore: 0,
  roundHistory: [],
  excludedCardIds: [],
};
