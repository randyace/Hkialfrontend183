/**
 * VoucherCard
 * Displays a single lounge or Premiere Suite upgrade voucher.
 * Personal-privilege note (account holder + registered spouse only)
 * is shown when `showPrivilegeNote` is true.
 * Zero internal state.
 */
import React from 'react';
import {
  Ticket,
  Star,
  Copy,
  CheckCheck,
  Download,
  Lock,
  Calendar,
  User,
  Heart,
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { palette, GOLD, type VoucherCodeStatus } from './tokens';

export type VoucherType = 'booking' | 'premiere-suite';

export interface VoucherCardProps {
  /** The alphanumeric voucher code */
  code: string;
  /** Voucher category */
  voucherType: VoucherType;
  /** Availability status */
  status: VoucherCodeStatus;
  /** Lounge the voucher applies to (if restricted) */
  lounge?: string;
  /** ISO date — start of validity window */
  validFrom?: string;
  /** ISO date — end of validity window */
  validUntil?: string;
  /** Who redeemed the voucher (if used) */
  usedBy?: string;
  /** ISO date when the voucher was used */
  usedDate?: string;
  /** Whether this voucher belongs to the registered spouse slot */
  isForSpouse?: boolean;
  /** Show the personal-privilege disclaimer */
  showPrivilegeNote?: boolean;
  /** Parent batch name (for corporate batch context) */
  batchName?: string;
  /** Whether the code-copy action was just triggered (controls icon feedback) */
  isCopied?: boolean;
  /** Copy code callback */
  onCopy?: (code: string) => void;
  /** Download/export callback */
  onDownload?: (code: string) => void;
  /** Dark-mode flag */
  isDark?: boolean;
  /** Extra classes on root */
  className?: string;
}

export function VoucherCard({
  code,
  voucherType,
  status,
  lounge,
  validFrom,
  validUntil,
  usedBy,
  usedDate,
  isForSpouse = false,
  showPrivilegeNote = false,
  batchName,
  isCopied = false,
  onCopy,
  onDownload,
  isDark = false,
  className = '',
}: VoucherCardProps) {
  const p = palette(isDark);

  // ── Type-specific config ─────────────────────────────────────────────────────
  const isPremiere = voucherType === 'premiere-suite';
  const typeLabel = isPremiere ? 'Premiere Suite Upgrade' : 'Lounge Booking Voucher';
  const TypeIcon = isPremiere ? Star : Ticket;

  // Icon accent
  const iconAccentBg = isPremiere
    ? isDark
      ? 'rgba(139,92,246,0.2)'
      : 'rgba(139,92,246,0.12)'
    : isDark
      ? 'rgba(220,181,21,0.2)'
      : 'rgba(220,181,21,0.15)';
  const iconAccentColor = isPremiere ? (isDark ? '#a78bfa' : 'rgb(109,40,217)') : GOLD;

  // ── Card surface ─────────────────────────────────────────────────────────────
  const isAvailable = status === 'available';

  const cardStyle: React.CSSProperties = {
    backdropFilter: 'blur(16px)',
    background: isAvailable
      ? p.glassBackground
      : isDark
        ? 'rgba(255,255,255,0.04)'
        : 'rgba(231,230,221,0.3)',
    border: `1px solid ${isAvailable ? p.glassBorder : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(200,199,190,0.4)'}`,
    boxShadow: isAvailable ? p.glassShadow : 'none',
    opacity: status === 'expired' ? 0.6 : 1,
  };

  const dividerStyle: React.CSSProperties = {
    borderTop: `1px solid ${p.glassBorder}`,
  };

  // Code background
  const codeStyle: React.CSSProperties = {
    background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(231,230,221,0.5)',
    border: `1px solid ${p.glassBorder}`,
  };

  // Spouse badge
  const spouseBadgeStyle: React.CSSProperties = {
    background: isDark ? 'rgba(236,72,153,0.15)' : 'rgba(236,72,153,0.1)',
    border: '1px solid rgba(236,72,153,0.3)',
    color: isDark ? '#f9a8d4' : 'rgb(157,23,77)',
  };

  // Privilege note
  const noteStyle: React.CSSProperties = {
    background: isDark ? 'rgba(220,181,21,0.08)' : 'rgba(220,181,21,0.07)',
    border: `1px solid rgba(220,181,21,0.25)`,
  };

  // Date format helper
  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  }

  // ── Handlers ────────────────────────────────────────────────────────────────
  function handleCopy() {
    if (onCopy) onCopy(code);
  }
  function handleDownload() {
    if (onDownload) onDownload(code);
  }

  return (
    <div className={`rounded-2xl overflow-hidden ${className}`} style={cardStyle}>
      {/* Header */}
      <div className="px-5 pt-5 pb-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          {/* Type icon */}
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: iconAccentBg }}
          >
            <TypeIcon className="w-5 h-5" style={{ color: iconAccentColor }} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: p.text }}>
              {typeLabel}
            </p>
            {batchName && (
              <p className="text-xs truncate mt-0.5" style={{ color: p.textMuted }}>
                {batchName}
              </p>
            )}
            {lounge && (
              <p className="text-xs truncate mt-0.5" style={{ color: p.textMuted }}>
                {lounge}
              </p>
            )}
          </div>
        </div>

        {/* Status + spouse badge */}
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <StatusBadge status={status} isDark={isDark} size="xs" />
          {isForSpouse && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
              style={spouseBadgeStyle}
            >
              <Heart className="w-3 h-3" />
              Spouse
            </span>
          )}
        </div>
      </div>

      {/* Code row */}
      <div className="px-5 pb-4">
        <div
          className="flex items-center justify-between gap-3 rounded-xl px-4 py-2.5"
          style={codeStyle}
        >
          <span className="font-mono text-sm tracking-widest" style={{ color: p.text }}>
            {code}
          </span>
          <div className="flex items-center gap-2">
            {isAvailable && onCopy && (
              <button
                type="button"
                onClick={handleCopy}
                className="p-1 rounded transition-opacity hover:opacity-70"
                style={{ color: isCopied ? 'rgb(16,185,129)' : p.textMuted }}
                title="Copy code"
              >
                {isCopied ? (
                  <CheckCheck className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            )}
            {isAvailable && onDownload && (
              <button
                type="button"
                onClick={handleDownload}
                className="p-1 rounded transition-opacity hover:opacity-70"
                style={{ color: p.textMuted }}
                title="Download voucher"
              >
                <Download className="w-4 h-4" />
              </button>
            )}
            {!isAvailable && (
              <Lock className="w-4 h-4" style={{ color: p.textMuted }} />
            )}
          </div>
        </div>
      </div>

      {/* Meta info */}
      <div className="px-5 pb-4" style={dividerStyle}>
        <div className="pt-3 flex flex-wrap gap-x-6 gap-y-2">
          {validFrom && (
            <div className="flex items-center gap-1.5 text-xs" style={{ color: p.textMuted }}>
              <Calendar className="w-3.5 h-3.5" />
              <span>
                Valid: {formatDate(validFrom)}
                {validUntil && ` – ${formatDate(validUntil)}`}
              </span>
            </div>
          )}
          {status === 'used' && usedBy && (
            <div className="flex items-center gap-1.5 text-xs" style={{ color: p.textMuted }}>
              <User className="w-3.5 h-3.5" />
              <span>
                Used by {usedBy}
                {usedDate && ` · ${formatDate(usedDate)}`}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Privilege note */}
      {showPrivilegeNote && isAvailable && (
        <div className="px-5 pb-5">
          <div className="rounded-xl px-4 py-3" style={noteStyle}>
            <p className="text-xs leading-relaxed" style={{ color: GOLD }}>
              <strong>Personal privilege:</strong> This voucher may only be used by the
              account holder and their registered spouse. It is non-transferable.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
