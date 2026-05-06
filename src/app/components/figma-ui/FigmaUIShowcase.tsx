/**
 * FigmaUIShowcase
 * Self-contained visual catalogue of every figma-ui component.
 * Dumb component — theme toggle state is the ONLY internal state allowed
 * (it controls which prop value is passed to the children, not business data).
 */
import React, { useState } from 'react';
import {
  LayoutDashboard,
  Calendar,
  Star,
  Ticket,
  Settings,
  Wallet,
  Sun,
  Moon,
  TrendingUp,
  Users,
  Clock,
  Plane,
  Bell,
  Plus,
} from 'lucide-react';

import { GlassButton } from './GlassButton';
import { StatusBadge } from './StatusBadge';
import { GlassInputField } from './GlassInputField';
import { GlassCard } from './GlassCard';
import { AlertBanner } from './AlertBanner';
import { StatCard } from './StatCard';
import { ModalShell } from './ModalShell';
import { SidebarNavItem } from './SidebarNavItem';
import { BookingCard } from './BookingCard';
import { MemberProfileCard } from './MemberProfileCard';
import { VoucherCard } from './VoucherCard';
import { palette, GOLD } from './tokens';

// ── Section wrapper ──────────────────────────────────────────────────────────────
function Section({
  title,
  children,
  isDark,
}: {
  title: string;
  children: React.ReactNode;
  isDark: boolean;
}) {
  const p = palette(isDark);
  const borderStyle: React.CSSProperties = { borderBottom: `1px solid ${p.glassBorder}` };
  return (
    <section className="space-y-4">
      <div className="pb-2" style={borderStyle}>
        <h2 className="text-lg font-semibold" style={{ color: GOLD }}>
          {title}
        </h2>
      </div>
      {children}
    </section>
  );
}

// ── Mock data ─────────────────────────────────────────────────────────────────────
const MOCK_BOOKING = {
  id: 1,
  bookingRef: 'D-20260112-84721',
  lounge: 'The Wing First Class Lounge',
  terminal: 'Terminal 1',
  date: '2026-06-12',
  time: '14:30',
  duration: '3 hours',
  flight: 'CX 888 to London Heathrow',
  flightNumber: 'CX888',
  flightClass: 'First Class',
  flightType: 'Departure' as const,
  guests: 1,
  status: 'confirmed' as const,
  amenities: ['Shower', 'Private Dining', 'Meeting Room', 'Spa'],
  passengers: [
    { title: 'Mr', firstName: 'James', lastName: 'Wong', travelDoc: 'P12345678', membership: 'HKIAL001' },
    { title: 'Mrs', firstName: 'Alice', lastName: 'Wong', travelDoc: 'P87654321', membership: 'HKIAL002' },
  ],
  services: {
    loungeExtension: 2,
    limousineService: 1,
    wheelchairService: 0,
    luggageCount: 3,
  },
  contactPerson: { name: 'James Wong', email: 'james.wong@example.com', phone: '+852 9876 5432' },
  totalAmount: 2700,
};

export function FigmaUIShowcase() {
  const [isDark, setIsDark] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [pwVisible, setPwVisible] = useState(false);
  const [inputVal, setInputVal] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeNav, setActiveNav] = useState('dashboard');

  const p = palette(isDark);

  // ── Pre-computed page styles ─────────────────────────────────────────────────
  const pageStyle: React.CSSProperties = {
    background: isDark ? '#0a1929' : '#FFFFFF',
    minHeight: '100vh',
    color: p.text,
  };

  const topBarStyle: React.CSSProperties = {
    borderBottom: `1px solid ${p.glassBorder}`,
    background: isDark ? 'rgba(10,25,41,0.9)' : 'rgba(255,255,255,0.9)',
    backdropFilter: 'blur(12px)',
    position: 'sticky' as const,
    top: 0,
    zIndex: 50,
  };

  const themeButtonStyle: React.CSSProperties = {
    background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(231,230,221,0.7)',
    border: `1px solid ${p.glassBorder}`,
    color: p.text,
  };

  // ── Handlers ────────────────────────────────────────────────────────────────
  function toggleTheme() {
    setIsDark((prev) => !prev);
  }

  function openModal() {
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  function handlePwToggle() {
    setPwVisible((prev) => !prev);
  }

  function handleInputChange(val: string) {
    setInputVal(val);
  }

  function handleCopy(code: string) {
    setCopied(true);
  }

  function handleNavClick(id: string) {
    setActiveNav(id);
  }

  const NAV_ITEMS = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard /> },
    { id: 'new-booking', label: 'New Booking', icon: <Plus />, badge: 3 },
    { id: 'bookings', label: 'My Bookings', icon: <Calendar /> },
    { id: 'membership', label: 'My Membership', icon: <Star /> },
    { id: 'vouchers', label: 'Voucher Batches', icon: <Ticket /> },
    { id: 'settings', label: 'Settings', icon: <Settings /> },
  ];

  return (
    <div style={pageStyle}>
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="px-6 py-3 flex items-center justify-between" style={topBarStyle}>
        <h1 className="text-base font-semibold" style={{ color: GOLD }}>
          figma-ui · Component Showcase
        </h1>
        <button
          type="button"
          onClick={toggleTheme}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-opacity hover:opacity-80"
          style={themeButtonStyle}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          {isDark ? 'Light Mode' : 'Dark Mode'}
        </button>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-14">
        {/* ── 1. GlassButton ────────────────────────────────────────────────── */}
        <Section title="1 · GlassButton" isDark={isDark}>
          <div className="flex flex-wrap gap-3 items-center">
            <GlassButton label="Primary" variant="primary" isDark={isDark} />
            <GlassButton label="Secondary" variant="secondary" isDark={isDark} />
            <GlassButton label="Ghost" variant="ghost" isDark={isDark} />
            <GlassButton label="Outline" variant="outline" isDark={isDark} />
            <GlassButton label="Danger" variant="danger" isDark={isDark} />
            <GlassButton label="Disabled" variant="primary" disabled isDark={isDark} />
            <GlassButton label="Loading…" variant="primary" loading isDark={isDark} />
          </div>
          <div className="flex flex-wrap gap-3 items-center mt-3">
            <GlassButton label="XS" size="xs" variant="primary" isDark={isDark} />
            <GlassButton label="SM" size="sm" variant="primary" isDark={isDark} />
            <GlassButton label="MD" size="md" variant="primary" isDark={isDark} />
            <GlassButton label="LG" size="lg" variant="primary" isDark={isDark} />
            <GlassButton
              label="With Icon"
              variant="primary"
              iconLeft={<Bell />}
              isDark={isDark}
            />
            <GlassButton
              label="Full Width"
              variant="secondary"
              fullWidth
              isDark={isDark}
              className="w-full max-w-xs"
            />
          </div>
        </Section>

        {/* ── 2. StatusBadge ────────────────────────────────────────────────── */}
        <Section title="2 · StatusBadge" isDark={isDark}>
          <div className="flex flex-wrap gap-3 items-center">
            <StatusBadge status="active" isDark={isDark} />
            <StatusBadge status="expiring" isDark={isDark} />
            <StatusBadge status="expired" isDark={isDark} />
            <StatusBadge status="confirmed" isDark={isDark} />
            <StatusBadge status="pending" isDark={isDark} />
            <StatusBadge status="cancelled" isDark={isDark} />
            <StatusBadge status="completed" isDark={isDark} />
            <StatusBadge status="available" isDark={isDark} />
            <StatusBadge status="used" isDark={isDark} />
          </div>
          <div className="flex flex-wrap gap-3 items-center mt-2">
            <StatusBadge status="confirmed" size="xs" isDark={isDark} />
            <StatusBadge status="confirmed" size="sm" isDark={isDark} />
            <StatusBadge status="confirmed" size="md" isDark={isDark} />
            <StatusBadge status="active" showIcon={false} label="Custom Label" isDark={isDark} />
          </div>
        </Section>

        {/* ── 3. GlassInputField ────────────────────────────────────────────── */}
        <Section title="3 · GlassInputField" isDark={isDark}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <GlassInputField
              label="Email Address"
              type="email"
              placeholder="you@example.com"
              value={inputVal}
              onChange={handleInputChange}
              required
              iconLeft={<Plane className="w-4 h-4" />}
              isDark={isDark}
            />
            <GlassInputField
              label="Password"
              type="password"
              placeholder="••••••••"
              showPasswordToggle
              passwordVisible={pwVisible}
              onTogglePassword={handlePwToggle}
              isDark={isDark}
            />
            <GlassInputField
              label="Date of Travel"
              type="date"
              iconLeft={<Calendar className="w-4 h-4" />}
              isDark={isDark}
            />
            <GlassInputField
              label="Select Lounge"
              as="select"
              placeholder="Choose a lounge…"
              options={[
                { value: 'wing', label: 'The Wing First Class' },
                { value: 'pier', label: 'The Pier Business' },
                { value: 'cabin', label: 'The Cabin' },
              ]}
              isDark={isDark}
            />
            <GlassInputField
              label="Special Requests"
              as="textarea"
              placeholder="Any dietary or accessibility requirements…"
              rows={3}
              isDark={isDark}
            />
            <GlassInputField
              label="Promo Code"
              type="text"
              placeholder="Enter code"
              error="Invalid promo code"
              isDark={isDark}
            />
          </div>
        </Section>

        {/* ── 4. GlassCard ──────────────────────────────────────────────────── */}
        <Section title="4 · GlassCard" isDark={isDark}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <GlassCard
              title="Glass Variant"
              subtitle="Default glass morphism"
              titleIcon={<Star />}
              variant="glass"
              isDark={isDark}
              headerAction={
                <GlassButton label="Action" size="xs" variant="ghost" isDark={isDark} />
              }
            >
              <p className="text-sm" style={{ color: p.textSecondary }}>
                Content goes here. Backdrop blur and translucent background.
              </p>
            </GlassCard>

            <GlassCard
              title="Solid Variant"
              variant="solid"
              isDark={isDark}
              padding="md"
            >
              <p className="text-sm" style={{ color: p.textSecondary }}>
                Uses the secondary surface color without backdrop blur.
              </p>
            </GlassCard>

            <GlassCard
              title="Gold Card"
              subtitle="Membership card style"
              variant="gold"
              isDark={isDark}
            >
              <p className="text-sm text-white/80">
                Warm gradient used for the membership card hero.
              </p>
            </GlassCard>
          </div>
        </Section>

        {/* ── 5. AlertBanner ────────────────────────────────────────────────── */}
        <Section title="5 · AlertBanner" isDark={isDark}>
          <div className="space-y-3">
            <AlertBanner
              variant="info"
              title="Heads up"
              message="Your booking window opens 72 hours before your scheduled flight."
              isDismissible
              isDark={isDark}
            />
            <AlertBanner
              variant="success"
              title="Booking confirmed"
              message="Your lounge visit at The Wing has been confirmed for 12 June 2026."
              actionLabel="View booking"
              isDark={isDark}
            />
            <AlertBanner
              variant="warning"
              title="Membership expiring"
              message="Your membership expires in 28 days. Renew now to avoid losing your benefits."
              actionLabel="Renew membership"
              isDismissible
              isDark={isDark}
            />
            <AlertBanner
              variant="error"
              title="Payment failed"
              message="We were unable to process your payment. Please update your card details."
              isDark={isDark}
            />
          </div>
        </Section>

        {/* ── 6. StatCard ───────────────────────────────────────────────────── */}
        <Section title="6 · StatCard" isDark={isDark}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              value="47"
              label="Total Visits"
              icon={<Calendar className="w-6 h-6" />}
              accent="gold"
              trend={{ direction: 'up', value: '+4', label: 'this month' }}
              isDark={isDark}
            />
            <StatCard
              value="5"
              label="Bookings Remaining"
              icon={<Wallet className="w-6 h-6" />}
              accent="green"
              ctaLabel="Buy more credits"
              isDark={isDark}
            />
            <StatCard
              value="HKD 12,500"
              label="Credit Balance"
              icon={<TrendingUp className="w-6 h-6" />}
              accent="blue"
              trend={{ direction: 'down', value: '-HKD 800', label: 'last booking' }}
              isDark={isDark}
            />
            <StatCard
              value="3"
              label="Vouchers Available"
              icon={<Ticket className="w-6 h-6" />}
              accent="purple"
              isDark={isDark}
            />
          </div>
        </Section>

        {/* ── 7. ModalShell ─────────────────────────────────────────────────── */}
        <Section title="7 · ModalShell" isDark={isDark}>
          <GlassButton
            label="Open Modal"
            variant="primary"
            onClick={openModal}
            isDark={isDark}
          />
          <ModalShell
            isOpen={modalOpen}
            title="Cancel Booking"
            subtitle="This action cannot be undone"
            titleIcon={<Star />}
            onClose={closeModal}
            isDark={isDark}
            size="sm"
            footer={
              <div className="flex gap-3 justify-end">
                <GlassButton
                  label="Keep Booking"
                  variant="secondary"
                  size="sm"
                  onClick={closeModal}
                  isDark={isDark}
                />
                <GlassButton
                  label="Cancel Booking"
                  variant="danger"
                  size="sm"
                  onClick={closeModal}
                  isDark={isDark}
                />
              </div>
            }
          >
            <AlertBanner
              variant="warning"
              message="Are you sure you want to cancel booking D-20260112-84721? Cancellation fees may apply."
              isDark={isDark}
            />
          </ModalShell>
        </Section>

        {/* ── 8. SidebarNavItem ─────────────────────────────────────────────── */}
        <Section title="8 · SidebarNavItem" isDark={isDark}>
          <div
            className="w-64 rounded-2xl p-3 space-y-1"
            style={{
              background: p.glassBackground,
              border: `1px solid ${p.glassBorder}`,
            }}
          >
            {NAV_ITEMS.map((item) => (
              <SidebarNavItem
                key={item.id}
                id={item.id}
                label={item.label}
                icon={item.icon}
                badge={item.badge}
                isActive={activeNav === item.id}
                onClick={handleNavClick}
                isDark={isDark}
              />
            ))}
          </div>
        </Section>

        {/* ── 9. BookingCard ────────────────────────────────────────────────── */}
        <Section title="9 · BookingCard" isDark={isDark}>
          <div className="space-y-4">
            <BookingCard
              bookingRef="D-20260112-84721"
              lounge="The Wing First Class Lounge"
              terminal="Terminal 1"
              date="2026-06-12"
              time="14:30"
              duration="3 hours"
              flight="CX 888 to London Heathrow"
              flightType="Departure"
              guests={1}
              status="confirmed"
              amenities={['Shower', 'Private Dining', 'Meeting Room', 'Spa', 'Bar']}
              totalAmount={2700}
              isDark={isDark}
            />
            <BookingCard
              bookingRef="D-20260120-63195"
              lounge="The Pier Business Class Lounge"
              terminal="Terminal 1"
              date="2026-01-20"
              time="10:15"
              flight="CX 250 to Tokyo"
              guests={0}
              status="pending"
              isDark={isDark}
            />
            <BookingCard
              bookingRef="D-20251015-11023"
              lounge="The Cabin"
              terminal="Terminal 1"
              date="2025-10-15"
              time="08:00"
              flight="CX 543 to Singapore"
              guests={2}
              status="completed"
              totalAmount={1200}
              isDark={isDark}
            />
          </div>
        </Section>

        {/* ── 10. MemberProfileCard ─────────────────────────────────────────── */}
        <Section title="10 · MemberProfileCard" isDark={isDark}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <MemberProfileCard
              name="Sarah Chen"
              memberId="M000325"
              memberType="Individual"
              email="sarah.chen@example.com"
              membershipTier="Platinum"
              bookingsRemaining={5}
              voucherCount={3}
              expiryDate="2026-12-31"
              membershipStatus="active"
              isDark={isDark}
            />
            <MemberProfileCard
              name="James Wong"
              memberId="CORP-00847"
              memberType="Corporate"
              companyName="Cathay Pacific"
              bookingsRemaining={12}
              expiryDate="2026-06-30"
              membershipStatus="expiring"
              isDark={isDark}
            />
            <MemberProfileCard
              name="Grand Tours HK"
              memberId="TA-00182"
              memberType="Travel Agency"
              creditBalance={15000}
              voucherCount={0}
              expiryDate="2025-12-31"
              membershipStatus="expired"
              isDark={isDark}
            />
          </div>
        </Section>

        {/* ── 11. VoucherCard ───────────────────────────────────────────────── */}
        <Section title="11 · VoucherCard" isDark={isDark}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <VoucherCard
              code="HKIA-WING-A7B2"
              voucherType="booking"
              status="available"
              lounge="The Wing First Class"
              validFrom="2026-01-01"
              validUntil="2026-12-31"
              showPrivilegeNote
              isCopied={copied}
              onCopy={handleCopy}
              isDark={isDark}
            />
            <VoucherCard
              code="HKIA-SUIT-Z9X3"
              voucherType="premiere-suite"
              status="available"
              isForSpouse
              showPrivilegeNote
              validUntil="2026-12-31"
              isDark={isDark}
            />
            <VoucherCard
              code="HKIA-WING-K4M8"
              voucherType="booking"
              status="used"
              usedBy="James Wong"
              usedDate="2026-02-14"
              isDark={isDark}
            />
          </div>
        </Section>
      </div>
    </div>
  );
}
