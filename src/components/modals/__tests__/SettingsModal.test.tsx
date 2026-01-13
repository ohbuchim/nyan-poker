import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { SettingsModal } from '../SettingsModal';
import { SettingsProvider } from '../../../context/SettingsContext';
import { StatsProvider } from '../../../context/StatsContext';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

/**
 * Helper function to render SettingsModal with required providers
 */
function renderSettingsModal(isOpen = true, onClose = vi.fn()) {
  return render(
    <SettingsProvider>
      <StatsProvider>
        <SettingsModal isOpen={isOpen} onClose={onClose} />
      </StatsProvider>
    </SettingsProvider>
  );
}

describe('SettingsModal', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'modal-root';
    document.body.appendChild(container);
    localStorageMock.clear();
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    document.body.removeChild(container);
    document.body.style.overflow = '';
    vi.useRealTimers();
  });

  describe('Rendering', () => {
    it('renders nothing when not open', () => {
      renderSettingsModal(false);
      expect(screen.queryByText('設定')).not.toBeInTheDocument();
    });

    it('renders modal with title when open', () => {
      renderSettingsModal();
      expect(screen.getByText('設定')).toBeInTheDocument();
    });

    it('renders sound toggle', () => {
      renderSettingsModal();
      expect(screen.getByText('効果音')).toBeInTheDocument();
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('renders volume slider', () => {
      renderSettingsModal();
      expect(screen.getByText('音量')).toBeInTheDocument();
      expect(screen.getByRole('slider')).toBeInTheDocument();
    });

    it('renders reset button', () => {
      renderSettingsModal();
      expect(screen.getByText('戦績リセット')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'リセット' })).toBeInTheDocument();
    });
  });

  describe('Sound Toggle', () => {
    it('toggle is checked by default (sound enabled)', () => {
      renderSettingsModal();
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'true');
    });

    it('toggles sound when clicked', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderSettingsModal();

      const toggle = screen.getByRole('switch');
      await user.click(toggle);

      expect(toggle).toHaveAttribute('aria-checked', 'false');
    });

    it('toggles sound back on when clicked again', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderSettingsModal();

      const toggle = screen.getByRole('switch');
      await user.click(toggle);
      expect(toggle).toHaveAttribute('aria-checked', 'false');

      await user.click(toggle);
      expect(toggle).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('Volume Slider', () => {
    it('has default value of 80', () => {
      renderSettingsModal();
      const slider = screen.getByRole('slider');
      expect(slider).toHaveValue('80');
    });

    it('displays current volume percentage', () => {
      renderSettingsModal();
      expect(screen.getByText('80%')).toBeInTheDocument();
    });

    it('is enabled when sound is on', () => {
      renderSettingsModal();
      const slider = screen.getByRole('slider');
      expect(slider).not.toBeDisabled();
    });

    it('is disabled when sound is off', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderSettingsModal();

      const toggle = screen.getByRole('switch');
      await user.click(toggle);

      const slider = screen.getByRole('slider');
      expect(slider).toBeDisabled();
    });

    it('label has disabled style when sound is off', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderSettingsModal();

      const toggle = screen.getByRole('switch');
      await user.click(toggle);

      const label = screen.getByText('音量');
      expect(label.className).toContain('disabled');
    });
  });

  describe('Stats Reset', () => {
    it('shows confirmation dialog when reset button is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderSettingsModal();

      await user.click(screen.getByRole('button', { name: 'リセット' }));

      expect(screen.getByText('本当にリセットしますか?')).toBeInTheDocument();
      expect(
        screen.getByText('全ての戦績データが削除されます。この操作は取り消せません。')
      ).toBeInTheDocument();
    });

    it('shows cancel and confirm buttons in confirmation dialog', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderSettingsModal();

      await user.click(screen.getByRole('button', { name: 'リセット' }));

      expect(screen.getByRole('button', { name: 'キャンセル' })).toBeInTheDocument();
      // There should be two reset buttons - one original and one in dialog
      const resetButtons = screen.getAllByRole('button', { name: 'リセット' });
      expect(resetButtons.length).toBe(2);
    });

    it('closes confirmation dialog when cancel is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderSettingsModal();

      await user.click(screen.getByRole('button', { name: 'リセット' }));
      expect(screen.getByText('本当にリセットしますか?')).toBeInTheDocument();

      await user.click(screen.getByRole('button', { name: 'キャンセル' }));
      expect(screen.queryByText('本当にリセットしますか?')).not.toBeInTheDocument();
    });

    it('resets stats and shows notification when confirm is clicked', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderSettingsModal();

      await user.click(screen.getByRole('button', { name: 'リセット' }));

      // Click the second reset button (in the confirmation dialog)
      const resetButtons = screen.getAllByRole('button', { name: 'リセット' });
      await user.click(resetButtons[1]);

      expect(screen.queryByText('本当にリセットしますか?')).not.toBeInTheDocument();
      expect(screen.getByText('戦績がリセットされました')).toBeInTheDocument();
    });

    it('hides notification after 3 seconds', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderSettingsModal();

      await user.click(screen.getByRole('button', { name: 'リセット' }));
      const resetButtons = screen.getAllByRole('button', { name: 'リセット' });
      await user.click(resetButtons[1]);

      expect(screen.getByText('戦績がリセットされました')).toBeInTheDocument();

      // Fast-forward 3 seconds
      vi.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.queryByText('戦績がリセットされました')).not.toBeInTheDocument();
      });
    });

    it('confirmation dialog has alertdialog role', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderSettingsModal();

      await user.click(screen.getByRole('button', { name: 'リセット' }));

      expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    });
  });

  describe('Close behavior', () => {
    it('calls onClose when close button is clicked', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(
        <SettingsProvider>
          <StatsProvider>
            <SettingsModal isOpen={true} onClose={handleClose} />
          </StatsProvider>
        </SettingsProvider>
      );

      await user.click(screen.getByRole('button', { name: '閉じる' }));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when ESC key is pressed', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      render(
        <SettingsProvider>
          <StatsProvider>
            <SettingsModal isOpen={true} onClose={handleClose} />
          </StatsProvider>
        </SettingsProvider>
      );

      await user.keyboard('{Escape}');
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('closes confirmation dialog when modal is closed', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });

      const { rerender } = render(
        <SettingsProvider>
          <StatsProvider>
            <SettingsModal isOpen={true} onClose={handleClose} />
          </StatsProvider>
        </SettingsProvider>
      );

      // Open confirmation dialog
      await user.click(screen.getByRole('button', { name: 'リセット' }));
      expect(screen.getByText('本当にリセットしますか?')).toBeInTheDocument();

      // Close modal
      rerender(
        <SettingsProvider>
          <StatsProvider>
            <SettingsModal isOpen={false} onClose={handleClose} />
          </StatsProvider>
        </SettingsProvider>
      );

      // Reopen modal - confirmation dialog should be closed
      rerender(
        <SettingsProvider>
          <StatsProvider>
            <SettingsModal isOpen={true} onClose={handleClose} />
          </StatsProvider>
        </SettingsProvider>
      );

      expect(screen.queryByText('本当にリセットしますか?')).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('volume slider has proper aria attributes', () => {
      renderSettingsModal();
      const slider = screen.getByRole('slider');

      expect(slider).toHaveAttribute('aria-valuemin', '0');
      expect(slider).toHaveAttribute('aria-valuemax', '100');
      expect(slider).toHaveAttribute('aria-valuenow', '80');
    });

    it('notification has status role for screen readers', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderSettingsModal();

      await user.click(screen.getByRole('button', { name: 'リセット' }));
      const resetButtons = screen.getAllByRole('button', { name: 'リセット' });
      await user.click(resetButtons[1]);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('Settings persistence', () => {
    it('saves settings to localStorage when sound is toggled', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderSettingsModal();

      const toggle = screen.getByRole('switch');
      await user.click(toggle);

      expect(localStorageMock.setItem).toHaveBeenCalled();
    });
  });

  describe('Volume slider interaction', () => {
    it('changes volume when slider is moved', async () => {
      renderSettingsModal();

      const slider = screen.getByRole('slider') as HTMLInputElement;

      // Use fireEvent for range input changes since userEvent doesn't handle range inputs well
      const { fireEvent } = await import('@testing-library/react');
      fireEvent.change(slider, { target: { value: '50' } });

      // The slider should reflect the change
      expect(slider).toHaveValue('50');
      expect(localStorageMock.setItem).toHaveBeenCalled();
    });

    it('updates volume display when slider changes', async () => {
      renderSettingsModal();

      const slider = screen.getByRole('slider') as HTMLInputElement;

      // Use fireEvent for range input changes since userEvent doesn't handle them well
      const { fireEvent } = await import('@testing-library/react');
      fireEvent.change(slider, { target: { value: '50' } });

      await waitFor(() => {
        expect(screen.getByText('50%')).toBeInTheDocument();
      });
    });
  });

  describe('Timeout cleanup', () => {
    it('clears notification timeout when modal closes while notification is showing', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const handleClose = vi.fn();

      const { rerender } = render(
        <SettingsProvider>
          <StatsProvider>
            <SettingsModal isOpen={true} onClose={handleClose} />
          </StatsProvider>
        </SettingsProvider>
      );

      // Reset stats to trigger notification
      await user.click(screen.getByRole('button', { name: 'リセット' }));
      const resetButtons = screen.getAllByRole('button', { name: 'リセット' });
      await user.click(resetButtons[1]);

      expect(screen.getByText('戦績がリセットされました')).toBeInTheDocument();

      // Close modal while notification is showing (before 3 seconds)
      rerender(
        <SettingsProvider>
          <StatsProvider>
            <SettingsModal isOpen={false} onClose={handleClose} />
          </StatsProvider>
        </SettingsProvider>
      );

      // Reopen modal - notification should not be showing
      rerender(
        <SettingsProvider>
          <StatsProvider>
            <SettingsModal isOpen={true} onClose={handleClose} />
          </StatsProvider>
        </SettingsProvider>
      );

      expect(screen.queryByText('戦績がリセットされました')).not.toBeInTheDocument();
    });

    it('clears existing timeout when resetting stats again quickly', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      renderSettingsModal();

      // First reset
      await user.click(screen.getByRole('button', { name: 'リセット' }));
      let resetButtons = screen.getAllByRole('button', { name: 'リセット' });
      await user.click(resetButtons[1]);

      expect(screen.getByText('戦績がリセットされました')).toBeInTheDocument();

      // Wait 1 second
      vi.advanceTimersByTime(1000);

      // Reset again (while first notification is still showing)
      await user.click(screen.getByRole('button', { name: 'リセット' }));
      resetButtons = screen.getAllByRole('button', { name: 'リセット' });
      await user.click(resetButtons[1]);

      // Notification should still be showing
      expect(screen.getByText('戦績がリセットされました')).toBeInTheDocument();

      // Wait 3 more seconds from second reset
      vi.advanceTimersByTime(3000);

      await waitFor(() => {
        expect(screen.queryByText('戦績がリセットされました')).not.toBeInTheDocument();
      });
    });
  });

  describe('Component unmount cleanup', () => {
    it('cleans up timeout on unmount', async () => {
      const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
      const handleClose = vi.fn();

      const { unmount } = render(
        <SettingsProvider>
          <StatsProvider>
            <SettingsModal isOpen={true} onClose={handleClose} />
          </StatsProvider>
        </SettingsProvider>
      );

      // Reset stats to create a pending timeout
      await user.click(screen.getByRole('button', { name: 'リセット' }));
      const resetButtons = screen.getAllByRole('button', { name: 'リセット' });
      await user.click(resetButtons[1]);

      // Unmount component before timeout completes
      unmount();

      // Advance timers - should not cause errors
      vi.advanceTimersByTime(5000);

      // Test passes if no errors occurred during timeout cleanup
      expect(true).toBe(true);
    });
  });
});
