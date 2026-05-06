/**
 * figma-ui barrel export
 * Import any component via:
 *   import { GlassButton, BookingCard, … } from '../components/figma-ui';
 */

// ── Design tokens & shared types ─────────────────────────────────────────────────
export * from './tokens';

// ── Core UI kit ──────────────────────────────────────────────────────────────────
export { GlassButton } from './GlassButton';
export type { GlassButtonProps, ButtonVariant, ButtonSize } from './GlassButton';

export { StatusBadge } from './StatusBadge';
export type { StatusBadgeProps, BadgeStatus, BadgeSize } from './StatusBadge';

export { GlassInputField } from './GlassInputField';
export type { GlassInputFieldProps, SelectOption, InputType } from './GlassInputField';

export { GlassCard } from './GlassCard';
export type { GlassCardProps, CardPadding, CardVariant } from './GlassCard';

export { AlertBanner } from './AlertBanner';
export type { AlertBannerProps, AlertVariant } from './AlertBanner';

export { StatCard } from './StatCard';
export type { StatCardProps, StatTrend, TrendDirection, StatAccent } from './StatCard';

export { ModalShell } from './ModalShell';
export type { ModalShellProps, ModalSize } from './ModalShell';

// ── Portal-specific components ───────────────────────────────────────────────────
export { SidebarNavItem } from './SidebarNavItem';
export type { SidebarNavItemProps } from './SidebarNavItem';

export { BookingCard } from './BookingCard';
export type { BookingCardProps } from './BookingCard';

export { MemberProfileCard } from './MemberProfileCard';
export type { MemberProfileCardProps, MemberType, TierVariant } from './MemberProfileCard';

export { VoucherCard } from './VoucherCard';
export type { VoucherCardProps, VoucherType } from './VoucherCard';

// ── Full-page layouts ─────────────────────────────────────────────────────────────
export { DashboardLayout } from './DashboardLayout';
export type { DashboardLayoutProps, BreadcrumbItem } from './DashboardLayout';

export { AuthLayout } from './AuthLayout';
export type { AuthLayoutProps } from './AuthLayout';

export { BookingDetailPanel } from './BookingDetailPanel';
export type { BookingDetailPanelProps } from './BookingDetailPanel';
