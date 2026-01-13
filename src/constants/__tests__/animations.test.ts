// constants/__tests__/animations.test.ts

import { describe, it, expect } from 'vitest';
import {
  CARD_DEAL_DURATION,
  CARD_DEAL_INTERVAL,
  EXCHANGE_ANIMATION_DELAY,
  DEALER_EXCHANGE_DELAY,
  ROLE_HIGHLIGHT_DELAY,
  CARD_EXIT_ANIMATION_DURATION,
  calculateDealAnimationDuration,
} from '../animations';

describe('Animation constants', () => {
  describe('定数の値', () => {
    it('CARD_DEAL_DURATIONは300msである', () => {
      expect(CARD_DEAL_DURATION).toBe(300);
    });

    it('CARD_DEAL_INTERVALは100msである', () => {
      expect(CARD_DEAL_INTERVAL).toBe(100);
    });

    it('EXCHANGE_ANIMATION_DELAYは400msである', () => {
      expect(EXCHANGE_ANIMATION_DELAY).toBe(400);
    });

    it('DEALER_EXCHANGE_DELAYは800msである', () => {
      expect(DEALER_EXCHANGE_DELAY).toBe(800);
    });

    it('ROLE_HIGHLIGHT_DELAYは300msである', () => {
      expect(ROLE_HIGHLIGHT_DELAY).toBe(300);
    });

    it('CARD_EXIT_ANIMATION_DURATIONは300msである', () => {
      expect(CARD_EXIT_ANIMATION_DURATION).toBe(300);
    });
  });
});

describe('calculateDealAnimationDuration', () => {
  it('カード0枚の場合は0msを返す', () => {
    expect(calculateDealAnimationDuration(0)).toBe(0);
  });

  it('カード1枚の場合はCARD_DEAL_DURATIONを返す', () => {
    // (1-1) * 100 + 300 = 300
    expect(calculateDealAnimationDuration(1)).toBe(300);
  });

  it('カード5枚の場合は正しい時間を返す', () => {
    // (5-1) * 100 + 300 = 400 + 300 = 700
    expect(calculateDealAnimationDuration(5)).toBe(700);
  });

  it('カード10枚の場合は正しい時間を返す', () => {
    // (10-1) * 100 + 300 = 900 + 300 = 1200
    expect(calculateDealAnimationDuration(10)).toBe(1200);
  });

  it('計算式が正しい: (cardCount - 1) * CARD_DEAL_INTERVAL + CARD_DEAL_DURATION', () => {
    for (let i = 1; i <= 10; i++) {
      const expected = (i - 1) * CARD_DEAL_INTERVAL + CARD_DEAL_DURATION;
      expect(calculateDealAnimationDuration(i)).toBe(expected);
    }
  });
});
