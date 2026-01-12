import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '../Button';

describe('Button', () => {
  describe('Rendering', () => {
    it('renders with children', () => {
      render(<Button>Click me</Button>);
      expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
    });

    it('renders with icon', () => {
      render(<Button icon={<span>★</span>}>With Icon</Button>);
      expect(screen.getByText('★')).toBeInTheDocument();
      expect(screen.getByText('With Icon')).toBeInTheDocument();
    });

    it('renders footer button with label', () => {
      render(<Button variant="footer" icon={<span>⚙</span>} label="Settings" />);
      expect(screen.getByText('⚙')).toBeInTheDocument();
      expect(screen.getByText('Settings')).toBeInTheDocument();
    });

    it('renders icon-only button', () => {
      render(<Button variant="icon" icon={<span>?</span>} aria-label="Help" />);
      expect(screen.getByRole('button', { name: 'Help' })).toBeInTheDocument();
      expect(screen.getByText('?')).toBeInTheDocument();
    });
  });

  describe('Variants', () => {
    it('applies primary variant class', () => {
      const { container } = render(<Button variant="primary">Primary</Button>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('btn--primary');
    });

    it('applies secondary variant class', () => {
      const { container } = render(<Button variant="secondary">Secondary</Button>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('btn--secondary');
    });

    it('applies danger variant class', () => {
      const { container } = render(<Button variant="danger">Delete</Button>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('btn--danger');
    });

    it('applies text variant class', () => {
      const { container } = render(<Button variant="text">Text</Button>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('btn--text');
    });
  });

  describe('Sizes', () => {
    it('applies small size class', () => {
      const { container } = render(<Button size="sm">Small</Button>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('btn--sm');
    });

    it('applies medium size class by default', () => {
      const { container } = render(<Button>Medium</Button>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('btn--md');
    });

    it('applies large size class', () => {
      const { container } = render(<Button size="lg">Large</Button>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('btn--lg');
    });
  });

  describe('States', () => {
    it('shows loading spinner when loading', () => {
      const { container } = render(<Button loading>Loading</Button>);
      // CSS modules hash class names, so we check for the spinner by its structure
      const spinner = container.querySelector('span[class*="spinner"]');
      expect(spinner).toBeInTheDocument();
      expect(screen.queryByText('Loading')).not.toBeInTheDocument();
    });

    it('disables button when loading', () => {
      render(<Button loading>Loading</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('disables button when disabled prop is true', () => {
      render(<Button disabled>Disabled</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('applies loading class when loading', () => {
      const { container } = render(<Button loading>Loading</Button>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('btn--loading');
    });
  });

  describe('Interactions', () => {
    it('calls onClick when clicked', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      render(<Button onClick={handleClick}>Click</Button>);

      await user.click(screen.getByRole('button'));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('does not call onClick when disabled', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      render(<Button disabled onClick={handleClick}>Disabled</Button>);

      await user.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('does not call onClick when loading', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      render(<Button loading onClick={handleClick}>Loading</Button>);

      await user.click(screen.getByRole('button'));
      expect(handleClick).not.toHaveBeenCalled();
    });

    it('supports keyboard navigation', async () => {
      const handleClick = vi.fn();
      const user = userEvent.setup();
      render(<Button onClick={handleClick}>Keyboard</Button>);

      const button = screen.getByRole('button');
      button.focus();
      await user.keyboard('{Enter}');

      expect(handleClick).toHaveBeenCalled();
    });
  });

  describe('Custom props', () => {
    it('passes through additional props', () => {
      render(<Button data-testid="custom-button" type="submit">Submit</Button>);
      const button = screen.getByTestId('custom-button');
      expect(button).toHaveAttribute('type', 'submit');
    });

    it('merges custom className', () => {
      const { container } = render(<Button className="custom-class">Custom</Button>);
      const button = container.querySelector('button');
      expect(button?.className).toContain('custom-class');
      expect(button?.className).toContain('btn');
    });
  });

  describe('Accessibility', () => {
    it('has button role', () => {
      render(<Button>Accessible</Button>);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('supports aria-label', () => {
      render(<Button variant="icon" aria-label="Close">×</Button>);
      expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
    });

    it('is focusable when not disabled', () => {
      render(<Button>Focusable</Button>);
      const button = screen.getByRole('button');
      button.focus();
      expect(button).toHaveFocus();
    });

    it('is not focusable when disabled', () => {
      render(<Button disabled>Not Focusable</Button>);
      const button = screen.getByRole('button');
      button.focus();
      expect(button).not.toHaveFocus();
    });
  });
});
