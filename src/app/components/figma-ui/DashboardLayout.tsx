/**
 * DashboardLayout
 * Full-page content wrapper for portal pages rendered inside the sidebar shell.
 * Provides a consistent page header (title, subtitle, breadcrumb, header actions)
 * and scrollable body region.
 * Pure presentational — zero internal state.
 */
import React from 'react';
import { ChevronRight, Menu } from 'lucide-react';
import { palette, GOLD } from './tokens';

export interface BreadcrumbItem {
  label: string;
  /** If provided, a click on this crumb fires onBreadcrumbClick with this href */
  href?: string;
}

export interface DashboardLayoutProps {
  /** Page title rendered in the header */
  pageTitle: string;
  /** Optional subtitle / description */
  pageSubtitle?: string;
  /** Breadcrumb trail. Last item is always non-clickable (current page). */
  breadcrumbs?: BreadcrumbItem[];
  /** Node rendered on the right side of the header (buttons, etc.) */
  headerActions?: React.ReactNode;
  /** Main page content */
  children: React.ReactNode;
  /** Dark-mode flag */
  isDark?: boolean;
  /** Callback when a breadcrumb with href is clicked */
  onBreadcrumbClick?: (href: string) => void;
  /** Mobile hamburger menu callback */
  onMenuToggle?: () => void;
  /** Whether to show the mobile hamburger button */
  showMenuToggle?: boolean;
  /** Extra classes on root wrapper */
  className?: string;
}

export function DashboardLayout({
  pageTitle,
  pageSubtitle,
  breadcrumbs,
  headerActions,
  children,
  isDark = false,
  onBreadcrumbClick,
  onMenuToggle,
  showMenuToggle = false,
  className = '',
}: DashboardLayoutProps) {
  const p = palette(isDark);

  // ── Styles ──────────────────────────────────────────────────────────────────
  const wrapperStyle: React.CSSProperties = {
    background: p.background,
    minHeight: '100vh',
  };

  const headerBorderStyle: React.CSSProperties = {
    borderBottom: `1px solid ${p.glassBorder}`,
    backdropFilter: 'blur(12px)',
    background: isDark
      ? 'rgba(10,25,41,0.85)'
      : 'rgba(255,255,255,0.9)',
  };

  const titleGradientStyle: React.CSSProperties = {
    background: `linear-gradient(135deg, ${GOLD}, rgb(180,141,11))`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };

  // ── Handlers ────────────────────────────────────────────────────────────────
  function handleMenuToggle() {
    if (onMenuToggle) onMenuToggle();
  }

  function handleBreadcrumbClick(href: string) {
    if (onBreadcrumbClick) onBreadcrumbClick(href);
  }

  return (
    <div className={`flex flex-col ${className}`} style={wrapperStyle}>
      {/* ── Sticky header ────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-30 px-6 py-4"
        style={headerBorderStyle}
      >
        <div className="flex items-center justify-between gap-4">
          {/* Left: hamburger + title */}
          <div className="flex items-center gap-3 min-w-0">
            {showMenuToggle && (
              <button
                type="button"
                onClick={handleMenuToggle}
                className="md:hidden flex-shrink-0 p-2 rounded-lg transition-colors hover:bg-white/10"
                style={{ color: p.textMuted }}
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <div className="min-w-0">
              {/* Breadcrumbs */}
              {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="flex items-center gap-1 mb-1 flex-wrap">
                  {breadcrumbs.map((crumb, idx) => {
                    const isLast = idx === breadcrumbs.length - 1;
                    const isClickable = !isLast && !!crumb.href;

                    if (isClickable) {
                      return (
                        <React.Fragment key={crumb.label}>
                          <button
                            type="button"
                            onClick={() => handleBreadcrumbClick(crumb.href!)}
                            className="text-xs transition-opacity hover:opacity-70"
                            style={{ color: GOLD }}
                          >
                            {crumb.label}
                          </button>
                          <ChevronRight
                            className="w-3 h-3 flex-shrink-0"
                            style={{ color: p.textMuted }}
                          />
                        </React.Fragment>
                      );
                    }

                    return (
                      <React.Fragment key={crumb.label}>
                        <span
                          className="text-xs"
                          style={{ color: isLast ? p.textMuted : p.textSecondary }}
                        >
                          {crumb.label}
                        </span>
                        {!isLast && (
                          <ChevronRight
                            className="w-3 h-3 flex-shrink-0"
                            style={{ color: p.textMuted }}
                          />
                        )}
                      </React.Fragment>
                    );
                  })}
                </nav>
              )}

              {/* Title */}
              <h1 className="truncate" style={titleGradientStyle}>
                {pageTitle}
              </h1>
              {pageSubtitle && (
                <p className="text-xs mt-0.5 truncate" style={{ color: p.textMuted }}>
                  {pageSubtitle}
                </p>
              )}
            </div>
          </div>

          {/* Right: actions */}
          {headerActions && (
            <div className="flex-shrink-0 flex items-center gap-2">{headerActions}</div>
          )}
        </div>
      </header>

      {/* ── Scrollable content ────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-y-auto">
        <div className="px-6 py-6 max-w-screen-xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
