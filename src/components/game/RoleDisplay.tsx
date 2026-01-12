import React from 'react';
import type { Role } from '../../types';
import styles from './RoleDisplay.module.css';

export interface RoleDisplayProps {
  role: Role | null;
  visible: boolean;
}

export const RoleDisplay: React.FC<RoleDisplayProps> = ({ role, visible }) => {
  const containerClasses = [
    styles.container,
    visible ? styles['container--visible'] : styles['container--hidden'],
  ].join(' ');

  const getPointsClass = () => {
    if (!role) return styles.points;
    if (role.points > 0) return `${styles.points} ${styles['points--positive']}`;
    if (role.points < 0) return `${styles.points} ${styles['points--negative']}`;
    return `${styles.points} ${styles['points--zero']}`;
  };

  const getRoleNameClass = () => {
    if (!role || role.type === 'noPair') {
      return `${styles['role-name']} ${styles['role-name--no-pair']}`;
    }
    return styles['role-name'];
  };

  const formatPoints = (points: number): string => {
    if (points > 0) return `+${points}`;
    return String(points);
  };

  return (
    <div className={containerClasses} aria-live="polite">
      {role && visible && (
        <>
          <h2 className={getRoleNameClass()}>{role.name}</h2>
          <span className={getPointsClass()}>
            {formatPoints(role.points)} ポイント
          </span>
        </>
      )}
    </div>
  );
};
