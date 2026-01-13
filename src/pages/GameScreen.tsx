import React, { useState, useCallback, useEffect, useRef } from 'react';
import type { Card, Role, GamePhase, RoundHistory } from '../types';
import { Hand } from '../components/card';
import { GameHeader, RoleDisplay, ActionButtons } from '../components/game';
import { drawCards } from '../utils/deck';
import { calculateRole } from '../utils/roleCalculator';
import { useSound } from '../hooks';
import styles from './GameScreen.module.css';

const MAX_SELECTABLE_CARDS = 3;
const TOTAL_ROUNDS = 5;
const HAND_SIZE = 5;
const EXCHANGE_ANIMATION_DELAY = 400;
/** Delay before role highlight starts after exchange completes (ms) */
const ROLE_HIGHLIGHT_DELAY = 300;

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
  const [exchangingCardIds, setExchangingCardIds] = useState<number[]>([]);
  const [usedCardIds, setUsedCardIds] = useState<number[]>([]);

  // Sound hooks
  const { playDeal, playFlip } = useSound();
  const hasPlayedDealSoundRef = useRef(false);

  const dealHand = useCallback(() => {
    setPhase('dealing');
    setSelectedCardIds([]);
    setCurrentRole(null);
    setNewCardIds([]);
    setExchangingCardIds([]);
    hasPlayedDealSoundRef.current = false;

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

  // Play deal sound when cards are dealt
  useEffect(() => {
    if (phase === 'dealing' && hand.length > 0 && !hasPlayedDealSoundRef.current) {
      hasPlayedDealSoundRef.current = true;
      playDeal();
    }
  }, [phase, hand.length, playDeal]);

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

  const revealRole = useCallback((currentHand: Card[]) => {
    setPhase('revealing');

    // Wait for ROLE_HIGHLIGHT_DELAY before showing role highlight
    setTimeout(() => {
      const role = calculateRole(currentHand);
      setCurrentRole(role);

      const roundHistory: RoundHistory = {
        round,
        playerRole: role,
        playerPoints: role.points,
      };
      setHistory((prev) => [...prev, roundHistory]);
      setScore((prev) => prev + role.points);
      setPhase('result');
    }, ROLE_HIGHLIGHT_DELAY);
  }, [round]);

  const handleExchange = useCallback(() => {
    if (phase !== 'selecting' || selectedCardIds.length === 0) return;

    setPhase('exchanging');
    playFlip(); // Play flip sound when exchanging cards

    // Start exit animation for selected cards
    setExchangingCardIds(selectedCardIds);

    const newCards = drawCards(selectedCardIds.length, usedCardIds);
    setUsedCardIds((prev) => [...prev, ...newCards.map((c) => c.id)]);

    // Calculate new hand immediately (not relying on state)
    const updatedHand = [...hand];
    let newCardIndex = 0;
    for (let i = 0; i < updatedHand.length; i++) {
      if (selectedCardIds.includes(updatedHand[i].id)) {
        updatedHand[i] = newCards[newCardIndex];
        newCardIndex++;
      }
    }

    // Wait for exit animation (0.3s) before replacing cards
    setTimeout(() => {
      // Replace cards in hand
      setHand(updatedHand);

      // Clear exchanging cards and set new card IDs for enter animation
      setExchangingCardIds([]);
      setNewCardIds(newCards.map((c) => c.id));
      setSelectedCardIds([]);

      // Wait for enter animation (0.4s) before revealing role
      setTimeout(() => {
        revealRole(updatedHand);
      }, EXCHANGE_ANIMATION_DELAY);
    }, 300); // Exit animation duration
  }, [phase, selectedCardIds, usedCardIds, hand, playFlip, revealRole]);

  const handleSkipExchange = useCallback(() => {
    if (phase !== 'selecting') return;
    setSelectedCardIds([]);
    revealRole(hand);
  }, [phase, hand, revealRole]);

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
  const isExchanging = phase === 'exchanging';
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
          exchangingCardIds={exchangingCardIds}
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
        isExchanging={isExchanging}
        onExchange={handleExchange}
        onSkipExchange={handleSkipExchange}
        onClearSelection={handleClearSelection}
        onNextRound={handleNextRound}
        onFinish={handleFinish}
      />
    </div>
  );
};
