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

    it('should have 0 initial player score', () => {
      expect(initialGameState.playerScore).toBe(0);
    });

    it('should have 0 initial dealer score', () => {
      expect(initialGameState.dealerScore).toBe(0);
    });

    it('should have empty hands', () => {
      expect(initialGameState.playerHand).toEqual([]);
      expect(initialGameState.dealerHand).toEqual([]);
    });

    it('should have no selected cards', () => {
      expect(initialGameState.selectedCardIds).toEqual([]);
    });

    it('should have empty round history', () => {
      expect(initialGameState.roundHistory).toEqual([]);
    });

    it('should have empty excluded card ids', () => {
      expect(initialGameState.excludedCardIds).toEqual([]);
    });

    it('should have no roles initially', () => {
      expect(initialGameState.playerRole).toBeNull();
      expect(initialGameState.dealerRole).toBeNull();
    });

    it('should be a valid GameState type', () => {
      const state: GameState = initialGameState;
      expect(state).toBeDefined();
    });
  });
});
