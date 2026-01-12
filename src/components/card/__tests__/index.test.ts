import { describe, it, expect } from 'vitest';
import { Card, CardInfo, Hand } from '../index';
import type { CardProps, CardAnimationType, CardInfoProps, HandProps } from '../index';

describe('Card components exports', () => {
  it('exports Card component', () => {
    expect(Card).toBeDefined();
    expect(typeof Card).toBe('function');
  });

  it('exports CardInfo component', () => {
    expect(CardInfo).toBeDefined();
    expect(typeof CardInfo).toBe('function');
  });

  it('exports Hand component', () => {
    expect(Hand).toBeDefined();
    expect(typeof Hand).toBe('function');
  });

  // Type checking tests (compile-time verification)
  it('CardProps type is properly defined', () => {
    const props: CardProps = {
      card: { id: 0, image: '/test.jpg', color: 0, fur: 0 },
      isBack: false,
      isSelected: false,
      isMatching: false,
      isNotMatching: false,
      animationType: 'none',
      animationDelay: 0,
      onClick: () => {},
      disabled: false,
      className: 'test',
    };
    expect(props).toBeDefined();
  });

  it('CardAnimationType type accepts valid values', () => {
    const types: CardAnimationType[] = ['deal', 'enter', 'exchange', 'none'];
    expect(types).toHaveLength(4);
  });

  it('CardInfoProps type is properly defined', () => {
    const props: CardInfoProps = {
      color: 0,
      fur: 0,
      isDimmed: false,
      isHighlighted: false,
      className: 'test',
    };
    expect(props).toBeDefined();
  });

  it('HandProps type is properly defined', () => {
    const props: HandProps = {
      cards: [],
      showCards: true,
      selectedCardIds: [],
      matchingCardIds: [],
      onCardClick: () => {},
      disabled: false,
      isDealer: false,
      animationType: 'none',
      newCardIds: [],
      className: 'test',
    };
    expect(props).toBeDefined();
  });
});
