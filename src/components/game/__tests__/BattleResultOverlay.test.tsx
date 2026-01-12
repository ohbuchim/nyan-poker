// components/game/__tests__/BattleResultOverlay.test.tsx

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BattleResultOverlay } from '../BattleResultOverlay';
import type { Role } from '../../../types';

/** テスト用の役生成ヘルパー */
function createRole(name: string, points: number, type: string = 'onePair'): Role {
  return {
    type: type as Role['type'],
    name,
    points,
    matchingCardIds: [],
  };
}

describe('BattleResultOverlay', () => {
  describe('表示/非表示', () => {
    it('visible=falseの場合、何も表示されない', () => {
      const onClose = vi.fn();
      const { container } = render(
        <BattleResultOverlay
          visible={false}
          result="win"
          playerRole={createRole('サビフラッシュ', 300)}
          dealerRole={createRole('ワンペア', 5)}
          pointsChange={300}
          onClose={onClose}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('visible=trueの場合、オーバーレイが表示される', () => {
      const onClose = vi.fn();
      render(
        <BattleResultOverlay
          visible={true}
          result="win"
          playerRole={createRole('サビフラッシュ', 300)}
          dealerRole={createRole('ワンペア', 5)}
          pointsChange={300}
          onClose={onClose}
        />
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });
  });

  describe('勝利時の表示', () => {
    it('WINと表示される', () => {
      const onClose = vi.fn();
      render(
        <BattleResultOverlay
          visible={true}
          result="win"
          playerRole={createRole('サビフラッシュ', 300)}
          dealerRole={createRole('ワンペア', 5)}
          pointsChange={300}
          onClose={onClose}
        />
      );
      expect(screen.getByText('WIN')).toBeInTheDocument();
    });

    it('プレイヤーの役名が表示される', () => {
      const onClose = vi.fn();
      render(
        <BattleResultOverlay
          visible={true}
          result="win"
          playerRole={createRole('サビフラッシュ', 300)}
          dealerRole={createRole('ワンペア', 5)}
          pointsChange={300}
          onClose={onClose}
        />
      );
      expect(screen.getByText('サビフラッシュ')).toBeInTheDocument();
    });

    it('正のポイント変動が+付きで表示される', () => {
      const onClose = vi.fn();
      render(
        <BattleResultOverlay
          visible={true}
          result="win"
          playerRole={createRole('サビフラッシュ', 300)}
          dealerRole={createRole('ワンペア', 5)}
          pointsChange={300}
          onClose={onClose}
        />
      );
      expect(screen.getByText('+300 pt')).toBeInTheDocument();
    });
  });

  describe('敗北時の表示', () => {
    it('LOSEと表示される', () => {
      const onClose = vi.fn();
      render(
        <BattleResultOverlay
          visible={true}
          result="lose"
          playerRole={createRole('ワンペア', 5)}
          dealerRole={createRole('サビフラッシュ', 300)}
          pointsChange={-300}
          onClose={onClose}
        />
      );
      expect(screen.getByText('LOSE')).toBeInTheDocument();
    });

    it('ディーラーの役名が表示される', () => {
      const onClose = vi.fn();
      render(
        <BattleResultOverlay
          visible={true}
          result="lose"
          playerRole={createRole('ワンペア', 5)}
          dealerRole={createRole('サビフラッシュ', 300)}
          pointsChange={-300}
          onClose={onClose}
        />
      );
      expect(screen.getByText('サビフラッシュ')).toBeInTheDocument();
    });

    it('負のポイント変動がマイナス付きで表示される', () => {
      const onClose = vi.fn();
      render(
        <BattleResultOverlay
          visible={true}
          result="lose"
          playerRole={createRole('ワンペア', 5)}
          dealerRole={createRole('サビフラッシュ', 300)}
          pointsChange={-300}
          onClose={onClose}
        />
      );
      expect(screen.getByText('-300 pt')).toBeInTheDocument();
    });
  });

  describe('引き分け時の表示', () => {
    it('DRAWと表示される', () => {
      const onClose = vi.fn();
      render(
        <BattleResultOverlay
          visible={true}
          result="draw"
          playerRole={createRole('ノーペア', 0, 'noPair')}
          dealerRole={createRole('ノーペア', 0, 'noPair')}
          pointsChange={0}
          onClose={onClose}
        />
      );
      expect(screen.getByText('DRAW')).toBeInTheDocument();
    });

    it('ポイント変動が+-0 ptと表示される', () => {
      const onClose = vi.fn();
      render(
        <BattleResultOverlay
          visible={true}
          result="draw"
          playerRole={createRole('ノーペア', 0, 'noPair')}
          dealerRole={createRole('ノーペア', 0, 'noPair')}
          pointsChange={0}
          onClose={onClose}
        />
      );
      expect(screen.getByText('+-0 pt')).toBeInTheDocument();
    });
  });

  describe('操作', () => {
    it('OKボタンをクリックするとonCloseが呼ばれる', () => {
      const onClose = vi.fn();
      render(
        <BattleResultOverlay
          visible={true}
          result="win"
          playerRole={createRole('サビフラッシュ', 300)}
          dealerRole={createRole('ワンペア', 5)}
          pointsChange={300}
          onClose={onClose}
        />
      );
      fireEvent.click(screen.getByText('OK'));
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('オーバーレイ背景をクリックするとonCloseが呼ばれる', () => {
      const onClose = vi.fn();
      render(
        <BattleResultOverlay
          visible={true}
          result="win"
          playerRole={createRole('サビフラッシュ', 300)}
          dealerRole={createRole('ワンペア', 5)}
          pointsChange={300}
          onClose={onClose}
        />
      );
      const overlay = screen.getByRole('dialog');
      fireEvent.click(overlay);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('コンテンツ部分をクリックしてもonCloseは呼ばれない', () => {
      const onClose = vi.fn();
      render(
        <BattleResultOverlay
          visible={true}
          result="win"
          playerRole={createRole('サビフラッシュ', 300)}
          dealerRole={createRole('ワンペア', 5)}
          pointsChange={300}
          onClose={onClose}
        />
      );
      const resultText = screen.getByText('WIN');
      fireEvent.click(resultText);
      expect(onClose).not.toHaveBeenCalled();
    });

    it('Escapeキーを押すとonCloseが呼ばれる', () => {
      const onClose = vi.fn();
      render(
        <BattleResultOverlay
          visible={true}
          result="win"
          playerRole={createRole('サビフラッシュ', 300)}
          dealerRole={createRole('ワンペア', 5)}
          pointsChange={300}
          onClose={onClose}
        />
      );
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('Enterキーを押すとonCloseが呼ばれる', () => {
      const onClose = vi.fn();
      render(
        <BattleResultOverlay
          visible={true}
          result="win"
          playerRole={createRole('サビフラッシュ', 300)}
          dealerRole={createRole('ワンペア', 5)}
          pointsChange={300}
          onClose={onClose}
        />
      );
      fireEvent.keyDown(document, { key: 'Enter' });
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('visible=falseの時はキーイベントに反応しない', () => {
      const onClose = vi.fn();
      render(
        <BattleResultOverlay
          visible={false}
          result="win"
          playerRole={createRole('サビフラッシュ', 300)}
          dealerRole={createRole('ワンペア', 5)}
          pointsChange={300}
          onClose={onClose}
        />
      );
      fireEvent.keyDown(document, { key: 'Escape' });
      expect(onClose).not.toHaveBeenCalled();
    });
  });

  describe('アクセシビリティ', () => {
    it('role="dialog"が設定されている', () => {
      const onClose = vi.fn();
      render(
        <BattleResultOverlay
          visible={true}
          result="win"
          playerRole={createRole('サビフラッシュ', 300)}
          dealerRole={createRole('ワンペア', 5)}
          pointsChange={300}
          onClose={onClose}
        />
      );
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('aria-modal="true"が設定されている', () => {
      const onClose = vi.fn();
      render(
        <BattleResultOverlay
          visible={true}
          result="win"
          playerRole={createRole('サビフラッシュ', 300)}
          dealerRole={createRole('ワンペア', 5)}
          pointsChange={300}
          onClose={onClose}
        />
      );
      expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    });
  });
});
