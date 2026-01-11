# にゃんポーカー 詳細設計書

## 1. システムアーキテクチャ

### 1.1 全体構成

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser                               │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐ │
│  │                    React Application                     │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │ │
│  │  │   Pages/    │  │ Components/ │  │    Context/     │  │ │
│  │  │   Screens   │  │ (再利用可能) │  │  (状態管理)     │  │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │ │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │ │
│  │  │   Hooks/    │  │   Utils/    │  │     Types/      │  │ │
│  │  │ (カスタム)   │  │  (ロジック)  │  │   (型定義)      │  │ │
│  │  └─────────────┘  └─────────────┘  └─────────────────┘  │ │
│  └─────────────────────────────────────────────────────────┘ │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐   │
│  │   Assets    │  │ LocalStorage│  │     Howler.js       │   │
│  │ (images/    │  │  (データ永続化)│  │    (サウンド)       │   │
│  │  sounds/)   │  └─────────────┘  └─────────────────────┘   │
│  └─────────────┘                                             │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 ディレクトリ構造

```
nyan-poker/
├── docs/
│   ├── requirements.md    # 要求仕様書
│   └── spec.md            # 詳細設計書（本書）
├── images/
│   ├── image_000.jpg      # カード画像（229枚）
│   │   ...
│   ├── image_228.jpg
│   └── map.yml            # カード属性定義
├── sounds/
│   ├── deal.mp3           # カード配布音
│   ├── flip.mp3           # カード交換音
│   ├── win.mp3            # 勝利音
│   └── lose.mp3           # 敗北音
├── mock/
│   └── index.html         # UIモック
├── src/
│   ├── components/
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Modal.tsx
│   │   │   └── Toggle.tsx
│   │   ├── card/
│   │   │   ├── Card.tsx
│   │   │   ├── CardInfo.tsx
│   │   │   └── Hand.tsx
│   │   ├── game/
│   │   │   ├── GameHeader.tsx
│   │   │   ├── RoleDisplay.tsx
│   │   │   ├── ScoreDisplay.tsx
│   │   │   └── ActionButtons.tsx
│   │   └── modals/
│   │       ├── RulesModal.tsx
│   │       ├── SettingsModal.tsx
│   │       └── StatsModal.tsx
│   ├── context/
│   │   ├── GameContext.tsx
│   │   ├── SettingsContext.tsx
│   │   └── StatsContext.tsx
│   ├── hooks/
│   │   ├── useGame.ts
│   │   ├── useSound.ts
│   │   ├── useLocalStorage.ts
│   │   └── useAnimation.ts
│   ├── pages/
│   │   ├── TitleScreen.tsx
│   │   ├── GameScreen.tsx
│   │   ├── BattleScreen.tsx
│   │   └── ResultScreen.tsx
│   ├── utils/
│   │   ├── cardData.ts
│   │   ├── deck.ts
│   │   ├── roleCalculator.ts
│   │   └── dealerAI.ts
│   ├── types/
│   │   ├── card.ts
│   │   ├── game.ts
│   │   └── role.ts
│   ├── styles/
│   │   ├── variables.css
│   │   └── animations.css
│   ├── App.tsx
│   ├── main.tsx
│   └── vite-env.d.ts
├── public/
│   ├── favicon.ico
│   └── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── CLAUDE.md
```

## 2. データモデル設計

### 2.1 型定義

```typescript
// types/card.ts

/** 毛色コード（0-11） */
export type ColorCode = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11;

/** 毛の長さコード */
export type FurCode = 0 | 1; // 0: 長毛, 1: 短毛

/** 毛色名称マッピング */
export const COLOR_NAMES: Record<ColorCode, string> = {
  0: '茶トラ',
  1: '三毛',
  2: '白猫',
  3: '黒猫',
  4: '茶白',
  5: 'キジ白',
  6: 'キジトラ',
  7: '白黒',
  8: 'サバトラ',
  9: 'グレー',
  10: 'トビ',
  11: 'サビ',
};

/** 毛の長さ名称マッピング */
export const FUR_NAMES: Record<FurCode, string> = {
  0: '長毛',
  1: '短毛',
};

/** カード情報 */
export interface Card {
  id: number;           // 0-228
  image: string;        // 画像パス（例: '/images/image_000.jpg'）
  color: ColorCode;     // 毛色
  fur: FurCode;         // 毛の長さ
}

/** デッキ状態 */
export interface Deck {
  cards: Card[];        // 残りカード
  discarded: Card[];    // 捨てられたカード
}
```

```typescript
// types/role.ts

/** 役の種別 */
export type RoleType =
  | 'flush'      // フラッシュ系（5枚同色）
  | 'fullHouse'  // フルハウス（同色3枚+別色2枚）
  | 'fur'        // ファー系（5枚同じ毛の長さ）
  | 'fourColor'  // フォーカラー（同色4枚）
  | 'threeColor' // スリーカラー（同色3枚、残り2枚が異なる色）
  | 'twoPair'    // ツーペア（2組のペア）
  | 'onePair'    // ワンペア（同色2枚、残り3枚が異なる色）
  | 'noPair';    // ノーペア

/** 役情報 */
export interface Role {
  type: RoleType;
  name: string;           // 表示名（例: 'サビフラッシュ'）
  points: number;         // ポイント（0-200）
  matchingCardIds: number[]; // 役を構成するカードID
}

/** 役定義インターフェース */
export interface RoleDefinition {
  type: RoleType;
  name: string;
  points: number;
  // 判定条件（いずれかを使用）
  color?: ColorCode;           // 単一毛色（フラッシュ、フォーカラー、スリーカラー、ワンペア）
  fur?: FurCode;               // 毛の長さ（ファー系）
  colorPair?: [ColorCode, ColorCode]; // 2色ペア（ツーペア）
}
```

### 2.2 役のポイントシステム（0-300）

すべての役は一意のポイントを持ち、ポイントの高い順に判定される。同じポイントを持つ役は存在しない。

#### 役の種類と判定優先順位

ポイントが高い役から順に判定を行い、最初にマッチした役を採用する。

| 役タイプ | 条件 | ポイント範囲 |
|---------|------|-------------|
| フラッシュ | 同色5枚 | 198〜300 |
| フルハウス | 同色3枚+別色2枚 | 105〜294 |
| フォーカラー | 同色4枚 | 63〜277 |
| ロングファー | 長毛5枚 | 100 |
| スリーカラー | 同色3枚（残り2枚が異なる色） | 16〜112 |
| ツーペア | 2色のペア（各2枚） | 23〜154 |
| ワンペア | 同色2枚（残り3枚が異なる色） | 2〜21 |
| ショートファー | 短毛5枚 | 1 |
| ノーペア | 役なし | 0 |

```typescript
// data/roleDefinitions.ts

import type { RoleDefinition, ColorCode } from '../types';

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
/**
 * ツーペアのポイントを計算
 * 2色のレアリティスコアの合計を23〜154にマッピング
 */
export function calculateTwoPairPoints(color1: ColorCode, color2: ColorCode): number {
  const score = COLOR_RARITY[color1] + COLOR_RARITY[color2];
  // スコア範囲: 2（最低）〜24（最高）→ ポイント範囲: 23〜154
  return Math.round(23 + (score - 2) * (154 - 23) / 22);
}

// === フルハウスのポイント計算 ===
/**
 * フルハウスのポイントを計算
 * 3枚の色を重み付けして105〜294にマッピング
 */
export function calculateFullHousePoints(threeColor: ColorCode, twoColor: ColorCode): number {
  const score = COLOR_RARITY[threeColor] * 2 + COLOR_RARITY[twoColor];
  // スコア範囲: 3〜36 → ポイント範囲: 105〜294
  return Math.round(105 + (score - 3) * (294 - 105) / 33);
}

// === ノーペア ===
export const NO_PAIR = { name: 'ノーペア', points: 0 };

/** 役タイプ別のヘルパー定数 */
export const ROLE_TYPE_PRIORITY: RoleType[] = [
  'flush',
  'fullHouse',
  'fourColor',
  'fur',
  'threeColor',
  'twoPair',
  'onePair',
  'noPair',
];
```

```typescript
// types/game.ts

import type { Card, Role } from './index';

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
```

### 2.2 ローカルストレージデータ

```typescript
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
```

## 3. コンポーネント設計

### 3.1 コンポーネント階層図

```
App
├── TitleScreen
│   ├── TitleLogo
│   ├── TitleCats (装飾用カード表示)
│   ├── TitleMenu
│   │   ├── Button (ひとりで遊ぶ)
│   │   └── Button (対戦モード)
│   └── TitleFooter
│       ├── IconButton (遊び方)
│       ├── IconButton (戦績)
│       └── IconButton (設定)
│
├── GameScreen (ひとりモード)
│   ├── GameHeader
│   │   ├── RoundInfo
│   │   │   ├── RoundBadge
│   │   │   └── ProgressBar (ラウンド進行)
│   │   ├── ScoreDisplay
│   │   └── IconButton (役一覧)
│   ├── HandArea
│   │   ├── HandLabel
│   │   └── Hand
│   │       └── CardWrapper (×5)
│   │           ├── Card
│   │           └── CardInfo
│   ├── RoleDisplay
│   └── ActionButtons
│       ├── SelectedCount
│       ├── Button (交換する)
│       ├── Button (交換しない)
│       ├── TextButton (選択を解除)
│       └── Button (次のラウンドへ)
│
├── BattleScreen (対戦モード)
│   ├── GameHeader
│   │   ├── RoundInfo
│   │   │   ├── RoundBadge
│   │   │   └── ProgressBar
│   │   ├── ScoreDisplay
│   │   └── IconButton (役一覧)
│   ├── BattleRolesHeader
│   │   ├── BattleRoleBox (ディーラー)
│   │   ├── VSText
│   │   └── BattleRoleBox (プレイヤー)
│   ├── BattleArea
│   │   ├── DealerArea
│   │   │   ├── DealerHeader
│   │   │   └── Hand (ディーラー)
│   │   ├── VSRow
│   │   │   ├── VSText
│   │   │   └── ActionButtons (インライン)
│   │   │       ├── SelectedCount
│   │   │       ├── Button (交換する)
│   │   │       ├── Button (交換しない)
│   │   │       └── TextButton (解除)
│   │   └── PlayerArea
│   │       └── Hand (プレイヤー)
│   └── BattleResultOverlay
│       ├── ResultText
│       ├── ResultRole
│       ├── ResultPoints
│       └── Button (OK)
│
├── ResultScreen
│   ├── FinalScoreDisplay
│   ├── RoundHistory
│   │   └── RoundHistoryItem (×5)
│   └── ResultActions
│       ├── Button (もう一度遊ぶ)
│       └── Button (タイトルに戻る)
│
└── Modals
    ├── RulesModal
    │   ├── RulesSection (ゲームの目的)
    │   ├── RulesSection (遊び方)
    │   └── RulesAccordion (役一覧)
    ├── SettingsModal
    │   ├── SettingItem (効果音)
    │   ├── SettingItem (音量)
    │   └── SettingItem (戦績リセット)
    └── StatsModal
        ├── StatsSection (ひとりで遊ぶ)
        │   ├── プレイ回数
        │   ├── 最高スコア
        │   └── 平均スコア
        ├── StatsSection (対戦モード)
        │   ├── プレイ回数
        │   ├── 勝利数
        │   └── 勝率
        └── StatsSection (役の達成回数)
```

### 3.2 主要コンポーネント仕様

#### Card コンポーネント

```typescript
// components/card/Card.tsx

interface CardProps {
  card: Card;
  isBack?: boolean;           // 裏面表示
  isSelected?: boolean;       // 選択状態
  isMatching?: boolean;       // 役構成カード
  isNotMatching?: boolean;    // 役非構成カード（暗転）
  animationType?: 'deal' | 'enter' | 'exchange' | 'none';
  animationDelay?: number;    // アニメーション遅延（ms）
  onClick?: () => void;
  disabled?: boolean;
}

// CSS クラス構成
// .card - 基本スタイル
// .card.dealing - 配布アニメーション
// .card.entering - 交換後の入場アニメーション
// .card.exchanging - 交換アウトアニメーション
// .card.selected - 選択状態
// .card.role-match - 役構成カード（光る）
// .card.role-no-match - 役非構成カード（暗転）
// .card-back - 裏面
```

#### Hand コンポーネント

```typescript
// components/card/Hand.tsx

interface HandProps {
  cards: Card[];
  showCards?: boolean;          // true: 表面, false: 裏面
  selectedCardIds?: number[];   // 選択中カードID
  matchingCardIds?: number[];   // 役構成カードID
  onCardClick?: (cardId: number) => void;
  disabled?: boolean;           // クリック無効
  isDealer?: boolean;           // ディーラー用（小さめ表示）
  animationType?: 'deal' | 'none';
  newCardIds?: number[];        // 新しく引いたカードID（交換アニメーション用）
}
```

#### RoleDisplay コンポーネント

```typescript
// components/game/RoleDisplay.tsx

interface RoleDisplayProps {
  role: Role | null;
  visible: boolean;
  variant?: 'standalone' | 'inline'; // 単体表示 or 対戦モードヘッダー内
}

// アニメーション: scale(0.8) → scale(1) + opacity
```

## 4. 状態管理設計

### 4.1 Context 構成

```typescript
// context/GameContext.tsx

interface GameContextValue {
  // 状態
  state: GameState;

  // アクション
  startGame: (mode: GameMode) => void;
  selectCard: (cardId: number) => void;
  exchangeCards: () => Promise<void>;
  skipExchange: () => void;
  nextRound: () => void;
  finishGame: () => void;
  resetGame: () => void;
}
```

```typescript
// context/SettingsContext.tsx

interface SettingsContextValue {
  settings: SettingsData;
  updateSound: (enabled: boolean) => void;
  updateVolume: (volume: number) => void;
}
```

```typescript
// context/StatsContext.tsx

interface StatsContextValue {
  stats: StatsData;
  updateSoloStats: (score: number) => void;
  updateBattleStats: (result: 'win' | 'lose' | 'draw') => void;
  recordRoleAchievement: (roleName: string) => void;
  resetStats: () => void;
}
```

### 4.2 状態遷移図

```
[タイトル画面]
    │
    ├── ひとりで遊ぶ ──→ [ゲーム画面]
    │                      │
    │                      ▼
    │                 ┌──────────────┐
    │                 │ phase:dealing │
    │                 │ (カード配布)   │
    │                 └──────┬───────┘
    │                        │ アニメーション完了
    │                        ▼
    │                 ┌──────────────┐
    │                 │phase:selecting│
    │                 │ (カード選択)   │◄────────┐
    │                 └──────┬───────┘         │
    │                        │                  │
    │            ┌───────────┴───────────┐     │
    │            │                       │     │
    │        交換する                交換しない │
    │            │                       │     │
    │            ▼                       │     │
    │     ┌──────────────┐              │     │
    │     │phase:exchanging│             │     │
    │     │ (交換アニメ)  │              │     │
    │     └──────┬───────┘              │     │
    │            │                       │     │
    │            └───────────┬───────────┘     │
    │                        ▼                  │
    │                 ┌──────────────┐         │
    │                 │phase:revealing│         │
    │                 │  (役判定表示)  │         │
    │                 └──────┬───────┘         │
    │                        │                  │
    │            ┌───────────┴───────────┐     │
    │            │                       │     │
    │        round < 5              round == 5 │
    │            │                       │     │
    │            ▼                       │     │
    │     次のラウンドへ ────────────────┘     │
    │            │                              │
    │            └──────────────────────────────┘
    │                        │
    │                        ▼
    │                 ┌──────────────┐
    │                 │phase:finished │
    │                 └──────┬───────┘
    │                        │
    │                        ▼
    │                 [結果画面]
    │                      │
    ├── 対戦モード ──→ [対戦画面]（同様のフロー）
    │
    └── タイトルに戻る ◄──────────────────┘
```

## 5. ロジック設計

### 5.1 デッキ操作

```typescript
// utils/deck.ts

import type { Card } from '../types';
import { CARD_DATA } from './cardData';

/** デッキをシャッフル（Fisher-Yates） */
export function shuffleDeck(cards: Card[]): Card[] {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/** 新しいデッキを作成 */
export function createDeck(): Card[] {
  return CARD_DATA.map((data, index) => ({
    id: index,
    image: `/images/image_${String(index).padStart(3, '0')}.jpg`,
    color: data.color,
    fur: data.fur,
  }));
}

/** カードを引く（除外リスト指定可） */
export function drawCards(
  count: number,
  excludeIds: number[] = []
): Card[] {
  const deck = createDeck();
  const available = deck.filter(card => !excludeIds.includes(card.id));
  const shuffled = shuffleDeck(available);
  return shuffled.slice(0, count);
}
```

### 5.1.1 カードデータの生成

`images/map.yml` からカードデータを生成する。ビルド時に YAML を読み込んで TypeScript の配列に変換する。

```yaml
# images/map.yml のフォーマット
color:
  0: 茶トラ
  1: 三毛
  # ...
fur:
  0: 長毛
  1: 短毛
images:
  image_000.jpg: [0, 1]  # [毛色コード, 毛の長さコード]
  image_001.jpg: [4, 1]
  # ...
```

```typescript
// scripts/generateCardData.ts
// ビルド時に実行して data/cardData.ts を生成するスクリプト

import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';

interface MapYaml {
  color: Record<number, string>;
  fur: Record<number, string>;
  images: Record<string, [number, number]>;
}

function generateCardData() {
  const mapPath = path.join(__dirname, '../../images/map.yml');
  const content = fs.readFileSync(mapPath, 'utf-8');
  const data = yaml.load(content) as MapYaml;

  // 画像ファイル名をソートして配列に変換
  const cardEntries = Object.entries(data.images)
    .sort(([a], [b]) => a.localeCompare(b));

  const cardData = cardEntries.map(([filename, [color, fur]]) => ({
    color,
    fur,
  }));

  // TypeScript ファイルとして出力
  const output = `// 自動生成ファイル - 直接編集しないでください
// 生成元: images/map.yml
// 生成コマンド: npm run generate:card-data

import type { ColorCode, FurCode } from '../types';

/** カードデータ（229枚） */
export const CARD_DATA: Array<{ color: ColorCode; fur: FurCode }> = ${JSON.stringify(cardData, null, 2)};
`;

  const outputPath = path.join(__dirname, '../data/cardData.ts');
  fs.writeFileSync(outputPath, output);
  console.log(`Generated: ${outputPath}`);
}

generateCardData();
```

```typescript
// data/cardData.ts（生成されるファイル）

import type { ColorCode, FurCode } from '../types';

/** カードデータ（229枚） */
export const CARD_DATA: Array<{ color: ColorCode; fur: FurCode }> = [
  { color: 0, fur: 1 },  // image_000.jpg: 茶トラ, 短毛
  { color: 4, fur: 1 },  // image_001.jpg: 茶白, 短毛
  // ... 227 more entries
];
```

### 5.2 役判定ロジック

役判定は**ポイントの高い順**に行う。成立可能なすべての役を列挙し、最もポイントが高い役を採用する。

```typescript
// utils/roleCalculator.ts

import type { Card, Role, ColorCode, FurCode } from '../types';
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
interface HandAnalysis {
  colorCounts: Map<ColorCode, number>;  // 毛色ごとの枚数
  furCounts: Map<FurCode, number>;      // 毛の長さごとの枚数
  sortedColorCounts: [ColorCode, number][]; // 枚数順にソートされた色リスト
}

/** 手札を分析する */
function analyzeHand(cards: Card[]): HandAnalysis {
  const colorCounts = new Map<ColorCode, number>();
  const furCounts = new Map<FurCode, number>();

  cards.forEach(card => {
    colorCounts.set(card.color, (colorCounts.get(card.color) || 0) + 1);
    furCounts.set(card.fur, (furCounts.get(card.fur) || 0) + 1);
  });

  // 枚数の多い順にソート
  const sortedColorCounts = Array.from(colorCounts.entries())
    .sort((a, b) => b[1] - a[1]) as [ColorCode, number][];

  return { colorCounts, furCounts, sortedColorCounts };
}

/**
 * 手札から役を判定する
 * 成立可能なすべての役を列挙し、最もポイントが高い役を返す
 */
export function calculateRole(cards: Card[]): Role {
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
        matchingCardIds: cards.map(c => c.id),
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
        matchingCardIds: cards.map(c => c.id),
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
      matchingCardIds: cards.filter(c => c.color === matchColor).map(c => c.id),
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
      matchingCardIds: cards.map(c => c.id),
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
      matchingCardIds: cards.filter(c => c.color === matchColor).map(c => c.id),
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
      matchingCardIds: cards.filter(c => c.color === color1 || c.color === color2).map(c => c.id),
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
      matchingCardIds: cards.filter(c => c.color === matchColor).map(c => c.id),
    });
  }

  // === ノーペア（役なし）===
  candidates.push({
    type: 'noPair',
    name: NO_PAIR.name,
    points: NO_PAIR.points,
    matchingCardIds: [],
  });

  // 最もポイントが高い役を返す
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
```

### 5.3 ディーラーAIロジック

```typescript
// utils/dealerAI.ts

import type { Card } from '../types';

/** ディーラーの交換戦略結果 */
interface ExchangeStrategy {
  cardsToExchange: number[];  // 交換するカードのID
  reason: string;             // デバッグ用
}

/** ディーラーの交換判断 */
export function decideDealerExchange(hand: Card[]): ExchangeStrategy {
  const colorCounts = countByColor(hand);
  const furCounts = countByFur(hand);

  // 1. フラッシュが狙える場合（同色4枚以上）
  const dominantColor = findDominantColor(colorCounts, 4);
  if (dominantColor !== null) {
    const toExchange = hand
      .filter(c => c.color !== dominantColor)
      .map(c => c.id);
    return {
      cardsToExchange: toExchange,
      reason: `フラッシュ狙い（${dominantColor}を4枚保持）`,
    };
  }

  // 2. ロングファーが狙える場合（長毛4枚以上）
  if (furCounts[0] >= 4) {
    const toExchange = hand
      .filter(c => c.fur !== 0)
      .map(c => c.id);
    return {
      cardsToExchange: toExchange,
      reason: 'ロングファー狙い（長毛4枚保持）',
    };
  }

  // 3. フォーカラー/スリーカラーがある場合
  const threeColorMatch = findDominantColor(colorCounts, 3);
  if (threeColorMatch !== null) {
    const toExchange = hand
      .filter(c => c.color !== threeColorMatch)
      .map(c => c.id);
    return {
      cardsToExchange: toExchange,
      reason: `フォーカラー狙い（${threeColorMatch}を3枚保持）`,
    };
  }

  // 4. ペアがある場合
  const pairColor = findDominantColor(colorCounts, 2);
  if (pairColor !== null) {
    const toExchange = hand
      .filter(c => c.color !== pairColor)
      .map(c => c.id);
    return {
      cardsToExchange: toExchange,
      reason: `スリーカラー以上狙い（${pairColor}を2枚保持）`,
    };
  }

  // 5. 役なしの場合 - 最も枚数の多い色を残す
  const maxColorEntry = Array.from(colorCounts.entries())
    .sort((a, b) => b[1] - a[1])[0];

  if (maxColorEntry) {
    const toExchange = hand
      .filter(c => c.color !== maxColorEntry[0])
      .map(c => c.id);
    return {
      cardsToExchange: toExchange,
      reason: `最多色（${maxColorEntry[0]}）を残して交換`,
    };
  }

  // フォールバック: 交換しない
  return {
    cardsToExchange: [],
    reason: '交換なし',
  };
}

/** 指定枚数以上ある色を探す */
function findDominantColor(
  colorCounts: Map<number, number>,
  minCount: number
): number | null {
  for (const [color, count] of colorCounts) {
    if (count >= minCount) {
      return color;
    }
  }
  return null;
}

/** 毛色カウント */
function countByColor(cards: Card[]): Map<number, number> {
  const counts = new Map<number, number>();
  cards.forEach(card => {
    counts.set(card.color, (counts.get(card.color) || 0) + 1);
  });
  return counts;
}

/** 毛の長さカウント */
function countByFur(cards: Card[]): Record<number, number> {
  return cards.reduce(
    (acc, card) => {
      acc[card.fur] = (acc[card.fur] || 0) + 1;
      return acc;
    },
    { 0: 0, 1: 0 } as Record<number, number>
  );
}
```

## 6. アニメーション仕様

### 6.1 CSS アニメーション定義

```css
/* styles/animations.css */

/* カード配布アニメーション */
@keyframes dealCard {
  from {
    opacity: 0;
    transform: translateX(-100px) rotate(-20deg);
  }
  to {
    opacity: 1;
    transform: translateX(0) rotate(0);
  }
}

.card.dealing {
  animation: dealCard 0.4s ease-out forwards;
}

/* 配布タイミング（0.1秒間隔） */
.card-wrapper:nth-child(1) .card.dealing { animation-delay: 0.0s; }
.card-wrapper:nth-child(2) .card.dealing { animation-delay: 0.1s; }
.card-wrapper:nth-child(3) .card.dealing { animation-delay: 0.2s; }
.card-wrapper:nth-child(4) .card.dealing { animation-delay: 0.3s; }
.card-wrapper:nth-child(5) .card.dealing { animation-delay: 0.4s; }

/* カード交換アウト（上方向へフェードアウト） */
@keyframes cardExchangeOut {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(-50px); opacity: 0; }
}

.card.exchanging {
  animation: cardExchangeOut 0.3s ease-in forwards;
}

/* カード交換イン（上から入場） */
@keyframes cardEnterFromTop {
  0% { transform: translateY(-50px); opacity: 0; }
  100% { transform: translateY(0); opacity: 1; }
}

.card.entering {
  animation: cardEnterFromTop 0.4s ease-out forwards;
}

/* 役成立時のカードハイライト */
@keyframes cardGlow {
  0%, 100% { box-shadow: 0 0 20px rgba(212, 165, 116, 0.6); }
  50% { box-shadow: 0 0 35px rgba(212, 165, 116, 1); }
}

.card-wrapper.role-match .card {
  border-color: var(--color-primary);
  animation: cardGlow 1s ease-in-out infinite;
}

/* 役非構成カードの暗転 */
.card-wrapper.role-no-match .card {
  opacity: 0.5;
  filter: grayscale(40%);
}

/* 役名ポップイン */
@keyframes rolePopIn {
  0% { transform: scale(0); opacity: 0; }
  60% { transform: scale(1.2); }
  100% { transform: scale(1); opacity: 1; }
}

.role-name {
  animation: rolePopIn 0.5s ease-out;
}

/* 画面フェードイン */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.screen.active {
  animation: fadeIn 0.4s ease-out;
}

/* モーダルスライドイン */
@keyframes modalSlideIn {
  from { transform: translateY(20px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.modal {
  animation: modalSlideIn 0.3s ease-out;
}

/* 紙吹雪アニメーション */
@keyframes confettiFall {
  0% { transform: translateY(-100vh) rotate(0deg); opacity: 1; }
  100% { transform: translateY(100vh) rotate(720deg); opacity: 0; }
}

.confetti-piece {
  animation: confettiFall 3s ease-out forwards;
}
```

### 6.2 アニメーションタイミング

| アニメーション | 時間 | イージング | 遅延 |
|--------------|------|-----------|------|
| カード配布 | 0.4s | ease-out | 0.1s × index |
| カード交換アウト | 0.3s | ease-in | 0s |
| カード交換イン | 0.4s | ease-out | 0s |
| 役ハイライト | 1.0s | ease-in-out | ループ |
| 役名表示 | 0.5s | ease-out | 0s |
| 画面遷移 | 0.4s | ease-out | 0s |
| モーダル表示 | 0.3s | ease-out | 0s |
| 紙吹雪落下 | 3.0s | ease-out | random |

## 7. サウンド実装

### 7.1 サウンド管理フック

```typescript
// hooks/useSound.ts

import { Howl } from 'howler';
import { useSettings } from '../context/SettingsContext';

const sounds = {
  deal: new Howl({ src: ['/sounds/deal.mp3'] }),
  flip: new Howl({ src: ['/sounds/flip.mp3'] }),
  win: new Howl({ src: ['/sounds/win.mp3'] }),
  lose: new Howl({ src: ['/sounds/lose.mp3'] }),
};

export function useSound() {
  const { settings } = useSettings();

  const play = (soundName: keyof typeof sounds) => {
    if (!settings.soundEnabled) return;

    const sound = sounds[soundName];
    sound.volume(settings.volume / 100);
    sound.play();
  };

  return {
    playDeal: () => play('deal'),
    playFlip: () => play('flip'),
    playWin: () => play('win'),
    playLose: () => play('lose'),
  };
}
```

### 7.2 サウンド再生タイミング

| イベント | サウンド | タイミング |
|---------|---------|-----------|
| カード配布 | deal.mp3 | 配布アニメーション開始時 |
| カード交換 | flip.mp3 | 交換アニメーション開始時 |
| 勝利 | win.mp3 | 勝利判定表示時 |
| 敗北 | lose.mp3 | 敗北判定表示時 |

## 8. 画面仕様

### 8.1 タイトル画面

```
┌─────────────────────────────────────────┐
│                                         │
│            にゃんポーカー                │
│     猫カードで役を揃えるポーカーゲーム    │
│                                         │
│         [cat] [cat] [cat] [cat]         │
│         （装飾用カード、回転表示）        │
│                                         │
│         ┌─────────────────┐             │
│         │  ひとりで遊ぶ   │             │
│         └─────────────────┘             │
│         ┌─────────────────┐             │
│         │    対戦モード    │             │
│         └─────────────────┘             │
│                                         │
│           [?]   [📊]   [⚙]              │
│         遊び方  戦績   設定              │
│                                         │
└─────────────────────────────────────────┘
```

### 8.2 ゲーム画面（ひとりモード）

```
┌─────────────────────────────────────────┐
│  [ラウンド 1/5] ████░░░░░░  スコア: 0 [?]│
├─────────────────────────────────────────┤
│                                         │
│              あなたの手札               │
│  ┌─────────────────────────────────┐    │
│  │ [card] [card] [card] [card] [card]│  │
│  │  茶トラ  三毛   白猫   黒猫  茶白  │  │
│  │  短毛   長毛   短毛   短毛  短毛  │  │
│  └─────────────────────────────────┘    │
│                                         │
│          ┌─────────────────┐            │
│          │   ワンペア      │            │
│          │ 獲得ポイント: 5 │            │
│          └─────────────────┘            │
│                                         │
│  交換するカードを選択してください（2枚選択中） │
│  ┌───────────┐  ┌───────────┐  [解除]   │
│  │  交換する  │  │交換しない │           │
│  └───────────┘  └───────────┘           │
│                                         │
└─────────────────────────────────────────┘
```

### 8.3 対戦画面

```
┌─────────────────────────────────────────┐
│  [ラウンド 1/5] ████░░░░░░  スコア: 0 [?]│
├─────────────────────────────────────────┤
│  ┌─────────────┐  VS  ┌─────────────┐   │
│  │ 🎩ディーラー │      │  🐱あなた   │   │
│  │   ノーペア   │      │  ワンペア   │   │
│  │    0 pt     │      │    5 pt    │   │
│  └─────────────┘      └─────────────┘   │
├─────────────────────────────────────────┤
│            🎩 ディーラー                 │
│  ┌───────────────────────────────────┐  │
│  │  [?] [?] [?] [?] [?]  （裏面）    │  │
│  └───────────────────────────────────┘  │
│                                         │
│  ────── VS ────── (0枚) [交換する][解除] │
│                                         │
│              あなたの手札               │
│  ┌───────────────────────────────────┐  │
│  │ [card] [card] [card] [card] [card]│  │
│  │  茶トラ  三毛   白猫   黒猫  茶白  │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

### 8.4 結果画面

```
┌─────────────────────────────────────────┐
│                                         │
│              最終スコア                 │
│                                         │
│                 85                      │
│               ポイント                  │
│                                         │
│  ┌─────────────────────────────────┐    │
│  │         ラウンド履歴            │    │
│  │  ─────────────────────────────  │    │
│  │  ラウンド1  ワンペア      +1    │    │
│  │  ラウンド2  スリーカラー  +6    │    │
│  │  ラウンド3  ノーペア      +0    │    │
│  │  ラウンド4  フォーカラー  +12   │    │
│  │  ラウンド5  茶白フラッシュ +25  │    │
│  └─────────────────────────────────┘    │
│                                         │
│         ┌─────────────────┐             │
│         │  もう一度遊ぶ   │             │
│         └─────────────────┘             │
│         ┌─────────────────┐             │
│         │ タイトルに戻る  │             │
│         └─────────────────┘             │
│                                         │
└─────────────────────────────────────────┘
```

## 9. スタイル仕様

### 9.1 カラーパレット

```css
/* styles/variables.css */

:root {
  /* 背景色 */
  --color-bg: #2d2a26;           /* メイン背景（ダークブラウン） */
  --color-bg-light: #3d3a35;     /* 明るい背景 */
  --color-card-bg: #4a4540;      /* カード背景 */

  /* プライマリ */
  --color-primary: #d4a574;      /* ゴールドブラウン */
  --color-primary-light: #e8c9a0; /* 明るいゴールド */
  --color-accent: #c17f59;       /* アクセントオレンジ */

  /* テキスト */
  --color-text: #f5f0e8;         /* メインテキスト（オフホワイト） */
  --color-text-muted: #a89f94;   /* サブテキスト */

  /* ステータス */
  --color-success: #7eb87e;      /* 勝利（緑） */
  --color-danger: #c46b6b;       /* 敗北（赤） */
}
```

### 9.2 サイズ定義

```css
:root {
  /* カードサイズ - PC */
  --card-width-pc: 150px;
  --card-height-pc: 200px;

  /* カードサイズ - SP */
  --card-width-sp: 80px;
  --card-height-sp: 107px;

  /* ディーラーカード（80%サイズ） */
  --dealer-card-width-pc: 120px;
  --dealer-card-height-pc: 160px;

  /* トランジション */
  --transition-fast: 0.2s;
  --transition-normal: 0.3s;
}
```

### 9.3 レスポンシブブレークポイント

| ブレークポイント | 対象デバイス | 主な変更点 |
|----------------|-------------|-----------|
| 375px以上 | スマートフォン | カード80x107px、フォント縮小 |
| 768px以上 | タブレット | カード120x160px |
| 1024px以上 | PC（推奨） | カード150x200px、フル機能 |

## 10. テスト仕様

### 10.1 単体テスト対象

| モジュール | テスト内容 |
|-----------|-----------|
| roleCalculator | 全役の判定パターン（フラッシュ12種、ファー2種、カラー5種） |
| deck | シャッフル、カード抽出、重複排除 |
| dealerAI | 各戦略パターンの判断 |

### 10.2 統合テスト対象

| シナリオ | テスト内容 |
|---------|-----------|
| ひとりモード完走 | 5ラウンドプレイ→結果画面表示 |
| 対戦モード完走 | 5ラウンドプレイ→勝敗判定→結果画面表示 |
| データ永続化 | 設定保存、戦績保存、リセット |

## 11. 実装優先順位

### Phase 1: コア機能（MVP）
1. カードデータ読み込み・型定義
2. デッキ管理（シャッフル、配布）
3. 役判定ロジック
4. タイトル画面
5. ひとりモード基本フロー

### Phase 2: 対戦機能
1. 対戦画面
2. ディーラーAI
3. 勝敗判定
4. 対戦結果表示

### Phase 3: UX向上
1. カードアニメーション（配布、交換）
2. 役成立アニメーション
3. サウンド実装
4. 紙吹雪エフェクト

### Phase 4: 完成度向上
1. ローカルストレージ（設定、戦績）
2. モーダル（ルール、設定、戦績）
3. レスポンシブ対応
4. 最終調整・バグ修正
