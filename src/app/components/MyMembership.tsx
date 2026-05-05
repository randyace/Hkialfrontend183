import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  BadgeCheck, Star, Medal, Sparkles, Calendar, Clock,
  ChevronRight, Check, Shield, Wallet, Zap, Gift, ArrowUpCircle,
  FileText, Download, AlertTriangle, CheckCircle, XCircle, CreditCard,
  Plus, X, Layers, ArrowRight, Lock, Hourglass,
} from 'lucide-react';
import { useTheme } from './ThemeContext';

// ── Interfaces ─────────────────────────────────────────────────────────────────
interface MyMembershipProps {
  memberData: {
    name: string;
    memberType: string;
    companyName?: string;
    bookingsRemaining?: number;
    totalBookings?: number;
    voucherCount?: number;
    email?: string;
    membershipExpiryDate?: string;
    membershipStartDate?: string;
  };
  setActiveTab?: (tab: string) => void;
  onAdjournPurchase: (addedVisits: number, addedCredit: number, addedVouchers: number) => void;
}

interface AdjournablePackage {
  id: string;
  name: string;
  tierLevel: number;
  memberType: string;
  Icon: React.ElementType;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  price: number;
  visitsIncluded: number;
  creditIncluded: number;
  vouchersIncluded: number;      // ALL vouchers (regular + upgrade-to-suite), all usable immediately
  upgradeSuiteCount: number;     // how many of the above are "Upgrade to Suite" type
  tagline: string;
  highlights: string[];
}

interface QueuedMembership {
  packageId: string;
  name: string;
  tierLevel: number;
  memberType: string;
  Icon: React.ElementType;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  price: number;
  visitsIncluded: number;
  creditIncluded: number;
  vouchersIncluded: number;
  upgradeSuiteCount: number;
  activatesOn: string;
  expiresOn: string;
  purchasedOn: string;
  orderRef: string;
  isUpgrade: boolean;
}

interface Invoice {
  ref: string;
  date: string;
  amount: number;
  status: string;
  desc: string;
}

// ── Tier level map ──────────────────────────────────────────────────────────────
const TIER_LEVEL_MAP: Record<string, number> = {
  Individual: 0,
  Corporate: 1,
  'Travel Agency': 2,
};

// ── Services that are LOCKED until new package activates (only for upgrades) ──
// Key: "fromTier-toTier", value: array of locked service descriptions
const LOCKED_UPGRADE_SERVICES: Record<string, string[]> = {
  '0-1': [
    'Up to 5 guests per visit (currently 1 guest)',
    'Group booking management',
    'Corporate billing & invoicing',
    'Dedicated account manager',
    'Monthly usage reports',
  ],
  '0-2': [
    'Unlimited guest bookings (currently 1 guest)',
    'Group & bulk booking tools',
    'Agency billing & invoicing',
    'Dedicated account manager',
    'Client management dashboard',
    'Commission rebate programme',
    'API access for booking integration',
  ],
  '1-2': [
    'Unlimited guest bookings (currently up to 5)',
    'Agency billing & invoicing',
    'Client management dashboard',
    'Commission rebate programme',
    'API access for booking integration',
  ],
};

// ── Current tier config ─────────────────────────────────────────────────────────
const TIER_CONFIG: Record<string, {
  tier: string;
  Icon: React.ElementType;
  color: string;
  gradientFrom: string;
  gradientTo: string;
  price: number;
  tagline: string;
  features: string[];
  membershipNumber: string;
}> = {
  Individual: {
    tier: 'Silver',
    Icon: Medal,
    color: '#9ca3af',
    gradientFrom: '#9ca3af',
    gradientTo: '#6b7280',
    price: 1800,
    tagline: 'Perfect for frequent solo travellers',
    features: [
      'Up to 10 lounge visits per year',
      '1 complimentary guest per visit',
      'Priority check-in access',
      'Complimentary refreshments & Wi-Fi',
      'Shower & rest facilities',
      '3 booking vouchers upon joining (account holder & spouse only)',
      'Digital membership card',
      '24/7 member support',
    ],
    membershipNumber: 'HKIAL-SLV-2847',
  },
  Corporate: {
    tier: 'Gold',
    Icon: Star,
    color: 'rgb(220,181,21)',
    gradientFrom: 'rgb(220,181,21)',
    gradientTo: 'rgb(160,128,8)',
    price: 8800,
    tagline: 'Designed for business teams',
    features: [
      'Up to 10 lounge visits per year',
      'Up to 5 guests per visit',
      'Priority check-in for all members',
      'Complimentary refreshments & Wi-Fi',
      'Shower & rest facilities',
      '6 booking + 2 Premiere Suite upgrade vouchers (account holder & spouse only)',
      'Group booking management',
      'Corporate billing & invoicing',
      'Dedicated account manager',
      'Monthly usage reports',
      'Digital membership cards for team',
    ],
    membershipNumber: 'HKIAL-GLD-2847',
  },
  'Travel Agency': {
    tier: 'Platinum',
    Icon: Sparkles,
    color: '#a78bfa',
    gradientFrom: '#a78bfa',
    gradientTo: '#7c3aed',
    price: 12800,
    tagline: 'Built for travel professionals',
    features: [
      'HKD 7,000 lounge booking credit',
      'Unlimited guest bookings',
      'Priority access for all clients',
      'Complimentary refreshments & Wi-Fi',
      'Shower & rest facilities',
      '3 booking + 2 Premiere Suite upgrade vouchers (account holder & spouse only)',
      'Group & bulk booking tools',
      'Agency billing & invoicing',
      'Dedicated account manager',
      'Client management dashboard',
      'Commission rebate programme',
      'API access for booking integration',
    ],
    membershipNumber: 'HKIAL-PLT-2847',
  },
};

// ── Packages available for adjourning ──────────────────────────────────────────
const ADJOURN_PACKAGES: AdjournablePackage[] = [
  {
    id: 'silver',
    name: 'Silver',
    tierLevel: 0,
    memberType: 'Individual',
    Icon: Medal,
    color: '#9ca3af',
    gradientFrom: '#9ca3af',
    gradientTo: '#6b7280',
    price: 1800,
    visitsIncluded: 10,
    creditIncluded: 0,
    vouchersIncluded: 3,
    upgradeSuiteCount: 0,
    tagline: 'Perfect for frequent solo travellers',
    highlights: ['10 lounge visits', '3 vouchers', '1 guest per visit'],
  },
  {
    id: 'gold',
    name: 'Gold',
    tierLevel: 1,
    memberType: 'Corporate',
    Icon: Star,
    color: 'rgb(220,181,21)',
    gradientFrom: 'rgb(220,181,21)',
    gradientTo: 'rgb(160,128,8)',
    price: 8800,
    visitsIncluded: 10,
    creditIncluded: 0,
    vouchersIncluded: 8,
    upgradeSuiteCount: 2,
    tagline: 'Designed for business teams',
    highlights: ['10 lounge visits', '6 regular + 2 Upgrade to Suite vouchers', '5 guests per visit'],
  },
  {
    id: 'platinum',
    name: 'Platinum',
    tierLevel: 2,
    memberType: 'Travel Agency',
    Icon: Sparkles,
    color: '#a78bfa',
    gradientFrom: '#a78bfa',
    gradientTo: '#7c3aed',
    price: 12800,
    visitsIncluded: 0,
    creditIncluded: 7000,
    vouchersIncluded: 5,
    upgradeSuiteCount: 2,
    tagline: 'Built for travel professionals',
    highlights: ['HKD 7,000 booking credit', '3 regular + 2 Upgrade to Suite vouchers', 'Unlimited guests'],
  },
];

// ── Mock recent visits ──────────────────────────────────────────────────────────
const RECENT_VISITS = [
  { date: '2026-01-12', lounge: 'The Wing First Class', duration: '3h 20m', flight: 'CX888' },
  { date: '2025-12-28', lounge: 'The Pier Business Class', duration: '2h 45m', flight: 'CX505' },
  { date: '2025-12-15', lounge: 'The Cabin', duration: '1h 50m', flight: 'CX270' },
  { date: '2025-11-30', lounge: 'The Wing First Class', duration: '4h 10m', flight: 'CX251' },
];

// ── Helpers ────────────────────────────────────────────────────────────────────
function getMembershipStatus(expiryDate: string) {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysRemaining = Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (daysRemaining < 0) {
    return { status: 'expired' as const, label: 'Expired', daysText: `Expired ${Math.abs(daysRemaining)} days ago`, daysRemaining };
  }
  if (daysRemaining <= 30) {
    return { status: 'expiring' as const, label: 'Expiring Soon', daysText: `${daysRemaining} days remaining`, daysRemaining };
  }
  return { status: 'active' as const, label: 'Active', daysText: `${daysRemaining} days remaining`, daysRemaining };
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatMonthYear(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
}

function dayAfter(dateStr: string) {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
}

function addOneYear(dateStr: string) {
  const d = new Date(dateStr);
  d.setFullYear(d.getFullYear() + 1);
  return d.toISOString().split('T')[0];
}

// ── Main component ─────────────────────────────────────────────────────────────
export function MyMembership({ memberData, setActiveTab, onAdjournPurchase }: MyMembershipProps) {
  const { colors, mode } = useTheme();
  const isDark = mode === 'dark';

  // ── State ────────────────────────────────────────────────────────────────────
  const [queuedMembership, setQueuedMembership] = useState<QueuedMembership | null>(null);
  const [showAdjournModal, setShowAdjournModal] = useState(false);
  const [adjournStep, setAdjournStep] = useState<'select' | 'confirm' | 'success'>('select');
  const [selectedAdjournPkg, setSelectedAdjournPkg] = useState<AdjournablePackage | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([
    { ref: 'INV-20250315-001', date: '2025-03-15', amount: 8800, status: 'Paid', desc: 'Gold Membership — Year 2025/26' },
    { ref: 'INV-20240315-001', date: '2024-03-15', amount: 8800, status: 'Paid', desc: 'Gold Membership — Year 2024/25' },
  ]);

  // ── Derived values ───────────────────────────────────────────────────────────
  const tierCfg = TIER_CONFIG[memberData.memberType] || TIER_CONFIG['Individual'];
  const TierIcon = tierCfg.Icon;
  const expiryDate = memberData.membershipExpiryDate || '2026-12-31';
  const startDate = memberData.membershipStartDate || '2022-03-15';
  const memberStatus = getMembershipStatus(expiryDate);
  const isTA = memberData.memberType === 'Travel Agency';
  const currentTierLevel = TIER_LEVEL_MAP[memberData.memberType] || 0;

  // Base values from current package
  const baseBookingsRemaining = memberData.bookingsRemaining || 0;
  const bookingsTotal = memberData.totalBookings || 10;
  const bookingsUsed = bookingsTotal - baseBookingsRemaining;
  const baseVouchers = memberData.voucherCount || 0;

  // ── Immediately accumulated from queued package ──────────────────────────────
  // Visits and ALL vouchers are added to pool on purchase
  const addedVisits = (queuedMembership && !isTA) ? queuedMembership.visitsIncluded : 0;
  const addedCredit = (queuedMembership && isTA) ? queuedMembership.creditIncluded : 0;
  const addedVouchers = queuedMembership ? queuedMembership.vouchersIncluded : 0;

  const totalVisitsNow = baseBookingsRemaining + addedVisits;
  const totalCreditNow = baseBookingsRemaining + addedCredit;
  const totalVouchersNow = baseVouchers + addedVouchers;

  // Upgrade to Suite vouchers in the total pool
  const baseUpgradeSuite = 2; // All member types receive suite upgrade vouchers
  const addedUpgradeSuite = queuedMembership ? queuedMembership.upgradeSuiteCount : 0;
  const totalUpgradeSuiteNow = baseUpgradeSuite + addedUpgradeSuite;
  const totalRegularNow = totalVouchersNow - totalUpgradeSuiteNow;

  // Locked services (only relevant when upgrading to a higher tier)
  const lockedServiceKey = queuedMembership ? `${currentTierLevel}-${queuedMembership.tierLevel}` : '';
  const lockedServices = (queuedMembership && queuedMembership.isUpgrade)
    ? (LOCKED_UPGRADE_SERVICES[lockedServiceKey] || [])
    : [];

  // Packages selectable (current tier or higher)
  const availableAdjournPkgs = ADJOURN_PACKAGES.filter(p => p.tierLevel >= currentTierLevel);

  // Preview for modal
  const previewVisitTotal = selectedAdjournPkg && !isTA ? baseBookingsRemaining + selectedAdjournPkg.visitsIncluded : baseBookingsRemaining;
  const previewCreditTotal = selectedAdjournPkg && isTA ? baseBookingsRemaining + selectedAdjournPkg.creditIncluded : baseBookingsRemaining;
  const previewVoucherTotal = selectedAdjournPkg ? baseVouchers + selectedAdjournPkg.vouchersIncluded : baseVouchers;
  const previewLockedKey = selectedAdjournPkg ? `${currentTierLevel}-${selectedAdjournPkg.tierLevel}` : '';
  const previewLockedServices = (selectedAdjournPkg && selectedAdjournPkg.tierLevel > currentTierLevel)
    ? (LOCKED_UPGRADE_SERVICES[previewLockedKey] || [])
    : [];

  // ── Pre-computed styles ──────────────────────────────────────────────────────
  const pageText = isDark ? '#ffffff' : 'rgb(64,63,52)';
  const subText = isDark ? 'rgba(255,255,255,0.55)' : 'rgb(130,129,118)';
  const cardBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.85)';
  const cardBorder = isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(200,199,190,0.5)';
  const rowBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(231,230,221,0.4)';
  const rowBorder = isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(200,199,190,0.35)';
  const modalBg = isDark ? 'rgba(10,25,41,0.97)' : 'rgba(255,255,255,0.98)';
  const modalBorder = isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(200,199,190,0.5)';
  const goldAccentBg = isDark ? 'rgba(220,181,21,0.08)' : 'rgba(220,181,21,0.06)';
  const goldAccentBorder = '1px solid rgba(220,181,21,0.28)';
  const greenAccentBg = isDark ? 'rgba(52,199,89,0.07)' : 'rgba(52,199,89,0.05)';
  const greenAccentBorder = '1px solid rgba(52,199,89,0.2)';
  const lockedBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(200,199,190,0.18)';
  const lockedBorder = isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(200,199,190,0.3)';

  const progressBarColor = bookingsUsed / bookingsTotal >= 0.8
    ? 'rgb(239,68,68)'
    : bookingsUsed / bookingsTotal >= 0.6
    ? 'rgb(251,191,36)'
    : tierCfg.color;

  const statusColors = {
    active:   { bg: 'rgba(52,199,89,0.12)',  border: 'rgba(52,199,89,0.35)',  text: 'rgb(52,199,89)' },
    expiring: { bg: 'rgba(251,191,36,0.12)', border: 'rgba(251,191,36,0.4)',  text: 'rgb(220,181,21)' },
    expired:  { bg: 'rgba(239,68,68,0.12)',  border: 'rgba(239,68,68,0.35)',  text: 'rgb(239,68,68)' },
  };
  const sc = statusColors[memberStatus.status];

  const adjournBtnStyle = queuedMembership
    ? { background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(200,199,190,0.35)', color: subText, cursor: 'not-allowed' as const }
    : { background: 'linear-gradient(135deg, rgb(220,181,21), rgb(160,128,8))', color: '#fff' };

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleOpenAdjourn = () => {
    if (queuedMembership) return;
    setAdjournStep('select');
    setSelectedAdjournPkg(null);
    setShowAdjournModal(true);
  };

  const handleCloseAdjourn = () => {
    setShowAdjournModal(false);
    setSelectedAdjournPkg(null);
    setAdjournStep('select');
  };

  const handleSelectPkg = (pkg: AdjournablePackage) => {
    setSelectedAdjournPkg(pkg);
  };

  const handleProceedConfirm = () => {
    if (!selectedAdjournPkg) return;
    setAdjournStep('confirm');
  };

  const handleBackToSelect = () => {
    setAdjournStep('select');
  };

  const handleConfirmAdjourn = () => {
    if (!selectedAdjournPkg) return;
    const activatesOn = dayAfter(expiryDate);
    const expiresOn = addOneYear(activatesOn);
    const orderRef = 'ADJ-' + Date.now().toString().slice(-8);

    const newQueued: QueuedMembership = {
      packageId: selectedAdjournPkg.id,
      name: selectedAdjournPkg.name,
      tierLevel: selectedAdjournPkg.tierLevel,
      memberType: selectedAdjournPkg.memberType,
      Icon: selectedAdjournPkg.Icon,
      color: selectedAdjournPkg.color,
      gradientFrom: selectedAdjournPkg.gradientFrom,
      gradientTo: selectedAdjournPkg.gradientTo,
      price: selectedAdjournPkg.price,
      visitsIncluded: selectedAdjournPkg.visitsIncluded,
      creditIncluded: selectedAdjournPkg.creditIncluded,
      vouchersIncluded: selectedAdjournPkg.vouchersIncluded,
      upgradeSuiteCount: selectedAdjournPkg.upgradeSuiteCount,
      activatesOn,
      expiresOn,
      purchasedOn: new Date().toISOString().split('T')[0],
      orderRef,
      isUpgrade: selectedAdjournPkg.tierLevel > currentTierLevel,
    };

    const newInvoice: Invoice = {
      ref: orderRef,
      date: new Date().toISOString().split('T')[0],
      amount: selectedAdjournPkg.price,
      status: 'Paid',
      desc: `${selectedAdjournPkg.name} Membership — Adjourned (starts ${formatMonthYear(activatesOn)})`,
    };

    setQueuedMembership(newQueued);
    setInvoices(prev => [newInvoice, ...prev]);
    // Notify parent to update memberData so sidebar reflects the new totals
    onAdjournPurchase(
      selectedAdjournPkg.visitsIncluded,
      selectedAdjournPkg.creditIncluded,
      selectedAdjournPkg.vouchersIncluded,
    );
    setAdjournStep('success');
  };

  const handleCancelQueued = () => {
    if (!queuedMembership) return;
    // Reverse the pool additions in parent state
    onAdjournPurchase(
      -queuedMembership.visitsIncluded,
      -queuedMembership.creditIncluded,
      -queuedMembership.vouchersIncluded,
    );
    setQueuedMembership(null);
  };

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-8">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start gap-4">
        <div>
          <h1 className="text-3xl bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)] bg-clip-text text-transparent">
            My Membership
          </h1>
          <p className="mt-1" style={{ color: subText }}>
            Manage your current plan, adjourn your next period, and track your visit pool.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleOpenAdjourn}
            disabled={!!queuedMembership}
            className="px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm transition-all hover:opacity-90 disabled:hover:opacity-100"
            style={adjournBtnStyle}
            title={queuedMembership ? 'You already have a package adjourned for the next period.' : 'Pre-purchase your next membership period'}
          >
            <Layers className="w-4 h-4" />
            {queuedMembership ? 'Next Period Adjourned' : 'Extend Membership'}
          </button>
          <button
            onClick={() => setActiveTab('membership-packages')}
            className="px-5 py-2.5 rounded-xl flex items-center gap-2 text-sm transition-all"
            style={{ background: cardBg, border: cardBorder, color: pageText }}
          >
            <ArrowUpCircle className="w-4 h-4" style={{ color: tierCfg.color }} />
            View All Plans
          </button>
        </div>
      </div>

      {/* ── Adjourned package banner ───────────────────────────────────────── */}
      {queuedMembership && (
        <div className="rounded-2xl p-5" style={{ background: goldAccentBg, border: goldAccentBorder }}>
          <div className="flex items-start gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: `linear-gradient(135deg, ${queuedMembership.gradientFrom}, ${queuedMembership.gradientTo})` }}
            >
              <queuedMembership.Icon className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm mb-1" style={{ color: 'rgb(220,181,21)' }}>
                {queuedMembership.isUpgrade ? 'Upgrade' : 'Renewal'} adjourned — {queuedMembership.name} starts {formatDate(queuedMembership.activatesOn)}
              </p>
              <p className="text-xs mb-4" style={{ color: subText }}>
                Your current {tierCfg.tier} expiry <strong style={{ color: pageText }}>{formatDate(expiryDate)}</strong> is unchanged.
                Visits and vouchers from the new package are <strong style={{ color: 'rgb(52,199,89)' }}>available right now</strong>.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Visits / Credit — immediately usable */}
                {!isTA && (
                  <div className="rounded-xl p-3" style={{ background: greenAccentBg, border: greenAccentBorder }}>
                    <p className="text-xs mb-1.5" style={{ color: 'rgb(52,199,89)' }}>Visits Pool (now)</p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-sm" style={{ color: pageText }}>{baseBookingsRemaining}</span>
                      <Plus className="w-3 h-3" style={{ color: 'rgb(220,181,21)' }} />
                      <span className="text-sm" style={{ color: queuedMembership.color }}>{queuedMembership.visitsIncluded}</span>
                      <span className="text-xs" style={{ color: subText }}>=</span>
                      <span className="text-sm" style={{ color: 'rgb(52,199,89)' }}>{totalVisitsNow} total</span>
                    </div>
                  </div>
                )}
                {isTA && (
                  <div className="rounded-xl p-3" style={{ background: greenAccentBg, border: greenAccentBorder }}>
                    <p className="text-xs mb-1.5" style={{ color: 'rgb(52,199,89)' }}>Credit Pool (now)</p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs" style={{ color: pageText }}>HKD {baseBookingsRemaining.toLocaleString()}</span>
                      <Plus className="w-3 h-3" style={{ color: 'rgb(220,181,21)' }} />
                      <span className="text-xs" style={{ color: queuedMembership.color }}>HKD {queuedMembership.creditIncluded.toLocaleString()}</span>
                      <span className="text-xs" style={{ color: subText }}>=</span>
                      <span className="text-xs" style={{ color: 'rgb(52,199,89)' }}>HKD {totalCreditNow.toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {/* Vouchers — immediately usable */}
                <div className="rounded-xl p-3" style={{ background: greenAccentBg, border: greenAccentBorder }}>
                  <p className="text-xs mb-1.5" style={{ color: 'rgb(52,199,89)' }}>Vouchers Pool (now)</p>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm" style={{ color: pageText }}>{baseVouchers}</span>
                    <Plus className="w-3 h-3" style={{ color: 'rgb(220,181,21)' }} />
                    <span className="text-sm" style={{ color: queuedMembership.color }}>{queuedMembership.vouchersIncluded}</span>
                    <span className="text-xs" style={{ color: subText }}>=</span>
                    <span className="text-sm" style={{ color: 'rgb(52,199,89)' }}>{totalVouchersNow} total</span>
                  </div>
                  {queuedMembership.upgradeSuiteCount > 0 && (
                    <p className="text-xs mt-1" style={{ color: subText }}>
                      incl. {queuedMembership.upgradeSuiteCount} Upgrade to Suite
                    </p>
                  )}
                </div>

                {/* Locked higher-tier services (upgrade only) */}
                {lockedServices.length > 0 && (
                  <div className="rounded-xl p-3" style={{ background: lockedBg, border: lockedBorder }}>
                    <div className="flex items-center gap-1.5 mb-2">
                      <Hourglass className="w-3.5 h-3.5" style={{ color: subText }} />
                      <p className="text-xs" style={{ color: subText }}>Service perks unlock {formatMonthYear(queuedMembership.activatesOn)}</p>
                    </div>
                    <div className="space-y-1">
                      {lockedServices.slice(0, 3).map((s, i) => (
                        <div key={i} className="flex items-center gap-1.5">
                          <Lock className="w-3 h-3 flex-shrink-0" style={{ color: subText }} />
                          <span className="text-xs" style={{ color: subText }}>{s}</span>
                        </div>
                      ))}
                      {lockedServices.length > 3 && (
                        <p className="text-xs" style={{ color: subText }}>+{lockedServices.length - 3} more…</p>
                      )}
                    </div>
                  </div>
                )}

                {/* No locked services = same tier renewal */}
                {!queuedMembership.isUpgrade && (
                  <div className="rounded-xl p-3" style={{ background: lockedBg, border: lockedBorder }}>
                    <p className="text-xs mb-1" style={{ color: subText }}>Service level</p>
                    <p className="text-xs" style={{ color: pageText }}>No change — same {queuedMembership.name} tier</p>
                    <p className="text-xs mt-1" style={{ color: subText }}>All existing benefits continue uninterrupted</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Membership cards ───────────────────────────────────────────────── */}
      <div className={queuedMembership ? 'grid grid-cols-1 lg:grid-cols-2 gap-5' : ''}>

        {/* Active card */}
        <div
          className="relative rounded-3xl overflow-hidden p-7 flex flex-col justify-between min-h-[200px]"
          style={{
            background: `linear-gradient(135deg, ${tierCfg.gradientFrom} 0%, ${tierCfg.gradientTo} 55%, rgba(10,25,41,0.85) 100%)`,
            boxShadow: '0 20px 60px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.12)',
          }}
        >
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-20" style={{ background: 'rgba(255,255,255,0.3)' }} />
          <div className="absolute -bottom-12 -left-6 w-40 h-40 rounded-full opacity-10" style={{ background: 'rgba(255,255,255,0.4)' }} />
          <div className="relative flex items-start justify-between">
            <div>
              <p className="text-white/60 text-xs tracking-widest uppercase mb-1">HKIA Lounge · Active</p>
              <p className="text-white text-xl">{tierCfg.tier} Membership</p>
              {memberData.companyName && <p className="text-white/70 text-sm mt-0.5">{memberData.companyName}</p>}
            </div>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-white/20 backdrop-blur-sm">
              <TierIcon className="w-7 h-7 text-white" />
            </div>
          </div>
          <div className="relative flex items-end justify-between mt-5">
            <div>
              <p className="text-white/60 text-xs mb-0.5">Member</p>
              <p className="text-white text-sm">{memberData.name}</p>
              <p className="text-white/60 text-xs mt-1.5 font-mono tracking-wider">{tierCfg.membershipNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-white/60 text-xs mb-0.5">Valid Until</p>
              <p className="text-white text-sm">{new Date(expiryDate).toLocaleDateString('en-GB', { month: '2-digit', year: 'numeric' })}</p>
              <div
                className="mt-1.5 px-2.5 py-0.5 rounded-full text-xs inline-flex items-center gap-1"
                style={{ background: sc.bg, border: `1px solid ${sc.border}`, color: sc.text }}
              >
                {memberStatus.status === 'active' && <CheckCircle className="w-3 h-3" />}
                {memberStatus.status === 'expiring' && <AlertTriangle className="w-3 h-3" />}
                {memberStatus.status === 'expired' && <XCircle className="w-3 h-3" />}
                {memberStatus.label}
              </div>
            </div>
          </div>
        </div>

        {/* Queued card */}
        {queuedMembership && (
          <div
            className="relative rounded-3xl overflow-hidden p-7 flex flex-col justify-between min-h-[200px]"
            style={{
              background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(231,230,221,0.35)',
              border: `2px dashed ${queuedMembership.color}55`,
            }}
          >
            <div
              className="absolute top-4 right-4 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs"
              style={{
                background: queuedMembership.isUpgrade ? 'rgba(139,92,246,0.15)' : goldAccentBg,
                border: queuedMembership.isUpgrade ? '1px solid rgba(139,92,246,0.4)' : goldAccentBorder,
                color: queuedMembership.isUpgrade ? '#a78bfa' : 'rgb(220,181,21)',
              }}
            >
              <Clock className="w-3 h-3" />
              {queuedMembership.isUpgrade ? 'Upgrade Queued' : 'Renewal Queued'}
            </div>

            <div className="flex items-start gap-3 mt-1">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                style={{ background: `linear-gradient(135deg, ${queuedMembership.gradientFrom}, ${queuedMembership.gradientTo})` }}
              >
                <queuedMembership.Icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-xs mb-0.5" style={{ color: subText }}>HKIA Lounge · Next Period</p>
                <p className="text-base" style={{ color: pageText }}>{queuedMembership.name} Membership</p>
                <p className="text-xs mt-0.5 font-mono" style={{ color: subText }}>{queuedMembership.orderRef}</p>
              </div>
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: subText }}>Activates</span>
                <span className="text-xs" style={{ color: pageText }}>{formatDate(queuedMembership.activatesOn)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: subText }}>Expires</span>
                <span className="text-xs" style={{ color: pageText }}>{formatDate(queuedMembership.expiresOn)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-xs" style={{ color: subText }}>Visits & vouchers</span>
                <span className="text-xs" style={{ color: 'rgb(52,199,89)' }}>Added to pool now</span>
              </div>
              {lockedServices.length > 0 && (
                <div className="flex justify-between">
                  <span className="text-xs" style={{ color: subText }}>Service upgrade</span>
                  <span className="text-xs" style={{ color: subText }}>Unlocks {formatMonthYear(queuedMembership.activatesOn)}</span>
                </div>
              )}
              <button
                onClick={handleCancelQueued}
                className="mt-1 text-xs flex items-center gap-1 hover:opacity-75 transition-opacity"
                style={{ color: 'rgb(239,68,68)' }}
              >
                <X className="w-3 h-3" /> Cancel adjourned package
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Key stats ─────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: 'Member Since',
            value: new Date(startDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
            icon: Calendar,
            iconColor: '#818cf8',
            sub: null as string | null,
          },
          {
            label: 'Current Expiry',
            value: new Date(expiryDate).toLocaleDateString('en-GB', { month: 'short', year: 'numeric' }),
            icon: Clock,
            iconColor: sc.text,
            sub: queuedMembership ? `Next: ${formatMonthYear(queuedMembership.expiresOn)}` : null,
          },
          {
            label: isTA ? 'Booking Credit' : 'Visits Available',
            value: isTA ? `HKD ${totalCreditNow.toLocaleString()}` : String(totalVisitsNow),
            icon: Wallet,
            iconColor: 'rgb(220,181,21)',
            sub: queuedMembership && !isTA
              ? `${baseBookingsRemaining} current + ${queuedMembership.visitsIncluded} adjourned`
              : queuedMembership && isTA
              ? `${baseBookingsRemaining.toLocaleString()} + ${queuedMembership.creditIncluded.toLocaleString()} adjourned`
              : null,
          },
          {
            label: 'Vouchers Available',
            value: String(totalVouchersNow),
            icon: Gift,
            iconColor: '#34d399',
            sub: queuedMembership
              ? `${baseVouchers} current + ${queuedMembership.vouchersIncluded} adjourned`
              : totalUpgradeSuiteNow > 0
              ? `Incl. ${totalUpgradeSuiteNow} Upgrade to Suite`
              : null,
          },
        ].map(({ label, value, icon: Icon, iconColor, sub }) => (
          <div key={label} className="rounded-2xl p-4 flex items-center gap-3" style={{ background: cardBg, border: cardBorder }}>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(231,230,221,0.6)' }}
            >
              <Icon className="w-5 h-5" style={{ color: iconColor }} />
            </div>
            <div className="min-w-0">
              <p className="text-xs truncate" style={{ color: subText }}>{label}</p>
              <p className="text-sm" style={{ color: pageText }}>{value}</p>
              {sub && <p className="text-xs mt-0.5 leading-tight" style={{ color: subText }}>{sub}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* ── Main content ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Usage tracker */}
        <div className="rounded-2xl p-6" style={{ background: cardBg, border: cardBorder }}>
          <div className="flex items-center gap-2 mb-5">
            <Zap className="w-5 h-5" style={{ color: tierCfg.color }} />
            <h2 className="text-base" style={{ color: pageText }}>Usage &amp; Pool</h2>
          </div>

          {/* Visits */}
          {!isTA && (
            <div className="mb-5">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm" style={{ color: subText }}>Lounge Visits Available</span>
                <span className="text-sm" style={{ color: pageText }}>
                  {totalVisitsNow}
                  {addedVisits > 0 && <span style={{ color: subText }}> ({baseBookingsRemaining} + {addedVisits})</span>}
                </span>
              </div>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs" style={{ color: subText }}>Used this period</span>
                <span className="text-xs" style={{ color: subText }}>{bookingsUsed} of {bookingsTotal}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: rowBg }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.min(100, (bookingsUsed / bookingsTotal) * 100)}%`, background: progressBarColor }}
                />
              </div>
              {addedVisits > 0 && (
                <div className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: greenAccentBg, border: greenAccentBorder }}>
                  <Plus className="w-3 h-3" style={{ color: 'rgb(52,199,89)' }} />
                  <p className="text-xs" style={{ color: 'rgb(52,199,89)' }}>
                    +{addedVisits} visits from adjourned {queuedMembership?.name} package — usable now
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Credit for TA */}
          {isTA && (
            <div className="mb-5">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm" style={{ color: subText }}>Booking Credit Available</span>
                <span className="text-sm" style={{ color: pageText }}>HKD {totalCreditNow.toLocaleString()}</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: rowBg }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.min(100, (baseBookingsRemaining / 7000) * 100)}%`, background: tierCfg.color }}
                />
              </div>
              {addedCredit > 0 && (
                <div className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-lg" style={{ background: greenAccentBg, border: greenAccentBorder }}>
                  <Plus className="w-3 h-3" style={{ color: 'rgb(52,199,89)' }} />
                  <p className="text-xs" style={{ color: 'rgb(52,199,89)' }}>
                    +HKD {addedCredit.toLocaleString()} from adjourned {queuedMembership?.name} package — usable now
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Vouchers */}
          <div className="mb-5">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm" style={{ color: subText }}>Vouchers Available</span>
              <span className="text-sm" style={{ color: pageText }}>{totalVouchersNow} total</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg mb-3" style={{ background: isDark ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.22)' }}>
              <span className="text-xs" style={{ color: '#60a5fa' }}>Account holder &amp; registered spouse use only — not transferable to guests or nominees.</span>
            </div>

            {/* Regular vouchers row */}
            <div className="mb-3">
              <p className="text-xs mb-1.5" style={{ color: subText }}>Regular — {totalRegularNow} available</p>
              <div className="flex gap-1.5 flex-wrap">
                {Array.from({ length: Math.max(totalRegularNow, 4) }).map((_, i) => {
                  const isCurrentPkg = i < (baseVouchers - baseUpgradeSuite);
                  const isFromQueued = !isCurrentPkg && i < totalRegularNow;
                  const isEmpty = i >= totalRegularNow;
                  const vBg = isCurrentPkg
                    ? `linear-gradient(135deg, ${tierCfg.gradientFrom}, ${tierCfg.gradientTo})`
                    : isFromQueued && queuedMembership
                    ? `linear-gradient(135deg, ${queuedMembership.gradientFrom}, ${queuedMembership.gradientTo})`
                    : rowBg;
                  const vBorder = isEmpty ? rowBorder : 'none';
                  const vIconColor = (isCurrentPkg || isFromQueued) ? '#fff' : subText;
                  return (
                    <div
                      key={i}
                      className="w-7 h-7 rounded-lg flex items-center justify-center"
                      style={{ background: vBg, border: vBorder }}
                      title={isFromQueued ? 'From adjourned package' : isCurrentPkg ? 'Current package' : 'Empty'}
                    >
                      <Gift className="w-3.5 h-3.5" style={{ color: vIconColor }} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Upgrade to Suite row */}
            {totalUpgradeSuiteNow > 0 && (
              <div className="rounded-xl p-3" style={{ background: greenAccentBg, border: greenAccentBorder }}>
                <p className="text-xs mb-1.5" style={{ color: 'rgb(52,199,89)' }}>
                  Upgrade to Suite — {totalUpgradeSuiteNow} available
                </p>
                <div className="flex gap-1.5 flex-wrap mb-1.5">
                  {Array.from({ length: totalUpgradeSuiteNow }).map((_, i) => {
                    const isBase = i < baseUpgradeSuite;
                    const vBg = isBase
                      ? `linear-gradient(135deg, ${tierCfg.gradientFrom}, ${tierCfg.gradientTo})`
                      : queuedMembership
                      ? `linear-gradient(135deg, ${queuedMembership.gradientFrom}, ${queuedMembership.gradientTo})`
                      : rowBg;
                    return (
                      <div
                        key={i}
                        className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ background: vBg }}
                        title={isBase ? 'Current package' : 'From adjourned package'}
                      >
                        <Star className="w-3.5 h-3.5 text-white" />
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs" style={{ color: subText }}>For account holder &amp; registered spouse only. Upgrade a booked lounge visit to a Premiere Suite experience.</p>
                {addedUpgradeSuite > 0 && (
                  <p className="text-xs mt-0.5" style={{ color: 'rgb(52,199,89)' }}>
                    +{addedUpgradeSuite} from adjourned {queuedMembership?.name} package
                  </p>
                )}
              </div>
            )}

            {addedVouchers > 0 && (
              <p className="text-xs mt-2" style={{ color: subText }}>
                <span style={{ color: tierCfg.color }}>■</span> Current package &nbsp;
                <span style={{ color: queuedMembership?.color }}>■</span> Adjourned package
              </p>
            )}
          </div>

          {/* Locked service perks notice */}
          {lockedServices.length > 0 && (
            <div className="rounded-xl p-4" style={{ background: lockedBg, border: lockedBorder }}>
              <div className="flex items-center gap-2 mb-2">
                <Hourglass className="w-4 h-4" style={{ color: subText }} />
                <p className="text-xs" style={{ color: subText }}>
                  {queuedMembership?.name} service perks unlock {formatDate(queuedMembership!.activatesOn)}
                </p>
              </div>
              <div className="space-y-1.5">
                {lockedServices.map((s, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <Lock className="w-3 h-3 flex-shrink-0" style={{ color: subText }} />
                    <span className="text-xs" style={{ color: subText }}>{s}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent visits */}
          <div className={lockedServices.length > 0 ? 'mt-5' : ''}>
            <p className="text-sm mb-3" style={{ color: subText }}>Recent Visits</p>
            <div className="space-y-2">
              {RECENT_VISITS.map((v, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between px-3 py-2.5 rounded-xl"
                  style={{ background: rowBg, border: rowBorder }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: tierCfg.color }} />
                    <div>
                      <p className="text-xs" style={{ color: pageText }}>{v.lounge}</p>
                      <p className="text-xs" style={{ color: subText }}>{formatDate(v.date)} · {v.flight}</p>
                    </div>
                  </div>
                  <span className="text-xs" style={{ color: subText }}>{v.duration}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Plan benefits */}
        <div className="rounded-2xl p-6" style={{ background: cardBg, border: cardBorder }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" style={{ color: tierCfg.color }} />
              <h2 className="text-base" style={{ color: pageText }}>{tierCfg.tier} Plan Benefits</h2>
            </div>
            <span
              className="text-xs px-2.5 py-1 rounded-full"
              style={{ background: goldAccentBg, border: goldAccentBorder, color: 'rgb(220,181,21)' }}
            >
              {memberData.memberType}
            </span>
          </div>
          <p className="text-xs mb-4" style={{ color: subText }}>{tierCfg.tagline}</p>
          <div className="space-y-2.5">
            {tierCfg.features.map((f, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div
                  className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: `linear-gradient(135deg, ${tierCfg.gradientFrom}, ${tierCfg.gradientTo})` }}
                >
                  <Check className="w-3 h-3 text-white" strokeWidth={3} />
                </div>
                <span className="text-sm" style={{ color: pageText }}>{f}</span>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl p-4 flex items-start gap-3" style={{ background: goldAccentBg, border: goldAccentBorder }}>
            <Layers className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'rgb(220,181,21)' }} />
            <div>
              <p className="text-xs" style={{ color: 'rgb(220,181,21)' }}>
                {queuedMembership ? 'Next period is secured!' : 'Lock in your next year early'}
              </p>
              <p className="text-xs mt-0.5" style={{ color: subText }}>
                {queuedMembership
                  ? `${queuedMembership.name} activates ${formatDate(queuedMembership.activatesOn)}. Visits and vouchers are already in your pool.`
                  : 'Adjourn your membership to pre-pay the next year. Visits and vouchers top up your pool immediately.'}
              </p>
              {!queuedMembership && (
                <button
                  onClick={handleOpenAdjourn}
                  className="mt-2 text-xs flex items-center gap-1 hover:opacity-80 transition-opacity"
                  style={{ color: 'rgb(220,181,21)' }}
                >
                  Adjourn now <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Details + Invoices ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Details */}
        <div className="rounded-2xl p-6" style={{ background: cardBg, border: cardBorder }}>
          <div className="flex items-center gap-2 mb-5">
            <BadgeCheck className="w-5 h-5" style={{ color: tierCfg.color }} />
            <h2 className="text-base" style={{ color: pageText }}>Membership Details</h2>
          </div>
          <div className="space-y-2.5">
            {[
              { label: 'Membership Number', value: tierCfg.membershipNumber },
              { label: 'Plan', value: `${tierCfg.tier} — ${memberData.memberType}` },
              { label: 'Member Name', value: memberData.name },
              { label: 'Email', value: memberData.email || '—' },
              ...(memberData.companyName ? [{ label: 'Company', value: memberData.companyName }] : []),
              { label: 'Start Date', value: formatDate(startDate) },
              { label: 'Expiry Date', value: formatDate(expiryDate) },
              { label: 'Annual Fee', value: `HKD ${tierCfg.price.toLocaleString()} / year` },
              { label: 'Status', value: memberStatus.label },
              ...(queuedMembership ? [{
                label: 'Next Period',
                value: `${queuedMembership.name} · ${formatMonthYear(queuedMembership.activatesOn)} – ${formatMonthYear(queuedMembership.expiresOn)}`,
              }] : []),
            ].map(({ label, value }) => {
              const isStatus = label === 'Status';
              const isNext = label === 'Next Period';
              const valueColor = isStatus ? sc.text : isNext ? 'rgb(220,181,21)' : pageText;
              return (
                <div
                  key={label}
                  className="flex items-center justify-between py-2.5 px-3 rounded-xl"
                  style={{ background: rowBg, border: rowBorder }}
                >
                  <span className="text-xs" style={{ color: subText }}>{label}</span>
                  <span className="text-xs" style={{ color: valueColor }}>{value}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-4">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs" style={{ color: subText }}>Current Period Progress</span>
              <span className="text-xs" style={{ color: subText }}>{memberStatus.daysText}</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: rowBg }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(0, Math.min(100, 100 - (memberStatus.daysRemaining / 365) * 100))}%`,
                  background: sc.text,
                }}
              />
            </div>
          </div>
        </div>

        {/* Invoices */}
        <div className="rounded-2xl p-6" style={{ background: cardBg, border: cardBorder }}>
          <div className="flex items-center gap-2 mb-5">
            <FileText className="w-5 h-5" style={{ color: tierCfg.color }} />
            <h2 className="text-base" style={{ color: pageText }}>Invoice History</h2>
          </div>
          <div className="space-y-3">
            {invoices.map((inv) => {
              const isAdjourn = inv.ref.startsWith('ADJ-');
              const invBadgeBg = isAdjourn ? goldAccentBg : 'rgba(52,199,89,0.1)';
              const invBadgeBorder = isAdjourn ? goldAccentBorder : '1px solid rgba(52,199,89,0.3)';
              const invBadgeColor = isAdjourn ? 'rgb(220,181,21)' : 'rgb(52,199,89)';
              return (
                <div key={inv.ref} className="rounded-xl p-4" style={{ background: rowBg, border: rowBorder }}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <p className="text-xs" style={{ color: pageText }}>{inv.desc}</p>
                        {isAdjourn && (
                          <span
                            className="text-xs px-2 py-0.5 rounded-full flex-shrink-0"
                            style={{ background: 'rgba(139,92,246,0.1)', border: '1px solid rgba(139,92,246,0.3)', color: '#a78bfa' }}
                          >
                            Adjourned
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-mono" style={{ color: subText }}>{inv.ref}</p>
                      <p className="text-xs mt-0.5" style={{ color: subText }}>{formatDate(inv.date)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm" style={{ color: 'rgb(220,181,21)' }}>HKD {inv.amount.toLocaleString()}</p>
                      <span
                        className="text-xs px-2 py-0.5 rounded-full inline-block mt-1"
                        style={{ background: invBadgeBg, border: invBadgeBorder, color: invBadgeColor }}
                      >
                        {inv.status}
                      </span>
                    </div>
                  </div>
                  <button className="mt-2 flex items-center gap-1.5 text-xs hover:opacity-75 transition-opacity" style={{ color: subText }}>
                    <Download className="w-3.5 h-3.5" /> Download Invoice
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          ADJOURN MODAL
      ══════════════════════════════════════════════════════════════════════ */}
      {showAdjournModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
            style={{ background: modalBg, border: modalBorder, boxShadow: '0 30px 80px rgba(0,0,0,0.35)' }}
          >

            {/* ── Step: Select ──────────────────────────────────────────────── */}
            {adjournStep === 'select' && (
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5" style={{ color: 'rgb(220,181,21)' }} />
                    <h2 className="text-lg" style={{ color: pageText }}>Extend Membership</h2>
                  </div>
                  <button onClick={handleCloseAdjourn} className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white/10 flex-shrink-0">
                    <X className="w-4 h-4" style={{ color: subText }} />
                  </button>
                </div>
                <p className="text-xs mb-1" style={{ color: subText }}>
                  Pre-purchase the next year. Your current {tierCfg.tier} expiry on <strong style={{ color: pageText }}>{formatDate(expiryDate)}</strong> will not change.
                </p>
                <p className="text-xs mb-5" style={{ color: 'rgb(52,199,89)' }}>
                  Visits and vouchers are added to your pool immediately upon purchase.
                </p>

                {/* Package list */}
                <div className="space-y-3 mb-5">
                  {availableAdjournPkgs.map((pkg) => {
                    const pkgIsSelected = selectedAdjournPkg?.id === pkg.id;
                    const pkgIsUpgrade = pkg.tierLevel > currentTierLevel;
                    const pkgIsCurrentTier = pkg.tierLevel === currentTierLevel;
                    const selBg = isDark ? 'rgba(220,181,21,0.08)' : 'rgba(220,181,21,0.06)';
                    const pkgCardBg = pkgIsSelected ? selBg : rowBg;
                    const pkgCardBorder = pkgIsSelected ? `2px solid ${pkg.color}` : rowBorder;
                    const handlePkgClick = () => handleSelectPkg(pkg);
                    const pkgLockedKey = `${currentTierLevel}-${pkg.tierLevel}`;
                    const pkgLockedList = pkgIsUpgrade ? (LOCKED_UPGRADE_SERVICES[pkgLockedKey] || []) : [];
                    return (
                      <button
                        key={pkg.id}
                        onClick={handlePkgClick}
                        className="w-full text-left rounded-2xl p-4 transition-all"
                        style={{ background: pkgCardBg, border: pkgCardBorder }}
                      >
                        <div className="flex items-start gap-4">
                          <div
                            className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                            style={{ background: `linear-gradient(135deg, ${pkg.gradientFrom}, ${pkg.gradientTo})` }}
                          >
                            <pkg.Icon className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <span className="text-sm" style={{ color: pageText }}>{pkg.name} Membership</span>
                              {pkgIsCurrentTier && (
                                <span className="text-xs px-2 py-0.5 rounded-full"
                                  style={{ background: 'rgba(52,199,89,0.1)', border: '1px solid rgba(52,199,89,0.3)', color: 'rgb(52,199,89)' }}>
                                  Same tier · Renewal
                                </span>
                              )}
                              {pkgIsUpgrade && (
                                <span className="text-xs px-2 py-0.5 rounded-full"
                                  style={{ background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.35)', color: '#a78bfa' }}>
                                  Upgrade
                                </span>
                              )}
                            </div>
                            <p className="text-xs mb-2" style={{ color: subText }}>{pkg.tagline}</p>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 mb-2">
                              {pkg.highlights.map((h, i) => (
                                <span key={i} className="text-xs flex items-center gap-1" style={{ color: subText }}>
                                  <Check className="w-3 h-3 flex-shrink-0" style={{ color: pkg.color }} /> {h}
                                </span>
                              ))}
                            </div>
                            {/* Immediate benefits */}
                            <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgb(52,199,89)' }}>
                              <Plus className="w-3 h-3" />
                              +{pkg.visitsIncluded > 0 ? `${pkg.visitsIncluded} visits` : `HKD ${pkg.creditIncluded.toLocaleString()} credit`} &amp; {pkg.vouchersIncluded} vouchers added to pool immediately
                            </div>
                            {/* Locked services for upgrade */}
                            {pkgLockedList.length > 0 && (
                              <div className="flex items-center gap-1.5 text-xs mt-0.5" style={{ color: subText }}>
                                <Lock className="w-3 h-3" />
                                {pkgLockedList.length} service perk{pkgLockedList.length > 1 ? 's' : ''} unlock on activation
                              </div>
                            )}
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-base" style={{ color: 'rgb(220,181,21)' }}>HKD {pkg.price.toLocaleString()}</p>
                            <p className="text-xs" style={{ color: subText }}>/year</p>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Preview after selecting */}
                {selectedAdjournPkg && (
                  <div className="rounded-xl p-4 mb-5" style={{ background: goldAccentBg, border: goldAccentBorder }}>
                    <p className="text-xs mb-3" style={{ color: 'rgb(220,181,21)' }}>Pool preview after purchase</p>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      {!isTA && (
                        <div>
                          <p className="text-xs mb-1" style={{ color: subText }}>Visits</p>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-sm" style={{ color: pageText }}>{baseBookingsRemaining}</span>
                            <Plus className="w-3 h-3" style={{ color: 'rgb(220,181,21)' }} />
                            <span className="text-sm" style={{ color: selectedAdjournPkg.color }}>{selectedAdjournPkg.visitsIncluded}</span>
                            <span className="text-xs" style={{ color: subText }}>=</span>
                            <span className="text-sm" style={{ color: 'rgb(52,199,89)' }}>{previewVisitTotal}</span>
                          </div>
                        </div>
                      )}
                      {isTA && (
                        <div>
                          <p className="text-xs mb-1" style={{ color: subText }}>Credit</p>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-xs" style={{ color: pageText }}>HKD {baseBookingsRemaining.toLocaleString()}</span>
                            <Plus className="w-3 h-3" style={{ color: 'rgb(220,181,21)' }} />
                            <span className="text-xs" style={{ color: selectedAdjournPkg.color }}>HKD {selectedAdjournPkg.creditIncluded.toLocaleString()}</span>
                            <span className="text-xs" style={{ color: subText }}>=</span>
                            <span className="text-xs" style={{ color: 'rgb(52,199,89)' }}>HKD {previewCreditTotal.toLocaleString()}</span>
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="text-xs mb-1" style={{ color: subText }}>Vouchers</p>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm" style={{ color: pageText }}>{baseVouchers}</span>
                          <Plus className="w-3 h-3" style={{ color: 'rgb(220,181,21)' }} />
                          <span className="text-sm" style={{ color: selectedAdjournPkg.color }}>{selectedAdjournPkg.vouchersIncluded}</span>
                          <span className="text-xs" style={{ color: subText }}>=</span>
                          <span className="text-sm" style={{ color: 'rgb(52,199,89)' }}>{previewVoucherTotal}</span>
                        </div>
                      </div>
                    </div>
                    {previewLockedServices.length > 0 && (
                      <div className="rounded-lg p-3" style={{ background: lockedBg, border: lockedBorder }}>
                        <div className="flex items-center gap-1.5 mb-2">
                          <Hourglass className="w-3.5 h-3.5" style={{ color: subText }} />
                          <span className="text-xs" style={{ color: subText }}>
                            These service perks unlock on {formatDate(dayAfter(expiryDate))}
                          </span>
                        </div>
                        <div className="space-y-1">
                          {previewLockedServices.map((s, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                              <Lock className="w-3 h-3 flex-shrink-0" style={{ color: subText }} />
                              <span className="text-xs" style={{ color: subText }}>{s}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={handleCloseAdjourn}
                    className="flex-1 py-3 rounded-xl text-sm"
                    style={{ background: rowBg, border: rowBorder, color: pageText }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleProceedConfirm}
                    disabled={!selectedAdjournPkg}
                    className="flex-1 py-3 rounded-xl text-sm text-white flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
                    style={{ background: 'linear-gradient(135deg, rgb(220,181,21), rgb(160,128,8))' }}
                  >
                    Continue <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* ── Step: Confirm ─────────────────────────────────────────────── */}
            {adjournStep === 'confirm' && selectedAdjournPkg && (
              <div className="p-6">
                <div className="flex items-center gap-3 mb-5">
                  <button onClick={handleBackToSelect} className="text-xs hover:opacity-70 transition-opacity" style={{ color: subText }}>← Back</button>
                  <h2 className="text-lg" style={{ color: pageText }}>Confirm &amp; Pay</h2>
                </div>

                <div className="rounded-2xl p-5 mb-4" style={{ background: rowBg, border: rowBorder }}>
                  <div className="flex items-center gap-4 mb-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: `linear-gradient(135deg, ${selectedAdjournPkg.gradientFrom}, ${selectedAdjournPkg.gradientTo})` }}
                    >
                      <selectedAdjournPkg.Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm" style={{ color: pageText }}>{selectedAdjournPkg.name} Membership</p>
                      <p className="text-xs" style={{ color: subText }}>{selectedAdjournPkg.tagline}</p>
                    </div>
                  </div>

                  {[
                    { label: 'Current expiry (unchanged)', value: formatDate(expiryDate) },
                    { label: 'New package activates', value: formatDate(dayAfter(expiryDate)) },
                    { label: 'New package expires', value: formatDate(addOneYear(dayAfter(expiryDate))) },
                    { label: 'Visits added to pool now', value: !isTA ? `+${selectedAdjournPkg.visitsIncluded} → ${previewVisitTotal} total` : `+HKD ${selectedAdjournPkg.creditIncluded.toLocaleString()} → HKD ${previewCreditTotal.toLocaleString()} total` },
                    { label: 'Vouchers added to pool now', value: `+${selectedAdjournPkg.vouchersIncluded} → ${previewVoucherTotal} total` },
                    ...(previewLockedServices.length > 0 ? [{ label: 'Service perks lock until', value: formatDate(dayAfter(expiryDate)) }] : []),
                    { label: 'Amount due', value: `HKD ${selectedAdjournPkg.price.toLocaleString()}` },
                  ].map(({ label, value }) => {
                    const isAmount = label === 'Amount due';
                    const isPool = label.includes('pool now');
                    const valueColor = isAmount ? 'rgb(220,181,21)' : isPool ? 'rgb(52,199,89)' : pageText;
                    const divStyle = isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(200,199,190,0.3)';
                    return (
                      <div key={label} className="flex justify-between py-2" style={{ borderTop: divStyle }}>
                        <span className="text-xs" style={{ color: subText }}>{label}</span>
                        <span className="text-xs" style={{ color: valueColor }}>{value}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Payment */}
                <div className="rounded-xl p-4 mb-4 flex items-center gap-3" style={{ background: goldAccentBg, border: goldAccentBorder }}>
                  <CreditCard className="w-5 h-5 flex-shrink-0" style={{ color: 'rgb(220,181,21)' }} />
                  <div className="flex-1">
                    <p className="text-xs" style={{ color: pageText }}>Payment Method</p>
                    <p className="text-xs" style={{ color: subText }}>Visa •••• 4242 (default card)</p>
                  </div>
                  <Lock className="w-4 h-4" style={{ color: subText }} />
                </div>

                <div className="rounded-xl px-4 py-3 mb-5 flex items-start gap-2" style={{ background: greenAccentBg, border: greenAccentBorder }}>
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'rgb(52,199,89)' }} />
                  <p className="text-xs" style={{ color: subText }}>
                    Visits and vouchers are added to your pool <strong style={{ color: pageText }}>immediately</strong>.
                    {previewLockedServices.length > 0
                      ? ` Higher-tier service perks activate on ${formatDate(dayAfter(expiryDate))}.`
                      : ' No service perks change — same tier renewal.'}
                  </p>
                </div>

                <div className="flex gap-3">
                  <button onClick={handleBackToSelect} className="flex-1 py-3 rounded-xl text-sm" style={{ background: rowBg, border: rowBorder, color: pageText }}>
                    Back
                  </button>
                  <button
                    onClick={handleConfirmAdjourn}
                    className="flex-1 py-3 rounded-xl text-sm text-white hover:opacity-90 transition-opacity"
                    style={{ background: 'linear-gradient(135deg, rgb(220,181,21), rgb(160,128,8))' }}
                  >
                    Pay HKD {selectedAdjournPkg.price.toLocaleString()}
                  </button>
                </div>
              </div>
            )}

            {/* ── Step: Success ─────────────────────────────────────────────── */}
            {adjournStep === 'success' && queuedMembership && (
              <div className="p-8 flex flex-col items-center text-center">
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center mb-5"
                  style={{ background: 'linear-gradient(135deg, rgb(220,181,21), rgb(160,128,8))', boxShadow: '0 0 40px rgba(220,181,21,0.4)' }}
                >
                  <Check className="w-10 h-10 text-white" strokeWidth={2.5} />
                </div>
                <p className="text-xl mb-1" style={{ color: pageText }}>
                  {queuedMembership.isUpgrade ? 'Upgrade Adjourned!' : 'Renewal Adjourned!'}
                </p>
                <p className="text-sm mb-1" style={{ color: subText }}>
                  <strong style={{ color: 'rgb(220,181,21)' }}>{queuedMembership.name} Membership</strong> secured for your next period.
                </p>
                <p className="text-xs mb-6" style={{ color: subText }}>
                  Current {tierCfg.tier} active until <strong style={{ color: pageText }}>{formatDate(expiryDate)}</strong> (unchanged).
                </p>

                <div className="w-full space-y-3 mb-6">
                  {/* Immediate */}
                  <div className="rounded-xl p-4 text-left" style={{ background: greenAccentBg, border: greenAccentBorder }}>
                    <p className="text-xs mb-2" style={{ color: 'rgb(52,199,89)' }}>Added to your pool now</p>
                    <div className="space-y-1">
                      {!isTA && (
                        <p className="text-xs" style={{ color: pageText }}>
                          +{queuedMembership.visitsIncluded} visits → {totalVisitsNow} total available
                        </p>
                      )}
                      {isTA && (
                        <p className="text-xs" style={{ color: pageText }}>
                          +HKD {queuedMembership.creditIncluded.toLocaleString()} credit → HKD {totalCreditNow.toLocaleString()} total
                        </p>
                      )}
                      <p className="text-xs" style={{ color: pageText }}>
                        +{queuedMembership.vouchersIncluded} vouchers → {totalVouchersNow} total available
                      </p>
                    </div>
                  </div>

                  {/* Locked services */}
                  {lockedServices.length > 0 && (
                    <div className="rounded-xl p-4 text-left" style={{ background: lockedBg, border: lockedBorder }}>
                      <div className="flex items-center gap-2 mb-2">
                        <Hourglass className="w-3.5 h-3.5" style={{ color: subText }} />
                        <p className="text-xs" style={{ color: subText }}>Service perks unlock {formatDate(queuedMembership.activatesOn)}</p>
                      </div>
                      <div className="space-y-1">
                        {lockedServices.map((s, i) => (
                          <div key={i} className="flex items-center gap-1.5">
                            <Lock className="w-3 h-3 flex-shrink-0" style={{ color: subText }} />
                            <span className="text-xs" style={{ color: subText }}>{s}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between text-xs px-1">
                    <span style={{ color: subText }}>Order Reference</span>
                    <span className="font-mono" style={{ color: pageText }}>{queuedMembership.orderRef}</span>
                  </div>
                </div>

                <button
                  onClick={handleCloseAdjourn}
                  className="w-full py-3 rounded-xl text-sm text-white hover:opacity-90 transition-opacity"
                  style={{ background: 'linear-gradient(135deg, rgb(220,181,21), rgb(160,128,8))' }}
                >
                  Done
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
