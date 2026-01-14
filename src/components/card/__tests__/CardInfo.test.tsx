import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CardInfo } from '../CardInfo';
import { COLOR_NAMES, FUR_NAMES } from '../../../types';
import type { ColorCode, FurCode } from '../../../types';

describe('CardInfo', () => {
  describe('Rendering', () => {
    it('renders color name correctly', () => {
      render(<CardInfo color={0} fur={1} />);
      expect(screen.getByText(COLOR_NAMES[0])).toBeInTheDocument();
    });

    it('renders fur name correctly', () => {
      render(<CardInfo color={0} fur={1} />);
      expect(screen.getByText(FUR_NAMES[1])).toBeInTheDocument();
    });

    it('applies card-info class', () => {
      const { container } = render(<CardInfo color={0} fur={1} />);
      expect(container.firstChild?.className).toContain('card-info');
    });

    it('merges custom className', () => {
      const { container } = render(<CardInfo color={0} fur={1} className="custom-class" />);
      expect(container.firstChild?.className).toContain('custom-class');
      expect(container.firstChild?.className).toContain('card-info');
    });
  });

  describe('All color codes', () => {
    const colorCodes: ColorCode[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

    colorCodes.forEach((colorCode) => {
      it(`renders color name for code ${colorCode} (${COLOR_NAMES[colorCode]})`, () => {
        render(<CardInfo color={colorCode} fur={1} />);
        expect(screen.getByText(COLOR_NAMES[colorCode])).toBeInTheDocument();
      });
    });
  });

  describe('All fur codes', () => {
    const furCodes: FurCode[] = [0, 1];

    furCodes.forEach((furCode) => {
      it(`renders fur name for code ${furCode} (${FUR_NAMES[furCode]})`, () => {
        render(<CardInfo color={0} fur={furCode} />);
        expect(screen.getByText(FUR_NAMES[furCode])).toBeInTheDocument();
      });
    });
  });

  describe('States', () => {
    it('applies dimmed class when isDimmed is true', () => {
      const { container } = render(<CardInfo color={0} fur={1} isDimmed />);
      expect(container.firstChild?.className).toContain('card-info--dimmed');
    });

    it('does not apply dimmed class by default', () => {
      const { container } = render(<CardInfo color={0} fur={1} />);
      expect(container.firstChild?.className).not.toContain('card-info--dimmed');
    });

    it('applies highlighted class when isHighlighted is true', () => {
      const { container } = render(<CardInfo color={0} fur={1} isHighlighted />);
      expect(container.firstChild?.className).toContain('card-info--highlighted');
    });

    it('does not apply highlighted class by default', () => {
      const { container } = render(<CardInfo color={0} fur={1} />);
      expect(container.firstChild?.className).not.toContain('card-info--highlighted');
    });

    it('can apply both dimmed and highlighted classes', () => {
      const { container } = render(<CardInfo color={0} fur={1} isDimmed isHighlighted />);
      expect(container.firstChild?.className).toContain('card-info--dimmed');
      expect(container.firstChild?.className).toContain('card-info--highlighted');
    });

    it('applies compact class when isCompact is true', () => {
      const { container } = render(<CardInfo color={0} fur={1} isCompact />);
      expect(container.firstChild?.className).toContain('card-info--compact');
    });

    it('does not apply compact class by default', () => {
      const { container } = render(<CardInfo color={0} fur={1} />);
      expect(container.firstChild?.className).not.toContain('card-info--compact');
    });

    it('can apply compact with other state classes', () => {
      const { container } = render(<CardInfo color={0} fur={1} isCompact isDimmed isHighlighted />);
      expect(container.firstChild?.className).toContain('card-info--compact');
      expect(container.firstChild?.className).toContain('card-info--dimmed');
      expect(container.firstChild?.className).toContain('card-info--highlighted');
    });
  });

  describe('Structure', () => {
    it('renders color in a span with card-info__color class', () => {
      const { container } = render(<CardInfo color={0} fur={1} />);
      const colorSpan = container.querySelector('[class*="card-info__color"]');
      expect(colorSpan).toBeInTheDocument();
      expect(colorSpan?.textContent).toBe(COLOR_NAMES[0]);
    });

    it('renders fur in a span with card-info__fur class', () => {
      const { container } = render(<CardInfo color={0} fur={1} />);
      const furSpan = container.querySelector('[class*="card-info__fur"]');
      expect(furSpan).toBeInTheDocument();
      expect(furSpan?.textContent).toBe(FUR_NAMES[1]);
    });
  });

  describe('Edge cases', () => {
    it('renders correctly with all props', () => {
      render(<CardInfo color={11} fur={0} isDimmed isHighlighted className="test" />);
      expect(screen.getByText(COLOR_NAMES[11])).toBeInTheDocument();
      expect(screen.getByText(FUR_NAMES[0])).toBeInTheDocument();
    });

    it('renders correctly for rarest color (Sabi)', () => {
      render(<CardInfo color={11} fur={0} />);
      expect(screen.getByText('サビ')).toBeInTheDocument();
    });

    it('renders correctly for long fur', () => {
      render(<CardInfo color={0} fur={0} />);
      expect(screen.getByText('長毛')).toBeInTheDocument();
    });

    it('renders correctly for short fur', () => {
      render(<CardInfo color={0} fur={1} />);
      expect(screen.getByText('短毛')).toBeInTheDocument();
    });
  });
});
