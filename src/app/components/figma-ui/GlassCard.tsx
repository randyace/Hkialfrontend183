/**
 * GlassCard
 * Glassmorphic container card with optional title, subtitle, header action, and footer.
 * Pure presentational — zero internal state.
 */
import React from 'react';
import { palette, GOLD } from './tokens';

export type CardPadding = 'none' | 'sm' | 'md' | 'lg';
export type CardVariant = 'glass' | 'solid' | 'gold';

export interface GlassCardProps {
  /** Card children / body content */
  children: React.ReactNode;
  /** Optional card heading */
  title?: string;
  /** Optional subtitle beneath the heading */
  subtitle?: string;
  /** Icon placed before the title */
  titleIcon?: React.ReactNode;
  /** Action node (button / link) rendered in the header right side */
  headerAction?: React.ReactNode;
  /** Footer node rendered below a divider */
  footer?: React.ReactNode;
  /** Inner padding preset */
  padding?: CardPadding;
  /** Visual variant */
  variant?: CardVariant;
  /** Dark-mode flag */
  isDark?: boolean;
  /** Additional class names applied to the root element */
  className?: string;
  /** Click handler on the card root */
  onClick?: () => void;
  /** Makes card focusable & hoverable — intended for list cards */
  interactive?: boolean;
}

const PADDING_CLASS: Record<CardPadding, string> = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-6',
};

export function GlassCard({
  children,
  title,
  subtitle,
  titleIcon,
  headerAction,
  footer,
  padding = 'lg',
  variant = 'glass',
  isDark = false,
  className = '',
  onClick,
  interactive = false,
}: GlassCardProps) {
  const p = palette(isDark);

  // ── Card surface style ────────────────────────────────────────────────────────
  let cardStyle: React.CSSProperties = {};

  if (variant === 'glass') {
    cardStyle = {
      backdropFilter: 'blur(16px)',
      background: p.glassBackground,
      border: `1px solid ${p.glassBorder}`,
      boxShadow: p.glassShadow,
    };
  } else if (variant === 'solid') {
    cardStyle = {
      background: isDark ? 'rgba(255,255,255,0.05)' : p.other,
      border: `1px solid ${p.glassBorder}`,
    };
  } else if (variant === 'gold') {
    cardStyle = {
      background: 'linear-gradient(135deg, rgb(209,175,125) 0%, rgb(167,139,100) 100%)',
      boxShadow: '0 20px 60px rgba(209,175,125,0.3)',
      color: '#ffffff',
    };
  }

  const interactiveClass =
    interactive || onClick
      ? 'cursor-pointer transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg'
      : '';

  const headerBorderStyle: React.CSSProperties = {
    borderBottom: `1px solid ${p.glassBorder}`,
  };
  const footerBorderStyle: React.CSSProperties = {
    borderTop: `1px solid ${p.glassBorder}`,
  };

  const titleColor = variant === 'gold' ? '#ffffff' : p.text;
  const subtitleColor = variant === 'gold' ? 'rgba(255,255,255,0.7)' : p.textMuted;
  const iconColor = variant === 'gold' ? '#ffffff' : GOLD;

  const showHeader = !!(title || headerAction);
  const paddingClass = PADDING_CLASS[padding];

  function handleClick() {
    if (onClick) onClick();
  }

  return (
    <div
      className={`rounded-2xl overflow-hidden ${interactiveClass} ${className}`}
      style={cardStyle}
      onClick={onClick ? handleClick : undefined}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Header */}
      {showHeader && (
        <div
          className={`flex items-center justify-between gap-3 ${paddingClass} pb-4`}
          style={headerBorderStyle}
        >
          <div className="flex items-center gap-2 min-w-0">
            {titleIcon && (
              <span className="flex-shrink-0 w-5 h-5" style={{ color: iconColor }}>
                {titleIcon}
              </span>
            )}
            <div className="min-w-0">
              {title && (
                <h3 className="truncate" style={{ color: titleColor }}>
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-xs mt-0.5 truncate" style={{ color: subtitleColor }}>
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          {headerAction && <div className="flex-shrink-0">{headerAction}</div>}
        </div>
      )}

      {/* Body */}
      <div className={showHeader ? `${paddingClass} pt-5` : paddingClass}>{children}</div>

      {/* Footer */}
      {footer && (
        <div className={`${paddingClass} pt-4`} style={footerBorderStyle}>
          {footer}
        </div>
      )}
    </div>
  );
}
