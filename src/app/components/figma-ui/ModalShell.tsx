/**
 * ModalShell
 * Accessible modal overlay shell: backdrop + panel.
 * Size, title, footer, and close handler are all prop-driven.
 * Zero internal state — the parent controls `isOpen`.
 */
import React from 'react';
import { X } from 'lucide-react';
import { palette, GOLD } from './tokens';

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface ModalShellProps {
  /** Whether the modal is visible */
  isOpen: boolean;
  /** Panel title */
  title?: string;
  /** Optional subtitle line below title */
  subtitle?: string;
  /** Icon rendered before the title */
  titleIcon?: React.ReactNode;
  /** Whether to show the × close button in the header */
  showClose?: boolean;
  /** Close callback (triggered by the × button and backdrop click if `closeOnBackdrop`) */
  onClose?: () => void;
  /** Whether clicking the backdrop fires `onClose` */
  closeOnBackdrop?: boolean;
  /** Modal width preset */
  size?: ModalSize;
  /** Render content inside the panel */
  children: React.ReactNode;
  /** Footer slot — rendered below a divider at the panel bottom */
  footer?: React.ReactNode;
  /** Dark-mode flag */
  isDark?: boolean;
  /** Extra class on the panel */
  className?: string;
}

const SIZE_MAX: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
  full: 'max-w-full mx-4',
};

export function ModalShell({
  isOpen,
  title,
  subtitle,
  titleIcon,
  showClose = true,
  onClose,
  closeOnBackdrop = true,
  size = 'md',
  children,
  footer,
  isDark = false,
  className = '',
}: ModalShellProps) {
  if (!isOpen) return null;

  const p = palette(isDark);

  // ── Computed styles ──────────────────────────────────────────────────────────
  const panelStyle: React.CSSProperties = {
    background: p.modalBackground,
    border: `1px solid ${p.glassBorder}`,
    boxShadow: isDark
      ? '0 25px 60px rgba(0,0,0,0.5)'
      : '0 25px 60px rgba(64,63,52,0.15)',
  };

  const headerBorderStyle: React.CSSProperties = {
    borderBottom: `1px solid ${p.glassBorder}`,
  };

  const footerBorderStyle: React.CSSProperties = {
    borderTop: `1px solid ${p.glassBorder}`,
  };

  const backdropStyle: React.CSSProperties = {
    background: isDark ? 'rgba(0,0,0,0.7)' : 'rgba(64,63,52,0.4)',
    backdropFilter: 'blur(4px)',
  };

  // ── Handlers ────────────────────────────────────────────────────────────────
  function handleBackdropClick() {
    if (closeOnBackdrop && onClose) onClose();
  }

  function handlePanelClick(e: React.MouseEvent<HTMLDivElement>) {
    e.stopPropagation();
  }

  function handleClose() {
    if (onClose) onClose();
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={backdropStyle}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full ${SIZE_MAX[size]} rounded-2xl overflow-hidden animate-scale-in ${className}`}
        style={panelStyle}
        onClick={handlePanelClick}
      >
        {/* Header */}
        {(title || showClose) && (
          <div
            className="flex items-center justify-between gap-3 px-6 py-4"
            style={headerBorderStyle}
          >
            <div className="flex items-center gap-2 min-w-0">
              {titleIcon && (
                <span className="flex-shrink-0 w-5 h-5" style={{ color: GOLD }}>
                  {titleIcon}
                </span>
              )}
              <div className="min-w-0">
                {title && (
                  <h3 className="truncate" style={{ color: p.text }}>
                    {title}
                  </h3>
                )}
                {subtitle && (
                  <p className="text-xs mt-0.5 truncate" style={{ color: p.textMuted }}>
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            {showClose && (
              <button
                type="button"
                onClick={handleClose}
                className="flex-shrink-0 p-1.5 rounded-lg transition-colors hover:bg-white/10"
                style={{ color: p.textMuted }}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5 overflow-y-auto max-h-[70vh]">{children}</div>

        {/* Footer */}
        {footer && (
          <div className="px-6 py-4" style={footerBorderStyle}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
