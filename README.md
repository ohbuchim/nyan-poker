# にゃんポーカー

猫カードで役を揃えるブラウザポーカーゲームです。

## ゲーム概要

5枚の猫カードを使ってポーカーのような役を揃えるゲームです。各カードには「毛色」と「毛の長さ」という2つの属性があり、これらの組み合わせで役が決まります。

### ゲームモード

- **ひとりで遊ぶモード**: 5ラウンドプレイして合計ポイントを競う
- **対戦モード**: ディーラーと5ラウンド対戦し、勝敗を競う

### 役の例

| 役名 | 条件 | ポイント |
|------|------|----------|
| サビフラッシュ | サビ猫5枚 | 300pt |
| 三毛フラッシュ | 三毛猫5枚 | 299pt |
| ロングファー | 長毛5枚 | 100pt |
| フォーカラー | 同色4枚 | 63〜277pt |
| フルハウス | 同色3枚+別色2枚 | 105〜294pt |
| スリーカラー | 同色3枚 | 16〜112pt |
| ツーペア | 2色のペア | 23〜154pt |
| ワンペア | 同色2枚 | 2〜21pt |
| ショートファー | 短毛5枚 | 1pt |
| ノーペア | 役なし | 0pt |

全249種類の役があり、毛色のレアリティによってポイントが異なります。

## 環境セットアップ

ゲームを動かすには Node.js が必要です。

### 1. Node.js のインストール

Node.js 18以上をインストールしてください。

**macOS (Homebrew)**
```bash
brew install node
```

**Windows**

[Node.js公式サイト](https://nodejs.org/) から LTS 版をダウンロードしてインストールしてください。

**バージョン確認**
```bash
node -v   # v18.0.0 以上であることを確認
npm -v    # npm も一緒にインストールされます
```

### 2. リポジトリの取得

```bash
git clone <repository-url>
cd nyan-poker
```

### 3. 依存関係のインストール

```bash
npm install
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

起動後、ブラウザで http://localhost:5173 を開くとゲームが始まります。

## 遊び方

### ゲームの流れ

1. **タイトル画面**でモードを選択
2. **カード配布**: 5枚のカードが配られる
3. **カード交換**: 交換したいカードを選択（0〜5枚）して交換
4. **役判定**: 手札の役が判定され、ポイントを獲得
5. 5ラウンド終了後、最終スコアを確認

## 開発者向け情報

### コマンド一覧

```bash
# 開発サーバー起動
npm run dev

# プロダクションビルド
npm run build

# ビルド結果のプレビュー
npm run preview

# Lint
npm run lint

# テスト実行
npm test

# テスト（UIモード）
npm run test:ui

# テスト（カバレッジ付き）
npm run test:coverage

# カードデータ生成（map.yml から）
npm run generate:card-data
```

### 技術スタック

- **フレームワーク**: React 18 + TypeScript
- **ビルドツール**: Vite
- **アニメーション**: Framer Motion
- **サウンド**: Howler.js
- **テスト**: Vitest + Testing Library

### プロジェクト構成

```
nyan-poker/
├── docs/                 # 仕様書
│   ├── requirements.md   # 要求仕様書
│   └── spec.md           # 詳細設計書
├── images/               # 猫カード画像（229枚）
│   ├── image_000.jpg
│   │   ...
│   ├── image_228.jpg
│   └── map.yml           # カード属性定義
├── sounds/               # 効果音
├── mock/                 # UIモック
├── src/
│   ├── components/       # Reactコンポーネント
│   │   ├── card/         # カード関連
│   │   ├── common/       # 共通UI
│   │   ├── effects/      # エフェクト
│   │   ├── game/         # ゲーム画面
│   │   └── modals/       # モーダル
│   ├── context/          # React Context
│   ├── constants/        # 定数
│   ├── data/             # カード・役データ
│   ├── hooks/            # カスタムフック
│   ├── pages/            # 画面コンポーネント
│   ├── styles/           # 共通スタイル
│   ├── types/            # TypeScript型定義
│   └── utils/            # ユーティリティ
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## ライセンス

このプロジェクトは MIT ライセンスのもとで公開されています。
