import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/index.css';
import { StatsProvider } from './context/StatsContext';
import { SettingsProvider } from './context/SettingsContext';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <SettingsProvider>
      <StatsProvider>
        <App />
      </StatsProvider>
    </SettingsProvider>
  </StrictMode>
);
