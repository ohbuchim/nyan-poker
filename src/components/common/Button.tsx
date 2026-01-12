import React from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'text' | 'icon' | 'footer';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  label?: string; // For footer buttons
  children?: React.ReactNode;
}

/**
 * Button component
 *
 * @param variant - Button style variant (primary | secondary | danger | text | icon | footer)
 * @param size - Button size (sm | md | lg)
 * @param loading - Show loading state
 * @param icon - Icon element (for icon and footer buttons)
 * @param label - Label text (for footer buttons)
 * @param children - Button content
 */
export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  label,
  className,
  disabled,
  children,
  ...props
}) => {
  const classes = [
    styles.btn,
    styles[`btn--${variant}`],
    styles[`btn--${size}`],
    loading && styles['btn--loading'],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const isDisabled = disabled || loading;

  // Footer button with icon and label
  if (variant === 'footer') {
    return (
      <button className={classes} disabled={isDisabled} {...props}>
        {icon && <span className={styles['btn-footer-icon']}>{icon}</span>}
        {label && <span className={styles['btn-footer-label']}>{label}</span>}
      </button>
    );
  }

  // Icon button
  if (variant === 'icon') {
    return (
      <button className={classes} disabled={isDisabled} {...props}>
        {loading ? <span className={styles.spinner} /> : icon || children}
      </button>
    );
  }

  // Regular button
  return (
    <button className={classes} disabled={isDisabled} {...props}>
      {loading ? (
        <span className={styles.spinner} />
      ) : (
        <>
          {icon && <span className={styles['btn-icon']}>{icon}</span>}
          {children}
        </>
      )}
    </button>
  );
};
