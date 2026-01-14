// context/__tests__/GameContext.test.tsx

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import type { ReactNode } from 'react';
import { GameProvider, useGame } from '../GameContext';
import { initialGameState } from '../../types';
import type { GameState } from '../../types';
import * as deckModule from '../../utils/deck';
import type { Card } from '../../types';

/** テスト用のカード生成ヘルパー */
function createTestCard(id: number, color: number, fur: number): Card {
  return {
    id,
    image: `/images/image_${String(id).padStart(3, '0')}.jpg`,
    color: color as any,
    fur: fur as any,
  };
}

/** テスト用の手札（5枚） */
const mockPlayerHand: Card[] = [
  createTestCard(0, 0, 1),  // 茶トラ、短毛
  createTestCard(1, 0, 1),  // 茶トラ、短毛
  createTestCard(2, 1, 1),  // 三毛、短毛
  createTestCard(3, 2, 1),  // 白猫、短毛
  createTestCard(4, 3, 1),  // 黒猫、短毛
];

/** テスト用のディーラー手札（5枚） */
const mockDealerHand: Card[] = [
  createTestCard(5, 4, 1),  // 茶白、短毛
  createTestCard(6, 4, 1),  // 茶白、短毛
  createTestCard(7, 5, 1),  // キジ白、短毛
  createTestCard(8, 6, 1),  // キジトラ、短毛
  createTestCard(9, 7, 1),  // 白黒、短毛
];

/** Wrapper コンポーネント */
function wrapper({ children }: { children: ReactNode }) {
  return <GameProvider>{children}</GameProvider>;
}

describe('GameContext', () => {
  beforeEach(() => {
    vi.spyOn(deckModule, 'drawCards');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('初期状態', () => {
    it('初期状態が正しく設定されている', () => {
      const { result } = renderHook(() => useGame(), { wrapper });

      expect(result.current.state).toEqual(initialGameState);
    });

    it('初期状態のプロパティが正しい', () => {
      const { result } = renderHook(() => useGame(), { wrapper });

      expect(result.current.state.mode).toBe('solo');
      expect(result.current.state.phase).toBe('dealing');
      expect(result.current.state.round).toBe(1);
      expect(result.current.state.playerHand).toEqual([]);
      expect(result.current.state.dealerHand).toEqual([]);
      expect(result.current.state.selectedCardIds).toEqual([]);
      expect(result.current.state.playerRole).toBeNull();
      expect(result.current.state.dealerRole).toBeNull();
      expect(result.current.state.playerScore).toBe(0);
      expect(result.current.state.dealerScore).toBe(0);
      expect(result.current.state.roundHistory).toEqual([]);
      expect(result.current.state.excludedCardIds).toEqual([]);
    });
  });

  describe('startGame', () => {
    it('ひとりモードでゲームを開始できる', () => {
      vi.mocked(deckModule.drawCards).mockReturnValueOnce(mockPlayerHand);

      const { result } = renderHook(() => useGame(), { wrapper });

      act(() => {
        result.current.startGame('solo');
      });

      expect(result.current.state.mode).toBe('solo');
      expect(result.current.state.phase).toBe('selecting');
      expect(result.current.state.round).toBe(1);
      expect(result.current.state.playerHand).toEqual(mockPlayerHand);
      expect(result.current.state.dealerHand).toEqual([]);
    });

    it('対戦モードでゲームを開始できる', () => {
      vi.mocked(deckModule.drawCards)
        .mockReturnValueOnce(mockPlayerHand)
        .mockReturnValueOnce(mockDealerHand);

      const { result } = renderHook(() => useGame(), { wrapper });

      act(() => {
        result.current.startGame('battle');
      });

      expect(result.current.state.mode).toBe('battle');
      expect(result.current.state.phase).toBe('selecting');
      expect(result.current.state.playerHand).toEqual(mockPlayerHand);
      expect(result.current.state.dealerHand).toEqual(mockDealerHand);
    });

    it('ゲーム開始時に除外リストが設定される', () => {
      vi.mocked(deckModule.drawCards)
        .mockReturnValueOnce(mockPlayerHand)
        .mockReturnValueOnce(mockDealerHand);

      const { result } = renderHook(() => useGame(), { wrapper });

      act(() => {
        result.current.startGame('battle');
      });

      const expectedExcludedIds = [
        ...mockPlayerHand.map((c) => c.id),
        ...mockDealerHand.map((c) => c.id),
      ];
      expect(result.current.state.excludedCardIds).toEqual(expectedExcludedIds);
    });
  });

  describe('selectCard', () => {
    it('カードを選択できる', () => {
      vi.mocked(deckModule.drawCards).mockReturnValueOnce(mockPlayerHand);

      const { result } = renderHook(() => useGame(), { wrapper });

      act(() => {
        result.current.startGame('solo');
      });

      act(() => {
        result.current.selectCard(0);
      });

      expect(result.current.state.selectedCardIds).toContain(0);
    });

    it('選択済みカードを解除できる', () => {
      vi.mocked(deckModule.drawCards).mockReturnValueOnce(mockPlayerHand);

      const { result } = renderHook(() => useGame(), { wrapper });

      act(() => {
        result.current.startGame('solo');
      });

      act(() => {
        result.current.selectCard(0);
      });

      expect(result.current.state.selectedCardIds).toContain(0);

      act(() => {
        result.current.selectCard(0);
      });

      expect(result.current.state.selectedCardIds).not.toContain(0);
    });

    it('複数のカードを選択できる', () => {
      vi.mocked(deckModule.drawCards).mockReturnValueOnce(mockPlayerHand);

      const { result } = renderHook(() => useGame(), { wrapper });

      act(() => {
        result.current.startGame('solo');
      });

      act(() => {
        result.current.selectCard(0);
        result.current.selectCard(1);
        result.current.selectCard(2);
      });

      expect(result.current.state.selectedCardIds).toEqual([0, 1, 2]);
    });
  });

  describe('exchangeCards', () => {
    it('選択したカードを交換できる', async () => {
      const newCards: Card[] = [
        createTestCard(10, 8, 1),
        createTestCard(11, 9, 1),
      ];

      vi.mocked(deckModule.drawCards)
        .mockReturnValueOnce(mockPlayerHand)
        .mockReturnValueOnce(newCards);

      const { result } = renderHook(() => useGame(), { wrapper });

      act(() => {
        result.current.startGame('solo');
      });

      act(() => {
        result.current.selectCard(0);
        result.current.selectCard(1);
      });

      await act(async () => {
        await result.current.exchangeCards();
      });

      // 交換後のフェーズ
      expect(result.current.state.phase).toBe('revealing');

      // 選択がクリアされている
      expect(result.current.state.selectedCardIds).toEqual([]);
    });

    it('カードを選択していない場合はスキップと同じ動作', async () => {
      vi.mocked(deckModule.drawCards).mockReturnValueOnce(mockPlayerHand);

      const { result } = renderHook(() => useGame(), { wrapper });

      act(() => {
        result.current.startGame('solo');
      });

      await act(async () => {
        await result.current.exchangeCards();
      });

      expect(result.current.state.phase).toBe('revealing');
    });
  });

  describe('skipExchange', () => {
    it('交換をスキップできる', () => {
      vi.mocked(deckModule.drawCards).mockReturnValueOnce(mockPlayerHand);

      const { result } = renderHook(() => useGame(), { wrapper });

      act(() => {
        result.current.startGame('solo');
      });

      act(() => {
        result.current.selectCard(0);
      });

      act(() => {
        result.current.skipExchange();
      });

      expect(result.current.state.phase).toBe('revealing');
      expect(result.current.state.selectedCardIds).toEqual([]);
    });
  });

  describe('nextRound', () => {
    it('次のラウンドに進める（ひとりモード）', async () => {
      vi.mocked(deckModule.drawCards)
        .mockReturnValueOnce(mockPlayerHand)
        .mockReturnValueOnce(mockPlayerHand);  // 次のラウンド用

      const { result } = renderHook(() => useGame(), { wrapper });

      act(() => {
        result.current.startGame('solo');
      });

      act(() => {
        result.current.skipExchange();
      });

      act(() => {
        result.current.nextRound();
      });

      // ラウンドが進む
      await waitFor(() => {
        expect(result.current.state.round).toBe(2);
      });

      // スコアが更新される
      expect(result.current.state.roundHistory.length).toBe(1);
    });

    it('5ラウンド目でゲーム終了', async () => {
      vi.mocked(deckModule.drawCards).mockReturnValue(mockPlayerHand);

      const { result } = renderHook(() => useGame(), { wrapper });

      act(() => {
        result.current.startGame('solo');
      });

      // 5ラウンドプレイ
      for (let i = 0; i < 5; i++) {
        act(() => {
          result.current.skipExchange();
        });
        act(() => {
          result.current.nextRound();
        });

        // 最終ラウンド以外は次のカード配布を待つ
        if (i < 4) {
          await waitFor(() => {
            expect(result.current.state.phase).toBe('selecting');
          });
        }
      }

      expect(result.current.state.phase).toBe('finished');
    });

    it('対戦モードで勝敗が判定される', () => {
      // プレイヤー: 茶トラ2枚（ワンペア: 5pt）
      const playerHandWithPair: Card[] = [
        createTestCard(0, 0, 1),
        createTestCard(1, 0, 1),
        createTestCard(2, 1, 1),
        createTestCard(3, 2, 1),
        createTestCard(4, 3, 1),
      ];

      // ディーラー: ノーペア（0pt）
      const dealerHandNoPair: Card[] = [
        createTestCard(5, 4, 1),
        createTestCard(6, 5, 1),
        createTestCard(7, 6, 1),
        createTestCard(8, 7, 1),
        createTestCard(9, 8, 1),
      ];

      vi.mocked(deckModule.drawCards)
        .mockReturnValueOnce(playerHandWithPair)
        .mockReturnValueOnce(dealerHandNoPair)
        .mockReturnValue(playerHandWithPair);

      const { result } = renderHook(() => useGame(), { wrapper });

      act(() => {
        result.current.startGame('battle');
      });

      act(() => {
        result.current.skipExchange();
      });

      act(() => {
        result.current.nextRound();
      });

      // ラウンド履歴に結果が記録される
      expect(result.current.state.roundHistory.length).toBe(1);
      expect(result.current.state.roundHistory[0].result).toBe('win');
    });

    it('対戦モードでプレイヤーが負けた場合のスコア計算', () => {
      // プレイヤー: ノーペア（0pt）
      const playerHandNoPair: Card[] = [
        createTestCard(0, 0, 1),
        createTestCard(1, 1, 1),
        createTestCard(2, 2, 1),
        createTestCard(3, 3, 1),
        createTestCard(4, 4, 1),
      ];

      // ディーラー: 茶白2枚（ワンペア: 5pt）
      const dealerHandWithPair: Card[] = [
        createTestCard(5, 5, 1),
        createTestCard(6, 5, 1),
        createTestCard(7, 6, 1),
        createTestCard(8, 7, 1),
        createTestCard(9, 8, 1),
      ];

      vi.mocked(deckModule.drawCards)
        .mockReturnValueOnce(playerHandNoPair)
        .mockReturnValueOnce(dealerHandWithPair)
        .mockReturnValue(playerHandNoPair);

      const { result } = renderHook(() => useGame(), { wrapper });

      act(() => {
        result.current.startGame('battle');
      });

      act(() => {
        result.current.skipExchange();
      });

      act(() => {
        result.current.nextRound();
      });

      // ラウンド履歴に敗北が記録される
      expect(result.current.state.roundHistory.length).toBe(1);
      expect(result.current.state.roundHistory[0].result).toBe('lose');

      // プレイヤーのスコアがマイナスになる（ディーラーの役ポイント分を失う）
      expect(result.current.state.playerScore).toBeLessThan(0);

      // ディーラーのスコアがプラスになる
      expect(result.current.state.dealerScore).toBeGreaterThan(0);
    });
  });

  describe('finishGame', () => {
    it('ゲームを終了状態にできる', () => {
      vi.mocked(deckModule.drawCards).mockReturnValueOnce(mockPlayerHand);

      const { result } = renderHook(() => useGame(), { wrapper });

      act(() => {
        result.current.startGame('solo');
      });

      act(() => {
        result.current.finishGame();
      });

      expect(result.current.state.phase).toBe('finished');
    });
  });

  describe('resetGame', () => {
    it('ゲームを初期状態にリセットできる', () => {
      vi.mocked(deckModule.drawCards).mockReturnValueOnce(mockPlayerHand);

      const { result } = renderHook(() => useGame(), { wrapper });

      act(() => {
        result.current.startGame('solo');
      });

      act(() => {
        result.current.resetGame();
      });

      expect(result.current.state).toEqual(initialGameState);
    });
  });

  describe('Provider外での使用', () => {
    it('Provider外で使用するとエラーがスローされる', () => {
      // コンソールエラーを抑制
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useGame());
      }).toThrow('useGame must be used within a GameProvider');

      consoleSpy.mockRestore();
    });
  });

  describe('状態遷移', () => {
    it('dealing -> selecting -> revealing -> result -> selecting の遷移', async () => {
      vi.mocked(deckModule.drawCards).mockReturnValue(mockPlayerHand);

      const { result } = renderHook(() => useGame(), { wrapper });

      // 初期: dealing
      expect(result.current.state.phase).toBe('dealing');

      // ゲーム開始: selecting
      act(() => {
        result.current.startGame('solo');
      });
      expect(result.current.state.phase).toBe('selecting');

      // 交換スキップ: revealing
      act(() => {
        result.current.skipExchange();
      });
      expect(result.current.state.phase).toBe('revealing');

      // 次のラウンド実行後、結果表示を経て次のラウンドへ
      act(() => {
        result.current.nextRound();
      });

      // 次のラウンドのカードが配布されるまで待機
      await waitFor(() => {
        expect(result.current.state.phase).toBe('selecting');
        expect(result.current.state.round).toBe(2);
      });
    });
  });
});
