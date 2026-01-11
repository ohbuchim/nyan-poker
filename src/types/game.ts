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

/** ゲーム状態 */
export interface GameState {
  mode: GameMode;
  phase: GamePhase;
  round: number;              // 現在のラウンド（1-5）
  totalScore: number;         // 累計スコア
  playerHand: Card[];         // プレイヤーの手札（5枚）
  dealerHand: Card[];         // ディーラーの手札（対戦モード、5枚）
  selectedCardIds: number[];  // 交換選択中のカードID
  exchanged: boolean;         // 交換済みフラグ
  history: RoundHistory[];    // ラウンド履歴
  currentRole?: Role;         // 現在の役（判定後）
  dealerRole?: Role;          // ディーラーの役（対戦モード、判定後）
}

/** 初期ゲーム状態 */
export const initialGameState: GameState = {
  mode: 'solo',
  phase: 'dealing',
  round: 1,
  totalScore: 0,
  playerHand: [],
  dealerHand: [],
  selectedCardIds: [],
  exchanged: false,
  history: [],
};
