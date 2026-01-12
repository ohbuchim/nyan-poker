import React, { useEffect, useState } from 'react';
import type { Role } from '../../types';
import styles from './RoleDisplay.module.css';

/** Delay before role name pop-in starts (ms) */
const ROLE_NAME_DELAY = 200;

export interface RoleDisplayProps {
  role: Role | null;
  visible: boolean;
}

export const RoleDisplay: React.FC<RoleDisplayProps> = ({ role, visible }) => {
  const [showRole, setShowRole] = useState(false);

  // Handle delayed role name display
  useEffect(() => {
    if (visible && role) {
      // Reset first to trigger animation on role change
      setShowRole(false);
      const timer = setTimeout(() => {
        setShowRole(true);
      }, ROLE_NAME_DELAY);
      return () => clearTimeout(timer);
    } else {
      setShowRole(false);
    }
  }, [visible, role]);

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
    const classes = [styles['role-name']];
    if (!role || role.type === 'noPair') {
      classes.push(styles['role-name--no-pair']);
    }
    return classes.join(' ');
  };

  const formatPoints = (points: number): string => {
    if (points > 0) return `+${points}`;
    return String(points);
  };

  return (
    <div className={containerClasses} aria-live="polite">
      {role && visible && showRole && (
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
