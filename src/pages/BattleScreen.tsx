import React, { useState, useCallback, useEffect, useMemo } from 'react';
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
import styles from './BattleScreen.module.css';

const MAX_SELECTABLE_CARDS = 3;
const TOTAL_ROUNDS = 5;
const HAND_SIZE = 5;
const EXCHANGE_ANIMATION_DELAY = 400;
const DEALER_EXCHANGE_DELAY = 800;
const REVEAL_DELAY = 500;
const DEALER_ICON = '\uD83C\uDFA9'; // Top hat emoji
const PLAYER_ICON = '\uD83D\uDC31'; // Cat emoji

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

  const dealHands = useCallback(() => {
    setPhase('dealing');
    setSelectedCardIds([]);
    setPlayerRole(null);
    setDealerRole(null);
    setNewCardIds([]);
    setExchangingCardIds([]);
    setShowResultOverlay(false);

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

  const performDealerExchange = useCallback(() => {
    // AI decides which cards to exchange
    const strategy = decideDealerExchange(dealerHand);

    if (strategy.cardsToExchange.length > 0) {
      // Draw new cards for dealer
      const newCards = drawCards(strategy.cardsToExchange.length, usedCardIds);
      setUsedCardIds((prev) => [...prev, ...newCards.map((c) => c.id)]);

      // Execute the exchange
      const newDealerHand = executeDealerExchange(
        dealerHand,
        newCards,
        strategy.cardsToExchange
      );
      setDealerHand(newDealerHand);
    }
  }, [dealerHand, usedCardIds]);

  const revealRoles = useCallback(() => {
    setPhase('revealing');

    setTimeout(() => {
      // Calculate roles
      const pRole = calculateRole(playerHand);
      const dRole = calculateRole(dealerHand);

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
    }, REVEAL_DELAY);
  }, [playerHand, dealerHand, round]);

  const handleExchange = useCallback(() => {
    if (phase !== 'selecting') return;

    setPhase('exchanging');

    if (selectedCardIds.length > 0) {
      // Start exit animation for selected cards
      setExchangingCardIds(selectedCardIds);

      // Draw new cards for player
      const newCards = drawCards(selectedCardIds.length, usedCardIds);
      setUsedCardIds((prev) => [...prev, ...newCards.map((c) => c.id)]);

      // Wait for exit animation (0.3s) before replacing cards
      setTimeout(() => {
        setPlayerHand((prev) => {
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

        // Clear exchanging cards and set new card IDs for enter animation
        setExchangingCardIds([]);
        setNewCardIds(newCards.map((c) => c.id));
        setSelectedCardIds([]);

        // Wait for enter animation (0.4s) before dealer exchange
        setTimeout(() => {
          performDealerExchange();

          // Reveal roles after dealer exchange
          setTimeout(() => {
            revealRoles();
          }, DEALER_EXCHANGE_DELAY);
        }, EXCHANGE_ANIMATION_DELAY);
      }, 300); // Exit animation duration
    } else {
      // No cards selected, proceed to dealer exchange
      setTimeout(() => {
        performDealerExchange();

        setTimeout(() => {
          revealRoles();
        }, DEALER_EXCHANGE_DELAY);
      }, EXCHANGE_ANIMATION_DELAY);
    }
  }, [phase, selectedCardIds, usedCardIds, performDealerExchange, revealRoles]);

  const handleSkipExchange = useCallback(() => {
    if (phase !== 'selecting') return;

    setSelectedCardIds([]);
    setPhase('exchanging');

    // Dealer exchange
    setTimeout(() => {
      performDealerExchange();

      setTimeout(() => {
        revealRoles();
      }, DEALER_EXCHANGE_DELAY);
    }, EXCHANGE_ANIMATION_DELAY);
  }, [phase, performDealerExchange, revealRoles]);

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
          icon={DEALER_ICON}
          role={dealerRole}
          showRole={showDealerCards}
          status={getDealerRoleStatus}
        />
        <div className={styles['battle-vs']}>VS</div>
        <BattleRoleBox
          label="You"
          icon={PLAYER_ICON}
          role={playerRole}
          showRole={showDealerCards}
          status={getPlayerRoleStatus}
        />
      </div>

      <div className={styles['battle-area']}>
        <div className={styles['dealer-area']}>
          <div className={styles['dealer-header']}>
            <span className={styles['dealer-icon']}>{DEALER_ICON}</span>
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
