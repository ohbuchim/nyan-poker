import React from 'react';
import type { Role } from '../../types';
import styles from './BattleRoleBox.module.css';

export type BattleRoleBoxStatus = 'pending' | 'winner' | 'loser' | 'draw';

export interface BattleRoleBoxProps {
  /** Label for the role box (e.g., "Dealer", "Player") */
  label: string;
  /** Icon to display (e.g., emoji) */
  icon: string;
  /** The role to display */
  role: Role | null;
  /** Whether to show the role information */
  showRole: boolean;
  /** Status of this player: winner, loser, draw, or pending */
  status?: BattleRoleBoxStatus;
}

/**
 * BattleRoleBox displays a player's role information in the battle screen header.
 * Shows the label, icon, role name, and points with appropriate styling based on status.
 */
export const BattleRoleBox: React.FC<BattleRoleBoxProps> = ({
  label,
  icon,
  role,
  showRole,
  status = 'pending',
}) => {
  const getContainerClass = (): string => {
    const classes = [styles.container];

    if (showRole) {
      classes.push(styles['container--show']);
    }

    switch (status) {
      case 'winner':
        classes.push(styles['container--winner']);
        break;
      case 'loser':
        classes.push(styles['container--loser']);
        break;
      case 'draw':
        classes.push(styles['container--draw']);
        break;
    }

    return classes.join(' ');
  };

  const getRoleNameClass = (): string => {
    if (!role || role.type === 'noPair') {
      return `${styles['role-name']} ${styles['role-name--no-pair']}`;
    }
    return styles['role-name'];
  };

  return (
    <div className={getContainerClass()} aria-live="polite">
      <div className={styles.label}>
        <span className={styles.icon}>{icon}</span>
        <span>{label}</span>
      </div>
      <div className={styles.result}>
        {showRole && role && (
          <>
            <span className={getRoleNameClass()}>{role.name}</span>
            <span className={styles.points}>{role.points} pt</span>
          </>
        )}
      </div>
    </div>
  );
};
