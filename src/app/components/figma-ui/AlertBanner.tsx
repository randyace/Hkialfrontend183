/**
 * AlertBanner
 * Themed inline alert / callout for info, success, warning, and error states.
 * Supports an optional CTA button and dismiss callback.
 * Pure presentational — zero internal state.
 */
import React from 'react';
import {
  Info,
  CheckCircle,
  AlertTriangle,
  XCircle,
  X,
  ArrowRight,
} from 'lucide-react';

export type AlertVariant = 'info' | 'success' | 'warning' | 'error';

export interface AlertBannerProps {
  /** Alert severity level */
  variant: AlertVariant;
  /** Bold heading line */
  title?: string;
  /** Main message body */
  message: string;
  /** Shows a dismiss × button */
  isDismissible?: boolean;
  /** Dismiss callback */
  onDismiss?: () => void;
  /** CTA button label */
  actionLabel?: string;
  /** CTA button callback */
  onAction?: () => void;
  /** Dark-mode flag */
  isDark?: boolean;
  /** Extra class names on root element */
  className?: string;
}

interface AlertConfig {
  Icon: React.ElementType;
  lightBg: string;
  lightBorder: string;
  lightText: string;
  lightTitle: string;
  lightIcon: string;
  darkBg: string;
  darkBorder: string;
  darkText: string;
  darkTitle: string;
  darkIcon: string;
}

const CONFIG: Record<AlertVariant, AlertConfig> = {
  info: {
    Icon: Info,
    lightBg: 'rgba(59,130,246,0.08)',
    lightBorder: 'rgba(59,130,246,0.3)',
    lightText: 'rgb(30,64,175)',
    lightTitle: 'rgb(30,64,175)',
    lightIcon: 'rgb(59,130,246)',
    darkBg: 'rgba(59,130,246,0.1)',
    darkBorder: 'rgba(59,130,246,0.35)',
    darkText: '#bfdbfe',
    darkTitle: '#93c5fd',
    darkIcon: '#60a5fa',
  },
  success: {
    Icon: CheckCircle,
    lightBg: 'rgba(16,185,129,0.08)',
    lightBorder: 'rgba(16,185,129,0.3)',
    lightText: 'rgb(5,150,105)',
    lightTitle: 'rgb(5,150,105)',
    lightIcon: 'rgb(16,185,129)',
    darkBg: 'rgba(16,185,129,0.1)',
    darkBorder: 'rgba(16,185,129,0.35)',
    darkText: '#a7f3d0',
    darkTitle: '#6ee7b7',
    darkIcon: '#34d399',
  },
  warning: {
    Icon: AlertTriangle,
    lightBg: 'rgba(245,158,11,0.08)',
    lightBorder: 'rgba(245,158,11,0.3)',
    lightText: 'rgb(180,120,0)',
    lightTitle: 'rgb(180,120,0)',
    lightIcon: 'rgb(245,158,11)',
    darkBg: 'rgba(245,158,11,0.1)',
    darkBorder: 'rgba(245,158,11,0.35)',
    darkText: '#fde68a',
    darkTitle: '#fcd34d',
    darkIcon: '#fbbf24',
  },
  error: {
    Icon: XCircle,
    lightBg: 'rgba(239,68,68,0.08)',
    lightBorder: 'rgba(239,68,68,0.3)',
    lightText: 'rgb(185,28,28)',
    lightTitle: 'rgb(185,28,28)',
    lightIcon: 'rgb(239,68,68)',
    darkBg: 'rgba(239,68,68,0.1)',
    darkBorder: 'rgba(239,68,68,0.35)',
    darkText: '#fecaca',
    darkTitle: '#fca5a5',
    darkIcon: '#f87171',
  },
};

export function AlertBanner({
  variant,
  title,
  message,
  isDismissible = false,
  onDismiss,
  actionLabel,
  onAction,
  isDark = false,
  className = '',
}: AlertBannerProps) {
  const cfg = CONFIG[variant];

  const bg = isDark ? cfg.darkBg : cfg.lightBg;
  const borderColor = isDark ? cfg.darkBorder : cfg.lightBorder;
  const textColor = isDark ? cfg.darkText : cfg.lightText;
  const titleColor = isDark ? cfg.darkTitle : cfg.lightTitle;
  const iconColor = isDark ? cfg.darkIcon : cfg.lightIcon;

  const rootStyle: React.CSSProperties = {
    background: bg,
    border: `1px solid ${borderColor}`,
  };

  const Icon = cfg.Icon;

  function handleDismiss() {
    if (onDismiss) onDismiss();
  }

  function handleAction() {
    if (onAction) onAction();
  }

  return (
    <div
      className={`rounded-xl px-4 py-3.5 flex gap-3 ${className}`}
      style={rootStyle}
      role="alert"
    >
      {/* Icon */}
      <Icon
        className="flex-shrink-0 w-5 h-5 mt-0.5"
        style={{ color: iconColor }}
      />

      {/* Content */}
      <div className="flex-1 min-w-0">
        {title && (
          <p className="text-sm font-semibold mb-0.5" style={{ color: titleColor }}>
            {title}
          </p>
        )}
        <p className="text-sm" style={{ color: textColor }}>
          {message}
        </p>

        {actionLabel && (
          <button
            type="button"
            onClick={handleAction}
            className="mt-2 inline-flex items-center gap-1 text-xs font-semibold underline-offset-2 hover:underline transition-opacity hover:opacity-80"
            style={{ color: titleColor }}
          >
            {actionLabel}
            <ArrowRight className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Dismiss */}
      {isDismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          className="flex-shrink-0 p-0.5 rounded transition-opacity hover:opacity-70"
          style={{ color: textColor }}
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
