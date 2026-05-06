/**
 * GlassButton
 * Pure presentational button component with gold/glass/ghost/danger variants.
 * Zero internal state — all interactions arrive via props.
 */
import React from 'react';
import { palette, GOLD, GOLD_DARK } from './tokens';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

export interface GlassButtonProps {
  /** Button label text */
  label: string;
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Size preset */
  size?: ButtonSize;
  /** Icon rendered before the label */
  iconLeft?: React.ReactNode;
  /** Icon rendered after the label */
  iconRight?: React.ReactNode;
  /** Fills its parent container */
  fullWidth?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Loading spinner state — shows a spinner and disables interaction */
  loading?: boolean;
  /** Dark-mode flag */
  isDark?: boolean;
  /** Click handler */
  onClick?: () => void;
  /** Optional extra className */
  className?: string;
  /** Native button type */
  type?: 'button' | 'submit' | 'reset';
}

// ── Size maps ────────────────────────────────────────────────────────────────────
const SIZE_PADDING: Record<ButtonSize, string> = {
  xs: 'px-3 py-1.5',
  sm: 'px-4 py-2',
  md: 'px-5 py-2.5',
  lg: 'px-7 py-3.5',
};

const SIZE_TEXT: Record<ButtonSize, string> = {
  xs: 'text-xs',
  sm: 'text-sm',
  md: 'text-sm',
  lg: 'text-base',
};

const SIZE_ICON: Record<ButtonSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

// ── Spinner ──────────────────────────────────────────────────────────────────────
function Spinner({ sizeClass }: { sizeClass: string }) {
  return (
    <svg
      className={`animate-spin ${sizeClass}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

export function GlassButton({
  label,
  variant = 'primary',
  size = 'md',
  iconLeft,
  iconRight,
  fullWidth = false,
  disabled = false,
  loading = false,
  isDark = false,
  onClick,
  className = '',
  type = 'button',
}: GlassButtonProps) {
  const p = palette(isDark);
  const isInteractive = !disabled && !loading;

  // ── Variant styles ──────────────────────────────────────────────────────────
  let variantStyle: React.CSSProperties = {};
  let variantClass = '';

  if (variant === 'primary') {
    variantStyle = {
      background: `linear-gradient(135deg, ${GOLD}, ${GOLD_DARK})`,
      color: '#ffffff',
      boxShadow: isInteractive ? '0 4px 20px rgba(220,181,21,0.3)' : 'none',
    };
    variantClass = isInteractive ? 'hover:opacity-90 hover:shadow-lg active:scale-[0.98]' : '';
  } else if (variant === 'secondary') {
    variantStyle = {
      background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(231,230,221,0.7)',
      border: `1px solid ${p.glassBorder}`,
      color: p.text,
      backdropFilter: 'blur(8px)',
    };
    variantClass = isInteractive ? 'hover:opacity-80 active:scale-[0.98]' : '';
  } else if (variant === 'ghost') {
    variantStyle = {
      background: 'transparent',
      color: GOLD,
    };
    variantClass = isInteractive ? 'hover:bg-[rgba(220,181,21,0.1)] active:scale-[0.98]' : '';
  } else if (variant === 'danger') {
    variantStyle = {
      background: isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)',
      border: `1px solid ${isDark ? 'rgba(239,68,68,0.4)' : 'rgba(239,68,68,0.3)'}`,
      color: isDark ? '#fca5a5' : 'rgb(185,28,28)',
    };
    variantClass = isInteractive ? 'hover:opacity-80 active:scale-[0.98]' : '';
  } else if (variant === 'outline') {
    variantStyle = {
      background: 'transparent',
      border: `1px solid ${GOLD}`,
      color: GOLD,
    };
    variantClass = isInteractive ? 'hover:bg-[rgba(220,181,21,0.1)] active:scale-[0.98]' : '';
  }

  // ── Disabled / loading overrides ────────────────────────────────────────────
  const disabledClass = disabled ? 'opacity-40 cursor-not-allowed' : '';
  const loadingClass = loading ? 'cursor-wait' : '';
  const widthClass = fullWidth ? 'w-full' : '';

  const baseClass = [
    'inline-flex items-center justify-center gap-2 rounded-xl font-medium',
    'transition-all duration-200',
    SIZE_PADDING[size],
    SIZE_TEXT[size],
    variantClass,
    disabledClass,
    loadingClass,
    widthClass,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const iconClass = SIZE_ICON[size];

  function handleClick() {
    if (!isInteractive) return;
    if (onClick) onClick();
  }

  return (
    <button
      type={type}
      className={baseClass}
      style={variantStyle}
      disabled={disabled || loading}
      onClick={handleClick}
    >
      {loading && <Spinner sizeClass={iconClass} />}
      {!loading && iconLeft && <span className={iconClass}>{iconLeft}</span>}
      <span>{label}</span>
      {!loading && iconRight && <span className={iconClass}>{iconRight}</span>}
    </button>
  );
}
