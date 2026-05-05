import React, { useState } from 'react';
import {
  CheckCircle,
  Crown,
  Star,
  Award,
  User,
  Building2,
  Plane,
  ArrowLeft,
  ArrowRight,
  Shield,
  Mail,
  Phone,
  CreditCard,
  Percent,
  Info,
} from 'lucide-react';
import logoImage from 'figma:asset/5314118f44483d10b69aeb99485c2f5942c726a2.png';
import { useTheme } from './ThemeContext';

interface MembershipCheckoutProps {
  formData: any;
  onConfirm: (plan: any) => void;
  onBack: () => void;
}

const PLANS: Record<string, {
  tier: string;
  icon: React.ElementType;
  gradient: string;
  annualFee: number;
  processingFee: number;
  features: string[];
  description: string;
}> = {
  Individual: {
    tier: 'Silver',
    icon: Star,
    gradient: 'from-gray-300 to-gray-500',
    annualFee: 1200,
    processingFee: 100,
    features: [
      'Access to all HKIAL lounges',
      'Standard booking window (7 days)',
      'Complimentary WiFi and refreshments',
      '5% discount on spa services',
      '1 guest pass per year',
      'Birthday bonus: 100 points',
    ],
    description: 'Perfect for frequent individual travellers seeking premium comfort.',
  },
  Corporate: {
    tier: 'Gold',
    icon: Award,
    gradient: 'from-[rgb(220,181,21)] to-[rgb(180,141,11)]',
    annualFee: 2400,
    processingFee: 150,
    features: [
      'Priority access to all lounges',
      'Extended booking window (14 days)',
      'Premium dining and beverages',
      '15% discount on spa services',
      '2 guest passes per year',
      'Birthday bonus: 250 points',
      'Fast-track security lanes',
    ],
    description: 'Designed for corporate travellers with priority benefits and team access.',
  },
  'Travel Agency': {
    tier: 'Platinum',
    icon: Crown,
    gradient: 'from-gray-400 to-gray-600',
    annualFee: 3800,
    processingFee: 200,
    features: [
      'Guaranteed lounge access',
      'Advanced booking window (30 days)',
      'À la carte dining privileges',
      '25% discount on all spa services',
      'Pre-negotiated agency rates on add-ons',
      'Direct Billing – Net 30 Terms',
      'Dedicated concierge service',
      '3 guest passes per year',
    ],
    description: 'Exclusive agency rates with direct billing and premium concierge services.',
  },
};

export function MembershipCheckout({ formData, onConfirm, onBack }: MembershipCheckoutProps) {
  const { colors, mode } = useTheme();
  const [termsAccepted, setTermsAccepted] = useState(false);
  const isDark = mode === 'dark';

  const plan = PLANS[formData.memberType] || PLANS.Individual;
  const PlanIcon = plan.icon;
  const totalAmount = plan.annualFee + plan.processingFee;

  const glassStyle: React.CSSProperties = {
    backdropFilter: 'blur(20px)',
    background: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(231, 230, 221, 0.6)',
    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(200, 199, 190, 0.6)'}`,
    boxShadow: isDark ? '0 8px 32px rgba(31, 38, 135, 0.2)' : '0 8px 32px rgba(64, 63, 52, 0.1)',
  };

  const cardStyle: React.CSSProperties = {
    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.7)',
    border: `1px solid ${isDark ? 'rgba(255,255,255,0.1)' : 'rgba(200,199,190,0.5)'}`,
    borderRadius: '12px',
  };

  const textPrimary = { color: colors.text };
  const textMuted = { color: colors.textMuted };
  const textSecondary = { color: colors.textSecondary };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start p-6 transition-colors duration-300"
      style={{ background: colors.background }}
    >
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none" style={{ opacity: colors.blobOpacity }}>
        <div className={`absolute top-0 left-0 w-96 h-96 ${isDark ? 'bg-blue-400' : 'bg-[rgb(220,181,21)]'} rounded-full mix-blend-multiply filter blur-xl animate-blob`} />
        <div className={`absolute top-0 right-0 w-96 h-96 ${isDark ? 'bg-teal-400' : 'bg-[rgb(231,230,221)]'} rounded-full mix-blend-multiply filter blur-xl`} />
        <div className={`absolute bottom-0 left-1/2 w-96 h-96 ${isDark ? 'bg-indigo-400' : 'bg-[rgb(220,181,21)]'} rounded-full mix-blend-multiply filter blur-xl`} />
      </div>

      <div className="relative z-10 w-full max-w-2xl py-8">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <img src={logoImage} alt="HKIAL Logo" style={{ height: '60px', width: 'auto' }} className="object-contain" />
          </div>
          <h1 className="text-2xl mb-1" style={textPrimary}>Hong Kong International Airport Lounge</h1>
          <p className="text-sm" style={textMuted}>Complete your membership registration</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {['Registration', 'Review & Confirm', 'Payment'].map((step, i) => {
            const stepBgOptions = ['rgba(16,185,129,0.2)', 'linear-gradient(135deg, rgb(220,181,21), rgb(180,141,11))', isDark ? 'rgba(255,255,255,0.1)' : 'rgba(200,199,190,0.4)'];
            const stepBorderBase = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(200,199,190,0.5)';
            const stepBorderOptions = ['1px solid rgba(16,185,129,0.5)', 'none', '1px solid ' + stepBorderBase];
            const stepColorOptions = ['rgb(52,211,153)', '#fff', colors.textMuted];
            const stepBg = stepBgOptions[i] || stepBgOptions[2];
            const stepBorder = stepBorderOptions[i] || stepBorderOptions[2];
            const stepColor = stepColorOptions[i] || stepColorOptions[2];
            return (
            <React.Fragment key={step}>
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
                  style={{
                    background: stepBg,
                    border: stepBorder,
                    color: stepColor,
                  }}
                >
                  {i === 0 ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className="text-xs hidden sm:block" style={i === 1 ? { color: 'rgb(220,181,21)' } : textMuted}>
                  {step}
                </span>
              </div>
              {i < 2 && (
                <div className="w-8 h-px" style={{ background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(200,199,190,0.5)' }} />
              )}
            </React.Fragment>
            );
          })}
        </div>

        {/* Main Card */}
        <div className="rounded-2xl p-6 space-y-5" style={glassStyle}>
          <h2 className="text-lg" style={textPrimary}>Review Your Membership Order</h2>

          {/* ── Personal Details ─────────────────────────────── */}
          <div className="rounded-xl p-4 space-y-3" style={cardStyle}>
            <div className="flex items-center gap-2 mb-3">
              <User className="w-4 h-4" style={{ color: 'rgb(220,181,21)' }} />
              <span className="text-sm" style={textPrimary}>Personal Details</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs mb-0.5" style={textMuted}>Full Name</p>
                <p className="text-sm" style={textPrimary}>{formData.title}. {formData.firstName} {formData.lastName}</p>
              </div>
              <div>
                <p className="text-xs mb-0.5" style={textMuted}>Member Type</p>
                <p className="text-sm" style={textPrimary}>{formData.memberType}</p>
              </div>
              <div className="flex items-start gap-1.5">
                <Mail className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={textMuted} />
                <div>
                  <p className="text-xs mb-0.5" style={textMuted}>Email</p>
                  <p className="text-sm" style={textPrimary}>{formData.email}</p>
                </div>
              </div>
              <div className="flex items-start gap-1.5">
                <Phone className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={textMuted} />
                <div>
                  <p className="text-xs mb-0.5" style={textMuted}>Contact</p>
                  <p className="text-sm" style={textPrimary}>{formData.regionCode} {formData.contactNumber}</p>
                </div>
              </div>
              {formData.companyName && (
                <div className="col-span-2 flex items-start gap-1.5">
                  <Building2 className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={textMuted} />
                  <div>
                    <p className="text-xs mb-0.5" style={textMuted}>Company</p>
                    <p className="text-sm" style={textPrimary}>{formData.companyName}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* ── Selected Plan ────────────────────────────────── */}
          <div
            className="rounded-xl overflow-hidden"
            style={{
              background: isDark
                ? 'linear-gradient(135deg, rgba(220,181,21,0.12) 0%, rgba(180,141,11,0.07) 100%)'
                : 'linear-gradient(135deg, rgba(220,181,21,0.18) 0%, rgba(180,141,11,0.1) 100%)',
              border: isDark ? '1px solid rgba(220,181,21,0.3)' : '1px solid rgba(220,181,21,0.4)',
            }}
          >
            {/* Plan header */}
            <div
              className="px-4 py-3 flex items-center gap-3"
              style={{
                background: isDark
                  ? 'linear-gradient(90deg, rgba(220,181,21,0.2) 0%, rgba(180,141,11,0.12) 100%)'
                  : 'linear-gradient(90deg, rgba(220,181,21,0.25) 0%, rgba(180,141,11,0.15) 100%)',
                borderBottom: isDark ? '1px solid rgba(220,181,21,0.2)' : '1px solid rgba(220,181,21,0.3)',
              }}
            >
              <div
                className={`w-10 h-10 rounded-xl bg-gradient-to-br ${plan.gradient} flex items-center justify-center flex-shrink-0`}
              >
                <PlanIcon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-sm" style={textPrimary}>
                  {formData.memberType} Membership – {plan.tier} Tier
                </div>
                <div className="text-xs mt-0.5" style={textMuted}>{plan.description}</div>
              </div>
              <div
                className="px-3 py-1 rounded-full text-xs"
                style={{
                  background: isDark ? 'rgba(220,181,21,0.2)' : 'rgba(220,181,21,0.25)',
                  border: isDark ? '1px solid rgba(220,181,21,0.4)' : '1px solid rgba(220,181,21,0.5)',
                  color: 'rgb(180,141,11)',
                }}
              >
                {plan.tier}
              </div>
            </div>
            {/* Features */}
            <div className="px-4 py-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs" style={textSecondary}>
                    <CheckCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: 'rgb(16,185,129)' }} />
                    {feature}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Order Summary ────────────────────────────────── */}
          <div className="rounded-xl p-4" style={cardStyle}>
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4" style={{ color: 'rgb(220,181,21)' }} />
              <span className="text-sm" style={textPrimary}>Order Summary</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs" style={textMuted}>
                  Annual Membership Fee ({plan.tier})
                </span>
                <span className="text-sm" style={textPrimary}>HK${plan.annualFee.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs" style={textMuted}>Processing Fee</span>
                <span className="text-sm" style={textPrimary}>HK${plan.processingFee.toLocaleString()}</span>
              </div>
              <div
                className="flex items-center justify-between pt-3 mt-1"
                style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(200,199,190,0.5)' }}
              >
                <span className="text-sm" style={textPrimary}>Total (1 year)</span>
                <span
                  className="text-lg"
                  style={{
                    background: 'linear-gradient(90deg, rgb(220,181,21), rgb(180,141,11))',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text',
                  }}
                >
                  HK${totalAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* ── Info Note ────────────────────────────────────── */}
          <div
            className="rounded-xl px-4 py-3 flex items-start gap-2.5"
            style={{
              background: isDark ? 'rgba(59,130,246,0.1)' : 'rgba(59,130,246,0.08)',
              border: isDark ? '1px solid rgba(59,130,246,0.25)' : '1px solid rgba(59,130,246,0.3)',
            }}
          >
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5 text-blue-400" />
            <p className="text-xs" style={textMuted}>
              Your membership will be valid for <strong style={textSecondary}>12 months</strong> from the activation date. Renewal reminders will be sent 30 days before expiry.
            </p>
          </div>

          {/* ── Terms Checkbox ───────────────────────────────── */}
          <label className="flex items-start gap-3 cursor-pointer group">
            <div
              className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 mt-0.5 transition-all"
              style={{
                background: termsAccepted
                  ? 'linear-gradient(135deg, rgb(220,181,21), rgb(180,141,11))'
                  : isDark ? 'rgba(255,255,255,0.08)' : 'rgba(231,230,221,0.7)',
                border: termsAccepted
                  ? 'none'
                  : isDark ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(200,199,190,0.6)',
              }}
              onClick={() => setTermsAccepted(!termsAccepted)}
            >
              {termsAccepted && <CheckCircle className="w-3.5 h-3.5 text-white" />}
            </div>
            <span className="text-xs" style={textMuted}>
              I agree to the{' '}
              <span style={{ color: 'rgb(220,181,21)', cursor: 'pointer' }}>Terms & Conditions</span>
              {' '}and{' '}
              <span style={{ color: 'rgb(220,181,21)', cursor: 'pointer' }}>Privacy Policy</span>
              {' '}of Hong Kong International Airport Lounge Membership Programme.
            </span>
          </label>

          {/* ── Action Buttons ───────────────────────────────── */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={onBack}
              className="py-3 px-5 rounded-xl text-sm transition-all hover:opacity-80 flex items-center justify-center gap-2"
              style={{
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(231,230,221,0.5)',
                border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(200,199,190,0.5)',
                color: colors.text,
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              type="button"
              disabled={!termsAccepted}
              onClick={() => onConfirm({ ...plan, memberType: formData.memberType, totalAmount })}
              className="py-3 px-5 rounded-xl text-white text-sm transition-all flex items-center justify-center gap-2"
              style={{
                background: termsAccepted
                  ? 'linear-gradient(90deg, rgb(220,181,21), rgb(180,141,11))'
                  : isDark ? 'rgba(255,255,255,0.1)' : 'rgba(200,199,190,0.4)',
                color: termsAccepted ? '#fff' : colors.textMuted,
                cursor: termsAccepted ? 'pointer' : 'not-allowed',
                opacity: termsAccepted ? 1 : 0.6,
              }}
            >
              Proceed to Payment
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <p className="text-center text-xs mt-4" style={textMuted}>
          <Shield className="w-3 h-3 inline mr-1" />
          Secure & encrypted membership registration
        </p>
      </div>

      <style>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
      `}</style>
    </div>
  );
}