import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import { FLUSH_ROLES, FUR_ROLES } from '../../data/roleDefinitions';
import type { ColorCode } from '../../types/card';
import styles from './RulesModal.module.css';

export interface RulesModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Callback when the modal is closed */
  onClose: () => void;
}

/** Flush role data sorted by points (descending) */
const FLUSH_ROLES_SORTED = Object.entries(FLUSH_ROLES)
  .map(([code, data]) => ({
    colorCode: Number(code) as ColorCode,
    ...data,
  }))
  .sort((a, b) => b.points - a.points);

/** Color names for conditions display */
const COLOR_CONDITION_NAMES: Record<ColorCode, string> = {
  0: '茶トラ',
  1: '三毛',
  2: '白猫',
  3: '黒猫',
  4: '茶白',
  5: 'キジ白',
  6: 'キジトラ',
  7: '白黒',
  8: 'サバトラ',
  9: 'グレー',
  10: 'トビ',
  11: 'サビ',
};

/**
 * RulesModal component
 *
 * Displays the game rules and hand rankings in a modal dialog.
 *
 * Features:
 * - Game objective section
 * - How to play section
 * - Hand rankings in accordion sections:
 *   - Flush types (12 varieties)
 *   - Fur and Color types
 */
export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  const [flushAccordionOpen, setFlushAccordionOpen] = useState(true);
  const [furColorAccordionOpen, setFurColorAccordionOpen] = useState(false);

  const handleFlushAccordionToggle = () => {
    setFlushAccordionOpen((prev) => !prev);
  };

  const handleFurColorAccordionToggle = () => {
    setFurColorAccordionOpen((prev) => !prev);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="遊び方">
      {/* Game Objective Section */}
      <section className={styles.rulesSection}>
        <h3 className={styles.sectionTitle}>ゲームの目的</h3>
        <p className={styles.sectionText}>
          5枚の猫カードで役を揃え、高いポイントを獲得することを目指します。
          各カードには「毛色」と「毛の長さ」の2つの属性があります。
        </p>
      </section>

      {/* How to Play Section */}
      <section className={styles.rulesSection}>
        <h3 className={styles.sectionTitle}>遊び方</h3>
        <p className={styles.sectionText}>
          1. 5枚のカードが配られます
          <br />
          2. 交換したいカードを選択します（0〜5枚）
          <br />
          3. 選択したカードを新しいカードと交換します
          <br />
          4. 最終的な手札で役が判定されます
          <br />
          ※複数の役が成立する場合、ポイントが最も高い役が採用されます
        </p>
      </section>

      {/* Flush Roles Accordion */}
      <details
        className={styles.rulesAccordion}
        open={flushAccordionOpen}
        onToggle={handleFlushAccordionToggle}
      >
        <summary className={styles.rulesAccordionHeader}>
          <h3 className={styles.accordionTitle}>役一覧（フラッシュ系）</h3>
          <span className={styles.accordionIcon} aria-hidden="true" />
        </summary>
        <div className={styles.rulesAccordionContent}>
          <table className={styles.roleTable}>
            <thead>
              <tr>
                <th>役名</th>
                <th>条件</th>
                <th>ポイント</th>
              </tr>
            </thead>
            <tbody>
              {FLUSH_ROLES_SORTED.map((role) => (
                <tr key={role.colorCode}>
                  <td>{role.name}</td>
                  <td>{COLOR_CONDITION_NAMES[role.colorCode]}5枚</td>
                  <td>{role.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>

      {/* Fur and Color Roles Accordion */}
      <details
        className={styles.rulesAccordion}
        open={furColorAccordionOpen}
        onToggle={handleFurColorAccordionToggle}
      >
        <summary className={styles.rulesAccordionHeader}>
          <h3 className={styles.accordionTitle}>役一覧（ファー系・カラー系）</h3>
          <span className={styles.accordionIcon} aria-hidden="true" />
        </summary>
        <div className={styles.rulesAccordionContent}>
          <p className={styles.rulesNote}>
            ※カラー系の役は毛色ごとに異なるポイントがあります（代表的なポイントを表示）
          </p>
          <table className={styles.roleTable}>
            <thead>
              <tr>
                <th>役名</th>
                <th>条件</th>
                <th>ポイント</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>フォーカラー</td>
                <td>同色4枚</td>
                <td>63〜277</td>
              </tr>
              <tr>
                <td>フルハウス</td>
                <td>同色3枚+別色2枚</td>
                <td>105〜294</td>
              </tr>
              <tr>
                <td>ロングファー</td>
                <td>長毛5枚</td>
                <td>{FUR_ROLES[0].points}</td>
              </tr>
              <tr>
                <td>スリーカラー</td>
                <td>同色3枚</td>
                <td>16〜112</td>
              </tr>
              <tr>
                <td>ツーペア</td>
                <td>2組のペア</td>
                <td>23〜154</td>
              </tr>
              <tr>
                <td>ワンペア</td>
                <td>同色2枚</td>
                <td>2〜21</td>
              </tr>
              <tr>
                <td>ショートファー</td>
                <td>短毛5枚</td>
                <td>{FUR_ROLES[1].points}</td>
              </tr>
              <tr>
                <td>ノーペア</td>
                <td>役なし</td>
                <td>0</td>
              </tr>
            </tbody>
          </table>
        </div>
      </details>
    </Modal>
  );
};
