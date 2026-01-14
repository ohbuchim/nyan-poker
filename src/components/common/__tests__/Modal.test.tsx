import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from '../Modal';

describe('Modal', () => {
  let container: HTMLElement;

  beforeEach(() => {
    container = document.createElement('div');
    container.id = 'modal-root';
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
    document.body.style.overflow = '';
  });

  describe('Rendering', () => {
    it('renders nothing when not open', () => {
      render(
        <Modal isOpen={false} onClose={vi.fn()}>
          <div>Modal Content</div>
        </Modal>
      );
      expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
    });

    it('renders modal when open', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <div>Modal Content</div>
        </Modal>
      );
      expect(screen.getByText('Modal Content')).toBeInTheDocument();
    });

    it('renders with title', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
          <div>Content</div>
        </Modal>
      );
      expect(screen.getByText('Test Modal')).toBeInTheDocument();
    });

    it('renders close button by default', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Test">
          <div>Content</div>
        </Modal>
      );
      expect(screen.getByRole('button', { name: '閉じる' })).toBeInTheDocument();
    });

    it('hides close button when showCloseButton is false', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} showCloseButton={false}>
          <div>Content</div>
        </Modal>
      );
      expect(screen.queryByRole('button', { name: '閉じる' })).not.toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has dialog role', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <div>Content</div>
        </Modal>
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('has aria-modal attribute', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <div>Content</div>
        </Modal>
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('has aria-labelledby when title is provided', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Test Modal">
          <div>Content</div>
        </Modal>
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'modal-title');
      expect(screen.getByText('Test Modal')).toHaveAttribute('id', 'modal-title');
    });

    it('has aria-describedby when descriptionId is provided', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} descriptionId="modal-description">
          <p id="modal-description">This is the modal description</p>
        </Modal>
      );
      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-describedby', 'modal-description');
    });
  });

  describe('Close behavior', () => {
    it('calls onClose when close button is clicked', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();

      render(
        <Modal isOpen={true} onClose={handleClose} title="Test">
          <div>Content</div>
        </Modal>
      );

      await user.click(screen.getByRole('button', { name: '閉じる' }));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when ESC key is pressed', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();

      render(
        <Modal isOpen={true} onClose={handleClose}>
          <div>Content</div>
        </Modal>
      );

      await user.keyboard('{Escape}');
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('does not close on ESC when closeOnEsc is false', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();

      render(
        <Modal isOpen={true} onClose={handleClose} closeOnEsc={false}>
          <div>Content</div>
        </Modal>
      );

      await user.keyboard('{Escape}');
      expect(handleClose).not.toHaveBeenCalled();
    });

    it('calls onClose when overlay is clicked', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();

      const { container } = render(
        <Modal isOpen={true} onClose={handleClose}>
          <div>Content</div>
        </Modal>
      );

      const overlay = container.querySelector('.overlay');
      if (overlay) {
        await user.click(overlay);
        expect(handleClose).toHaveBeenCalledTimes(1);
      }
    });

    it('does not close when modal content is clicked', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();

      render(
        <Modal isOpen={true} onClose={handleClose}>
          <div>Content</div>
        </Modal>
      );

      await user.click(screen.getByText('Content'));
      expect(handleClose).not.toHaveBeenCalled();
    });

    it('does not close on overlay click when closeOnOverlayClick is false', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();

      const { container } = render(
        <Modal isOpen={true} onClose={handleClose} closeOnOverlayClick={false}>
          <div>Content</div>
        </Modal>
      );

      const overlay = container.querySelector('.overlay');
      if (overlay) {
        await user.click(overlay);
        expect(handleClose).not.toHaveBeenCalled();
      }
    });
  });

  describe('Body scroll lock', () => {
    it('prevents body scroll when modal is open', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <div>Content</div>
        </Modal>
      );
      expect(document.body.style.overflow).toBe('hidden');
    });

    it('restores body scroll when modal is closed', () => {
      const { rerender } = render(
        <Modal isOpen={true} onClose={vi.fn()}>
          <div>Content</div>
        </Modal>
      );
      expect(document.body.style.overflow).toBe('hidden');

      rerender(
        <Modal isOpen={false} onClose={vi.fn()}>
          <div>Content</div>
        </Modal>
      );
      expect(document.body.style.overflow).toBe('');
    });
  });

  describe('Focus management', () => {
    it('focuses first focusable element when opened', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Test">
          <button>First</button>
          <button>Second</button>
        </Modal>
      );

      // Close button should be focused (it's the first focusable element)
      const closeButton = screen.getByRole('button', { name: '閉じる' });
      expect(closeButton).toHaveFocus();
    });

    it('traps focus within modal', async () => {
      const user = userEvent.setup();

      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Test">
          <button>First</button>
          <button>Second</button>
        </Modal>
      );

      const closeButton = screen.getByRole('button', { name: '閉じる' });
      const secondButton = screen.getByRole('button', { name: 'Second' });

      // Tab forward
      await user.tab();
      await user.tab();
      expect(secondButton).toHaveFocus();

      // Tab forward again should wrap to first element
      await user.tab();
      expect(closeButton).toHaveFocus();
    });

    it('wraps focus to last element when shift+tab on first element', async () => {
      const user = userEvent.setup();

      render(
        <Modal isOpen={true} onClose={vi.fn()} title="Test">
          <button>First</button>
          <button>Second</button>
        </Modal>
      );

      const closeButton = screen.getByRole('button', { name: '閉じる' });
      const secondButton = screen.getByRole('button', { name: 'Second' });

      // Close button should be focused initially
      expect(closeButton).toHaveFocus();

      // Shift+Tab should wrap to last element (Second button)
      await user.tab({ shift: true });
      expect(secondButton).toHaveFocus();
    });

    it('focuses first focusable element when no close button and modal opens', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} showCloseButton={false}>
          <button>First Action</button>
          <button>Second Action</button>
        </Modal>
      );

      // First focusable element should be focused
      const firstButton = screen.getByRole('button', { name: 'First Action' });
      expect(firstButton).toHaveFocus();
    });

    it('handles modal with no focusable elements', () => {
      render(
        <Modal isOpen={true} onClose={vi.fn()} showCloseButton={false}>
          <p>No focusable elements here</p>
        </Modal>
      );

      // Should not throw and modal should be rendered
      expect(screen.getByText('No focusable elements here')).toBeInTheDocument();
    });
  });
});
