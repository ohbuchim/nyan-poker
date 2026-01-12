import React from 'react';
import { Button } from '../components/common/Button';
import styles from './TitleScreen.module.css';

/** Images for decorative cards */
const DECORATIVE_CARD_IMAGES = [
  '/images/image_016.jpg', // 三毛の長毛猫
  '/images/image_028.jpg', // サビの短毛猫
  '/images/image_073.jpg', // 黒猫の長毛猫
  '/images/image_023.jpg', // 白猫の長毛猫
];

/** Rotation angles for decorative cards */
const CARD_ROTATIONS = [-12, -4, 4, 12];

export interface TitleScreenProps {
  /** Callback when starting solo mode */
  onStartSolo: () => void;
  /** Callback when starting battle mode */
  onStartBattle: () => void;
  /** Callback when rules button is clicked */
  onShowRules: () => void;
  /** Callback when stats button is clicked */
  onShowStats: () => void;
  /** Callback when settings button is clicked */
  onShowSettings: () => void;
}

/**
 * TitleScreen component
 *
 * Displays the game's title screen with:
 * - Title logo with cat ears
 * - Subtitle
 * - Decorative cat cards with rotation animation
 * - Game mode selection buttons (Solo / Battle)
 * - Footer buttons (Rules / Stats / Settings)
 */
export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartSolo,
  onStartBattle,
  onShowRules,
  onShowStats,
  onShowSettings,
}) => {
  return (
    <div className={styles.titleScreen}>
      <div className={styles.titleContainer}>
        {/* Title Logo with Cat Ears */}
        <div className={styles.titleLogo}>
          <h1 className={styles.titleText}>にゃんポーカー</h1>
        </div>

        {/* Subtitle */}
        <p className={styles.titleSubtitle}>猫カードで役を揃えるポーカーゲーム</p>

        {/* Decorative Cards */}
        <div className={styles.titleCats}>
          {DECORATIVE_CARD_IMAGES.map((imagePath, index) => (
            <div
              key={imagePath}
              className={styles.titleCatCard}
              style={{ '--rotation': `${CARD_ROTATIONS[index]}deg` } as React.CSSProperties}
            >
              <img src={imagePath} alt={`装飾用猫カード ${index + 1}`} />
            </div>
          ))}
        </div>

        {/* Main Menu Buttons */}
        <div className={styles.titleMenu}>
          <Button
            variant="primary"
            size="lg"
            onClick={onStartSolo}
            aria-label="ひとりで遊ぶモードを開始"
          >
            ひとりで遊ぶ
          </Button>
          <Button
            variant="secondary"
            size="lg"
            onClick={onStartBattle}
            aria-label="対戦モードを開始"
          >
            対戦モード
          </Button>
        </div>

        {/* Footer Buttons */}
        <div className={styles.titleFooter}>
          <Button
            variant="footer"
            icon="?"
            label="遊び方"
            onClick={onShowRules}
            aria-label="遊び方を見る"
          />
          <Button
            variant="footer"
            icon={<span aria-hidden="true">&#x1F4CA;</span>}
            label="戦績"
            onClick={onShowStats}
            aria-label="戦績を見る"
          />
          <Button
            variant="footer"
            icon={<span aria-hidden="true">&#x2699;</span>}
            label="設定"
            onClick={onShowSettings}
            aria-label="設定を開く"
          />
        </div>
      </div>
    </div>
  );
};
