// utils/deck.ts

import type { Card } from '../types/card';
import { CARD_DATA } from '../data/cardData';

/** 総カード枚数 */
export const TOTAL_CARDS = 229;

/**
 * デッキをシャッフル（Fisher-Yatesアルゴリズム）
 * すべての順列が等確率で出現することを保証する
 *
 * @param cards - シャッフルするカードの配列
 * @returns シャッフルされた新しい配列（元の配列は変更されない）
 */
export function shuffleDeck(cards: Card[]): Card[] {
  const shuffled = [...cards];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * 新しいデッキを作成
 * CARD_DATAから全カードを含むデッキを生成する
 *
 * @returns 全229枚のカードを含む配列
 */
export function createDeck(): Card[] {
  return CARD_DATA.map((data, index) => ({
    id: index,
    image: `/images/image_${String(index).padStart(3, '0')}.jpg`,
    color: data.color,
    fur: data.fur,
  }));
}

/**
 * カードを引く（除外リスト対応）
 * 指定枚数のカードをデッキから引く
 * 除外リストに含まれるカードは引かない
 *
 * @param count - 引くカードの枚数
 * @param excludeIds - 除外するカードのID配列（デフォルト: 空配列）
 * @returns 引いたカードの配列
 * @throws 引ける枚数が足りない場合はエラー
 */
export function drawCards(count: number, excludeIds: number[] = []): Card[] {
  if (count < 0) {
    throw new Error('引く枚数は0以上である必要があります');
  }

  if (count === 0) {
    return [];
  }

  const deck = createDeck();
  const available = deck.filter((card) => !excludeIds.includes(card.id));

  if (available.length < count) {
    throw new Error(
      `引ける枚数が足りません（必要: ${count}枚, 利用可能: ${available.length}枚）`
    );
  }

  const shuffled = shuffleDeck(available);
  return shuffled.slice(0, count);
}
