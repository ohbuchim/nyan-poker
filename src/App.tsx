import { useState, useCallback } from 'react';
import { TitleScreen, GameScreen, BattleScreen, ResultScreen } from './pages';
import { RulesModal, StatsModal, SettingsModal } from './components/modals';
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
  const [isStatsModalOpen, setIsStatsModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const handleStartSolo = useCallback(() => {
    setCurrentMode('solo');
    setGameKey((prev) => prev + 1);
    setCurrentScreen('game');
  }, []);

  const handleStartBattle = useCallback(() => {
    setCurrentMode('battle');
    setGameKey((prev) => prev + 1);
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
    if (currentMode === 'solo') {
      setCurrentScreen('game');
    } else {
      setCurrentScreen('battle');
    }
  }, [currentMode]);

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
    setIsStatsModalOpen(true);
  }, []);

  const handleCloseStats = useCallback(() => {
    setIsStatsModalOpen(false);
  }, []);

  const handleShowSettings = useCallback(() => {
    setIsSettingsModalOpen(true);
  }, []);

  const handleCloseSettings = useCallback(() => {
    setIsSettingsModalOpen(false);
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
      <StatsModal isOpen={isStatsModalOpen} onClose={handleCloseStats} />
      <SettingsModal isOpen={isSettingsModalOpen} onClose={handleCloseSettings} />
    </>
  );
}

export default App;
