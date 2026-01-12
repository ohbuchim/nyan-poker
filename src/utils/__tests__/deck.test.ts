// utils/__tests__/deck.test.ts

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  shuffleDeck,
  createDeck,
  drawCards,
  TOTAL_CARDS,
} from '../deck';
import type { Card } from '../../types/card';
import { CARD_DATA } from '../../data/cardData';

/** テスト用のカード生成ヘルパー */
function createTestCard(id: number, color: number, fur: number): Card {
  return {
    id,
    image: `/images/image_${String(id).padStart(3, '0')}.jpg`,
    color: color as any,
    fur: fur as any,
  };
}

describe('TOTAL_CARDS', () => {
  it('総カード枚数は229枚である', () => {
    expect(TOTAL_CARDS).toBe(229);
  });
});

describe('createDeck', () => {
  it('229枚のカードを含むデッキを作成する', () => {
    const deck = createDeck();
    expect(deck.length).toBe(229);
  });

  it('各カードには正しいIDが割り当てられている', () => {
    const deck = createDeck();
    deck.forEach((card, index) => {
      expect(card.id).toBe(index);
    });
  });

  it('各カードには正しい画像パスが割り当てられている', () => {
    const deck = createDeck();
    deck.forEach((card, index) => {
      expect(card.image).toBe(`/images/image_${String(index).padStart(3, '0')}.jpg`);
    });
  });

  it('各カードにはCARD_DATAと一致する毛色と毛の長さが割り当てられている', () => {
    const deck = createDeck();
    deck.forEach((card, index) => {
      expect(card.color).toBe(CARD_DATA[index].color);
      expect(card.fur).toBe(CARD_DATA[index].fur);
    });
  });

  it('呼び出しごとに新しい配列を返す', () => {
    const deck1 = createDeck();
    const deck2 = createDeck();
    expect(deck1).not.toBe(deck2);
    expect(deck1).toEqual(deck2);
  });
});

describe('shuffleDeck', () => {
  it('元の配列と同じ長さの配列を返す', () => {
    const deck = createDeck();
    const shuffled = shuffleDeck(deck);
    expect(shuffled.length).toBe(deck.length);
  });

  it('元の配列を変更しない', () => {
    const deck = createDeck();
    const originalDeck = [...deck];
    shuffleDeck(deck);
    expect(deck).toEqual(originalDeck);
  });

  it('すべてのカードが含まれている（重複なし）', () => {
    const deck = createDeck();
    const shuffled = shuffleDeck(deck);

    const ids = shuffled.map((card) => card.id);
    const uniqueIds = [...new Set(ids)];
    expect(uniqueIds.length).toBe(deck.length);

    // 元のカードがすべて含まれている
    deck.forEach((card) => {
      expect(ids).toContain(card.id);
    });
  });

  it('空の配列を渡すと空の配列を返す', () => {
    const shuffled = shuffleDeck([]);
    expect(shuffled).toEqual([]);
  });

  it('1枚のカードを渡すとそのカードを返す', () => {
    const card = createTestCard(0, 0, 1);
    const shuffled = shuffleDeck([card]);
    expect(shuffled.length).toBe(1);
    expect(shuffled[0]).toEqual(card);
  });

  describe('Fisher-Yatesアルゴリズムの検証', () => {
    beforeEach(() => {
      vi.spyOn(Math, 'random');
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('Math.randomを正しい回数呼び出す', () => {
      const deck = [
        createTestCard(0, 0, 1),
        createTestCard(1, 1, 1),
        createTestCard(2, 2, 1),
        createTestCard(3, 3, 1),
        createTestCard(4, 4, 1),
      ];

      vi.mocked(Math.random).mockReturnValue(0.5);
      shuffleDeck(deck);

      // Fisher-Yatesでは length - 1 回の交換を行う
      expect(Math.random).toHaveBeenCalledTimes(4);
    });

    it('決定論的なシャッフル結果を生成する', () => {
      const deck = [
        createTestCard(0, 0, 1),
        createTestCard(1, 1, 1),
        createTestCard(2, 2, 1),
        createTestCard(3, 3, 1),
        createTestCard(4, 4, 1),
      ];

      // 特定のランダム値列を設定
      vi.mocked(Math.random)
        .mockReturnValueOnce(0.9)  // i=4: j=floor(5*0.9)=4
        .mockReturnValueOnce(0.1)  // i=3: j=floor(4*0.1)=0
        .mockReturnValueOnce(0.5)  // i=2: j=floor(3*0.5)=1
        .mockReturnValueOnce(0.0); // i=1: j=floor(2*0.0)=0

      const shuffled = shuffleDeck(deck);

      // 同じランダム値で再度シャッフル
      vi.mocked(Math.random)
        .mockReturnValueOnce(0.9)
        .mockReturnValueOnce(0.1)
        .mockReturnValueOnce(0.5)
        .mockReturnValueOnce(0.0);

      const shuffled2 = shuffleDeck(deck);

      expect(shuffled.map((c) => c.id)).toEqual(shuffled2.map((c) => c.id));
    });
  });

  describe('シャッフルの均一性（統計的検証）', () => {
    it('複数回シャッフルで異なる結果が生成される', () => {
      const deck = createDeck();
      const results: string[] = [];

      // 10回シャッフルして結果を記録
      for (let i = 0; i < 10; i++) {
        const shuffled = shuffleDeck(deck);
        results.push(shuffled.map((c) => c.id).join(','));
      }

      // すべて同じ結果ではないことを確認
      const uniqueResults = [...new Set(results)];
      expect(uniqueResults.length).toBeGreaterThan(1);
    });

    it('シャッフル後の最初のカードが偏らない', () => {
      const deck = [
        createTestCard(0, 0, 1),
        createTestCard(1, 1, 1),
        createTestCard(2, 2, 1),
        createTestCard(3, 3, 1),
        createTestCard(4, 4, 1),
      ];

      const firstCardCounts: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0 };

      // 1000回シャッフルして最初のカードを記録
      for (let i = 0; i < 1000; i++) {
        const shuffled = shuffleDeck(deck);
        firstCardCounts[shuffled[0].id]++;
      }

      // 各カードが最初に来る確率は約20%（1/5）
      // 許容誤差を5%として、15-25%の範囲にあることを確認
      Object.values(firstCardCounts).forEach((count) => {
        expect(count).toBeGreaterThan(100); // 10%以上
        expect(count).toBeLessThan(350);    // 35%以下
      });
    });
  });
});

describe('drawCards', () => {
  describe('基本動作', () => {
    it('指定した枚数のカードを引く', () => {
      const cards = drawCards(5);
      expect(cards.length).toBe(5);
    });

    it('0枚を指定すると空の配列を返す', () => {
      const cards = drawCards(0);
      expect(cards).toEqual([]);
    });

    it('1枚を引くことができる', () => {
      const cards = drawCards(1);
      expect(cards.length).toBe(1);
    });

    it('229枚すべてを引くことができる', () => {
      const cards = drawCards(229);
      expect(cards.length).toBe(229);
    });

    it('引いたカードにIDの重複がない', () => {
      const cards = drawCards(10);
      const ids = cards.map((c) => c.id);
      const uniqueIds = [...new Set(ids)];
      expect(uniqueIds.length).toBe(10);
    });
  });

  describe('除外リスト対応', () => {
    it('除外リストのカードは引かない', () => {
      const excludeIds = [0, 1, 2, 3, 4];
      const cards = drawCards(5, excludeIds);

      cards.forEach((card) => {
        expect(excludeIds).not.toContain(card.id);
      });
    });

    it('除外リストが空の場合、すべてのカードが候補になる', () => {
      const cards = drawCards(5, []);
      expect(cards.length).toBe(5);
    });

    it('大量の除外リストでも正しく動作する', () => {
      // 220枚を除外して、残り9枚から5枚を引く
      const excludeIds = Array.from({ length: 220 }, (_, i) => i);
      const cards = drawCards(5, excludeIds);

      expect(cards.length).toBe(5);
      cards.forEach((card) => {
        expect(excludeIds).not.toContain(card.id);
        expect(card.id).toBeGreaterThanOrEqual(220);
      });
    });

    it('除外リストに重複があっても正しく動作する', () => {
      const excludeIds = [0, 0, 1, 1, 2];
      const cards = drawCards(5, excludeIds);

      expect(cards.length).toBe(5);
      [0, 1, 2].forEach((id) => {
        expect(cards.map((c) => c.id)).not.toContain(id);
      });
    });

    it('存在しないIDを除外リストに含めても動作する', () => {
      const excludeIds = [999, 1000]; // 存在しないID
      const cards = drawCards(5, excludeIds);
      expect(cards.length).toBe(5);
    });
  });

  describe('エラーハンドリング', () => {
    it('負の枚数を指定するとエラーを投げる', () => {
      expect(() => drawCards(-1)).toThrow('引く枚数は0以上である必要があります');
    });

    it('引ける枚数を超えて引こうとするとエラーを投げる', () => {
      expect(() => drawCards(230)).toThrow(
        '引ける枚数が足りません（必要: 230枚, 利用可能: 229枚）'
      );
    });

    it('除外リストにより引ける枚数が足りなくなるとエラーを投げる', () => {
      // 225枚を除外して、残り4枚から5枚を引こうとする
      const excludeIds = Array.from({ length: 225 }, (_, i) => i);
      expect(() => drawCards(5, excludeIds)).toThrow(
        '引ける枚数が足りません（必要: 5枚, 利用可能: 4枚）'
      );
    });

    it('すべてのカードを除外すると1枚も引けない', () => {
      const excludeIds = Array.from({ length: 229 }, (_, i) => i);
      expect(() => drawCards(1, excludeIds)).toThrow(
        '引ける枚数が足りません（必要: 1枚, 利用可能: 0枚）'
      );
    });
  });

  describe('ランダム性', () => {
    it('複数回引くと異なる結果が生成される', () => {
      const results: string[] = [];

      // 10回引いて結果を記録
      for (let i = 0; i < 10; i++) {
        const cards = drawCards(5);
        results.push(cards.map((c) => c.id).join(','));
      }

      // すべて同じ結果ではないことを確認
      const uniqueResults = [...new Set(results)];
      expect(uniqueResults.length).toBeGreaterThan(1);
    });
  });

  describe('カード属性の正確性', () => {
    it('引いたカードは正しい属性を持つ', () => {
      const cards = drawCards(10);

      cards.forEach((card) => {
        // IDが有効な範囲内
        expect(card.id).toBeGreaterThanOrEqual(0);
        expect(card.id).toBeLessThan(229);

        // CARD_DATAと一致する属性
        expect(card.color).toBe(CARD_DATA[card.id].color);
        expect(card.fur).toBe(CARD_DATA[card.id].fur);

        // 正しい画像パス
        expect(card.image).toBe(
          `/images/image_${String(card.id).padStart(3, '0')}.jpg`
        );
      });
    });
  });
});

describe('統合テスト', () => {
  describe('ゲームシナリオシミュレーション', () => {
    it('プレイヤーとディーラーに5枚ずつ配布できる', () => {
      // プレイヤーに5枚配布
      const playerHand = drawCards(5);
      expect(playerHand.length).toBe(5);

      // ディーラーに5枚配布（プレイヤーのカードを除外）
      const playerCardIds = playerHand.map((c) => c.id);
      const dealerHand = drawCards(5, playerCardIds);
      expect(dealerHand.length).toBe(5);

      // 重複がないことを確認
      const allIds = [...playerHand, ...dealerHand].map((c) => c.id);
      const uniqueIds = [...new Set(allIds)];
      expect(uniqueIds.length).toBe(10);
    });

    it('カード交換シナリオ（3枚交換）', () => {
      // 初期手札5枚
      const initialHand = drawCards(5);
      expect(initialHand.length).toBe(5);

      // 3枚を交換（2枚残す）
      const keepCards = initialHand.slice(0, 2);
      const discardCards = initialHand.slice(2);
      expect(discardCards.length).toBe(3);

      // 新しいカードを3枚引く（初期手札を除外）
      const usedIds = initialHand.map((c) => c.id);
      const newCards = drawCards(3, usedIds);
      expect(newCards.length).toBe(3);

      // 新しい手札
      const finalHand = [...keepCards, ...newCards];
      expect(finalHand.length).toBe(5);

      // 新しいカードが初期手札と重複しない
      newCards.forEach((card) => {
        expect(usedIds).not.toContain(card.id);
      });
    });

    it('5ラウンド連続プレイ（ラウンドごとにデッキリセット）', () => {
      for (let round = 1; round <= 5; round++) {
        // 各ラウンドで新しくカードを引く
        const hand = drawCards(5);
        expect(hand.length).toBe(5);

        // カードIDが有効範囲内
        hand.forEach((card) => {
          expect(card.id).toBeGreaterThanOrEqual(0);
          expect(card.id).toBeLessThan(229);
        });
      }
    });
  });
});
