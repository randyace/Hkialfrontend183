/**
 * MemberProfileCard
 * Sidebar-style member identity & quota card.
 * All data and callbacks are prop-driven. Zero internal state.
 */
import React from 'react';
import {
  Wallet,
  Ticket,
  BadgeCheck,
  Building2,
  Plane,
  Calendar,
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { palette, GOLD, type MembershipStatus } from './tokens';

export type MemberType = 'Individual' | 'Corporate' | 'Travel Agency';
export type TierVariant = 'Platinum' | 'Gold' | 'Silver';

export interface MemberProfileCardProps {
  name: string;
  memberId: string;
  memberType: MemberType;
  email?: string;
  companyName?: string;
  /** Individual-specific tier */
  membershipTier?: TierVariant;
  /** Visits / bookings remaining count */
  bookingsRemaining?: number;
  /** For Travel Agency: HKD credit balance */
  creditBalance?: number;
  /** Voucher count visible in sidebar info */
  voucherCount?: number;
  /** Membership expiry ISO date string */
  expiryDate?: string;
  /** Membership status — computed externally so the card stays pure */
  membershipStatus?: MembershipStatus;
  /** CTA for renewing */
  onRenew?: () => void;
  /** Dark-mode flag */
  isDark?: boolean;
  /** Extra classes on root */
  className?: string;
}

// ── Tier gradient map ────────────────────────────────────────────────────────────
const TIER_GRADIENT: Record<TierVariant, string> = {
  Platinum: 'linear-gradient(135deg, #9ca3af, #6b7280)',
  Gold: 'linear-gradient(135deg, rgb(220,181,21), rgb(180,141,11))',
  Silver: 'linear-gradient(135deg, #d1d5db, #9ca3af)',
};

// ── Member-type icon map ─────────────────────────────────────────────────────────
const TYPE_ICON: Record<MemberType, React.ElementType> = {
  Individual: Plane,
  Corporate: Building2,
  'Travel Agency': BadgeCheck,
};

export function MemberProfileCard({
  name,
  memberId,
  memberType,
  email,
  companyName,
  membershipTier,
  bookingsRemaining,
  creditBalance,
  voucherCount,
  expiryDate,
  membershipStatus,
  onRenew,
  isDark = false,
  className = '',
}: MemberProfileCardProps) {
  const p = palette(isDark);

  // ── Card outer surface ────────────────────────────────────────────────────────
  const cardStyle: React.CSSProperties = {
    backdropFilter: 'blur(16px)',
    background: p.glassBackground,
    border: `1px solid ${p.glassBorder}`,
    boxShadow: p.glassShadow,
  };

  // Info bar (dark strip)
  const infoBgStyle: React.CSSProperties = {
    background: p.sidebarInfoBg,
    border: `1px solid ${p.glassBorder}`,
  };

  const infoBadgeBg = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.15)';

  // Avatar initials
  const initials = name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  const avatarStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, rgb(220,181,21), rgb(180,141,11))',
    color: '#ffffff',
  };

  // Tier badge
  const tierGradient =
    membershipTier && TIER_GRADIENT[membershipTier] ? TIER_GRADIENT[membershipTier] : undefined;

  // Type icon
  const TypeIcon = TYPE_ICON[memberType];

  // Expiry formatted
  const formattedExpiry = expiryDate
    ? new Date(expiryDate).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      })
    : null;

  // Is travel agency?
  const isTravelAgency = memberType === 'Travel Agency';

  // Booking label
  const quotaLabel = isTravelAgency ? 'Credit Balance' : 'Bookings Remaining';
  const quotaValue =
    isTravelAgency && creditBalance !== undefined
      ? `HKD ${creditBalance.toLocaleString()}`
      : bookingsRemaining !== undefined
        ? String(bookingsRemaining)
        : null;

  function handleRenew() {
    if (onRenew) onRenew();
  }

  return (
    <div className={`rounded-2xl overflow-hidden ${className}`} style={cardStyle}>
      {/* ── Identity strip ─────────────────────────────────────────────────────── */}
      <div className="p-4 rounded-xl m-3" style={infoBgStyle}>
        {/* Avatar row */}
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold"
            style={avatarStyle}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: '#ffffff' }}>
              {name}
            </p>
            <p className="text-xs mt-0.5 font-mono" style={{ color: '#9ca3af' }}>
              {memberId}
            </p>
            {email && (
              <p className="text-xs mt-0.5 truncate" style={{ color: '#9ca3af' }}>
                {email}
              </p>
            )}
          </div>
        </div>

        {/* Type + tier badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium"
            style={{ background: infoBadgeBg, color: '#ffffff' }}
          >
            <TypeIcon className="w-3.5 h-3.5" />
            {memberType}
          </span>
          {companyName && (
            <span
              className="px-2.5 py-1 rounded-full text-xs truncate max-w-[120px]"
              style={{ background: infoBadgeBg, color: '#9ca3af' }}
            >
              {companyName}
            </span>
          )}
          {tierGradient && (
            <span
              className="px-2.5 py-1 rounded-full text-xs font-semibold text-white"
              style={{ background: tierGradient }}
            >
              {membershipTier}
            </span>
          )}
        </div>

        {/* Quota row */}
        {quotaValue !== null && (
          <div
            className="flex items-center justify-between rounded-lg px-3 py-2"
            style={{ background: infoBadgeBg }}
          >
            <div className="flex items-center gap-2">
              <Wallet className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs" style={{ color: '#d1d5db' }}>
                {quotaLabel}
              </span>
            </div>
            <span className="text-sm font-semibold" style={{ color: '#ffffff' }}>
              {quotaValue}
            </span>
          </div>
        )}
      </div>

      {/* ── Membership details ────────────────────────────────────────────────── */}
      <div className="px-4 pb-4 space-y-3">
        {/* Expiry */}
        {formattedExpiry && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2" style={{ color: p.textMuted }}>
              <Calendar className="w-4 h-4" />
              <span className="text-xs">Valid until</span>
            </div>
            <span className="text-xs font-medium" style={{ color: p.textSecondary }}>
              {formattedExpiry}
            </span>
          </div>
        )}

        {/* Status badge */}
        {membershipStatus && (
          <div className="flex items-center justify-between">
            <span className="text-xs" style={{ color: p.textMuted }}>
              Status
            </span>
            <StatusBadge status={membershipStatus} isDark={isDark} size="xs" />
          </div>
        )}

        {/* Voucher count */}
        {voucherCount !== undefined && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2" style={{ color: p.textMuted }}>
              <Ticket className="w-4 h-4" />
              <span className="text-xs">Vouchers</span>
            </div>
            <span className="text-xs font-semibold" style={{ color: GOLD }}>
              {voucherCount} available
            </span>
          </div>
        )}

        {/* Renew CTA */}
        {(membershipStatus === 'expiring' || membershipStatus === 'expired') && onRenew && (
          <button
            type="button"
            onClick={handleRenew}
            className="w-full py-2 rounded-xl text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, rgb(220,181,21), rgb(180,141,11))' }}
          >
            {membershipStatus === 'expired' ? 'Renew Membership' : 'Renew Early'}
          </button>
        )}
      </div>
    </div>
  );
}
