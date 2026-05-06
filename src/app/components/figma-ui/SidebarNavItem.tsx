/**
 * SidebarNavItem
 * Single navigation item for the HKIA Lounge portal sidebar.
 * Active / hover states are fully driven by props.
 * Zero internal state.
 */
import React from 'react';
import { palette } from './tokens';

export interface SidebarNavItemProps {
  /** Unique identifier for this nav item */
  id: string;
  /** Display label */
  label: string;
  /** Lucide-react icon element (or any ReactNode) */
  icon: React.ReactNode;
  /** Whether this item is the currently active page */
  isActive?: boolean;
  /** Optional count badge (e.g. unread notifications) */
  badge?: number | string;
  /** Click handler */
  onClick?: (id: string) => void;
  /** Dark-mode flag */
  isDark?: boolean;
}

export function SidebarNavItem({
  id,
  label,
  icon,
  isActive = false,
  badge,
  onClick,
  isDark = false,
}: SidebarNavItemProps) {
  const p = palette(isDark);

  // ── Pre-compute all conditional styles ──────────────────────────────────────
  const activeStyle: React.CSSProperties = {
    background: 'linear-gradient(90deg, rgb(220,181,21), rgb(180,140,10))',
    color: '#ffffff',
  };

  const inactiveStyle: React.CSSProperties = {
    background: 'transparent',
    color: p.sidebarTextPrimary,
  };

  const itemStyle = isActive ? activeStyle : inactiveStyle;
  const translateClass = 'transition-all duration-200 hover:translate-x-1';
  const activeClass = isActive ? '' : '';

  const badgeStyle: React.CSSProperties = {
    background: isActive ? 'rgba(255,255,255,0.25)' : 'rgba(220,181,21,0.15)',
    border: isActive ? '1px solid rgba(255,255,255,0.3)' : '1px solid rgba(220,181,21,0.3)',
    color: isActive ? '#ffffff' : 'rgb(180,141,11)',
  };

  function handleClick() {
    if (onClick) onClick(id);
  }

  function handleMouseEnter(e: React.MouseEvent<HTMLButtonElement>) {
    if (!isActive) {
      e.currentTarget.style.background = p.sidebarHoverBg;
    }
  }

  function handleMouseLeave(e: React.MouseEvent<HTMLButtonElement>) {
    if (!isActive) {
      e.currentTarget.style.background = 'transparent';
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left ${translateClass} ${activeClass}`}
      style={itemStyle}
    >
      <span className="w-5 h-5 flex-shrink-0">{icon}</span>
      <span className="flex-1 truncate text-sm">{label}</span>
      {badge !== undefined && (
        <span
          className="flex-shrink-0 min-w-[20px] px-1.5 py-0.5 rounded-full text-xs font-medium text-center"
          style={badgeStyle}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
