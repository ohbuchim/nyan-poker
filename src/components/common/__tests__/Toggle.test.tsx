import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Toggle } from '../Toggle';

describe('Toggle', () => {
  describe('Rendering', () => {
    it('renders toggle switch', () => {
      render(<Toggle checked={false} onChange={vi.fn()} aria-label="Test toggle" />);
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('renders with label', () => {
      render(<Toggle checked={false} onChange={vi.fn()} label="Enable feature" />);
      expect(screen.getByText('Enable feature')).toBeInTheDocument();
    });

    it('renders without label', () => {
      render(<Toggle checked={false} onChange={vi.fn()} aria-label="Toggle" />);
      expect(screen.queryByText('Enable feature')).not.toBeInTheDocument();
    });
  });

  describe('States', () => {
    it('shows checked state when checked is true', () => {
      const { container } = render(
        <Toggle checked={true} onChange={vi.fn()} aria-label="Toggle" />
      );
      // CSS modules hash class names, so we check with partial match
      const toggle = container.querySelector('[class*="toggle"]');
      expect(toggle?.className).toMatch(/active/);
    });

    it('shows unchecked state when checked is false', () => {
      const { container } = render(
        <Toggle checked={false} onChange={vi.fn()} aria-label="Toggle" />
      );
      // CSS modules hash class names, so we check with partial match
      const toggle = container.querySelector('[class*="toggle"]');
      expect(toggle?.className).not.toMatch(/active/);
    });

    it('shows disabled state when disabled', () => {
      const { container } = render(
        <Toggle checked={false} onChange={vi.fn()} disabled aria-label="Toggle" />
      );
      // CSS modules hash class names, so we check with partial match
      const toggle = container.querySelector('[class*="toggle"]');
      expect(toggle?.className).toMatch(/disabled/);
    });
  });

  describe('Accessibility', () => {
    it('has switch role', () => {
      render(<Toggle checked={false} onChange={vi.fn()} aria-label="Toggle" />);
      expect(screen.getByRole('switch')).toBeInTheDocument();
    });

    it('has aria-checked attribute', () => {
      render(<Toggle checked={true} onChange={vi.fn()} aria-label="Toggle" />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'true');
    });

    it('updates aria-checked when toggled', () => {
      const { rerender } = render(
        <Toggle checked={false} onChange={vi.fn()} aria-label="Toggle" />
      );
      let toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'false');

      rerender(<Toggle checked={true} onChange={vi.fn()} aria-label="Toggle" />);
      toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-checked', 'true');
    });

    it('supports aria-label', () => {
      render(<Toggle checked={false} onChange={vi.fn()} aria-label="Enable notifications" />);
      expect(screen.getByRole('switch', { name: 'Enable notifications' })).toBeInTheDocument();
    });

    it('supports aria-labelledby', () => {
      render(
        <>
          <span id="toggle-label">Sound effects</span>
          <Toggle checked={false} onChange={vi.fn()} aria-labelledby="toggle-label" />
        </>
      );
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('aria-labelledby', 'toggle-label');
    });

    it('is focusable when not disabled', () => {
      render(<Toggle checked={false} onChange={vi.fn()} aria-label="Toggle" />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('tabindex', '0');
    });

    it('is not focusable when disabled', () => {
      render(<Toggle checked={false} onChange={vi.fn()} disabled aria-label="Toggle" />);
      const toggle = screen.getByRole('switch');
      expect(toggle).toHaveAttribute('tabindex', '-1');
    });
  });

  describe('Interactions', () => {
    it('calls onChange when clicked', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<Toggle checked={false} onChange={handleChange} aria-label="Toggle" />);
      await user.click(screen.getByRole('switch'));

      expect(handleChange).toHaveBeenCalledTimes(1);
      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('toggles from true to false', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<Toggle checked={true} onChange={handleChange} aria-label="Toggle" />);
      await user.click(screen.getByRole('switch'));

      expect(handleChange).toHaveBeenCalledWith(false);
    });

    it('does not call onChange when disabled', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<Toggle checked={false} onChange={handleChange} disabled aria-label="Toggle" />);
      await user.click(screen.getByRole('switch'));

      expect(handleChange).not.toHaveBeenCalled();
    });

    it('toggles when Space key is pressed', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<Toggle checked={false} onChange={handleChange} aria-label="Toggle" />);
      const toggle = screen.getByRole('switch');
      toggle.focus();
      await user.keyboard(' ');

      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('toggles when Enter key is pressed', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<Toggle checked={false} onChange={handleChange} aria-label="Toggle" />);
      const toggle = screen.getByRole('switch');
      toggle.focus();
      await user.keyboard('{Enter}');

      expect(handleChange).toHaveBeenCalledWith(true);
    });

    it('does not toggle on other keys', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<Toggle checked={false} onChange={handleChange} aria-label="Toggle" />);
      const toggle = screen.getByRole('switch');
      toggle.focus();
      await user.keyboard('a');

      expect(handleChange).not.toHaveBeenCalled();
    });

    it('does not toggle with keyboard when disabled', async () => {
      const handleChange = vi.fn();
      const user = userEvent.setup();

      render(<Toggle checked={false} onChange={handleChange} disabled aria-label="Toggle" />);
      const toggle = screen.getByRole('switch');
      toggle.focus();
      await user.keyboard(' ');

      expect(handleChange).not.toHaveBeenCalled();
    });
  });

  describe('Label integration', () => {
    it('associates label with toggle using aria-labelledby', () => {
      render(<Toggle checked={false} onChange={vi.fn()} label="Sound effects" />);
      const toggle = screen.getByRole('switch');
      const labelId = toggle.getAttribute('aria-labelledby');
      expect(labelId).toBeTruthy();

      const label = document.getElementById(labelId!);
      expect(label?.textContent).toBe('Sound effects');
    });
  });
});
