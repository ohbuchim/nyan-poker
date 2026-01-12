import { useState, useCallback } from 'react';
import { TitleScreen } from './pages';
import './App.css';

/** Application screen type */
type AppScreen = 'title' | 'game' | 'battle' | 'result';

function App() {
  const [currentScreen, setCurrentScreen] = useState<AppScreen>('title');

  // Screen transition handlers
  const handleStartSolo = useCallback(() => {
    setCurrentScreen('game');
  }, []);

  const handleStartBattle = useCallback(() => {
    setCurrentScreen('battle');
  }, []);

  // Modal handlers (placeholder - will be implemented with modals)
  const handleShowRules = useCallback(() => {
    // TODO: Implement rules modal
    console.log('Show rules modal');
  }, []);

  const handleShowStats = useCallback(() => {
    // TODO: Implement stats modal
    console.log('Show stats modal');
  }, []);

  const handleShowSettings = useCallback(() => {
    // TODO: Implement settings modal
    console.log('Show settings modal');
  }, []);

  // Render current screen
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
        // TODO: Implement GameScreen
        return <div className="app">ゲーム画面（実装予定）</div>;
      case 'battle':
        // TODO: Implement BattleScreen
        return <div className="app">対戦画面（実装予定）</div>;
      case 'result':
        // TODO: Integrate ResultScreen
        return <div className="app">結果画面（実装予定）</div>;
      default:
        return null;
    }
  };

  return <>{renderScreen()}</>;
}

export default App;
