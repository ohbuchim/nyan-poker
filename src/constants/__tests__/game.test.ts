// constants/__tests__/game.test.ts

import { describe, it, expect } from 'vitest';
import {
  TOTAL_ROUNDS,
  HAND_SIZE,
  MAX_SELECTABLE_CARDS,
  TOTAL_CARDS,
  COLOR_COUNT,
  FUR_COUNT,
  ICONS,
} from '../game';

describe('Game constants', () => {
  describe('ゲームルール定数', () => {
    it('TOTAL_ROUNDSは5ラウンドである', () => {
      expect(TOTAL_ROUNDS).toBe(5);
    });

    it('HAND_SIZEは5枚である', () => {
      expect(HAND_SIZE).toBe(5);
    });

    it('MAX_SELECTABLE_CARDSは3枚である', () => {
      expect(MAX_SELECTABLE_CARDS).toBe(3);
    });
  });

  describe('カード定数', () => {
    it('TOTAL_CARDSは229枚である', () => {
      expect(TOTAL_CARDS).toBe(229);
    });

    it('COLOR_COUNTは12種類である', () => {
      expect(COLOR_COUNT).toBe(12);
    });

    it('FUR_COUNTは2種類である（長毛・短毛）', () => {
      expect(FUR_COUNT).toBe(2);
    });
  });

  describe('ICONSオブジェクト', () => {
    it('ICONS.DEALERはシルクハット絵文字である', () => {
      expect(ICONS.DEALER).toBe('\uD83C\uDFA9');
    });

    it('ICONS.PLAYERは猫絵文字である', () => {
      expect(ICONS.PLAYER).toBe('\uD83D\uDC31');
    });

    it('ICONSはas constで定義されており読み取り専用である', () => {
      // TypeScriptの型チェックで保証されているが、
      // ランタイムでも存在を確認
      expect(ICONS).toHaveProperty('DEALER');
      expect(ICONS).toHaveProperty('PLAYER');
    });
  });
});
