// context/GameContext.tsx

import {
  createContext,
  useContext,
  useReducer,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';

import type { Card, GameMode, GamePhase, Role, RoundHistory } from '../types';
import { initialGameState } from '../types';
import type { GameState } from '../types';
import { drawCards } from '../utils/deck';
import { calculateRole, determineWinner } from '../utils/roleCalculator';
import { TOTAL_ROUNDS, HAND_SIZE } from '../constants';

/** アクション型 */
type GameAction =
  | { type: 'START_GAME'; payload: { mode: GameMode } }
  | { type: 'SET_HANDS'; payload: { playerHand: Card[]; dealerHand: Card[] } }
  | { type: 'SET_PHASE'; payload: { phase: GamePhase } }
  | { type: 'SELECT_CARD'; payload: { cardId: number } }
  | {
      type: 'EXCHANGE_CARDS';
      payload: { newCards: Card[]; exchangedCardIds: number[] };
    }
  | { type: 'SKIP_EXCHANGE' }
  | {
      type: 'SET_ROLES';
      payload: { playerRole: Role; dealerRole: Role | null };
    }
  | {
      type: 'UPDATE_SCORES';
      payload: {
        playerPoints: number;
        dealerPoints: number;
        result?: 'win' | 'lose' | 'draw';
      };
    }
  | { type: 'NEXT_ROUND' }
  | { type: 'FINISH_GAME' }
  | { type: 'RESET_GAME' };

/**
 * ゲーム状態のReducer
 */
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      return {
        ...initialGameState,
        mode: action.payload.mode,
        phase: 'dealing',
      };
    }

    case 'SET_HANDS': {
      const { playerHand, dealerHand } = action.payload;
      // 除外リストに追加
      const newExcludedIds = [
        ...playerHand.map((c) => c.id),
        ...dealerHand.map((c) => c.id),
      ];
      return {
        ...state,
        playerHand,
        dealerHand,
        excludedCardIds: newExcludedIds,
        phase: 'selecting',
      };
    }

    case 'SET_PHASE': {
      return {
        ...state,
        phase: action.payload.phase,
      };
    }

    case 'SELECT_CARD': {
      const { cardId } = action.payload;
      const isSelected = state.selectedCardIds.includes(cardId);
      const newSelectedIds = isSelected
        ? state.selectedCardIds.filter((id) => id !== cardId)
        : [...state.selectedCardIds, cardId];
      return {
        ...state,
        selectedCardIds: newSelectedIds,
      };
    }

    case 'EXCHANGE_CARDS': {
      const { newCards, exchangedCardIds } = action.payload;
      // 交換されたカードを新しいカードに置き換え
      const newPlayerHand = state.playerHand.map((card) => {
        const index = exchangedCardIds.indexOf(card.id);
        if (index !== -1) {
          return newCards[index];
        }
        return card;
      });
      // 除外リストに新しいカードを追加
      const newExcludedIds = [
        ...state.excludedCardIds,
        ...newCards.map((c) => c.id),
      ];
      return {
        ...state,
        playerHand: newPlayerHand,
        selectedCardIds: [],
        excludedCardIds: newExcludedIds,
        phase: 'exchanging',
      };
    }

    case 'SKIP_EXCHANGE': {
      return {
        ...state,
        selectedCardIds: [],
        phase: 'revealing',
      };
    }

    case 'SET_ROLES': {
      return {
        ...state,
        playerRole: action.payload.playerRole,
        dealerRole: action.payload.dealerRole,
        phase: 'result',
      };
    }

    case 'UPDATE_SCORES': {
      const { playerPoints, dealerPoints, result } = action.payload;
      const roundResult: RoundHistory = {
        round: state.round,
        playerRole: state.playerRole!,
        playerPoints,
        ...(state.mode === 'battle' && {
          dealerRole: state.dealerRole!,
          dealerPoints,
          result,
        }),
      };
      return {
        ...state,
        playerScore: state.playerScore + playerPoints,
        dealerScore: state.dealerScore + dealerPoints,
        roundHistory: [...state.roundHistory, roundResult],
      };
    }

    case 'NEXT_ROUND': {
      if (state.round >= TOTAL_ROUNDS) {
        return {
          ...state,
          phase: 'finished',
        };
      }
      return {
        ...state,
        round: state.round + 1,
        phase: 'dealing',
        playerHand: [],
        dealerHand: [],
        selectedCardIds: [],
        playerRole: null,
        dealerRole: null,
        excludedCardIds: [],
      };
    }

    case 'FINISH_GAME': {
      return {
        ...state,
        phase: 'finished',
      };
    }

    case 'RESET_GAME': {
      return initialGameState;
    }

    default:
      return state;
  }
}

/** GameContext の値の型 */
interface GameContextValue {
  state: GameState;
  startGame: (mode: GameMode) => void;
  selectCard: (cardId: number) => void;
  exchangeCards: () => Promise<void>;
  skipExchange: () => void;
  nextRound: () => void;
  finishGame: () => void;
  resetGame: () => void;
}

/** GameContext */
const GameContext = createContext<GameContextValue | null>(null);

/** GameContext の Provider Props */
interface GameProviderProps {
  children: ReactNode;
}

/**
 * GameContext Provider
 * ゲーム状態を管理し、アクションを提供する
 */
export function GameProvider({ children }: GameProviderProps) {
  const [state, dispatch] = useReducer(gameReducer, initialGameState);

  /**
   * ゲーム開始
   * 指定されたモードでゲームを開始し、カードを配布する
   */
  const startGame = useCallback((mode: GameMode) => {
    dispatch({ type: 'START_GAME', payload: { mode } });

    // カード配布
    const playerHand = drawCards(HAND_SIZE, []);
    const excludeForDealer = playerHand.map((c) => c.id);
    const dealerHand =
      mode === 'battle' ? drawCards(HAND_SIZE, excludeForDealer) : [];

    dispatch({
      type: 'SET_HANDS',
      payload: { playerHand, dealerHand },
    });
  }, []);

  /**
   * カード選択/解除
   * 指定されたカードIDの選択状態をトグルする
   */
  const selectCard = useCallback((cardId: number) => {
    dispatch({ type: 'SELECT_CARD', payload: { cardId } });
  }, []);

  /**
   * カード交換実行
   * 選択されたカードを新しいカードと交換し、役を判定する
   */
  const exchangeCards = useCallback(async () => {
    if (state.selectedCardIds.length === 0) {
      // 選択なしの場合は交換スキップと同じ
      dispatch({ type: 'SKIP_EXCHANGE' });
    } else {
      // 新しいカードを引く
      const newCards = drawCards(state.selectedCardIds.length, state.excludedCardIds);

      dispatch({
        type: 'EXCHANGE_CARDS',
        payload: {
          newCards,
          exchangedCardIds: state.selectedCardIds,
        },
      });
    }

    // 交換アニメーション用の遅延
    await new Promise((resolve) => setTimeout(resolve, 300));

    // 現在の手札を取得（交換後の状態）
    dispatch({ type: 'SET_PHASE', payload: { phase: 'revealing' } });
  }, [state.selectedCardIds, state.excludedCardIds]);

  /**
   * 交換スキップ
   * カードを交換せずに役判定に進む
   */
  const skipExchange = useCallback(() => {
    dispatch({ type: 'SKIP_EXCHANGE' });
  }, []);

  /**
   * 次のラウンドへ
   * スコアを更新し、次のラウンドを開始する
   */
  const nextRound = useCallback(() => {
    // 役を判定
    const playerRole = calculateRole(state.playerHand);
    const dealerRole =
      state.mode === 'battle' ? calculateRole(state.dealerHand) : null;

    dispatch({
      type: 'SET_ROLES',
      payload: { playerRole, dealerRole },
    });

    // スコア計算
    let playerPoints = 0;
    let dealerPoints = 0;
    let result: 'win' | 'lose' | 'draw' | undefined;

    if (state.mode === 'solo') {
      playerPoints = playerRole.points;
    } else if (state.mode === 'battle' && dealerRole) {
      result = determineWinner(playerRole, dealerRole);
      if (result === 'win') {
        playerPoints = playerRole.points;
        dealerPoints = -playerRole.points;
      } else if (result === 'lose') {
        playerPoints = -dealerRole.points;
        dealerPoints = dealerRole.points;
      }
      // draw の場合は両方0
    }

    dispatch({
      type: 'UPDATE_SCORES',
      payload: { playerPoints, dealerPoints, result },
    });

    // 次のラウンドへ進む（または終了）
    dispatch({ type: 'NEXT_ROUND' });

    // 次のラウンドの場合はカードを配布
    if (state.round < TOTAL_ROUNDS) {
      setTimeout(() => {
        const playerHand = drawCards(HAND_SIZE, []);
        const excludeForDealer = playerHand.map((c) => c.id);
        const dealerHand =
          state.mode === 'battle'
            ? drawCards(HAND_SIZE, excludeForDealer)
            : [];

        dispatch({
          type: 'SET_HANDS',
          payload: { playerHand, dealerHand },
        });
      }, 100);
    }
  }, [state.playerHand, state.dealerHand, state.mode, state.round]);

  /**
   * ゲーム終了
   * ゲームを終了状態にする
   */
  const finishGame = useCallback(() => {
    dispatch({ type: 'FINISH_GAME' });
  }, []);

  /**
   * ゲームリセット
   * ゲーム状態を初期状態に戻す
   */
  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  const value = useMemo(
    () => ({
      state,
      startGame,
      selectCard,
      exchangeCards,
      skipExchange,
      nextRound,
      finishGame,
      resetGame,
    }),
    [
      state,
      startGame,
      selectCard,
      exchangeCards,
      skipExchange,
      nextRound,
      finishGame,
      resetGame,
    ]
  );

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

/**
 * GameContext を使用するカスタムフック
 * Provider の外で使用された場合はエラーをスローする
 */
export function useGame(): GameContextValue {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}

export { GameContext };
