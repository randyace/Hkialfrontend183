/**
 * AuthLayout
 * Full-viewport layout for authentication pages (login, 2FA, registration).
 * Renders animated background blobs and a centred glass panel.
 * All content is rendered via children. Zero internal state.
 */
import React from 'react';
import { palette, GOLD } from './tokens';

export interface AuthLayoutProps {
  /** Content inside the centred glass panel */
  children: React.ReactNode;
  /** Logo image source URL */
  logoSrc?: string;
  /** Tagline shown under the logo */
  tagline?: string;
  /** Footer note text below the panel */
  footerNote?: string;
  /** Dark-mode flag */
  isDark?: boolean;
  /** Width preset for the glass panel */
  panelWidth?: 'sm' | 'md' | 'lg';
}

const PANEL_WIDTH: Record<'sm' | 'md' | 'lg', string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export function AuthLayout({
  children,
  logoSrc,
  tagline,
  footerNote,
  isDark = false,
  panelWidth = 'md',
}: AuthLayoutProps) {
  const p = palette(isDark);

  // ── Background ────────────────────────────────────────────────────────────────
  const pageStyle: React.CSSProperties = {
    background: isDark
      ? 'linear-gradient(135deg, #0a1929 0%, #0d2137 50%, #0a1929 100%)'
      : 'linear-gradient(135deg, #FFFFFF 0%, rgb(231,230,221) 50%, #FFFFFF 100%)',
    minHeight: '100vh',
  };

  // ── Glass panel ───────────────────────────────────────────────────────────────
  const panelStyle: React.CSSProperties = {
    backdropFilter: 'blur(20px)',
    background: p.glassBackground,
    border: `1px solid ${p.glassBorder}`,
    boxShadow: isDark
      ? '0 25px 60px rgba(0,0,0,0.4)'
      : '0 25px 60px rgba(64,63,52,0.12)',
  };

  // ── Blob colours ─────────────────────────────────────────────────────────────
  const blobOpacity = isDark ? '0.10' : '0.07';

  const blob1Style: React.CSSProperties = {
    background: GOLD,
    opacity: blobOpacity,
    width: '350px',
    height: '350px',
    borderRadius: '50%',
    position: 'absolute',
    top: '-80px',
    left: '-100px',
    filter: 'blur(60px)',
    pointerEvents: 'none',
  };

  const blob2Style: React.CSSProperties = {
    background: isDark ? 'rgb(59,130,246)' : 'rgb(220,181,21)',
    opacity: blobOpacity,
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    position: 'absolute',
    bottom: '-60px',
    right: '-80px',
    filter: 'blur(60px)',
    pointerEvents: 'none',
  };

  const blob3Style: React.CSSProperties = {
    background: isDark ? 'rgb(139,92,246)' : 'rgb(180,141,11)',
    opacity: blobOpacity,
    width: '250px',
    height: '250px',
    borderRadius: '50%',
    position: 'absolute',
    top: '40%',
    right: '20%',
    filter: 'blur(50px)',
    pointerEvents: 'none',
  };

  const logoAreaStyle: React.CSSProperties = {
    borderBottom: `1px solid ${p.glassBorder}`,
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center min-h-screen px-4 py-10 overflow-hidden"
      style={pageStyle}
    >
      {/* Animated blobs */}
      <div style={blob1Style} className="animate-blob" />
      <div style={blob2Style} className="animate-blob animation-delay-2000" />
      <div style={blob3Style} className="animate-blob animation-delay-4000" />

      {/* Glass panel */}
      <div
        className={`relative z-10 w-full ${PANEL_WIDTH[panelWidth]} rounded-2xl overflow-hidden animate-fade-in`}
        style={panelStyle}
      >
        {/* Logo area */}
        {(logoSrc || tagline) && (
          <div className="flex flex-col items-center px-8 pt-8 pb-6" style={logoAreaStyle}>
            {logoSrc && (
              <img
                src={logoSrc}
                alt="Logo"
                className="h-14 w-auto object-contain mb-3"
              />
            )}
            {tagline && (
              <p className="text-sm text-center" style={{ color: p.textMuted }}>
                {tagline}
              </p>
            )}
          </div>
        )}

        {/* Page content */}
        <div className="px-8 py-6">{children}</div>
      </div>

      {/* Footer note */}
      {footerNote && (
        <p
          className="relative z-10 mt-6 text-xs text-center max-w-sm"
          style={{ color: p.textMuted }}
        >
          {footerNote}
        </p>
      )}
    </div>
  );
}
