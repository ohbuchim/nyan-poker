import { describe, it, expect } from 'vitest';
import { initialGameState, type GameState } from '../game';

describe('game types', () => {
  describe('initialGameState', () => {
    it('should have correct initial mode', () => {
      expect(initialGameState.mode).toBe('solo');
    });

    it('should have correct initial phase', () => {
      expect(initialGameState.phase).toBe('dealing');
    });

    it('should start at round 1', () => {
      expect(initialGameState.round).toBe(1);
    });

    it('should have 0 initial score', () => {
      expect(initialGameState.totalScore).toBe(0);
    });

    it('should have empty hands', () => {
      expect(initialGameState.playerHand).toEqual([]);
      expect(initialGameState.dealerHand).toEqual([]);
    });

    it('should have no selected cards', () => {
      expect(initialGameState.selectedCardIds).toEqual([]);
    });

    it('should not be exchanged yet', () => {
      expect(initialGameState.exchanged).toBe(false);
    });

    it('should have empty history', () => {
      expect(initialGameState.history).toEqual([]);
    });

    it('should have no roles initially', () => {
      expect(initialGameState.currentRole).toBeUndefined();
      expect(initialGameState.dealerRole).toBeUndefined();
    });

    it('should be a valid GameState type', () => {
      const state: GameState = initialGameState;
      expect(state).toBeDefined();
    });
  });
});
