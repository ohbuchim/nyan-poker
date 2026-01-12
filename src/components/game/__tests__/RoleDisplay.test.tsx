import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { RoleDisplay } from '../RoleDisplay';
import type { Role } from '../../../types';

describe('RoleDisplay', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
  });

  const mockRole: Role = {
    type: 'flush',
    name: 'Test Flush',
    points: 100,
    matchingCardIds: [1, 2, 3, 4, 5],
  };

  const noPairRole: Role = {
    type: 'noPair',
    name: 'No Pair',
    points: 0,
    matchingCardIds: [],
  };

  const negativePointsRole: Role = {
    type: 'flush',
    name: 'Test Role',
    points: -50,
    matchingCardIds: [1, 2, 3, 4, 5],
  };

  describe('visibility', () => {
    it('should have hidden class when visible is false', () => {
      const { container } = render(<RoleDisplay role={mockRole} visible={false} />);
      const element = container.querySelector('[aria-live="polite"]');
      expect(element?.className).toMatch(/container--hidden/);
    });

    it('should have visible class when visible is true', () => {
      const { container } = render(<RoleDisplay role={mockRole} visible={true} />);
      const element = container.querySelector('[aria-live="polite"]');
      expect(element?.className).toMatch(/container--visible/);
    });

    it('should not render role content when role is null', () => {
      render(<RoleDisplay role={null} visible={true} />);

      // Advance timers to check that nothing appears
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('should not render role content when visible is false', () => {
      render(<RoleDisplay role={mockRole} visible={false} />);

      // Advance timers to check that nothing appears
      act(() => {
        vi.advanceTimersByTime(300);
      });

      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });
  });

  describe('delayed role name display', () => {
    it('should delay role name display by 200ms', () => {
      render(<RoleDisplay role={mockRole} visible={true} />);

      // Initially, role name should not be displayed
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();

      // Advance timers by 100ms - still should not be visible
      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(screen.queryByRole('heading')).not.toBeInTheDocument();

      // Advance timers by another 100ms (total 200ms) - now should be visible
      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(screen.getByRole('heading', { name: 'Test Flush' })).toBeInTheDocument();
    });

    it('should reset and re-trigger animation when role changes', () => {
      const { rerender } = render(<RoleDisplay role={mockRole} visible={true} />);

      // Advance timers to show first role
      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(screen.getByRole('heading', { name: 'Test Flush' })).toBeInTheDocument();

      // Change the role
      const newRole: Role = {
        type: 'fullHouse',
        name: 'Full House',
        points: 150,
        matchingCardIds: [1, 2, 3, 4, 5],
      };

      rerender(<RoleDisplay role={newRole} visible={true} />);

      // Role name should be hidden again during delay
      expect(screen.queryByRole('heading', { name: 'Full House' })).not.toBeInTheDocument();

      // Advance timers by 200ms
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Now new role name should be displayed
      expect(screen.getByRole('heading', { name: 'Full House' })).toBeInTheDocument();
    });

    it('should cleanup timer on unmount', () => {
      const { unmount } = render(<RoleDisplay role={mockRole} visible={true} />);

      // Unmount before timer fires
      unmount();

      // Should not throw any errors
      act(() => {
        vi.advanceTimersByTime(300);
      });
    });
  });

  describe('role name styling', () => {
    it('should have no-pair styling for noPair role', () => {
      render(<RoleDisplay role={noPairRole} visible={true} />);

      act(() => {
        vi.advanceTimersByTime(200);
      });

      const heading = screen.getByRole('heading', { name: 'No Pair' });
      expect(heading.className).toMatch(/role-name--no-pair/);
    });

    it('should not have no-pair styling for other roles', () => {
      render(<RoleDisplay role={mockRole} visible={true} />);

      act(() => {
        vi.advanceTimersByTime(200);
      });

      const heading = screen.getByRole('heading', { name: 'Test Flush' });
      expect(heading.className).not.toMatch(/role-name--no-pair/);
    });
  });

  describe('points display', () => {
    it('should display positive points with + prefix', () => {
      render(<RoleDisplay role={mockRole} visible={true} />);

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(screen.getByText('+100 ポイント')).toBeInTheDocument();
    });

    it('should display zero points without prefix', () => {
      render(<RoleDisplay role={noPairRole} visible={true} />);

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(screen.getByText('0 ポイント')).toBeInTheDocument();
    });

    it('should display negative points with - prefix', () => {
      render(<RoleDisplay role={negativePointsRole} visible={true} />);

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(screen.getByText('-50 ポイント')).toBeInTheDocument();
    });

    it('should have positive class for positive points', () => {
      render(<RoleDisplay role={mockRole} visible={true} />);

      act(() => {
        vi.advanceTimersByTime(200);
      });

      const pointsElement = screen.getByText('+100 ポイント');
      expect(pointsElement.className).toMatch(/points--positive/);
    });

    it('should have zero class for zero points', () => {
      render(<RoleDisplay role={noPairRole} visible={true} />);

      act(() => {
        vi.advanceTimersByTime(200);
      });

      const pointsElement = screen.getByText('0 ポイント');
      expect(pointsElement.className).toMatch(/points--zero/);
    });

    it('should have negative class for negative points', () => {
      render(<RoleDisplay role={negativePointsRole} visible={true} />);

      act(() => {
        vi.advanceTimersByTime(200);
      });

      const pointsElement = screen.getByText('-50 ポイント');
      expect(pointsElement.className).toMatch(/points--negative/);
    });
  });

  describe('accessibility', () => {
    it('should have aria-live attribute for screen readers', () => {
      const { container } = render(<RoleDisplay role={mockRole} visible={true} />);
      const element = container.querySelector('[aria-live="polite"]');
      expect(element).toBeInTheDocument();
      expect(element).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('hiding role', () => {
    it('should hide role when visible becomes false', () => {
      const { rerender } = render(<RoleDisplay role={mockRole} visible={true} />);

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(screen.getByRole('heading', { name: 'Test Flush' })).toBeInTheDocument();

      rerender(<RoleDisplay role={mockRole} visible={false} />);

      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    it('should hide role when role becomes null', () => {
      const { rerender } = render(<RoleDisplay role={mockRole} visible={true} />);

      act(() => {
        vi.advanceTimersByTime(200);
      });

      expect(screen.getByRole('heading', { name: 'Test Flush' })).toBeInTheDocument();

      rerender(<RoleDisplay role={null} visible={true} />);

      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });
  });
});
