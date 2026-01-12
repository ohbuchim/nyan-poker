// utils/__tests__/roleCalculator.test.ts

import { describe, it, expect } from 'vitest';
import {
  analyzeHand,
  calculateRole,
  determineWinner,
  calculateScoreChange,
} from '../roleCalculator';
import type { Card } from '../../types/card';
import type { Role } from '../../types/role';

/** テスト用のカード生成ヘルパー */
function createCard(id: number, color: number, fur: number): Card {
  return {
    id,
    image: `/images/image_${String(id).padStart(3, '0')}.jpg`,
    color: color as any,
    fur: fur as any,
  };
}

describe('analyzeHand', () => {
  describe('毛色ごとのカード枚数カウント', () => {
    it('同じ毛色のカード枚数を正しくカウントする', () => {
      const cards = [
        createCard(0, 11, 1),  // サビ
        createCard(1, 11, 1),  // サビ
        createCard(2, 11, 0),  // サビ
        createCard(3, 1, 1),   // 三毛
        createCard(4, 0, 1),   // 茶トラ
      ];
      const analysis = analyzeHand(cards);
      expect(analysis.colorCounts.get(11)).toBe(3);
      expect(analysis.colorCounts.get(1)).toBe(1);
      expect(analysis.colorCounts.get(0)).toBe(1);
    });

    it('全て異なる毛色の場合、各色が1枚ずつカウントされる', () => {
      const cards = [
        createCard(0, 0, 1),  // 茶トラ
        createCard(1, 1, 1),  // 三毛
        createCard(2, 2, 1),  // 白猫
        createCard(3, 3, 1),  // 黒猫
        createCard(4, 4, 1),  // 茶白
      ];
      const analysis = analyzeHand(cards);
      expect(analysis.colorCounts.size).toBe(5);
      for (const [, count] of analysis.colorCounts) {
        expect(count).toBe(1);
      }
    });
  });

  describe('毛の長さごとのカード枚数カウント', () => {
    it('長毛と短毛の枚数を正しくカウントする', () => {
      const cards = [
        createCard(0, 0, 0),  // 長毛
        createCard(1, 1, 0),  // 長毛
        createCard(2, 2, 1),  // 短毛
        createCard(3, 3, 1),  // 短毛
        createCard(4, 4, 1),  // 短毛
      ];
      const analysis = analyzeHand(cards);
      expect(analysis.furCounts.get(0)).toBe(2);  // 長毛
      expect(analysis.furCounts.get(1)).toBe(3);  // 短毛
    });

    it('全て長毛の場合、長毛が5枚カウントされる', () => {
      const cards = [
        createCard(0, 0, 0),
        createCard(1, 1, 0),
        createCard(2, 2, 0),
        createCard(3, 3, 0),
        createCard(4, 4, 0),
      ];
      const analysis = analyzeHand(cards);
      expect(analysis.furCounts.get(0)).toBe(5);
      expect(analysis.furCounts.get(1)).toBeUndefined();
    });
  });

  describe('ソートされた色リスト', () => {
    it('枚数の多い順にソートされる', () => {
      const cards = [
        createCard(0, 0, 1),  // 茶トラ×1
        createCard(1, 1, 1),  // 三毛×2
        createCard(2, 1, 1),
        createCard(3, 11, 1), // サビ×2
        createCard(4, 11, 1),
      ];
      const analysis = analyzeHand(cards);
      // サビ（レアリティ12）> 三毛（レアリティ11）> 茶トラ（レアリティ3）
      expect(analysis.sortedColorCounts[0][0]).toBe(11); // サビ（同数だがレアリティ高）
      expect(analysis.sortedColorCounts[1][0]).toBe(1);  // 三毛
      expect(analysis.sortedColorCounts[2][0]).toBe(0);  // 茶トラ
    });

    it('同じ枚数の場合、レアリティの高い順にソートされる', () => {
      const cards = [
        createCard(0, 0, 1),  // 茶トラ×1（レアリティ3）
        createCard(1, 1, 1),  // 三毛×1（レアリティ11）
        createCard(2, 4, 1),  // 茶白×1（レアリティ1）
        createCard(3, 11, 1), // サビ×1（レアリティ12）
        createCard(4, 6, 1),  // キジトラ×1（レアリティ2）
      ];
      const analysis = analyzeHand(cards);
      // レアリティ順: サビ(12) > 三毛(11) > 茶トラ(3) > キジトラ(2) > 茶白(1)
      expect(analysis.sortedColorCounts[0][0]).toBe(11); // サビ
      expect(analysis.sortedColorCounts[1][0]).toBe(1);  // 三毛
      expect(analysis.sortedColorCounts[2][0]).toBe(0);  // 茶トラ
      expect(analysis.sortedColorCounts[3][0]).toBe(6);  // キジトラ
      expect(analysis.sortedColorCounts[4][0]).toBe(4);  // 茶白
    });
  });
});

describe('calculateRole', () => {
  describe('エラーハンドリング', () => {
    it('手札が5枚でない場合はエラーを投げる', () => {
      const cards = [createCard(0, 0, 1), createCard(1, 1, 1)];
      expect(() => calculateRole(cards)).toThrow('手札は5枚である必要があります');
    });
  });

  describe('フラッシュ（5枚同色）', () => {
    it('サビフラッシュ（300pt）を判定できる', () => {
      const cards = [
        createCard(0, 11, 1), // サビ
        createCard(1, 11, 1),
        createCard(2, 11, 0),
        createCard(3, 11, 1),
        createCard(4, 11, 1),
      ];
      const role = calculateRole(cards);
      expect(role.type).toBe('flush');
      expect(role.name).toBe('サビフラッシュ');
      expect(role.points).toBe(300);
      expect(role.matchingCardIds).toEqual([0, 1, 2, 3, 4]);
    });

    it('三毛フラッシュ（299pt）を判定できる', () => {
      const cards = [
        createCard(5, 1, 1), // 三毛
        createCard(6, 1, 0),
        createCard(7, 1, 1),
        createCard(8, 1, 1),
        createCard(9, 1, 1),
      ];
      const role = calculateRole(cards);
      expect(role.type).toBe('flush');
      expect(role.name).toBe('三毛フラッシュ');
      expect(role.points).toBe(299);
    });

    it('茶白フラッシュ（198pt）を判定できる', () => {
      const cards = [
        createCard(10, 4, 1), // 茶白
        createCard(11, 4, 1),
        createCard(12, 4, 0),
        createCard(13, 4, 1),
        createCard(14, 4, 1),
      ];
      const role = calculateRole(cards);
      expect(role.type).toBe('flush');
      expect(role.name).toBe('茶白フラッシュ');
      expect(role.points).toBe(198);
    });
  });

  describe('ファー（5枚同じ毛の長さ）', () => {
    it('ロングファー（100pt）を判定できる', () => {
      const cards = [
        createCard(15, 0, 0), // 長毛
        createCard(16, 1, 0),
        createCard(17, 2, 0),
        createCard(18, 3, 0),
        createCard(19, 4, 0),
      ];
      const role = calculateRole(cards);
      expect(role.type).toBe('fur');
      expect(role.name).toBe('ロングファー');
      expect(role.points).toBe(100);
      expect(role.matchingCardIds).toEqual([15, 16, 17, 18, 19]);
    });

    it('ショートファー（1pt）を判定できる', () => {
      const cards = [
        createCard(20, 0, 1), // 短毛
        createCard(21, 1, 1),
        createCard(22, 2, 1),
        createCard(23, 3, 1),
        createCard(24, 4, 1),
      ];
      const role = calculateRole(cards);
      expect(role.type).toBe('fur');
      expect(role.name).toBe('ショートファー');
      expect(role.points).toBe(1);
    });
  });

  describe('フォーカラー（4枚同色）', () => {
    it('サビフォーカラー（277pt）を判定できる', () => {
      const cards = [
        createCard(25, 11, 1), // サビ×4
        createCard(26, 11, 1),
        createCard(27, 11, 0),
        createCard(28, 11, 1),
        createCard(29, 0, 1),  // 茶トラ
      ];
      const role = calculateRole(cards);
      expect(role.type).toBe('fourColor');
      expect(role.name).toBe('サビフォーカラー');
      expect(role.points).toBe(277);
      expect(role.matchingCardIds).toEqual([25, 26, 27, 28]);
    });

    it('茶白フォーカラー（63pt）を判定できる', () => {
      const cards = [
        createCard(30, 4, 1), // 茶白×4
        createCard(31, 4, 1),
        createCard(32, 4, 0),
        createCard(33, 4, 1),
        createCard(34, 0, 1), // 茶トラ
      ];
      const role = calculateRole(cards);
      expect(role.type).toBe('fourColor');
      expect(role.name).toBe('茶白フォーカラー');
      expect(role.points).toBe(63);
    });
  });

  describe('フルハウス（3枚+2枚）', () => {
    it('サビ×三毛フルハウス（294pt）を判定できる', () => {
      const cards = [
        createCard(35, 11, 1), // サビ×3
        createCard(36, 11, 0),
        createCard(37, 11, 1),
        createCard(38, 1, 1),  // 三毛×2
        createCard(39, 1, 0),
      ];
      const role = calculateRole(cards);
      expect(role.type).toBe('fullHouse');
      expect(role.name).toBe('サビ×三毛フルハウス');
      expect(role.points).toBe(294);
      expect(role.matchingCardIds).toEqual([35, 36, 37, 38, 39]);
    });

    it('茶白×キジトラフルハウス（105pt）を判定できる', () => {
      const cards = [
        createCard(40, 4, 1), // 茶白×3
        createCard(41, 4, 1),
        createCard(42, 4, 0),
        createCard(43, 6, 1), // キジトラ×2
        createCard(44, 6, 1),
      ];
      const role = calculateRole(cards);
      expect(role.type).toBe('fullHouse');
      expect(role.name).toBe('茶白×キジトラフルハウス');
      expect(role.points).toBe(105);
    });
  });

  describe('スリーカラー（3枚同色、残り2枚が異なる色）', () => {
    it('サビスリーカラー（112pt）を判定できる', () => {
      const cards = [
        createCard(45, 11, 1), // サビ×3
        createCard(46, 11, 0),
        createCard(47, 11, 1),
        createCard(48, 0, 1),  // 茶トラ
        createCard(49, 1, 1),  // 三毛
      ];
      const role = calculateRole(cards);
      expect(role.type).toBe('threeColor');
      expect(role.name).toBe('サビスリーカラー');
      expect(role.points).toBe(112);
      expect(role.matchingCardIds).toEqual([45, 46, 47]);
    });

    it('茶白スリーカラー（16pt）を判定できる', () => {
      const cards = [
        createCard(50, 4, 1), // 茶白×3
        createCard(51, 4, 1),
        createCard(52, 4, 0),
        createCard(53, 0, 1), // 茶トラ
        createCard(54, 1, 1), // 三毛
      ];
      const role = calculateRole(cards);
      expect(role.type).toBe('threeColor');
      expect(role.name).toBe('茶白スリーカラー');
      expect(role.points).toBe(16);
    });
  });

  describe('ツーペア（2色のペア）', () => {
    it('三毛×サビツーペア（154pt）を判定できる', () => {
      const cards = [
        createCard(55, 11, 1), // サビ×2
        createCard(56, 11, 0),
        createCard(57, 1, 1),  // 三毛×2
        createCard(58, 1, 0),
        createCard(59, 0, 1),  // 茶トラ
      ];
      const role = calculateRole(cards);
      expect(role.type).toBe('twoPair');
      expect(role.name).toBe('サビ×三毛ツーペア');
      expect(role.points).toBe(154);
      expect(role.matchingCardIds.sort()).toEqual([55, 56, 57, 58].sort());
    });

    it('茶トラ×キジトラツーペア（36pt）を判定できる', () => {
      const cards = [
        createCard(60, 0, 1), // 茶トラ×2
        createCard(61, 0, 1),
        createCard(62, 6, 1), // キジトラ×2
        createCard(63, 6, 0),
        createCard(64, 1, 1), // 三毛
      ];
      const role = calculateRole(cards);
      expect(role.type).toBe('twoPair');
      // 茶トラ（レアリティ3）> キジトラ（レアリティ2）なので、茶トラが先
      expect(role.name).toBe('茶トラ×キジトラツーペア');
      // スコア = 3 + 2 = 5, ポイント = 6.55 * 5 + 3.35 = 36.1 => 36
      expect(role.points).toBe(36);
    });

    it('レアリティが同じ場合、カラーコードが大きい方が先に表示される', () => {
      const cards = [
        createCard(100, 0, 1), // 茶トラ×2（レアリティ3）
        createCard(101, 0, 1),
        createCard(102, 6, 1), // キジトラ×2（レアリティ2）
        createCard(103, 6, 0),
        createCard(104, 2, 1), // 白猫
      ];
      const role = calculateRole(cards);
      expect(role.type).toBe('twoPair');
      // sortedColorCountsはレアリティ順（茶トラ > キジトラ）でソートされる
      expect(role.name).toBe('茶トラ×キジトラツーペア');
    });
  });

  describe('ワンペア（2枚同色、残り3枚が異なる色）', () => {
    it('サビワンペア（21pt）を判定できる', () => {
      const cards = [
        createCard(65, 11, 1), // サビ×2
        createCard(66, 11, 0),
        createCard(67, 0, 1),  // 茶トラ
        createCard(68, 1, 1),  // 三毛
        createCard(69, 2, 1),  // 白猫
      ];
      const role = calculateRole(cards);
      expect(role.type).toBe('onePair');
      expect(role.name).toBe('サビワンペア');
      expect(role.points).toBe(21);
      expect(role.matchingCardIds).toEqual([65, 66]);
    });

    it('茶白ワンペア（2pt）を判定できる', () => {
      const cards = [
        createCard(70, 4, 1), // 茶白×2
        createCard(71, 4, 1),
        createCard(72, 0, 1), // 茶トラ
        createCard(73, 1, 1), // 三毛
        createCard(74, 2, 1), // 白猫
      ];
      const role = calculateRole(cards);
      expect(role.type).toBe('onePair');
      expect(role.name).toBe('茶白ワンペア');
      expect(role.points).toBe(2);
    });
  });

  describe('ノーペア', () => {
    it('ノーペア（0pt）を判定できる', () => {
      // 5色すべて異なり、毛の長さも混在（ファー役不成立）
      const cards = [
        createCard(75, 0, 1), // 茶トラ、短毛
        createCard(76, 1, 0), // 三毛、長毛
        createCard(77, 2, 1), // 白猫、短毛
        createCard(78, 3, 0), // 黒猫、長毛
        createCard(79, 4, 1), // 茶白、短毛
      ];
      const role = calculateRole(cards);
      expect(role.type).toBe('noPair');
      expect(role.name).toBe('ノーペア');
      expect(role.points).toBe(0);
      expect(role.matchingCardIds).toEqual([]);
    });

    it('ショートファーが成立する場合はノーペアにならない', () => {
      // 5色すべて異なるが、すべて短毛→ショートファー（1pt）
      const cards = [
        createCard(80, 0, 1), // 茶トラ、短毛
        createCard(81, 1, 1), // 三毛、短毛
        createCard(82, 2, 1), // 白猫、短毛
        createCard(83, 3, 1), // 黒猫、短毛
        createCard(84, 4, 1), // 茶白、短毛
      ];
      const role = calculateRole(cards);
      expect(role.type).toBe('fur');
      expect(role.name).toBe('ショートファー');
      expect(role.points).toBe(1);
    });
  });

  describe('複数役成立時の優先順位', () => {
    it('フラッシュとファーが成立する場合、ポイントの高い方を返す（フラッシュ優先）', () => {
      const cards = [
        createCard(80, 11, 0), // サビ×5、長毛×5
        createCard(81, 11, 0),
        createCard(82, 11, 0),
        createCard(83, 11, 0),
        createCard(84, 11, 0),
      ];
      const role = calculateRole(cards);
      // サビフラッシュ（300pt）> ロングファー（100pt）
      expect(role.type).toBe('flush');
      expect(role.points).toBe(300);
    });

    it('ショートファーとワンペアが成立する場合、ポイントの高い方を返す（ワンペア優先）', () => {
      const cards = [
        createCard(85, 0, 1), // 茶トラ×2、短毛×5
        createCard(86, 0, 1),
        createCard(87, 1, 1), // 三毛
        createCard(88, 2, 1), // 白猫
        createCard(89, 3, 1), // 黒猫
      ];
      const role = calculateRole(cards);
      // 茶トラワンペア（5pt）> ショートファー（1pt）
      expect(role.type).toBe('onePair');
      expect(role.points).toBe(5);
    });

    it('フォーカラーとスリーカラーが成立する場合、ポイントの高い方を返す（フォーカラー優先）', () => {
      const cards = [
        createCard(90, 11, 1), // サビ×4
        createCard(91, 11, 1),
        createCard(92, 11, 0),
        createCard(93, 11, 1),
        createCard(94, 0, 1),  // 茶トラ
      ];
      const role = calculateRole(cards);
      // サビフォーカラー（277pt）> サビスリーカラー（112pt）
      expect(role.type).toBe('fourColor');
      expect(role.points).toBe(277);
    });
  });
});

describe('determineWinner', () => {
  const createRole = (type: any, points: number): Role => ({
    type,
    name: 'テスト役',
    points,
    matchingCardIds: [],
  });

  it('プレイヤーのポイントが高い場合、winを返す', () => {
    const playerRole = createRole('flush', 300);
    const dealerRole = createRole('onePair', 5);
    expect(determineWinner(playerRole, dealerRole)).toBe('win');
  });

  it('ディーラーのポイントが高い場合、loseを返す', () => {
    const playerRole = createRole('onePair', 5);
    const dealerRole = createRole('flush', 300);
    expect(determineWinner(playerRole, dealerRole)).toBe('lose');
  });

  it('両者ともノーペア（0pt）の場合、drawを返す', () => {
    const playerRole = createRole('noPair', 0);
    const dealerRole = createRole('noPair', 0);
    expect(determineWinner(playerRole, dealerRole)).toBe('draw');
  });

  it('同じポイントの場合、drawを返す（念のため）', () => {
    const playerRole = createRole('onePair', 5);
    const dealerRole = createRole('onePair', 5);
    expect(determineWinner(playerRole, dealerRole)).toBe('draw');
  });
});

describe('calculateScoreChange', () => {
  const createRole = (type: Role['type'], points: number): Role => ({
    type,
    name: 'テスト役',
    points,
    matchingCardIds: [],
  });

  describe('勝利時', () => {
    it('プレイヤーが勝利した場合、プレイヤーの役ポイントを返す', () => {
      const playerRole = createRole('flush', 300);
      const dealerRole = createRole('onePair', 5);
      expect(calculateScoreChange('win', playerRole, dealerRole)).toBe(300);
    });

    it('低ポイント役で勝利した場合でも、自分の役ポイントを返す', () => {
      const playerRole = createRole('onePair', 5);
      const dealerRole = createRole('noPair', 0);
      expect(calculateScoreChange('win', playerRole, dealerRole)).toBe(5);
    });
  });

  describe('敗北時', () => {
    it('プレイヤーが敗北した場合、ディーラーの役ポイントのマイナス値を返す', () => {
      const playerRole = createRole('onePair', 5);
      const dealerRole = createRole('flush', 300);
      expect(calculateScoreChange('lose', playerRole, dealerRole)).toBe(-300);
    });

    it('低ポイント役に負けた場合、相手のポイント分だけマイナス', () => {
      const playerRole = createRole('noPair', 0);
      const dealerRole = createRole('onePair', 5);
      expect(calculateScoreChange('lose', playerRole, dealerRole)).toBe(-5);
    });
  });

  describe('引き分け時', () => {
    it('引き分けの場合、0を返す', () => {
      const playerRole = createRole('noPair', 0);
      const dealerRole = createRole('noPair', 0);
      expect(calculateScoreChange('draw', playerRole, dealerRole)).toBe(0);
    });

    it('同ポイント引き分けでも0を返す', () => {
      const playerRole = createRole('onePair', 5);
      const dealerRole = createRole('onePair', 5);
      expect(calculateScoreChange('draw', playerRole, dealerRole)).toBe(0);
    });
  });
});
