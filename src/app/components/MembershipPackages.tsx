import React, { useState } from 'react';
import {
  Check, Star, Sparkles, ChevronRight, X, Medal,
  ArrowLeft, ShieldCheck, FileText, CreditCard, Lock,
  Crown, Gem, Building2, Award, Users, Cake, Car,
  UserCheck, Zap,
} from 'lucide-react';
import { useTheme } from './ThemeContext';

// ── Data ─────────────────────────────────────────────────────────────────────

interface TierData {
  id: string;
  name: string;
  memberType: string;
  Icon: React.ElementType;
  price: number;
  currency: string;
  period: string;
  tagline: string;
  highlight: boolean;
  badge?: string;
  accentColor: string;
  entries: number | 'Unlimited';
  freeUpgradesPerYear: number | 'NA';
  hasNonFlyingGuest: boolean;  // free 1 non-flying guest per entry (corporate)
  features: string[];
}

const INDIVIDUAL_TIERS: TierData[] = [
  {
    id: 'ind-gold',
    name: 'Gold',
    memberType: 'Individual',
    Icon: Medal,
    price: 32000,
    currency: 'HKD',
    period: 'year',
    tagline: 'Ideal for regular travellers',
    highlight: false,
    accentColor: 'rgb(220,181,21)',
    entries: 8,
    freeUpgradesPerYear: 'NA',
    hasNonFlyingGuest: false,
    features: [
      '8 Lounge Deluxe entries per year',
      'Paid upgrade to Premiere Suite: 40% off',
      'Flying Guest: 40% off',
      'Non-flying Guest: 40% off',
      'In-town Limousine Transfer: 40% off (1 limousine)',
      'Birthday month complimentary birthday cake',
    ],
  },
  {
    id: 'ind-platinum',
    name: 'Platinum',
    memberType: 'Individual',
    Icon: Star,
    price: 45000,
    currency: 'HKD',
    period: 'year',
    tagline: 'For the frequent traveller',
    highlight: false,
    accentColor: '#94a3b8',
    entries: 12,
    freeUpgradesPerYear: 'NA',
    hasNonFlyingGuest: false,
    features: [
      '12 Lounge Deluxe entries per year',
      'Paid upgrade to Premiere Suite: 40% off',
      'Flying Guest: 40% off',
      'Non-flying Guest: 40% off',
      'In-town Limousine Transfer: 40% off (1 limousine)',
      'Birthday month complimentary birthday cake',
    ],
  },
  {
    id: 'ind-diamond',
    name: 'Diamond',
    memberType: 'Individual',
    Icon: Sparkles,
    price: 84000,
    currency: 'HKD',
    period: 'year',
    tagline: 'Premium access with suite upgrades',
    highlight: true,
    badge: 'Most Popular',
    accentColor: '#38bdf8',
    entries: 24,
    freeUpgradesPerYear: 1,
    hasNonFlyingGuest: false,
    features: [
      '24 Lounge Deluxe entries per year',
      '1 free Premiere Suite upgrade voucher/year (account holder & spouse only)',
      'Paid upgrade to Premiere Suite: 40% off',
      'Flying Guest: 40% off',
      'Non-flying Guest: 40% off',
      'In-town Limousine Transfer: 40% off (1 limousine)',
      'Birthday month complimentary birthday cake',
    ],
  },
  {
    id: 'ind-sapphire',
    name: 'Sapphire',
    memberType: 'Individual',
    Icon: Crown,
    price: 325000,
    currency: 'HKD',
    period: 'year',
    tagline: 'Unlimited elite privilege',
    highlight: false,
    badge: 'Ultimate',
    accentColor: '#818cf8',
    entries: 'Unlimited',
    freeUpgradesPerYear: 5,
    hasNonFlyingGuest: false,
    features: [
      'Unlimited Lounge Deluxe entries per year',
      '5 free Premiere Suite upgrade vouchers/year (account holder & spouse only)',
      'Paid upgrade to Premiere Suite: 40% off',
      'Flying Guest: 40% off',
      'Non-flying Guest: 40% off',
      'In-town Limousine Transfer: 40% off (1 limousine)',
      'Birthday month complimentary birthday cake',
    ],
  },
];

const CORPORATE_TIERS: TierData[] = [
  {
    id: 'corp-executive',
    name: 'Executive',
    memberType: 'Corporate',
    Icon: Building2,
    price: 160000,
    currency: 'HKD',
    period: 'year',
    tagline: 'For growing corporate teams',
    highlight: false,
    accentColor: 'rgb(220,181,21)',
    entries: 40,
    freeUpgradesPerYear: 'NA',
    hasNonFlyingGuest: true,
    features: [
      '40 Lounge Deluxe entries per year',
      'Shared by up to 5 Executive Nominees',
      'Free 1 non-flying guest per Lounge Deluxe Entry',
      'Paid upgrade to Premiere Suite: 40% off',
      'Flying Guest: 40% off',
      'Non-flying Guest: 40% off',
      'In-town Limousine Transfer: 40% off (1 limousine)',
      'Birthday month complimentary birthday cake',
    ],
  },
  {
    id: 'corp-elite',
    name: 'Elite',
    memberType: 'Corporate',
    Icon: Award,
    price: 300000,
    currency: 'HKD',
    period: 'year',
    tagline: 'Premium corporate privilege',
    highlight: true,
    badge: 'Most Popular',
    accentColor: '#38bdf8',
    entries: 80,
    freeUpgradesPerYear: 5,
    hasNonFlyingGuest: true,
    features: [
      '80 Lounge Deluxe entries per year',
      'Shared by up to 5 Executive Nominees',
      '5 free Premiere Suite upgrade vouchers/year (account holder & spouse only)',
      'Free 1 non-flying guest per Lounge Deluxe Entry',
      'Paid upgrade to Premiere Suite: 40% off',
      'Flying Guest: 40% off',
      'Non-flying Guest: 40% off',
      'In-town Limousine Transfer: 40% off (1 limousine)',
      'Birthday month complimentary birthday cake',
    ],
  },
  {
    id: 'corp-connoisseur',
    name: 'Connoisseur',
    memberType: 'Corporate',
    Icon: Crown,
    price: 520000,
    currency: 'HKD',
    period: 'year',
    tagline: 'The ultimate corporate membership',
    highlight: false,
    badge: 'Ultimate',
    accentColor: '#a78bfa',
    entries: 160,
    freeUpgradesPerYear: 10,
    hasNonFlyingGuest: true,
    features: [
      '160 Lounge Deluxe entries per year',
      'Shared by up to 5 Executive Nominees',
      '10 free Premiere Suite upgrade vouchers/year (account holder & spouse only)',
      'Free 1 non-flying guest per Lounge Deluxe Entry',
      'Paid upgrade to Premiere Suite: 40% off',
      'Flying Guest: 40% off',
      'Non-flying Guest: 40% off',
      'In-town Limousine Transfer: 40% off (1 limousine)',
      'Birthday month complimentary birthday cake',
    ],
  },
];

// Shared "other benefits" row data
const OTHER_BENEFITS = [
  { Icon: UserCheck, label: 'Flying Guest', value: '40% off the original price' },
  { Icon: Users, label: 'Non-flying Guest', value: '40% off the original price' },
  { Icon: Car, label: 'In-town Limousine Transfer', value: '40% off the original price for 1 limousine' },
];

const faqItems = [
  {
    q: 'Can I upgrade my membership plan?',
    a: 'Yes — you can upgrade at any time. The remaining value of your current plan will be pro-rated and applied as credit toward your new plan.',
  },
  {
    q: 'Are unused visits carried over?',
    a: 'Unused lounge visits do not carry over at the end of the membership year. We recommend booking in advance to make the most of your allowance.',
  },
  {
    q: 'How are Corporate entries shared among nominees?',
    a: 'Corporate entries are shared by a maximum of 5 nominated Executive Nominees. The corporate account holder provides the names of these personnel and HKIAL staff will verify upon booking submission.',
  },
  {
    q: 'Is there a trial period?',
    a: 'We offer a 14-day satisfaction guarantee. If you are not satisfied within 14 days of joining, contact our support team for a full refund.',
  },
];

const termsAndConditions = [
  {
    title: '1. Membership Eligibility',
    body: 'Membership is open to individuals aged 18 years or above and to registered corporate entities. By purchasing a membership, you confirm that all information provided is accurate, complete, and up to date. HKIA Lounge reserves the right to verify eligibility and to decline or cancel any membership application that does not meet the stated criteria.',
  },
  {
    title: '2. Membership Benefits',
    body: 'Benefits are as described in the membership package selected at the time of purchase. HKIA Lounge reserves the right to modify, substitute, or withdraw any benefit with 30 days\' written notice. Lounge access is subject to capacity and operational availability. Complimentary guest entitlements may not be exchanged for cash or transferred.',
  },
  {
    title: '3. Membership Period & Renewal',
    body: 'All memberships are valid for one (1) calendar year from the activation date. Memberships do not automatically renew. Members will receive a renewal reminder 30 days before expiry. Unused lounge visits and vouchers expire at the end of the membership year and cannot be carried forward or refunded.',
  },
  {
    title: '4. Payment & Fees',
    body: 'All fees are quoted in Hong Kong Dollars (HKD) and are inclusive of any applicable taxes. Payment must be made in full at the time of purchase. HKIA Lounge accepts major credit and debit cards. Membership activation is conditional upon successful payment clearance.',
  },
  {
    title: '5. Refund & Cancellation Policy',
    body: 'A 14-day satisfaction guarantee applies to new memberships. Refund requests submitted within 14 days of the activation date will be processed in full, provided fewer than two (2) lounge visits have been made. After the 14-day period, no refunds will be issued. Membership upgrades are subject to a pro-rated adjustment and are non-refundable once processed.',
  },
  {
    title: '6. Lounge Access & Conduct',
    body: 'Members and their guests must present a valid digital or physical membership card and a same-day boarding pass to gain lounge access. HKIA Lounge reserves the right to refuse entry or remove any member or guest who is in violation of lounge rules or whose behaviour is deemed disruptive or inappropriate. Minors under the age of 12 must be accompanied by an adult member at all times.',
  },
  {
    title: '7. Corporate Nominee Verification',
    body: 'For Corporate memberships, the account holder must provide the names of all Executive Nominees. HKIA Lounge staff will verify the identity of these personnel upon booking submission. Any changes to nominated personnel must be submitted in writing to the membership team and will be effective within 5 business days.',
  },
  {
    title: '8. Privacy & Data Protection',
    body: 'Personal data collected during the membership application and throughout the membership period will be used solely for the purpose of administering your membership and improving our services. Data will be handled in accordance with the Personal Data (Privacy) Ordinance (Cap. 486) of Hong Kong. We will not sell or share your personal data with third parties without your explicit consent, except as required by law.',
  },
  {
    title: '9. Amendments to Terms',
    body: 'HKIA Lounge reserves the right to amend these Terms & Conditions at any time. Members will be notified of material changes via the registered email address at least 14 days in advance. Continued use of the membership after the effective date of any amendment constitutes acceptance of the revised terms.',
  },
  {
    title: '10. Governing Law',
    body: 'These Terms & Conditions are governed by and construed in accordance with the laws of the Hong Kong Special Administrative Region. Any disputes arising in connection with these terms shall be subject to the exclusive jurisdiction of the courts of Hong Kong.',
  },
];

type MemberTab = 'Individual' | 'Corporate';
type View = 'list' | 'checkout' | 'success';

export function MembershipPackages() {
  const { colors, mode } = useTheme();
  const [activeTab, setActiveTab] = useState<MemberTab>('Individual');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedTier, setSelectedTier] = useState<TierData | null>(null);
  const [view, setView] = useState<View>('list');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  const isDark = mode === 'dark';

  // ── Pre-computed style variables ──────────────────────────────────────────
  const pageText = isDark ? '#ffffff' : 'rgb(64,63,52)';
  const subText = isDark ? 'rgba(255,255,255,0.55)' : 'rgb(130,129,118)';
  const cardBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.85)';
  const cardBorder = isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(200,199,190,0.5)';
  const highlightCardBg = isDark
    ? 'linear-gradient(145deg, rgba(220,181,21,0.12) 0%, rgba(180,140,10,0.08) 100%)'
    : 'linear-gradient(145deg, rgba(220,181,21,0.1) 0%, rgba(180,140,10,0.06) 100%)';
  const highlightCardBorder = '1px solid rgba(220,181,21,0.45)';
  const sectionBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.75)';
  const sectionBorder = isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(200,199,190,0.45)';
  const faqBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(231,230,221,0.45)';
  const faqBorder = isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(200,199,190,0.4)';
  const faqOpenBg = isDark ? 'rgba(220,181,21,0.08)' : 'rgba(220,181,21,0.06)';
  const rowBg = isDark ? 'rgba(0,0,0,0.2)' : 'rgba(231,230,221,0.4)';
  const rowBorder = isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(200,199,190,0.35)';
  const checkboxBorder = agreedToTerms ? 'rgb(220,181,21)' : isDark ? 'rgba(255,255,255,0.3)' : 'rgba(150,149,138,0.6)';
  const checkboxBg = agreedToTerms ? 'rgb(220,181,21)' : 'transparent';
  const payBtnOpacity = agreedToTerms ? 1 : 0.4;
  const tabActiveBg = isDark ? 'rgba(220,181,21,0.15)' : 'rgba(220,181,21,0.12)';
  const tabInactiveBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(231,230,221,0.5)';
  const tabInactiveBorder = isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(200,199,190,0.4)';
  const otherBenefitsBg = isDark ? 'rgba(220,181,21,0.06)' : 'rgba(220,181,21,0.04)';
  const otherBenefitsBorder = '1px solid rgba(220,181,21,0.25)';
  const notesBg = isDark ? 'rgba(59,130,246,0.08)' : 'rgba(59,130,246,0.06)';
  const notesBorder = '1px solid rgba(59,130,246,0.25)';

  const displayTiers = activeTab === 'Individual' ? INDIVIDUAL_TIERS : CORPORATE_TIERS;
  const gridCols = activeTab === 'Individual' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-4' : 'grid-cols-1 sm:grid-cols-3';

  // ── Handlers ──────────────────────────────────────────────────────────────
  function handleSelectTier(tier: TierData) {
    setSelectedTier(tier);
    setAgreedToTerms(false);
    setView('checkout');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleBackToList() {
    setView('list');
    setSelectedTier(null);
    setAgreedToTerms(false);
  }

  function handleConfirmPurchase() {
    if (!agreedToTerms) return;
    setView('success');
  }

  function handleBackToPackages() {
    setView('list');
    setSelectedTier(null);
    setAgreedToTerms(false);
  }

  function handleFaqToggle(idx: number) {
    setOpenFaq(openFaq === idx ? null : idx);
  }

  function handleToggleTerms() {
    setAgreedToTerms(!agreedToTerms);
  }

  function handleTabIndividual() { setActiveTab('Individual'); }
  function handleTabCorporate() { setActiveTab('Corporate'); }

  // ── SUCCESS VIEW ──────────────────────────────────────────────────────────
  if (view === 'success' && selectedTier) {
    const TierIcon = selectedTier.Icon;
    return (
      <div className="max-w-lg mx-auto pb-16 pt-8 flex flex-col items-center text-center">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
          style={{ background: 'linear-gradient(135deg, rgb(220,181,21) 0%, rgb(160,128,8) 100%)', boxShadow: '0 0 60px rgba(220,181,21,0.45)' }}
        >
          <Check className="w-12 h-12 text-white" strokeWidth={2.5} />
        </div>

        <p className="text-2xl mb-2" style={{ color: pageText }}>Payment Successful!</p>
        <p className="text-sm mb-8 max-w-xs" style={{ color: subText }}>
          Your{' '}
          <strong style={{ color: 'rgb(220,181,21)' }}>{selectedTier.name} {selectedTier.memberType} Membership</strong>{' '}
          has been activated. Welcome to HKIA Lounge.
        </p>

        <div className="w-full rounded-2xl overflow-hidden mb-6" style={{ background: sectionBg, border: sectionBorder }}>
          <div className="h-1.5 w-full" style={{ background: 'linear-gradient(90deg, rgb(220,181,21), rgb(160,128,8))' }} />
          <div className="p-6">
            <div className="flex items-center gap-4 mb-5">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgb(220,181,21), rgb(160,128,8))' }}>
                <TierIcon className="w-6 h-6 text-white" />
              </div>
              <div className="text-left">
                <p className="text-sm" style={{ color: pageText }}>{selectedTier.name} {selectedTier.memberType} Membership</p>
                <p className="text-xs" style={{ color: subText }}>{selectedTier.tagline}</p>
              </div>
            </div>
            {[
              { label: 'Order Reference', value: `MBR-${Date.now().toString().slice(-8)}` },
              { label: 'Amount Paid', value: `${selectedTier.currency} ${selectedTier.price.toLocaleString()}` },
              { label: 'Valid Until', value: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' }) },
              { label: 'Status', value: 'Active' },
            ].map((row) => {
              const valueColor = row.label === 'Status' ? 'rgb(52,199,89)' : row.label === 'Amount Paid' ? 'rgb(220,181,21)' : pageText;
              const rowTopBorder = isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(200,199,190,0.35)';
              return (
                <div key={row.label} className="flex items-center justify-between py-3" style={{ borderTop: rowTopBorder }}>
                  <span className="text-xs" style={{ color: subText }}>{row.label}</span>
                  <span className="text-xs" style={{ color: valueColor }}>{row.value}</span>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleBackToPackages}
          className="w-full py-3.5 rounded-xl text-sm text-white transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, rgb(220,181,21) 0%, rgb(160,128,8) 100%)', boxShadow: '0 8px 24px rgba(220,181,21,0.35)' }}
        >
          Back to Membership Packages
        </button>
      </div>
    );
  }

  // ── CHECKOUT VIEW ─────────────────────────────────────────────────────────
  if (view === 'checkout' && selectedTier) {
    const TierIcon = selectedTier.Icon;

    return (
      <div className="max-w-5xl mx-auto pb-16">
        <button
          onClick={handleBackToList}
          className="flex items-center gap-2 mb-6 transition-opacity hover:opacity-70"
          style={{ color: subText }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Packages</span>
        </button>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-3" style={{ background: 'rgba(220,181,21,0.15)', border: '1px solid rgba(220,181,21,0.35)' }}>
            <CreditCard className="w-3.5 h-3.5" style={{ color: 'rgb(220,181,21)' }} />
            <span className="text-xs" style={{ color: 'rgb(220,181,21)' }}>Checkout</span>
          </div>
          <h1 className="text-2xl" style={{ color: pageText }}>Complete Your Purchase</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: T&C */}
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-2xl p-5" style={{ background: sectionBg, border: sectionBorder }}>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(220,181,21,0.15)' }}>
                  <FileText className="w-4 h-4" style={{ color: 'rgb(220,181,21)' }} />
                </div>
                <div>
                  <p className="text-sm" style={{ color: pageText }}>Terms &amp; Conditions</p>
                  <p className="text-xs" style={{ color: subText }}>Please read carefully before proceeding</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden" style={{ background: sectionBg, border: sectionBorder }}>
              <div className="overflow-y-auto p-5 space-y-5" style={{ maxHeight: '420px' }}>
                {termsAndConditions.map((section) => (
                  <div key={section.title}>
                    <p className="text-xs mb-2" style={{ color: 'rgb(220,181,21)' }}>{section.title}</p>
                    <p className="text-xs leading-relaxed" style={{ color: subText }}>{section.body}</p>
                  </div>
                ))}
                <div className="h-2" />
              </div>
              <div className="h-6 -mt-6 pointer-events-none" style={{ background: isDark ? 'linear-gradient(to bottom, transparent, rgba(15,32,53,0.9))' : 'linear-gradient(to bottom, transparent, rgba(255,255,255,0.9))' }} />
            </div>

            <button
              onClick={handleToggleTerms}
              className="w-full flex items-start gap-3 p-4 rounded-2xl text-left transition-all"
              style={{ background: agreedToTerms ? 'rgba(220,181,21,0.08)' : sectionBg, border: agreedToTerms ? '1px solid rgba(220,181,21,0.4)' : sectionBorder }}
            >
              <div className="w-5 h-5 rounded-md shrink-0 mt-0.5 flex items-center justify-center transition-all" style={{ background: checkboxBg, border: `2px solid ${checkboxBorder}` }}>
                {agreedToTerms && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
              </div>
              <span className="text-xs leading-relaxed" style={{ color: pageText }}>
                I have read, understood, and agree to the{' '}
                <strong style={{ color: 'rgb(220,181,21)' }}>Terms &amp; Conditions</strong>{' '}
                of HKIA Lounge Membership, including the refund policy and lounge access rules.
              </span>
            </button>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="space-y-4">
            <div className="rounded-2xl overflow-hidden" style={{ background: sectionBg, border: sectionBorder }}>
              <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, rgb(220,181,21), rgb(160,128,8))' }} />
              <div className="p-5">
                <p className="text-xs mb-4" style={{ color: subText }}>Order Summary</p>

                <div className="flex items-center gap-3 mb-5">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgb(220,181,21), rgb(160,128,8))' }}>
                    <TierIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: pageText }}>{selectedTier.name} Membership</p>
                    <p className="text-xs" style={{ color: subText }}>{selectedTier.memberType} · {selectedTier.tagline}</p>
                  </div>
                </div>

                <ul className="space-y-2 mb-5">
                  {selectedTier.features.slice(0, 5).map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="w-3 h-3 mt-0.5 shrink-0" style={{ color: 'rgb(220,181,21)' }} />
                      <span className="text-xs" style={{ color: subText }}>{f}</span>
                    </li>
                  ))}
                  {selectedTier.features.length > 5 && (
                    <li className="text-xs" style={{ color: subText }}>+{selectedTier.features.length - 5} more benefits</li>
                  )}
                </ul>

                <div className="space-y-2 mb-4">
                  {[
                    { label: 'Plan Price', value: `${selectedTier.currency} ${selectedTier.price.toLocaleString()}` },
                    { label: 'Duration', value: '1 year' },
                    { label: 'Processing Fee', value: 'Waived', green: true },
                  ].map((row) => {
                    const valColor = row.green ? 'rgb(52,199,89)' : pageText;
                    return (
                      <div key={row.label} className="flex items-center justify-between px-3 py-2.5 rounded-lg" style={{ background: rowBg, border: rowBorder }}>
                        <span className="text-xs" style={{ color: subText }}>{row.label}</span>
                        <span className="text-xs" style={{ color: valColor }}>{row.value}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between px-3 py-3 rounded-xl mb-5" style={{ background: 'rgba(220,181,21,0.1)', border: '1px solid rgba(220,181,21,0.3)' }}>
                  <span className="text-sm" style={{ color: pageText }}>Total Due</span>
                  <span className="text-sm" style={{ color: 'rgb(220,181,21)' }}>
                    {selectedTier.currency} {selectedTier.price.toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={handleConfirmPurchase}
                  disabled={!agreedToTerms}
                  className="w-full py-3.5 rounded-xl text-sm text-white flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  style={{
                    background: 'linear-gradient(135deg, rgb(220,181,21) 0%, rgb(160,128,8) 100%)',
                    boxShadow: agreedToTerms ? '0 8px 24px rgba(220,181,21,0.35)' : 'none',
                    opacity: payBtnOpacity,
                    cursor: agreedToTerms ? 'pointer' : 'not-allowed',
                  }}
                >
                  <Lock className="w-3.5 h-3.5" />
                  Confirm &amp; Pay
                </button>

                {!agreedToTerms && (
                  <p className="text-xs text-center mt-3" style={{ color: subText }}>
                    Please agree to the Terms &amp; Conditions to proceed.
                  </p>
                )}
              </div>
            </div>

            <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: sectionBg, border: sectionBorder }}>
              <ShieldCheck className="w-4 h-4 shrink-0" style={{ color: 'rgb(52,199,89)' }} />
              <p className="text-xs" style={{ color: subText }}>Your payment is secured with 256-bit SSL encryption.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── LIST VIEW ─────────────────────────────────────────────────────────────
  return (
    <div className="max-w-6xl mx-auto pb-16">
      {/* Header */}
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-4" style={{ background: 'rgba(220,181,21,0.15)', border: '1px solid rgba(220,181,21,0.35)' }}>
          <Sparkles className="w-3.5 h-3.5" style={{ color: 'rgb(220,181,21)' }} />
          <span className="text-xs" style={{ color: 'rgb(220,181,21)' }}>Membership Packages</span>
        </div>
        <h1 className="text-3xl mb-3" style={{ color: pageText }}>Choose Your Membership</h1>
        <p className="text-sm max-w-xl mx-auto" style={{ color: subText }}>
          Enjoy exclusive access to the HKIA Lounge. Select the membership type and tier that best fits your travel lifestyle.
        </p>
      </div>

      {/* Tab Selector */}
      <div className="flex gap-3 mb-8 justify-center">
        <button
          onClick={handleTabIndividual}
          className="px-6 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2"
          style={{
            background: activeTab === 'Individual' ? tabActiveBg : tabInactiveBg,
            border: activeTab === 'Individual' ? '1px solid rgba(220,181,21,0.45)' : tabInactiveBorder,
            color: activeTab === 'Individual' ? 'rgb(220,181,21)' : subText,
          }}
        >
          <Medal className="w-4 h-4" />
          Individual Membership
          <span className="text-xs px-1.5 py-0.5 rounded-md" style={{ background: activeTab === 'Individual' ? 'rgba(220,181,21,0.2)' : 'rgba(255,255,255,0.08)' }}>
            4-tier
          </span>
        </button>
        
      </div>

      {/* Tier Cards */}
      <div className={`grid ${gridCols} gap-5 mb-10`}>
        {displayTiers.map((tier) => {
          const TierIcon = tier.Icon;
          const bg = tier.highlight ? highlightCardBg : cardBg;
          const border = tier.highlight ? highlightCardBorder : cardBorder;
          const shadow = tier.highlight
            ? '0 20px 48px rgba(220,181,21,0.18)'
            : isDark ? '0 8px 24px rgba(0,0,0,0.3)' : '0 8px 24px rgba(0,0,0,0.08)';
          const scale = tier.highlight ? 'scale-[1.02]' : '';
          const iconGradient = tier.highlight
            ? 'linear-gradient(135deg, rgb(220,181,21), rgb(160,128,8))'
            : `linear-gradient(135deg, ${tier.accentColor}44, ${tier.accentColor}22)`;
          const iconColor = tier.highlight ? '#fff' : tier.accentColor;
          const priceColor = tier.highlight ? 'rgb(220,181,21)' : pageText;
          const featureTextColor = isDark ? 'rgba(255,255,255,0.75)' : 'rgb(90,89,78)';
          const dividerColor = isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(200,199,190,0.4)';
          const ctaStyle = tier.highlight
            ? { background: 'linear-gradient(135deg, rgb(220,181,21) 0%, rgb(160,128,8) 100%)', color: '#ffffff', boxShadow: '0 8px 20px rgba(220,181,21,0.35)' }
            : { background: isDark ? 'rgba(220,181,21,0.1)' : 'rgba(220,181,21,0.08)', color: 'rgb(220,181,21)', border: '1px solid rgba(220,181,21,0.35)' };

          // Key stats for the card
          const entryLabel = typeof tier.entries === 'number' ? `${tier.entries} entries/year` : 'Unlimited entries/year';
          const upgradeLabel = tier.freeUpgradesPerYear === 'NA' ? 'No free suite upgrades' : `${tier.freeUpgradesPerYear} free suite upgrade${tier.freeUpgradesPerYear !== 1 ? 's' : ''}/year`;

          const handleSelect = () => handleSelectTier(tier);

          return (
            <div
              key={tier.id}
              className={`rounded-2xl flex flex-col overflow-hidden transition-transform duration-200 ${scale}`}
              style={{ background: bg, border, boxShadow: shadow }}
            >
              {tier.highlight && (
                <div className="h-1 w-full" style={{ background: 'linear-gradient(90deg, rgb(220,181,21), rgb(160,128,8))' }} />
              )}

              <div className="p-6 flex flex-col flex-1">
                {/* Badge */}
                {tier.badge && (
                  <div className="mb-3">
                    <span
                      className="text-xs px-2.5 py-1 rounded-full"
                      style={
                        tier.highlight
                          ? { background: 'rgba(220,181,21,0.2)', color: 'rgb(220,181,21)', border: '1px solid rgba(220,181,21,0.4)' }
                          : { background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(200,199,190,0.5)', color: subText, border: cardBorder }
                      }
                    >
                      {tier.badge}
                    </span>
                  </div>
                )}

                {/* Icon + Name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: iconGradient }}>
                    <TierIcon className="w-5 h-5" style={{ color: iconColor }} />
                  </div>
                  <div>
                    <p className="text-sm" style={{ color: pageText }}>{tier.name}</p>
                    <p className="text-xs" style={{ color: subText }}>{tier.tagline}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs" style={{ color: subText }}>{tier.currency}</span>
                    <span className="text-3xl" style={{ color: priceColor }}>{tier.price.toLocaleString()}</span>
                  </div>
                  <span className="text-xs" style={{ color: subText }}>per {tier.period}</span>
                </div>

                <div className="mb-4" style={{ borderTop: dividerColor }} />

                {/* Key stats */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: isDark ? 'rgba(220,181,21,0.08)' : 'rgba(220,181,21,0.06)', border: '1px solid rgba(220,181,21,0.2)' }}>
                    <Zap className="w-3.5 h-3.5 shrink-0" style={{ color: 'rgb(220,181,21)' }} />
                    <span className="text-xs" style={{ color: featureTextColor }}>{entryLabel}</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(231,230,221,0.35)', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(200,199,190,0.35)' }}>
                    <Crown className="w-3.5 h-3.5 shrink-0" style={{ color: tier.freeUpgradesPerYear === 'NA' ? subText : tier.accentColor }} />
                    <span className="text-xs" style={{ color: featureTextColor }}>{upgradeLabel}</span>
                  </div>
                  {tier.hasNonFlyingGuest && (
                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(231,230,221,0.35)', border: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(200,199,190,0.35)' }}>
                      <Users className="w-3.5 h-3.5 shrink-0" style={{ color: tier.accentColor }} />
                      <span className="text-xs" style={{ color: featureTextColor }}>Free 1 non-flying guest per entry</span>
                    </div>
                  )}
                </div>

                <div className="mb-4" style={{ borderTop: dividerColor }} />

                {/* Feature list */}
                <ul className="space-y-2 flex-1 mb-5">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" style={{ color: 'rgb(220,181,21)' }} />
                      <span className="text-xs" style={{ color: featureTextColor }}>{f}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <button
                  onClick={handleSelect}
                  className="w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
                  style={ctaStyle}
                >
                  Select Plan
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Corporate nominee note */}
      {activeTab === 'Corporate' && (
        <div className="rounded-xl p-4 mb-8 flex items-start gap-3" style={{ background: notesBg, border: notesBorder }}>
          <Users className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#60a5fa' }} />
          <div>
            <p className="text-xs mb-1" style={{ color: '#60a5fa' }}>Corporate Nominee Policy</p>
            <p className="text-xs leading-relaxed" style={{ color: subText }}>
              Entries are shared by a maximum of 5 nominated corporate personnel. The corporate would provide the names of these personnel, and HKIAL staff would verify upon booking submission.
            </p>
          </div>
        </div>
      )}

      {/* Voucher eligibility note — always visible */}
      <div className="rounded-xl p-4 mb-8 flex items-start gap-3" style={{ background: notesBg, border: notesBorder }}>
        <UserCheck className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#60a5fa' }} />
        <div>
          <p className="text-xs mb-1" style={{ color: '#60a5fa' }}>Voucher Eligibility Policy</p>
          <p className="text-xs leading-relaxed" style={{ color: subText }}>
            Complimentary booking vouchers and free Premiere Suite upgrade vouchers are exclusively for use by the{' '}
            <strong style={{ color: pageText }}>account holder and their registered spouse</strong>. These vouchers may not be applied to guest bookings, transferred to nominees, gifted, or redeemed by any third party.
          </p>
        </div>
      </div>

      {/* Other Benefits (shared, all types & tiers) */}
      <div className="rounded-2xl overflow-hidden mb-10" style={{ background: otherBenefitsBg, border: otherBenefitsBorder }}>
        <div className="px-6 py-4 border-b" style={{ borderColor: 'rgba(220,181,21,0.2)' }}>
          <p className="text-sm text-center" style={{ color: 'rgb(220,181,21)' }}>
            Other Membership Benefits — Applicable to Both Types &amp; All Tiers
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x" style={{ borderColor: 'rgba(220,181,21,0.15)' }}>
          {OTHER_BENEFITS.map((benefit) => {
            const BenefitIcon = benefit.Icon;
            return (
              <div key={benefit.label} className="px-6 py-5 flex flex-col items-center text-center gap-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-1" style={{ background: 'rgba(220,181,21,0.15)' }}>
                  <BenefitIcon className="w-4 h-4" style={{ color: 'rgb(220,181,21)' }} />
                </div>
                <p className="text-xs font-semibold" style={{ color: pageText }}>{benefit.label}</p>
                <p className="text-xs" style={{ color: subText }}>{benefit.value}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ */}
      <div className="mb-2">
        <h2 className="text-lg mb-5 text-center" style={{ color: pageText }}>Frequently Asked Questions</h2>
        <div className="space-y-3 max-w-2xl mx-auto">
          {faqItems.map((item, idx) => {
            const isOpen = openFaq === idx;
            const itemBg = isOpen ? faqOpenBg : faqBg;
            const chevronRotate = isOpen ? 'rotate(90deg)' : 'rotate(0deg)';
            const handleToggle = () => handleFaqToggle(idx);
            return (
              <div key={idx} className="rounded-xl overflow-hidden transition-all duration-200" style={{ background: itemBg, border: faqBorder }}>
                <button
                  className="w-full flex items-center justify-between px-5 py-4 text-left"
                  onClick={handleToggle}
                >
                  <span className="text-sm pr-4" style={{ color: pageText }}>{item.q}</span>
                  <ChevronRight className="w-4 h-4 shrink-0 transition-transform duration-200" style={{ color: 'rgb(220,181,21)', transform: chevronRotate }} />
                </button>
                {isOpen && (
                  <div className="px-5 pb-4">
                    <p className="text-xs leading-relaxed" style={{ color: subText }}>{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}