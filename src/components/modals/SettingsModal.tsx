import React, { useState, useCallback, useId, useEffect, useRef } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Toggle } from '../common/Toggle';
import { useSettings } from '../../context/SettingsContext';
import { useStats } from '../../context/StatsContext';
import styles from './SettingsModal.module.css';

export interface SettingsModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when the modal should close */
  onClose: () => void;
}

/**
 * SettingsModal component
 *
 * Displays settings options including:
 * - Sound effect toggle (ON/OFF)
 * - Volume slider (0-100%)
 * - Stats reset button with confirmation dialog
 *
 * Features:
 * - Settings are immediately saved to localStorage
 * - Volume slider is disabled when sound is OFF
 * - Reset confirmation dialog to prevent accidental data loss
 */
export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { soundEnabled, volume, toggleSound, setVolume } = useSettings();
  const { resetStats } = useStats();
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [resetNotification, setResetNotification] = useState(false);

  // Generate unique ID for accessibility
  const volumeLabelId = useId();

  // Track timeout ref for cleanup
  const notificationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset internal state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setShowResetConfirm(false);
      setResetNotification(false);
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
        notificationTimeoutRef.current = null;
      }
    }
  }, [isOpen]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, []);

  /**
   * Handle volume slider change
   */
  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = parseInt(e.target.value, 10);
      setVolume(value);
    },
    [setVolume]
  );

  /**
   * Show reset confirmation dialog
   */
  const handleResetClick = useCallback(() => {
    setShowResetConfirm(true);
  }, []);

  /**
   * Cancel reset operation
   */
  const handleResetCancel = useCallback(() => {
    setShowResetConfirm(false);
  }, []);

  /**
   * Confirm and execute reset operation
   */
  const handleResetConfirm = useCallback(() => {
    resetStats();
    setShowResetConfirm(false);
    setResetNotification(true);

    // Clear any existing timeout
    if (notificationTimeoutRef.current) {
      clearTimeout(notificationTimeoutRef.current);
    }

    // Hide notification after 3 seconds
    notificationTimeoutRef.current = setTimeout(() => {
      setResetNotification(false);
      notificationTimeoutRef.current = null;
    }, 3000);
  }, [resetStats]);

  /**
   * Handle modal close - also close confirmation dialog
   */
  const handleClose = useCallback(() => {
    setShowResetConfirm(false);
    setResetNotification(false);
    onClose();
  }, [onClose]);

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="設定">
      <div className={styles.settingsContent}>
        {/* Sound Effect Toggle */}
        <div className={styles.settingItem}>
          <Toggle
            label="効果音"
            checked={soundEnabled}
            onChange={toggleSound}
            aria-label="効果音のON/OFF"
          />
        </div>

        {/* Volume Slider */}
        <div className={styles.settingItem}>
          <label
            id={volumeLabelId}
            className={`${styles.settingLabel} ${!soundEnabled ? styles.disabled : ''}`}
          >
            音量
          </label>
          <div className={styles.volumeControl}>
            <input
              type="range"
              className={styles.volumeSlider}
              min="0"
              max="100"
              value={volume}
              onChange={handleVolumeChange}
              disabled={!soundEnabled}
              aria-labelledby={volumeLabelId}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={volume}
            />
            <span
              className={`${styles.volumeValue} ${!soundEnabled ? styles.disabled : ''}`}
            >
              {volume}%
            </span>
          </div>
        </div>

        {/* Stats Reset */}
        <div className={styles.settingItem}>
          <span className={styles.settingLabel}>戦績リセット</span>
          <Button variant="danger" size="sm" onClick={handleResetClick}>
            リセット
          </Button>
        </div>

        {/* Reset Confirmation Dialog */}
        {showResetConfirm && (
          <div className={styles.confirmDialog} role="alertdialog" aria-modal="true">
            <p className={styles.confirmMessage}>本当にリセットしますか?</p>
            <p className={styles.confirmSubMessage}>
              全ての戦績データが削除されます。この操作は取り消せません。
            </p>
            <div className={styles.confirmButtons}>
              <Button variant="secondary" size="sm" onClick={handleResetCancel}>
                キャンセル
              </Button>
              <Button variant="danger" size="sm" onClick={handleResetConfirm}>
                リセット
              </Button>
            </div>
          </div>
        )}

        {/* Reset Notification */}
        {resetNotification && (
          <div className={styles.notification} role="status" aria-live="polite">
            戦績がリセットされました
          </div>
        )}
      </div>
    </Modal>
  );
};
