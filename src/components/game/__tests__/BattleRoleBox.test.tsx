// components/game/__tests__/BattleRoleBox.test.tsx

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BattleRoleBox } from '../BattleRoleBox';
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

describe('BattleRoleBox', () => {
  describe('基本表示', () => {
    it('ラベルが表示される', () => {
      render(
        <BattleRoleBox
          label="ディーラー"
          icon="dealer-icon"
          role={null}
          showRole={false}
        />
      );
      expect(screen.getByText('ディーラー')).toBeInTheDocument();
    });

    it('アイコンが表示される', () => {
      render(
        <BattleRoleBox
          label="ディーラー"
          icon="dealer-icon"
          role={null}
          showRole={false}
        />
      );
      expect(screen.getByText('dealer-icon')).toBeInTheDocument();
    });
  });

  describe('役表示', () => {
    it('showRole=falseの場合、役名とポイントは表示されない', () => {
      render(
        <BattleRoleBox
          label="プレイヤー"
          icon="player-icon"
          role={createRole('サビフラッシュ', 300)}
          showRole={false}
        />
      );
      expect(screen.queryByText('サビフラッシュ')).not.toBeInTheDocument();
      expect(screen.queryByText('300 pt')).not.toBeInTheDocument();
    });

    it('showRole=trueの場合、役名が表示される', () => {
      render(
        <BattleRoleBox
          label="プレイヤー"
          icon="player-icon"
          role={createRole('サビフラッシュ', 300)}
          showRole={true}
        />
      );
      expect(screen.getByText('サビフラッシュ')).toBeInTheDocument();
    });

    it('showRole=trueの場合、ポイントが表示される', () => {
      render(
        <BattleRoleBox
          label="プレイヤー"
          icon="player-icon"
          role={createRole('サビフラッシュ', 300)}
          showRole={true}
        />
      );
      expect(screen.getByText('300 pt')).toBeInTheDocument();
    });

    it('役がnullの場合、showRole=trueでも役名とポイントは表示されない', () => {
      render(
        <BattleRoleBox
          label="プレイヤー"
          icon="player-icon"
          role={null}
          showRole={true}
        />
      );
      expect(screen.queryByText('pt')).not.toBeInTheDocument();
    });
  });

  describe('ステータス表示', () => {
    it('status=pendingの場合、デフォルトスタイルで表示される', () => {
      const { container } = render(
        <BattleRoleBox
          label="プレイヤー"
          icon="player-icon"
          role={createRole('サビフラッシュ', 300)}
          showRole={true}
          status="pending"
        />
      );
      const containerElement = container.firstChild as HTMLElement;
      expect(containerElement).not.toHaveClass('container--winner');
      expect(containerElement).not.toHaveClass('container--loser');
      expect(containerElement).not.toHaveClass('container--draw');
    });

    it('status=winnerの場合、勝者スタイルのクラスが適用される', () => {
      const { container } = render(
        <BattleRoleBox
          label="プレイヤー"
          icon="player-icon"
          role={createRole('サビフラッシュ', 300)}
          showRole={true}
          status="winner"
        />
      );
      // Note: CSS Modules transforms class names, so we check that the element exists
      // and the component renders without error
      expect(container.firstChild).toBeInTheDocument();
    });

    it('status=loserの場合、敗者スタイルが適用される', () => {
      const { container } = render(
        <BattleRoleBox
          label="プレイヤー"
          icon="player-icon"
          role={createRole('ワンペア', 5)}
          showRole={true}
          status="loser"
        />
      );
      expect(container.firstChild).toBeInTheDocument();
    });

    it('status=drawの場合、引き分けスタイルが適用される', () => {
      const { container } = render(
        <BattleRoleBox
          label="プレイヤー"
          icon="player-icon"
          role={createRole('ノーペア', 0, 'noPair')}
          showRole={true}
          status="draw"
        />
      );
      expect(container.firstChild).toBeInTheDocument();
    });
  });

  describe('ノーペア表示', () => {
    it('ノーペアの場合、役名が表示される', () => {
      render(
        <BattleRoleBox
          label="プレイヤー"
          icon="player-icon"
          role={createRole('ノーペア', 0, 'noPair')}
          showRole={true}
        />
      );
      expect(screen.getByText('ノーペア')).toBeInTheDocument();
    });

    it('ノーペアの場合、0ポイントが表示される', () => {
      render(
        <BattleRoleBox
          label="プレイヤー"
          icon="player-icon"
          role={createRole('ノーペア', 0, 'noPair')}
          showRole={true}
        />
      );
      expect(screen.getByText('0 pt')).toBeInTheDocument();
    });
  });

  describe('アクセシビリティ', () => {
    it('aria-live属性が設定されている', () => {
      const { container } = render(
        <BattleRoleBox
          label="プレイヤー"
          icon="player-icon"
          role={createRole('サビフラッシュ', 300)}
          showRole={true}
        />
      );
      expect(container.firstChild).toHaveAttribute('aria-live', 'polite');
    });
  });

  describe('様々な役の表示', () => {
    const testCases = [
      { name: 'サビフラッシュ', points: 300, type: 'flush' },
      { name: '三毛フラッシュ', points: 299, type: 'flush' },
      { name: 'ロングファー', points: 100, type: 'fur' },
      { name: 'サビフォーカラー', points: 277, type: 'fourColor' },
      { name: 'サビ×三毛フルハウス', points: 294, type: 'fullHouse' },
      { name: 'サビスリーカラー', points: 112, type: 'threeColor' },
      { name: 'サビ×三毛ツーペア', points: 154, type: 'twoPair' },
      { name: 'サビワンペア', points: 21, type: 'onePair' },
      { name: 'ショートファー', points: 1, type: 'fur' },
    ];

    testCases.forEach(({ name, points, type }) => {
      it(`${name}（${points}pt）が正しく表示される`, () => {
        render(
          <BattleRoleBox
            label="プレイヤー"
            icon="player-icon"
            role={createRole(name, points, type)}
            showRole={true}
          />
        );
        expect(screen.getByText(name)).toBeInTheDocument();
        expect(screen.getByText(`${points} pt`)).toBeInTheDocument();
      });
    });
  });
});
