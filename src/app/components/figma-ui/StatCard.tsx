/**
 * StatCard
 * A numeric KPI tile with icon, value, label, and optional trend indicator.
 * Pure presentational — zero internal state.
 */
import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { palette, GOLD } from './tokens';

export type TrendDirection = 'up' | 'down' | 'neutral';
export type StatAccent = 'gold' | 'green' | 'blue' | 'purple' | 'red' | 'teal';

export interface StatTrend {
  direction: TrendDirection;
  value: string;
  label?: string;
}

export interface StatCardProps {
  /** Primary numeric or text value */
  value: string | number;
  /** Descriptive label below the value */
  label: string;
  /** Icon node rendered in the accent square */
  icon?: React.ReactNode;
  /** Accent colour for the icon background */
  accent?: StatAccent;
  /** Optional trend indicator */
  trend?: StatTrend;
  /** Bottom CTA text */
  ctaLabel?: string;
  /** Bottom CTA callback */
  onCta?: () => void;
  /** Dark-mode flag */
  isDark?: boolean;
  /** Extra classes on root element */
  className?: string;
}

// ── Accent colour maps ────────────────────────────────────────────────────────────
const ACCENT_LIGHT: Record<StatAccent, { bg: string; text: string }> = {
  gold: { bg: 'rgba(220,181,21,0.15)', text: 'rgb(180,141,11)' },
  green: { bg: 'rgba(16,185,129,0.15)', text: 'rgb(5,150,105)' },
  blue: { bg: 'rgba(59,130,246,0.15)', text: 'rgb(37,99,235)' },
  purple: { bg: 'rgba(139,92,246,0.15)', text: 'rgb(109,40,217)' },
  red: { bg: 'rgba(239,68,68,0.12)', text: 'rgb(185,28,28)' },
  teal: { bg: 'rgba(20,184,166,0.15)', text: 'rgb(15,118,110)' },
};

const ACCENT_DARK: Record<StatAccent, { bg: string; text: string }> = {
  gold: { bg: 'rgba(220,181,21,0.2)', text: GOLD },
  green: { bg: 'rgba(16,185,129,0.2)', text: '#34d399' },
  blue: { bg: 'rgba(59,130,246,0.2)', text: '#60a5fa' },
  purple: { bg: 'rgba(139,92,246,0.2)', text: '#a78bfa' },
  red: { bg: 'rgba(239,68,68,0.2)', text: '#f87171' },
  teal: { bg: 'rgba(20,184,166,0.2)', text: '#2dd4bf' },
};

const TREND_CONFIG: Record<TrendDirection, { Icon: React.ElementType; color: string }> = {
  up: { Icon: TrendingUp, color: 'rgb(16,185,129)' },
  down: { Icon: TrendingDown, color: 'rgb(239,68,68)' },
  neutral: { Icon: Minus, color: 'rgb(107,114,128)' },
};

export function StatCard({
  value,
  label,
  icon,
  accent = 'gold',
  trend,
  ctaLabel,
  onCta,
  isDark = false,
  className = '',
}: StatCardProps) {
  const p = palette(isDark);

  const accentColors = isDark ? ACCENT_DARK[accent] : ACCENT_LIGHT[accent];

  const cardStyle: React.CSSProperties = {
    backdropFilter: 'blur(16px)',
    background: p.glassBackground,
    border: `1px solid ${p.glassBorder}`,
    boxShadow: p.glassShadow,
  };

  const iconBgStyle: React.CSSProperties = {
    background: accentColors.bg,
    color: accentColors.text,
  };

  const trendInfo = trend ? TREND_CONFIG[trend.direction] : null;
  const TrendIcon = trendInfo ? trendInfo.Icon : null;
  const trendColor = trendInfo ? trendInfo.color : undefined;

  function handleCta() {
    if (onCta) onCta();
  }

  return (
    <div
      className={`rounded-2xl p-6 flex flex-col gap-4 ${className}`}
      style={cardStyle}
    >
      {/* Icon + value row */}
      <div className="flex items-start justify-between gap-3">
        {icon && (
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
            style={iconBgStyle}
          >
            <span className="w-6 h-6">{icon}</span>
          </div>
        )}
        <div className="flex-1 min-w-0 text-right">
          <p className="text-3xl font-bold leading-none" style={{ color: p.text }}>
            {value}
          </p>
        </div>
      </div>

      {/* Label */}
      <div>
        <p className="text-sm" style={{ color: p.textSecondary }}>
          {label}
        </p>

        {/* Trend */}
        {trend && trendColor && TrendIcon && (
          <div className="flex items-center gap-1 mt-1">
            <TrendIcon className="w-3.5 h-3.5" style={{ color: trendColor }} />
            <span className="text-xs font-medium" style={{ color: trendColor }}>
              {trend.value}
            </span>
            {trend.label && (
              <span className="text-xs" style={{ color: p.textMuted }}>
                {trend.label}
              </span>
            )}
          </div>
        )}
      </div>

      {/* CTA */}
      {ctaLabel && (
        <button
          type="button"
          onClick={handleCta}
          className="mt-auto text-xs font-medium transition-opacity hover:opacity-70 text-left"
          style={{ color: GOLD }}
        >
          {ctaLabel} →
        </button>
      )}
    </div>
  );
}
