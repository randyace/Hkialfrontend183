/**
 * tokens.ts
 * Shared design tokens & TypeScript interfaces for the figma-ui component library.
 * No runtime logic — purely type declarations and constant maps.
 */

// ── Gold accent ─────────────────────────────────────────────────────────────────
export const GOLD = 'rgb(220, 181, 21)';
export const GOLD_DARK = 'rgb(180, 141, 11)';
export const GOLD_GRADIENT = `linear-gradient(135deg, ${GOLD}, ${GOLD_DARK})`;

// ── Dark-mode palette ───────────────────────────────────────────────────────────
export const DARK = {
  background: '#0a1929',
  text: '#ffffff',
  textSecondary: '#e5e7eb',
  textMuted: '#9ca3af',
  other: 'rgba(255, 255, 255, 0.1)',
  glassBackground: 'rgba(255, 255, 255, 0.1)',
  glassBorder: 'rgba(255, 255, 255, 0.2)',
  glassShadow: '0 8px 32px rgba(31, 38, 135, 0.15)',
  inputBackground: 'rgba(255, 255, 255, 0.1)',
  inputBorder: 'rgba(255, 255, 255, 0.2)',
  inputText: '#ffffff',
  inputPlaceholder: '#9ca3af',
  cardItemBg: 'rgba(255, 255, 255, 0.3)',
  cardItemBorder: 'rgba(255, 255, 255, 0.2)',
  modalBackground: '#0a1929',
  sidebarBackground: '#0a1929',
  sidebarHoverBg: 'rgba(255, 255, 255, 0.1)',
  sidebarInfoBg: 'rgb(0, 28, 46)',
  sidebarTextPrimary: '#ffffff',
  sidebarTextMuted: '#6b7280',
} as const;

// ── Light-mode palette ──────────────────────────────────────────────────────────
export const LIGHT = {
  background: '#FFFFFF',
  text: 'rgb(64, 63, 52)',
  textSecondary: 'rgb(90, 89, 78)',
  textMuted: 'rgb(130, 129, 118)',
  other: 'rgb(231, 230, 221)',
  glassBackground: 'rgba(231, 230, 221, 0.5)',
  glassBorder: 'rgba(200, 199, 190, 0.6)',
  glassShadow: '0 8px 32px rgba(64, 63, 52, 0.08)',
  inputBackground: 'rgba(231, 230, 221, 0.5)',
  inputBorder: 'rgba(200, 199, 190, 0.6)',
  inputText: 'rgb(64, 63, 52)',
  inputPlaceholder: 'rgb(160, 159, 148)',
  cardItemBg: 'rgba(231, 230, 221, 0.4)',
  cardItemBorder: 'rgba(200, 199, 190, 0.5)',
  modalBackground: '#FFFFFF',
  sidebarBackground: '#FFFFFF',
  sidebarHoverBg: 'rgba(220, 181, 21, 0.1)',
  sidebarInfoBg: 'rgb(64, 63, 52)',
  sidebarTextPrimary: 'rgb(64, 63, 52)',
  sidebarTextMuted: 'rgb(160, 159, 148)',
} as const;

// ── Utility: pick palette by mode ───────────────────────────────────────────────
export function palette(isDark: boolean) {
  return isDark ? DARK : LIGHT;
}

// ── Status-colour maps ───────────────────────────────────────────────────────────
export type BookingStatus = 'confirmed' | 'pending' | 'cancelled' | 'completed';
export type MembershipStatus = 'active' | 'expiring' | 'expired';
export type VoucherCodeStatus = 'available' | 'used' | 'expired';

export interface StatusColors {
  bg: string;
  border: string;
  text: string;
  iconColor: string;
}

export function membershipStatusColors(
  status: MembershipStatus,
  isDark: boolean,
): StatusColors {
  if (status === 'active') {
    return {
      bg: isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.1)',
      border: isDark ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(16,185,129,0.4)',
      text: isDark ? '#6ee7b7' : 'rgb(5,150,105)',
      iconColor: isDark ? '#34d399' : 'rgb(5,150,105)',
    };
  }
  if (status === 'expiring') {
    return {
      bg: isDark ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.1)',
      border: isDark ? '1px solid rgba(245,158,11,0.35)' : '1px solid rgba(245,158,11,0.4)',
      text: isDark ? '#fcd34d' : 'rgb(180,120,0)',
      iconColor: isDark ? '#fbbf24' : 'rgb(180,120,0)',
    };
  }
  return {
    bg: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)',
    border: isDark ? '1px solid rgba(239,68,68,0.35)' : '1px solid rgba(239,68,68,0.35)',
    text: isDark ? '#fca5a5' : 'rgb(185,28,28)',
    iconColor: isDark ? '#f87171' : 'rgb(185,28,28)',
  };
}

export function bookingStatusColors(
  status: BookingStatus,
  isDark: boolean,
): StatusColors {
  if (status === 'confirmed') {
    return {
      bg: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.12)',
      border: isDark ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(16,185,129,0.35)',
      text: isDark ? '#6ee7b7' : 'rgb(5,150,105)',
      iconColor: isDark ? '#34d399' : 'rgb(5,150,105)',
    };
  }
  if (status === 'pending') {
    return {
      bg: isDark ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.12)',
      border: isDark ? '1px solid rgba(245,158,11,0.4)' : '1px solid rgba(245,158,11,0.35)',
      text: isDark ? '#fcd34d' : 'rgb(180,120,0)',
      iconColor: isDark ? '#fbbf24' : 'rgb(180,120,0)',
    };
  }
  if (status === 'cancelled') {
    return {
      bg: isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.1)',
      border: isDark ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(239,68,68,0.3)',
      text: isDark ? '#fca5a5' : 'rgb(185,28,28)',
      iconColor: isDark ? '#f87171' : 'rgb(185,28,28)',
    };
  }
  // completed
  return {
    bg: isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.1)',
    border: isDark ? '1px solid rgba(99,102,241,0.4)' : '1px solid rgba(99,102,241,0.3)',
    text: isDark ? '#c7d2fe' : 'rgb(67,56,202)',
    iconColor: isDark ? '#a5b4fc' : 'rgb(67,56,202)',
  };
}

// ── Shared TypeScript interfaces ─────────────────────────────────────────────────

export interface PassengerRecord {
  title: string;
  firstName: string;
  lastName: string;
  travelDoc: string;
  membership?: string;
}

export interface ContactPerson {
  name: string;
  email: string;
  phone: string;
}

export interface BookingServices {
  loungeExtension?: number;
  limousineService?: number;
  destinationAddresses?: string[];
  limousineStops?: string[];
  wheelchairService?: number;
  luggageCount?: number;
}

export interface BookingRecord {
  id: number | string;
  bookingRef: string;
  lounge: string;
  terminal: string;
  date: string;
  time: string;
  duration: string;
  flight: string;
  flightNumber: string;
  flightClass: string;
  flightType: 'Departure' | 'Arrival' | 'Transit';
  guests: number;
  status: BookingStatus;
  amenities?: string[];
  passengers?: PassengerRecord[];
  services?: BookingServices;
  contactPerson?: ContactPerson;
  totalAmount?: number;
  premiereSuites?: number;
  vipPassengers?: number;
  nonFlyingGuests?: number;
}

export interface MemberRecord {
  name: string;
  memberId: string;
  memberType: 'Individual' | 'Corporate' | 'Travel Agency';
  email?: string;
  companyName?: string;
  membershipTier?: 'Platinum' | 'Gold' | 'Silver';
  bookingsRemaining?: number;
  totalBookings?: number;
  voucherCount?: number;
  creditBalance?: number;
  expiryDate?: string;
  startDate?: string;
  membershipNumber?: string;
}

export interface VoucherRecord {
  code: string;
  voucherType: 'booking' | 'premiere-suite';
  status: VoucherCodeStatus;
  lounge?: string;
  validFrom?: string;
  validUntil?: string;
  usedBy?: string;
  usedDate?: string;
  isForSpouse?: boolean;
  batchName?: string;
}
