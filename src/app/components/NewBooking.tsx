import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  Calendar,
  Users,
  Plane,
  Building,
  Building2,
  Hash,
  User,
  Cake,
  Zap,
  ChevronDown,
  Plus,
  Minus,
  CheckCircle,
  Clock,
  Car,
  MapPin,
  Phone,
  Mail,
  Tag,
  Package,
  FileText,
  ArrowLeft,
  ArrowRight,
  Accessibility,
  Hotel,
  Info,
  Shield,
  CreditCard,
  Banknote,
  Percent,
  BadgeCheck,
  Camera,
  X,
  ScanLine,
  History,
  ChevronRight,
  Crown,
  CalendarPlus,
} from 'lucide-react';
import { useTheme } from './ThemeContext';

// ── Travel Agency pre-negotiated rates ───────────────────────────────────────
const TA_DISCOUNT_LOUNGE     = 0.15; // 15% off lounge extension
const TA_DISCOUNT_LIMO       = 0.20; // 20% off limousine service
const TA_DISCOUNT_WHEELCHAIR = 0.10; // 10% off wheelchair assistance
const TA_PAYMENT_METHOD      = 'Direct Billing – Net 30 Terms';
const TA_AGENCY_CODE         = 'GTA-HK-001';

// ── Valid & Used Promotion Codes ──────────────────────────────────────────────
const VALID_PROMO_CODES = ['HKIAL2024', 'SUMMER2024', 'VIP10OFF', 'WELCOME2024'];
const USED_PROMO_CODES = ['EXPIRED2023', 'USED123'];

interface MemberData {
  name: string;
  memberType: string;
  companyName?: string;
  creditBalance?: number;
  voucherCount?: number;
}

interface BookForMemberData {
  title: string;
  firstName: string;
  lastName: string;
  passportPrefix: string;
  voucherCount: number;
  membershipLabel: string;
}

interface NewBookingProps {
  setActiveTab?: (tab: string) => void;
  memberData: MemberData;
  prefillMember?: BookForMemberData | null;
  // Container-provided submission handlers
  // onSubmit receives the view's complete internal form state so container can build the API payload
  // formData includes: { form, step2Form, vipData, nonFlyingGuestData, memberData, flightDetails }
  // flightDetails is the looked-up origin/destination from the flight
  // database (e.g. { origin: 'Hong Kong (HKG)', destination: 'London
  // Heathrow (LHR)' }). Optional because the figma code base's onSubmit
  // signature doesn't include it; the parent's container ignores it
  // when not provided.
  onSubmit?: (formData: {
    form: Record<string, unknown>;
    step2Form: Record<string, unknown>;
    vipData: Array<Record<string, unknown>>;
    nonFlyingGuestData: Array<Record<string, unknown>>;
    memberData: { name: string; memberType: string };
    flightDetails?: { origin?: string; destination?: string } | null;
  }) => void;
  isSubmitting?: boolean;
  error?: string;
  successRef?: string;
}

interface VipPassenger {
  vipTitle: string;
  vipFirstName: string;
  vipLastName: string;
  vipTravelDocNo: string;
  vipMembershipNo: string;
  vipAgeGroup: string;
  vipBirthday: string;
  foodAllergies: string;
}

interface NonFlyingGuest {
  guestTitle: string;
  guestFirstName: string;
  guestLastName: string;
  guestAgeGroup: string;
  foodAllergies: string;
}

const flightDatabase: { [key: string]: { origin: string; destination: string; arrivalTime: string } } = {
  'CX888': { origin: 'Hong Kong (HKG)', destination: 'London Heathrow (LHR)', arrivalTime: '06:30' },
  'CX250': { origin: 'Tokyo Narita (NRT)', destination: 'Hong Kong (HKG)', arrivalTime: '14:15' },
  'CX505': { origin: 'Singapore (SIN)', destination: 'Hong Kong (HKG)', arrivalTime: '21:45' },
  'CX270': { origin: 'Seoul Incheon (ICN)', destination: 'Hong Kong (HKG)', arrivalTime: '08:30' },
  'CX251': { origin: 'New York JFK (JFK)', destination: 'Hong Kong (HKG)', arrivalTime: '07:00' },
  'CX872': { origin: 'San Francisco (SFO)', destination: 'Hong Kong (HKG)', arrivalTime: '16:25' },
  'CX420': { origin: 'Bangkok (BKK)', destination: 'Hong Kong (HKG)', arrivalTime: '19:10' },
  'CX715': { origin: 'Sydney (SYD)', destination: 'Hong Kong (HKG)', arrivalTime: '05:45' },
};

const companyDatabase: { [key: string]: string } = {
  'TECH2024': 'Tech Corporation Ltd',
  'GTA2024': 'Global Travel Agency',
  'CATHAY01': 'Cathay Pacific Airways',
  'HSBC2024': 'HSBC Bank',
  'SWIRE01': 'Swire Group',
  'CKH2024': 'CK Hutchison Holdings',
  'PCCW01': 'PCCW Limited',
  'MTR2024': 'MTR Corporation',
};

// ── Theme-aware style hook ───────────────────────────────────────────────────
function useThemedStyles() {
  const { mode, colors } = useTheme();
  const isDark = mode === 'dark';

  const card: React.CSSProperties = {
    background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(231, 230, 221, 0.7)',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(200, 199, 190, 0.6)',
    borderRadius: '12px',
  };

  const fieldStyle: React.CSSProperties = {
    background: isDark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.9)',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(200, 199, 190, 0.7)',
    color: colors.inputText,
  };

  const fieldClass = `w-full px-4 py-3 rounded-lg text-sm focus:outline-none transition-all focus:ring-1 ${
    isDark
      ? 'placeholder-gray-500 focus:ring-purple-500/40'
      : 'placeholder-[rgb(160,159,148)] focus:ring-[rgba(220,181,21,0.4)]'
  }`;

  const labelClass = `block text-xs mb-1.5 ${isDark ? 'text-gray-400' : 'text-[rgb(130,129,118)]'}`;
  const labelStyle: React.CSSProperties = { color: colors.textMuted };

  const textPrimary: React.CSSProperties = { color: colors.text };
  const textSecondary: React.CSSProperties = { color: colors.textSecondary };
  const textMuted: React.CSSProperties = { color: colors.textMuted };

  const stepperCardBg: React.CSSProperties = {
    background: isDark ? 'rgba(0,0,0,0.25)' : '#FFFFFF',
    border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(200,199,190,0.5)',
  };

  const stepperBtnStyle: React.CSSProperties = {
    background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(231,230,221,0.4)',
    border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(200,199,190,0.5)',
  };

  const stepperIconColor: React.CSSProperties = {
    color: isDark ? colors.textSecondary : colors.text,
  };

  const reviewSectionBg: React.CSSProperties = {
    background: isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(231, 230, 221, 0.5)',
    border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(200,199,190,0.5)',
  };

  const reviewHeaderBg: React.CSSProperties = {
    background: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(231,230,221,0.3)',
  };

  const addonItemBg: React.CSSProperties = {
    background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(231,230,221,0.4)',
    border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(200,199,190,0.4)',
  };

  const summaryBoxBg: React.CSSProperties = {
    background: isDark ? 'rgba(20, 10, 50, 0.85)' : 'rgba(231, 230, 221, 0.7)',
    border: isDark ? '1px solid rgba(220, 181, 21, 0.3)' : '1px solid rgba(200, 199, 190, 0.5)',
  };

  const summaryPurpleBg: React.CSSProperties = {
    background: isDark ? 'rgba(30, 10, 60, 0.7)' : 'rgba(231, 230, 221, 0.6)',
    border: isDark ? '1px solid rgba(124, 58, 237, 0.35)' : '1px solid rgba(200, 199, 190, 0.5)',
  };

  const addonTotalBg: React.CSSProperties = {
    background: isDark
      ? 'linear-gradient(90deg, rgba(124,58,237,0.2) 0%, rgba(13,148,136,0.2) 100%)'
      : 'linear-gradient(90deg, rgba(220,181,21,0.15) 0%, rgba(180,140,10,0.1) 100%)',
    border: isDark ? '1px solid rgba(124,58,237,0.3)' : '1px solid rgba(200,199,190,0.5)',
  };

  const dividerClass = isDark ? 'divide-white/[0.06]' : 'divide-[rgba(200,199,190,0.3)]';
  const borderSubtle = isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(200,199,190,0.3)';
  const borderMedium = isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(200,199,190,0.4)';
  const borderDivider = isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(200,199,190,0.4)';

  const secondaryBtnStyle: React.CSSProperties = {
    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(231,230,221,0.5)',
    border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(200,199,190,0.5)',
  };

  const optionBg = isDark ? 'bg-gray-900' : 'bg-white';

  // Back / secondary navigation button style (Step 2 & 3)
  const backBtnStyle: React.CSSProperties = {
    background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(231,230,221,0.5)',
    border: isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(200,199,190,0.5)',
    color: colors.text,
  };

  // Final summary box (gold-accent) used in Step 3 review
  const summaryBoxGoldBg: React.CSSProperties = {
    background: isDark ? 'rgba(20, 10, 50, 0.85)' : 'rgba(231, 230, 221, 0.7)',
    border: isDark ? '1px solid rgba(220, 181, 21, 0.3)' : '1px solid rgba(200, 199, 190, 0.5)',
  };

  const summaryBoxGoldHeaderBg: React.CSSProperties = {
    background: isDark
      ? 'linear-gradient(90deg, rgba(220,181,21,0.25) 0%, rgba(180,140,10,0.15) 100%)'
      : 'linear-gradient(90deg, rgba(220,181,21,0.2) 0%, rgba(180,140,10,0.1) 100%)',
    borderBottom: borderMedium,
  };

  // Total guests badge inside summary
  const guestBadgeBg: React.CSSProperties = {
    background: isDark
      ? 'linear-gradient(135deg, rgba(209, 175, 125, 0.35) 0%, rgba(167, 139, 100, 0.35) 100%)'
      : 'linear-gradient(135deg, rgba(220, 181, 21, 0.25) 0%, rgba(180, 140, 10, 0.2) 100%)',
    border: isDark ? '1px solid rgba(209, 175, 125, 0.4)' : '1px solid rgba(220, 181, 21, 0.35)',
  };

  // TA info box (green tint) for discount cards
  const taInfoBoxBg: React.CSSProperties = {
    background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(231,230,221,0.4)',
    border: isDark ? '1px solid rgba(16,185,129,0.15)' : '1px solid rgba(200,199,190,0.4)',
  };

  // Credit terms box
  const creditTermsBoxBg: React.CSSProperties = {
    background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(231,230,221,0.4)',
    border: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(200,199,190,0.4)',
  };

  // Price breakdown total row (Step 2 summary)
  const priceBreakdownTotalBg: React.CSSProperties = {
    background: isDark
      ? 'linear-gradient(90deg, rgba(124,58,237,0.15) 0%, rgba(13,148,136,0.15) 100%)'
      : 'linear-gradient(90deg, rgba(220,181,21,0.12) 0%, rgba(180,140,10,0.08) 100%)',
  };

  // Icon color for input field decorative icons
  const iconMutedClass = isDark ? 'text-gray-400' : 'text-[rgb(160,159,148)]';
  const iconMutedStyle: React.CSSProperties = { color: colors.textMuted };

  return {
    isDark, colors, card, fieldStyle, fieldClass, labelClass, labelStyle,
    textPrimary, textSecondary, textMuted, stepperCardBg, stepperBtnStyle, stepperIconColor,
    reviewSectionBg, reviewHeaderBg, secondaryBtnStyle, optionBg,
    addonItemBg, summaryBoxBg, summaryPurpleBg, addonTotalBg,
    dividerClass, borderSubtle, borderMedium, borderDivider,
    backBtnStyle, summaryBoxGoldBg, summaryBoxGoldHeaderBg, guestBadgeBg,
    taInfoBoxBg, creditTermsBoxBg, priceBreakdownTotalBg, iconMutedClass,
    iconMutedStyle,
  };
}

// ── Sub-components ───────────────────────────────────────────────────────────

function QuickFillBtn({ onClick }: { onClick: () => void }) {
  const { isDark } = useThemedStyles();
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all hover:opacity-80 whitespace-nowrap"
      style={{
        background: isDark ? 'rgba(234, 179, 8, 0.18)' : 'rgba(234, 179, 8, 0.25)',
        border: isDark ? '1px solid rgba(234, 179, 8, 0.4)' : '1px solid rgba(234, 179, 8, 0.5)',
        color: isDark ? '#fbbf24' : 'rgb(180, 140, 10)',
      }}
    >
      <Zap className="w-3 h-3" />
      Quick Fill (Demo only)
    </button>
  );
}

function SectionHeader({
  title,
  subtitle,
  onQuickFill,
}: {
  title: string;
  subtitle?: string;
  onQuickFill: () => void;
}) {
  const { textPrimary, textMuted } = useThemedStyles();
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div>
        <div className="text-sm" style={textPrimary}>{title}</div>
        {subtitle && <div className="text-xs mt-0.5" style={textMuted}>{subtitle}</div>}
      </div>
      <QuickFillBtn onClick={onQuickFill} />
    </div>
  );
}

function SubSectionLabel({ label }: { label: string }) {
  const { textMuted } = useThemedStyles();
  return (
    <div className="text-xs mb-2 mt-4" style={textMuted}>{label}</div>
  );
}

function StepperCard({
  icon,
  iconBg,
  title,
  subtitle,
  value,
  onDecrement,
  onIncrement,
  incrementDisabled,
  helperText,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  value: number;
  onDecrement: () => void;
  onIncrement: () => void;
  incrementDisabled?: boolean;
  helperText?: string;
}) {
  const { isDark, textPrimary, textMuted, stepperCardBg, stepperBtnStyle, stepperIconColor } = useThemedStyles();
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={stepperCardBg}
    >
      {/* Card label row */}
      <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(200,199,190,0.3)' }}>
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm" style={textPrimary}>{title}</div>
          <div className="text-xs" style={textMuted}>{subtitle}</div>
        </div>
      </div>
      {/* Stepper row */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <button
          type="button"
          onClick={onDecrement}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
          style={stepperBtnStyle}
        >
          <Minus className="w-3 h-3" style={stepperIconColor} />
        </button>
        <span className="text-xl tabular-nums" style={textPrimary}>{value}</span>
        <button
          type="button"
          onClick={onIncrement}
          disabled={incrementDisabled}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
          style={stepperBtnStyle}
        >
          <Plus className="w-3 h-3" style={stepperIconColor} />
        </button>
      </div>
      {/* Helper text */}
      {helperText && (
        <div className="px-4 pb-2.5 pt-0">
          <div className="text-xs" style={textMuted}>{helperText}</div>
        </div>
      )}
    </div>
  );
}

function ToggleCard({
  icon,
  iconBg,
  title,
  subtitle,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  const { textPrimary, textMuted, stepperCardBg } = useThemedStyles();
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={stepperCardBg}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm" style={textPrimary}>{title}</div>
            <div className="text-xs" style={textMuted}>{subtitle}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {checked && <span className="text-sm" style={textPrimary}>Yes</span>}
          <button
            type="button"
            onClick={() => onChange(!checked)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 ${
              checked ? 'bg-blue-500' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                checked ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  const { textPrimary, textMuted } = useThemedStyles();
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs" style={textMuted}>{label}</span>
      <span className="text-xs text-right ml-4" style={textPrimary}>{value}</span>
    </div>
  );
}

// ── Review helpers ─────────���────────────────���─────────���───────────────────────

function ReviewSection({
  icon,
  iconBg,
  title,
  children,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  children: React.ReactNode;
}) {
  const { isDark, textPrimary, reviewSectionBg, reviewHeaderBg } = useThemedStyles();
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={reviewSectionBg}
    >
      <div
        className="flex items-center gap-3 px-5 py-3.5"
        style={{ ...reviewHeaderBg, borderBottom: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(200,199,190,0.3)' }}
      >
        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}
        >
          {icon}
        </div>
        <span className="text-sm" style={textPrimary}>{title}</span>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

function ReviewGrid({ children, cols = 2 }: { children: React.ReactNode; cols?: number }) {
  return (
    <div
      className={`grid grid-cols-1 ${
        cols === 3 ? 'md:grid-cols-3' : 'md:grid-cols-2'
      } gap-x-8 gap-y-4`}
    >
      {children}
    </div>
  );
}

function ReviewField({ label, value }: { label: string; value: React.ReactNode }) {
  const { textPrimary, textMuted } = useThemedStyles();
  return (
    <div>
      <div className="text-xs mb-0.5" style={textMuted}>{label}</div>
      <div className="text-sm" style={textPrimary}>{value || '—'}</div>
    </div>
  );
}

// ── QR Scanner Modal ─────────────────────────────────────────────────────────
function QRScannerModal({
  onDetected,
  onClose,
}: {
  onDetected: (code: string) => void;
  onClose: () => void;
}) {
  const { isDark, colors, textMuted } = useThemedStyles();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const [camError, setCamError] = useState('');
  const [scanning, setScanning] = useState(false);
  const [detected, setDetected] = useState('');

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  useEffect(() => {
    let active = true;
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' },
        });
        if (!active) { stream.getTracks().forEach((t) => t.stop()); return; }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          setScanning(true);
        }
      } catch {
        setCamError('Unable to access the camera. Please allow camera permission and try again.');
      }
    };
    startCamera();
    return () => { active = false; stopCamera(); };
  }, [stopCamera]);

  useEffect(() => {
    if (!scanning) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let jsQR: any = null;
    let cancelled = false;

    const scanFrame = () => {
      if (cancelled) return;
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || !jsQR) return;
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });
          if (code && code.data) {
            setDetected(code.data);
            stopCamera();
            setTimeout(() => onDetected(code.data), 700);
            return;
          }
        }
      }
      rafRef.current = requestAnimationFrame(scanFrame);
    };

    import('jsqr').then((mod) => {
      if (cancelled) return;
      jsQR = mod.default;
      scanFrame();
    }).catch(() => setCamError('QR scanner library could not be loaded.'));

    return () => { cancelled = true; cancelAnimationFrame(rafRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning]);

  const corners = ['tl','tr','bl','br'] as const;
  const cornerStyle = (c: typeof corners[number]): React.CSSProperties => ({
    position: 'absolute',
    width: 32, height: 32,
    top:    c.startsWith('t') ? 0 : undefined,
    bottom: c.startsWith('b') ? 0 : undefined,
    left:   c.endsWith('l')   ? 0 : undefined,
    right:  c.endsWith('r')   ? 0 : undefined,
    borderTop:    c.startsWith('t') ? '3px solid rgb(220,181,21)' : undefined,
    borderBottom: c.startsWith('b') ? '3px solid rgb(220,181,21)' : undefined,
    borderLeft:   c.endsWith('l')   ? '3px solid rgb(220,181,21)' : undefined,
    borderRight:  c.endsWith('r')   ? '3px solid rgb(220,181,21)' : undefined,
    borderRadius: { tl: '6px 0 0 0', tr: '0 6px 0 0', bl: '0 0 0 6px', br: '0 0 6px 0' }[c],
  });

  const handleCloseScanner = () => {
    stopCamera();
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(10px)' }}
    >
      <div
        className="relative w-full max-w-sm rounded-2xl overflow-hidden"
        style={{
          background: 'rgba(8, 20, 38, 0.97)',
          border: '1px solid rgba(220,181,21,0.38)',
          boxShadow: '0 30px 70px rgba(0,0,0,0.75)',
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{
            background: 'linear-gradient(90deg,rgba(220,181,21,0.22) 0%,rgba(180,140,10,0.12) 100%)',
            borderBottom: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'rgba(220,181,21,0.22)', border: '1px solid rgba(220,181,21,0.3)' }}
            >
              <ScanLine className="w-4 h-4 text-yellow-400" />
            </div>
            <div>
              <div className="text-white text-sm">Scan Coupon QR Code</div>
              <div className="text-gray-400 text-xs">Point camera at your coupon</div>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCloseScanner}
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Viewport */}
        <div className="relative bg-black" style={{ aspectRatio: '1/1' }}>
          {camError ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-8 text-center">
              <Camera className="w-14 h-14 text-gray-600" />
              <p className="text-gray-400 text-sm" style={{ lineHeight: '1.625' }}>{camError}</p>
            </div>
          ) : detected ? (
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-6 text-center"
              style={{ background: isDark ? 'rgba(16,185,129,0.18)' : 'rgba(16,185,129,0.25)' }}
            >
              <CheckCircle className="w-16 h-16" style={{ color: isDark ? '#34d399' : 'rgb(5, 150, 105)' }} />
              <div>
                <div className="text-sm mb-2" style={{ color: isDark ? '#6ee7b7' : 'rgb(5, 150, 105)' }}>QR Code Detected!</div>
                <div
                  className="text-sm tracking-widest px-4 py-2 rounded-lg"
                  style={{ 
                    background: isDark ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.7)', 
                    border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(200,199,190,0.5)',
                    color: colors.text
                  }}
                >
                  {detected}
                </div>
                <div className="text-xs mt-2" style={textMuted}>Filling in promotion code…</div>
              </div>
            </div>
          ) : (
            <>
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                muted
                playsInline
              />
              {/* Overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                {/* Dark surround */}
                <div
                  className="absolute inset-0"
                  style={{ boxShadow: 'inset 0 0 0 9999px rgba(0,0,0,0.42)' }}
                />
                {/* Frame */}
                <div className="relative" style={{ width: 190, height: 190 }}>
                  {corners.map((c) => (
                    <div key={c} style={cornerStyle(c)} />
                  ))}
                  {/* Scanning line */}
                  <div
                    style={{
                      position: 'absolute',
                      left: 4,
                      right: 4,
                      height: 2,
                      background: 'linear-gradient(90deg,transparent,rgb(220,181,21),transparent)',
                      animation: 'qrScanLine 1.8s ease-in-out infinite',
                    }}
                  />
                </div>
              </div>
            </>
          )}
        </div>
        <canvas ref={canvasRef} className="hidden" />

        {/* Footer */}
        {!camError && !detected && (
          <div
            className="px-5 py-3 text-center"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <p className="text-gray-500 text-xs">
              Align the QR code within the frame — it will be detected automatically
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes qrScanLine {
          0%   { top: 6%;  opacity: 0.55; }
          50%  { top: 88%; opacity: 1;    }
          100% { top: 6%;  opacity: 0.55; }
        }
      `}</style>
    </div>
  );
}

// ── Historical bookings (mock data – mirrors Bookings.tsx completed/confirmed) ──
const HISTORY_BOOKINGS = [
  {
    id: 1,
    bookingRef: 'D-20260112-84721',
    lounge: 'The Wing First Class Lounge',
    terminal: 'Terminal 1',
    date: '2026-01-12',
    time: '14:30',
    flightNumber: 'CX888',
    flightType: 'Departure',
    flightClass: 'First Class',
    status: 'confirmed',
    premiereSuites: 1,
    premiereVipPassengers: 2,
    premiereNonFlyingGuests: 0,
    vipPassengers: 2,
    nonFlyingGuests: 0,
    passengers: [
      { title: 'Mr',  firstName: 'John',  lastName: 'Smith', travelDoc: 'P12345678', membership: 'HKIAL001' },
      { title: 'Mrs', firstName: 'Jane',  lastName: 'Smith', travelDoc: 'P87654321', membership: 'HKIAL002' },
      { title: 'Ms',  firstName: 'Emma',  lastName: 'Johnson', travelDoc: 'P11223344', membership: 'HKIAL003' },
      { title: 'Mr',  firstName: 'David', lastName: 'Chen',  travelDoc: 'P55667788', membership: 'HKIAL004' },
    ],
  },
  {
    id: 2,
    bookingRef: 'D-20260120-63195',
    lounge: 'The Pier Business Class Lounge',
    terminal: 'Terminal 1',
    date: '2026-01-20',
    time: '10:15',
    flightNumber: 'CX250',
    flightType: 'Departure',
    flightClass: 'Business Class',
    status: 'confirmed',
    premiereSuites: 0,
    premiereVipPassengers: 0,
    premiereNonFlyingGuests: 0,
    vipPassengers: 2,
    nonFlyingGuests: 1,
    passengers: [
      { title: 'Ms', firstName: 'Sarah', lastName: 'Chen',  travelDoc: 'P11223344', membership: 'HKIAL003' },
      { title: 'Mr', firstName: 'David', lastName: 'Wong',  travelDoc: 'P99887766', membership: 'HKIAL004' },
    ],
  },
  {
    id: 3,
    bookingRef: 'D-20251228-29847',
    lounge: 'The Cabin Lounge',
    terminal: 'Terminal 1',
    date: '2025-12-28',
    time: '16:45',
    flightNumber: 'CX505',
    flightType: 'Departure',
    flightClass: 'Economy Class',
    status: 'completed',
    premiereSuites: 0,
    premiereVipPassengers: 0,
    premiereNonFlyingGuests: 0,
    vipPassengers: 1,
    nonFlyingGuests: 2,
    passengers: [
      { title: 'Mr', firstName: 'Michael', lastName: 'Lee', travelDoc: 'P55667788', membership: 'HKIAL005' },
    ],
  },
  {
    id: 4,
    bookingRef: 'A-20251215-51639',
    lounge: 'The Arrival Lounge',
    terminal: 'Terminal 1',
    date: '2025-12-15',
    time: '08:30',
    flightNumber: 'CX270',
    flightType: 'Arrival',
    flightClass: 'Business Class',
    status: 'completed',
    premiereSuites: 0,
    premiereVipPassengers: 0,
    premiereNonFlyingGuests: 0,
    vipPassengers: 1,
    nonFlyingGuests: 0,
    passengers: [
      { title: 'Mrs', firstName: 'Emily', lastName: 'Chan', travelDoc: 'P44332211', membership: 'HKIAL006' },
    ],
  },
];

// ── Main component ───────────────────────────────────────────────────────────
export function NewBooking({ setActiveTab, memberData, prefillMember: prefillMemberProp, onSubmit, isSubmitting }: NewBookingProps) {
  const { isDark, colors, card, fieldStyle, fieldClass, labelClass, labelStyle, textPrimary, textSecondary, textMuted, stepperCardBg, reviewSectionBg, reviewHeaderBg, secondaryBtnStyle, optionBg, addonItemBg, summaryBoxBg, summaryPurpleBg, addonTotalBg, dividerClass, borderSubtle, borderMedium, borderDivider, backBtnStyle, summaryBoxGoldBg, summaryBoxGoldHeaderBg, guestBadgeBg, taInfoBoxBg, creditTermsBoxBg, priceBreakdownTotalBg, iconMutedClass } = useThemedStyles();
  const navigate = useNavigate();
  const location = useLocation();
  const prefillMember = prefillMemberProp ?? (location.state?.prefillMember ?? null);
  const [currentStep, setCurrentStep] = useState(1);

  // ── Step 1 state ──────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    date: '',
    flightNumber: '',
    flightType: 'Arrival',
    flightClass: 'Economy Class',
    companyCode: '',
    destination: '',
    premiereSuites: 0,
    premiereVipPassengers: 0,
    premiereNonFlyingGuests: 0,
    vipPassengers: prefillMember ? 1 : 0,
    nonFlyingGuests: 0,
  });

  const prefillVipEntry: VipPassenger | null = prefillMember
    ? {
        vipTitle: prefillMember.title,
        vipFirstName: prefillMember.firstName,
        vipLastName: prefillMember.lastName,
        vipTravelDocNo: prefillMember.passportPrefix || '',
        vipMembershipNo: '',
        vipAgeGroup: 'Adult',
        vipBirthday: '',
        foodAllergies: '',
      }
    : null;

  const [vipData, setVipData] = useState<VipPassenger[]>(
    prefillVipEntry ? [prefillVipEntry] : []
  );
  const [nonFlyingGuestData, setNonFlyingGuestData] = useState<NonFlyingGuest[]>([]);
  const [showDeleteVipDialog, setShowDeleteVipDialog] = useState(false);
  const [showDeleteGuestDialog, setShowDeleteGuestDialog] = useState(false);
  const [pendingVipCount, setPendingVipCount] = useState<number | null>(null);
  const [pendingGuestCount, setPendingGuestCount] = useState<number | null>(null);
  const [flightDetails, setFlightDetails] = useState<{
    origin: string;
    destination: string;
    arrivalTime: string;
  } | null>(null);
  const [companyName, setCompanyName] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [promoCodeStatus, setPromoCodeStatus] = useState<'valid' | 'invalid' | 'used' | null>(null);
  const [acceptedTC, setAcceptedTC] = useState(false);
  const [bookingNumber, setBookingNumber] = useState('');
  const [noAddonRequired, setNoAddonRequired] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [useMembership, setUseMembership] = useState(false);
  const [bookingVouchersToUse, setBookingVouchersToUse] = useState(0);
  const [suiteVouchersToUse, setSuiteVouchersToUse] = useState(0);
  const [stepLoading, setStepLoading] = useState(false);

  // ── Derived member flags (computed before any state that references them) ──
  const isCompany      = memberData.memberType === 'Corporate' || memberData.memberType === 'Travel Agency';
  const isTravelAgency = memberData.memberType === 'Travel Agency';

  // ── Membership voucher helpers ─────────────────────────────────────────────
  const BOOKING_VOUCHER_VALUE    = 200; // HKD per booking voucher
  const totalVoucherPool         = prefillMember ? prefillMember.voucherCount : (memberData.voucherCount ?? 0);
  // All member types receive suite upgrade vouchers
  const availableSuiteVouchers   = 2;
  const availableBookingVouchers = Math.max(0, totalVoucherPool - availableSuiteVouchers);

  function handleToggleMembership() {
    const next = !useMembership;
    setUseMembership(next);
    if (!next) {
      setBookingVouchersToUse(0);
      setSuiteVouchersToUse(0);
    }
  }

  function advanceStep(nextStep: number) {
    setStepLoading(true);
    setTimeout(() => {
      setCurrentStep(nextStep);
      setStepLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 900);
  }

  function handleBookingVoucherDecrement() {
    setBookingVouchersToUse((v) => Math.max(0, v - 1));
  }

  function handleBookingVoucherIncrement() {
    setBookingVouchersToUse((v) => Math.min(availableBookingVouchers, v + 1));
  }

  function handleSuiteVoucherDecrement() {
    setSuiteVouchersToUse((v) => Math.max(0, v - 1));
  }

  function handleSuiteVoucherIncrement() {
    setSuiteVouchersToUse((v) => Math.min(availableSuiteVouchers, v + 1));
  }

  // ── Travel Agency discounted unit rates ───────────────────────────────────
  const loungeRate      = isTravelAgency ? Math.round(500  * (1 - TA_DISCOUNT_LOUNGE))    : 500;   // 425
  const limoRate        = isTravelAgency ? Math.round(1200 * (1 - TA_DISCOUNT_LIMO))       : 1200;  // 960
  const wheelchairRate  = isTravelAgency ? Math.round(300  * (1 - TA_DISCOUNT_WHEELCHAIR)) : 300;   // 270

  // ── Step 2 state ──────────────────────────────────────────────────────────
  const [step2Form, setStep2Form] = useState({
    loungeExtension: 0,
    limousineService: 0,
    destinationAddresses: [] as string[],
    limousineStops: [] as string[],
    limousinePickupTime: '',
    wheelchairService: 0,
    wheelchairPassengerName: '',
    securityService: false,
    luggageCount: 0,
    privateTransport: 0,
    driverName: '',
    driverContact: '',
    carPlateNo: '',
    hotelName: '',
    promotionCode: '',
    contactName: memberData.name || '',
    contactEmail: '',
    contactNo: '',
    bookingMemo: '',
    // Travel Agency billing fields (auto-populated for TA, editable for others)
    paymentMethod: memberData.memberType === 'Travel Agency' ? 'direct-billing' : 'credit-card',
    billingReference: memberData.memberType === 'Travel Agency' ? TA_AGENCY_CODE : '',
  });

  // totalVip is the count of VIP passenger info boxes to render. Each box
  // represents one VIP passenger — the suites themselves don't get a box.
  // Bug fix: the old formula was `premiereSuites + premiereVipPassengers +
  // vipPassengers`, which double-counted each suite as a VIP. Result: 1
  // Premiere Suite + 1 VIP Passenger rendered 2 boxes instead of 1.
  const totalVip = form.premiereVipPassengers + form.vipPassengers;
  const totalGuests =
    form.premiereVipPassengers +
    form.premiereNonFlyingGuests +
    form.vipPassengers +
    form.nonFlyingGuests;

  // ── Step 1 validation (flight info) ──────────────────────────────────────
  const step1FlightValid = form.date !== '' && form.flightNumber.trim() !== '';
  const step1FlightHintMsg = !form.date
    ? 'Please select an arrival date to proceed'
    : 'Please enter a flight number to proceed';

  // ── Step 2 validation (passenger info) ───────────────────────────────────
  const allVipFilled = vipData.every(
    (v) => v.vipFirstName.trim() !== '' && v.vipLastName.trim() !== '' && v.vipAgeGroup !== ''
  );
  const allGuestFilled = nonFlyingGuestData.every(
    (g) => g.guestFirstName.trim() !== '' && g.guestLastName.trim() !== '' && g.guestAgeGroup !== ''
  );
  const step1Valid = totalGuests > 0 && allVipFilled && allGuestFilled;

  const step1HintMsg =
    totalGuests === 0
      ? 'Please add at least 1 guest (VIP Passenger or Non-Flying Guest) to proceed'
      : !allVipFilled
      ? 'Please complete all required fields for each VIP Passenger (First Name, Last Name, Age Group)'
      : 'Please complete all required fields for each Non-Flying Guest (First Name, Last Name, Age Group)';

  // Sync VIP passenger array length with totalVip
  useEffect(() => {
    const cur = vipData.length;
    if (totalVip > cur) {
      const extra = Array.from({ length: totalVip - cur }, () => ({
        vipTitle: 'Mr',
        vipFirstName: '',
        vipLastName: '',
        vipTravelDocNo: '',
        vipMembershipNo: '',
        vipAgeGroup: '',
        vipBirthday: '',
        foodAllergies: '',
      }));
      setVipData((prev) => [...prev, ...extra]);
    } else if (totalVip < cur) {
      // Count how many VIP passengers have filled data
      const filledCount = vipData.filter(
        (vip) => vip.vipFirstName || vip.vipLastName || vip.vipTravelDocNo || vip.vipMembershipNo
      ).length;
      
      // Only show dialog if the new count is less than filled guests
      if (totalVip < filledCount) {
        setPendingVipCount(totalVip);
        setShowDeleteVipDialog(true);
      } else {
        // Safe to remove from end (will only remove empty entries)
        setVipData((prev) => prev.slice(0, totalVip));
      }
    }
  }, [totalVip]);

  // Validate promotion code
  useEffect(() => {
    const code = step2Form.promotionCode.trim();
    if (!code) {
      setPromoCodeStatus(null);
      return;
    }
    
    if (USED_PROMO_CODES.includes(code)) {
      setPromoCodeStatus('used');
    } else if (VALID_PROMO_CODES.includes(code)) {
      setPromoCodeStatus('valid');
    } else {
      setPromoCodeStatus('invalid');
    }
  }, [step2Form.promotionCode]);

  // Sync non-flying guest array length with totalNonFlying
  const totalNonFlying = form.premiereNonFlyingGuests + form.nonFlyingGuests;
  useEffect(() => {
    const cur = nonFlyingGuestData.length;
    if (totalNonFlying > cur) {
      const extra = Array.from({ length: totalNonFlying - cur }, () => ({
        guestTitle: 'Mr',
        guestFirstName: '',
        guestLastName: '',
        guestAgeGroup: '',
        foodAllergies: '',
      }));
      setNonFlyingGuestData((prev) => [...prev, ...extra]);
    } else if (totalNonFlying < cur) {
      // Count how many non-flying guests have filled data
      const filledCount = nonFlyingGuestData.filter(
        (guest) => guest.guestFirstName || guest.guestLastName
      ).length;
      
      // Only show dialog if the new count is less than filled guests
      if (totalNonFlying < filledCount) {
        setPendingGuestCount(totalNonFlying);
        setShowDeleteGuestDialog(true);
      } else {
        // Safe to remove from end (will only remove empty entries)
        setNonFlyingGuestData((prev) => prev.slice(0, totalNonFlying));
      }
    }
  }, [totalNonFlying]);

  // ── Step 1 Handlers ───────────────────────────────────────────────────────
  const handleFlightNumber = (v: string) => {
    const upper = v.toUpperCase();
    setForm((p) => ({ ...p, flightNumber: upper }));
    setFlightDetails(flightDatabase[upper] ?? null);
  };

  const handleCompanyCode = (v: string) => {
    const upper = v.toUpperCase();
    setForm((p) => ({ ...p, companyCode: upper }));
    setCompanyName(companyDatabase[upper] ?? '');
  };

  const updateCount = (
    field: 'premiereSuites' | 'premiereVipPassengers' | 'premiereNonFlyingGuests' | 'vipPassengers' | 'nonFlyingGuests',
    delta: number
  ) => {
    setForm((p) => {
      let newValue = p[field] + delta;
      newValue = Math.max(0, Math.min(20, newValue));

      // For Premiere Suite: 1 suite = max 6 total guests (VIP + Non-Flying)
      if (field === 'premiereVipPassengers') {
        const maxAllowed = p.premiereSuites * 6 - p.premiereNonFlyingGuests;
        newValue = Math.min(newValue, Math.max(0, maxAllowed));
      }

      if (field === 'premiereNonFlyingGuests') {
        if (p.premiereVipPassengers === 0 && delta > 0) {
          return p;
        }
        const maxAllowed = p.premiereSuites * 6 - p.premiereVipPassengers;
        newValue = Math.min(newValue, Math.max(0, maxAllowed));
      }

      if (field === 'nonFlyingGuests' && p.vipPassengers === 0 && delta > 0) {
        return p;
      }

      // Maximum 3 non-flying guests for Lounge Deluxe
      if (field === 'nonFlyingGuests') {
        newValue = Math.min(newValue, 3);
      }

      if (field === 'premiereVipPassengers' && newValue === 0) {
        return { ...p, premiereVipPassengers: newValue, premiereNonFlyingGuests: 0 };
      }

      if (field === 'vipPassengers' && newValue === 0) {
        return { ...p, vipPassengers: newValue, nonFlyingGuests: 0 };
      }

      if (field === 'premiereSuites') {
        const maxGuestsAllowed = newValue * 6;
        const currentTotalGuests = p.premiereVipPassengers + p.premiereNonFlyingGuests;
        if (currentTotalGuests > maxGuestsAllowed) {
          // Reduce VIP passengers first, then non-flying guests if needed
          const newVipPassengers = Math.min(p.premiereVipPassengers, maxGuestsAllowed);
          const newNonFlyingGuests = Math.max(0, maxGuestsAllowed - newVipPassengers);
          return { 
            ...p, 
            premiereSuites: newValue, 
            premiereVipPassengers: newVipPassengers,
            premiereNonFlyingGuests: newNonFlyingGuests
          };
        }
      }

      return { ...p, [field]: newValue };
    });
  };

  const handleVipChange = (idx: number, field: string, value: string) => {
    setVipData((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleNonFlyingGuestChange = (idx: number, field: string, value: string) => {
    setNonFlyingGuestData((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleDeleteVip = (index: number) => {
    setVipData((prev) => prev.filter((_, i) => i !== index));
    setShowDeleteVipDialog(false);
    setPendingVipCount(null);
  };

  const handleDeleteGuest = (index: number) => {
    setNonFlyingGuestData((prev) => prev.filter((_, i) => i !== index));
    setShowDeleteGuestDialog(false);
    setPendingGuestCount(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteVipDialog(false);
    setShowDeleteGuestDialog(false);
    setPendingVipCount(null);
    setPendingGuestCount(null);
  };

  const handleQuickFill = () => {
    // Randomise date & time so each Quick Fill creates a unique booking
    const future = new Date();
    future.setDate(future.getDate() + 1 + Math.floor(Math.random() * 14));
    const ds = future.toISOString().split('T')[0];
    const hh = String(6 + Math.floor(Math.random() * 15)).padStart(2, '0');
    const mm = Math.random() < 0.5 ? '00' : '30';
    const ts = hh + ':' + mm;

    const flightKeys = Object.keys(flightDatabase);
    const randomFlight = flightKeys[Math.floor(Math.random() * flightKeys.length)];

    setForm({
      date: ds,
      time: ts,
      flightNumber: randomFlight,
      flightType: 'Arrival',
      flightClass: 'Business Class',
      companyCode: isCompany ? 'CATHAY01' : '',
      destination: '',
      // Quick Fill needs to populate these because the backend validates
      // lounge/terminal as required. Look up the lounge/terminal from the
      // flight database, falling back to a generic lounge so the submit
      // doesn't fail with 422.
      lounge: (flightDatabase[randomFlight]?.lounge) || 'The Wing First Class Lounge',
      terminal: (flightDatabase[randomFlight]?.terminal) || 'Terminal 1',
      premiereSuites: 1,
      // Keep the Premiere/Lounge VIP counts in sync with the number of
      // hardcoded vipData entries below (2 Premiere VIPs + 3 Lounge VIPs = 5
      // total). Previously this was 2 + 2, but vipData was hardcoded to 5
      // entries, which (after the totalVip fix) caused a "Delete VIP" dialog
      // to appear. Now they match exactly.
      premiereVipPassengers: 2,
      premiereNonFlyingGuests: 0,
      vipPassengers: 3,
      nonFlyingGuests: 2,
    });
    setFlightDetails(flightDatabase[randomFlight]);
    if (isCompany) setCompanyName(companyDatabase['CATHAY01']);

    setTimeout(() => {
      setVipData([
        {
          vipTitle: 'Mr',
          vipFirstName: 'John',
          vipLastName: 'Smith',
          vipTravelDocNo: 'P12345678',
          vipMembershipNo: 'HKIAL001',
          vipAgeGroup: 'Adult',
          vipBirthday: '1985-06-01',
          foodAllergies: '',
        },
        {
          vipTitle: 'Mrs',
          vipFirstName: 'Jane',
          vipLastName: 'Smith',
          vipTravelDocNo: 'P87654321',
          vipMembershipNo: 'HKIAL002',
          vipAgeGroup: 'Adult',
          vipBirthday: '1987-11-22',
          foodAllergies: '',
        },
        {
          vipTitle: 'Ms',
          vipFirstName: 'Emma',
          vipLastName: 'Johnson',
          vipTravelDocNo: 'P11223344',
          vipMembershipNo: 'HKIAL003',
          vipAgeGroup: 'Adult',
          vipBirthday: '1990-11-08',
          foodAllergies: '',
        },
        {
          vipTitle: 'Mr',
          vipFirstName: 'David',
          vipLastName: 'Chen',
          vipTravelDocNo: 'P55667788',
          vipMembershipNo: 'HKIAL004',
          vipAgeGroup: 'Adult',
          vipBirthday: '1982-03-15',
          foodAllergies: '',
        },
        {
          vipTitle: 'Ms',
          vipFirstName: 'Linda',
          vipLastName: 'Tan',
          vipTravelDocNo: 'P99887766',
          vipMembershipNo: 'HKIAL005',
          vipAgeGroup: 'Adult',
          vipBirthday: '1988-09-30',
          foodAllergies: '',
        },
      ]);
      setNonFlyingGuestData([
        {
          guestTitle: 'Mr',
          guestFirstName: 'Michael',
          guestLastName: 'Wong',
          guestAgeGroup: 'Adult',
          foodAllergies: '',
        },
        {
          guestTitle: 'Ms',
          guestFirstName: 'Sarah',
          guestLastName: 'Lee',
          guestAgeGroup: 'Adult',
          foodAllergies: '',
        },
      ]);
    }, 100);
  };

  const handleSelectHistory = (booking: typeof HISTORY_BOOKINGS[0]) => {
    setForm({
      date: '',
      flightNumber: booking.flightNumber,
      flightType: booking.flightType,
      flightClass: booking.flightClass,
      companyCode: '',
      destination: '',
      premiereSuites: booking.premiereSuites,
      premiereVipPassengers: booking.premiereVipPassengers,
      premiereNonFlyingGuests: booking.premiereNonFlyingGuests,
      vipPassengers: booking.vipPassengers,
      nonFlyingGuests: booking.nonFlyingGuests,
    });
    const fd = flightDatabase[booking.flightNumber];
    if (fd) setFlightDetails(fd);
    const clonedVip: VipPassenger[] = booking.passengers.map((p) => ({
      vipTitle: p.title,
      vipFirstName: p.firstName,
      vipLastName: p.lastName,
      vipTravelDocNo: p.travelDoc,
      vipMembershipNo: p.membership,
      vipAgeGroup: 'Adult',
      vipBirthday: '',
      foodAllergies: '',
    }));
    const totalVipNeeded = booking.premiereSuites + booking.premiereVipPassengers + booking.vipPassengers;
    const paddedVip = clonedVip.slice(0, totalVipNeeded);
    while (paddedVip.length < totalVipNeeded) {
      paddedVip.push({ vipTitle: 'Mr', vipFirstName: '', vipLastName: '', vipTravelDocNo: '', vipMembershipNo: '', vipAgeGroup: '', vipBirthday: '', foodAllergies: '' });
    }
    setVipData(paddedVip);
    const totalGuestNeeded = booking.premiereNonFlyingGuests + booking.nonFlyingGuests;
    const blankGuests: NonFlyingGuest[] = Array.from({ length: totalGuestNeeded }, () => ({
      guestTitle: 'Mr',
      guestFirstName: '',
      guestLastName: '',
      guestAgeGroup: '',
      foodAllergies: '',
    }));
    setNonFlyingGuestData(blankGuests);
    setShowHistoryDialog(false);
  };

  const handleOpenHistoryDialog = () => setShowHistoryDialog(true);
  const handleCloseHistoryDialog = () => setShowHistoryDialog(false);

  const handleLoungeDeluxeQuickFill = () => {
    setForm((prev) => ({
      ...prev,
      vipPassengers: 2,
      nonFlyingGuests: 1,
    }));
  };

  // ── Step 2 Handlers ───────────────────────────────────────────────────────
  const handleStep2QuickFill = () => {
    setStep2Form({
      loungeExtension: 2,
      limousineService: 1,
      destinationAddresses: ['123 Victoria Road, Central, Hong Kong'],
      limousineStops: [],
      limousinePickupTime: '14:30',
      wheelchairService: 1,
      wheelchairPassengerName: 'John Smith',
      securityService: true,
      luggageCount: 3,
      privateTransport: 1,
      driverName: 'Michael Wong',
      driverContact: '+852 9123 4587',
      carPlateNo: 'HK1234',
      hotelName: 'The Peninsula Hong Kong',
      promotionCode: isTravelAgency ? '' : 'HKIAL2024',
      contactName: memberData.name || 'Sarah Chen',
      contactEmail: 'agency.bookings@globaltravel.com.hk',
      contactNo: '+852 9876 5432',
      bookingMemo:
        'Please prepare wheelchair assistance at gate. VIP guest requires special attention.',
      paymentMethod: isTravelAgency ? 'direct-billing' : 'credit-card',
      billingReference: isTravelAgency ? TA_AGENCY_CODE : '',
    });
  };

  const updateStep2Count = (
    field: 'loungeExtension' | 'limousineService' | 'wheelchairService' | 'luggageCount' | 'privateTransport',
    delta: number
  ) => {
    setStep2Form((prev) => {
      const newValue = Math.max(0, prev[field] + delta);
      
      // When limousineService changes, ensure we have the right number of destination addresses
      if (field === 'limousineService') {
        const currentAddresses = prev.destinationAddresses;
        let updatedAddresses = [...currentAddresses];
        
        if (newValue > currentAddresses.length) {
          // Add more empty addresses
          const additionalCount = newValue - currentAddresses.length;
          updatedAddresses = [...updatedAddresses, ...Array(additionalCount).fill('')];
        } else if (newValue < currentAddresses.length) {
          // Remove extra addresses
          updatedAddresses = updatedAddresses.slice(0, newValue);
        }
        
        return {
          ...prev,
          [field]: newValue,
          destinationAddresses: updatedAddresses,
        };
      }
      
      return {
        ...prev,
        [field]: newValue,
      };
    });
  };

  const handleDestinationAddressChange = (index: number, value: string) => {
    setStep2Form((prev) => {
      const newAddresses = [...prev.destinationAddresses];
      newAddresses[index] = value;
      return { ...prev, destinationAddresses: newAddresses };
    });
  };

  const handleStopChange = (index: number, value: string) => {
    setStep2Form((prev) => {
      const newStops = [...prev.limousineStops];
      newStops[index] = value;
      return { ...prev, limousineStops: newStops };
    });
  };

  const addStop = () => {
    setStep2Form((prev) => ({
      ...prev,
      limousineStops: [...prev.limousineStops, ''],
    }));
  };

  const removeStop = (index: number) => {
    setStep2Form((prev) => ({
      ...prev,
      limousineStops: prev.limousineStops.filter((_, i) => i !== index),
    }));
  };

  const handleGoToReview = (e: React.FormEvent) => {
    e.preventDefault();
    advanceStep(5);
  };

  const handleFinalConfirm = () => {
    // Delegate to container — container handles API call, navigation, and error/success state
    if (onSubmit) {
      // Include flightDetails (origin/destination) so the API service can save
      // them to the backend. The form only holds flightNumber, not the looked-up
      // airport codes from the flight database.
      onSubmit({ form, step2Form, vipData, nonFlyingGuestData, memberData, flightDetails });
    } else {
      // Fallback: generate mock booking number (Figma demo site only, no container)
      const flightPrefixMap: Record<string, string> = { Arrival: 'A', Departure: 'D', Transition: 'T' };
      const flightPrefix = flightPrefixMap[form.flightType] || 'D';
      const now = new Date();
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const randomNum = Math.floor(10000 + Math.random() * 90000);
      const generatedBookingNumber = flightPrefix + '-' + year + month + day + '-' + randomNum;
      setBookingNumber(generatedBookingNumber);
      setSubmitted(true);
      setTimeout(() => navigate('/mybooking'), 3000);
    }
  };

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    advanceStep(2);
  };

  const handleBackToStep2 = () => {
    setCurrentStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToStep1 = () => {
    setCurrentStep(1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNextFromStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    advanceStep(noAddonRequired ? 4 : 3);
  };

  const handleNextFromStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    advanceStep(4);
  };

  const handleBackFromStep4 = () => {
    if (noAddonRequired) {
      setCurrentStep(2);
    } else {
      setCurrentStep(3);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBackToStep4 = () => {
    setCurrentStep(4);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (s: string) => {
    if (!s) return '—';
    return new Date(s).toLocaleDateString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatBirthday = (s: string) => {
    if (!s) return '—';
    return new Date(s).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const vipContact =
    vipData.length > 0
      ? `${vipData[0].vipTitle}. ${vipData[0].vipFirstName} ${vipData[0].vipLastName}`.trim()
      : '—';

  // ── Step loading overlay (fixed over the current step) ───────────────────
  const stepLoadingMessages = [
    'Saving your information…',
    'Validating booking details…',
    'Processing…',
  ];
  const stepLoadingMsg = stepLoadingMessages[currentStep % stepLoadingMessages.length];

  const stepLoadingOverlay = stepLoading ? (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center"
      style={{ background: 'rgba(0,0,0,0.68)', backdropFilter: 'blur(8px)' }}
    >
      <div
        className="rounded-2xl p-8 flex flex-col items-center gap-5 shadow-2xl"
        style={{
          background: isDark ? 'rgba(10,25,41,0.97)' : 'rgba(255,255,255,0.97)',
          border: '1px solid rgba(220,181,21,0.45)',
          minWidth: '240px',
        }}
      >
        <div
          className="w-14 h-14 rounded-full border-[3px] animate-spin"
          style={{ borderColor: 'rgba(220,181,21,0.2)', borderTopColor: 'rgb(220,181,21)' }}
        />
        <div className="text-sm text-center" style={textPrimary}>{stepLoadingMsg}</div>
        <div
          className="h-1 w-36 rounded-full overflow-hidden"
          style={{ background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(220,181,21,0.15)' }}
        >
          <div
            className="h-full rounded-full"
            style={{
              background: 'linear-gradient(90deg, rgb(220,181,21) 0%, rgb(180,140,10) 100%)',
              animation: 'stepProgressBar 0.9s ease-in-out forwards',
            }}
          />
        </div>
        <style>{`@keyframes stepProgressBar { from { width: 0%; } to { width: 100%; } }`}</style>
      </div>
    </div>
  ) : null;

  // ── Booking Step Progress Bar ────────────────────────────────────────────
  const BookingStepProgress = ({ skipAddons }: { skipAddons: boolean }) => {
    const gold = 'rgb(220,181,21)';
    const goldLight = 'rgba(220,181,21,0.15)';
    const grayBorder = isDark ? 'rgba(255,255,255,0.22)' : 'rgba(64,63,52,0.28)';
    const grayLine   = isDark ? 'rgba(255,255,255,0.14)' : 'rgba(64,63,52,0.18)';
    const grayText   = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(64,63,52,0.48)';
    const skipColor  = isDark ? 'rgba(255,255,255,0.22)' : 'rgba(64,63,52,0.28)';
    const divider    = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(64,63,52,0.09)';

    type StepState = 'completed' | 'active' | 'inactive' | 'skipped';

    const effectiveStep = submitted ? 6 : currentStep;

    const getStepState = (idx: number): StepState => {
      if (idx === 3 && skipAddons && effectiveStep >= 4) return 'skipped';
      if (effectiveStep > idx)  return 'completed';
      if (effectiveStep === idx) return 'active';
      return 'inactive';
    };

    const STEPS = [
      { label: 'Flight Info',      idx: 1 },
      { label: 'Suite & Guests',   idx: 2 },
      { label: 'Add-on Services',  idx: 3 },
      { label: 'Other Info',       idx: 4 },
      { label: 'Final Review',     idx: 5 },
      { label: 'Confirmation',     idx: 6 },
    ];
    const stepsLeft = Math.max(0, 6 - effectiveStep);
    const progressCaption = effectiveStep >= 6
      ? 'Booking completed — all steps done'
      : (stepsLeft === 1 ? 'Step ' + effectiveStep + ' of 6 — 1 step remaining' : 'Step ' + effectiveStep + ' of 6 — ' + stepsLeft + ' steps remaining');

    return (
      <div className="w-full mb-6 pb-5" style={{ borderBottom: `1px solid ${divider}` }}>
        <div className="flex items-start w-full">
          {STEPS.map(({ label, idx }) => {
            const state   = getStepState(idx);
            const isFirst = idx === 1;
            const isLast  = idx === STEPS.length;

            const isSkipped = state === 'skipped';
            let dotBorder = grayBorder;
            let dotBg = 'transparent';
            let labelCol = grayText;

            if (state === 'completed') {
              dotBorder = gold; dotBg = goldLight; labelCol = gold;
            } else if (state === 'active') {
              dotBorder = gold; dotBg = goldLight; labelCol = gold;
            } else if (isSkipped) {
              dotBorder = skipColor; dotBg = 'transparent'; labelCol = skipColor;
            }

            const prevIdx = idx - 1;
            let lineStyle: React.CSSProperties = {};
            if (!isFirst) {
              const prevState = getStepState(prevIdx);
              const prevCompleted = prevState === 'completed';
              const thisSkipped = isSkipped;
              if (thisSkipped || (!prevCompleted && state !== 'active')) {
                lineStyle = {
                  background: 'repeating-linear-gradient(to right, ' + grayLine + ' 0px, ' + grayLine + ' 4px, transparent 4px, transparent 9px)',
                };
              } else {
                lineStyle = { background: prevCompleted ? gold : grayLine };
              }
            }

            let alignClass = '';
            if (isLast) { alignClass = ' text-right'; }
            else if (isFirst) { alignClass = ' text-left'; }

            const elements: React.ReactNode[] = [];
            if (!isFirst) {
              elements.push(
                <div key={'c' + idx} className="flex-1 h-0.5 self-start mx-1.5" style={{ marginTop: '18px', ...lineStyle }} />
              );
            }
            elements.push(
              <div key={'n' + idx} className="flex flex-col items-center flex-shrink-0">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all"
                  style={{ borderColor: dotBorder, background: dotBg }}
                >
                  {state === 'completed' && <CheckCircle className="w-4 h-4" style={{ color: gold }} />}
                  {state === 'active' && <div className="w-3 h-3 rounded-full" style={{ background: gold }} />}
                  {(state === 'inactive' || isSkipped) && (
                    <span className="text-xs" style={{ color: isSkipped ? skipColor : grayBorder }}>{idx}</span>
                  )}
                </div>
                <span
                  className={'text-xs mt-1.5 text-center whitespace-nowrap' + alignClass}
                  style={{ color: labelCol, lineHeight: '1.2', maxWidth: '64px', fontSize: '10px' }}
                >
                  {isSkipped ? 'Skipped' : label}
                </span>
              </div>
            );
            return elements;
          })}
        </div>
        {/* Steps remaining caption */}
        <p className="text-xs mt-3 text-center" style={{ color: grayText }}>{progressCaption}</p>
      </div>
    );
  };

  // ── Shared Booking Summary Card ──────────────────────────────────────────
  const BookingSummaryCard = () => {
    const accentColor = isDark ? 'rgb(251,191,36)' : 'rgb(180,140,10)';
    const iconMuted = isDark ? '#94a3b8' : '#64748b';
    const sectionLabel = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';
    const suiteTile: React.CSSProperties = {
      background: isDark ? 'rgba(220,181,21,0.08)' : 'rgba(220,181,21,0.1)',
      border: isDark ? '1px solid rgba(220,181,21,0.25)' : '1px solid rgba(220,181,21,0.35)',
    };
    const loungeTile: React.CSSProperties = {
      background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(231,230,221,0.6)',
      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(200,199,190,0.55)',
    };
    const capacityTrack: React.CSSProperties = {
      background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(220,181,21,0.15)',
    };
    const suiteCount = Math.max(1, form.premiereSuites);
    const suiteDists = Array.from({ length: form.premiereSuites }, (_, i) => {
      const vipBase = Math.floor(form.premiereVipPassengers / suiteCount);
      const vipExtra = i < (form.premiereVipPassengers % suiteCount) ? 1 : 0;
      const nfgBase = Math.floor(form.premiereNonFlyingGuests / suiteCount);
      const nfgExtra = i < (form.premiereNonFlyingGuests % suiteCount) ? 1 : 0;
      const vip = vipBase + vipExtra;
      const nfg = nfgBase + nfgExtra;
      const total = vip + nfg;
      const nfgStr = nfg === 1 ? '1 Non-Flying' : nfg + ' Non-Flying';
      const occupancyLabel = nfg > 0 ? vip + ' VIP · ' + nfgStr : vip + ' VIP';
      return { vip, nfg, total, capacityPct: Math.round((total / 6) * 100) + '%', occupancyLabel };
    });
    let gridCols = 'grid-cols-1';
    if (form.premiereSuites === 2) gridCols = 'grid-cols-2';
    else if (form.premiereSuites >= 3) gridCols = 'grid-cols-3';
    const hasLounge = form.vipPassengers > 0 || form.nonFlyingGuests > 0;
    const loungeTotalPax = form.vipPassengers + form.nonFlyingGuests;
    const lvStr = form.vipPassengers > 0 ? form.vipPassengers + ' VIP' : '';
    const lnStr = form.nonFlyingGuests > 0 ? form.nonFlyingGuests + ' Non-Flying' : '';
    const loungeLabel = lvStr + (lvStr && lnStr ? ' · ' : '') + lnStr;
    const suiteUpgradeFee = form.premiereSuites * 6000;
    const addonOrig =
      suiteUpgradeFee +
      step2Form.loungeExtension * 500 +
      step2Form.limousineService * 1200 +
      step2Form.wheelchairService * 300;
    const addonAmt =
      suiteUpgradeFee +
      step2Form.loungeExtension * loungeRate +
      step2Form.limousineService * limoRate +
      step2Form.wheelchairService * wheelchairRate;
    const addonSave = addonOrig - addonAmt;
    const hasAddon =
      form.premiereSuites > 0 ||
      step2Form.loungeExtension > 0 ||
      step2Form.limousineService > 0 ||
      step2Form.wheelchairService > 0;

    return (
      <div className="rounded-xl overflow-hidden" style={summaryBoxGoldBg}>
        <div className="px-5 py-3 flex items-center justify-between" style={summaryBoxGoldHeaderBg}>
          <span className="text-sm" style={textPrimary}>Booking Summary</span>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" style={{ color: accentColor }} />
            <span className="text-xs font-medium" style={{ color: accentColor }}>{totalGuests} guests</span>
          </div>
        </div>
        <div className="px-5 py-4 space-y-3">
          {form.premiereSuites > 0 && (
            <div>
              <div className="text-xs uppercase tracking-wider mb-2" style={{ color: sectionLabel }}>
                Premiere Suite{form.premiereSuites > 1 ? 's' : ''} ({form.premiereSuites})
              </div>
              <div className={`grid gap-2 ${gridCols}`}>
                {suiteDists.map((suite, i) => (
                  <div key={i} className="rounded-lg p-2.5" style={suiteTile}>
                    <div className="flex items-center gap-1 mb-1.5">
                      <Crown className="w-3 h-3" style={{ color: accentColor }} />
                      <span className="text-xs font-semibold" style={textPrimary}>Suite {i + 1}</span>
                    </div>
                    <div className="text-xs mb-1.5" style={{ color: colors.textMuted }}>{suite.occupancyLabel}</div>
                    <div className="h-0.5 w-full rounded-full overflow-hidden" style={capacityTrack}>
                      <div className="h-full rounded-full" style={{ width: suite.capacityPct, background: 'rgb(220,181,21)' }} />
                    </div>
                    <div className="text-xs mt-1" style={{ color: colors.textMuted }}>{suite.total}/6</div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {hasLounge && (
            <div>
              {form.premiereSuites > 0 && (
                <div className="text-xs uppercase tracking-wider mb-2" style={{ color: sectionLabel }}>Lounge Deluxe</div>
              )}
              <div className="rounded-lg px-3 py-2.5 flex items-center justify-between" style={loungeTile}>
                <div className="flex items-center gap-2">
                  <Hotel className="w-3.5 h-3.5" style={{ color: iconMuted }} />
                  <div>
                    <div className="text-xs font-semibold" style={textPrimary}>Lounge Deluxe</div>
                    <div className="text-xs" style={{ color: colors.textMuted }}>{loungeLabel}</div>
                  </div>
                </div>
                <span className="text-xs font-medium" style={{ color: colors.textMuted }}>| Total {loungeTotalPax} guests</span>
              </div>
            </div>
          )}
          {hasAddon && (
            <div
              className="rounded-lg px-3 py-2.5 space-y-1.5"
              style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)' }}
            >
              <div className="text-xs uppercase tracking-wider mb-2" style={{ color: colors.textMuted }}>Add-on Services</div>
              {form.premiereSuites > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: colors.textMuted }}>Premiere Suite Upgrade Fee × {form.premiereSuites}</span>
                  <span className="text-xs font-medium" style={textPrimary}>HK${suiteUpgradeFee.toLocaleString()}</span>
                </div>
              )}
              {step2Form.loungeExtension > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: colors.textMuted }}>Lounge Extension × {step2Form.loungeExtension}</span>
                  <div className="text-right">
                    {isTravelAgency && <span className="text-xs line-through mr-1.5" style={{ color: colors.textMuted }}>HK${(step2Form.loungeExtension * 500).toLocaleString()}</span>}
                    <span className="text-xs font-medium" style={textPrimary}>HK${(step2Form.loungeExtension * loungeRate).toLocaleString()}</span>
                  </div>
                </div>
              )}
              {step2Form.limousineService > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: colors.textMuted }}>Limousine Service × {step2Form.limousineService}</span>
                  <div className="text-right">
                    {isTravelAgency && <span className="text-xs line-through mr-1.5" style={{ color: colors.textMuted }}>HK${(step2Form.limousineService * 1200).toLocaleString()}</span>}
                    <span className="text-xs font-medium" style={textPrimary}>HK${(step2Form.limousineService * limoRate).toLocaleString()}</span>
                  </div>
                </div>
              )}
              {step2Form.wheelchairService > 0 && (
                <div className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: colors.textMuted }}>Wheelchair Service × {step2Form.wheelchairService}</span>
                  <div className="text-right">
                    {isTravelAgency && <span className="text-xs line-through mr-1.5" style={{ color: colors.textMuted }}>HK${(step2Form.wheelchairService * 300).toLocaleString()}</span>}
                    <span className="text-xs font-medium" style={textPrimary}>HK${(step2Form.wheelchairService * wheelchairRate).toLocaleString()}</span>
                  </div>
                </div>
              )}
              <div
                className="flex items-center justify-between pt-1.5 mt-1"
                style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)' }}
              >
                <span className="text-xs font-medium" style={textPrimary}>Total</span>
                <span className="text-sm font-semibold" style={textPrimary}>HK${addonAmt.toLocaleString()}</span>
              </div>
              {isTravelAgency && addonSave > 0 && (
                <div className="text-xs text-green-400">Agency saving: HK${addonSave.toLocaleString()}</div>
              )}
            </div>
          )}
          {isTravelAgency && (
            <div
              className="flex items-center gap-2 px-3 py-2 rounded-lg"
              style={{
                background: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.18)',
                border: isDark ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(16,185,129,0.45)',
              }}
            >
              <Banknote className="w-4 h-4 flex-shrink-0" style={{ color: isDark ? '#34d399' : 'rgb(5,150,105)' }} />
              <div className="text-xs" style={{ color: isDark ? '#6ee7b7' : 'rgb(5,150,105)' }}>{TA_PAYMENT_METHOD}</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ── Confirmation screen ───────────────────────────────────────────────────
  if (submitted) {
    return (
      <>
      <div className="max-w-2xl mx-auto py-8">
        <BookingStepProgress skipAddons={noAddonRequired} />
        <div className="rounded-2xl p-12 text-center mt-6" style={card}>
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)] flex items-center justify-center">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl mb-4" style={textPrimary}>Booking Request Submitted</h2>
          
          {/* Booking Number Display */}
          <div 
            className="inline-block px-6 py-3 rounded-xl mb-4"
            style={{
              background: isDark 
                ? 'linear-gradient(135deg, rgba(220, 181, 21, 0.2) 0%, rgba(180, 140, 10, 0.15) 100%)'
                : 'linear-gradient(135deg, rgba(220, 181, 21, 0.25) 0%, rgba(180, 140, 10, 0.18) 100%)',
              border: isDark ? '1px solid rgba(220, 181, 21, 0.4)' : '1px solid rgba(220, 181, 21, 0.5)',
            }}
          >
            <div className="text-xs mb-1" style={textMuted}>Booking Reference</div>
            <div 
              className="text-2xl font-mono tracking-wider"
              style={{
                background: 'linear-gradient(90deg, rgb(220, 181, 21) 0%, rgb(180, 140, 10) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {bookingNumber}
            </div>
          </div>
          
          <p className="mb-2" style={textSecondary}>
            Your lounge booking request has been successfully submitted and is currently under staff approval.
            You will receive a confirmation email once your booking is verified.
          </p>
          {useMembership && bookingVouchersToUse > 0 && (
            <p className="text-sm mb-1" style={{ color: isDark ? '#34d399' : 'rgb(5,150,105)' }}>
              <strong>{bookingVouchersToUse} Booking Voucher{bookingVouchersToUse !== 1 ? 's' : ''}</strong> applied · saving HKD {(bookingVouchersToUse * BOOKING_VOUCHER_VALUE).toLocaleString()}.
            </p>
          )}
          {useMembership && suiteVouchersToUse > 0 && (
            <p className="text-sm mb-1" style={{ color: isDark ? '#34d399' : 'rgb(5,150,105)' }}>
              <strong>{suiteVouchersToUse} Suite Upgrade Voucher{suiteVouchersToUse !== 1 ? 's' : ''}</strong> applied · complimentary Premiere Suite upgrade{suiteVouchersToUse !== 1 ? 's' : ''} confirmed.
            </p>
          )}
          {step2Form.promotionCode && (
            <p className="text-yellow-400 text-sm mb-4">
              Promotion / Redemption code <strong>{step2Form.promotionCode}</strong> applied.
            </p>
          )}
          {isTravelAgency && (
            <div
              className="rounded-xl px-4 py-3 mb-4 text-left"
              style={{ 
                background: isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.2)', 
                border: isDark ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(16,185,129,0.5)' 
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <BadgeCheck className="w-4 h-4 flex-shrink-0" style={{ color: isDark ? '#34d399' : 'rgb(5, 150, 105)' }} />
                <span className="text-sm" style={{ color: isDark ? '#6ee7b7' : 'rgb(5, 150, 105)' }}>Travel Agency Billing Confirmed</span>
              </div>
              <div className="text-xs space-y-1" style={textMuted}>
                <div>• Payment: <span style={textPrimary}>{TA_PAYMENT_METHOD}</span></div>
                <div>• Billing Ref: <span style={textPrimary}>{step2Form.billingReference || TA_AGENCY_CODE}</span></div>
                <div>• Invoice will be sent to your registered agency email within 3 business days</div>
              </div>
            </div>
          )}
          <p className="text-sm" style={textMuted}>Redirecting to My Bookings…</p>
        </div>
      </div>
      {stepLoadingOverlay}
      </>
    );
  }

  // ── Step 5: Final Review ──────────────────────────────────────────────────
  if (currentStep === 5) {

    const addonOriginal =
      step2Form.loungeExtension * 500 +
      step2Form.limousineService * 1200 +
      step2Form.wheelchairService * 300;
    const addonTotal =
      step2Form.loungeExtension * loungeRate +
      step2Form.limousineService * limoRate +
      step2Form.wheelchairService * wheelchairRate;
    const addonSaving = addonOriginal - addonTotal;
    const hasAddons =
      step2Form.loungeExtension > 0 ||
      step2Form.limousineService > 0 ||
      step2Form.wheelchairService > 0;
    const hasSuiteVouchers = availableSuiteVouchers > 0;

    // ── Accommodation grid pre-computation ──────────────────────────────────
    const suiteCount = form.premiereSuites || 1;
    const suiteDistributions = Array.from({ length: form.premiereSuites }, (_, i) => {
      const vipBase = Math.floor(form.premiereVipPassengers / suiteCount);
      const vipExtra = i < (form.premiereVipPassengers % suiteCount) ? 1 : 0;
      const nfgBase = Math.floor(form.premiereNonFlyingGuests / suiteCount);
      const nfgExtra = i < (form.premiereNonFlyingGuests % suiteCount) ? 1 : 0;
      const vip = vipBase + vipExtra;
      const nfg = nfgBase + nfgExtra;
      const total = vip + nfg;
      const nfgStr = nfg === 1 ? '1 Non-Flying' : nfg + ' Non-Flying';
      const occupancyLabel = nfg > 0 ? vip + ' VIP · ' + nfgStr : vip + ' VIP';
      return { vip, nfg, total, capacityPct: Math.round((total / 6) * 100) + '%', occupancyLabel };
    });
    const hasLoungeGuests = form.vipPassengers > 0 || form.nonFlyingGuests > 0;
    const loungeTotalGuests = form.vipPassengers + form.nonFlyingGuests;
    const loungeVipStr = form.vipPassengers > 0 ? form.vipPassengers + ' VIP' : '';
    const loungeNfgStr = form.nonFlyingGuests > 0 ? form.nonFlyingGuests + ' Non-Flying' : '';
    const loungeOccupancyLabel = loungeVipStr + (loungeVipStr && loungeNfgStr ? ' · ' : '') + loungeNfgStr;
    let suiteGridCols = 'grid-cols-1';
    if (form.premiereSuites === 2) suiteGridCols = 'grid-cols-2';
    else if (form.premiereSuites >= 3) suiteGridCols = 'grid-cols-3';
    const suiteTileStyle: React.CSSProperties = {
      background: isDark ? 'rgba(220,181,21,0.08)' : 'rgba(220,181,21,0.1)',
      border: isDark ? '1px solid rgba(220,181,21,0.25)' : '1px solid rgba(220,181,21,0.35)',
    };
    const loungeTileStyle: React.CSSProperties = {
      background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(231,230,221,0.6)',
      border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(200,199,190,0.55)',
    };
    const capacityTrackStyle: React.CSSProperties = {
      background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(220,181,21,0.15)',
    };
    const loungeGuestBadgeBg: React.CSSProperties = {
      background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
    };
    const suiteAccentColor = isDark ? 'rgb(251,191,36)' : 'rgb(180,140,10)';
    const loungeIconColor = isDark ? '#94a3b8' : '#64748b';
    const sectionLabelColor = isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)';

    // Pre-compute review field values to avoid nested template literals with ternaries in JSX
    const bookingVoucherPlural = bookingVouchersToUse !== 1 ? 's' : '';
    const bookingVoucherReviewValue = bookingVouchersToUse > 0
      ? bookingVouchersToUse + ' voucher' + bookingVoucherPlural + ' (\u2212HKD ' + (bookingVouchersToUse * BOOKING_VOUCHER_VALUE).toLocaleString() + ')'
      : 'None';
    const suiteVoucherPlural = suiteVouchersToUse !== 1 ? 's' : '';
    const suiteVoucherReviewValue = suiteVouchersToUse > 0
      ? suiteVouchersToUse + ' upgrade' + suiteVoucherPlural + ' applied'
      : 'None';

    const gradientText: React.CSSProperties = {
      background: 'linear-gradient(90deg, rgb(220, 181, 21) 0%, rgb(180, 140, 10) 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    };

    return (
      <>
      <div className="space-y-4 pb-8">
        {/* Progress bar */}
        <BookingStepProgress skipAddons={noAddonRequired} />

        {/* Header */}
        <div>
          <h1 className="text-xl" style={gradientText}>
            Step 5: Final Review
          </h1>
          <p className="text-xs mt-1" style={textMuted}>
            Please review your booking details before confirmation
          </p>
        </div>

        {/* ── Book for Member Banner ──────────────────────────────────────── */}
        {prefillMember && (
          <div
            className="rounded-xl px-4 py-3.5 flex items-start gap-3"
            style={{
              background: isDark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)',
              border: isDark ? '1px solid rgba(59,130,246,0.35)' : '1px solid rgba(59,130,246,0.3)',
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.15)' }}
            >
              <CalendarPlus className="w-4 h-4" style={{ color: '#60a5fa' }} />
            </div>
            <div>
              <p className="text-sm" style={{ color: isDark ? '#93c5fd' : 'rgb(37,99,235)' }}>
                Booking on behalf of{' '}
                <strong>{prefillMember.title} {prefillMember.firstName} {prefillMember.lastName}</strong>
              </p>
              <p className="text-xs mt-0.5" style={{ color: isDark ? 'rgba(147,197,253,0.75)' : 'rgba(37,99,235,0.7)' }}>
                Membership: {prefillMember.membershipLabel} · Vouchers deducted from this member&apos;s account
              </p>
            </div>
          </div>
        )}

        {/* ── Flight Information ─────────────────────────────────────────── */}
        <ReviewSection
          icon={<Plane className="w-4 h-4 text-white" />}
          iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
          title="Flight Information"
        >
          <ReviewGrid>
            <ReviewField label="Arrival Date" value={formatDate(form.date)} />
            <ReviewField label="Flight Number" value={form.flightNumber || '—'} />
            <ReviewField label="Flight Class" value={form.flightClass} />
            <ReviewField label="Flight Type" value={form.flightType} />
            {flightDetails && (
              <>
                <ReviewField label="Origin" value={flightDetails.origin} />
                <ReviewField label="Destination" value={flightDetails.destination} />
                <ReviewField label="Arrival Time" value={flightDetails.arrivalTime} />
              </>
            )}
          </ReviewGrid>
        </ReviewSection>

        {/* ── Accommodation ─────────────────────────────────────────────── */}
        <ReviewSection
          icon={<Building className="w-4 h-4 text-white" />}
          iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
          title="Accommodation"
        >
          <div className="space-y-4">
            {form.premiereSuites > 0 && (
              <div>
                <div className="text-xs uppercase tracking-wider mb-2.5" style={{ color: sectionLabelColor }}>
                  Premiere Suite{form.premiereSuites > 1 ? 's' : ''} &mdash; {form.premiereSuites} booked
                </div>
                <div className={`grid gap-2 ${suiteGridCols}`}>
                  {suiteDistributions.map((suite, i) => (
                    <div key={i} className="rounded-lg p-3" style={suiteTileStyle}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Crown className="w-3.5 h-3.5" style={{ color: suiteAccentColor }} />
                        <span className="text-xs font-semibold" style={textPrimary}>Suite {i + 1}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs mb-2.5" style={textPrimary}>
                        <User className="w-3 h-3" style={{ color: colors.textMuted }} />
                        <span>{suite.occupancyLabel}</span>
                      </div>
                      <div className="h-1 w-full rounded-full overflow-hidden" style={capacityTrackStyle}>
                        <div className="h-full rounded-full" style={{ width: suite.capacityPct, background: 'rgb(220,181,21)' }} />
                      </div>
                      <div className="text-xs mt-1.5" style={{ color: colors.textMuted }}>{suite.total} / 6 capacity</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {hasLoungeGuests && (
              <div>
                {form.premiereSuites > 0 && (
                  <div className="text-xs uppercase tracking-wider mb-2.5" style={{ color: sectionLabelColor }}>Lounge Deluxe</div>
                )}
                <div className="rounded-lg p-3 flex items-center justify-between" style={loungeTileStyle}>
                  <div className="flex items-center gap-2.5">
                    <Hotel className="w-4 h-4" style={{ color: loungeIconColor }} />
                    <div>
                      <div className="text-xs font-semibold" style={textPrimary}>Lounge Deluxe</div>
                      <div className="text-xs mt-0.5" style={{ color: colors.textMuted }}>{loungeOccupancyLabel}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={loungeGuestBadgeBg}>
                    <Users className="w-3 h-3" style={{ color: colors.textMuted }} />
                    <span className="text-xs font-medium" style={textPrimary}>{loungeTotalGuests}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ReviewSection>

        {/* ── VIP Passengers ─────────────────────────────────────────────── */}
        {vipData.map((p, i) => (
          <ReviewSection
            key={i}
            icon={<User className="w-4 h-4 text-white" />}
            iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
            title={`VIP Passenger #${i + 1}`}
          >
            <ReviewGrid>
              <ReviewField
                label="Full Name"
                value={`${p.vipTitle} ${p.vipFirstName} ${p.vipLastName}`.trim() || '—'}
              />
              <ReviewField label="Travel Document No." value={p.vipTravelDocNo || '—'} />

              <ReviewField label="Age Group" value={p.vipAgeGroup} />
              {p.vipBirthday && (
                <ReviewField label="Birthday" value={formatBirthday(p.vipBirthday)} />
              )}
              {p.foodAllergies && (
                <ReviewField label="Food Allergies" value={p.foodAllergies} />
              )}
            </ReviewGrid>
          </ReviewSection>
        ))}

        {/* ── Add-on Services ────────────────────────────────────────────── */}
        {hasAddons && (
          <ReviewSection
            icon={<Zap className="w-4 h-4 text-white" />}
            iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
            title="Add-on Services"
          >
            <div className="space-y-3">
              {step2Form.loungeExtension > 0 && (
                <div
                  className="rounded-lg px-4 py-3"
                  style={addonItemBg}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-2">
                      <Clock className="w-4 h-4 text-orange-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs" style={textMuted}>Extension of Stay in VIP Lounge</div>
                        <div className="text-sm mt-0.5" style={textPrimary}>
                          {step2Form.loungeExtension} hour
                          {step2Form.loungeExtension !== 1 ? 's' : ''}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {isTravelAgency ? (
                        <>
                          <div className="text-xs line-through" style={textMuted}>HK$500 × {step2Form.loungeExtension}</div>
                          <div className="text-xs text-green-400">HK${loungeRate} × {step2Form.loungeExtension} ({Math.round(TA_DISCOUNT_LOUNGE * 100)}% off)</div>
                          <div className="text-sm mt-0.5" style={textPrimary}>HK${(step2Form.loungeExtension * loungeRate).toLocaleString()}</div>
                        </>
                      ) : (
                        <>
                          <div className="text-xs" style={textMuted}>HK$500 × {step2Form.loungeExtension}</div>
                          <div className="text-sm mt-0.5" style={textPrimary}>HK${(step2Form.loungeExtension * 500).toLocaleString()}</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {step2Form.limousineService > 0 && (
                <div
                  className="rounded-lg px-4 py-3"
                  style={addonItemBg}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-2 flex-1">
                      <Car className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-xs" style={textMuted}>
                          Airport Limousine Transfer Service
                        </div>
                        <div className="text-sm mt-0.5" style={textPrimary}>
                          {step2Form.limousineService} vehicle
                          {step2Form.limousineService !== 1 ? 's' : ''}
                        </div>
                        {step2Form.destinationAddresses.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {step2Form.destinationAddresses.map((addr, idx) => (
                              addr && (
                                <div key={idx} className="text-xs" style={textMuted}>
                                  <span style={textMuted}>
                                    {step2Form.limousineService > 1 ? `Vehicle #${idx + 1}: ` : 'Destination: '}
                                  </span>
                                  {addr}
                                </div>
                              )
                            ))}
                            {form.flightType === 'Departure' && step2Form.limousinePickupTime && (
                              <div className="text-xs" style={textMuted}>
                                <span style={textMuted}>Pick-up Time: </span>
                                {step2Form.limousinePickupTime}
                              </div>
                            )}
                            {step2Form.limousineStops.length > 0 && (
                              <div className="mt-1.5 pt-1.5" style={{ borderTop: borderSubtle }}>
                                <div className="text-xs mb-1" style={textMuted}>Additional Stops:</div>
                                {step2Form.limousineStops.map((stop, idx) => (
                                  stop && (
                                    <div key={idx} className="text-xs" style={textMuted}>
                                      • {stop}
                                    </div>
                                  )
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {isTravelAgency ? (
                        <>
                          <div className="text-xs line-through" style={textMuted}>HK$1,200 × {step2Form.limousineService}</div>
                          <div className="text-xs text-green-400">HK${limoRate} × {step2Form.limousineService} ({Math.round(TA_DISCOUNT_LIMO * 100)}% off)</div>
                          <div className="text-sm mt-0.5" style={textPrimary}>HK${(step2Form.limousineService * limoRate).toLocaleString()}</div>
                        </>
                      ) : (
                        <>
                          <div className="text-xs" style={textMuted}>HK$1,200 × {step2Form.limousineService}</div>
                          <div className="text-sm mt-0.5" style={textPrimary}>HK${(step2Form.limousineService * 1200).toLocaleString()}</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {step2Form.wheelchairService > 0 && (
                <div
                  className="rounded-lg px-4 py-3"
                  style={addonItemBg}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-2">
                      <Accessibility className="w-4 h-4 text-pink-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs" style={textMuted}>Wheelchair Assistance</div>
                        <div className="text-sm mt-0.5" style={textPrimary}>
                          {step2Form.wheelchairService} wheelchair
                          {step2Form.wheelchairService !== 1 ? 's' : ''}
                        </div>
                        {step2Form.wheelchairPassengerName && (
                          <div className="text-xs mt-1" style={textMuted}>
                            Passenger: {step2Form.wheelchairPassengerName}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {isTravelAgency ? (
                        <>
                          <div className="text-xs line-through" style={textMuted}>HK$300 × {step2Form.wheelchairService}</div>
                          <div className="text-xs text-green-400">HK${wheelchairRate} × {step2Form.wheelchairService} ({Math.round(TA_DISCOUNT_WHEELCHAIR * 100)}% off)</div>
                          <div className="text-sm mt-0.5" style={textPrimary}>HK${(step2Form.wheelchairService * wheelchairRate).toLocaleString()}</div>
                        </>
                      ) : (
                        <>
                          <div className="text-xs" style={textMuted}>HK$300 × {step2Form.wheelchairService}</div>
                          <div className="text-sm mt-0.5" style={textPrimary}>HK${(step2Form.wheelchairService * 300).toLocaleString()}</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Add-on total row */}
              <div
                className="flex items-center justify-between px-4 py-3 rounded-lg"
                style={addonTotalBg}
              >
                <div className="flex-1">
                  <span className="text-sm" style={textPrimary}>Total Add-on Services</span>
                  {isTravelAgency && addonSaving > 0 && (
                    <div className="text-xs text-green-400 mt-0.5">
                      You save HK${addonSaving.toLocaleString()} with TA pre-negotiated rates
                    </div>
                  )}
                </div>
                <div className="text-right">
                  {isTravelAgency && addonSaving > 0 && (
                    <div className="text-xs line-through" style={textMuted}>HK${addonOriginal.toLocaleString()}</div>
                  )}
                  <span className="text-base" style={textPrimary}>
                    HK${addonTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </ReviewSection>
        )}

        {/* ── Travel Agency Pricing & Payment (TA only) ──────────────────── */}
        {isTravelAgency && (
          <ReviewSection
            icon={<BadgeCheck className="w-4 h-4 text-white" />}
            iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
            title="Travel Agency Pricing & Payment"
          >
            {/* TA discount badge */}
            <div
              className="rounded-lg px-4 py-3 mb-4"
              style={{ 
                background: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.18)', 
                border: isDark ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(16,185,129,0.45)' 
              }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Percent className="w-3.5 h-3.5" style={{ color: isDark ? '#34d399' : 'rgb(5, 150, 105)' }} />
                <span className="text-xs" style={{ color: isDark ? '#34d399' : 'rgb(5, 150, 105)' }}>Pre-Negotiated Agency Discounts Applied</span>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <div className="text-sm" style={textPrimary}>{Math.round(TA_DISCOUNT_LOUNGE * 100)}% off</div>
                  <div className="text-xs" style={textMuted}>Lounge Extension</div>
                </div>
                <div className="text-center">
                  <div className="text-sm" style={textPrimary}>{Math.round(TA_DISCOUNT_LIMO * 100)}% off</div>
                  <div className="text-xs" style={textMuted}>Limousine Service</div>
                </div>
                <div className="text-center">
                  <div className="text-sm" style={textPrimary}>{Math.round(TA_DISCOUNT_WHEELCHAIR * 100)}% off</div>
                  <div className="text-xs" style={textMuted}>Wheelchair Assist.</div>
                </div>
              </div>
            </div>
            <ReviewGrid>
              <ReviewField label="Payment Method" value={TA_PAYMENT_METHOD} />
              <ReviewField label="Agency Billing Reference" value={step2Form.billingReference || TA_AGENCY_CODE} />
              <ReviewField label="Billing Arrangement" value="Invoice issued within 3 business days" />
              <ReviewField label="Credit Terms" value="Net 30 days from invoice date" />
            </ReviewGrid>
          </ReviewSection>
        )}

        {/* ── Payment Method (non-TA) ────────────────────────────────────── */}
        {!isTravelAgency && (
          <ReviewSection
            icon={<CreditCard className="w-4 h-4 text-white" />}
            iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
            title="Payment Method"
          >
            <ReviewField label="Payment" value="Credit Card" />
          </ReviewSection>
        )}

        {/* ── Other Information ──────────────────────────────────────────── */}
        <ReviewSection
          icon={<Package className="w-4 h-4 text-white" />}
          iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
          title="Other Information"
        >
          <ReviewGrid>
            <ReviewField
              label="Number of Luggage"
              value={`${step2Form.luggageCount} piece${step2Form.luggageCount !== 1 ? 's' : ''}`}
            />
            <ReviewField
              label="Private Transport"
              value={step2Form.privateTransport > 0 ? String(step2Form.privateTransport) : 'No'}
            />
          </ReviewGrid>
        </ReviewSection>

        {/* ── Driver Information ─────────────────────────────────────────── */}
        {step2Form.privateTransport > 0 && (
          <ReviewSection
            icon={<User className="w-4 h-4 text-white" />}
            iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
            title="Driver Information"
          >
            <ReviewGrid>
              <ReviewField label="Driver Name" value={step2Form.driverName || '—'} />
              <ReviewField label="Driver Contact" value={step2Form.driverContact || '—'} />
            </ReviewGrid>
          </ReviewSection>
        )}

        {/* ── Private Car ────────────────────────────────────────────────── */}
        {step2Form.privateTransport > 0 && (
          <ReviewSection
            icon={<Hotel className="w-4 h-4 text-white" />}
            iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
            title="Private Car"
          >
            <ReviewGrid>
              <ReviewField label="Car Plate No." value={step2Form.carPlateNo || '—'} />
              <ReviewField label="Address" value={step2Form.hotelName || '—'} />
            </ReviewGrid>
          </ReviewSection>
        )}

        {/* ── Membership Checkout ─────────────────────────────────────────────── */}
        {useMembership && (
          <ReviewSection
            icon={<BadgeCheck className="w-4 h-4 text-white" />}
            iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
            title="Membership Checkout"
          >
            <ReviewGrid>
              <ReviewField label="Using Membership" value="Yes" />
              <ReviewField
                label="Booking Vouchers"
                value={bookingVoucherReviewValue}
              />
              {hasSuiteVouchers && (
                <ReviewField
                  label="Suite Upgrade Vouchers"
                  value={suiteVoucherReviewValue}
                />
              )}
              {bookingVouchersToUse > 0 && (
                <ReviewField label="Total Booking Saving" value={`HKD ${(bookingVouchersToUse * BOOKING_VOUCHER_VALUE).toLocaleString()}`} />
              )}
            </ReviewGrid>
          </ReviewSection>
        )}

        {/* ── Promotion / Redemption Code ─────────────────────────────────────────────── */}
        {step2Form.promotionCode && (
          <ReviewSection
            icon={<Tag className="w-4 h-4 text-white" />}
            iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
            title="Promotion / Redemption Code"
          >
            <div className="text-sm" style={textPrimary}>{step2Form.promotionCode}</div>
          </ReviewSection>
        )}

        {/* ── Contact Person ─────────────────────────────────────────────── */}
        <ReviewSection
          icon={<Phone className="w-4 h-4 text-white" />}
          iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
          title="Contact Person"
        >
          <ReviewGrid>
            <ReviewField label="Name" value={step2Form.contactName || '—'} />
            <ReviewField label="Email" value={step2Form.contactEmail || '—'} />
            <ReviewField label="Contact No." value={step2Form.contactNo || '—'} />
          </ReviewGrid>
          {step2Form.bookingMemo && (
            <div className="mt-4 pt-4" style={{ borderTop: borderSubtle }}>
              <div className="text-xs mb-0.5" style={textMuted}>Booking Memo</div>
              <div className="text-sm" style={{ lineHeight: '1.625', ...textPrimary }}>{step2Form.bookingMemo}</div>
            </div>
          )}
        </ReviewSection>

        {/* ── Booking Summary ────────────────────────────────────────────── */}
        <BookingSummaryCard />
        <p className="text-xs px-1" style={{ color: colors.textMuted }}>
          Please review all information carefully before confirming your booking.
        </p>

        {/* ── Terms & Conditions ─────────────────────────────────────────── */}
        <div
          className="rounded-xl overflow-hidden"
          style={{
            background: isDark ? 'rgba(220, 181, 21, 0.08)' : 'rgba(220, 181, 21, 0.12)',
            border: isDark ? '1px solid rgba(220, 181, 21, 0.25)' : '1px solid rgba(220, 181, 21, 0.35)',
          }}
        >
          <div
            className="px-5 py-3 flex items-center gap-2.5"
            style={{
              background: isDark 
                ? 'linear-gradient(90deg, rgba(220, 181, 21, 0.2) 0%, rgba(180, 140, 10, 0.12) 100%)'
                : 'linear-gradient(90deg, rgba(220, 181, 21, 0.25) 0%, rgba(180, 140, 10, 0.15) 100%)',
              borderBottom: isDark ? '1px solid rgba(220, 181, 21, 0.2)' : '1px solid rgba(220, 181, 21, 0.25)',
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ 
                background: isDark ? 'rgba(220, 181, 21, 0.2)' : 'rgba(220, 181, 21, 0.3)', 
                border: isDark ? '1px solid rgba(220, 181, 21, 0.3)' : '1px solid rgba(220, 181, 21, 0.4)' 
              }}
            >
              <FileText className="w-4 h-4" style={{ color: isDark ? 'rgb(251, 191, 36)' : 'rgb(180, 140, 10)' }} />
            </div>
            <span className="text-sm font-medium" style={textPrimary}>Terms & Conditions</span>
          </div>
          <div className="px-5 py-4">
            <div className="space-y-3 mb-4">
              <div className="flex items-start gap-2.5">
                <div 
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                  style={{ background: isDark ? 'rgb(220, 181, 21)' : 'rgb(180, 140, 10)' }}
                />
                <p className="text-xs leading-relaxed" style={textPrimary}>
                  Lounge reservation shall be made <span className="font-medium" style={{ color: isDark ? 'rgb(251, 191, 36)' : 'rgb(180, 140, 10)' }}>at least 48 hours in advance</span>.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <div 
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                  style={{ background: isDark ? 'rgb(220, 181, 21)' : 'rgb(180, 140, 10)' }}
                />
                <p className="text-xs leading-relaxed" style={textPrimary}>
                  Payment needs to be settled <span className="font-medium" style={{ color: isDark ? 'rgb(251, 191, 36)' : 'rgb(180, 140, 10)' }}>at least 12 hours prior to the flight time</span>, otherwise it will be treated as cancelled.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <div 
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                  style={{ background: isDark ? 'rgb(220, 181, 21)' : 'rgb(180, 140, 10)' }}
                />
                <p className="text-xs leading-relaxed" style={textPrimary}>
                  <span className="font-medium" style={{ color: isDark ? 'rgb(251, 191, 36)' : 'rgb(180, 140, 10)' }}>No ad-hoc amendment</span> of booking, and booking is <span className="font-medium" style={{ color: isDark ? 'rgb(251, 191, 36)' : 'rgb(180, 140, 10)' }}>non-transferable</span>.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <div 
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                  style={{ background: isDark ? 'rgb(220, 181, 21)' : 'rgb(180, 140, 10)' }}
                />
                <p className="text-xs leading-relaxed" style={textPrimary}>
                  <span className="font-medium" style={{ color: isDark ? 'rgb(251, 191, 36)' : 'rgb(180, 140, 10)' }}>No refund</span> if cancellation is made <span className="font-medium" style={{ color: isDark ? 'rgb(251, 191, 36)' : 'rgb(180, 140, 10)' }}>less than 48 hours</span>.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <div 
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                  style={{ background: isDark ? 'rgb(220, 181, 21)' : 'rgb(180, 140, 10)' }}
                />
                <p className="text-xs leading-relaxed" style={textPrimary}>
                  <span className="font-medium" style={{ color: isDark ? 'rgb(251, 191, 36)' : 'rgb(180, 140, 10)' }}>No ad-hoc guests</span> will be accepted.
                </p>
              </div>
            </div>

            {/* Agreement Checkbox */}
            <div
              className="rounded-lg px-4 py-3.5"
              style={{
                background: isDark ? 'rgba(0, 0, 0, 0.25)' : 'rgba(255, 255, 255, 0.5)',
                border: isDark ? '1px solid rgba(220, 181, 21, 0.2)' : '1px solid rgba(220, 181, 21, 0.3)',
              }}
            >
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={acceptedTC}
                    onChange={(e) => setAcceptedTC(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div
                    className="w-5 h-5 rounded border-2 transition-all peer-checked:border-[rgb(220,181,21)] peer-checked:bg-[rgb(220,181,21)] flex items-center justify-center"
                    style={{
                      borderColor: acceptedTC 
                        ? 'rgb(220, 181, 21)' 
                        : isDark ? 'rgba(255, 255, 255, 0.3)' : 'rgba(200, 199, 190, 0.6)',
                      background: acceptedTC 
                        ? 'linear-gradient(135deg, rgb(220, 181, 21) 0%, rgb(180, 140, 10) 100%)'
                        : 'transparent',
                    }}
                  >
                    {acceptedTC && (
                      <CheckCircle className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                    )}
                  </div>
                </div>
                <span className="text-sm leading-relaxed" style={textPrimary}>
                  I have read and agree to the Terms & Conditions stated above
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* ── Navigation Buttons ─────────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={handleBackToStep4}
              className="py-3 px-6 rounded-xl text-sm transition-all hover:opacity-80 flex items-center justify-center gap-2"
              style={backBtnStyle}
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Edit
            </button>
            <button
              type="button"
              onClick={handleFinalConfirm}
              disabled={!acceptedTC || isSubmitting}
              className="py-3 px-6 rounded-xl text-white text-sm transition-all hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(90deg, rgb(220, 181, 21) 0%, rgb(180, 140, 10) 100%)' }}
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Confirm Booking Request
                </>
              )}
            </button>
          </div>
          {!acceptedTC && (
            <div
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg"
              style={{
                background: isDark ? 'rgba(220, 181, 21, 0.1)' : 'rgba(220, 181, 21, 0.15)',
                border: isDark ? '1px solid rgba(220, 181, 21, 0.2)' : '1px solid rgba(220, 181, 21, 0.3)',
              }}
            >
              <Info className="w-4 h-4 flex-shrink-0" style={{ color: isDark ? 'rgb(251, 191, 36)' : 'rgb(180, 140, 10)' }} />
              <p className="text-xs text-center" style={{ color: isDark ? 'rgb(251, 191, 36)' : 'rgb(180, 140, 10)' }}>
                Please accept the Terms & Conditions to proceed with your booking
              </p>
            </div>
          )}
        </div>
      </div>
      {stepLoadingOverlay}
      </>
    );
  }

  // ── Step 3: Add-on Services ───────────────────────────────────────────────
  if (currentStep === 3) {
    return (
      <>
      <form onSubmit={handleNextFromStep3}>
        <div className="space-y-4 pb-8">
          {/* Progress bar */}
          <BookingStepProgress skipAddons={noAddonRequired} />

          {/* Header */}
          <div>
            <h1
              className="text-xl"
              style={{
                background: 'linear-gradient(90deg, rgb(220, 181, 21) 0%, rgb(180, 140, 10) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Step 3: Add-on Services
            </h1>
            <p className="text-xs mt-1" style={textMuted}>
              Enhance your lounge experience with optional services
            </p>
          </div>

          {/* ── Book for Member Banner ──────────────────────────────────── */}
          {prefillMember && (
            <div
              className="rounded-xl px-4 py-3.5 flex items-start gap-3"
              style={{
                background: isDark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)',
                border: isDark ? '1px solid rgba(59,130,246,0.35)' : '1px solid rgba(59,130,246,0.3)',
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.15)' }}
              >
                <CalendarPlus className="w-4 h-4" style={{ color: '#60a5fa' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: isDark ? '#93c5fd' : 'rgb(37,99,235)' }}>
                  Booking on behalf of{' '}
                  <strong>{prefillMember.title} {prefillMember.firstName} {prefillMember.lastName}</strong>
                </p>
                <p className="text-xs mt-0.5" style={{ color: isDark ? 'rgba(147,197,253,0.75)' : 'rgba(37,99,235,0.7)' }}>
                  Vouchers deducted from this member&apos;s account · Balance: {prefillMember.voucherCount} vouchers
                </p>
              </div>
            </div>
          )}

          {/* ── Travel Agency Benefits Banner ───────────────────────────── */}
          {isTravelAgency && (
            <div
              className="rounded-xl p-4"
              style={{
                background: isDark
                  ? 'linear-gradient(135deg, rgba(16,185,129,0.15) 0%, rgba(5,150,105,0.08) 100%)'
                  : 'linear-gradient(135deg, rgba(16,185,129,0.2) 0%, rgba(5,150,105,0.12) 100%)',
                border: isDark ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(16,185,129,0.5)',
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: isDark ? 'rgba(16,185,129,0.2)' : 'rgba(16,185,129,0.3)' }}
                >
                  <BadgeCheck className="w-5 h-5" style={{ color: isDark ? '#34d399' : 'rgb(5, 150, 105)' }} />
                </div>
                <div className="flex-1">
                  <div className="text-sm mb-1" style={{ color: isDark ? '#6ee7b7' : 'rgb(5, 150, 105)' }}>Travel Agency – Pre-Negotiated Benefits Active</div>
                  <div className="text-xs mb-3" style={textMuted}>
                    Discounts are automatically applied to all add-on services.
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {[
                      { label: 'Lounge Extension', pct: Math.round(TA_DISCOUNT_LOUNGE * 100), orig: 500, disc: loungeRate },
                      { label: 'Limousine Service', pct: Math.round(TA_DISCOUNT_LIMO * 100), orig: 1200, disc: limoRate },
                      { label: 'Wheelchair Assist.', pct: Math.round(TA_DISCOUNT_WHEELCHAIR * 100), orig: 300, disc: wheelchairRate },
                    ].map((item) => (
                      <div key={item.label} className="rounded-lg p-2 text-center" style={taInfoBoxBg}>
                        <div className="text-green-400 text-xs mb-0.5">{item.pct}% off</div>
                        <div className="text-xs line-through" style={textMuted}>HK${item.orig.toLocaleString()}</div>
                        <div className="text-xs" style={textPrimary}>HK${item.disc.toLocaleString()}</div>
                        <div className="text-xs mt-0.5" style={textMuted}>{item.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="flex items-center gap-2">
                    <Banknote className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                    <span className="text-green-300 text-xs">Payment: <span style={textPrimary}>{TA_PAYMENT_METHOD}</span></span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Add-on Services ─────────────────────────────────────────── */}
          <div className="p-5" style={card}>
            <SectionHeader
              title="Add-on Services"
              subtitle="Enhance your experience with optional services"
              onQuickFill={handleStep2QuickFill}
            />

            {/* Lounge Extension */}
            <SubSectionLabel label="Extension of Stay in VIP Lounge (Hours)" />
            <StepperCard
              icon={<Clock className="w-5 h-5 text-white" />}
              iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
              title="Lounge Extension"
              subtitle={isTravelAgency ? 'HK$' + loungeRate + '/hr (was HK$500 · 15% TA off)' : 'HK$500 per hour'}
              value={step2Form.loungeExtension}
              onDecrement={() => updateStep2Count('loungeExtension', -1)}
              onIncrement={() => updateStep2Count('loungeExtension', 1)}
            />

            {/* Limousine Service */}
            <SubSectionLabel label="Airport Limousine Transfer Service" />
            <StepperCard
              icon={<Car className="w-5 h-5 text-white" />}
              iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
              title="Limousine Service"
              subtitle={isTravelAgency ? 'HK$' + limoRate + '/vehicle (was HK$1,200 · 20% TA off)' : 'HK$1,200 per vehicle'}
              value={step2Form.limousineService}
              onDecrement={() => updateStep2Count('limousineService', -1)}
              onIncrement={() => updateStep2Count('limousineService', 1)}
            />

            {step2Form.limousineService > 0 && (
              <div className="mt-3 space-y-3">
                {form.flightType === 'Departure' && (
                  <div
                    className="p-3 rounded-lg text-sm"
                    style={{
                      background: isDark ? 'rgba(220,181,21,0.1)' : 'rgba(220,181,21,0.15)',
                      border: isDark ? '1px solid rgba(220,181,21,0.3)' : '1px solid rgba(220,181,21,0.4)',
                      color: isDark ? 'rgba(220,181,21,1)' : 'rgba(180,145,17,1)',
                    }}
                  >
                    ⚠️ Extra charges will apply if waiting time is exceeded at pick-up point.
                  </div>
                )}
                {step2Form.destinationAddresses.map((address, index) => (
                  <div key={index}>
                    <label className={labelClass}>
                      {step2Form.limousineService > 1 ? 'Destination / Pick-up Point #' + (index + 1) : 'Destination / Pick-up Point'} *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => handleDestinationAddressChange(index, e.target.value)}
                        required
                        placeholder="Enter destination or pick-up point"
                        style={fieldStyle}
                        className={fieldClass + ' pl-10'}
                      />
                    </div>
                  </div>
                ))}
                {form.flightType === 'Departure' && (
                  <div>
                    <label className={labelClass}>Pick-up Time *</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="time"
                        value={step2Form.limousinePickupTime}
                        onChange={(e) => setStep2Form((p) => ({ ...p, limousinePickupTime: e.target.value }))}
                        required
                        style={fieldStyle}
                        className={fieldClass + ' pl-10'}
                      />
                    </div>
                  </div>
                )}
                {step2Form.limousineStops.map((stop, index) => (
                  <div key={'stop-' + index}>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className={labelClass}>Additional Stop #{index + 1}</label>
                      <button type="button" onClick={() => removeStop(index)} className="text-xs text-red-400 hover:text-red-300 transition-colors">Remove</button>
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        value={stop}
                        onChange={(e) => handleStopChange(index, e.target.value)}
                        placeholder="Enter stop address"
                        style={fieldStyle}
                        className={fieldClass + ' pl-10'}
                      />
                    </div>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addStop}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm transition-all hover:opacity-80"
                  style={{
                    background: isDark ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.25)',
                    border: isDark ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(59,130,246,0.5)',
                    color: isDark ? '#ffffff' : 'rgb(37,99,235)',
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Add Stop
                </button>
              </div>
            )}

            {/* Wheelchair Service */}
            <SubSectionLabel label="Wheelchair Service" />
            <StepperCard
              icon={<Accessibility className="w-5 h-5 text-white" />}
              iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
              title="Wheelchair Assistance"
              subtitle={isTravelAgency ? 'HK$' + wheelchairRate + '/service (was HK$300 · 10% TA off)' : 'HK$300 per service'}
              value={step2Form.wheelchairService}
              onDecrement={() => updateStep2Count('wheelchairService', -1)}
              onIncrement={() => updateStep2Count('wheelchairService', 1)}
            />

            {step2Form.wheelchairService > 0 && (
              <div className="mt-3">
                <label className={labelClass}>Passenger Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={step2Form.wheelchairPassengerName}
                    onChange={(e) => setStep2Form((p) => ({ ...p, wheelchairPassengerName: e.target.value }))}
                    required
                    placeholder="Enter passenger name"
                    style={fieldStyle}
                    className={fieldClass + ' pl-10'}
                  />
                </div>
              </div>
            )}

            {/* Security Service */}
            <SubSectionLabel label="Security Service" />
            <ToggleCard
              icon={<Shield className="w-5 h-5 text-white" />}
              iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
              title="Security Escort Service"
              subtitle="Personal security personnel"
              checked={step2Form.securityService}
              onChange={(v) => setStep2Form((p) => ({ ...p, securityService: v }))}
            />

            {step2Form.securityService && (
              <div
                className="mt-3 p-3 rounded-lg text-sm"
                style={{
                  background: isDark ? 'rgba(220,181,21,0.1)' : 'rgba(220,181,21,0.15)',
                  border: isDark ? '1px solid rgba(220,181,21,0.3)' : '1px solid rgba(220,181,21,0.4)',
                  color: isDark ? 'rgba(220,181,21,1)' : 'rgba(180,145,17,1)',
                }}
              >
                💰 Separate charges are required for security service. Our team will contact you for pricing details.
              </div>
            )}
          </div>

          {/* ── Navigation Buttons ──────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={handleBackToStep2}
              className="py-3 px-6 rounded-xl text-sm transition-all hover:opacity-80 flex items-center justify-center gap-2"
              style={backBtnStyle}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              type="submit"
              className="py-3 px-6 rounded-xl text-white text-sm transition-all hover:opacity-90 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(90deg, rgb(220, 181, 21) 0%, rgb(180, 140, 10) 100%)' }}
            >
              Next: Other Information
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
      {stepLoadingOverlay}
      </>
    );
  }

  // ── Step 4: Other Information & Checkout ─────────────────────────────────
  if (currentStep === 4) {

    // ── Membership card pre-computed styles ──────────────────────────────────
    const membershipCardBg = isDark
      ? (useMembership ? 'rgba(220,181,21,0.09)' : 'rgba(255,255,255,0.06)')
      : (useMembership ? 'rgba(220,181,21,0.08)' : 'rgba(231,230,221,0.7)');
    const membershipCardBorder = useMembership
      ? '1px solid rgba(220,181,21,0.45)'
      : (isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(200,199,190,0.6)');
    const toggleTrackBg = useMembership
      ? 'linear-gradient(135deg, rgb(220,181,21), rgb(180,140,10))'
      : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(200,199,190,0.6)');
    const toggleKnobLeft = useMembership ? '22px' : '2px';
    const voucherStepperBg = isDark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.9)';
    const voucherStepperBorder = isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(200,199,190,0.6)';
    const voucherBtnBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(231,230,221,0.6)';
    const voucherBtnBorder = isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(200,199,190,0.5)';
    const voucherBadgeBg = isDark ? 'rgba(220,181,21,0.15)' : 'rgba(220,181,21,0.12)';
    const voucherSuiteBadgeBg = isDark ? 'rgba(52,199,89,0.12)' : 'rgba(52,199,89,0.09)';
    const voucherInfoBg = isDark ? 'rgba(220,181,21,0.08)' : 'rgba(220,181,21,0.06)';
    const voucherInfoBorder = '1px solid rgba(220,181,21,0.25)';
    const suiteInfoBg = isDark ? 'rgba(52,199,89,0.07)' : 'rgba(52,199,89,0.06)';
    const suiteInfoBorder = '1px solid rgba(52,199,89,0.25)';
    const voucherSavingBg = isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.12)';
    const voucherSavingBorder = isDark ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(16,185,129,0.4)';
    const voucherSavingColor = isDark ? '#34d399' : 'rgb(5,150,105)';
    const maxReachedBg = isDark ? 'rgba(239,68,68,0.08)' : 'rgba(239,68,68,0.06)';
    const maxReachedColor = isDark ? '#f87171' : '#dc2626';
    const bookingSaving = bookingVouchersToUse * BOOKING_VOUCHER_VALUE;
    const isBookingMaxed = bookingVouchersToUse >= availableBookingVouchers;
    const isSuiteMaxed = suiteVouchersToUse >= availableSuiteVouchers;
    const totalVoucherSaving = bookingSaving;
    const hasSuiteVouchers = availableSuiteVouchers > 0;
    const sectionDivider = isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(200,199,190,0.35)';

    // Pre-compute voucher saving summary text to avoid chained ternary in JSX
    let voucherSavingSummaryText = '';
    if (bookingVouchersToUse > 0 && suiteVouchersToUse > 0) {
      const suitePlural = suiteVouchersToUse !== 1 ? 's' : '';
      voucherSavingSummaryText = 'Saving HKD ' + totalVoucherSaving.toLocaleString() + ' + ' + suiteVouchersToUse + ' suite upgrade' + suitePlural + ' applied.';
    } else if (bookingVouchersToUse > 0) {
      const bookingPlural = bookingVouchersToUse !== 1 ? 's' : '';
      voucherSavingSummaryText = 'Saving HKD ' + totalVoucherSaving.toLocaleString() + ' with ' + bookingVouchersToUse + ' booking voucher' + bookingPlural + '.';
    } else {
      const suitePlural = suiteVouchersToUse !== 1 ? 's' : '';
      voucherSavingSummaryText = suiteVouchersToUse + ' complimentary suite upgrade' + suitePlural + ' applied.';
    }

    // Pre-compute summary row values for vouchers to avoid nested template literals in JSX
    const summaryBookingVoucherPlural = bookingVouchersToUse !== 1 ? 's' : '';
    const summaryBookingVoucherValue = bookingVouchersToUse + ' voucher' + summaryBookingVoucherPlural + ' (\u2212HKD ' + (bookingVouchersToUse * BOOKING_VOUCHER_VALUE).toLocaleString() + ')';
    const summarySuiteVoucherPlural = suiteVouchersToUse !== 1 ? 's' : '';
    const summarySuiteVoucherValue = suiteVouchersToUse + ' upgrade' + summarySuiteVoucherPlural + ' applied';
    const summaryLuggagePlural = step2Form.luggageCount !== 1 ? 's' : '';
    const summaryLuggageValue = step2Form.luggageCount + ' piece' + summaryLuggagePlural;

    return (
      <>
      <form onSubmit={handleGoToReview}>
        <div className="space-y-4 pb-8">
          {/* Progress bar */}
          <BookingStepProgress skipAddons={noAddonRequired} />

          {/* Page header */}
          <div>
            <h1
              className="text-xl"
              style={{
                background: 'linear-gradient(90deg, rgb(220, 181, 21) 0%, rgb(180, 140, 10) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Step 4: Other Information &amp; Checkout
            </h1>
            <p className="text-xs mt-1" style={textMuted}>
              Add luggage info, membership vouchers, and contact details
            </p>
          </div>

          {/* ── Book for Member Banner ──────────────────────────────────── */}
          {prefillMember && (
            <div
              className="rounded-xl px-4 py-3.5 flex items-start gap-3"
              style={{
                background: isDark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)',
                border: isDark ? '1px solid rgba(59,130,246,0.35)' : '1px solid rgba(59,130,246,0.3)',
              }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.15)' }}
              >
                <CalendarPlus className="w-4 h-4" style={{ color: '#60a5fa' }} />
              </div>
              <div>
                <p className="text-sm" style={{ color: isDark ? '#93c5fd' : 'rgb(37,99,235)' }}>
                  Booking on behalf of{' '}
                  <strong>{prefillMember.title} {prefillMember.firstName} {prefillMember.lastName}</strong>
                </p>
                <p className="text-xs mt-0.5" style={{ color: isDark ? 'rgba(147,197,253,0.75)' : 'rgba(37,99,235,0.7)' }}>
                  Vouchers deducted from this member&apos;s account · Balance: {prefillMember.voucherCount} vouchers
                </p>
              </div>
            </div>
          )}


          {/* ── Other Information ───────────────────────────────────────── */}
          <div className="p-5" style={card}>
            <SectionHeader
              title="Other Information"
              subtitle="Additional travel details"
              onQuickFill={handleStep2QuickFill}
            />

            {/* Luggage Count */}
            <SubSectionLabel label="Number of Luggage" />
            <StepperCard
              icon={<Package className="w-5 h-5 text-white" />}
              iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
              title="Luggage Count"
              subtitle="Number of luggage pieces"
              value={step2Form.luggageCount}
              onDecrement={() => updateStep2Count('luggageCount', -1)}
              onIncrement={() => updateStep2Count('luggageCount', 1)}
            />

            {/* Private Transport */}
            <SubSectionLabel label="Private Transport" />
            <StepperCard
              icon={<Car className="w-5 h-5 text-white" />}
              iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
              title="Private Transport"
              subtitle="Arriving with own vehicle"
              value={step2Form.privateTransport}
              onDecrement={() => updateStep2Count('privateTransport', -1)}
              onIncrement={() => updateStep2Count('privateTransport', 1)}
            />

            {step2Form.privateTransport > 0 && (
              <div className="mt-4 space-y-4">
                {/* Driver Information */}
                <div>
                  <div className="text-xs mb-3" style={textPrimary}>Driver Information</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Driver Name *</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={step2Form.driverName}
                          onChange={(e) =>
                            setStep2Form((p) => ({ ...p, driverName: e.target.value }))
                          }
                          required
                          placeholder="Driver name"
                          style={fieldStyle}
                          className={fieldClass + ' pl-10'}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Driver Contact *</label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={step2Form.driverContact}
                          onChange={(e) =>
                            setStep2Form((p) => ({ ...p, driverContact: e.target.value }))
                          }
                          required
                          placeholder="+852 XXXX XXXX"
                          style={fieldStyle}
                          className={fieldClass + ' pl-10'}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Private Car */}
                <div>
                  <div className="text-xs mb-3" style={textPrimary}>Private Car</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>Car Plate No. *</label>
                      <div className="relative">
                        <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={step2Form.carPlateNo}
                          onChange={(e) =>
                            setStep2Form((p) => ({
                              ...p,
                              carPlateNo: e.target.value.toUpperCase(),
                            }))
                          }
                          required
                          placeholder="e.g. HK1234"
                          style={fieldStyle}
                          className={fieldClass + ' pl-10 uppercase'}
                        />
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>Address *</label>
                      <div className="relative">
                        <Hotel className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={step2Form.hotelName}
                          onChange={(e) =>
                            setStep2Form((p) => ({ ...p, hotelName: e.target.value }))
                          }
                          required
                          placeholder="Address"
                          style={fieldStyle}
                          className={fieldClass + ' pl-10'}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ── Use My Membership ────────────────────────────────────────── */}
          <div className="p-5 rounded-xl" style={{ background: membershipCardBg, border: membershipCardBorder }}>

            {/* Header row — title + toggle */}
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <BadgeCheck className="w-4 h-4" style={{ color: 'rgb(220,181,21)' }} />
                <span className="text-sm" style={textPrimary}>Use My Membership to Checkout</span>
              </div>
              <button
                type="button"
                onClick={handleToggleMembership}
                aria-label="Toggle membership checkout"
                className="relative flex-shrink-0 w-12 h-6 rounded-full transition-all duration-200 focus:outline-none"
                style={{ background: toggleTrackBg }}
              >
                <span
                  className="absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200"
                  style={{ left: toggleKnobLeft }}
                />
              </button>
            </div>

            {/* Sub-label */}
            <div className="text-xs mb-4" style={textMuted}>
              Apply membership vouchers to offset the cost of this booking
            </div>

            {/* Available voucher badges row */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span
                className="text-xs px-2.5 py-1 rounded-full"
                style={{ background: voucherBadgeBg, color: 'rgb(220,181,21)', border: '1px solid rgba(220,181,21,0.35)' }}
              >
                {availableBookingVouchers} Booking Voucher{availableBookingVouchers !== 1 ? 's' : ''} · HKD {BOOKING_VOUCHER_VALUE} each
              </span>
              {hasSuiteVouchers && (
                <span
                  className="text-xs px-2.5 py-1 rounded-full"
                  style={{ background: voucherSuiteBadgeBg, color: 'rgb(52,199,89)', border: '1px solid rgba(52,199,89,0.35)' }}
                >
                  {availableSuiteVouchers} Suite Upgrade Voucher{availableSuiteVouchers !== 1 ? 's' : ''}
                </span>
              )}
            </div>

            {/* ── Voucher pickers — only shown when toggle is ON ── */}
            {useMembership && (
              <div className="space-y-5">

                {/* ── 1. Booking Vouchers ── */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-3.5 h-3.5" style={{ color: 'rgb(220,181,21)' }} />
                    <span className="text-xs" style={textPrimary}>Booking Vouchers</span>
                    <span className="text-xs" style={textMuted}>— HKD {BOOKING_VOUCHER_VALUE} off per voucher</span>
                  </div>

                  <div className="flex items-center gap-3 mb-2">
                    <button
                      type="button"
                      onClick={handleBookingVoucherDecrement}
                      disabled={bookingVouchersToUse === 0}
                      className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:opacity-80 disabled:opacity-30"
                      style={{ background: voucherBtnBg, border: voucherBtnBorder }}
                    >
                      <Minus className="w-4 h-4" style={textPrimary} />
                    </button>
                    <div
                      className="flex-1 flex items-center justify-center rounded-lg py-2"
                      style={{ background: voucherStepperBg, border: voucherStepperBorder }}
                    >
                      <span className="text-xl tabular-nums" style={{ color: 'rgb(220,181,21)' }}>
                        {bookingVouchersToUse}
                      </span>
                      <span className="text-xs ml-1.5" style={textMuted}>/ {availableBookingVouchers}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleBookingVoucherIncrement}
                      disabled={isBookingMaxed}
                      className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:opacity-80 disabled:opacity-30"
                      style={{ background: voucherBtnBg, border: voucherBtnBorder }}
                    >
                      <Plus className="w-4 h-4" style={textPrimary} />
                    </button>
                  </div>

                  {bookingVouchersToUse > 0 && (
                    <div className="rounded-lg px-4 py-2.5 flex items-center justify-between" style={{ background: voucherInfoBg, border: voucherInfoBorder }}>
                      <span className="text-xs" style={textMuted}>
                        {bookingVouchersToUse} × HKD {BOOKING_VOUCHER_VALUE}
                      </span>
                      <span className="text-xs" style={{ color: 'rgb(220,181,21)' }}>
                        − HKD {bookingSaving.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {isBookingMaxed && (
                    <div className="rounded-lg px-3 py-2 flex items-center gap-2 mt-1.5" style={{ background: maxReachedBg, border: '1px solid rgba(239,68,68,0.25)' }}>
                      <Info className="w-3 h-3 flex-shrink-0" style={{ color: maxReachedColor }} />
                      <span className="text-xs" style={{ color: maxReachedColor }}>All {availableBookingVouchers} booking vouchers used.</span>
                    </div>
                  )}
                </div>

                {/* ── 2. Suite Upgrade Vouchers (always visible; shows unavailable state for Individual) ── */}
                <div style={{ paddingTop: '16px', borderTop: sectionDivider }}>
                  <div className="flex items-center gap-2 mb-2">
                    <Crown className="w-3.5 h-3.5" style={{ color: 'rgb(52,199,89)' }} />
                    <span className="text-xs" style={textPrimary}>Suite Upgrade Vouchers</span>
                    <span className="text-xs" style={textMuted}>— complimentary Premiere Suite upgrade</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <button
                        type="button"
                        onClick={handleSuiteVoucherDecrement}
                        disabled={suiteVouchersToUse === 0}
                        className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:opacity-80 disabled:opacity-30"
                        style={{ background: voucherBtnBg, border: voucherBtnBorder }}
                      >
                        <Minus className="w-4 h-4" style={textPrimary} />
                      </button>
                      <div
                        className="flex-1 flex items-center justify-center rounded-lg py-2"
                        style={{ background: voucherStepperBg, border: voucherStepperBorder }}
                      >
                        <span className="text-xl tabular-nums" style={{ color: 'rgb(52,199,89)' }}>
                          {suiteVouchersToUse}
                        </span>
                        <span className="text-xs ml-1.5" style={textMuted}>/ {availableSuiteVouchers}</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleSuiteVoucherIncrement}
                        disabled={isSuiteMaxed}
                        className="w-9 h-9 rounded-lg flex items-center justify-center transition-all hover:opacity-80 disabled:opacity-30"
                        style={{ background: voucherBtnBg, border: voucherBtnBorder }}
                      >
                        <Plus className="w-4 h-4" style={textPrimary} />
                      </button>
                    </div>

                    {suiteVouchersToUse > 0 && (
                      <div className="rounded-lg px-4 py-2.5 flex items-center justify-between" style={{ background: suiteInfoBg, border: suiteInfoBorder }}>
                        <span className="text-xs" style={textMuted}>
                          {suiteVouchersToUse} complimentary suite upgrade{suiteVouchersToUse !== 1 ? 's' : ''} applied
                        </span>
                        <span className="text-xs" style={{ color: 'rgb(52,199,89)' }}>✓ Applied</span>
                      </div>
                    )}
                    {isSuiteMaxed && (
                      <div className="rounded-lg px-3 py-2 flex items-center gap-2 mt-1.5" style={{ background: maxReachedBg, border: '1px solid rgba(239,68,68,0.25)' }}>
                        <Info className="w-3 h-3 flex-shrink-0" style={{ color: maxReachedColor }} />
                        <span className="text-xs" style={{ color: maxReachedColor }}>All {availableSuiteVouchers} suite upgrade vouchers used.</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* ── Total saving summary ── */}
                {(bookingVouchersToUse > 0 || suiteVouchersToUse > 0) && (
                  <div className="rounded-lg px-4 py-2.5 flex items-center gap-2" style={{ background: voucherSavingBg, border: voucherSavingBorder }}>
                    <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" style={{ color: voucherSavingColor }} />
                    <span className="text-xs" style={{ color: voucherSavingColor }}>
                      {voucherSavingSummaryText}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Payment & Billing (Travel Agency) / Promotion / Redemption Code (others) ── */}
          {isTravelAgency ? (
            <div className="p-5" style={card}>
              <div className="flex items-center gap-2 mb-1">
                <Banknote className="w-4 h-4 text-green-400" />
                <div className="text-sm" style={textPrimary}>Payment & Billing</div>
              </div>
              <div className="text-xs mb-4" style={textMuted}>
                Pre-negotiated payment terms applied automatically for your agency account
              </div>

              {/* Payment Method – locked for TA */}
              <div className="mb-4">
                <label className={labelClass}>Payment Method</label>
                <div
                  className="flex items-center gap-3 px-4 py-3 rounded-lg"
                  style={{ 
                    background: isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.18)', 
                    border: isDark ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(16,185,129,0.5)' 
                  }}
                >
                  <Banknote className="w-4 h-4 flex-shrink-0" style={{ color: isDark ? '#34d399' : 'rgb(5, 150, 105)' }} />
                  <div className="flex-1">
                    <div className="text-sm" style={textPrimary}>{TA_PAYMENT_METHOD}</div>
                    <div className="text-xs mt-0.5" style={textMuted}>
                      Auto-applied · Invoice issued within 3 business days
                    </div>
                  </div>
                  <Shield className="w-4 h-4 flex-shrink-0" style={{ color: isDark ? '#34d399' : 'rgb(5, 150, 105)' }} />
                </div>
              </div>

              {/* Billing Reference */}
              <div className="mb-4">
                <label className={labelClass}>Agency Billing Reference</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={step2Form.billingReference}
                    onChange={(e) =>
                      setStep2Form((p) => ({ ...p, billingReference: e.target.value.toUpperCase() }))
                    }
                    placeholder={TA_AGENCY_CODE}
                    style={fieldStyle}
                    className={fieldClass + ' pl-10 uppercase'}
                  />
                </div>
                <div className="text-xs mt-1.5" style={textMuted}>
                  Pre-filled from your agency profile. You may override if booking under a sub-account.
                </div>
              </div>

              {/* Credit terms info */}
              <div
                className="rounded-lg px-4 py-3"
                style={creditTermsBoxBg}
              >
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: 'Credit Terms', value: 'Net 30 days' },
                    { label: 'Currency', value: 'HKD' },
                    { label: 'Invoice Delivery', value: 'Email (auto)' },
                    { label: 'GST / VAT', value: 'Exempt (B2B)' },
                  ].map((row) => (
                    <div key={row.label}>
                      <div className="text-xs" style={textMuted}>{row.label}</div>
                      <div className="text-xs mt-0.5" style={textPrimary}>{row.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-5" style={card}>
              <div className="text-sm mb-1" style={textPrimary}>Promotion / Redemption Code</div>
              <div className="text-xs mb-4" style={textMuted}>Apply a promo code for discounts</div>
              <div>
                <label className={labelClass}>Promotion / Redemption Code (Optional)</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={step2Form.promotionCode}
                    onChange={(e) =>
                      setStep2Form((p) => ({ ...p, promotionCode: e.target.value.toUpperCase() }))
                    }
                    placeholder="e.g. HKIAL2024"
                    style={fieldStyle}
                    className={fieldClass + ' pl-10 pr-12 uppercase'}
                  />
                  <button
                    type="button"
                    onClick={() => setShowQRScanner(true)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-md flex items-center justify-center transition-all hover:opacity-80 active:scale-95"
                    style={{
                      background: 'rgba(220,181,21,0.18)',
                      border: '1px solid rgba(220,181,21,0.45)',
                    }}
                    title="Scan coupon QR code with camera"
                  >
                    <Camera className="w-3.5 h-3.5 text-yellow-400" />
                  </button>
                </div>

                {/* Validation messages */}
                {promoCodeStatus === 'valid' && step2Form.promotionCode && (
                  <div 
                    className="mt-3 p-2.5 rounded-lg text-sm flex items-start gap-2"
                    style={{
                      background: isDark ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.15)',
                      border: isDark ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(16, 185, 129, 0.4)',
                      color: isDark ? 'rgb(52, 211, 153)' : 'rgb(5, 150, 105)',
                    }}
                  >
                    <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Code <strong>{step2Form.promotionCode}</strong> is valid and will be applied to your booking.</span>
                  </div>
                )}

                {promoCodeStatus === 'invalid' && step2Form.promotionCode && (
                  <div 
                    className="mt-3 p-2.5 rounded-lg text-sm flex items-start gap-2"
                    style={{
                      background: isDark ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.15)',
                      border: isDark ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(239, 68, 68, 0.4)',
                      color: isDark ? 'rgb(248, 113, 113)' : 'rgb(185, 28, 28)',
                    }}
                  >
                    <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>Code <strong>{step2Form.promotionCode}</strong> is invalid. Please check and try again.</span>
                  </div>
                )}

                {promoCodeStatus === 'used' && step2Form.promotionCode && (
                  <div 
                    className="mt-3 p-2.5 rounded-lg text-sm flex items-start gap-2"
                    style={{
                      background: isDark ? 'rgba(220, 181, 21, 0.1)' : 'rgba(220, 181, 21, 0.15)',
                      border: isDark ? '1px solid rgba(220, 181, 21, 0.3)' : '1px solid rgba(220, 181, 21, 0.4)',
                      color: isDark ? 'rgba(220, 181, 21, 1)' : 'rgba(180, 145, 17, 1)',
                    }}
                  >
                    ⚠️ <span>Code <strong>{step2Form.promotionCode}</strong> has already been used or expired.</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5 mt-2">
                  <Camera className={`w-3 h-3 ${iconMutedClass}`} />
                  <span className="text-xs" style={textMuted}>
                    Tap the camera icon to scan your coupon QR code
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── Contact Person ──────────────────────────────────────────── */}
          <div className="p-5" style={card}>
            <div className="text-sm mb-1" style={textPrimary}>Contact Person of this Booking</div>
            <div className="text-xs mb-4" style={textMuted}>Primary contact for this reservation</div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className={labelClass}>Name *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={step2Form.contactName}
                    onChange={(e) =>
                      setStep2Form((p) => ({ ...p, contactName: e.target.value }))
                    }
                    required
                    placeholder="Full name"
                    style={fieldStyle}
                    className={fieldClass + ' pl-10'}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Contact Email *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={step2Form.contactEmail}
                    onChange={(e) =>
                      setStep2Form((p) => ({ ...p, contactEmail: e.target.value }))
                    }
                    required
                    placeholder="email@example.com"
                    style={fieldStyle}
                    className={fieldClass + ' pl-10'}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>Contact No. *</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={step2Form.contactNo}
                    onChange={(e) =>
                      setStep2Form((p) => ({ ...p, contactNo: e.target.value }))
                    }
                    required
                    placeholder="+852 XXXX XXXX"
                    style={fieldStyle}
                    className={fieldClass + ' pl-10'}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className={labelClass}>Booking Memo</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3.5 w-4 h-4 text-gray-400" />
                <textarea
                  value={step2Form.bookingMemo}
                  onChange={(e) =>
                    setStep2Form((p) => ({ ...p, bookingMemo: e.target.value }))
                  }
                  rows={4}
                  placeholder="Any special requests or notes for this booking…"
                  style={fieldStyle}
                  className={fieldClass + ' pl-10 resize-none'}
                />
              </div>
            </div>
          </div>

          {/* ── Complete Booking Summary ────────────────────────────────── */}
          <div
            className="rounded-xl overflow-hidden"
            style={{
              ...summaryPurpleBg,
            }}
          >
            <div
              className="px-5 py-3"
              style={{
                background: isDark
                  ? 'linear-gradient(90deg, rgba(124,58,237,0.3) 0%, rgba(13,148,136,0.2) 100%)'
                  : 'linear-gradient(90deg, rgba(220,181,21,0.2) 0%, rgba(180,140,10,0.1) 100%)',
                borderBottom: borderMedium,
              }}
            >
              <div className="text-sm" style={textPrimary}>Complete Booking Summary</div>
            </div>
            <div className="p-5">
              <div className={`divide-y ${dividerClass}`}>
                <SummaryRow label="Flight Number" value={form.flightNumber || '—'} />
                <SummaryRow label="Arrival Date" value={formatDate(form.date)} />
                {isCompany && <SummaryRow label="Client Company" value={companyName || '—'} />}
                <SummaryRow label="Flight Class" value={form.flightClass} />
                <SummaryRow label="Flight Type" value={form.flightType} />
                {flightDetails && (
                  <SummaryRow
                    label="Route"
                    value={`${flightDetails.origin} → ${flightDetails.destination}`}
                  />
                )}
                <SummaryRow label="Total Guests" value={String(totalGuests)} />
                <SummaryRow label="Premiere Suites" value={String(form.premiereSuites)} />
                <SummaryRow
                  label="VIP Passengers"
                  value={String(form.premiereVipPassengers + form.vipPassengers)}
                />
                <SummaryRow
                  label="Non-Flying Guests"
                  value={String(form.premiereNonFlyingGuests + form.nonFlyingGuests)}
                />
                {step2Form.loungeExtension > 0 && (
                  <SummaryRow
                    label="Lounge Extension"
                    value={`${step2Form.loungeExtension} hour${step2Form.loungeExtension !== 1 ? 's' : ''}`}
                  />
                )}
                {step2Form.limousineService > 0 && (
                  <SummaryRow
                    label="Limousine Service"
                    value={`${step2Form.limousineService} vehicle${step2Form.limousineService !== 1 ? 's' : ''}`}
                  />
                )}
                {step2Form.wheelchairService > 0 && (
                  <SummaryRow
                    label="Wheelchair Service"
                    value={String(step2Form.wheelchairService)}
                  />
                )}
                {step2Form.securityService && (
                  <SummaryRow
                    label="Security Escort Service"
                    value="Yes"
                  />
                )}
                {step2Form.luggageCount > 0 && (
                  <SummaryRow
                    label="Luggage Count"
                    value={summaryLuggageValue}
                  />
                )}
                <SummaryRow
                  label="Private Transport"
                  value={step2Form.privateTransport > 0 ? String(step2Form.privateTransport) : 'No'}
                />
                {useMembership && bookingVouchersToUse > 0 && (
                  <SummaryRow
                    label="Booking Vouchers"
                    value={summaryBookingVoucherValue}
                  />
                )}
                {useMembership && suiteVouchersToUse > 0 && (
                  <SummaryRow
                    label="Suite Upgrade Vouchers"
                    value={summarySuiteVoucherValue}
                  />
                )}
                {step2Form.promotionCode && (
                  <SummaryRow label="Promotion / Redemption Code" value={step2Form.promotionCode} />
                )}
                {isTravelAgency && (
                  <SummaryRow label="Payment Method" value={TA_PAYMENT_METHOD} />
                )}
                {isTravelAgency && step2Form.billingReference && (
                  <SummaryRow label="Billing Reference" value={step2Form.billingReference} />
                )}
              </div>


              <div className="pt-4 mt-4" style={{ borderTop: borderDivider }}>
                {vipContact !== '—' && (
                  <SummaryRow label="Contact Person" value={step2Form.contactName || vipContact} />
                )}
              </div>
            </div>
          </div>

          {/* ── Navigation Buttons ──────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={handleBackFromStep4}
              className="py-3 px-6 rounded-xl text-sm transition-all hover:opacity-80 flex items-center justify-center gap-2"
              style={backBtnStyle}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <button
              type="submit"
              className="py-3 px-6 rounded-xl text-white text-sm transition-all hover:opacity-90 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(90deg, rgb(220, 181, 21) 0%, rgb(180, 140, 10) 100%)' }}
            >
              Final Review
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* QR Scanner Modal */}
        {showQRScanner && (
          <QRScannerModal
            onDetected={(code) => {
              setStep2Form((p) => ({ ...p, promotionCode: code.toUpperCase() }));
              setShowQRScanner(false);
            }}
            onClose={() => setShowQRScanner(false)}
          />
        )}
      </form>
      {stepLoadingOverlay}
      </>
    );
  }

  // ── Step 1: Flight Information (standalone) ───────────────────────────────
  if (currentStep === 1) {
    const gradientTextS1: React.CSSProperties = {
      background: 'linear-gradient(90deg, rgb(220, 181, 21) 0%, rgb(180, 140, 10) 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text',
    };
    const taBadgeBgS1 = isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.2)';
    const taBadgeBorderS1 = isDark ? '1px solid rgba(16,185,129,0.35)' : '1px solid rgba(16,185,129,0.5)';
    const histBtnBgS1 = isDark
      ? 'linear-gradient(135deg,rgba(220,181,21,0.2) 0%,rgba(180,140,10,0.12) 100%)'
      : 'linear-gradient(135deg,rgba(220,181,21,0.25) 0%,rgba(180,140,10,0.15) 100%)';
    const histBtnBorderS1 = isDark ? '1px solid rgba(220,181,21,0.4)' : '1px solid rgba(220,181,21,0.5)';
    const histBtnColorS1 = isDark ? 'rgb(220,181,21)' : 'rgb(160,128,8)';
    const flightFoundBgS1 = isDark ? 'rgba(16,185,129,0.1)' : 'rgba(16,185,129,0.15)';
    const flightFoundBorderS1 = isDark ? '1px solid rgba(16,185,129,0.25)' : '1px solid rgba(16,185,129,0.4)';
    const flightFoundColorS1 = isDark ? '#34d399' : 'rgb(5, 150, 105)';
    const flightFoundTimeColorS1 = isDark ? '#34d399' : 'rgb(5, 150, 105)';
    const hintBgS1 = isDark ? 'rgba(220, 181, 21, 0.1)' : 'rgba(220, 181, 21, 0.15)';
    const hintBorderS1 = isDark ? '1px solid rgba(220, 181, 21, 0.2)' : '1px solid rgba(220, 181, 21, 0.3)';
    const hintColorS1 = isDark ? 'rgb(251, 191, 36)' : 'rgb(180, 140, 10)';
    const memberBannerBgS1 = isDark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)';
    const memberBannerBorderS1 = isDark ? '1px solid rgba(59,130,246,0.35)' : '1px solid rgba(59,130,246,0.3)';
    const memberBannerIconBgS1 = isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.15)';
    const memberBannerTextS1 = isDark ? '#93c5fd' : 'rgb(37,99,235)';
    const memberBannerSubS1 = isDark ? 'rgba(147,197,253,0.75)' : 'rgba(37,99,235,0.7)';
    return (
      <>
      <form onSubmit={handleNextStep}>
        <div className="space-y-4 pb-8">
          {/* Progress bar */}
          <BookingStepProgress skipAddons={false} />

          {/* Header row */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-xl" style={gradientTextS1}>Step 1: Flight Information</h1>
              <p className="text-xs mt-1" style={textMuted}>
                Reserve your lounge experience at Hong Kong International Airport
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {isTravelAgency && (
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                  style={{ background: taBadgeBgS1, border: taBadgeBorderS1 }}
                >
                  <BadgeCheck className="w-3.5 h-3.5" style={{ color: isDark ? '#34d399' : 'rgb(5, 150, 105)' }} />
                  <span className="text-xs" style={{ color: isDark ? '#6ee7b7' : 'rgb(5, 150, 105)' }}>TA Rates Active</span>
                </div>
              )}
              <button
                type="button"
                onClick={handleOpenHistoryDialog}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all hover:opacity-90"
                style={{ background: histBtnBgS1, border: histBtnBorderS1, color: histBtnColorS1 }}
              >
                <History className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden sm:inline">Use History as New Booking</span>
                <span className="sm:hidden">Use History</span>
              </button>
            </div>
          </div>

          {/* Book for Member Banner */}
          {prefillMember && (
            <div
              className="rounded-xl px-4 py-3.5 flex items-start gap-3"
              style={{ background: memberBannerBgS1, border: memberBannerBorderS1 }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                style={{ background: memberBannerIconBgS1 }}
              >
                <CalendarPlus className="w-4 h-4" style={{ color: '#60a5fa' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm" style={{ color: memberBannerTextS1 }}>
                  Booking on behalf of{' '}
                  <strong>{prefillMember.title} {prefillMember.firstName} {prefillMember.lastName}</strong>
                </p>
                <p className="text-xs mt-0.5" style={{ color: memberBannerSubS1 }}>
                  Membership: {prefillMember.membershipLabel}
                  {' · '}
                  Voucher balance: {prefillMember.voucherCount} voucher{prefillMember.voucherCount !== 1 ? 's' : ''}
                  {' '}(booking vouchers deducted from this member&apos;s account)
                </p>
              </div>
            </div>
          )}

          {/* Flight Information card */}
          <div className="p-5" style={card}>
            <SectionHeader title="Flight Information" onQuickFill={handleQuickFill} />

            {/* Flight Type toggle */}
            <div className="mb-4">
              <label className={labelClass}>Flight Type *</label>
              <div className="grid grid-cols-3 gap-3">
                {(['Arrival', 'Departure', 'Transition'] as const).map((type) => {
                  const active = form.flightType === type;
                  const planeRotation = type === 'Arrival' ? 'rotate(180deg)' : type === 'Transition' ? 'rotate(90deg)' : 'none';
                  const ftActiveBg = 'linear-gradient(135deg, rgb(220, 181, 21) 0%, rgb(180, 140, 10) 100%)';
                  const ftInactiveBg = isDark ? 'rgba(255,255,255,0.04)' : 'rgba(231,230,221,0.5)';
                  const ftInactiveBorder = isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(200,199,190,0.5)';
                  const ftBtnStyle: React.CSSProperties = active
                    ? { background: ftActiveBg }
                    : { background: ftInactiveBg, border: ftInactiveBorder };
                  const ftPlaneColor = active ? '#ffffff' : colors.text;
                  const ftLabelColor = active ? '#ffffff' : colors.text;
                  const handleFTClick = () => setForm((p) => ({ ...p, flightType: type }));
                  return (
                    <button key={type} type="button" onClick={handleFTClick} className="py-5 rounded-xl flex flex-col items-center gap-2 transition-all" style={ftBtnStyle}>
                      <Plane className="w-8 h-8" style={{ color: ftPlaneColor, transform: planeRotation }} />
                      <span className="text-sm" style={{ color: ftLabelColor }}>{type}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Arrival Date */}
            <div className="mb-4">
              <label className={labelClass}>Arrival Date *</label>
              <div className="relative">
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                  required
                  style={fieldStyle}
                  className={fieldClass + ' pr-10'}
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Flight Number */}
            <div className="mb-4">
              <label className={labelClass}>Flight Number</label>
              <div className="relative">
                <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={form.flightNumber}
                  onChange={(e) => handleFlightNumber(e.target.value)}
                  required
                  placeholder="e.g. CX888"
                  style={fieldStyle}
                  className={fieldClass + ' pl-10 uppercase'}
                />
              </div>
            </div>

            {/* Flight Info Found */}
            {flightDetails && (
              <div
                className="rounded-lg p-3 mb-4"
                style={{ background: flightFoundBgS1, border: flightFoundBorderS1 }}
              >
                <div className="flex items-center gap-1.5 text-xs mb-2" style={{ color: flightFoundColorS1 }}>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Flight Information Found</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-1 text-xs">
                  <div><span style={textMuted}>Origin: </span><span style={textPrimary}>{flightDetails.origin}</span></div>
                  <div><span style={textMuted}>Destination: </span><span style={textPrimary}>{flightDetails.destination}</span></div>
                  <div><span style={textMuted}>Arrival Time: </span><span style={{ color: flightFoundTimeColorS1 }}>{flightDetails.arrivalTime}</span></div>
                </div>
              </div>
            )}

            {/* Destination (Departure / Transition only) */}
            {(form.flightType === 'Departure' || form.flightType === 'Transition') && (
              <div className="mb-4">
                <label className={labelClass}>Destination *</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.destination}
                    onChange={(e) => setForm((p) => ({ ...p, destination: e.target.value }))}
                    required
                    placeholder="e.g. London Heathrow (LHR)"
                    style={fieldStyle}
                    className={fieldClass + ' pl-10'}
                  />
                </div>
              </div>
            )}

            {/* Flight Class */}
            <div className={isCompany ? 'mb-4' : ''}>
              <label className={labelClass}>Flight Class of Main VIP Passenger *</label>
              <div className="relative">
                <select
                  value={form.flightClass}
                  onChange={(e) => setForm((p) => ({ ...p, flightClass: e.target.value }))}
                  required
                  style={fieldStyle}
                  className={fieldClass + ' appearance-none pr-10 cursor-pointer'}
                >
                  <option value="Economy Class" className={optionBg}>Economy Class</option>
                  <option value="Business Class" className={optionBg}>Business Class</option>
                  <option value="First Class" className={optionBg}>First Class</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Company Code (Corporate / Travel Agency) */}
            {isCompany && (
              <div>
                <label className={labelClass}>Client Company Code</label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={form.companyCode}
                    onChange={(e) => handleCompanyCode(e.target.value)}
                    placeholder="e.g. CATHAY01"
                    style={fieldStyle}
                    className={fieldClass + ' pl-10 uppercase'}
                  />
                </div>
                {companyName && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs" style={{ color: flightFoundColorS1 }}>
                    <CheckCircle className="w-3 h-3" />
                    <span>{companyName}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => navigate('/mybooking')}
              className="py-3 px-6 rounded-xl text-sm transition-all hover:opacity-80"
              style={{ ...secondaryBtnStyle, color: colors.text }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!step1FlightValid}
              className="py-3 px-6 rounded-xl text-white text-sm transition-all hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(90deg, rgb(220, 181, 21) 0%, rgb(180, 140, 10) 100%)' }}
            >
              Next: Guest Selection
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {!step1FlightValid && (
            <div
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg"
              style={{ background: hintBgS1, border: hintBorderS1 }}
            >
              <Info className="w-4 h-4 flex-shrink-0" style={{ color: hintColorS1 }} />
              <p className="text-xs text-center" style={{ color: hintColorS1 }}>
                {step1FlightHintMsg}
              </p>
            </div>
          )}
        </div>

        {/* History Dialog */}
        {showHistoryDialog && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
          >
            <div
              className="w-full max-w-lg rounded-2xl overflow-hidden"
              style={{
                background: isDark ? '#0a1929' : '#FFFFFF',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(200,199,190,0.4)',
                boxShadow: '0 30px 70px rgba(0,0,0,0.5)',
              }}
            >
              <div
                className="flex items-center justify-between px-5 py-4"
                style={{
                  background: isDark
                    ? 'linear-gradient(90deg,rgba(220,181,21,0.2) 0%,rgba(180,140,10,0.1) 100%)'
                    : 'linear-gradient(90deg,rgba(220,181,21,0.18) 0%,rgba(180,140,10,0.08) 100%)',
                  borderBottom: isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(200,199,190,0.3)',
                }}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                    style={{ background: 'rgba(220,181,21,0.2)', border: '1px solid rgba(220,181,21,0.35)' }}
                  >
                    <History className="w-4 h-4" style={{ color: 'rgb(220,181,21)' }} />
                  </div>
                  <div>
                    <div className="text-sm" style={textPrimary}>Use History as New Booking</div>
                    <div className="text-xs" style={textMuted}>Select a past booking to pre-fill this form</div>
                  </div>
                </div>
                <button type="button" onClick={handleCloseHistoryDialog} className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:bg-white/10">
                  <X className="w-4 h-4" style={textMuted} />
                </button>
              </div>
              <div className="p-5 space-y-3 max-h-[60vh] overflow-y-auto">
                {HISTORY_BOOKINGS.map((b) => (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => handleSelectHistory(b)}
                    className="w-full text-left rounded-xl px-4 py-3.5 transition-all hover:opacity-80"
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(231,230,221,0.5)',
                      border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(200,199,190,0.4)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm" style={textPrimary}>{b.bookingRef}</span>
                          <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                              background: b.status === 'confirmed' ? 'rgba(220,181,21,0.15)' : 'rgba(16,185,129,0.15)',
                              color: b.status === 'confirmed' ? 'rgb(220,181,21)' : 'rgb(16,185,129)',
                              border: b.status === 'confirmed' ? '1px solid rgba(220,181,21,0.3)' : '1px solid rgba(16,185,129,0.3)',
                            }}
                          >
                            {b.status}
                          </span>
                        </div>
                        <div className="text-xs" style={textMuted}>{b.flightNumber} · {b.flightType} · {b.flightClass}</div>
                        <div className="text-xs mt-1" style={textMuted}>
                          Suite: {b.premiereSuites} · VIP: {b.premiereVipPassengers + b.vipPassengers} · Guests: {b.premiereNonFlyingGuests + b.nonFlyingGuests}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 flex-shrink-0 mt-1" style={textMuted} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </form>
      {stepLoadingOverlay}
      </>
    );
  }

  // ── Step 2 render (Suite & Guest Selection) ───────────────────────────────
  if (currentStep === 2) {
  // Pre-computed styles to avoid nested ternaries inside JSX style props
  const noAddonContainerBg = noAddonRequired
    ? (isDark ? 'rgba(220,181,21,0.1)' : 'rgba(220,181,21,0.12)')
    : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(231,230,221,0.6)');
  const noAddonContainerBorder = noAddonRequired
    ? (isDark ? '1px solid rgba(220,181,21,0.35)' : '1px solid rgba(220,181,21,0.45)')
    : (isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(200,199,190,0.5)');
  const noAddonToggleBg = noAddonRequired
    ? 'linear-gradient(90deg, rgb(220,181,21) 0%, rgb(180,140,10) 100%)'
    : (isDark ? 'rgba(255,255,255,0.15)' : 'rgba(180,178,168,0.5)');
  // Pre-compute helperText values to avoid chained ternaries and complex template literals in JSX props
  let premiereVipHelperText: string | undefined = undefined;
  if (form.premiereSuites === 0) {
    premiereVipHelperText = 'Please select at least 1 Premiere Suite first';
  } else {
    const cap = form.premiereSuites * 6;
    const used = form.premiereVipPassengers + form.premiereNonFlyingGuests;
    premiereVipHelperText = 'Maximum: ' + cap + ' total guests per ' + form.premiereSuites + ' suite(s) (' + used + '/' + cap + ' used)';
  }

  let premiereNfgHelperText: string | undefined = undefined;
  if (form.premiereVipPassengers === 0) {
    premiereNfgHelperText = 'Requires at least 1 VIP Passenger';
  } else if (form.premiereVipPassengers + form.premiereNonFlyingGuests >= form.premiereSuites * 6) {
    const used = form.premiereVipPassengers + form.premiereNonFlyingGuests;
    const cap = form.premiereSuites * 6;
    premiereNfgHelperText = 'Suite capacity reached (' + used + '/' + cap + ')';
  }

  let loungeNfgHelperText: string | undefined = undefined;
  if (form.vipPassengers === 0) {
    loungeNfgHelperText = 'Requires at least 1 VIP Passenger';
  } else if (form.nonFlyingGuests >= 3) {
    loungeNfgHelperText = 'Maximum 3 non-flying guests per booking';
  }

  const gradientTextS2: React.CSSProperties = {
    background: 'linear-gradient(90deg, rgb(220, 181, 21) 0%, rgb(180, 140, 10) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };

  return (
    <>
    <form onSubmit={handleNextFromStep2}>
      <div className="space-y-4 pb-8">
        {/* Progress bar */}
        <BookingStepProgress skipAddons={noAddonRequired} />

        {/* Step 2 header */}
        <div>
          <h1 className="text-xl" style={gradientTextS2}>Step 2: Suite &amp; Guest Selection</h1>
          <p className="text-xs mt-1" style={textMuted}>
            Select lounge areas, add VIP passengers and non-flying guests
          </p>
        </div>

        {/* ── Book for Member Banner ──────────────────────────────────────── */}
        {prefillMember && (
          <div
            className="rounded-xl px-4 py-3.5 flex items-start gap-3"
            style={{
              background: isDark ? 'rgba(59,130,246,0.12)' : 'rgba(59,130,246,0.08)',
              border: isDark ? '1px solid rgba(59,130,246,0.35)' : '1px solid rgba(59,130,246,0.3)',
            }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
              style={{ background: isDark ? 'rgba(59,130,246,0.2)' : 'rgba(59,130,246,0.15)' }}
            >
              <CalendarPlus className="w-4 h-4" style={{ color: '#60a5fa' }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm" style={{ color: isDark ? '#93c5fd' : 'rgb(37,99,235)' }}>
                Booking on behalf of{' '}
                <strong>{prefillMember.title} {prefillMember.firstName} {prefillMember.lastName}</strong>
              </p>
              <p className="text-xs mt-0.5" style={{ color: isDark ? 'rgba(147,197,253,0.75)' : 'rgba(37,99,235,0.7)' }}>
                Membership: {prefillMember.membershipLabel}
                {' · '}
                Voucher balance: {prefillMember.voucherCount} voucher{prefillMember.voucherCount !== 1 ? 's' : ''}
                {' '}(booking vouchers deducted from this member&apos;s account)
              </p>
            </div>
          </div>
        )}

        {/* ── Flight summary (read-only recap from step 1) ───────────────── */}
        {flightDetails && (
          <div
            className="rounded-xl px-4 py-3 flex items-center gap-3"
            style={{
              background: isDark ? 'rgba(16,185,129,0.08)' : 'rgba(16,185,129,0.1)',
              border: isDark ? '1px solid rgba(16,185,129,0.2)' : '1px solid rgba(16,185,129,0.35)',
            }}
          >
            <Plane className="w-4 h-4 flex-shrink-0" style={{ color: isDark ? '#34d399' : 'rgb(5,150,105)' }} />
            <div className="flex-1 min-w-0">
              <span className="text-xs" style={{ color: isDark ? '#34d399' : 'rgb(5,150,105)' }}>
                {form.flightNumber} · {form.flightType} · {form.flightClass}
              </span>
              <span className="text-xs ml-2" style={textMuted}>
                {flightDetails.origin} → {flightDetails.destination}
              </span>
            </div>
            <button
              type="button"
              onClick={handleBackToStep1}
              className="text-xs px-2.5 py-1 rounded-lg transition-all hover:opacity-80 flex-shrink-0"
              style={{
                background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(231,230,221,0.7)',
                color: colors.textMuted,
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(200,199,190,0.5)',
              }}
            >
              Edit
            </button>
          </div>
        )}

        {/* ── PLACEHOLDER to satisfy removed Flight Number section ─────── */}
        {!flightDetails && form.flightNumber && (
          <div
            className="rounded-xl px-4 py-3 flex items-center gap-3"
            style={{
              background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(231,230,221,0.5)',
              border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(200,199,190,0.4)',
            }}
          >
            <Plane className="w-4 h-4 flex-shrink-0" style={textMuted} />
            <span className="text-xs flex-1" style={textMuted}>
              {form.flightNumber} · {form.flightType} · {form.flightClass}
            </span>
            <button
              type="button"
              onClick={handleBackToStep1}
              className="text-xs px-2.5 py-1 rounded-lg transition-all hover:opacity-80 flex-shrink-0"
              style={{
                background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(231,230,221,0.7)',
                color: colors.textMuted,
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(200,199,190,0.5)',
              }}
            >
              Edit
            </button>
          </div>
        )}

        {/* ── 2 & 4. Premiere Suite + Lounge Deluxe — 2-col on desktop ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Premiere Suite */}
          <div className="p-5" style={card}>
            <SectionHeader
              title="Premiere Suite"
              subtitle="Includes stays equivalent to exclusive benefits"
              onQuickFill={handleQuickFill}
            />

            <div className="mb-4">
              <label className={labelClass}>Number of Premiere Suite</label>
              <StepperCard
                icon={<Building className="w-5 h-5 text-white" />}
                iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
                title="Premiere Suite"
                subtitle="Private suite with exclusive benefits"
                value={form.premiereSuites}
                onDecrement={() => updateCount('premiereSuites', -1)}
                onIncrement={() => updateCount('premiereSuites', 1)}
              />
            </div>

            <div className="mb-4">
              <label className={labelClass}>Number of VIP Passengers in Premiere Suite</label>
              <StepperCard
                icon={<Users className="w-5 h-5 text-white" />}
                iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
                title="VIP Passengers"
                subtitle="Select your VIP Passengers"
                value={form.premiereVipPassengers}
                onDecrement={() => updateCount('premiereVipPassengers', -1)}
                onIncrement={() => updateCount('premiereVipPassengers', 1)}
                incrementDisabled={
                  form.premiereVipPassengers + form.premiereNonFlyingGuests >= form.premiereSuites * 6
                }
                helperText={premiereVipHelperText}
              />
            </div>

            <div>
              <label className={labelClass}>Number of Non Flying Guests in Premiere Suite</label>
              <StepperCard
                icon={<User className="w-5 h-5 text-white" />}
                iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
                title="Non-Flying Guests"
                subtitle="Select non-flying Guests"
                value={form.premiereNonFlyingGuests}
                onDecrement={() => updateCount('premiereNonFlyingGuests', -1)}
                onIncrement={() => updateCount('premiereNonFlyingGuests', 1)}
                incrementDisabled={
                  form.premiereVipPassengers === 0 ||
                  form.premiereVipPassengers + form.premiereNonFlyingGuests >= form.premiereSuites * 6
                }
                helperText={premiereNfgHelperText}
              />
            </div>
          </div>

          {/* Lounge Deluxe */}
          <div className="p-5" style={card}>
            <SectionHeader
              title="Lounge Deluxe"
              subtitle="Exclusive lounge for VIP passengers and guests"
              onQuickFill={handleLoungeDeluxeQuickFill}
            />

            <div className="mb-4">
              <label className={labelClass}>Number of VIP Passengers in Lounge Deluxe</label>
              <StepperCard
                icon={<Users className="w-5 h-5 text-white" />}
                iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
                title="VIP Passengers"
                subtitle="Select your VIP Passengers"
                value={form.vipPassengers}
                onDecrement={() => updateCount('vipPassengers', -1)}
                onIncrement={() => updateCount('vipPassengers', 1)}
              />
            </div>

            <div>
              <label className={labelClass}>Number of Non Flying Guests in Lounge Deluxe</label>
              <StepperCard
                icon={<User className="w-5 h-5 text-white" />}
                iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
                title="Non-Flying Guests"
                subtitle="Select non-flying Guests"
                value={form.nonFlyingGuests}
                onDecrement={() => updateCount('nonFlyingGuests', -1)}
                onIncrement={() => updateCount('nonFlyingGuests', 1)}
                incrementDisabled={form.vipPassengers === 0 || form.nonFlyingGuests >= 3}
                helperText={loungeNfgHelperText}
              />
            </div>
          </div>

        </div>

        {/* ── 5. VIP Passenger Information sections ──────────────────────── */}
        {/* Cap the rendered boxes to `totalVip` so the form always shows
            exactly the right number of boxes for the configured VIP passenger
            counts. If vipData has extra entries (e.g. leftover from Quick
            Fill's hardcoded 5 entries when totalVip is now 4), they are
            hidden from the UI but kept in state for user data preservation. */}
        {vipData.slice(0, totalVip).map((passenger, index) => {
          const premiereSuiteEnd = form.premiereSuites;
          const premiereVipEnd = premiereSuiteEnd + form.premiereVipPassengers;

          let guestType: string;
          let badgeStyle: React.CSSProperties;

          if (index < premiereSuiteEnd) {
            guestType = 'Premiere Suite';
            badgeStyle = {
              background: isDark ? 'rgba(168,85,247,0.18)' : 'rgba(147,51,234,0.15)',
              color: isDark ? '#c084fc' : '#7e22ce',
              border: `1px solid ${isDark ? 'rgba(168,85,247,0.3)' : 'rgba(126,34,206,0.45)'}`,
            };
          } else if (index < premiereVipEnd) {
            guestType = 'Premiere Suite - VIP Passenger';
            badgeStyle = {
              background: isDark ? 'rgba(168,85,247,0.18)' : 'rgba(147,51,234,0.15)',
              color: isDark ? '#c084fc' : '#7e22ce',
              border: `1px solid ${isDark ? 'rgba(168,85,247,0.3)' : 'rgba(126,34,206,0.45)'}`,
            };
          } else {
            guestType = 'Lounge Deluxe - VIP Passenger';
            badgeStyle = {
              background: isDark ? 'rgba(59,130,246,0.18)' : 'rgba(37,99,235,0.12)',
              color: isDark ? '#60a5fa' : '#1d4ed8',
              border: `1px solid ${isDark ? 'rgba(59,130,246,0.3)' : 'rgba(29,78,216,0.4)'}`,
            };
          }

          return (
            <div key={index} className="p-5" style={card}>
              <SectionHeader
                title={`VIP Passenger Information #${index + 1}`}
                subtitle={`${guestType} — please fill in details`}
                onQuickFill={handleQuickFill}
              />

              {/* Badge */}
              <div className="mb-4">
                <span className="text-xs px-2.5 py-0.5 rounded-full" style={badgeStyle}>
                  {guestType}
                </span>
              </div>

              {/* Two-column grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Title */}
                <div>
                  <label className={labelClass}>Title *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={passenger.vipTitle}
                      onChange={(e) => handleVipChange(index, 'vipTitle', e.target.value)}
                      required
                      style={fieldStyle}
                      className={fieldClass + ' pl-10 appearance-none pr-10 cursor-pointer'}
                    >
                      {['Mr', 'Mrs', 'Ms', 'Dr', 'Prof'].map((t) => (
                        <option key={t} value={t} className={optionBg}>
                          {t}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* First Name */}
                <div>
                  <label className={labelClass}>First Name *</label>
                  <input
                    type="text"
                    value={passenger.vipFirstName}
                    onChange={(e) => handleVipChange(index, 'vipFirstName', e.target.value)}
                    required
                    placeholder="Enter first name"
                    style={fieldStyle}
                    className={fieldClass}
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className={labelClass}>Last Name *</label>
                  <input
                    type="text"
                    value={passenger.vipLastName}
                    onChange={(e) => handleVipChange(index, 'vipLastName', e.target.value)}
                    required
                    placeholder="Enter last name"
                    style={fieldStyle}
                    className={fieldClass}
                  />
                </div>

                {/* Travel Doc */}
                <div>
                  <label className={labelClass}>Travel Document No. (Travel or Indent)</label>
                  <input
                    type="text"
                    value={passenger.vipTravelDocNo}
                    onChange={(e) =>
                      handleVipChange(index, 'vipTravelDocNo', e.target.value.toUpperCase())
                    }
                    placeholder="e.g. P12345678 (Optional)"
                    style={fieldStyle}
                    className={fieldClass + ' uppercase'}
                  />
                </div>

                {/* Age Group */}
                <div>
                  <label className={labelClass}>Age Group <span style={{ color: 'rgb(220,181,21)' }}>*</span></label>
                  <div className="relative">
                    <Cake className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={passenger.vipAgeGroup}
                      onChange={(e) => handleVipChange(index, 'vipAgeGroup', e.target.value)}
                      required
                      style={fieldStyle}
                      className={fieldClass + ' pl-10 appearance-none pr-10 cursor-pointer'}
                    >
                      <option value="" disabled className={optionBg}>Select age group</option>
                      <option value="Adult" className={optionBg}>Adult (13+ years)</option>
                      <option value="Child" className={optionBg}>Child (2–12 years)</option>
                      <option value="Infant" className={optionBg}>Infant (0–2 years)</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Birthday */}
                <div>
                  <label className={labelClass}>Birthday (Date / Month / Year)</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="date"
                      value={passenger.vipBirthday}
                      onChange={(e) => handleVipChange(index, 'vipBirthday', e.target.value)}
                      style={fieldStyle}
                      className={fieldClass + ' pl-10 pr-10'}
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Food Allergies */}
              <div className="mt-4">
                <label className={labelClass}>Food Allergies <span className="text-xs opacity-60">(optional)</span></label>
                <input
                  type="text"
                  value={passenger.foodAllergies}
                  onChange={(e) => handleVipChange(index, 'foodAllergies', e.target.value)}
                  placeholder="e.g. Peanuts, Shellfish, Gluten (leave blank if none)"
                  style={fieldStyle}
                  className={fieldClass}
                />
              </div>
            </div>
          );
        })}

        {/* ── 6. Non-Flying Guest Information sections ───────────────────── */}
        {nonFlyingGuestData.map((guest, index) => {
          const premiereNonFlyingEnd = form.premiereNonFlyingGuests;
          let guestType: string;
          let badgeStyle: React.CSSProperties;

          if (index < premiereNonFlyingEnd) {
            guestType = 'Premiere Suite - Non-Flying Guest';
            badgeStyle = {
              background: isDark ? 'rgba(168,85,247,0.18)' : 'rgba(147,51,234,0.15)',
              color: isDark ? '#c084fc' : '#7e22ce',
              border: `1px solid ${isDark ? 'rgba(168,85,247,0.3)' : 'rgba(126,34,206,0.45)'}`,
            };
          } else {
            guestType = 'Lounge Deluxe - Non-Flying Guest';
            badgeStyle = {
              background: isDark ? 'rgba(59,130,246,0.18)' : 'rgba(37,99,235,0.12)',
              color: isDark ? '#60a5fa' : '#1d4ed8',
              border: `1px solid ${isDark ? 'rgba(59,130,246,0.3)' : 'rgba(29,78,216,0.4)'}`,
            };
          }

          return (
            <div key={index} className="p-5" style={card}>
              <SectionHeader
                title={`Non-Flying Guest Information #${index + 1}`}
                subtitle={`${guestType} — please fill in details`}
                onQuickFill={handleQuickFill}
              />

              {/* Badge */}
              <div className="mb-4">
                <span className="text-xs px-2.5 py-0.5 rounded-full" style={badgeStyle}>
                  {guestType}
                </span>
              </div>

              {/* Two-column grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Title */}
                <div>
                  <label className={labelClass}>Title</label>
                  <div className="relative">
                    <select
                      value={guest.guestTitle}
                      onChange={(e) => handleNonFlyingGuestChange(index, 'guestTitle', e.target.value)}
                      required
                      style={fieldStyle}
                      className={fieldClass + ' appearance-none pr-10 cursor-pointer'}
                    >
                      <option value="Mr" className={optionBg}>Mr</option>
                      <option value="Mrs" className={optionBg}>Mrs</option>
                      <option value="Ms" className={optionBg}>Ms</option>
                      <option value="Miss" className={optionBg}>Miss</option>
                      <option value="Dr" className={optionBg}>Dr</option>
                      <option value="Prof" className={optionBg}>Prof</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* First Name */}
                <div>
                  <label className={labelClass}>First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={guest.guestFirstName}
                      onChange={(e) => handleNonFlyingGuestChange(index, 'guestFirstName', e.target.value)}
                      required
                      placeholder="e.g. John"
                      style={fieldStyle}
                      className={fieldClass + ' pl-10'}
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div>
                  <label className={labelClass}>Last Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={guest.guestLastName}
                      onChange={(e) => handleNonFlyingGuestChange(index, 'guestLastName', e.target.value)}
                      required
                      placeholder="e.g. Smith"
                      style={fieldStyle}
                      className={fieldClass + ' pl-10'}
                    />
                  </div>
                </div>

                {/* Age Group */}
                <div>
                  <label className={labelClass}>Age Group <span style={{ color: 'rgb(220,181,21)' }}>*</span></label>
                  <div className="relative">
                    <Cake className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={guest.guestAgeGroup}
                      onChange={(e) => handleNonFlyingGuestChange(index, 'guestAgeGroup', e.target.value)}
                      required
                      style={fieldStyle}
                      className={fieldClass + ' pl-10 appearance-none pr-10 cursor-pointer'}
                    >
                      <option value="" disabled className={optionBg}>Select age group</option>
                      <option value="Adult" className={optionBg}>Adult (13+ years)</option>
                      <option value="Child" className={optionBg}>Child (2–12 years)</option>
                      <option value="Infant" className={optionBg}>Infant (0–2 years)</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Food Allergies */}
              <div className="mt-4">
                <label className={labelClass}>Food Allergies <span className="text-xs opacity-60">(optional)</span></label>
                <input
                  type="text"
                  value={guest.foodAllergies}
                  onChange={(e) => handleNonFlyingGuestChange(index, 'foodAllergies', e.target.value)}
                  placeholder="e.g. Peanuts, Shellfish, Gluten (leave blank if none)"
                  style={fieldStyle}
                  className={fieldClass}
                />
              </div>
            </div>
          );
        })}

        {/* ── 8. Action buttons ──────────────────────────────────────────── */}
        {/* No add-on service toggle */}
        <div
          className="flex items-center justify-between px-5 py-4 rounded-xl"
          style={{
            background: noAddonContainerBg,
            border: noAddonContainerBorder,
          }}
        >
          <div>
            <div className="text-sm" style={textPrimary}>No add-on service required</div>
            <div className="text-xs mt-0.5" style={textMuted}>Skip optional add-ons and proceed directly to the next step</div>
          </div>
          <button
            type="button"
            onClick={() => setNoAddonRequired(!noAddonRequired)}
            className="relative flex-shrink-0 w-11 h-6 rounded-full transition-all duration-200 focus:outline-none ml-4"
            style={{
              background: noAddonToggleBg,
            }}
            aria-checked={noAddonRequired}
            role="switch"
          >
            <span
              className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-all duration-200"
              style={{ transform: noAddonRequired ? 'translateX(20px)' : 'translateX(0px)' }}
            />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => navigate('/mybooking')}
            className="py-3 px-6 rounded-xl text-sm transition-all hover:opacity-80"
            style={{ ...secondaryBtnStyle, color: colors.text }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!step1Valid}
            className="py-3 px-6 rounded-xl text-white text-sm transition-all hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(90deg, rgb(220, 181, 21) 0%, rgb(180, 140, 10) 100%)' }}
          >
            Next Step
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {!step1Valid && (
          <div
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg"
            style={{
              background: isDark ? 'rgba(220, 181, 21, 0.1)' : 'rgba(220, 181, 21, 0.15)',
              border: isDark ? '1px solid rgba(220, 181, 21, 0.2)' : '1px solid rgba(220, 181, 21, 0.3)',
            }}
          >
            <Info className="w-4 h-4 flex-shrink-0" style={{ color: isDark ? 'rgb(251, 191, 36)' : 'rgb(180, 140, 10)' }} />
            <p className="text-xs text-center" style={{ color: isDark ? 'rgb(251, 191, 36)' : 'rgb(180, 140, 10)' }}>
              {step1HintMsg}
            </p>
          </div>
        )}
      </div>

      {/* Delete VIP Passenger Dialog */}
      {showDeleteVipDialog && pendingVipCount !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.7)' }}
        >
          <div
            className="max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-xl p-6"
            style={{
              background: isDark ? '#0a1929' : '#FFFFFF',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(200, 199, 190, 0.4)',
            }}
          >
            <h3 className="text-xl mb-4" style={textPrimary}>
              Select VIP Passenger(s) to Remove
            </h3>
            <p className="text-sm mb-6" style={textSecondary}>
              You have reduced the number of VIP passengers from {vipData.length} to {pendingVipCount}.
              Please select {vipData.length - pendingVipCount} passenger(s) to remove:
            </p>

            <div className="space-y-3 mb-6">
              {vipData.map((vip, index) => {
                const premiereSuiteEnd = form.premiereSuites;
                const premiereVipEnd = premiereSuiteEnd + form.premiereVipPassengers;
                let guestType = '';
                if (index < premiereSuiteEnd) {
                  guestType = 'Premiere Suite';
                } else if (index < premiereVipEnd) {
                  guestType = 'Premiere Suite - VIP Passenger';
                } else {
                  guestType = 'Lounge Deluxe - VIP Passenger';
                }

                const displayName = vip.vipFirstName || vip.vipLastName
                  ? `${vip.vipTitle} ${vip.vipFirstName} ${vip.vipLastName}`.trim()
                  : `VIP Passenger #${index + 1} (Empty)`;

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg"
                    style={{
                      background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(231, 230, 221, 0.5)',
                      border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(200, 199, 190, 0.4)',
                    }}
                  >
                    <div>
                      <div className="text-sm mb-1" style={textPrimary}>
                        {displayName}
                      </div>
                      <div className="text-xs" style={textSecondary}>
                        {guestType}
                        {vip.vipTravelDocNo && ` • Doc: ${vip.vipTravelDocNo}`}

                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteVip(index)}
                      className="px-4 py-2 rounded-lg text-sm text-white transition-all hover:opacity-80"
                      style={{ background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)' }}
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleCancelDelete}
              className="w-full py-3 rounded-xl text-sm transition-all hover:opacity-80"
              style={{ ...secondaryBtnStyle, color: colors.text }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete Non-Flying Guest Dialog */}
      {showDeleteGuestDialog && pendingGuestCount !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.7)' }}
        >
          <div
            className="max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-xl p-6"
            style={{
              background: isDark ? '#0a1929' : '#FFFFFF',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(200, 199, 190, 0.4)',
            }}
          >
            <h3 className="text-xl mb-4" style={textPrimary}>
              Select Non-Flying Guest(s) to Remove
            </h3>
            <p className="text-sm mb-6" style={textSecondary}>
              You have reduced the number of non-flying guests from {nonFlyingGuestData.length} to {pendingGuestCount}.
              Please select {nonFlyingGuestData.length - pendingGuestCount} guest(s) to remove:
            </p>

            <div className="space-y-3 mb-6">
              {nonFlyingGuestData.map((guest, index) => {
                const premiereNonFlyingEnd = form.premiereNonFlyingGuests;
                const guestType = index < premiereNonFlyingEnd
                  ? 'Premiere Suite - Non-Flying Guest'
                  : 'Lounge Deluxe - Non-Flying Guest';

                const displayName = guest.guestFirstName || guest.guestLastName
                  ? `${guest.guestTitle} ${guest.guestFirstName} ${guest.guestLastName}`.trim()
                  : `Non-Flying Guest #${index + 1} (Empty)`;

                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg"
                    style={{
                      background: isDark ? 'rgba(255, 255, 255, 0.04)' : 'rgba(231, 230, 221, 0.5)',
                      border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(200, 199, 190, 0.4)',
                    }}
                  >
                    <div>
                      <div className="text-sm mb-1" style={textPrimary}>
                        {displayName}
                      </div>
                      <div className="text-xs" style={textSecondary}>
                        {guestType} • {guest.guestAgeGroup}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteGuest(index)}
                      className="px-4 py-2 rounded-lg text-sm text-white transition-all hover:opacity-80"
                      style={{ background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)' }}
                    >
                      Remove
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              onClick={handleCancelDelete}
              className="w-full py-3 rounded-xl text-sm transition-all hover:opacity-80"
              style={{ ...secondaryBtnStyle, color: colors.text }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {/* ── Use History as New Booking Dialog ─────────────────────────── */}
      {showHistoryDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}
        >
          <div
            className="w-full max-w-2xl max-h-[88vh] flex flex-col rounded-2xl overflow-hidden"
            style={{
              background: isDark ? 'rgba(8,20,40,0.98)' : '#FFFFFF',
              border: isDark ? '1px solid rgba(220,181,21,0.35)' : '1px solid rgba(200,199,190,0.5)',
              boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
            }}
          >
            {/* Dialog header */}
            <div
              className="flex items-center justify-between px-6 py-4 flex-shrink-0"
              style={{
                background: isDark
                  ? 'linear-gradient(90deg,rgba(220,181,21,0.18) 0%,rgba(180,140,10,0.1) 100%)'
                  : 'linear-gradient(90deg,rgba(220,181,21,0.15) 0%,rgba(180,140,10,0.08) 100%)',
                borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(200,199,190,0.4)',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isDark ? 'rgba(220,181,21,0.2)' : 'rgba(220,181,21,0.18)',
                    border: isDark ? '1px solid rgba(220,181,21,0.35)' : '1px solid rgba(220,181,21,0.4)',
                  }}
                >
                  <History className="w-4 h-4" style={{ color: 'rgb(220,181,21)' }} />
                </div>
                <div>
                  <div className="text-sm" style={textPrimary}>Use History as New Booking</div>
                  <div className="text-xs mt-0.5" style={textMuted}>Select a past booking to pre-fill the form</div>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCloseHistoryDialog}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-colors hover:opacity-70"
                style={{ color: colors.textMuted }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable booking list */}
            <div className="overflow-y-auto flex-1 p-5 space-y-3">
              {HISTORY_BOOKINGS.map((booking) => {
                const statusColors: { [key: string]: { bg: string; text: string; border: string } } = {
                  confirmed: { bg: 'rgba(34,197,94,0.12)', text: 'rgb(22,163,74)', border: 'rgba(34,197,94,0.3)' },
                  completed: { bg: 'rgba(59,130,246,0.12)', text: 'rgb(37,99,235)', border: 'rgba(59,130,246,0.3)' },
                };
                const sc = statusColors[booking.status] || statusColors.completed;
                const statusLabel = booking.status.charAt(0).toUpperCase() + booking.status.slice(1);
                const totalPassengers = booking.premiereVipPassengers + booking.vipPassengers + booking.passengers.length;
                const guestSummary = booking.nonFlyingGuests > 0
                  ? booking.vipPassengers + booking.premiereVipPassengers + booking.premiereSuites + ' VIP  +  ' + booking.nonFlyingGuests + ' guest(s)'
                  : (booking.vipPassengers + booking.premiereVipPassengers + booking.premiereSuites) + ' VIP passenger(s)';
                const cardBg: React.CSSProperties = {
                  background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(248,247,242,0.9)',
                  border: isDark ? '1px solid rgba(255,255,255,0.09)' : '1px solid rgba(200,199,190,0.5)',
                };
                const divLine = isDark ? '1px solid rgba(255,255,255,0.07)' : '1px solid rgba(200,199,190,0.35)';

                return (
                  <div key={booking.id} className="rounded-xl overflow-hidden" style={cardBg}>
                    {/* Card top row */}
                    <div className="px-4 pt-4 pb-3">
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm truncate" style={textPrimary}>{booking.lounge}</div>
                          <div className="text-xs mt-0.5" style={textMuted}>{booking.terminal}</div>
                        </div>
                        <span
                          className="text-xs px-2.5 py-1 rounded-full flex-shrink-0"
                          style={{ background: sc.bg, color: sc.text, border: '1px solid ' + sc.border }}
                        >
                          {statusLabel}
                        </span>
                      </div>

                      {/* Info grid */}
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgb(220,181,21)' }} />
                          <span className="text-xs" style={textSecondary}>
                            {new Date(booking.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgb(220,181,21)' }} />
                          <span className="text-xs" style={textSecondary}>{booking.time}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Plane className="w-3.5 h-3.5 flex-shrink-0 text-blue-500" />
                          <span className="text-xs" style={textSecondary}>{booking.flightNumber}  ·  {booking.flightType}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 flex-shrink-0 text-purple-400" />
                          <span className="text-xs" style={textSecondary}>{guestSummary}</span>
                        </div>
                      </div>

                      {/* Passenger chips */}
                      <div className="flex flex-wrap gap-1.5">
                        {booking.passengers.map((p, pi) => {
                          const chipBg: React.CSSProperties = {
                            background: isDark ? 'rgba(255,255,255,0.07)' : 'rgba(220,181,21,0.1)',
                            border: isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid rgba(220,181,21,0.25)',
                          };
                          return (
                            <span key={pi} className="text-xs px-2 py-0.5 rounded-full" style={{ ...chipBg, color: isDark ? 'rgba(255,255,255,0.7)' : 'rgb(120,96,4)' }}>
                              {p.title} {p.firstName} {p.lastName}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Card footer */}
                    <div
                      className="flex items-center justify-between px-4 py-2.5"
                      style={{ borderTop: divLine, background: isDark ? 'rgba(0,0,0,0.18)' : 'rgba(231,230,221,0.4)' }}
                    >
                      <span className="text-xs font-mono" style={{ color: isDark ? 'rgba(220,181,21,0.8)' : 'rgb(160,128,8)' }}>
                        {booking.bookingRef}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleSelectHistory(booking)}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs text-white transition-all hover:opacity-90"
                        style={{ background: 'linear-gradient(90deg,rgb(220,181,21) 0%,rgb(180,140,10) 100%)' }}
                      >
                        Select
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Dialog footer */}
            <div
              className="px-6 py-4 flex-shrink-0"
              style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(200,199,190,0.4)' }}
            >
              <button
                type="button"
                onClick={handleCloseHistoryDialog}
                className="w-full py-2.5 rounded-xl text-sm transition-all hover:opacity-80"
                style={{ ...secondaryBtnStyle, color: colors.text }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </form>
    {stepLoadingOverlay}
    </>
  );
  } // end if (currentStep === 2)

  return null;
}
