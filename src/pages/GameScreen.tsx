import React, { useState, useCallback, useEffect } from 'react';
import type { Card, Role, GamePhase, RoundHistory } from '../types';
import { Hand } from '../components/card';
import { GameHeader, RoleDisplay, ActionButtons } from '../components/game';
import { drawCards } from '../utils/deck';
import { calculateRole } from '../utils/roleCalculator';
import styles from './GameScreen.module.css';

const MAX_SELECTABLE_CARDS = 3;
const TOTAL_ROUNDS = 5;
const HAND_SIZE = 5;
const EXCHANGE_ANIMATION_DELAY = 400;

export interface GameScreenProps {
  onGameEnd: (finalScore: number, history: RoundHistory[]) => void;
  onRulesClick?: () => void;
}

export const GameScreen: React.FC<GameScreenProps> = ({
  onGameEnd,
  onRulesClick,
}) => {
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [phase, setPhase] = useState<GamePhase>('dealing');
  const [hand, setHand] = useState<Card[]>([]);
  const [selectedCardIds, setSelectedCardIds] = useState<number[]>([]);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [history, setHistory] = useState<RoundHistory[]>([]);
  const [newCardIds, setNewCardIds] = useState<number[]>([]);
  const [usedCardIds, setUsedCardIds] = useState<number[]>([]);

  const dealHand = useCallback(() => {
    setPhase('dealing');
    setSelectedCardIds([]);
    setCurrentRole(null);
    setNewCardIds([]);

    const newHand = drawCards(HAND_SIZE, usedCardIds);
    setHand(newHand);
    setUsedCardIds((prev) => [...prev, ...newHand.map((c) => c.id)]);
    // Phase transition to 'selecting' is now handled by onDealAnimationComplete
  }, [usedCardIds]);

  // Handle deal animation completion
  const handleDealAnimationComplete = useCallback(() => {
    if (phase === 'dealing') {
      setPhase('selecting');
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'dealing' && hand.length === 0) {
      dealHand();
    }
  }, [phase, hand.length, dealHand]);

  const handleCardClick = useCallback(
    (cardId: number) => {
      if (phase !== 'selecting') return;

      setSelectedCardIds((prev) => {
        if (prev.includes(cardId)) {
          return prev.filter((id) => id !== cardId);
        } else if (prev.length < MAX_SELECTABLE_CARDS) {
          return [...prev, cardId];
        }
        return prev;
      });
    },
    [phase]
  );

  const handleExchange = useCallback(() => {
    if (phase !== 'selecting' || selectedCardIds.length === 0) return;

    setPhase('exchanging');

    const newCards = drawCards(selectedCardIds.length, usedCardIds);
    setUsedCardIds((prev) => [...prev, ...newCards.map((c) => c.id)]);
    setNewCardIds(newCards.map((c) => c.id));

    setTimeout(() => {
      setHand((prev) => {
        const newHand = [...prev];
        let newCardIndex = 0;
        for (let i = 0; i < newHand.length; i++) {
          if (selectedCardIds.includes(newHand[i].id)) {
            newHand[i] = newCards[newCardIndex];
            newCardIndex++;
          }
        }
        return newHand;
      });

      setSelectedCardIds([]);
      revealRole();
    }, EXCHANGE_ANIMATION_DELAY);
  }, [phase, selectedCardIds, usedCardIds]);

  const handleSkipExchange = useCallback(() => {
    if (phase !== 'selecting') return;
    setSelectedCardIds([]);
    revealRole();
  }, [phase]);

  const revealRole = useCallback(() => {
    setPhase('revealing');

    setTimeout(() => {
      const role = calculateRole(hand.length === 5 ? hand : []);
      setCurrentRole(role);

      const roundHistory: RoundHistory = {
        round,
        playerRole: role,
        playerPoints: role.points,
      };
      setHistory((prev) => [...prev, roundHistory]);
      setScore((prev) => prev + role.points);
      setPhase('result');
    }, 100);
  }, [hand, round]);

  useEffect(() => {
    if (phase === 'revealing' && hand.length === 5 && !currentRole) {
      const role = calculateRole(hand);
      setCurrentRole(role);

      const roundHistory: RoundHistory = {
        round,
        playerRole: role,
        playerPoints: role.points,
      };
      setHistory((prev) => [...prev, roundHistory]);
      setScore((prev) => prev + role.points);
      setPhase('result');
    }
  }, [phase, hand, currentRole, round]);

  const handleClearSelection = useCallback(() => {
    setSelectedCardIds([]);
  }, []);

  const handleNextRound = useCallback(() => {
    if (round >= TOTAL_ROUNDS) return;

    setRound((prev) => prev + 1);
    setHand([]);
    setUsedCardIds([]);
    setPhase('dealing');
  }, [round]);

  const handleFinish = useCallback(() => {
    onGameEnd(score, history);
  }, [score, history, onGameEnd]);

  const isInteractive = phase === 'selecting';
  const isExchanged = phase === 'result' || phase === 'revealing';
  const isLastRound = round === TOTAL_ROUNDS;

  const getAnimationType = () => {
    if (phase === 'dealing') return 'deal' as const;
    return 'none' as const;
  };

  return (
    <div className={styles.screen}>
      <GameHeader
        round={round}
        totalRounds={TOTAL_ROUNDS}
        score={score}
        onRulesClick={onRulesClick}
      />

      <div className={styles['hand-area']}>
        <div className={styles['hand-label']}>あなたの手札</div>
        <Hand
          cards={hand}
          showCards={true}
          selectedCardIds={selectedCardIds}
          matchingCardIds={currentRole?.matchingCardIds || []}
          onCardClick={isInteractive ? handleCardClick : undefined}
          disabled={!isInteractive}
          animationType={getAnimationType()}
          newCardIds={newCardIds}
          onDealAnimationComplete={handleDealAnimationComplete}
        />
      </div>

      <RoleDisplay
        role={currentRole}
        visible={phase === 'result' || (phase === 'revealing' && currentRole !== null)}
      />

      <ActionButtons
        selectedCount={selectedCardIds.length}
        maxSelectable={MAX_SELECTABLE_CARDS}
        exchanged={isExchanged}
        isRevealing={phase === 'revealing' && !currentRole}
        isLastRound={isLastRound}
        onExchange={handleExchange}
        onSkipExchange={handleSkipExchange}
        onClearSelection={handleClearSelection}
        onNextRound={handleNextRound}
        onFinish={handleFinish}
      />
    </div>
  );
};
