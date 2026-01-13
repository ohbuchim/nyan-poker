// constants/animations.ts
// アニメーションに関する共通定数を管理するファイル

/**
 * カード配布アニメーションの各カードの持続時間（ミリ秒）
 */
export const CARD_DEAL_DURATION = 300;

/**
 * カード配布アニメーションの各カード間の間隔（ミリ秒）
 */
export const CARD_DEAL_INTERVAL = 100;

/**
 * カード交換後の役表示までの遅延時間（ミリ秒）
 */
export const EXCHANGE_ANIMATION_DELAY = 400;

/**
 * ディーラーのカード交換から役表示までの遅延時間（ミリ秒）
 */
export const DEALER_EXCHANGE_DELAY = 800;

/**
 * カード交換後、役ハイライト表示までの遅延時間（ミリ秒）
 */
export const ROLE_HIGHLIGHT_DELAY = 300;

/**
 * カード交換アニメーション（退出）の持続時間（ミリ秒）
 */
export const CARD_EXIT_ANIMATION_DURATION = 300;

/**
 * 配布アニメーションの合計時間を計算
 * @param cardCount - カード枚数
 * @returns アニメーション総時間（ミリ秒）
 */
export function calculateDealAnimationDuration(cardCount: number): number {
  if (cardCount === 0) return 0;
  // 最後のカードは (cardCount - 1) * interval 後に開始し、CARD_DEAL_DURATION 続く
  return (cardCount - 1) * CARD_DEAL_INTERVAL + CARD_DEAL_DURATION;
}
