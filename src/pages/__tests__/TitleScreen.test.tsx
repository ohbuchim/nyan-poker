import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TitleScreen } from '../TitleScreen';

describe('TitleScreen', () => {
  const defaultProps = {
    onStartSolo: vi.fn(),
    onStartBattle: vi.fn(),
    onShowRules: vi.fn(),
    onShowStats: vi.fn(),
    onShowSettings: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders the title screen container', () => {
      render(<TitleScreen {...defaultProps} />);
      // The container should have the titleScreen class
      const container = document.querySelector('[class*="titleScreen"]');
      expect(container).toBeInTheDocument();
    });

    it('displays the game title', () => {
      render(<TitleScreen {...defaultProps} />);
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('にゃんポーカー');
    });

    it('displays the subtitle', () => {
      render(<TitleScreen {...defaultProps} />);
      expect(screen.getByText('猫カードで役を揃えるポーカーゲーム')).toBeInTheDocument();
    });

    it('renders four decorative cat cards', () => {
      render(<TitleScreen {...defaultProps} />);
      const images = screen.getAllByRole('img', { name: /装飾用猫カード/i });
      expect(images).toHaveLength(4);
    });

    it('decorative cards have correct alt text', () => {
      render(<TitleScreen {...defaultProps} />);
      for (let i = 1; i <= 4; i++) {
        expect(screen.getByAltText(`装飾用猫カード ${i}`)).toBeInTheDocument();
      }
    });

    it('renders the solo mode button', () => {
      render(<TitleScreen {...defaultProps} />);
      expect(screen.getByRole('button', { name: /ひとりで遊ぶ/i })).toBeInTheDocument();
    });

    it('renders the battle mode button', () => {
      render(<TitleScreen {...defaultProps} />);
      expect(screen.getByRole('button', { name: /対戦モード/i })).toBeInTheDocument();
    });

    it('renders the rules button in footer', () => {
      render(<TitleScreen {...defaultProps} />);
      expect(screen.getByRole('button', { name: /遊び方/i })).toBeInTheDocument();
    });

    it('renders the stats button in footer', () => {
      render(<TitleScreen {...defaultProps} />);
      expect(screen.getByRole('button', { name: /戦績/i })).toBeInTheDocument();
    });

    it('renders the settings button in footer', () => {
      render(<TitleScreen {...defaultProps} />);
      expect(screen.getByRole('button', { name: /設定/i })).toBeInTheDocument();
    });
  });

  describe('Decorative Cards', () => {
    it('renders cards with correct image sources', () => {
      render(<TitleScreen {...defaultProps} />);
      const images = screen.getAllByRole('img', { name: /装飾用猫カード/i });

      const expectedPaths = [
        '/images/image_016.jpg',
        '/images/image_028.jpg',
        '/images/image_073.jpg',
        '/images/image_023.jpg',
      ];

      images.forEach((img, index) => {
        expect(img).toHaveAttribute('src', expectedPaths[index]);
      });
    });

    it('renders cards with rotation styles', () => {
      render(<TitleScreen {...defaultProps} />);
      const cardContainers = document.querySelectorAll('[class*="titleCatCard"]');
      expect(cardContainers).toHaveLength(4);

      // Check that each card has a rotation style
      const rotations = ['-12deg', '-4deg', '4deg', '12deg'];
      cardContainers.forEach((card, index) => {
        const style = card.getAttribute('style');
        expect(style).toContain(`--rotation: ${rotations[index]}`);
      });
    });
  });

  describe('Button Interactions', () => {
    it('calls onStartSolo when solo button is clicked', async () => {
      const user = userEvent.setup();
      render(<TitleScreen {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /ひとりで遊ぶ/i }));
      expect(defaultProps.onStartSolo).toHaveBeenCalledTimes(1);
    });

    it('calls onStartBattle when battle button is clicked', async () => {
      const user = userEvent.setup();
      render(<TitleScreen {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /対戦モード/i }));
      expect(defaultProps.onStartBattle).toHaveBeenCalledTimes(1);
    });

    it('calls onShowRules when rules button is clicked', async () => {
      const user = userEvent.setup();
      render(<TitleScreen {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /遊び方/i }));
      expect(defaultProps.onShowRules).toHaveBeenCalledTimes(1);
    });

    it('calls onShowStats when stats button is clicked', async () => {
      const user = userEvent.setup();
      render(<TitleScreen {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /戦績/i }));
      expect(defaultProps.onShowStats).toHaveBeenCalledTimes(1);
    });

    it('calls onShowSettings when settings button is clicked', async () => {
      const user = userEvent.setup();
      render(<TitleScreen {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /設定/i }));
      expect(defaultProps.onShowSettings).toHaveBeenCalledTimes(1);
    });
  });

  describe('Accessibility', () => {
    it('solo button has proper aria-label', () => {
      render(<TitleScreen {...defaultProps} />);
      const button = screen.getByRole('button', { name: /ひとりで遊ぶモードを開始/i });
      expect(button).toBeInTheDocument();
    });

    it('battle button has proper aria-label', () => {
      render(<TitleScreen {...defaultProps} />);
      const button = screen.getByRole('button', { name: /対戦モードを開始/i });
      expect(button).toBeInTheDocument();
    });

    it('rules button has proper aria-label', () => {
      render(<TitleScreen {...defaultProps} />);
      const button = screen.getByRole('button', { name: /遊び方を見る/i });
      expect(button).toBeInTheDocument();
    });

    it('stats button has proper aria-label', () => {
      render(<TitleScreen {...defaultProps} />);
      const button = screen.getByRole('button', { name: /戦績を見る/i });
      expect(button).toBeInTheDocument();
    });

    it('settings button has proper aria-label', () => {
      render(<TitleScreen {...defaultProps} />);
      const button = screen.getByRole('button', { name: /設定を開く/i });
      expect(button).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('renders title logo section', () => {
      render(<TitleScreen {...defaultProps} />);
      const titleLogo = document.querySelector('[class*="titleLogo"]');
      expect(titleLogo).toBeInTheDocument();
    });

    it('renders title cats section', () => {
      render(<TitleScreen {...defaultProps} />);
      const titleCats = document.querySelector('[class*="titleCats"]');
      expect(titleCats).toBeInTheDocument();
    });

    it('renders title menu section', () => {
      render(<TitleScreen {...defaultProps} />);
      const titleMenu = document.querySelector('[class*="titleMenu"]');
      expect(titleMenu).toBeInTheDocument();
    });

    it('renders title footer section', () => {
      render(<TitleScreen {...defaultProps} />);
      const titleFooter = document.querySelector('[class*="titleFooter"]');
      expect(titleFooter).toBeInTheDocument();
    });
  });

  describe('Footer Button Icons', () => {
    it('rules button displays question mark icon', () => {
      render(<TitleScreen {...defaultProps} />);
      const rulesButton = screen.getByRole('button', { name: /遊び方を見る/i });
      expect(rulesButton).toHaveTextContent('?');
    });

    it('footer buttons have labels', () => {
      render(<TitleScreen {...defaultProps} />);

      // Check that button labels are rendered
      expect(screen.getByText('遊び方')).toBeInTheDocument();
      expect(screen.getByText('戦績')).toBeInTheDocument();
      expect(screen.getByText('設定')).toBeInTheDocument();
    });
  });

  describe('Multiple Button Clicks', () => {
    it('each button callback is called independently', async () => {
      const user = userEvent.setup();
      render(<TitleScreen {...defaultProps} />);

      await user.click(screen.getByRole('button', { name: /ひとりで遊ぶモードを開始/i }));
      await user.click(screen.getByRole('button', { name: /対戦モードを開始/i }));
      await user.click(screen.getByRole('button', { name: /遊び方を見る/i }));
      await user.click(screen.getByRole('button', { name: /戦績を見る/i }));
      await user.click(screen.getByRole('button', { name: /設定を開く/i }));

      expect(defaultProps.onStartSolo).toHaveBeenCalledTimes(1);
      expect(defaultProps.onStartBattle).toHaveBeenCalledTimes(1);
      expect(defaultProps.onShowRules).toHaveBeenCalledTimes(1);
      expect(defaultProps.onShowStats).toHaveBeenCalledTimes(1);
      expect(defaultProps.onShowSettings).toHaveBeenCalledTimes(1);
    });

    it('clicking the same button multiple times calls callback multiple times', async () => {
      const user = userEvent.setup();
      render(<TitleScreen {...defaultProps} />);

      const soloButton = screen.getByRole('button', { name: /ひとりで遊ぶモードを開始/i });
      await user.click(soloButton);
      await user.click(soloButton);
      await user.click(soloButton);

      expect(defaultProps.onStartSolo).toHaveBeenCalledTimes(3);
    });
  });

  describe('Button Variants', () => {
    it('solo button uses primary variant (has lg size)', () => {
      render(<TitleScreen {...defaultProps} />);
      const soloButton = screen.getByRole('button', { name: /ひとりで遊ぶモードを開始/i });
      // Button with lg size should have the lg class
      expect(soloButton.className).toMatch(/lg/i);
    });

    it('battle button uses secondary variant (has lg size)', () => {
      render(<TitleScreen {...defaultProps} />);
      const battleButton = screen.getByRole('button', { name: /対戦モードを開始/i });
      // Button with lg size should have the lg class
      expect(battleButton.className).toMatch(/lg/i);
    });
  });
});
