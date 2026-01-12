// utils/__tests__/dealerAI.test.ts

import { describe, it, expect } from 'vitest';
import {
  decideDealerExchange,
  executeDealerExchange,
  countByColor,
  countByFur,
  findDominantColor,
  getColorRarity,
} from '../dealerAI';
import type { Card, ColorCode } from '../../types/card';

/** テスト用のカード生成ヘルパー */
function createCard(id: number, color: number, fur: number): Card {
  return {
    id,
    image: `/images/image_${String(id).padStart(3, '0')}.jpg`,
    color: color as ColorCode,
    fur: fur as 0 | 1,
  };
}

describe('getColorRarity', () => {
  it('サビ（11）のレアリティが最も高い（12）', () => {
    expect(getColorRarity(11)).toBe(12);
  });

  it('三毛（1）のレアリティが2番目に高い（11）', () => {
    expect(getColorRarity(1)).toBe(11);
  });

  it('茶白（4）のレアリティが最も低い（1）', () => {
    expect(getColorRarity(4)).toBe(1);
  });

  it('すべての毛色コードに対してレアリティを取得できる', () => {
    const colors: ColorCode[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
    colors.forEach((color) => {
      expect(getColorRarity(color)).toBeGreaterThanOrEqual(1);
      expect(getColorRarity(color)).toBeLessThanOrEqual(12);
    });
  });
});

describe('countByColor', () => {
  it('毛色ごとのカード枚数を正しくカウントする', () => {
    const cards = [
      createCard(0, 11, 1), // サビ
      createCard(1, 11, 1), // サビ
      createCard(2, 11, 0), // サビ
      createCard(3, 1, 1), // 三毛
      createCard(4, 0, 1), // 茶トラ
    ];
    const counts = countByColor(cards);
    expect(counts.get(11)).toBe(3);
    expect(counts.get(1)).toBe(1);
    expect(counts.get(0)).toBe(1);
  });

  it('すべて異なる毛色の場合、各色が1枚ずつカウントされる', () => {
    const cards = [
      createCard(0, 0, 1),
      createCard(1, 1, 1),
      createCard(2, 2, 1),
      createCard(3, 3, 1),
      createCard(4, 4, 1),
    ];
    const counts = countByColor(cards);
    expect(counts.size).toBe(5);
    for (const [, count] of counts) {
      expect(count).toBe(1);
    }
  });

  it('すべて同じ毛色の場合、5枚カウントされる', () => {
    const cards = [
      createCard(0, 11, 1),
      createCard(1, 11, 0),
      createCard(2, 11, 1),
      createCard(3, 11, 1),
      createCard(4, 11, 0),
    ];
    const counts = countByColor(cards);
    expect(counts.get(11)).toBe(5);
    expect(counts.size).toBe(1);
  });
});

describe('countByFur', () => {
  it('毛の長さごとのカード枚数を正しくカウントする', () => {
    const cards = [
      createCard(0, 0, 0), // 長毛
      createCard(1, 1, 0), // 長毛
      createCard(2, 2, 1), // 短毛
      createCard(3, 3, 1), // 短毛
      createCard(4, 4, 1), // 短毛
    ];
    const counts = countByFur(cards);
    expect(counts[0]).toBe(2); // 長毛
    expect(counts[1]).toBe(3); // 短毛
  });

  it('すべて長毛の場合、長毛が5枚カウントされる', () => {
    const cards = [
      createCard(0, 0, 0),
      createCard(1, 1, 0),
      createCard(2, 2, 0),
      createCard(3, 3, 0),
      createCard(4, 4, 0),
    ];
    const counts = countByFur(cards);
    expect(counts[0]).toBe(5);
    expect(counts[1]).toBe(0);
  });

  it('すべて短毛の場合、短毛が5枚カウントされる', () => {
    const cards = [
      createCard(0, 0, 1),
      createCard(1, 1, 1),
      createCard(2, 2, 1),
      createCard(3, 3, 1),
      createCard(4, 4, 1),
    ];
    const counts = countByFur(cards);
    expect(counts[0]).toBe(0);
    expect(counts[1]).toBe(5);
  });
});

describe('findDominantColor', () => {
  it('指定枚数以上ある色を探す', () => {
    const counts = new Map<ColorCode, number>([
      [11, 3], // サビ
      [1, 2], // 三毛
    ]);
    expect(findDominantColor(counts, 3)).toBe(11);
    expect(findDominantColor(counts, 2)).toBe(11); // 3枚もあるので11がレアリティ高いから先に見つかる
    expect(findDominantColor(counts, 4)).toBe(null);
  });

  it('同数の場合、レアリティの高い色を返す', () => {
    const counts = new Map<ColorCode, number>([
      [0, 2], // 茶トラ（レアリティ3）
      [11, 2], // サビ（レアリティ12）
    ]);
    expect(findDominantColor(counts, 2)).toBe(11); // サビの方がレアリティ高い
  });

  it('条件を満たす色がない場合、nullを返す', () => {
    const counts = new Map<ColorCode, number>([
      [0, 1],
      [1, 1],
      [2, 1],
      [3, 1],
      [4, 1],
    ]);
    expect(findDominantColor(counts, 2)).toBe(null);
  });
});

describe('decideDealerExchange', () => {
  describe('フラッシュ狙い（同色4枚以上）', () => {
    it('4枚同色の場合、残りを交換する', () => {
      const hand = [
        createCard(0, 11, 1), // サビ
        createCard(1, 11, 1), // サビ
        createCard(2, 11, 0), // サビ
        createCard(3, 11, 1), // サビ
        createCard(4, 0, 1), // 茶トラ（交換対象）
      ];
      const result = decideDealerExchange(hand);
      expect(result.cardsToExchange).toEqual([4]);
      expect(result.reason).toContain('フラッシュ狙い');
    });

    it('5枚同色（フラッシュ成立）の場合、交換しない', () => {
      const hand = [
        createCard(0, 11, 1), // サビ
        createCard(1, 11, 1), // サビ
        createCard(2, 11, 0), // サビ
        createCard(3, 11, 1), // サビ
        createCard(4, 11, 0), // サビ
      ];
      const result = decideDealerExchange(hand);
      expect(result.cardsToExchange).toEqual([]);
      expect(result.reason).toBe('フラッシュ成立（交換不要）');
    });
  });

  describe('ロングファー狙い（長毛4枚以上）', () => {
    it('長毛4枚の場合、短毛を交換する', () => {
      const hand = [
        createCard(0, 0, 0), // 茶トラ長毛
        createCard(1, 1, 0), // 三毛長毛
        createCard(2, 2, 0), // 白猫長毛
        createCard(3, 3, 0), // 黒猫長毛
        createCard(4, 4, 1), // 茶白短毛（交換対象）
      ];
      const result = decideDealerExchange(hand);
      expect(result.cardsToExchange).toEqual([4]);
      expect(result.reason).toContain('ロングファー狙い');
    });

    it('長毛5枚（ロングファー成立）の場合、交換しない', () => {
      const hand = [
        createCard(0, 0, 0), // 茶トラ長毛
        createCard(1, 1, 0), // 三毛長毛
        createCard(2, 2, 0), // 白猫長毛
        createCard(3, 3, 0), // 黒猫長毛
        createCard(4, 4, 0), // 茶白長毛
      ];
      const result = decideDealerExchange(hand);
      expect(result.cardsToExchange).toEqual([]);
      expect(result.reason).toBe('ロングファー成立（交換不要）');
    });

    it('フラッシュ狙いがロングファー狙いより優先される', () => {
      const hand = [
        createCard(0, 11, 0), // サビ長毛
        createCard(1, 11, 0), // サビ長毛
        createCard(2, 11, 0), // サビ長毛
        createCard(3, 11, 0), // サビ長毛
        createCard(4, 0, 0), // 茶トラ長毛
      ];
      const result = decideDealerExchange(hand);
      // フラッシュ成立（5枚同色）よりも先にフラッシュ狙い（4枚同色）がチェックされる
      // でもこの場合は4枚同色なのでフラッシュ狙いが適用される
      expect(result.cardsToExchange).toEqual([4]);
      expect(result.reason).toContain('フラッシュ狙い');
    });
  });

  describe('フォーカラー/スリーカラー狙い（同色3枚以上）', () => {
    it('3枚同色の場合、残りを交換する', () => {
      const hand = [
        createCard(0, 11, 1), // サビ
        createCard(1, 11, 1), // サビ
        createCard(2, 11, 0), // サビ
        createCard(3, 0, 1), // 茶トラ（交換対象）
        createCard(4, 1, 1), // 三毛（交換対象）
      ];
      const result = decideDealerExchange(hand);
      expect(result.cardsToExchange.sort()).toEqual([3, 4].sort());
      expect(result.reason).toContain('フォーカラー狙い');
    });

    it('複数の3枚同色がある場合、レアリティの高い方を残す', () => {
      const hand = [
        createCard(0, 0, 1), // 茶トラ（レアリティ3）
        createCard(1, 0, 1), // 茶トラ
        createCard(2, 0, 1), // 茶トラ
        createCard(3, 11, 1), // サビ（レアリティ12）
        createCard(4, 11, 1), // サビ
      ];
      // 茶トラが3枚、サビが2枚
      // 茶トラが3枚以上なのでfindDominantColor(3)でヒットする
      const result = decideDealerExchange(hand);
      expect(result.cardsToExchange.sort()).toEqual([3, 4].sort());
      expect(result.reason).toContain('フォーカラー狙い');
    });
  });

  describe('ペア維持（同色2枚）', () => {
    it('2枚同色の場合、残りを交換する', () => {
      const hand = [
        createCard(0, 11, 1), // サビ
        createCard(1, 11, 1), // サビ
        createCard(2, 0, 1), // 茶トラ（交換対象）
        createCard(3, 1, 1), // 三毛（交換対象）
        createCard(4, 2, 1), // 白猫（交換対象）
      ];
      const result = decideDealerExchange(hand);
      expect(result.cardsToExchange.sort()).toEqual([2, 3, 4].sort());
      expect(result.reason).toContain('スリーカラー以上狙い');
    });

    it('複数ペアがある場合、レアリティの高い方を残す', () => {
      const hand = [
        createCard(0, 0, 1), // 茶トラ（レアリティ3）
        createCard(1, 0, 1), // 茶トラ
        createCard(2, 11, 1), // サビ（レアリティ12）
        createCard(3, 11, 1), // サビ
        createCard(4, 1, 1), // 三毛
      ];
      const result = decideDealerExchange(hand);
      // サビの方がレアリティ高いので、サビを残す
      expect(result.cardsToExchange.sort()).toEqual([0, 1, 4].sort());
      expect(result.reason).toContain('スリーカラー以上狙い');
    });
  });

  describe('最多色維持（役なし時）', () => {
    it('すべてバラバラの場合、最もレアリティの高い色を残す', () => {
      const hand = [
        createCard(0, 0, 1), // 茶トラ（レアリティ3）
        createCard(1, 1, 1), // 三毛（レアリティ11）
        createCard(2, 2, 1), // 白猫（レアリティ9）
        createCard(3, 3, 1), // 黒猫（レアリティ8）
        createCard(4, 4, 1), // 茶白（レアリティ1）
      ];
      const result = decideDealerExchange(hand);
      // 三毛（1）が最もレアリティ高い
      expect(result.cardsToExchange.sort()).toEqual([0, 2, 3, 4].sort());
      expect(result.reason).toContain('最多色');
    });

    it('同枚数の色がある場合、レアリティの高い方を残す', () => {
      const hand = [
        createCard(0, 4, 1), // 茶白（レアリティ1）
        createCard(1, 4, 0), // 茶白
        createCard(2, 11, 1), // サビ（レアリティ12）
        createCard(3, 11, 0), // サビ
        createCard(4, 0, 1), // 茶トラ
      ];
      // 茶白2枚、サビ2枚だが、サビの方がレアリティ高い
      // ただしこの場合は findDominantColor(2) でサビが先に見つかる
      const result = decideDealerExchange(hand);
      expect(result.cardsToExchange.sort()).toEqual([0, 1, 4].sort());
    });
  });
});

describe('executeDealerExchange', () => {
  it('指定したカードを新しいカードに交換する', () => {
    const hand = [
      createCard(0, 11, 1),
      createCard(1, 11, 1),
      createCard(2, 11, 0),
      createCard(3, 0, 1), // 交換対象
      createCard(4, 1, 1), // 交換対象
    ];
    const newCards = [createCard(100, 11, 1), createCard(101, 11, 0)];
    const cardsToExchange = [3, 4];

    const result = executeDealerExchange(hand, newCards, cardsToExchange);

    expect(result[0].id).toBe(0);
    expect(result[1].id).toBe(1);
    expect(result[2].id).toBe(2);
    expect(result[3].id).toBe(100); // 新しいカード
    expect(result[4].id).toBe(101); // 新しいカード
  });

  it('交換対象がない場合、元の手札をそのまま返す', () => {
    const hand = [
      createCard(0, 11, 1),
      createCard(1, 11, 1),
      createCard(2, 11, 0),
      createCard(3, 11, 1),
      createCard(4, 11, 0),
    ];
    const newCards: Card[] = [];
    const cardsToExchange: number[] = [];

    const result = executeDealerExchange(hand, newCards, cardsToExchange);

    expect(result).toEqual(hand);
  });

  it('新しいカードが足りない場合、交換できる分だけ交換する', () => {
    const hand = [
      createCard(0, 11, 1),
      createCard(1, 11, 1),
      createCard(2, 11, 0),
      createCard(3, 0, 1), // 交換対象
      createCard(4, 1, 1), // 交換対象
    ];
    const newCards = [createCard(100, 11, 1)]; // 1枚しかない
    const cardsToExchange = [3, 4];

    const result = executeDealerExchange(hand, newCards, cardsToExchange);

    expect(result[3].id).toBe(100); // 交換された
    expect(result[4].id).toBe(4); // 交換されなかった
  });
});
