// types/storage.ts

/** 保存データ構造 */
export interface StorageData {
  settings: SettingsData;
  stats: StatsData;
  version: number; // データバージョン（マイグレーション用）
}

/** 設定データ */
export interface SettingsData {
  soundEnabled: boolean;
  volume: number; // 0-100
}

/** 統計データ */
export interface StatsData {
  solo: SoloStats;
  battle: BattleStats;
  roleAchievements: RoleAchievements;
}

/** ひとりモード統計 */
export interface SoloStats {
  playCount: number;
  highScore: number;
  totalScore: number;
  // 平均スコアは totalScore / playCount で算出
}

/** 対戦モード統計 */
export interface BattleStats {
  playCount: number;
  wins: number;
  losses: number;
  // 勝率は wins / playCount * 100 で算出
}

/** 統計計算ヘルパー */
export function getAverageScore(stats: SoloStats): number {
  if (stats.playCount === 0) return 0;
  return Math.round((stats.totalScore / stats.playCount) * 10) / 10;
}

export function getWinRate(stats: BattleStats): number {
  if (stats.playCount === 0) return 0;
  return Math.round((stats.wins / stats.playCount) * 1000) / 10;
}

/** 役達成回数 */
export interface RoleAchievements {
  [roleName: string]: number;
}

/** デフォルト設定 */
export const DEFAULT_SETTINGS: SettingsData = {
  soundEnabled: true,
  volume: 80,
};

/** デフォルト統計 */
export const DEFAULT_STATS: StatsData = {
  solo: { playCount: 0, highScore: 0, totalScore: 0 },
  battle: { playCount: 0, wins: 0, losses: 0 },
  roleAchievements: {},
};

/** ストレージキー */
export const STORAGE_KEY = 'nyan-poker-data';
export const CURRENT_VERSION = 1;
