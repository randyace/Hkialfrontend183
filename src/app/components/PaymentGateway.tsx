import React, { useState } from 'react';
import {
  CreditCard,
  Lock,
  CheckCircle,
  ArrowLeft,
  Zap,
  Shield,
  Building2,
  RefreshCw,
  Star,
  Award,
  Crown,
  AlertCircle,
} from 'lucide-react';
import logoImage from 'figma:asset/5314118f44483d10b69aeb99485c2f5942c726a2.png';
import { useTheme } from './ThemeContext';

interface PaymentGatewayProps {
  formData: any;
  plan: any;
  onPaymentComplete: () => void;
  onBack: () => void;
}

const PLAN_ICONS: Record<string, React.ElementType> = {
  Silver: Star,
  Gold: Award,
  Platinum: Crown,
};

function formatCardNumber(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 16);
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

function formatExpiry(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  if (digits.length >= 3) {
    return digits.slice(0, 2) + '/' + digits.slice(2);
  }
  return digits;
}

export function PaymentGateway({ formData, plan, onPaymentComplete, onBack }: PaymentGatewayProps) {
  const { colors, mode } = useTheme();
  const isDark = mode === 'dark';

  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'fps'>('card');

  const PlanIcon = PLAN_ICONS[plan?.tier] || Star;

  const glassStyle: React.CSSProperties = {
    backdropFilter: 'blur(20px)',
    background: isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(231, 230, 221, 0.6)',
    border: `1px solid ${isDark ? 'rgba(255, 255, 255, 0.12)' : 'rgba(200, 199, 190, 0.6)'}`,
    boxShadow: isDark ? '0 8px 32px rgba(31, 38, 135, 0.2)' : '0 8px 32px rgba(64, 63, 52, 0.1)',
  };

  const inputStyle: React.CSSProperties = {
    background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.9)',
    border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(200,199,190,0.6)',
    color: colors.text,
    borderRadius: '10px',
    width: '100%',
    padding: '10px 14px',
    fontSize: '14px',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '11px',
    marginBottom: '6px',
    color: colors.textMuted,
  };

  const textPrimary = { color: colors.text };
  const textMuted = { color: colors.textMuted };
  const textSecondary = { color: colors.textSecondary };

  const handleQuickFill = () => {
    setCardNumber('4242 4242 4242 4242');
    setCardName(`${formData?.title || 'Mr'}. ${formData?.firstName || 'John'} ${formData?.lastName || 'Doe'}`);
    setExpiry('12/28');
    setCvv('123');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setProcessing(true);
    setTimeout(() => {
      setProcessing(false);
      setSuccess(true);
      setTimeout(() => {
        onPaymentComplete();
      }, 2500);
    }, 2200);
  };

  // ── Success Screen ───────────────────────────────────────────────────────
  if (success) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6 transition-colors duration-300"
        style={{ background: colors.background }}
      >
        <div className="relative z-10 w-full max-w-md text-center">
          <div className="rounded-2xl p-10" style={glassStyle}>
            {/* Animated checkmark */}
            <div
              className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgb(16,185,129,0.2), rgb(5,150,105,0.15))',
                border: '2px solid rgba(16,185,129,0.5)',
                boxShadow: '0 0 30px rgba(16,185,129,0.3)',
              }}
            >
              <CheckCircle className="w-12 h-12" style={{ color: 'rgb(52,211,153)' }} />
            </div>
            <h2 className="text-2xl mb-2" style={textPrimary}>Payment Successful!</h2>
            <p className="text-sm mb-4" style={textMuted}>
              Welcome to HKIAL Membership! Your{' '}
              <strong style={textSecondary}>{plan?.tier || 'Silver'} tier</strong> membership is now active.
            </p>
            <div
              className="rounded-xl px-4 py-3 mb-5 text-left space-y-1.5"
              style={{
                background: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.12)',
                border: isDark ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(16,185,129,0.4)',
              }}
            >
              <div className="flex justify-between text-xs">
                <span style={textMuted}>Amount Paid</span>
                <span style={{ color: 'rgb(52,211,153)' }}>HK${plan?.totalAmount?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={textMuted}>Membership Tier</span>
                <span style={textSecondary}>{plan?.tier}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span style={textMuted}>Transaction Ref</span>
                <span style={textSecondary}>HKIAL-{Math.random().toString(36).slice(2, 10).toUpperCase()}</span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 text-xs" style={textMuted}>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              Redirecting to your dashboard…
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Processing Screen ────────────────────────────────────────────────────
  if (processing) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-6 transition-colors duration-300"
        style={{ background: colors.background }}
      >
        <div className="relative z-10 w-full max-w-sm text-center">
          <div className="rounded-2xl p-10" style={glassStyle}>
            <div
              className="w-20 h-20 mx-auto mb-6 rounded-full flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(220,181,21,0.2), rgba(180,141,11,0.1))',
                border: '2px solid rgba(220,181,21,0.4)',
              }}
            >
              <RefreshCw className="w-10 h-10 animate-spin" style={{ color: 'rgb(220,181,21)' }} />
            </div>
            <h2 className="text-xl mb-2" style={textPrimary}>Processing Payment</h2>
            <p className="text-sm" style={textMuted}>Please wait while we securely process your payment…</p>
            <div className="mt-6 h-1.5 rounded-full overflow-hidden" style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(200,199,190,0.4)' }}>
              <div
                className="h-full rounded-full"
                style={{
                  background: 'linear-gradient(90deg, rgb(220,181,21), rgb(180,141,11))',
                  animation: 'paymentProgress 2.2s ease-in-out forwards',
                }}
              />
            </div>
          </div>
        </div>
        <style>{`
          @keyframes paymentProgress {
            0% { width: 0%; }
            100% { width: 100%; }
          }
        `}</style>
      </div>
    );
  }

  // ── Payment Form ─────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen flex flex-col items-center justify-start p-6 transition-colors duration-300"
      style={{ background: colors.background }}
    >
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none" style={{ opacity: colors.blobOpacity }}>
        <div className={`absolute top-0 left-0 w-96 h-96 ${isDark ? 'bg-blue-400' : 'bg-[rgb(220,181,21)]'} rounded-full mix-blend-multiply filter blur-xl`} />
        <div className={`absolute bottom-0 right-0 w-96 h-96 ${isDark ? 'bg-teal-400' : 'bg-[rgb(231,230,221)]'} rounded-full mix-blend-multiply filter blur-xl`} />
      </div>

      <div className="relative z-10 w-full max-w-2xl py-8">
        {/* Logo */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <img src={logoImage} alt="HKIAL Logo" style={{ height: '60px', width: 'auto' }} className="object-contain" />
          </div>
          <h1 className="text-2xl mb-1" style={textPrimary}>Secure Payment</h1>
          <p className="text-sm" style={textMuted}>Your payment is protected with 256-bit SSL encryption</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {['Registration', 'Review & Confirm', 'Payment'].map((step, i) => (
            <React.Fragment key={step}>
              <div className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
                  style={{
                    background: i < 2
                      ? 'rgba(16,185,129,0.2)'
                      : 'linear-gradient(135deg, rgb(220,181,21), rgb(180,141,11))',
                    border: i < 2
                      ? '1px solid rgba(16,185,129,0.5)'
                      : 'none',
                    color: i < 2 ? 'rgb(52,211,153)' : '#fff',
                  }}
                >
                  {i < 2 ? <CheckCircle className="w-4 h-4" /> : i + 1}
                </div>
                <span className="text-xs hidden sm:block" style={i === 2 ? { color: 'rgb(220,181,21)' } : { color: 'rgb(52,211,153)' }}>
                  {step}
                </span>
              </div>
              {i < 2 && (
                <div className="w-8 h-px" style={{ background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(200,199,190,0.5)' }} />
              )}
            </React.Fragment>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {/* ── Payment Form ─────────────────────────────── */}
          <div className="lg:col-span-3 rounded-2xl p-6" style={glassStyle}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base" style={textPrimary}>Payment Details</h2>
              {/* Quick Fill */}
              <button
                type="button"
                onClick={handleQuickFill}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all hover:opacity-80"
                style={{
                  background: isDark ? 'rgba(234,179,8,0.15)' : 'rgba(234,179,8,0.2)',
                  border: isDark ? '1px solid rgba(234,179,8,0.35)' : '1px solid rgba(234,179,8,0.45)',
                  color: isDark ? '#fbbf24' : 'rgb(180,140,10)',
                }}
              >
                <Zap className="w-3 h-3" />
                Demo Fill
              </button>
            </div>

            {/* Payment Method Tabs */}
            <div
              className="flex gap-2 mb-5 p-1 rounded-xl"
              style={{
                background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(231,230,221,0.5)',
                border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(200,199,190,0.4)',
              }}
            >
              {[
                { key: 'card', label: 'Credit / Debit Card', icon: CreditCard },
                { key: 'fps', label: 'FPS / Bank Transfer', icon: Building2 },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setPaymentMethod(key as 'card' | 'fps')}
                  className="flex-1 py-2.5 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all"
                  style={{
                    background: paymentMethod === key
                      ? 'linear-gradient(135deg, rgb(220,181,21), rgb(180,141,11))'
                      : 'transparent',
                    color: paymentMethod === key ? '#fff' : colors.textMuted,
                  }}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {label}
                </button>
              ))}
            </div>

            {paymentMethod === 'card' ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Card Number */}
                <div>
                  <label style={labelStyle}>Card Number</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      style={{ ...inputStyle, paddingLeft: '42px' }}
                      required
                    />
                    <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={textMuted} />
                  </div>
                </div>

                {/* Card Name */}
                <div>
                  <label style={labelStyle}>Cardholder Name</label>
                  <input
                    type="text"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    placeholder="Name as shown on card"
                    style={inputStyle}
                    required
                  />
                </div>

                {/* Expiry + CVV */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label style={labelStyle}>Expiry Date</label>
                    <input
                      type="text"
                      value={expiry}
                      onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                      placeholder="MM/YY"
                      maxLength={5}
                      style={inputStyle}
                      required
                    />
                  </div>
                  <div>
                    <label style={labelStyle}>CVV / CVC</label>
                    <div className="relative">
                      <input
                        type="password"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        placeholder="•••"
                        maxLength={4}
                        style={{ ...inputStyle, paddingRight: '42px' }}
                        required
                      />
                      <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={textMuted} />
                    </div>
                  </div>
                </div>

                {/* Security note */}
                <div
                  className="flex items-center gap-2 rounded-lg px-3 py-2.5"
                  style={{
                    background: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.1)',
                    border: isDark ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(16,185,129,0.3)',
                  }}
                >
                  <Shield className="w-3.5 h-3.5 flex-shrink-0 text-green-400" />
                  <span className="text-xs" style={{ color: isDark ? 'rgb(110,231,183)' : 'rgb(5,150,105)' }}>
                    Your card details are encrypted and never stored
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 rounded-xl text-white text-sm transition-all hover:opacity-90 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(90deg, rgb(220,181,21), rgb(180,141,11))' }}
                >
                  <Lock className="w-4 h-4" />
                  Pay HK${plan?.totalAmount?.toLocaleString()} Securely
                </button>
              </form>
            ) : (
              /* FPS / Bank Transfer panel */
              <div className="space-y-4">
                <div
                  className="rounded-xl p-5 text-center"
                  style={{
                    background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.7)',
                    border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(200,199,190,0.5)',
                  }}
                >
                  {/* Mock QR code placeholder */}
                  <div
                    className="w-40 h-40 mx-auto mb-3 rounded-xl flex items-center justify-center"
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(231,230,221,0.6)',
                      border: '2px dashed rgba(220,181,21,0.5)',
                    }}
                  >
                    <div className="text-center">
                      <div className="grid grid-cols-5 gap-0.5 mb-1">
                        {Array.from({ length: 25 }).map((_, i) => {
                          const qrPixelIndices = [0,1,2,3,4,5,9,10,14,15,19,20,21,22,23,24,7,11,12,17];
                          const qrPixelBg = qrPixelIndices.includes(i)
                            ? (isDark ? 'rgba(255,255,255,0.7)' : 'rgba(64,63,52,0.8)')
                            : 'transparent';
                          return (
                          <div
                            key={i}
                            className="w-5 h-5 rounded-sm"
                            style={{ background: qrPixelBg }}
                          />
                          );
                        })}
                      </div>
                      <p className="text-xs mt-2" style={textMuted}>FPS QR Code</p>
                    </div>
                  </div>
                  <p className="text-sm mb-1" style={textPrimary}>Scan to pay via FPS</p>
                  <p className="text-xs" style={textMuted}>Amount: <strong style={textSecondary}>HK${plan?.totalAmount?.toLocaleString()}</strong></p>
                </div>
                <div className="space-y-2 text-xs" style={textMuted}>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-yellow-400" />
                    After transfer, email your receipt to{' '}
                    <strong style={textSecondary}>membership@hkial.com.hk</strong>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 text-yellow-400" />
                    Include your registration email as reference
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onPaymentComplete}
                  className="w-full py-3.5 rounded-xl text-white text-sm transition-all hover:opacity-90 flex items-center justify-center gap-2"
                  style={{ background: 'linear-gradient(90deg, rgb(220,181,21), rgb(180,141,11))' }}
                >
                  <CheckCircle className="w-4 h-4" />
                  I've Completed the Transfer
                </button>
              </div>
            )}
          </div>

          {/* ── Order Summary Sidebar ──────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            {/* Plan summary */}
            <div className="rounded-2xl p-4" style={glassStyle}>
              <h3 className="text-sm mb-3" style={textPrimary}>Order Summary</h3>
              <div className="flex items-center gap-3 mb-4 pb-3" style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(200,199,190,0.4)' }}>
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br ${plan?.gradient || 'from-gray-300 to-gray-500'}`}
                >
                  <PlanIcon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs" style={textPrimary}>{plan?.memberType} Membership</p>
                  <p className="text-xs mt-0.5" style={textMuted}>{plan?.tier} Tier · 12 months</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span style={textMuted}>Annual Fee</span>
                  <span style={textPrimary}>HK${plan?.annualFee?.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={textMuted}>Processing Fee</span>
                  <span style={textPrimary}>HK${plan?.processingFee?.toLocaleString()}</span>
                </div>
                <div
                  className="flex justify-between text-sm pt-2"
                  style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(200,199,190,0.4)' }}
                >
                  <span style={textPrimary}>Total</span>
                  <span style={{ color: 'rgb(220,181,21)' }}>HK${plan?.totalAmount?.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Member info */}
            <div className="rounded-2xl p-4" style={glassStyle}>
              <h3 className="text-xs mb-2" style={textMuted}>Registering As</h3>
              <p className="text-sm" style={textPrimary}>
                {formData?.title}. {formData?.firstName} {formData?.lastName}
              </p>
              <p className="text-xs mt-0.5" style={textMuted}>{formData?.email}</p>
            </div>

            {/* Back button */}
            <button
              type="button"
              onClick={onBack}
              className="w-full py-2.5 px-4 rounded-xl text-sm transition-all hover:opacity-80 flex items-center justify-center gap-2"
              style={{
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(231,230,221,0.5)',
                border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(200,199,190,0.5)',
                color: colors.text,
              }}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Review
            </button>
          </div>
        </div>

        <p className="text-center text-xs mt-6" style={textMuted}>
          <Lock className="w-3 h-3 inline mr-1" />
          256-bit SSL encrypted · PCI DSS compliant · Demo mode — no real charges
        </p>
      </div>
    </div>
  );
}