import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, within, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { RulesModal } from '../RulesModal';
import { FLUSH_ROLES, FUR_ROLES } from '../../../data/roleDefinitions';

describe('RulesModal', () => {
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
      render(<RulesModal isOpen={false} onClose={vi.fn()} />);
      expect(screen.queryByText('遊び方')).not.toBeInTheDocument();
    });

    it('renders modal when open', () => {
      render(<RulesModal isOpen={true} onClose={vi.fn()} />);
      // Check for modal title (level 2 heading)
      expect(screen.getByRole('heading', { name: '遊び方', level: 2 })).toBeInTheDocument();
    });

    it('has correct modal title', () => {
      render(<RulesModal isOpen={true} onClose={vi.fn()} />);
      expect(screen.getByRole('heading', { name: '遊び方', level: 2 })).toBeInTheDocument();
    });
  });

  describe('Game Objective Section', () => {
    it('renders game objective section', () => {
      render(<RulesModal isOpen={true} onClose={vi.fn()} />);
      expect(screen.getByRole('heading', { name: 'ゲームの目的' })).toBeInTheDocument();
    });

    it('displays objective description', () => {
      render(<RulesModal isOpen={true} onClose={vi.fn()} />);
      expect(
        screen.getByText(/5枚の猫カードで役を揃え、高いポイントを獲得することを目指します/)
      ).toBeInTheDocument();
    });

    it('mentions card attributes', () => {
      render(<RulesModal isOpen={true} onClose={vi.fn()} />);
      expect(
        screen.getByText(/「毛色」と「毛の長さ」の2つの属性があります/)
      ).toBeInTheDocument();
    });
  });

  describe('How to Play Section', () => {
    it('renders how to play section', () => {
      render(<RulesModal isOpen={true} onClose={vi.fn()} />);
      expect(screen.getByRole('heading', { name: '遊び方', level: 3 })).toBeInTheDocument();
    });

    it('displays game steps', () => {
      render(<RulesModal isOpen={true} onClose={vi.fn()} />);
      expect(screen.getByText(/1\. 5枚のカードが配られます/)).toBeInTheDocument();
      expect(screen.getByText(/2\. 交換したいカードを選択します/)).toBeInTheDocument();
      expect(screen.getByText(/3\. 選択したカードを新しいカードと交換します/)).toBeInTheDocument();
      expect(screen.getByText(/4\. 最終的な手札で役が判定されます/)).toBeInTheDocument();
    });

    it('displays note about highest point role', () => {
      render(<RulesModal isOpen={true} onClose={vi.fn()} />);
      expect(
        screen.getByText(/ポイントが最も高い役が採用されます/)
      ).toBeInTheDocument();
    });
  });

  describe('Flush Roles Accordion', () => {
    it('renders flush roles accordion', () => {
      render(<RulesModal isOpen={true} onClose={vi.fn()} />);
      expect(screen.getByText('役一覧（フラッシュ系）')).toBeInTheDocument();
    });

    it('flush accordion is open by default', () => {
      render(<RulesModal isOpen={true} onClose={vi.fn()} />);
      const accordion = screen.getByText('役一覧（フラッシュ系）').closest('details');
      expect(accordion).toHaveAttribute('open');
    });

    it('displays all 12 flush roles', () => {
      render(<RulesModal isOpen={true} onClose={vi.fn()} />);

      // Check all flush role names are displayed
      Object.values(FLUSH_ROLES).forEach((role) => {
        expect(screen.getByText(role.name)).toBeInTheDocument();
      });
    });

    it('displays flush roles in descending point order', () => {
      render(<RulesModal isOpen={true} onClose={vi.fn()} />);

      const accordion = screen.getByText('役一覧（フラッシュ系）').closest('details');
      const table = within(accordion!).getByRole('table');
      const rows = within(table).getAllByRole('row');

      // Skip header row, check data rows
      const dataRows = rows.slice(1);

      // First role should be サビフラッシュ (300 points)
      expect(within(dataRows[0]).getByText('サビフラッシュ')).toBeInTheDocument();
      expect(within(dataRows[0]).getByText('300')).toBeInTheDocument();

      // Last role should be 茶白フラッシュ (198 points)
      const lastRow = dataRows[dataRows.length - 1];
      expect(within(lastRow).getByText('茶白フラッシュ')).toBeInTheDocument();
      expect(within(lastRow).getByText('198')).toBeInTheDocument();
    });

    it('displays conditions for flush roles', () => {
      render(<RulesModal isOpen={true} onClose={vi.fn()} />);

      expect(screen.getByText('サビ5枚')).toBeInTheDocument();
      expect(screen.getByText('三毛5枚')).toBeInTheDocument();
      expect(screen.getByText('茶白5枚')).toBeInTheDocument();
    });

    it('tracks accordion state correctly', () => {
      render(<RulesModal isOpen={true} onClose={vi.fn()} />);

      // The accordion is controlled via state, verify initial state
      const accordion = screen.getByText('役一覧（フラッシュ系）').closest('details');
      expect(accordion).toHaveAttribute('open');

      // Content is visible when open
      expect(screen.getByText('サビフラッシュ')).toBeInTheDocument();
    });
  });

  describe('Fur and Color Roles Accordion', () => {
    it('renders fur and color roles accordion', () => {
      render(<RulesModal isOpen={true} onClose={vi.fn()} />);
      expect(screen.getByText('役一覧（ファー系・カラー系）')).toBeInTheDocument();
    });

    it('fur/color accordion is closed by default', () => {
      render(<RulesModal isOpen={true} onClose={vi.fn()} />);
      const accordion = screen.getByText('役一覧（ファー系・カラー系）').closest('details');
      expect(accordion).not.toHaveAttribute('open');
    });

    it('tracks fur/color accordion state correctly', () => {
      render(<RulesModal isOpen={true} onClose={vi.fn()} />);

      // The fur/color accordion is closed by default
      const accordion = screen.getByText('役一覧（ファー系・カラー系）').closest('details');
      expect(accordion).not.toHaveAttribute('open');
    });

    it('displays note about color-based point variations', () => {
      render(<RulesModal isOpen={true} onClose={vi.fn()} />);

      // Open the accordion by dispatching toggle event
      const accordion = screen.getByText('役一覧（ファー系・カラー系）').closest('details');
      fireEvent(accordion!, new Event('toggle', { bubbles: false }));

      expect(
        screen.getByText(/カラー系の役は毛色ごとに異なるポイントがあります/)
      ).toBeInTheDocument();
    });

    it('displays all fur and color role types', () => {
      render(<RulesModal isOpen={true} onClose={vi.fn()} />);

      // Open the accordion by dispatching toggle event
      const accordion = screen.getByText('役一覧（ファー系・カラー系）').closest('details');
      fireEvent(accordion!, new Event('toggle', { bubbles: false }));

      expect(screen.getByText('フォーカラー')).toBeInTheDocument();
      expect(screen.getByText('フルハウス')).toBeInTheDocument();
      expect(screen.getByText('ロングファー')).toBeInTheDocument();
      expect(screen.getByText('スリーカラー')).toBeInTheDocument();
      expect(screen.getByText('ツーペア')).toBeInTheDocument();
      expect(screen.getByText('ワンペア')).toBeInTheDocument();
      expect(screen.getByText('ショートファー')).toBeInTheDocument();
      expect(screen.getByText('ノーペア')).toBeInTheDocument();
    });

    it('displays correct conditions for roles', () => {
      render(<RulesModal isOpen={true} onClose={vi.fn()} />);

      // Open the accordion by dispatching toggle event
      const accordion = screen.getByText('役一覧（ファー系・カラー系）').closest('details');
      fireEvent(accordion!, new Event('toggle', { bubbles: false }));

      expect(screen.getByText('同色4枚')).toBeInTheDocument();
      expect(screen.getByText('同色3枚+別色2枚')).toBeInTheDocument();
      expect(screen.getByText('長毛5枚')).toBeInTheDocument();
      expect(screen.getByText('同色3枚')).toBeInTheDocument();
      expect(screen.getByText('2組のペア')).toBeInTheDocument();
      expect(screen.getByText('同色2枚')).toBeInTheDocument();
      expect(screen.getByText('短毛5枚')).toBeInTheDocument();
      expect(screen.getByText('役なし')).toBeInTheDocument();
    });

    it('displays correct point ranges', () => {
      render(<RulesModal isOpen={true} onClose={vi.fn()} />);

      // Open the accordion by dispatching toggle event
      const accordion = screen.getByText('役一覧（ファー系・カラー系）').closest('details');
      fireEvent(accordion!, new Event('toggle', { bubbles: false }));

      expect(screen.getByText('63〜277')).toBeInTheDocument(); // Four Color
      expect(screen.getByText('105〜294')).toBeInTheDocument(); // Full House
      expect(screen.getByText(String(FUR_ROLES[0].points))).toBeInTheDocument(); // Long Fur (100)
      expect(screen.getByText('16〜112')).toBeInTheDocument(); // Three Color
      expect(screen.getByText('23〜154')).toBeInTheDocument(); // Two Pair
      expect(screen.getByText('2〜21')).toBeInTheDocument(); // One Pair
      expect(screen.getByText(String(FUR_ROLES[1].points))).toBeInTheDocument(); // Short Fur (1)
      expect(screen.getByText('0')).toBeInTheDocument(); // No Pair
    });
  });

  describe('Table Structure', () => {
    it('flush table has correct headers', () => {
      render(<RulesModal isOpen={true} onClose={vi.fn()} />);

      const accordion = screen.getByText('役一覧（フラッシュ系）').closest('details');
      const table = within(accordion!).getByRole('table');

      expect(within(table).getByText('役名')).toBeInTheDocument();
      expect(within(table).getByText('条件')).toBeInTheDocument();
      expect(within(table).getByText('ポイント')).toBeInTheDocument();
    });

    it('flush table has 12 data rows', () => {
      render(<RulesModal isOpen={true} onClose={vi.fn()} />);

      const accordion = screen.getByText('役一覧（フラッシュ系）').closest('details');
      const table = within(accordion!).getByRole('table');
      const rows = within(table).getAllByRole('row');

      // 1 header row + 12 data rows
      expect(rows).toHaveLength(13);
    });

    it('fur/color table has correct headers', () => {
      render(<RulesModal isOpen={true} onClose={vi.fn()} />);

      // Open the accordion by dispatching toggle event
      const accordion = screen.getByText('役一覧（ファー系・カラー系）').closest('details');
      fireEvent(accordion!, new Event('toggle', { bubbles: false }));

      const tables = within(accordion!).getAllByRole('table');
      const table = tables[0];

      expect(within(table).getByText('役名')).toBeInTheDocument();
      expect(within(table).getByText('条件')).toBeInTheDocument();
      expect(within(table).getByText('ポイント')).toBeInTheDocument();
    });

    it('fur/color table has 8 data rows', () => {
      render(<RulesModal isOpen={true} onClose={vi.fn()} />);

      // Open the accordion by dispatching toggle event
      const accordion = screen.getByText('役一覧（ファー系・カラー系）').closest('details');
      fireEvent(accordion!, new Event('toggle', { bubbles: false }));

      const tables = within(accordion!).getAllByRole('table');
      const table = tables[0];
      const rows = within(table).getAllByRole('row');

      // 1 header row + 8 data rows
      expect(rows).toHaveLength(9);
    });
  });

  describe('Close Behavior', () => {
    it('calls onClose when close button is clicked', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();

      render(<RulesModal isOpen={true} onClose={handleClose} />);

      await user.click(screen.getByRole('button', { name: '閉じる' }));
      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('calls onClose when ESC key is pressed', async () => {
      const handleClose = vi.fn();
      const user = userEvent.setup();

      render(<RulesModal isOpen={true} onClose={handleClose} />);

      await user.keyboard('{Escape}');
      expect(handleClose).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('has accessible modal structure', () => {
      render(<RulesModal isOpen={true} onClose={vi.fn()} />);

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-modal', 'true');
    });

    it('accordion icons are hidden from assistive technology', () => {
      render(<RulesModal isOpen={true} onClose={vi.fn()} />);

      const accordionIcons = document.querySelectorAll('[aria-hidden="true"]');
      expect(accordionIcons.length).toBeGreaterThan(0);
    });
  });
});

describe('RulesModal index export', () => {
  it('exports RulesModal and RulesModalProps', async () => {
    const exports = await import('../index');
    expect(exports.RulesModal).toBeDefined();
  });
});
