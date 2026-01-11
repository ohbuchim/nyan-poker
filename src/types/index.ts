// types/index.ts

// Card types
export type { ColorCode, FurCode, Card } from './card';
export { COLOR_NAMES, FUR_NAMES } from './card';

// Role types
export type { RoleType, Role } from './role';

// Game types
export type { GameMode, GamePhase, RoundHistory, GameState } from './game';
export { initialGameState } from './game';

// Storage types
export type {
  StorageData,
  SettingsData,
  StatsData,
  SoloStats,
  BattleStats,
  RoleAchievements,
} from './storage';
export {
  getAverageScore,
  getWinRate,
  DEFAULT_SETTINGS,
  DEFAULT_STATS,
  STORAGE_KEY,
  CURRENT_VERSION,
} from './storage';
