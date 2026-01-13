import { useState, useCallback } from 'react';
import { TitleScreen, GameScreen, BattleScreen, ResultScreen } from './pages';
import { RulesModal } from './components/modals';
import type { RoundHistory, GameMode } from './types';
import './App.css';

type AppScreen = 'title' | 'game' | 'battle' | 'result';

interface ResultData {
  totalScore: number;
  history: RoundHistory[];
  mode: GameMode;
}

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('title');
  const [resultData, setResultData] = useState<ResultData | null>(null);
  const [currentMode, setCurrentMode] = useState<GameMode>('solo');
  const [gameKey, setGameKey] = useState(0);
  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);

  const handleStartSolo = useCallback(() => {
    setCurrentMode('solo');
    setGameKey((prev) => prev + 1);
    setCurrentScreen('game');
  }, []);

  const handleStartBattle = useCallback(() => {
    setCurrentMode('battle');
    setCurrentScreen('battle');
  }, []);

  const handleGameEnd = useCallback(
    (finalScore: number, history: RoundHistory[]) => {
      setResultData({
        totalScore: finalScore,
        history,
        mode: currentMode,
      });
      setCurrentScreen('result');
    },
    [currentMode]
  );

  const handlePlayAgain = useCallback(() => {
    setResultData(null);
    setGameKey((prev) => prev + 1);
    setCurrentScreen('game');
  }, []);

  const handleReturnToTitle = useCallback(() => {
    setResultData(null);
    setCurrentScreen('title');
  }, []);

  const handleShowRules = useCallback(() => {
    setIsRulesModalOpen(true);
  }, []);

  const handleCloseRulesModal = useCallback(() => {
    setIsRulesModalOpen(false);
  }, []);

  const handleShowStats = useCallback(() => {
    console.log('Show stats modal');
  }, []);

  const handleShowSettings = useCallback(() => {
    console.log('Show settings modal');
  }, []);

  const renderScreen = () => {
    switch (currentScreen) {
      case 'title':
        return (
          <TitleScreen
            onStartSolo={handleStartSolo}
            onStartBattle={handleStartBattle}
            onShowRules={handleShowRules}
            onShowStats={handleShowStats}
            onShowSettings={handleShowSettings}
          />
        );
      case 'game':
        return (
          <GameScreen
            key={gameKey}
            onGameEnd={handleGameEnd}
            onRulesClick={handleShowRules}
          />
        );
      case 'battle':
        return (
          <BattleScreen
            key={gameKey}
            onGameEnd={handleGameEnd}
            onRulesClick={handleShowRules}
          />
        );
      case 'result':
        return resultData ? (
          <ResultScreen
            totalScore={resultData.totalScore}
            history={resultData.history}
            mode={resultData.mode}
            onPlayAgain={handlePlayAgain}
            onReturnToTitle={handleReturnToTitle}
          />
        ) : null;
      default:
        return null;
    }
  };

  return (
    <>
      {renderScreen()}
      <RulesModal isOpen={isRulesModalOpen} onClose={handleCloseRulesModal} />
    </>
  );
}

export default App;
