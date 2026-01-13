import React, { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import type { Card, Role, GamePhase, RoundHistory } from '../types';
import { Hand } from '../components/card';
import {
  GameHeader,
  RoleDisplay,
  ActionButtons,
  BattleResultOverlay,
  BattleRoleBox,
} from '../components/game';
import type { BattleResult, BattleRoleBoxStatus } from '../components/game';
import { drawCards } from '../utils/deck';
import { calculateRole, determineWinner } from '../utils/roleCalculator';
import { decideDealerExchange, executeDealerExchange } from '../utils/dealerAI';
import { useSound } from '../hooks';
import {
  TOTAL_ROUNDS,
  HAND_SIZE,
  MAX_SELECTABLE_CARDS,
  EXCHANGE_ANIMATION_DELAY,
  DEALER_EXCHANGE_DELAY,
  ROLE_HIGHLIGHT_DELAY,
  ICONS,
} from '../constants';
import styles from './BattleScreen.module.css';

export interface BattleScreenProps {
  onGameEnd: (finalScore: number, history: RoundHistory[]) => void;
  onRulesClick?: () => void;
}

export const BattleScreen: React.FC<BattleScreenProps> = ({
  onGameEnd,
  onRulesClick,
}) => {
  const [round, setRound] = useState(1);
  const [playerScore, setPlayerScore] = useState(0);
  const [phase, setPhase] = useState<GamePhase>('dealing');
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [selectedCardIds, setSelectedCardIds] = useState<number[]>([]);
  const [playerRole, setPlayerRole] = useState<Role | null>(null);
  const [dealerRole, setDealerRole] = useState<Role | null>(null);
  const [history, setHistory] = useState<RoundHistory[]>([]);
  const [newCardIds, setNewCardIds] = useState<number[]>([]);
  const [exchangingCardIds, setExchangingCardIds] = useState<number[]>([]);
  const [usedCardIds, setUsedCardIds] = useState<number[]>([]);
  const [showResultOverlay, setShowResultOverlay] = useState(false);
  const [roundResult, setRoundResult] = useState<BattleResult>('draw');
  const [pointsChange, setPointsChange] = useState(0);

  // Sound hooks
  const { playDeal, playFlip, playWin, playLose } = useSound();
  const hasPlayedDealSoundRef = useRef(false);
  const hasPlayedResultSoundRef = useRef(false);

  const dealHands = useCallback(() => {
    setPhase('dealing');
    setSelectedCardIds([]);
    setPlayerRole(null);
    setDealerRole(null);
    setNewCardIds([]);
    setExchangingCardIds([]);
    setShowResultOverlay(false);
    hasPlayedDealSoundRef.current = false;
    hasPlayedResultSoundRef.current = false;

    // Draw player's hand
    const newPlayerHand = drawCards(HAND_SIZE, usedCardIds);
    const playerCardIds = newPlayerHand.map((c) => c.id);

    // Draw dealer's hand (excluding player's cards)
    const newDealerHand = drawCards(HAND_SIZE, [...usedCardIds, ...playerCardIds]);
    const dealerCardIds = newDealerHand.map((c) => c.id);

    setPlayerHand(newPlayerHand);
    setDealerHand(newDealerHand);
    setUsedCardIds((prev) => [...prev, ...playerCardIds, ...dealerCardIds]);
    // Phase transition to 'selecting' is now handled by onDealAnimationComplete
  }, [usedCardIds]);

  // Handle deal animation completion
  const handleDealAnimationComplete = useCallback(() => {
    if (phase === 'dealing') {
      setPhase('selecting');
    }
  }, [phase]);

  useEffect(() => {
    if (phase === 'dealing' && playerHand.length === 0) {
      dealHands();
    }
  }, [phase, playerHand.length, dealHands]);

  // Play deal sound when cards are dealt
  useEffect(() => {
    if (phase === 'dealing' && playerHand.length > 0 && !hasPlayedDealSoundRef.current) {
      hasPlayedDealSoundRef.current = true;
      playDeal();
    }
  }, [phase, playerHand.length, playDeal]);

  // Play win/lose sound when result is shown
  useEffect(() => {
    if (showResultOverlay && !hasPlayedResultSoundRef.current) {
      hasPlayedResultSoundRef.current = true;
      if (roundResult === 'win') {
        playWin();
      } else if (roundResult === 'lose') {
        playLose();
      }
    }
  }, [showResultOverlay, roundResult, playWin, playLose]);

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

  const performDealerExchange = useCallback((currentDealerHand: Card[]): Card[] => {
    // AI decides which cards to exchange
    const strategy = decideDealerExchange(currentDealerHand);

    if (strategy.cardsToExchange.length > 0) {
      // Draw new cards for dealer
      const newCards = drawCards(strategy.cardsToExchange.length, usedCardIds);
      setUsedCardIds((prev) => [...prev, ...newCards.map((c) => c.id)]);

      // Execute the exchange
      const newDealerHand = executeDealerExchange(
        currentDealerHand,
        newCards,
        strategy.cardsToExchange
      );
      setDealerHand(newDealerHand);
      return newDealerHand;
    }
    return currentDealerHand;
  }, [usedCardIds]);

  const revealRoles = useCallback((currentPlayerHand: Card[], currentDealerHand: Card[]) => {
    setPhase('revealing');

    // Wait for ROLE_HIGHLIGHT_DELAY before showing role highlight
    setTimeout(() => {
      // Calculate roles using the passed-in hands to avoid stale closure
      const pRole = calculateRole(currentPlayerHand);
      const dRole = calculateRole(currentDealerHand);

      setPlayerRole(pRole);
      setDealerRole(dRole);

      // Determine winner
      const result = determineWinner(pRole, dRole);
      setRoundResult(result);

      // Calculate points change
      let change = 0;
      if (result === 'win') {
        change = pRole.points;
      } else if (result === 'lose') {
        change = -dRole.points;
      }
      setPointsChange(change);

      // Update history
      const roundHistory: RoundHistory = {
        round,
        playerRole: pRole,
        playerPoints: change,
        dealerRole: dRole,
        dealerPoints: result === 'lose' ? dRole.points : result === 'win' ? -pRole.points : 0,
        result,
      };
      setHistory((prev) => [...prev, roundHistory]);

      // Update score
      setPlayerScore((prev) => prev + change);

      setPhase('result');
      setShowResultOverlay(true);
    }, ROLE_HIGHLIGHT_DELAY);
  }, [round]);

  const handleExchange = useCallback(() => {
    if (phase !== 'selecting') return;

    setPhase('exchanging');
    if (selectedCardIds.length > 0) {
      playFlip(); // Play flip sound when exchanging cards
    }

    if (selectedCardIds.length > 0) {
      // Start exit animation for selected cards
      setExchangingCardIds(selectedCardIds);

      // Draw new cards for player
      const newCards = drawCards(selectedCardIds.length, usedCardIds);
      setUsedCardIds((prev) => [...prev, ...newCards.map((c) => c.id)]);

      // Calculate new player hand immediately (not relying on state)
      const updatedPlayerHand = [...playerHand];
      let newCardIndex = 0;
      for (let i = 0; i < updatedPlayerHand.length; i++) {
        if (selectedCardIds.includes(updatedPlayerHand[i].id)) {
          updatedPlayerHand[i] = newCards[newCardIndex];
          newCardIndex++;
        }
      }

      // Wait for exit animation (0.3s) before replacing cards
      setTimeout(() => {
        setPlayerHand(updatedPlayerHand);

        // Clear exchanging cards and set new card IDs for enter animation
        setExchangingCardIds([]);
        setNewCardIds(newCards.map((c) => c.id));
        setSelectedCardIds([]);

        // Wait for enter animation (0.4s) before dealer exchange
        setTimeout(() => {
          const updatedDealerHand = performDealerExchange(dealerHand);

          // Reveal roles after dealer exchange with the actual updated hands
          setTimeout(() => {
            revealRoles(updatedPlayerHand, updatedDealerHand);
          }, DEALER_EXCHANGE_DELAY);
        }, EXCHANGE_ANIMATION_DELAY);
      }, 300); // Exit animation duration
    } else {
      // No cards selected, proceed to dealer exchange
      setTimeout(() => {
        const updatedDealerHand = performDealerExchange(dealerHand);

        setTimeout(() => {
          revealRoles(playerHand, updatedDealerHand);
        }, DEALER_EXCHANGE_DELAY);
      }, EXCHANGE_ANIMATION_DELAY);
    }
  }, [phase, selectedCardIds, usedCardIds, playerHand, dealerHand, performDealerExchange, revealRoles, playFlip]);

  const handleSkipExchange = useCallback(() => {
    if (phase !== 'selecting') return;

    setSelectedCardIds([]);
    setPhase('exchanging');

    // Dealer exchange
    setTimeout(() => {
      const updatedDealerHand = performDealerExchange(dealerHand);

      setTimeout(() => {
        revealRoles(playerHand, updatedDealerHand);
      }, DEALER_EXCHANGE_DELAY);
    }, EXCHANGE_ANIMATION_DELAY);
  }, [phase, playerHand, dealerHand, performDealerExchange, revealRoles]);

  const handleClearSelection = useCallback(() => {
    setSelectedCardIds([]);
  }, []);

  const handleResultOverlayClose = useCallback(() => {
    setShowResultOverlay(false);
  }, []);

  const handleNextRound = useCallback(() => {
    if (round >= TOTAL_ROUNDS) return;

    setRound((prev) => prev + 1);
    setPlayerHand([]);
    setDealerHand([]);
    setUsedCardIds([]);
    setPhase('dealing');
  }, [round]);

  const handleFinish = useCallback(() => {
    onGameEnd(playerScore, history);
  }, [playerScore, history, onGameEnd]);

  const isInteractive = phase === 'selecting';
  const isExchanged = phase === 'result' || phase === 'revealing';
  const isExchanging = phase === 'exchanging';
  const isLastRound = round === TOTAL_ROUNDS;
  const showDealerCards = phase === 'result' || phase === 'revealing';

  const getAnimationType = () => {
    if (phase === 'dealing') return 'deal' as const;
    return 'none' as const;
  };

  const getPlayerRoleStatus = useMemo((): BattleRoleBoxStatus => {
    if (!showDealerCards || !playerRole || !dealerRole) return 'pending';
    if (roundResult === 'win') return 'winner';
    if (roundResult === 'lose') return 'loser';
    return 'draw';
  }, [showDealerCards, playerRole, dealerRole, roundResult]);

  const getDealerRoleStatus = useMemo((): BattleRoleBoxStatus => {
    if (!showDealerCards || !playerRole || !dealerRole) return 'pending';
    if (roundResult === 'lose') return 'winner';
    if (roundResult === 'win') return 'loser';
    return 'draw';
  }, [showDealerCards, playerRole, dealerRole, roundResult]);

  return (
    <div className={styles.screen}>
      <GameHeader
        round={round}
        totalRounds={TOTAL_ROUNDS}
        score={playerScore}
        onRulesClick={onRulesClick}
      />

      <div className={styles['battle-roles-header']}>
        <BattleRoleBox
          label="Dealer"
          icon={ICONS.DEALER}
          role={dealerRole}
          showRole={showDealerCards}
          status={getDealerRoleStatus}
        />
        <div className={styles['battle-vs']}>VS</div>
        <BattleRoleBox
          label="You"
          icon={ICONS.PLAYER}
          role={playerRole}
          showRole={showDealerCards}
          status={getPlayerRoleStatus}
        />
      </div>

      <div className={styles['battle-area']}>
        <div className={styles['dealer-area']}>
          <div className={styles['dealer-header']}>
            <span className={styles['dealer-icon']}>{ICONS.DEALER}</span>
            <span className={styles['dealer-label']}>Dealer</span>
          </div>
          <div className={styles['hand-area-compact']}>
            <Hand
              cards={dealerHand}
              showCards={showDealerCards}
              matchingCardIds={showDealerCards ? dealerRole?.matchingCardIds || [] : []}
              disabled={true}
              isDealer={true}
              animationType={getAnimationType()}
            />
          </div>
        </div>

        <div className={styles['vs-row']}>
          <div className={styles['vs-row-left']} />
          <div className={styles['vs-divider']}>
            <span className={styles['vs-text']}>VS</span>
          </div>
          <div className={styles['vs-row-right']}>
            {!showResultOverlay && (
              <ActionButtons
                selectedCount={selectedCardIds.length}
                maxSelectable={MAX_SELECTABLE_CARDS}
                exchanged={isExchanged}
                isRevealing={phase === 'revealing' && !playerRole}
                isLastRound={isLastRound}
                isExchanging={isExchanging}
                onExchange={handleExchange}
                onSkipExchange={handleSkipExchange}
                onClearSelection={handleClearSelection}
                onNextRound={handleNextRound}
                onFinish={handleFinish}
                variant="inline"
              />
            )}
          </div>
        </div>

        <div className={styles['player-area']}>
          <div className={styles['hand-area']}>
            <div className={styles['hand-label']}>Your Hand</div>
            <Hand
              cards={playerHand}
              showCards={true}
              selectedCardIds={selectedCardIds}
              matchingCardIds={playerRole?.matchingCardIds || []}
              exchangingCardIds={exchangingCardIds}
              onCardClick={isInteractive ? handleCardClick : undefined}
              disabled={!isInteractive}
              animationType={getAnimationType()}
              newCardIds={newCardIds}
              onDealAnimationComplete={handleDealAnimationComplete}
            />
          </div>
        </div>
      </div>

      {!showDealerCards && (
        <RoleDisplay
          role={null}
          visible={false}
        />
      )}

      {showDealerCards && (
        <RoleDisplay
          role={playerRole}
          visible={true}
        />
      )}

      <BattleResultOverlay
        visible={showResultOverlay}
        result={roundResult}
        playerRole={playerRole}
        dealerRole={dealerRole}
        pointsChange={pointsChange}
        onClose={handleResultOverlayClose}
      />
    </div>
  );
};
