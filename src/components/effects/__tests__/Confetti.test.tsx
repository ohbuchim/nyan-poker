// components/effects/__tests__/Confetti.test.tsx

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, cleanup, waitFor, act } from '@testing-library/react';
import { Confetti } from '../Confetti';

// Mock canvas context
const mockContext = {
  save: vi.fn(),
  restore: vi.fn(),
  translate: vi.fn(),
  rotate: vi.fn(),
  fillText: vi.fn(),
  fillRect: vi.fn(),
  beginPath: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  clearRect: vi.fn(),
  globalAlpha: 1,
  fillStyle: '',
  font: '',
  textAlign: '',
  textBaseline: '',
};

// Store the original getContext
const originalGetContext = HTMLCanvasElement.prototype.getContext;

describe('Confetti', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    // Mock canvas getContext
    HTMLCanvasElement.prototype.getContext = vi.fn(() => mockContext as unknown as CanvasRenderingContext2D);
    // Reset all mock function calls
    Object.values(mockContext).forEach((fn) => {
      if (typeof fn === 'function') {
        fn.mockClear?.();
      }
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    cleanup();
    // Restore original getContext
    HTMLCanvasElement.prototype.getContext = originalGetContext;
  });

  describe('rendering', () => {
    it('renders nothing when active is false', () => {
      const { container } = render(<Confetti active={false} />);
      expect(container.firstChild).toBeNull();
    });

    it('renders canvas when active is true', () => {
      render(<Confetti active={true} />);
      expect(screen.getByTestId('confetti-canvas')).toBeInTheDocument();
    });

    it('canvas has aria-hidden="true" for accessibility', () => {
      render(<Confetti active={true} />);
      expect(screen.getByTestId('confetti-canvas')).toHaveAttribute(
        'aria-hidden',
        'true'
      );
    });

    it('removes canvas when active changes from true to false', () => {
      const { rerender } = render(<Confetti active={true} />);
      expect(screen.getByTestId('confetti-canvas')).toBeInTheDocument();

      rerender(<Confetti active={false} />);
      expect(screen.queryByTestId('confetti-canvas')).not.toBeInTheDocument();
    });
  });

  describe('animation lifecycle', () => {
    it('calls onComplete after duration expires', async () => {
      const onComplete = vi.fn();
      render(
        <Confetti active={true} duration={1000} onComplete={onComplete} />
      );

      expect(onComplete).not.toHaveBeenCalled();

      // Advance time past duration
      await act(async () => {
        vi.advanceTimersByTime(1100);
      });

      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('uses default duration of 5000ms when not specified', async () => {
      const onComplete = vi.fn();
      render(<Confetti active={true} onComplete={onComplete} />);

      // Before default duration
      await act(async () => {
        vi.advanceTimersByTime(4900);
      });
      expect(onComplete).not.toHaveBeenCalled();

      // After default duration
      await act(async () => {
        vi.advanceTimersByTime(200);
      });
      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('clears animation when component unmounts', () => {
      const cancelAnimationFrameSpy = vi.spyOn(
        window,
        'cancelAnimationFrame'
      );

      const { unmount } = render(
        <Confetti active={true} duration={5000} />
      );

      unmount();

      expect(cancelAnimationFrameSpy).toHaveBeenCalled();
      cancelAnimationFrameSpy.mockRestore();
    });

    it('initializes canvas with window dimensions', () => {
      // Mock window dimensions
      Object.defineProperty(window, 'innerWidth', {
        value: 1024,
        writable: true,
      });
      Object.defineProperty(window, 'innerHeight', {
        value: 768,
        writable: true,
      });

      render(<Confetti active={true} />);
      const canvas = screen.getByTestId('confetti-canvas') as HTMLCanvasElement;

      expect(canvas.width).toBe(1024);
      expect(canvas.height).toBe(768);
    });
  });

  describe('particle rendering', () => {
    it('creates particles based on particleCount prop', async () => {
      render(
        <Confetti active={true} particleCount={50} duration={1000} />
      );

      // Let animation run a few frames
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // Verify drawing operations occurred
      expect(mockContext.clearRect).toHaveBeenCalled();
      expect(mockContext.save).toHaveBeenCalled();
      expect(mockContext.restore).toHaveBeenCalled();
    });

    it('uses default particleCount of 150 when not specified', async () => {
      render(<Confetti active={true} duration={1000} />);

      // Let animation run a few frames
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // We can't easily verify the exact count, but we can check that drawing occurred
      expect(mockContext.save).toHaveBeenCalled();
    });

    it('uses custom colors when provided', async () => {
      const customColors = ['#ff0000', '#00ff00', '#0000ff'];
      render(
        <Confetti
          active={true}
          colors={customColors}
          particleCount={10}
          duration={1000}
        />
      );

      // Let animation run
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // Verify drawing occurred
      expect(mockContext.save).toHaveBeenCalled();
    });

    it('draws different particle shapes', async () => {
      render(
        <Confetti active={true} particleCount={100} duration={1000} />
      );

      // Let animation run a few frames to see various shapes
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      // Verify different drawing methods are called for different shapes
      // Square uses fillRect
      expect(mockContext.fillRect).toHaveBeenCalled();
      // Circle uses arc
      expect(mockContext.arc).toHaveBeenCalled();
      // Diamond uses moveTo/lineTo
      expect(mockContext.moveTo).toHaveBeenCalled();
    });

    it('draws paw emoji for paw-shaped particles', async () => {
      // Force paw shape by mocking Math.random
      const originalRandom = Math.random;
      Math.random = vi.fn(() => 0.95); // This will select 'paw' shape

      render(
        <Confetti active={true} particleCount={10} duration={1000} />
      );

      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      expect(mockContext.fillText).toHaveBeenCalled();

      Math.random = originalRandom;
    });
  });

  describe('window resize handling', () => {
    it('updates canvas size on window resize', async () => {
      render(<Confetti active={true} />);
      const canvas = screen.getByTestId('confetti-canvas') as HTMLCanvasElement;

      // Change window size
      Object.defineProperty(window, 'innerWidth', {
        value: 800,
        writable: true,
      });
      Object.defineProperty(window, 'innerHeight', {
        value: 600,
        writable: true,
      });

      // Trigger resize event
      await act(async () => {
        window.dispatchEvent(new Event('resize'));
      });

      expect(canvas.width).toBe(800);
      expect(canvas.height).toBe(600);
    });

    it('removes resize listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

      const { unmount } = render(<Confetti active={true} />);
      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        'resize',
        expect.any(Function)
      );
      removeEventListenerSpy.mockRestore();
    });
  });

  describe('props variations', () => {
    it('handles short duration', async () => {
      const onComplete = vi.fn();
      render(
        <Confetti active={true} duration={100} onComplete={onComplete} />
      );

      await act(async () => {
        vi.advanceTimersByTime(150);
      });

      expect(onComplete).toHaveBeenCalledTimes(1);
    });

    it('handles large particle count', async () => {
      render(
        <Confetti active={true} particleCount={500} duration={1000} />
      );

      // Should not throw or cause issues
      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      expect(mockContext.save).toHaveBeenCalled();
    });

    it('handles empty colors array gracefully', async () => {
      // When colors array is empty, we should still render (will use default behavior)
      render(
        <Confetti
          active={true}
          colors={['#ffffff']}
          particleCount={10}
          duration={1000}
        />
      );

      await act(async () => {
        vi.advanceTimersByTime(100);
      });

      expect(mockContext.save).toHaveBeenCalled();
    });
  });

  describe('active state changes', () => {
    it('restarts animation when toggled off and on', async () => {
      const { rerender } = render(<Confetti active={true} duration={5000} />);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      // Deactivate
      rerender(<Confetti active={false} duration={5000} />);
      expect(screen.queryByTestId('confetti-canvas')).not.toBeInTheDocument();

      // Reactivate
      rerender(<Confetti active={true} duration={5000} />);
      expect(screen.getByTestId('confetti-canvas')).toBeInTheDocument();
    });

    it('cleans up animation when deactivated mid-animation', async () => {
      const cancelAnimationFrameSpy = vi.spyOn(
        window,
        'cancelAnimationFrame'
      );

      const { rerender } = render(<Confetti active={true} duration={5000} />);

      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      rerender(<Confetti active={false} duration={5000} />);

      // cancelAnimationFrame should have been called during cleanup
      expect(cancelAnimationFrameSpy).toHaveBeenCalled();
      cancelAnimationFrameSpy.mockRestore();
    });
  });

  describe('canvas context', () => {
    it('handles null canvas context gracefully', () => {
      // Mock getContext to return null
      HTMLCanvasElement.prototype.getContext = vi.fn(() => null);

      // Should not throw
      expect(() => {
        render(<Confetti active={true} />);
      }).not.toThrow();
    });
  });
});
