import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  Users, 
  Wallet, 
  Search,
  Plus,
  CheckCircle,
  XCircle,
  DollarSign,
  Mail,
  Phone,
  Clock,
  Edit2,
  UserPlus,
  X,
  Save,
  User,
  CreditCard,
  UserCheck,
  Sparkles,
  Medal,
  Star,
  Crown,
  Building2,
  Award,
  CalendarPlus,
} from 'lucide-react';
import { useTheme } from './ThemeContext';
import { MembershipFlowModal } from './MembershipFlowModal';
import { NationalityTypeahead } from '../../../../../components/NationalityTypeahead';
import { isValidCountryCode } from '../../../../../utils/countries';
import { useMsg } from '../../../../../i18n/useMsg';

// INV-X18: product calendar day is Asia/Hong_Kong (never toISOString for Y-m-d).
const hktTodayYmd = (d: Date = new Date()): string =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Hong_Kong' }).format(d);
function addCalendarDaysYmd(ymd: string, days: number): string {
  const m = String(ymd).trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return ymd;
  const dt = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]) + days, 12));
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`;
}
function addCalendarYearsYmd(ymd: string, years: number): string {
  const m = String(ymd).trim().match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return ymd;
  const y = Number(m[1]) + years;
  const mo = Number(m[2]);
  const d = Number(m[3]);
  const dt = new Date(Date.UTC(y, mo - 1, d, 12));
  if (dt.getUTCMonth() + 1 !== mo) {
    const last = new Date(Date.UTC(y, mo, 0, 12));
    return `${last.getUTCFullYear()}-${String(last.getUTCMonth() + 1).padStart(2, '0')}-${String(last.getUTCDate()).padStart(2, '0')}`;
  }
  return `${String(y).padStart(4, '0')}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}


// ── BookForMember payload ────────────────────────────────────────────────────

export interface BookForMemberData {
  title: string;
  firstName: string;
  lastName: string;
  /** End-customer contact email (booking contact, not the agency payer). */
  email: string;
  /** End-customer contact phone (booking contact, not the agency payer). */
  phone: string;
  /** ISO 3166-1 alpha-2 nationality from the group member profile. */
  nationality: string;
  passportPrefix: string;
  voucherCount: number;
  membershipLabel: string;
}

// ── Membership package types ────────────────────────────────────────────────

export interface MemberPackage {
  id: string;
  tierId: string;
  tierName: string;
  memberType: string;
  price: number;
  currency: string;
  activatedAt: string;
  validUntil: string;
}

export interface GroupMemberForm {
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  passportPrefix: string;
  status: 'active' | 'inactive';
}

const TIER_COLOR_MAP: Record<string, string> = {
  'ind-gold':         'rgb(220,181,21)',
  'ind-platinum':     '#94a3b8',
  'ind-diamond':      '#38bdf8',
  'ind-sapphire':     '#818cf8',
  'corp-executive':   'rgb(220,181,21)',
  'corp-elite':       '#38bdf8',
  'corp-connoisseur': '#a78bfa',
};

const TIER_ICON_MAP: Record<string, React.ElementType> = {
  'ind-gold':         Medal,
  'ind-platinum':     Star,
  'ind-diamond':      Sparkles,
  'ind-sapphire':     Crown,
  'corp-executive':   Building2,
  'corp-elite':       Award,
  'corp-connoisseur': Crown,
};

const TIER_VOUCHER_MAP: Record<string, number> = {
  'ind-gold':         6,
  'ind-platinum':     8,
  'ind-diamond':      12,
  'ind-sapphire':     20,
  'corp-executive':   12,
  'corp-elite':       20,
  'corp-connoisseur': 30,
};

function getTierColor(tierId: string): string {
  return TIER_COLOR_MAP[tierId] || 'rgb(220,181,21)';
}

function getTierIcon(tierId: string): React.ElementType {
  return TIER_ICON_MAP[tierId] || Medal;
}

// ── Initial mock packages (keyed by member id) ──────────────────────────────

const INITIAL_PACKAGES: Record<number, MemberPackage[]> = {
  1: [
    {
      id: 'pkg-1a',
      tierId: 'ind-diamond',
      tierName: 'Diamond',
      memberType: 'Individual',
      price: 84000,
      currency: 'HKD',
      activatedAt: '2025-03-10',
      validUntil: '2026-03-10',
    },
    {
      id: 'pkg-1b',
      tierId: 'corp-executive',
      tierName: 'Executive',
      memberType: 'Corporate',
      price: 160000,
      currency: 'HKD',
      activatedAt: '2025-06-01',
      validUntil: '2026-06-01',
    },
  ],
  2: [
    {
      id: 'pkg-2a',
      tierId: 'ind-gold',
      tierName: 'Gold',
      memberType: 'Individual',
      price: 32000,
      currency: 'HKD',
      activatedAt: '2025-07-20',
      validUntil: '2026-07-20',
    },
  ],
  3: [
    {
      id: 'pkg-3a',
      tierId: 'ind-platinum',
      tierName: 'Platinum',
      memberType: 'Individual',
      price: 45000,
      currency: 'HKD',
      activatedAt: '2025-11-10',
      validUntil: '2026-11-10',
    },
  ],
  4: [],
  5: [],
};

// ── GroupAdmin props ─────────────────────────────────────────────────────────

/** Package catalogue row for Group Admin membership purchase (from API). */
export type GroupMembershipPackageInput = {
  id: string;
  name: string;
  memberType: string;
  price: number;
  currency: string;
  period: string;
  tagline: string;
  highlight: boolean;
  badge?: string;
  accentColor: string;
  entries: number | 'Unlimited';
  freeUpgradesPerYear: number | 'NA';
  hasNonFlyingGuest: boolean;
  features: string[];
};

export interface GroupAdminProps {
  /** When provided (including []), never flash MOCK_MEMBERS. Omitted = Figma Make preview. */
  members?: GroupMember[];
  memberPackages?: Record<number, MemberPackage[]>;
  /**
   * Parent Travel Agency spendable credit (accounts.credit_balance).
   * When provided in controlled mode, drives the "Total Credit" / "Avg Credit"
   * stats instead of summing per-member balances (sub-accounts are usually 0).
   */
  agencyCreditBalance?: number;
  /** Live Individual membership packages for Join Membership modal. */
  membershipCatalogue?: GroupMembershipPackageInput[] | null;
  isLoading?: boolean;
  isSaving?: boolean;
  isPurchasingMembership?: boolean;
  membershipPurchaseError?: string | null;
  error?: string | null;
  successMessage?: string;
  searchQuery?: string;
  setActiveTab?: (tab: string) => void;
  onSearchChange?: (query: string) => void;
  onAddMember?: (data: GroupMemberForm) => void | Promise<void>;
  onUpdateMember?: (id: number, data: GroupMemberForm) => void | Promise<void>;
  onBookForMember?: (data: BookForMemberData) => void;
  /**
   * Agency buys membership for a group member — always OnCredit on the server.
   * packageId is the grading package id (string).
   */
  onPurchaseMembership?: (memberId: number, packageId: string) => void | Promise<void>;
}

// ── Member type ─────────────────────────────────────────────────────────────

export interface GroupMember {
  id: number;
  title: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  nationality: string;
  passportPrefix: string;
  creditBalance: number;
  memberSince: string;
  status: 'active' | 'inactive';
  lastActive: string;
}

const TITLES = ['Mr', 'Mrs', 'Ms', 'Miss', 'Dr', 'Prof'];

const EMPTY_FORM = {
  title: 'Mr',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  nationality: '',
  passportPrefix: '',
  status: 'active' as 'active' | 'inactive',
};

/**
 * Module-level form helpers — MUST stay outside GroupAdmin.
 * Defining them inside the parent re-creates a new component type on every
 * keystroke, which remounts inputs and steals focus (only 1 char per click).
 */
function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs mt-1" style={{ color: '#f87171' }}>{msg}</p>;
}

function FormField({
  label,
  required,
  children,
  error,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
  error?: string;
}) {
  const m = useMsg();
  const { colors } = useTheme();
  // Auto-translate English source labels (safe if already translated).
  return (
    <div>
      <label className="block text-sm font-semibold mb-1.5" style={{ color: colors.text }}>
        {m(label)}
        {required && <span className="ml-1">*</span>}
      </label>
      {children}
      <FieldError msg={error ? m(error) : undefined} />
    </div>
  );
}

const MOCK_MEMBERS: GroupMember[] = [
  {
    id: 1,
    title: 'Ms',
    firstName: 'Sarah',
    lastName: 'Chen',
    email: 'sarah.chen@cathay.com',
    phone: '+852 9123 4567',
    nationality: 'HK',
    passportPrefix: 'K293',
    creditBalance: 15000,
    memberSince: '2022-03-15',
    status: 'active',
    lastActive: '2026-01-08',
  },
  {
    id: 2,
    title: 'Mr',
    firstName: 'Michael',
    lastName: 'Wong',
    email: 'michael.wong@cathay.com',
    phone: '+852 9234 5678',
    nationality: 'HK',
    passportPrefix: 'H471',
    creditBalance: 8500,
    memberSince: '2023-06-20',
    status: 'active',
    lastActive: '2026-01-07',
  },
  {
    id: 3,
    title: 'Ms',
    firstName: 'Jennifer',
    lastName: 'Lee',
    email: 'jennifer.lee@cathay.com',
    phone: '+852 9345 6789',
    nationality: 'HK',
    passportPrefix: 'M108',
    creditBalance: 12000,
    memberSince: '2022-11-10',
    status: 'active',
    lastActive: '2026-01-06',
  },
  {
    id: 4,
    title: 'Mr',
    firstName: 'David',
    lastName: 'Liu',
    email: 'david.liu@cathay.com',
    phone: '+852 9456 7890',
    nationality: 'CN',
    passportPrefix: 'E552',
    creditBalance: 5000,
    memberSince: '2024-02-14',
    status: 'active',
    lastActive: '2026-01-05',
  },
  {
    id: 5,
    title: 'Ms',
    firstName: 'Amanda',
    lastName: 'Ng',
    email: 'amanda.ng@cathay.com',
    phone: '+852 9567 8901',
    nationality: '',
    passportPrefix: '',
    creditBalance: 0,
    memberSince: '2025-09-01',
    status: 'inactive',
    lastActive: '2025-12-20',
  },
];

export function GroupAdmin({
  members: membersProp,
  memberPackages: memberPackagesProp,
  agencyCreditBalance: agencyCreditBalanceProp,
  membershipCatalogue = null,
  isLoading = false,
  isSaving = false,
  isPurchasingMembership = false,
  membershipPurchaseError = null,
  error = null,
  successMessage: successMessageProp,
  searchQuery: searchQueryProp,
  setActiveTab,
  onSearchChange,
  onAddMember,
  onUpdateMember,
  onBookForMember,
  onPurchaseMembership,
}: GroupAdminProps) {
  const m = useMsg();
  const { colors, glassStyle, mode } = useTheme();
  const [internalSearchQuery, setInternalSearchQuery] = useState('');
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showMembershipModal, setShowMembershipModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<GroupMember | null>(null);
  const [addForm, setAddForm] = useState(EMPTY_FORM);
  const [editForm, setEditForm] = useState(EMPTY_FORM);
  const [addErrors, setAddErrors] = useState<Partial<Record<keyof typeof EMPTY_FORM, string>>>({});
  const [editErrors, setEditErrors] = useState<Partial<Record<keyof typeof EMPTY_FORM, string>>>({});
  const [internalSuccessMessage, setInternalSuccessMessage] = useState('');
  const [internalPackages, setInternalPackages] = useState<Record<number, MemberPackage[]>>(INITIAL_PACKAGES);
  const [internalMembers, setInternalMembers] = useState<GroupMember[]>(MOCK_MEMBERS);

  const isControlled = membersProp !== undefined;
  const groupMembers = isControlled ? membersProp : internalMembers;
  const searchQuery = searchQueryProp !== undefined ? searchQueryProp : internalSearchQuery;
  const setSearchQuery = onSearchChange ?? setInternalSearchQuery;
  const memberPackages = memberPackagesProp !== undefined ? memberPackagesProp : internalPackages;
  const successMessage = successMessageProp !== undefined ? successMessageProp : internalSuccessMessage;

  const filteredMembers = groupMembers.filter(member => {
    const fullName = `${member.firstName} ${member.lastName}`.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || (member.email ?? '').toLowerCase().includes(query);
  });

  const activeCount = groupMembers.filter(m => m.status === 'active').length;
  // Controlled + agencyCreditBalance: show parent ledger (real TA credit).
  // Uncontrolled Figma preview: sum mock per-member balances as before.
  const memberCreditSum = groupMembers.reduce((sum, m) => sum + (m.creditBalance || 0), 0);
  const totalCredit =
    isControlled && agencyCreditBalanceProp !== undefined
      ? Number(agencyCreditBalanceProp) || 0
      : memberCreditSum;
  const avgCredit = groupMembers.length > 0 ? Math.round(totalCredit / groupMembers.length) : 0;

  // ── Toasts ────────────────────────────────────────────────
  function showSuccess(msg: string) {
    if (successMessageProp !== undefined) return;
    setInternalSuccessMessage(msg);
    setTimeout(() => setInternalSuccessMessage(''), 3000);
  }

  // ── Credit modal ──────────────────────────────────────────
  function handleJoinMembership(member: GroupMember) {
    setSelectedMember(member);
    setShowMembershipModal(true);
  }

  function closeMembershipModal() {
    setShowMembershipModal(false);
    setSelectedMember(null);
  }

  function handleMembershipSuccess(tier: { tierId: string; tierName: string; memberType: string; price: number; currency: string }) {
    if (!selectedMember) return;
    // Controlled + real OnCredit purchase: container already updated members + success toast.
    if (onPurchaseMembership) {
      return;
    }
    // Controlled without purchase API: local preview only.
    if (memberPackagesProp !== undefined) {
      showSuccess(`Membership request for ${selectedMember.firstName} recorded (staff confirmation required).`);
      return;
    }
    const today = new Date();
    const nextYear = new Date(today);
    nextYear.setFullYear(today.getFullYear() + 1);
    const activatedAt = hktTodayYmd(today);
    const validUntil = hktTodayYmd(nextYear);
    const newPkg: MemberPackage = {
      id: `pkg-${Date.now()}`,
      tierId: tier.tierId,
      tierName: tier.tierName,
      memberType: tier.memberType,
      price: tier.price,
      currency: tier.currency,
      activatedAt,
      validUntil,
    };
    setInternalPackages(prev => {
      const existing = prev[selectedMember.id] || [];
      return { ...prev, [selectedMember.id]: [...existing, newPkg] };
    });
  }

  // ── BookForMember ─────────────────────────────────────────
  function handleBookForMember(member: GroupMember) {
    const packages = memberPackages[member.id] || [];
    const voucherCount = packages.reduce((sum, pkg) => sum + (TIER_VOUCHER_MAP[pkg.tierId] || 0), 0);
    const membershipLabel = packages.length > 0
      ? packages.map((pkg) => `${pkg.tierName} ${pkg.memberType}`).join(', ')
      : 'No membership';
    onBookForMember ? onBookForMember({
      title: member.title,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      nationality: member.nationality,
      passportPrefix: member.passportPrefix,
      voucherCount,
      membershipLabel,
    }) : navigate('/newbooking', { state: { prefillMember: {
      title: member.title,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      nationality: member.nationality,
      passportPrefix: member.passportPrefix,
      voucherCount,
      membershipLabel,
    }}});
  }

  // ── Edit modal ────────────────────────────────────────────
  function handleOpenEdit(member: GroupMember) {
    setSelectedMember(member);
    setEditForm({
      title: member.title,
      firstName: member.firstName,
      lastName: member.lastName,
      email: member.email,
      phone: member.phone,
      nationality: member.nationality,
      passportPrefix: member.passportPrefix,
      status: member.status,
    });
    setEditErrors({});
    setShowEditModal(true);
  }

  function validateEditForm() {
    const errs: Partial<typeof EMPTY_FORM> = {};
    if (!editForm.firstName.trim()) errs.firstName = 'First name is required.';
    if (!editForm.lastName.trim()) errs.lastName = 'Last name is required.';
    if (!editForm.email.trim()) errs.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(editForm.email)) errs.email = 'Invalid email address.';
    if (!isValidCountryCode(editForm.nationality)) {
      errs.nationality = 'Nationality is required. Select a country from the list.';
    }
    if (editForm.passportPrefix && !/^[A-Za-z0-9]{4}$/.test(editForm.passportPrefix)) errs.passportPrefix = 'Must be exactly 4 alphanumeric characters.';
    return errs;
  }

  async function confirmEdit() {
    const errs = validateEditForm();
    if (Object.keys(errs).length > 0) { setEditErrors(errs); return; }
    if (!selectedMember) return;
    const payload: GroupMemberForm = {
      title: editForm.title,
      firstName: editForm.firstName.trim(),
      lastName: editForm.lastName.trim(),
      email: editForm.email.trim(),
      phone: editForm.phone.trim(),
      nationality: editForm.nationality.trim().toUpperCase(),
      passportPrefix: editForm.passportPrefix.trim().toUpperCase(),
      status: editForm.status,
    };
    if (onUpdateMember) {
      // Keep modal open on API failure so the user can fix fields; container
      // sets the page-level `error` prop (also shown inside this modal).
      try {
        await onUpdateMember(selectedMember.id, payload);
        setShowEditModal(false);
        setSelectedMember(null);
        setEditErrors({});
      } catch (err) {
        const fieldErrs = mapApiFieldErrors(err);
        if (Object.keys(fieldErrs).length > 0) setEditErrors(fieldErrs);
      }
      return;
    }
    setInternalMembers(prev =>
      prev.map(m =>
        m.id === selectedMember.id
          ? {
              ...m,
              ...payload,
            }
          : m
      )
    );
    setShowEditModal(false);
    setSelectedMember(null);
    showSuccess(`${payload.firstName} ${payload.lastName}'s details have been updated.`);
  }

  function closeEditModal() {
    setShowEditModal(false);
    setSelectedMember(null);
    setEditErrors({});
  }

  // ── Add Member modal ──────────────────────────────────────
  function handleOpenAdd() {
    setAddForm(EMPTY_FORM);
    setAddErrors({});
    setShowAddModal(true);
  }

  function validateAddForm() {
    const errs: Partial<typeof EMPTY_FORM> = {};
    if (!addForm.firstName.trim()) errs.firstName = 'First name is required.';
    if (!addForm.lastName.trim()) errs.lastName = 'Last name is required.';
    if (!addForm.email.trim()) errs.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(addForm.email)) errs.email = 'Invalid email address.';
    if (!isValidCountryCode(addForm.nationality)) {
      errs.nationality = 'Nationality is required. Select a country from the list.';
    }
    if (addForm.passportPrefix && !/^[A-Za-z0-9]{4}$/.test(addForm.passportPrefix)) errs.passportPrefix = 'Must be exactly 4 alphanumeric characters.';
    return errs;
  }

  /**
   * Map Laravel 422 `errors` (snake_case keys) onto the camelCase form fields
   * so duplicate-email / required-field API failures show next to inputs.
   */
  function mapApiFieldErrors(err: unknown): Partial<Record<keyof typeof EMPTY_FORM, string>> {
    const e = err as {
      data?: { errors?: Record<string, string[] | string> };
      errors?: Record<string, string[] | string>;
    } | null;
    const raw = e?.data?.errors ?? e?.errors;
    if (!raw || typeof raw !== 'object') return {};
    const keyMap: Record<string, keyof typeof EMPTY_FORM> = {
      title: 'title',
      first_name: 'firstName',
      firstName: 'firstName',
      last_name: 'lastName',
      lastName: 'lastName',
      email: 'email',
      phone: 'phone',
      nationality: 'nationality',
      passport_prefix: 'passportPrefix',
      passportPrefix: 'passportPrefix',
      status: 'status',
    };
    const out: Partial<Record<keyof typeof EMPTY_FORM, string>> = {};
    for (const [k, v] of Object.entries(raw)) {
      const field = keyMap[k];
      if (!field) continue;
      const msg = Array.isArray(v) ? v.find(Boolean) : v;
      if (typeof msg === 'string' && msg.trim()) out[field] = msg;
    }
    return out;
  }

  async function confirmAdd() {
    const errs = validateAddForm();
    if (Object.keys(errs).length > 0) { setAddErrors(errs); return; }
    const payload: GroupMemberForm = {
      title: addForm.title,
      firstName: addForm.firstName.trim(),
      lastName: addForm.lastName.trim(),
      email: addForm.email.trim(),
      phone: addForm.phone.trim() || '—',
      nationality: addForm.nationality.trim().toUpperCase(),
      passportPrefix: addForm.passportPrefix.trim().toUpperCase(),
      status: 'active',
    };
    if (onAddMember) {
      // Keep modal open on API failure so the user can fix fields; container
      // sets the page-level `error` prop (also shown inside this modal).
      try {
        await onAddMember(payload);
        setShowAddModal(false);
        setAddForm(EMPTY_FORM);
        setAddErrors({});
      } catch (err) {
        const fieldErrs = mapApiFieldErrors(err);
        if (Object.keys(fieldErrs).length > 0) setAddErrors(fieldErrs);
      }
      return;
    }
    const newMember: GroupMember = {
      id: Date.now(),
      ...payload,
      creditBalance: 0,
      memberSince: hktTodayYmd(),
      lastActive: hktTodayYmd(),
    };
    setInternalMembers(prev => [...prev, newMember]);
    setShowAddModal(false);
    setAddForm(EMPTY_FORM);
    showSuccess(`${newMember.firstName} ${newMember.lastName} has been added to the group.`);
  }

  function closeAddModal() {
    setShowAddModal(false);
    setAddErrors({});
  }

  // ── Shared style helpers ──────────────────────────────────
  const fieldStyle = {
    background: colors.inputBackground,
    border: `1px solid ${colors.inputBorder}`,
    color: colors.inputText,
  };

  const modalStyle: React.CSSProperties = {
    backdropFilter: 'blur(20px)',
    background: colors.modalBackground,
    border: `1px solid ${colors.glassBorder}`,
  };

  const cancelBtnBg = mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(231,230,221,0.6)';
  const cancelBtnHoverBg = mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(231,230,221,0.8)';

  const handleCancelBtnEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = cancelBtnHoverBg;
  };
  const handleCancelBtnLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.background = cancelBtnBg;
  };

  const inactiveBadgeBg = mode === 'dark' ? 'rgba(156,163,175,0.2)' : 'rgba(231,230,221,0.8)';
  const inactiveBadgeBorder = mode === 'dark' ? 'rgba(156,163,175,0.3)' : 'rgba(200,199,190,0.8)';
  const editBtnBg = mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(231,230,221,0.5)';
  const editBtnHoverBg = mode === 'dark' ? 'rgba(255,255,255,0.15)' : 'rgba(231,230,221,0.7)';
  const theadBg = mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(231,230,221,0.6)';

  return (
    <div className="space-y-6">
      {/* Success Toast */}
      {successMessage !== '' && (
        <div className="fixed top-6 right-6 z-[100] px-5 py-3 rounded-xl shadow-xl border border-green-400/40 text-white text-sm font-semibold flex items-center gap-2"
          style={{ background: 'rgba(22,163,74,0.92)', backdropFilter: 'blur(8px)' }}>
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          {m(successMessage)}
        </div>
      )}

      {error && (
        <div className="rounded-xl px-4 py-3 text-sm font-medium border border-red-400/40 text-red-200"
          style={{ background: 'rgba(185,28,28,0.25)' }}>
          {m(error)}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-3xl bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,141,11)] bg-clip-text text-transparent">
            {m('Group Account Management')}
          </h1>
          <p className="mt-1" style={{ color: colors.textSecondary }}>{m('Manage your team members and distribute credit balance.')}</p>
        </div>
        <button
          onClick={handleOpenAdd}
          disabled={isSaving || isLoading}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,141,11)] text-white font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2 disabled:opacity-60"
        >
          <UserPlus className="w-5 h-5" />
          {m('Add Member')}
        </button>
      </div>

      {isLoading && (
        <div className="rounded-2xl p-8 text-center border border-white/20" style={glassStyle}>
          <p style={{ color: colors.textSecondary }}>{m('Loading group members…')}</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: m('Total Members'), value: groupMembers.length, icon: Users },
          { label: m('Active Members'), value: activeCount, icon: CheckCircle },
          { label: m('Total Credit'), value: `HKD ${totalCredit.toLocaleString()}`, icon: Wallet },
          { label: m('Avg Credit'), value: `HKD ${avgCredit.toLocaleString()}`, icon: DollarSign },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-2xl p-6 border border-white/20" style={glassStyle}>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[rgb(220,181,21)] to-[rgb(180,141,11)] flex items-center justify-center">
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs" style={{ color: colors.textSecondary }}>{stat.label}</p>
                  <p className="text-2xl font-bold" style={{ color: colors.text }}>{stat.value}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="rounded-2xl p-4 border border-white/20" style={glassStyle}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: colors.textMuted }} />
          <input
            type="text"
            placeholder={m('Search by name or email...')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]"
            style={fieldStyle}
          />
        </div>
      </div>

      {/* Members Table */}
      {!isLoading && <div className="rounded-2xl overflow-hidden border border-white/20" style={glassStyle}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ background: theadBg }} className="border-b border-white/20">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: colors.text }}>{m('Member')}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: colors.text }}>{m('Memberships')}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: colors.text }}>{m('Status')}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: colors.text }}>{m('Last Active')}</th>
                <th className="px-6 py-4 text-left text-sm font-semibold" style={{ color: colors.text }}>{m('Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => {
                const handleEditClick = () => handleOpenEdit(member);
                const handleCreditClick = () => handleJoinMembership(member);
                const handleBookClick = () => handleBookForMember(member);
                const packages = memberPackages[member.id] || [];

                const editEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.background = editBtnHoverBg;
                };
                const editLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
                  e.currentTarget.style.background = editBtnBg;
                };

                return (
                  <tr key={member.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold" style={{ color: colors.text }}>{member.title} {member.firstName} {member.lastName}</p>
                        <p className="text-sm flex items-center gap-1" style={{ color: colors.textSecondary }}>
                          <Mail className="w-3 h-3" />
                          {member.email}
                        </p>
                        <p className="text-sm flex items-center gap-1" style={{ color: colors.textSecondary }}>
                          <Phone className="w-3 h-3" />
                          {member.phone}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 min-w-[220px]">
                      {packages.length === 0 ? (
                        <span className="text-xs" style={{ color: colors.textMuted }}>{m('No membership')}</span>
                      ) : (
                        <div className="flex flex-col gap-2">
                          {packages.map((pkg) => {
                            const color = getTierColor(pkg.tierId);
                            const TierIcon = getTierIcon(pkg.tierId);
                            const iconBg = `${color}22`;
                            const badgeBg = mode === 'dark' ? `${color}18` : `${color}14`;
                            const badgeBorder = `1px solid ${color}44`;
                            const validDate = new Date(pkg.validUntil).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
                            return (
                              <div key={pkg.id} className="flex items-start gap-2 px-2.5 py-2 rounded-xl" style={{ background: badgeBg, border: badgeBorder }}>
                                <div className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 mt-0.5" style={{ background: iconBg }}>
                                  <TierIcon className="w-3.5 h-3.5" style={{ color }} />
                                </div>
                                <div>
                                  <p className="text-xs leading-tight" style={{ color }}>
                                    {pkg.tierName} <span style={{ color: colors.textSecondary }}>· {pkg.memberType}</span>
                                  </p>
                                  <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>
                                    Valid until {validDate}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {member.status === 'active' ? (
                        <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700 border border-green-200 flex items-center gap-1 w-fit">
                          <CheckCircle className="w-3 h-3" />
                          {m('Active')}
                        </span>
                      ) : (
                        <span
                          className="px-3 py-1 rounded-full text-xs flex items-center gap-1 w-fit"
                          style={{ background: inactiveBadgeBg, border: `1px solid ${inactiveBadgeBorder}`, color: colors.textSecondary }}
                        >
                          <XCircle className="w-3 h-3" />
                          {m('Inactive')}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm" style={{ color: colors.textSecondary }}>
                        <Clock className="w-3 h-3" />
                        {new Date(member.lastActive).toLocaleDateString('en-GB')}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 flex-wrap">
                        <button
                          onClick={handleCreditClick}
                          className="px-3 py-2 rounded-lg bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,141,11)] text-white text-sm font-semibold hover:shadow-lg transition-all flex items-center gap-1"
                        >
                          <UserCheck className="w-4 h-4" />
                          {m('Join Membership')}
                        </button>
                        <button
                          onClick={handleBookClick}
                          className="px-3 py-2 rounded-lg text-sm font-semibold hover:shadow-lg transition-all flex items-center gap-1.5"
                          style={{ background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.35)', color: '#60a5fa' }}
                        >
                          <CalendarPlus className="w-4 h-4" />
                          {m('Book for Member')}
                        </button>
                        <button
                          onClick={handleEditClick}
                          className="p-2 rounded-lg transition-colors"
                          title={m('Edit member')}
                          style={{ background: editBtnBg }}
                          onMouseEnter={editEnter}
                          onMouseLeave={editLeave}
                        >
                          <Edit2 className="w-4 h-4" style={{ color: colors.textSecondary }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredMembers.length === 0 && (
          <div className="p-12 text-center">
            <Users className="w-16 h-16 mx-auto mb-4" style={{ color: colors.textMuted }} />
            <p style={{ color: colors.textSecondary }}>
              {groupMembers.length === 0
                ? m('No group members yet. Click Add Member to create one.')
                : m('No members found matching your search.')}
            </p>
          </div>
        )}
      </div>}

      {/* ── Add Member Modal ───────────────────────────────── */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="rounded-2xl p-8 max-w-lg w-full shadow-2xl max-h-[min(90vh,720px)] overflow-y-auto"
            style={modalStyle}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[rgb(220,181,21)] to-[rgb(180,141,11)] flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold" style={{ color: colors.text }}>{m('Add New Member')}</h3>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>{m('Fill in the details below')}</p>
                </div>
              </div>
              <button
                onClick={closeAddModal}
                disabled={isSaving}
                className="p-2 rounded-lg transition-colors hover:bg-white/10 disabled:opacity-50"
                style={{ color: colors.textSecondary }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* API / save errors must appear inside the modal (page banner is under the overlay). */}
            {error && (
              <div
                className="mb-4 rounded-xl px-4 py-3 text-sm font-medium border border-red-400/40 text-red-200"
                style={{ background: 'rgba(185,28,28,0.35)' }}
                role="alert"
              >
                {m(error)}
              </div>
            )}

            {/* Form */}
            <div className="space-y-4">
              {/* Title + First Name + Last Name */}
              <div className="flex gap-3">
                <FormField label="Title" required>
                  <select
                    value={addForm.title}
                    onChange={(e) => setAddForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full px-3 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)] appearance-none"
                    style={fieldStyle}
                  >
                    {TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </FormField>
                <div className="flex-1">
                  <FormField label="First Name" required error={addErrors.firstName}>
                    <input
                      type="text"
                      value={addForm.firstName}
                      onChange={(e) => setAddForm(f => ({ ...f, firstName: e.target.value }))}
                      placeholder={m('e.g. Thomas')}
                      className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]"
                      style={fieldStyle}
                    />
                  </FormField>
                </div>
              </div>
              <FormField label="Last Name" required error={addErrors.lastName}>
                <input
                  type="text"
                  value={addForm.lastName}
                  onChange={(e) => setAddForm(f => ({ ...f, lastName: e.target.value }))}
                  placeholder={m('e.g. Leung')}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]"
                  style={fieldStyle}
                />
              </FormField>

              <FormField label="Email Address" required error={addErrors.email}>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={addForm.email}
                    onChange={(e) => setAddForm(f => ({ ...f, email: e.target.value }))}
                    placeholder={m('e.g. thomas.leung@company.com')}
                    className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]"
                    style={fieldStyle}
                  />
                </div>
              </FormField>

              <FormField label="Phone Number" error={addErrors.phone}>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={addForm.phone}
                    onChange={(e) => setAddForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder={m('e.g. +852 9123 4567 (Optional)')}
                    className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]"
                    style={fieldStyle}
                  />
                </div>
              </FormField>

              <FormField label="Nationality *" error={addErrors.nationality}>
                <NationalityTypeahead
                  id="group-admin-add-nationality"
                  value={addForm.nationality}
                  required
                  onChange={(code) => {
                    setAddForm((f) => ({ ...f, nationality: code }));
                    if (addErrors.nationality) {
                      setAddErrors((e) => {
                        const next = { ...e };
                        delete next.nationality;
                        return next;
                      });
                    }
                  }}
                  className="w-full pl-10 pr-10 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]"
                  inputStyle={fieldStyle}
                  listStyle={{
                    ...fieldStyle,
                    background: mode === 'dark' ? 'rgba(30,30,30,0.98)' : 'rgba(255,255,255,0.98)',
                  }}
                  highlightClassName={mode === 'dark' ? 'bg-white/15' : 'bg-[rgb(231,230,221)]'}
                />
              </FormField>

              <FormField label="First 4 Digits of Passport No." error={addErrors.passportPrefix}>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    maxLength={4}
                    value={addForm.passportPrefix}
                    onChange={(e) => setAddForm(f => ({ ...f, passportPrefix: e.target.value.toUpperCase() }))}
                    placeholder={m('e.g. K293 (Optional)')}
                    className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]"
                    style={fieldStyle}
                  />
                </div>
              </FormField>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={closeAddModal}
                disabled={isSaving}
                className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all disabled:opacity-50"
                style={{ background: cancelBtnBg, color: colors.text }}
                onMouseEnter={handleCancelBtnEnter}
                onMouseLeave={handleCancelBtnLeave}
              >
                {m('Cancel')}
              </button>
              <button
                type="button"
                onClick={() => { void confirmAdd(); }}
                disabled={isSaving}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,141,11)] text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                {isSaving ? m('Saving…') : m('Add Member')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Member Modal ──────────────────────────────── */}
      {showEditModal && selectedMember && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div
            className="rounded-2xl p-8 max-w-lg w-full shadow-2xl max-h-[min(90vh,720px)] overflow-y-auto"
            style={modalStyle}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[rgb(220,181,21)] to-[rgb(180,141,11)] flex items-center justify-center">
                  <Edit2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold" style={{ color: colors.text }}>{m('Edit Member')}</h3>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>
                    {m("Update {name}'s details").replace(
                      '{name}',
                      `${selectedMember.title} ${selectedMember.firstName} ${selectedMember.lastName}`,
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={closeEditModal}
                disabled={isSaving}
                className="p-2 rounded-lg transition-colors hover:bg-white/10 disabled:opacity-50"
                style={{ color: colors.textSecondary }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div
                className="mb-4 rounded-xl px-4 py-3 text-sm font-medium border border-red-400/40 text-red-200"
                style={{ background: 'rgba(185,28,28,0.35)' }}
                role="alert"
              >
                {m(error)}
              </div>
            )}

            {/* Form */}
            <div className="space-y-4">
              {/* Title + First Name */}
              <div className="flex gap-3">
                <FormField label="Title" required>
                  <select
                    value={editForm.title}
                    onChange={(e) => setEditForm(f => ({ ...f, title: e.target.value }))}
                    className="w-full px-3 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)] appearance-none"
                    style={fieldStyle}
                  >
                    {TITLES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </FormField>
                <div className="flex-1">
                  <FormField label="First Name" required error={editErrors.firstName}>
                    <input
                      type="text"
                      value={editForm.firstName}
                      onChange={(e) => setEditForm(f => ({ ...f, firstName: e.target.value }))}
                      placeholder={m('First name')}
                      className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]"
                      style={fieldStyle}
                    />
                  </FormField>
                </div>
              </div>
              <FormField label="Last Name" required error={editErrors.lastName}>
                <input
                  type="text"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm(f => ({ ...f, lastName: e.target.value }))}
                  placeholder={m('Last name')}
                  className="w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]"
                  style={fieldStyle}
                />
              </FormField>

              <FormField label="Email Address" required error={editErrors.email}>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm(f => ({ ...f, email: e.target.value }))}
                    placeholder={m('Email address')}
                    className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]"
                    style={fieldStyle}
                  />
                </div>
              </FormField>

              <FormField label="Phone Number" error={editErrors.phone}>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="tel"
                    value={editForm.phone}
                    onChange={(e) => setEditForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder={m('Phone number')}
                    className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]"
                    style={fieldStyle}
                  />
                </div>
              </FormField>

              <FormField label="Nationality *" error={editErrors.nationality}>
                <NationalityTypeahead
                  id="group-admin-edit-nationality"
                  value={editForm.nationality}
                  required
                  onChange={(code) => {
                    setEditForm((f) => ({ ...f, nationality: code }));
                    if (editErrors.nationality) {
                      setEditErrors((e) => {
                        const next = { ...e };
                        delete next.nationality;
                        return next;
                      });
                    }
                  }}
                  className="w-full pl-10 pr-10 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]"
                  inputStyle={fieldStyle}
                  listStyle={{
                    ...fieldStyle,
                    background: mode === 'dark' ? 'rgba(30,30,30,0.98)' : 'rgba(255,255,255,0.98)',
                  }}
                  highlightClassName={mode === 'dark' ? 'bg-white/15' : 'bg-[rgb(231,230,221)]'}
                />
              </FormField>

              <FormField label="First 4 Digits of Passport No." error={editErrors.passportPrefix}>
                <div className="relative">
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    maxLength={4}
                    value={editForm.passportPrefix}
                    onChange={(e) => setEditForm(f => ({ ...f, passportPrefix: e.target.value.toUpperCase() }))}
                    placeholder={m('e.g. K293 (Optional)')}
                    className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]"
                    style={fieldStyle}
                  />
                </div>
              </FormField>

              {/* Status toggle */}
              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: colors.text }}>{m('Account Status')}</label>
                <div className="flex gap-3">
                  {(['active', 'inactive'] as const).map((s) => {
                    const isSelected = editForm.status === s;
                    const selectedStyle = s === 'active'
                      ? { background: 'rgba(22,163,74,0.2)', border: '1px solid rgba(22,163,74,0.5)', color: '#4ade80' }
                      : { background: 'rgba(156,163,175,0.2)', border: `1px solid ${inactiveBadgeBorder}`, color: colors.textSecondary };
                    const unselectedStyle = { background: colors.inputBackground, border: `1px solid ${colors.inputBorder}`, color: colors.textMuted };
                    const btnStyle = isSelected ? selectedStyle : unselectedStyle;

                    const handleStatusClick = () => setEditForm(f => ({ ...f, status: s }));

                    return (
                      <button
                        key={s}
                        onClick={handleStatusClick}
                        className="flex-1 py-2.5 rounded-xl text-sm font-semibold capitalize transition-all flex items-center justify-center gap-2"
                        style={btnStyle}
                      >
                        {s === 'active' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                        {m(s === 'active' ? 'Active' : 'Inactive')}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={closeEditModal}
                className="flex-1 px-4 py-3 rounded-xl font-semibold transition-all"
                style={{ background: cancelBtnBg, color: colors.text }}
                onMouseEnter={handleCancelBtnEnter}
                onMouseLeave={handleCancelBtnLeave}
              >
                {m('Cancel')}
              </button>
              <button
                onClick={() => { void confirmEdit(); }}
                disabled={isSaving}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,141,11)] text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                {isSaving ? m('Saving…') : m('Save Changes')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Join Membership Modal ─────────────────────────── */}
      {showMembershipModal && selectedMember && (
        <MembershipFlowModal
          key={`mem-flow-${selectedMember.id}`}
          member={{ title: selectedMember.title, firstName: selectedMember.firstName, lastName: selectedMember.lastName }}
          onClose={closeMembershipModal}
          onSuccess={handleMembershipSuccess}
          packages={membershipCatalogue}
          agencyCreditBalance={totalCredit}
          paymentMode={onPurchaseMembership ? 'OnCredit' : 'Card'}
          hideCorporate={Boolean(onPurchaseMembership)}
          isSubmitting={isPurchasingMembership}
          submitError={membershipPurchaseError}
          onConfirmPurchase={
            onPurchaseMembership
              ? async (tier) => {
                  await onPurchaseMembership(selectedMember.id, tier.id);
                }
              : undefined
          }
        />
      )}
    </div>
  );
}

export default GroupAdmin;