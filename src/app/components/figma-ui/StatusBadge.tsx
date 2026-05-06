/**
 * StatusBadge
 * Compact pill badge for booking, membership, and voucher statuses.
 * Zero internal state.
 */
import React from 'react';
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Clock,
  Check,
  Ban,
} from 'lucide-react';

export type BadgeStatus =
  | 'active'
  | 'expiring'
  | 'expired'
  | 'confirmed'
  | 'pending'
  | 'cancelled'
  | 'completed'
  | 'available'
  | 'used';

export type BadgeSize = 'xs' | 'sm' | 'md';

export interface StatusBadgeProps {
  /** The status value to render */
  status: BadgeStatus;
  /** Override the default display label */
  label?: string;
  /** Size variant */
  size?: BadgeSize;
  /** Whether to show the leading icon */
  showIcon?: boolean;
  /** Dark-mode flag */
  isDark?: boolean;
}

// ── Config map ───────────────────────────────────────────────────────────────────
interface BadgeConfig {
  defaultLabel: string;
  Icon: React.ElementType;
  lightBg: string;
  lightBorder: string;
  lightText: string;
  darkBg: string;
  darkBorder: string;
  darkText: string;
}

const CONFIG: Record<BadgeStatus, BadgeConfig> = {
  active: {
    defaultLabel: 'Active',
    Icon: CheckCircle,
    lightBg: 'rgba(16,185,129,0.12)',
    lightBorder: 'rgba(16,185,129,0.35)',
    lightText: 'rgb(5,150,105)',
    darkBg: 'rgba(16,185,129,0.15)',
    darkBorder: 'rgba(16,185,129,0.4)',
    darkText: '#6ee7b7',
  },
  expiring: {
    defaultLabel: 'Expiring Soon',
    Icon: AlertTriangle,
    lightBg: 'rgba(245,158,11,0.12)',
    lightBorder: 'rgba(245,158,11,0.35)',
    lightText: 'rgb(180,120,0)',
    darkBg: 'rgba(245,158,11,0.15)',
    darkBorder: 'rgba(245,158,11,0.4)',
    darkText: '#fcd34d',
  },
  expired: {
    defaultLabel: 'Expired',
    Icon: XCircle,
    lightBg: 'rgba(239,68,68,0.1)',
    lightBorder: 'rgba(239,68,68,0.3)',
    lightText: 'rgb(185,28,28)',
    darkBg: 'rgba(239,68,68,0.15)',
    darkBorder: 'rgba(239,68,68,0.4)',
    darkText: '#fca5a5',
  },
  confirmed: {
    defaultLabel: 'Confirmed',
    Icon: CheckCircle,
    lightBg: 'rgba(16,185,129,0.1)',
    lightBorder: 'rgba(16,185,129,0.3)',
    lightText: 'rgb(5,150,105)',
    darkBg: 'rgba(16,185,129,0.15)',
    darkBorder: 'rgba(16,185,129,0.4)',
    darkText: '#6ee7b7',
  },
  pending: {
    defaultLabel: 'Pending',
    Icon: Clock,
    lightBg: 'rgba(245,158,11,0.1)',
    lightBorder: 'rgba(245,158,11,0.3)',
    lightText: 'rgb(180,120,0)',
    darkBg: 'rgba(245,158,11,0.15)',
    darkBorder: 'rgba(245,158,11,0.4)',
    darkText: '#fcd34d',
  },
  cancelled: {
    defaultLabel: 'Cancelled',
    Icon: Ban,
    lightBg: 'rgba(239,68,68,0.1)',
    lightBorder: 'rgba(239,68,68,0.3)',
    lightText: 'rgb(185,28,28)',
    darkBg: 'rgba(239,68,68,0.15)',
    darkBorder: 'rgba(239,68,68,0.4)',
    darkText: '#fca5a5',
  },
  completed: {
    defaultLabel: 'Completed',
    Icon: Check,
    lightBg: 'rgba(99,102,241,0.1)',
    lightBorder: 'rgba(99,102,241,0.3)',
    lightText: 'rgb(67,56,202)',
    darkBg: 'rgba(99,102,241,0.15)',
    darkBorder: 'rgba(99,102,241,0.4)',
    darkText: '#c7d2fe',
  },
  available: {
    defaultLabel: 'Available',
    Icon: CheckCircle,
    lightBg: 'rgba(16,185,129,0.1)',
    lightBorder: 'rgba(16,185,129,0.3)',
    lightText: 'rgb(5,150,105)',
    darkBg: 'rgba(16,185,129,0.15)',
    darkBorder: 'rgba(16,185,129,0.4)',
    darkText: '#6ee7b7',
  },
  used: {
    defaultLabel: 'Used',
    Icon: Check,
    lightBg: 'rgba(107,114,128,0.1)',
    lightBorder: 'rgba(107,114,128,0.3)',
    lightText: 'rgb(75,85,99)',
    darkBg: 'rgba(107,114,128,0.15)',
    darkBorder: 'rgba(107,114,128,0.4)',
    darkText: '#d1d5db',
  },
};

const SIZE_CLASSES: Record<BadgeSize, string> = {
  xs: 'px-2 py-0.5 text-xs gap-1',
  sm: 'px-2.5 py-0.5 text-xs gap-1',
  md: 'px-3 py-1 text-sm gap-1.5',
};

const ICON_CLASSES: Record<BadgeSize, string> = {
  xs: 'w-3 h-3',
  sm: 'w-3 h-3',
  md: 'w-3.5 h-3.5',
};

export function StatusBadge({
  status,
  label,
  size = 'sm',
  showIcon = true,
  isDark = false,
}: StatusBadgeProps) {
  const cfg = CONFIG[status];

  const bg = isDark ? cfg.darkBg : cfg.lightBg;
  const border = isDark ? cfg.darkBorder : cfg.lightBorder;
  const color = isDark ? cfg.darkText : cfg.lightText;

  const badgeStyle: React.CSSProperties = {
    background: bg,
    border: `1px solid ${border}`,
    color,
  };

  const Icon = cfg.Icon;
  const displayLabel = label ?? cfg.defaultLabel;
  const sizeClass = SIZE_CLASSES[size];
  const iconClass = ICON_CLASSES[size];

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClass}`}
      style={badgeStyle}
    >
      {showIcon && <Icon className={`flex-shrink-0 ${iconClass}`} />}
      {displayLabel}
    </span>
  );
}
