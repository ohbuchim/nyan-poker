import React, { useId } from 'react';
import styles from './Toggle.module.css';

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  'aria-label'?: string;
  'aria-labelledby'?: string;
}

/**
 * Toggle component (ON/OFF switch)
 *
 * Features:
 * - Keyboard accessible (Space/Enter to toggle)
 * - ARIA attributes for accessibility
 * - Smooth animation
 *
 * @param checked - Toggle state (true = ON, false = OFF)
 * @param onChange - Change handler
 * @param label - Label text (optional, use aria-labelledby if label is external)
 * @param disabled - Disabled state
 * @param aria-label - Accessibility label
 * @param aria-labelledby - ID of external label element
 */
export const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
}) => {
  // Generate a unique id for the label when a label prop is provided
  const generatedId = useId();
  const labelId = ariaLabelledBy || (label ? `toggle-label-${generatedId}` : undefined);

  const handleClick = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      onChange(!checked);
    }
  };

  const toggleClasses = [
    styles.toggle,
    checked && styles.active,
    disabled && styles.disabled,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.container}>
      {label && (
        <span className={styles.label} id={labelId}>
          {label}
        </span>
      )}
      <div
        className={toggleClasses}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="switch"
        aria-checked={checked}
        aria-label={ariaLabel}
        aria-labelledby={labelId}
        tabIndex={disabled ? -1 : 0}
      >
        <div className={styles.slider}>
          <div className={styles.thumb} />
        </div>
      </div>
    </div>
  );
};
