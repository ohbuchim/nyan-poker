// context/index.ts

// GameContext
export { GameContext, GameProvider, useGame } from './GameContext';

// 型定義はtypes/game.tsから再エクスポート（後方互換性のため）
export { initialGameState } from '../types';
export type { GameState } from '../types';

// SettingsContext
export { SettingsContext, SettingsProvider, useSettings } from './SettingsContext';

// StatsContext
export { StatsContext, StatsProvider, useStats } from './StatsContext';
