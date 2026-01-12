// components/game/__tests__/RoleDisplay.test.tsx

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { RoleDisplay } from '../RoleDisplay';
import type { Role } from '../../../types';

const createMockRole = (overrides: Partial<Role> = {}): Role => ({
  type: 'onePair',
  name: 'ワンペア',
  points: 5,
  matchingCardIds: [1, 2],
  ...overrides,
});

describe('RoleDisplay', () => {
  describe('visibility', () => {
    it('shows content when visible is true and role is provided', () => {
      const role = createMockRole();
      render(<RoleDisplay role={role} visible={true} />);

      expect(screen.getByText('ワンペア')).toBeInTheDocument();
      expect(screen.getByText('+5 ポイント')).toBeInTheDocument();
    });

    it('hides content when visible is false', () => {
      const role = createMockRole();
      render(<RoleDisplay role={role} visible={false} />);

      expect(screen.queryByText('ワンペア')).not.toBeInTheDocument();
    });

    it('shows nothing when role is null', () => {
      render(<RoleDisplay role={null} visible={true} />);

      expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });
  });

  describe('points formatting', () => {
    it('displays positive points with plus sign', () => {
      const role = createMockRole({ points: 10 });
      render(<RoleDisplay role={role} visible={true} />);

      expect(screen.getByText('+10 ポイント')).toBeInTheDocument();
    });

    it('displays negative points with minus sign', () => {
      const role = createMockRole({ points: -5 });
      render(<RoleDisplay role={role} visible={true} />);

      expect(screen.getByText('-5 ポイント')).toBeInTheDocument();
    });

    it('displays zero points without sign', () => {
      const role = createMockRole({ points: 0 });
      render(<RoleDisplay role={role} visible={true} />);

      expect(screen.getByText('0 ポイント')).toBeInTheDocument();
    });
  });

  describe('role types', () => {
    it('applies no-pair class for noPair role', () => {
      const role = createMockRole({ type: 'noPair', name: 'ブタ', points: 0 });
      const { container } = render(<RoleDisplay role={role} visible={true} />);

      const heading = container.querySelector('h2');
      expect(heading?.className).toContain('role-name--no-pair');
    });

    it('does not apply no-pair class for other roles', () => {
      const role = createMockRole({ type: 'flush', name: 'フラッシュ', points: 15 });
      const { container } = render(<RoleDisplay role={role} visible={true} />);

      const heading = container.querySelector('h2');
      expect(heading?.className).not.toContain('role-name--no-pair');
    });
  });

  describe('accessibility', () => {
    it('has aria-live polite attribute for announcements', () => {
      const role = createMockRole();
      const { container } = render(<RoleDisplay role={role} visible={true} />);

      const container_element = container.firstChild;
      expect(container_element).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('styling classes', () => {
    it('applies visible class when visible', () => {
      const role = createMockRole();
      const { container } = render(<RoleDisplay role={role} visible={true} />);

      const containerEl = container.firstChild;
      expect(containerEl?.className).toContain('visible');
    });

    it('applies hidden class when not visible', () => {
      const role = createMockRole();
      const { container } = render(<RoleDisplay role={role} visible={false} />);

      const containerEl = container.firstChild;
      expect(containerEl?.className).toContain('hidden');
    });

    it('applies positive points class for positive points', () => {
      const role = createMockRole({ points: 10 });
      const { container } = render(<RoleDisplay role={role} visible={true} />);

      const pointsEl = container.querySelector('span');
      expect(pointsEl?.className).toContain('positive');
    });

    it('applies negative points class for negative points', () => {
      const role = createMockRole({ points: -10 });
      const { container } = render(<RoleDisplay role={role} visible={true} />);

      const pointsEl = container.querySelector('span');
      expect(pointsEl?.className).toContain('negative');
    });

    it('applies zero points class for zero points', () => {
      const role = createMockRole({ points: 0 });
      const { container } = render(<RoleDisplay role={role} visible={true} />);

      const pointsEl = container.querySelector('span');
      expect(pointsEl?.className).toContain('zero');
    });
  });
});
