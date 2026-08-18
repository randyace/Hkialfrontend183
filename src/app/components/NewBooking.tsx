import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  Calendar,
  Users,
  Plane,
  Building,
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
  Inbox,
  Loader2,
  AlertTriangle,
  Globe2,
  Search,
} from 'lucide-react';
import { useTheme } from './ThemeContext';
import {
  COUNTRIES,
  countryLabel,
  localizedCountryName,
  countryNameFor,
  filterCountries,
  isValidCountryCode,
  type CountryOption,
} from '../../../../../utils/countries';
// 2026-06-27 (round 6.2.79 — customer bug fix): segment-aware VIP
// / NFG count controller. See utils/passengerCountReducer.ts (or
// the in-tree mirror at ../../../../../../utils/passengerCountReducer
// for the wrapper build) for the bug history + invariants. Used by
// `updateCount` to defer the form decrement when the user-pick
// dialog is required, so clicking Cancel in the dialog now does
// what the user expects (no silent qty deduction).
import {
  applyGuestRemovalToForm,
  applyVipRemovalToForm,
  decideGuestDecrement,
  decideVipDecrement,
  getGuestSegmentEntries,
  getSegmentLabel,
  getVipSegmentEntries,
  resolveGuestAbsoluteIndex,
  resolveVipAbsoluteIndex,
  type PendingGuestDeletion,
  type PendingVipDeletion,
  type Segment,
} from '../../../../../utils/passengerCountReducer';
// 2026-06-27 (round 6.2.97 — Sky): short-notice (<48h) warning
// helpers. Imported from the wrapper-side utils path because
// the figma-ui subtree must remain self-previewable (INV-X1
// rule — no figma Make–incompatible cross-tree aliases). The
// wrapper build mirrors this file at the same relative path
// so the figma Make copy-paste flow keeps working.
import {
  deriveBookingStartIso,
  isBookingStartWithin48Hours,
} from '../../../../../utils/bookingShortNotice';
import { AirportTypeahead } from '../../../../../components/AirportTypeahead';
import { formatAirportDisplay } from '../../../../../utils/airports';
import {
  decodeQrFromOptimizedImageFile,
  optimizeQrImageFile,
} from '../../../../../utils/decodeQrFromImageFile';
import {
  isNfgChildrenAgeGroup,
  isNonFlyingChildAgeFilled,
  NFG_CHILD_AGE_VALUES,
  NFG_CHILDREN_AGE_GROUP,
} from '../../../../../utils/bookingGuestPayload';
import { useMsg } from '../../../../../i18n/useMsg';
import { DATE_INPUT_LANG, getAppLocale, toBcp47Locale } from '../../../../../i18n';
import { useTranslation } from 'react-i18next';
import { translatePriceLineLabel } from '../../../../../lib/addons/translatePriceLineLabel';
import type { CatalogAddonOption } from '../../../../../lib/addons/bookingAddonCatalog';
// 2026-08-18 (round — Cirium Sky API migration, Task 11). Step 1
// Lookup button calls `flightsApi.lookupFlight` (auth.api, member
// Bearer). The helper handles the Laravel envelope unwrap + Bearer
// token read at request time (INV-X4 / INV-X5).
import { flightsApi } from '../../../../../services/api';
// 2026-08-18 (round — Cirium Sky API migration, Task 11). The Step 1
// Lookup button surfaces success/error toasts via the same sonner
// API the admin figma-ui uses for the same affordance.
import { toast } from 'sonner@2.0.3';

// INV-X18: product calendar day is Asia/Hong_Kong (never toISOString for Y-m-d).
const hktTodayYmd = (d: Date = new Date()): string =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Hong_Kong' }).format(d);

// ── Travel Agency pre-negotiated billing (R6.2.100d) ────────────────────────
// R6.2.100d (2026-07-02, Sky): Travel Agency MOCK addon discount percentages
// (15/20/10%) were removed. Account discount still comes from
// travel_agencies.discount_rate (spec §9) via price-preview / apply.
// TA members settle OnCredit (accounts.credit_balance) with Net 30 terms.
// Agency Billing Reference prefills from memberData.agencyCode
// (travel_agencies.agency_code via /auth/member/me). TA_AGENCY_CODE remains
// only as a figma Make standalone-preview placeholder example — never as a
// live default when the container supplies a real agency code.
const TA_PAYMENT_METHOD      = 'On Credit – Net 30 Terms';
const TA_AGENCY_CODE         = 'GTA-HK-001';

// ── Valid & Used Promotion Codes ──────────────────────────────────────────────
const VALID_PROMO_CODES = ['HKIAL2024', 'SUMMER2024', 'VIP10OFF', 'WELCOME2024'];
const USED_PROMO_CODES = ['EXPIRED2023', 'USED123'];

// ── Region codes (2026-06-24, Sky) ────────────────────────────────────────────
// Used by the Contact Person "Contact No." field, which is split into a
// type-ahead region code combobox + a digits/dash number input. The
// list mirrors the canonical ../../../../utils/regionCodes list
// (synced to the backend LookupController::regionCodes list). This
// figma-ui copy is intentionally duplicated for self-preview
// (the figma-ui submodule is a separate import boundary, per INV-X1).
const REGION_CODES: { code: string; name: string }[] = [
  { code: '+1', name: 'United States/Canada' },
  { code: '+1-345', name: 'Cayman Islands' },
  { code: '+1-264', name: 'Anguilla' },
  { code: '+1-268', name: 'Antigua and Barbuda' },
  { code: '+1-284', name: 'British Virgin Islands' },
  { code: '+1-340', name: 'US Virgin Islands' },
  { code: '+1-671', name: 'Guam' },
  { code: '+1-758', name: 'St. Lucia' },
  { code: '+1-784', name: 'St. Vincent and the Grenadines' },
  { code: '+1-809', name: 'Dominican Republic' },
  { code: '+20', name: 'Egypt' },
  { code: '+27', name: 'South Africa' },
  { code: '+30', name: 'Greece' },
  { code: '+31', name: 'Netherlands' },
  { code: '+32', name: 'Belgium' },
  { code: '+33', name: 'France' },
  { code: '+34', name: 'Spain' },
  { code: '+36', name: 'Hungary' },
  { code: '+39', name: 'Italy' },
  { code: '+40', name: 'Romania' },
  { code: '+41', name: 'Switzerland' },
  { code: '+44', name: 'United Kingdom' },
  { code: '+45', name: 'Denmark' },
  { code: '+46', name: 'Sweden' },
  { code: '+47', name: 'Norway' },
  { code: '+48', name: 'Poland' },
  { code: '+49', name: 'Germany' },
  { code: '+51', name: 'Peru' },
  { code: '+52', name: 'Mexico' },
  { code: '+53', name: 'Cuba' },
  { code: '+54', name: 'Argentina' },
  { code: '+55', name: 'Brazil' },
  { code: '+56', name: 'Chile' },
  { code: '+57', name: 'Colombia' },
  { code: '+58', name: 'Venezuela' },
  { code: '+60', name: 'Malaysia' },
  { code: '+61', name: 'Australia' },
  { code: '+62', name: 'Indonesia' },
  { code: '+63', name: 'Philippines' },
  { code: '+64', name: 'New Zealand' },
  { code: '+65', name: 'Singapore' },
  { code: '+66', name: 'Thailand' },
  { code: '+7', name: 'Russia/Kazakhstan' },
  { code: '+81', name: 'Japan' },
  { code: '+82', name: 'South Korea' },
  { code: '+84', name: 'Vietnam' },
  { code: '+90', name: 'Turkey' },
  { code: '+91', name: 'India' },
  { code: '+92', name: 'Pakistan' },
  { code: '+93', name: 'Afghanistan' },
  { code: '+94', name: 'Sri Lanka' },
  { code: '+95', name: 'Myanmar' },
  { code: '+98', name: 'Iran' },
  { code: '+212', name: 'Morocco' },
  { code: '+213', name: 'Algeria' },
  { code: '+216', name: 'Tunisia' },
  { code: '+218', name: 'Libya' },
  { code: '+220', name: 'Gambia' },
  { code: '+221', name: 'Senegal' },
  { code: '+222', name: 'Mauritania' },
  { code: '+223', name: 'Mali' },
  { code: '+224', name: 'Guinea' },
  { code: '+225', name: 'Ivory Coast' },
  { code: '+226', name: 'Burkina Faso' },
  { code: '+227', name: 'Niger' },
  { code: '+228', name: 'Togo' },
  { code: '+229', name: 'Benin' },
  { code: '+230', name: 'Mauritius' },
  { code: '+231', name: 'Liberia' },
  { code: '+232', name: 'Sierra Leone' },
  { code: '+233', name: 'Ghana' },
  { code: '+234', name: 'Nigeria' },
  { code: '+235', name: 'Chad' },
  { code: '+236', name: 'Central African Republic' },
  { code: '+237', name: 'Cameroon' },
  { code: '+238', name: 'Cape Verde' },
  { code: '+239', name: 'São Tomé and Príncipe' },
  { code: '+240', name: 'Equatorial Guinea' },
  { code: '+241', name: 'Gabon' },
  { code: '+242', name: 'Republic of the Congo' },
  { code: '+243', name: 'Democratic Republic of the Congo' },
  { code: '+244', name: 'Angola' },
  { code: '+245', name: 'Guinea-Bissau' },
  { code: '+246', name: 'Diego Garcia' },
  { code: '+247', name: 'Saint Helena' },
  { code: '+248', name: 'Seychelles' },
  { code: '+249', name: 'Sudan' },
  { code: '+250', name: 'Rwanda' },
  { code: '+251', name: 'Ethiopia' },
  { code: '+252', name: 'Somalia' },
  { code: '+253', name: 'Djibouti' },
  { code: '+254', name: 'Kenya' },
  { code: '+255', name: 'Tanzania' },
  { code: '+256', name: 'Uganda' },
  { code: '+257', name: 'Burundi' },
  { code: '+258', name: 'Mozambique' },
  { code: '+260', name: 'Zambia' },
  { code: '+261', name: 'Madagascar' },
  { code: '+262', name: 'Réunion/Mayotte' },
  { code: '+263', name: 'Zimbabwe' },
  { code: '+264', name: 'Namibia' },
  { code: '+265', name: 'Malawi' },
  { code: '+266', name: 'Lesotho' },
  { code: '+267', name: 'Botswana' },
  { code: '+268', name: 'Eswatini' },
  { code: '+269', name: 'Comoros' },
  { code: '+290', name: 'St. Helena' },
  { code: '+291', name: 'Eritrea' },
  { code: '+297', name: 'Aruba' },
  { code: '+298', name: 'Faroe Islands' },
  { code: '+299', name: 'Greenland' },
  { code: '+350', name: 'Gibraltar' },
  { code: '+351', name: 'Portugal' },
  { code: '+352', name: 'Luxembourg' },
  { code: '+353', name: 'Ireland' },
  { code: '+354', name: 'Iceland' },
  { code: '+355', name: 'Albania' },
  { code: '+356', name: 'Malta' },
  { code: '+357', name: 'Cyprus' },
  { code: '+358', name: 'Finland' },
  { code: '+359', name: 'Bulgaria' },
  { code: '+370', name: 'Lithuania' },
  { code: '+371', name: 'Latvia' },
  { code: '+372', name: 'Estonia' },
  { code: '+373', name: 'Moldova' },
  { code: '+374', name: 'Armenia' },
  { code: '+375', name: 'Belarus' },
  { code: '+376', name: 'Andorra' },
  { code: '+377', name: 'Monaco' },
  { code: '+378', name: 'San Marino' },
  { code: '+380', name: 'Ukraine' },
  { code: '+381', name: 'Serbia' },
  { code: '+382', name: 'Montenegro' },
  { code: '+383', name: 'Kosovo' },
  { code: '+385', name: 'Croatia' },
  { code: '+386', name: 'Slovenia' },
  { code: '+387', name: 'Bosnia and Herzegovina' },
  { code: '+389', name: 'North Macedonia' },
  { code: '+420', name: 'Czech Republic' },
  { code: '+421', name: 'Slovakia' },
  { code: '+423', name: 'Liechtenstein' },
  { code: '+424', name: 'Wallis and Futuna' },
  { code: '+500', name: 'Falkland Islands' },
  { code: '+501', name: 'Belize' },
  { code: '+502', name: 'Guatemala' },
  { code: '+503', name: 'El Salvador' },
  { code: '+504', name: 'Honduras' },
  { code: '+505', name: 'Nicaragua' },
  { code: '+506', name: 'Costa Rica' },
  { code: '+507', name: 'Panama' },
  { code: '+508', name: 'St. Pierre and Miquelon' },
  { code: '+509', name: 'Haiti' },
  { code: '+590', name: 'Guadeloupe' },
  { code: '+591', name: 'Bolivia' },
  { code: '+592', name: 'Guyana' },
  { code: '+593', name: 'Ecuador' },
  { code: '+594', name: 'French Guiana' },
  { code: '+595', name: 'Paraguay' },
  { code: '+596', name: 'Martinique' },
  { code: '+597', name: 'Suriname' },
  { code: '+598', name: 'Uruguay' },
  { code: '+599', name: 'Netherlands Antilles' },
  { code: '+670', name: 'Timor-Leste' },
  { code: '+672', name: 'Norfolk Island' },
  { code: '+673', name: 'Brunei' },
  { code: '+674', name: 'Nauru' },
  { code: '+675', name: 'Papua New Guinea' },
  { code: '+676', name: 'Tonga' },
  { code: '+677', name: 'Solomon Islands' },
  { code: '+678', name: 'Vanuatu' },
  { code: '+679', name: 'Fiji' },
  { code: '+680', name: 'Palau' },
  { code: '+681', name: 'Wallis and Futuna' },
  { code: '+682', name: 'Cook Islands' },
  { code: '+683', name: 'Niue' },
  { code: '+685', name: 'Kiribati' },
  { code: '+686', name: 'Tuvalu' },
  { code: '+687', name: 'New Caledonia' },
  { code: '+688', name: 'Tokelau' },
  { code: '+689', name: 'French Polynesia' },
  { code: '+690', name: 'Tokelau' },
  { code: '+691', name: 'Micronesia' },
  { code: '+692', name: 'Marshall Islands' },
  { code: '+850', name: 'North Korea' },
  { code: '+852', name: 'Hong Kong' },
  { code: '+853', name: 'Macau' },
  { code: '+855', name: 'Cambodia' },
  { code: '+856', name: 'Laos' },
  { code: '+86', name: 'China' },
  { code: '+880', name: 'Bangladesh' },
  { code: '+886', name: 'Taiwan' },
  { code: '+960', name: 'Maldives' },
  { code: '+961', name: 'Lebanon' },
  { code: '+962', name: 'Jordan' },
  { code: '+963', name: 'Syria' },
  { code: '+964', name: 'Iraq' },
  { code: '+965', name: 'Kuwait' },
  { code: '+966', name: 'Saudi Arabia' },
  { code: '+967', name: 'Yemen' },
  { code: '+968', name: 'Oman' },
  { code: '+970', name: 'Palestine' },
  { code: '+971', name: 'United Arab Emirates' },
  { code: '+972', name: 'Israel' },
  { code: '+973', name: 'Bahrain' },
  { code: '+974', name: 'Qatar' },
  { code: '+975', name: 'Bhutan' },
  { code: '+976', name: 'Mongolia' },
  { code: '+977', name: 'Nepal' },
  { code: '+992', name: 'Tajikistan' },
  { code: '+993', name: 'Turkmenistan' },
  { code: '+994', name: 'Azerbaijan' },
  { code: '+995', name: 'Georgia' },
  { code: '+996', name: 'Kyrgyzstan' },
  { code: '+998', name: 'Uzbekistan' },
];

// Splits a stored contact phone into the region code + number pair
// the split input uses. Longest known prefix — the old
// `/^(\+\d{1,4})\s*(.*)$/` regex clipped `+85298765432` to
// number `8765432` (greedy 4 digits after +). Falls back to +852
// when the stored value has no recognised region.
function splitContactPhone(raw: string | undefined | null): { regionCode: string; contactNumber: string } {
  if (!raw) return { regionCode: '+852', contactNumber: '' };
  const trimmed = String(raw).trim();
  if (!trimmed) return { regionCode: '+852', contactNumber: '' };

  const codes = REGION_CODES
    .map((r) => r.code)
    .filter((c): c is string => typeof c === 'string' && c.length > 0)
    .sort((a, b) => b.length - a.length);

  const compactHay = trimmed.replace(/[\s().]/g, '');
  const hasLeadingPlus = trimmed.startsWith('+');

  for (const code of codes) {
    const compactCode = code.replace(/[\s().]/g, '');
    if (!compactCode) continue;

    const digitLen = compactCode.replace(/\D/g, '').length;
    if (digitLen <= 1 && !hasLeadingPlus) continue;

    if (compactHay.startsWith(compactCode)) {
      return {
        regionCode: code,
        contactNumber: compactHay.slice(compactCode.length).replace(/[^0-9-]/g, ''),
      };
    }

    const codeNoPlus = compactCode.replace(/^\+/, '');
    if (codeNoPlus && compactHay.startsWith(codeNoPlus)) {
      return {
        regionCode: code.startsWith('+') ? code : `+${code}`,
        contactNumber: compactHay.slice(codeNoPlus.length).replace(/[^0-9-]/g, ''),
      };
    }
  }

  const spaced = trimmed.match(/^(\+\d{1,4}(?:-\d{1,4})?)\s+(.+)$/);
  if (spaced) {
    return {
      regionCode: spaced[1],
      contactNumber: spaced[2].replace(/[^0-9-]/g, ''),
    };
  }

  return { regionCode: '+852', contactNumber: trimmed.replace(/[^0-9-]/g, '') };
}

// Filters user-typed input to digits and dashes only. Used by the
// contact number input's onChange so paste-in / IME input can't sneak
// letters or spaces into the wire shape.
function filterContactNumberDigits(raw: string): string {
  return raw.replace(/[^0-9-]/g, '');
}

// Combines regionCode + contactNumber into the wire-shape contactNo
// string. Trims the trailing space if either side is empty (e.g.
// when only the region code is filled in).
function combineContactNo(regionCode: string, contactNumber: string): string {
  const rc = regionCode.trim();
  const cn = contactNumber.trim();
  if (!rc && !cn) return '';
  if (!rc) return cn;
  if (!cn) return rc;
  return `${rc} ${cn}`;
}

/**
 * Two-column HH:MM time picker with a fixed 5-minute step on the minute
 * column. Built from native `<select>` elements so the browser renders ONLY
 * the options we provide — Chrome/Safari's native `<input type="time">`
 * picker ignores `step={300}` and still shows all 60 minutes.
 *
 * Inlined here (instead of imported from a parent-tree component) per
 * INV-X1 — figma-ui files must keep working when Sky copies them back into
 * the Figma Make code base, which has no access to frontend/src/components.
 */
const TIME5MIN_HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const TIME5MIN_MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

/** Inner selects are visually transparent so the wrapper's border/background
 *  shows through. They split the row equally via `flex-1`. */
const TIME5MIN_SELECT_CLS =
  'flex-1 min-w-0 bg-transparent border-0 outline-none text-sm cursor-pointer appearance-none text-center px-2 py-0';

function Time5MinSelect({
  value,
  onChange,
  required,
  wrapperClassName,
  wrapperStyle,
  testId,
}: {
  value: string;
  onChange: (next: string) => void;
  required?: boolean;
  wrapperClassName?: string;
  wrapperStyle?: React.CSSProperties;
  testId?: string;
}) {
  const m = useMsg();
  // Parse `HH:MM` defensively (mirrors the parent-tree Time5MinSelect).
  // Empty / malformed → both columns empty so the disabled `HH`/`MM`
  // placeholder is shown rather than a stale `00`.
  let safeH = '';
  let safeM = '';
  if (value && value.includes(':')) {
    const [hStr = '', mStr = ''] = value.split(':');
    const hNum = Number(hStr);
    const mNum = Number(mStr);
    if (Number.isFinite(hNum) && Number.isFinite(mNum)) {
      safeH = hStr.padStart(2, '0');
      safeM = mStr.padStart(2, '0').slice(0, 2);
    }
  }
  return (
    <div
      className={`flex items-center gap-2 ${wrapperClassName ?? ''}`}
      style={wrapperStyle}
      data-testid={testId}
      data-hkial-time-5min-select
    >
      <select
        aria-label={m('Hour')}
        value={safeH}
        onChange={(e) => onChange(`${e.target.value}:${safeM || '00'}`)}
        required={required}
        className={TIME5MIN_SELECT_CLS}
      >
        <option value="" disabled hidden>HH</option>
        {TIME5MIN_HOURS.map((hh) => (
          <option key={hh} value={hh}>{hh}</option>
        ))}
      </select>
      <span className="opacity-60 text-sm select-none">:</span>
      <select
        aria-label={m('Minute')}
        value={safeM}
        onChange={(e) => onChange(`${safeH || '00'}:${e.target.value}`)}
        required={required}
        className={TIME5MIN_SELECT_CLS}
      >
        <option value="" disabled hidden>MM</option>
        {TIME5MIN_MINUTES.map((mm) => (
          <option key={mm} value={mm}>{mm}</option>
        ))}
      </select>
    </div>
  );
}

interface MemberData {
  name: string;
  memberType: string;
  companyName?: string;
  creditBalance?: number;
  voucherCount?: number;
  // 2026-06-25 (round 6.2.61): added `email` so the Contact Person
  // "Contact Email" field can pre-fill from the account (matches the
  // name pre-fill at step2Form init). Optional — older call sites that
  // construct MemberData without email still type-check.
  email?: string;
  // 2026-06-28 (round 6.2.99 — Sky, item 5): forward `contactNumber`
  // (renamed from `user.phone` by MemberContext.buildMemberData) so
  // step 2 Contact Person "Contact No." can pre-fill from the
  // account. Mirrors the round 6.2.98 EditBooking account-phone
  // init (commit c22dde0e). Optional — splitContactPhone() falls
  // back to region='+852' + empty number when undefined.
  contactNumber?: string;
  // Round 6.2.140 — Individual membership free-credit quotas from /auth/member/me.
  membershipType?: string | null;
  membershipExpiryDate?: string;
  freeLoungeDeluxeEntriesRemaining?: number | null;
  freePremiereSuiteUpgradesRemaining?: number | null;
  /** Spec §9 — travel_agencies.agency_code for Agency Billing Reference prefill. */
  agencyCode?: string | null;
}

interface BookForMemberData {
  title: string;
  firstName: string;
  lastName: string;
  /** End-customer contact email (booking contact, not the agency payer). */
  email?: string;
  /** End-customer contact phone (booking contact, not the agency payer). */
  phone?: string;
  /** ISO 3166-1 alpha-2 nationality from the group member profile. */
  nationality?: string;
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
  // database (e.g. { origin: 'HKG', destination: 'LHR' }). Optional
  // because the figma code base's onSubmit signature doesn't include it;
  // the parent's container ignores it when not provided.
  onSubmit?: (formData: {
    form: Record<string, unknown>;
    step2Form: Record<string, unknown>;
    vipData: Array<Record<string, unknown>>;
    nonFlyingGuestData: Array<Record<string, unknown>>;
    memberData: { name: string; memberType: string };
    flightDetails?: { origin?: string; destination?: string } | null;
    /** Round 6.2.140 — free membership credit opt-in. */
    useMembershipLdFree?: boolean;
    useMembershipPsFree?: boolean;
  }) => void;
  isSubmitting?: boolean;
  error?: string;
  successRef?: string;
  // 2026-06-16 (round ?) — "Use History as New Booking" data.
  // Container (NewBookingContainer.tsx) fetches past bookings via
  // bookingsApi.getAll({memberId}), runs a shape-validation filter
  // (silently dropping rows whose data is in an old/incompatible
  // shape per Sky's instruction), and forwards the survivors here.
  // When the prop is omitted (e.g. figma standalone preview with
  // MOCK_HISTORY_BOOKINGS fallback) the dialog renders the in-file
  // mock list so the figma code stays self-previewable.
  historyBookings?: HistoryBooking[];
  isLoadingHistory?: boolean;
  // Diagnostic counts so the empty state can hint "I received 5
  // bookings but all 5 failed the shape check". The container
  // passes the same `totalReceived`/`rejectedCount` it computed
  // during validation. When omitted (figma preview, MOCK path),
  // the empty state shows the neutral copy.
  historyDiagnostics?: {
    totalReceived: number;
    rejectedCount: number;
    sampleReason?: string;
  };
  // 2026-06-17 (round 6.2.28 follow-up) — Container's live price
  // preview. Container mirrors form state via `onFormChange`, calls
  // `POST /api/member/bookings/price-preview`, and forwards the
  // backend `PricingService`'s authoritative `total_price` +
  // `breakdown[]` here. BookingSummaryCard reads this to render the
  // accommodation base prices + addons + total. When omitted (figma-ui
  // standalone preview, MOCK path), the card falls back to the local
  // rate-based calculation (PS base × 18000, LD base 5000, addons
  // × local rates) so the figma code stays self-previewable per
  // INV-X1.
  pricePreview?: {
    total: number | null;
    breakdown: Array<{
      key: string;
      label: string;
      qty: number;
      unit_price: number;
      subtotal: number;
      note?: string;
    }>;
    loading: boolean;
    error: string | null;
  };
  // 2026-06-17 — Container mirrors form state via this callback to
  // drive `usePricePreview`. Called on every form / step2Form /
  // vipData / nonFlyingGuestData change via a useEffect inside
  // NewBooking. Optional so figma-ui standalone previews keep working.
  onFormChange?: (data: {
    form: Record<string, unknown>;
    step2Form: Record<string, unknown>;
    vipData: Array<Record<string, unknown>>;
    nonFlyingGuestData: Array<Record<string, unknown>>;
    /** Round 6.2.140 — free membership credit opt-in. */
    useMembershipLdFree?: boolean;
    useMembershipPsFree?: boolean;
  }) => void;
  // 2026-06-30 (Pilot 2 Bug 4 follow-up) — Container-supplied
  // promo code validator. The useEffect at ~line 2058 calls
  // this when present, falling back to the in-file
  // VALID_PROMO_CODES / USED_PROMO_CODES arrays (figma-ui
  // standalone preview keeps working per INV-X1). The
  // Container implements the callback by calling
  // `promoCodesApi.validate(code, amount)` so the backend is
  // the single source of truth — no more hardcoded-only check.
  // Without this, ANY code that wasn't baked into the bundle
  // (e.g. batch-created UP<ts>-<suffix>) is reported 'invalid'
  // even when the backend would accept it.
  onValidatePromoCode?: (
    code: string,
    amount: number,
  ) => Promise<{
    status: 'valid' | 'invalid' | 'used';
    message?: string;
    discountAmount?: number;
  }>;
  // R6.2.100b (2026-07-02) — wrapper-supplied product-aware
  // per-hour DISPLAY (total + per-product breakdown) for the
  // "Lounge Extension" / "Additional Hour of Stay" chip. The
  // customer wrapper (NewBookingContainer.tsx) derives it
  // from `liveForm.premiereSuites` +
  // `liveForm.vipPassengers/nonFlyingGuests` via
  // `lib/addons/formalAdditionalHourRate.ts` and passes it
  // here. Per INV-X1, the wrapper owns the product-aware
  // knowledge; figma-ui stays presentational. R6.2.100c
  // (2026-07-02, same day) added the `breakdown` array so
  // mixed (1 PS + 1 LD) can show "HK$4,000 per hour · HK$3,000
  // PS + HK$1,000 LD" instead of the misleading $0. When the
  // prop is undefined (figma-ui standalone preview with the
  // in-file MOCK_* path), the view falls back to the legacy
  // `500` constant + empty breakdown so the standalone preview
  // remains visually consistent.
  loungeExtensionPerHourDisplay?: {
    total: number;
    breakdown: Array<{ label: 'PS' | 'LD'; amount: number }>;
  };
  /** 2026-07-16 — Lane B catalog picker slot (container-owned). */
  catalogAddonSlot?: React.ReactNode;
  /** Staff-owned bookable-item names (name_trad / name_simp) for summary labels. */
  catalogAddonOptions?: CatalogAddonOption[];
}

/** Shape required by the history dialog. Mirrors the `Booking` view
 *  type from src/types/api.ts for the fields the dialog reads. */
interface HistoryBooking {
  id: number;
  bookingRef: string;
  lounge: string;
  date: string;
  time: string;
  flightNumber: string;
  flightType: string;
  flightClass: string;
  status: string;
  premiereSuites: number;
  premiereVipPassengers: number;
  premiereNonFlyingGuests: number;
  vipPassengers: number;
  nonFlyingGuests: number;
  passengers: Array<{
    title: string;
    firstName: string;
    lastName: string;
    travelDoc?: string;
    travelDocNo?: string;
    membership?: string;
    membershipNo?: string;
    ageGroup?: string;
    birthday?: string;
    vipBirthday?: string;
    foodAllergies?: string;
    nationality?: string;
  }>;
  /** Lounge Deluxe NFG count (flatten also writes this). Prefer over `nonFlyingGuests` when both exist. */
  nonFlyingGuestsCount?: number;
  /** NFG personal rows (container enrich). Fallback: `advanced_details` arrays. */
  nonFlyingGuestDetails?: Array<{
    title?: string;
    firstName?: string;
    lastName?: string;
    ageGroup?: string;
    age?: number | string | null;
    foodAllergies?: string;
    nationality?: string;
  }>;
  advanced_details?: {
    nonFlyingGuests?: Array<Record<string, unknown>>;
    suite_nonFlyingGuests?: Array<Record<string, unknown>>;
    lounge_nonFlyingGuests?: Array<Record<string, unknown>>;
  };
  contactPerson: {
    name: string;
    email: string;
    phone: string;
  };
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
  /** ISO 3166-1 alpha-2 (mandatory). */
  nationality: string;
}

interface NonFlyingGuest {
  guestTitle: string;
  guestFirstName: string;
  guestLastName: string;
  guestAgeGroup: string;
  /** Child age (2–11) when guestAgeGroup is Children (aged 2-11). */
  guestAge: string;
  foodAllergies: string;
  /** ISO 3166-1 alpha-2 (mandatory). */
  nationality: string;
}

function formatBookingGuestName(title?: string, first?: string, last?: string): string {
  const firstName = typeof first === 'string' ? first.trim() : '';
  const lastName = typeof last === 'string' ? last.trim() : '';
  if (!firstName && !lastName) return '';
  const honorific = typeof title === 'string' ? title.trim() : '';
  return [honorific, firstName, lastName].filter(Boolean).join(' ');
}

/** Named VIP + NFG guests for the wheelchair recipient select. */
export function collectBookingGuestNames(
  vipRows: Array<{ vipTitle?: string; vipFirstName?: string; vipLastName?: string }>,
  nfgRows: Array<{ guestTitle?: string; guestFirstName?: string; guestLastName?: string }>,
): string[] {
  const names: string[] = [];
  const seen = new Set<string>();
  const push = (name: string) => {
    if (!name || seen.has(name)) return;
    seen.add(name);
    names.push(name);
  };
  for (const p of vipRows) {
    push(formatBookingGuestName(p.vipTitle, p.vipFirstName, p.vipLastName));
  }
  for (const g of nfgRows) {
    push(formatBookingGuestName(g.guestTitle, g.guestFirstName, g.guestLastName));
  }
  return names;
}

function historyNonBlank(...candidates: unknown[]): string {
  for (const c of candidates) {
    if (typeof c === 'string' && c.trim() !== '') return c.trim();
  }
  return '';
}

const EMPTY_HISTORY_VIP: VipPassenger = {
  vipTitle: 'Mr',
  vipFirstName: '',
  vipLastName: '',
  vipTravelDocNo: '',
  vipMembershipNo: '',
  vipAgeGroup: '',
  vipBirthday: '',
  foodAllergies: '',
  nationality: '',
};

const EMPTY_HISTORY_NFG: NonFlyingGuest = {
  guestTitle: 'Mr',
  guestFirstName: '',
  guestLastName: '',
  guestAgeGroup: '',
  guestAge: '',
  foodAllergies: '',
  nationality: '',
};

/** Wire + view aliases for a past booking VIP row. */
export function mapHistoryPassengerToVip(
  p: HistoryBooking['passengers'][number],
): VipPassenger {
  return {
    vipTitle: historyNonBlank(p.title) || 'Mr',
    vipFirstName: historyNonBlank(p.firstName),
    vipLastName: historyNonBlank(p.lastName),
    vipTravelDocNo: historyNonBlank(p.travelDocNo, p.travelDoc),
    vipMembershipNo: historyNonBlank(p.membershipNo, p.membership),
    vipAgeGroup: historyNonBlank(p.ageGroup) || 'Adults (aged 12 and above)',
    vipBirthday: historyNonBlank(p.birthday, p.vipBirthday),
    foodAllergies: historyNonBlank(p.foodAllergies),
    nationality: historyNonBlank(p.nationality).toUpperCase(),
  };
}

/** Wire + view aliases for a past booking non-flying guest row. */
export function mapHistoryGuestToNfg(
  g: NonNullable<HistoryBooking['nonFlyingGuestDetails']>[number],
): NonFlyingGuest {
  return {
    guestTitle: historyNonBlank(g.title) || 'Mr',
    guestFirstName: historyNonBlank(g.firstName),
    guestLastName: historyNonBlank(g.lastName),
    guestAgeGroup: historyNonBlank(g.ageGroup) || 'Adults (aged 12 and above)',
    guestAge:
      g.age != null && String(g.age).trim() !== ''
        ? String(g.age).trim()
        : '',
    foodAllergies: historyNonBlank(g.foodAllergies),
    nationality: historyNonBlank(g.nationality).toUpperCase(),
  };
}

/** LD NFG stepper count. Flatten stores LD on `nonFlyingGuestsCount` and the merged length on `nonFlyingGuests`. */
export function loungeDeluxeNfgCount(booking: HistoryBooking): number {
  if (typeof booking.nonFlyingGuestsCount === 'number') return booking.nonFlyingGuestsCount;
  if (typeof booking.nonFlyingGuests === 'number') return booking.nonFlyingGuests;
  return 0;
}

/** Prefer container `nonFlyingGuestDetails`; else recover from advanced_details. */
export function extractHistoryNonFlyingGuests(booking: HistoryBooking): Array<
  NonNullable<HistoryBooking['nonFlyingGuestDetails']>[number]
> {
  if (Array.isArray(booking.nonFlyingGuestDetails) && booking.nonFlyingGuestDetails.length > 0) {
    return booking.nonFlyingGuestDetails;
  }
  const ad = booking.advanced_details;
  if (!ad || typeof ad !== 'object') return [];
  const suite = Array.isArray(ad.suite_nonFlyingGuests) ? ad.suite_nonFlyingGuests : [];
  const lounge = Array.isArray(ad.lounge_nonFlyingGuests) ? ad.lounge_nonFlyingGuests : [];
  if (suite.length + lounge.length > 0) {
    return [...suite, ...lounge] as NonNullable<HistoryBooking['nonFlyingGuestDetails']>;
  }
  if (Array.isArray(ad.nonFlyingGuests) && ad.nonFlyingGuests.length > 0) {
    return ad.nonFlyingGuests as NonNullable<HistoryBooking['nonFlyingGuestDetails']>;
  }
  return [];
}

function padHistoryRows<T>(rows: T[], needed: number, blank: T): T[] {
  const next = rows.slice(0, needed);
  while (next.length < needed) next.push(blank);
  return next;
}

/** Clone VIP + NFG personal rows from a past booking into NewBooking form state. */
export function buildHistoryGuestForms(booking: HistoryBooking): {
  vipData: VipPassenger[];
  nonFlyingGuestData: NonFlyingGuest[];
} {
  const totalVipNeeded = booking.premiereVipPassengers + booking.vipPassengers;
  const totalGuestNeeded = booking.premiereNonFlyingGuests + loungeDeluxeNfgCount(booking);
  return {
    vipData: padHistoryRows(
      (booking.passengers ?? []).map(mapHistoryPassengerToVip),
      totalVipNeeded,
      { ...EMPTY_HISTORY_VIP },
    ),
    nonFlyingGuestData: padHistoryRows(
      extractHistoryNonFlyingGuests(booking).map(mapHistoryGuestToNfg),
      totalGuestNeeded,
      { ...EMPTY_HISTORY_NFG },
    ),
  };
}

const flightDatabase: { [key: string]: { origin: string; destination: string; arrivalTime: string } } = {
  // Values are IATA codes (typeahead stores codes; labels come from airports.ts).
  'CX888': { origin: 'HKG', destination: 'LHR', arrivalTime: '06:30' },
  'CX250': { origin: 'NRT', destination: 'HKG', arrivalTime: '14:15' },
  'CX505': { origin: 'SIN', destination: 'HKG', arrivalTime: '21:45' },
  'CX270': { origin: 'ICN', destination: 'HKG', arrivalTime: '08:30' },
  'CX251': { origin: 'JFK', destination: 'HKG', arrivalTime: '07:00' },
  'CX872': { origin: 'SFO', destination: 'HKG', arrivalTime: '16:25' },
  'CX420': { origin: 'BKK', destination: 'HKG', arrivalTime: '19:10' },
  'CX715': { origin: 'SYD', destination: 'HKG', arrivalTime: '05:45' },
};

// ── Price breakdown helper (R6.2.104, 2026-07-04, Sky) ───────────────────────
// Single source of truth for "PS / LD / Add-ons / Total" extraction from the
// Container's `pricePreview` prop. Used by both `BookingSummaryCard` (Step 5)
// AND the new Step 2 PS/LD running-subtotal chips, so the two surfaces
// stay in lock-step with each other and with the backend's
// `PricingService::compute()`. Returns zero for sections the backend
// hasn't loaded yet (gated by `ppHasLoaded`) so callers can safely render
// the chip without a stale `HK$0` flash.
//
// R6.2.105 (2026-07-04, Sky) — refined the per-section key filter:
//   - PS / LD sections: only `base`, `add_on_flying_guest`,
//     `add_on_non_flying_guest`, `add_on_child_2_11_1_2`,
//     `add_on_child_2_11_3_plus` lines. The `add_on_additional_hour`
//     line was previously lumped into the section subtotal because its
//     label contains "Premiere Suite" / "Lounge Deluxe" — but the
//     Lounge Extension belongs in the Add-ons subtotal, not the
//     section subtotal.
//   - Add-ons: sum `add_on_additional_hour` (Lounge Extension, one or
//     two lines per booking — one per sub-context), `add_on_limousine`
//     (Limousine Transfer, only when emitted — see note below), and
//     the folded `addons` line (Limo+Wheelchair from
//     `request.addons.items[]` via `postFoldAddonsAndDiscount`). Pre-6.2.105
//     the helper only read the `addons` line and silently dropped the
//     Lounge Extension from the Add-on Services Subtotal.
function getPriceSectionPrices(pricePreview?: {
  total?: number | null;
  breakdown?: Array<{
    key: string;
    label: string;
    qty: number;
    unit_price: number;
    subtotal: number;
    note?: string;
  }>;
} | null) {
  const ppBreakdown = pricePreview?.breakdown ?? [];
  const ppHasLoaded = ppBreakdown.length > 0;
  // Section keys (PS / LD): base + per-kind guest additions.
  const PS_LD_SECTION_KEYS = new Set([
    'base',
    'add_on_flying_guest',
    'add_on_non_flying_guest',
    'add_on_child_2_11_1_2',
    'add_on_child_2_11_3_plus',
  ]);
  // Add-on keys: additional hour (Lounge Extension), limousine
  // (admin-side only — the customer always sends Limo via
  // `addons.items[]` which folds into the `addons` line, so
  // `add_on_limousine` is never emitted for customer requests),
  // and the folded `addons` line.
  const ADDON_KEYS = new Set([
    'add_on_additional_hour',
    'add_on_limousine',
    'addons',
  ]);
  // Round 6.2.107b — membership free-entry / upgrade credits are emitted
  // by the backend as negative breakdown lines. Keep them out of the
  // product/add-on section subtotals so the subtotals show the gross
  // amount, and surface the discount as separate rows in Step 5.
  const MEMBERSHIP_DISCOUNT_KEYS = new Set([
    'membership_ld_free',
    'membership_ps_free',
    'membership_ps_discount',
    'membership_flying_guest_discount',
    'membership_non_flying_guest_discount',
    'membership_limousine_discount',
  ]);
  // Free-entry / % promo codes land as `promo_discount` (server
  // postFoldPromoCode, or client adjustedPricePreview). Same display
  // treatment as membership credits: gross section subtotals + a
  // separate green deduction row so Booking Summary does not hide
  // the free-entry amount while only changing Total Charge.
  const PROMO_DISCOUNT_KEYS = new Set([
    'promo_discount',
  ]);
  // Spec §9 — Agency / Corporate account % off (PricingService +
  // postFoldAddonsAndDiscount). Same display treatment as promo /
  // membership: keep section subtotals gross and show a green row.
  const ACCOUNT_DISCOUNT_KEYS = new Set([
    'account_discount',
  ]);
  const ppPsSectionSubtotal = ppBreakdown
    .filter((l) => PS_LD_SECTION_KEYS.has(l.key) && /Premiere Suite/i.test(l.label))
    .reduce((sum, l) => sum + l.subtotal, 0);
  const ppLdSectionSubtotal = ppBreakdown
    .filter((l) => PS_LD_SECTION_KEYS.has(l.key) && /Lounge Deluxe/i.test(l.label))
    .reduce((sum, l) => sum + l.subtotal, 0);
  const ppAddonsSubtotal = ppBreakdown
    .filter((l) => ADDON_KEYS.has(l.key) && !/security escort/i.test(l.label ?? ''))
    .reduce((sum, l) => sum + l.subtotal, 0);
  const membershipDiscounts = ppBreakdown
    .filter((l) => MEMBERSHIP_DISCOUNT_KEYS.has(l.key));
  const membershipDiscountTotal = membershipDiscounts
    .reduce((sum, l) => sum + l.subtotal, 0);
  const promoDiscounts = ppBreakdown
    .filter((l) => PROMO_DISCOUNT_KEYS.has(l.key));
  const promoDiscountTotal = promoDiscounts
    .reduce((sum, l) => sum + l.subtotal, 0);
  const accountDiscounts = ppBreakdown
    .filter((l) => ACCOUNT_DISCOUNT_KEYS.has(l.key));
  const accountDiscountTotal = accountDiscounts
    .reduce((sum, l) => sum + l.subtotal, 0);
  // 2026-07-16 — per-line add-on rows for Booking Summary / Final Review.
  // Backend `postFoldAddonsAndDiscount` emits one `key=addons` line per
  // catalog item (Lane A specials + Lane B). Lounge Extension lands as
  // `add_on_additional_hour`. Pre-fix BookingSummaryCard only listed
  // three step2Form steppers, so Lane B names were missing while the
  // Add-on Services Subtotal still included them.
  const addonLines = ppHasLoaded
    ? ppBreakdown.filter(
        (l) =>
          ADDON_KEYS.has(l.key) &&
          l.subtotal !== 0 &&
          !/security escort/i.test(l.label ?? ''),
      )
    : [];
  return {
    psSectionPrice: ppHasLoaded ? ppPsSectionSubtotal : 0,
    ldSectionPrice: ppHasLoaded ? ppLdSectionSubtotal : 0,
    addonsAmtFinal: ppHasLoaded ? ppAddonsSubtotal : 0,
    addonLines,
    membershipDiscounts,
    membershipDiscountTotal: ppHasLoaded ? membershipDiscountTotal : 0,
    promoDiscounts,
    promoDiscountTotal: ppHasLoaded ? promoDiscountTotal : 0,
    accountDiscounts,
    accountDiscountTotal: ppHasLoaded ? accountDiscountTotal : 0,
    ppHasLoaded,
    finalTotal: pricePreview?.total != null ? pricePreview.total : 0,
  };
}

// Lane B catalog lines only — Lane A specials keep dedicated step2Form rows.
function filterLaneBCatalogAddonLines(
  addonLines: Array<{
    key: string;
    label: string;
    qty: number;
    unit_price: number;
    subtotal: number;
    note?: string;
  }>,
) {
  return addonLines.filter((l) => {
    const label = (l.label ?? '').toLowerCase();
    return (
      !/limousine/i.test(label) &&
      !/wheelchair/i.test(label) &&
      !/lounge extension|additional hour|extension of stay/i.test(label) &&
      !/security escort/i.test(label) &&
      !/private transport/i.test(label)
    );
  });
}

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
  const optionStyle: React.CSSProperties = {
    backgroundColor: isDark ? '#0a1929' : '#ffffff',
    color: isDark ? '#ffffff' : 'rgb(64, 63, 52)',
  };

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
    reviewSectionBg, reviewHeaderBg, secondaryBtnStyle, optionBg, optionStyle,
    addonItemBg, summaryBoxBg, summaryPurpleBg, addonTotalBg,
    dividerClass, borderSubtle, borderMedium, borderDivider,
    backBtnStyle, summaryBoxGoldBg, summaryBoxGoldHeaderBg, guestBadgeBg,
    taInfoBoxBg, creditTermsBoxBg, priceBreakdownTotalBg, iconMutedClass,
    iconMutedStyle,
  };
}

// ── Sub-components ───────────────────────────────────────────────────────────

function SectionHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const m = useMsg();
  const { textPrimary, textMuted } = useThemedStyles();
  return (
    <div className="flex items-start justify-between gap-3 mb-4">
      <div>
        <div className="text-sm" style={textPrimary}>{m(title)}</div>
        {subtitle && <div className="text-xs mt-0.5" style={textMuted}>{m(subtitle)}</div>}
      </div>
    </div>
  );
}

function SubSectionLabel({ label }: { label: string }) {
  const m = useMsg();
  const { textMuted } = useThemedStyles();
  // Auto-translate: callers may pass English source or already-m()'d text.
  return (
    <div className="text-xs mb-2 mt-4" style={textMuted}>{m(label)}</div>
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
  testId,
  addonKey,
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
  // 2026-06-27 (round 6.2.79) — added so the integration test
  // (__tests__/newBooking-qty-dialog.test.tsx) can locate the
  // exact stepper card driving each per-kind count, without
  // relying on label text or DOM ordering (which can shift as
  // the form layout evolves).
  testId?: string;
  /** Stable DOM key for portal enhancers (locale-independent). */
  addonKey?: string;
}) {
  const m = useMsg();
  const { isDark, textPrimary, textMuted, stepperCardBg, stepperBtnStyle, stepperIconColor } = useThemedStyles();
  const titleLabel = m(title);
  const subtitleLabel = m(subtitle);
  const helperLabel = helperText ? m(helperText) : undefined;
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={stepperCardBg}
      data-hkial-stepper={testId}
      data-hkial-addon={addonKey}
    >
      {/* Card label row */}
      <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(200,199,190,0.3)' }}>
        <div
          className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}
        >
          {icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm" style={textPrimary}>{titleLabel}</div>
          <div className="text-xs" style={textMuted}>{subtitleLabel}</div>
        </div>
      </div>
      {/* Stepper row */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <button
          type="button"
          onClick={onDecrement}
          aria-label={`${m('Decrease')} ${titleLabel}`}
          data-hkial-stepper-decrement={testId}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:opacity-80"
          style={stepperBtnStyle}
        >
          <Minus className="w-3 h-3" style={stepperIconColor} />
        </button>
        <span className="text-xl tabular-nums" style={textPrimary} data-hkial-stepper-value={testId}>{value}</span>
        <button
          type="button"
          onClick={onIncrement}
          disabled={incrementDisabled}
          aria-label={`${m('Increase')} ${titleLabel}`}
          data-hkial-stepper-increment={testId}
          className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:opacity-80 disabled:opacity-40 disabled:cursor-not-allowed"
          style={stepperBtnStyle}
        >
          <Plus className="w-3 h-3" style={stepperIconColor} />
        </button>
      </div>
      {/* Helper text */}
      {helperLabel && (
        <div className="px-4 pb-2.5 pt-0">
          <div className="text-xs" style={textMuted}>{helperLabel}</div>
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
  addonKey,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  /** Stable DOM key for portal enhancers (locale-independent). */
  addonKey?: string;
}) {
  const m = useMsg();
  const { textPrimary, textMuted, stepperCardBg } = useThemedStyles();
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={stepperCardBg}
      data-hkial-addon={addonKey}
    >
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${iconBg}`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm" style={textPrimary}>{m(title)}</div>
            <div className="text-xs" style={textMuted}>{m(subtitle)}</div>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {checked && <span className="text-sm" style={textPrimary}>{m('Yes')}</span>}
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
  const m = useMsg();
  const { textPrimary, textMuted } = useThemedStyles();
  // Translate label + known enum/display values; unknown strings pass through.
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-xs" style={textMuted}>{m(label)}</span>
      <span className="text-xs text-right ml-4" style={textPrimary}>{m(value)}</span>
    </div>
  );
}

// ── Review helpers (auto-translate labels/values for Chinese locale) ─────────

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
  const m = useMsg();
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
        <span className="text-sm" style={textPrimary}>{m(title)}</span>
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
  const m = useMsg();
  const { textPrimary, textMuted } = useThemedStyles();
  const displayValue =
    typeof value === 'string' && value && value !== '—'
      ? m(value)
      : value;
  return (
    <div>
      <div className="text-xs mb-0.5" style={textMuted}>{m(label)}</div>
      <div className="text-sm" style={textPrimary}>{displayValue || '—'}</div>
    </div>
  );
}

// ── ContactNoSplit (2026-06-24, Sky) ──────────────────────────────────────────
// Replaces the single `contactNo` text input with two side-by-side
// inputs:
//   - regionCode: type-ahead combobox (input + filtered dropdown of
//     known region codes). Users can either pick from the dropdown
//     or type a free-form code (e.g. "+33" for France — not in the
//     default list but the field accepts any "+NNN" string).
//   - contactNumber: text input that strips everything but digits
//     and dashes (matching the AuthPage pattern at
//     src/components/AuthPage.tsx:241-251).
// The parent owns the source of truth (`step2Form.regionCode` /
// `step2Form.contactNumber`) and is responsible for keeping
// `step2Form.contactNo` (the legacy wire-shape string) in sync via
// `combineContactNo`.
function ContactNoSplit({
  regionCode,
  contactNumber,
  onRegionCodeChange,
  onContactNumberChange,
  fieldStyle,
  fieldClass,
  isDark,
}: {
  regionCode: string;
  contactNumber: string;
  onRegionCodeChange: (code: string) => void;
  onContactNumberChange: (num: string) => void;
  fieldStyle: React.CSSProperties;
  fieldClass: string;
  isDark: boolean;
}) {
  const m = useMsg();
  const { glassStyle } = useTheme();
  const [regionOpen, setRegionOpen] = useState(false);
  const [regionHighlight, setRegionHighlight] = useState(0);
  const regionWrapperRef = useRef<HTMLDivElement>(null);

  const filteredRegions = useMemo(() => {
    const q = regionCode.trim().toLowerCase();
    if (!q) return REGION_CODES;
    return REGION_CODES.filter(
      (r) => r.code.toLowerCase().includes(q) || r.name.toLowerCase().includes(q),
    );
  }, [regionCode]);

  const pickRegion = (code: string) => {
    onRegionCodeChange(code);
    setRegionOpen(false);
    setRegionHighlight(0);
  };

  const handleRegionKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!regionOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setRegionOpen(true);
      return;
    }
    if (!regionOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setRegionHighlight((h) => Math.min(h + 1, filteredRegions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setRegionHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const pick = filteredRegions[regionHighlight];
      if (pick) pickRegion(pick.code);
    } else if (e.key === 'Escape') {
      setRegionOpen(false);
    }
  };

  // Close region dropdown on outside click
  // (nationality typeahead lives in GuestNationalityTypeahead below)
  useEffect(() => {
    if (!regionOpen) return;
    const handler = (e: MouseEvent) => {
      if (regionWrapperRef.current && !regionWrapperRef.current.contains(e.target as Node)) {
        setRegionOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [regionOpen]);

  const mutedColor = isDark ? 'text-gray-400' : 'text-[rgb(160,159,148)]';

  return (
    <div className="flex gap-2">
      <div className="relative w-32" ref={regionWrapperRef}>
        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
        <input
          type="text"
          name="regionCode"
          value={regionCode}
          onChange={(e) => onRegionCodeChange(e.target.value)}
          onFocus={() => { setRegionOpen(true); setRegionHighlight(0); }}
          onKeyDown={handleRegionKeyDown}
          role="combobox"
          aria-expanded={regionOpen}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          autoComplete="off"
          style={fieldStyle}
          className={fieldClass + ' pl-10 pr-8'}
          placeholder="+852"
          required
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setRegionOpen((o) => !o)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
          aria-label={m('Toggle region code list')}
        >
          <ChevronDown className={`w-4 h-4 transition-transform ${regionOpen ? 'rotate-180' : ''}`} />
        </button>
        {regionOpen && (
          <ul
            role="listbox"
            data-theme={isDark ? 'dark' : 'light'}
            className="absolute z-50 mt-1 w-56 max-h-60 overflow-auto rounded-xl border shadow-lg"
            style={{
              ...glassStyle,
              background: isDark ? '#0a1929' : '#FFFFFF',
              color: isDark ? '#ffffff' : 'rgb(64, 63, 52)',
            }}
          >
            {filteredRegions.length === 0 ? (
              <li className="px-3 py-2 text-sm text-gray-400">{m('No matches')}</li>
            ) : (
              filteredRegions.map((r: { code: string; name: string }, idx: number) => {
                const selected = regionCode === r.code;
                const highlighted = idx === regionHighlight;
                return (
                  <li
                    key={r.code}
                    role="option"
                    aria-selected={selected}
                    onMouseEnter={() => setRegionHighlight(idx)}
                    onMouseDown={(e) => { e.preventDefault(); pickRegion(r.code); }}
                    className={`px-3 py-2 cursor-pointer flex justify-between items-center text-sm ${
                      highlighted ? (isDark ? 'bg-white/15' : 'bg-[rgb(231,230,221)]') : ''
                    } ${selected ? 'font-semibold' : ''}`}
                  >
                    <span>{r.name}</span>
                    <span className={mutedColor}>{r.code}</span>
                  </li>
                );
              })
            )}
          </ul>
        )}
      </div>
      <div className="relative flex-1">
        <input
          type="tel"
          name="contactNumber"
          value={contactNumber}
          onChange={(e) => onContactNumberChange(filterContactNumberDigits(e.target.value))}
          inputMode="tel"
          pattern="[0-9\-]*"
          style={fieldStyle}
          className={fieldClass + ' pl-4'}
          placeholder="9876-5432"
          required
        />
      </div>
    </div>
  );
}

// ── GuestNationalityTypeahead (2026-07-17) ───────────────────────────────────
// ISO 3166-1 alpha-2 nationality typeahead for VIP / NFG guest rows.
// Stores the 2-letter code; displays "Name (CODE)" when selected.
function GuestNationalityTypeahead({
  value,
  onChange,
  fieldStyle,
  fieldClass,
  isDark,
  required = true,
}: {
  value: string;
  onChange: (code: string) => void;
  fieldStyle: React.CSSProperties;
  fieldClass: string;
  isDark: boolean;
  required?: boolean;
}) {
  const m = useMsg();
  const { i18n } = useTranslation();
  const bcp47 = toBcp47Locale(i18n.language || getAppLocale());
  const { glassStyle } = useTheme();
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const [query, setQuery] = useState(() => {
    if (isValidCountryCode(value)) {
      const hit = COUNTRIES.find((c) => c.code === value.toUpperCase());
      return hit ? countryLabel(hit, bcp47) : value;
    }
    return '';
  });
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync display ONLY when parent sets a valid code. Do not clear `query`
  // when value becomes '' — first keystroke after a selection calls
  // onChange('') and clearing query here made the field non-editable.
  useEffect(() => {
    if (isValidCountryCode(value)) {
      const hit = COUNTRIES.find((c) => c.code === value.toUpperCase());
      if (hit) setQuery(countryLabel(hit, bcp47));
    }
  }, [value, bcp47]);

  const filtered = useMemo(() => filterCountries(query, bcp47), [query, bcp47]);

  const pick = (c: CountryOption) => {
    onChange(c.code);
    setQuery(countryLabel(c, bcp47));
    setOpen(false);
    setHighlight(0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setOpen(true);
      return;
    }
    if (!open) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((h) => Math.min(h + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((h) => Math.max(h - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const row = filtered[highlight];
      if (row) pick(row);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
        if (isValidCountryCode(value)) {
          const hit = COUNTRIES.find((c) => c.code === value.toUpperCase());
          if (hit) setQuery(countryLabel(hit, bcp47));
        } else if (!value) {
          setQuery('');
        }
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, value]);

  const mutedColor = isDark ? 'text-gray-400' : 'text-[rgb(160,159,148)]';

  return (
    <div className="relative" ref={wrapperRef}>
      <Globe2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10 pointer-events-none" />
      <input
        type="text"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setHighlight(0);
          if (value) onChange('');
        }}
        onFocus={() => {
          setOpen(true);
          setHighlight(0);
        }}
        onKeyDown={handleKeyDown}
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-autocomplete="list"
        autoComplete="off"
        required={required && !isValidCountryCode(value)}
        style={fieldStyle}
        className={fieldClass + ' pl-10 pr-8'}
        placeholder={m('Search nationality (e.g. Hong Kong)')}
      />
      <button
        type="button"
        tabIndex={-1}
        onClick={() => setOpen((o) => !o)}
        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
        aria-label={m('Toggle nationality list')}
      >
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <ul
          role="listbox"
          data-theme={isDark ? 'dark' : 'light'}
          className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-xl border shadow-lg"
          style={{
            ...glassStyle,
            background: isDark ? '#0a1929' : '#FFFFFF',
            color: isDark ? '#ffffff' : 'rgb(64, 63, 52)',
          }}
        >
          {filtered.length === 0 ? (
            <li className="px-3 py-2 text-sm text-gray-400">{m('No matches')}</li>
          ) : (
            filtered.map((c, idx) => {
              const selected = value?.toUpperCase() === c.code;
              const highlighted = idx === highlight;
              return (
                <li
                  key={c.code}
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={() => setHighlight(idx)}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    pick(c);
                  }}
                  className={`px-3 py-2 cursor-pointer flex justify-between items-center text-sm ${
                    highlighted ? (isDark ? 'bg-white/15' : 'bg-[rgb(231,230,221)]') : ''
                  } ${selected ? 'font-semibold' : ''}`}
                >
                  <span>{localizedCountryName(c.code, bcp47)}</span>
                  <span className={mutedColor}>{c.code}</span>
                </li>
              );
            })
          )}
        </ul>
      )}
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
  const m = useMsg();
  const { isDark, colors, textMuted } = useThemedStyles();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number>(0);
  const [camError, setCamError] = useState('');
  const [imageScanError, setImageScanError] = useState('');
  const [imageScanning, setImageScanning] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [detected, setDetected] = useState('');

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }, []);

  const handleQrDetected = useCallback((code: string) => {
    setDetected(code);
    stopCamera();
    setTimeout(() => onDetected(code), 700);
  }, [onDetected, stopCamera]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    setImageScanError('');
    setImageScanning(true);
    try {
      const resizedFile = await optimizeQrImageFile(file);
      const code = await decodeQrFromOptimizedImageFile(resizedFile);
      if (code) {
        handleQrDetected(code);
      } else {
        setImageScanError(
          m('No QR code found. Please ensure the code is clearly visible.'),
        );
      }
    } catch {
      setImageScanError(
        m('No QR code found. Please ensure the code is clearly visible.'),
      );
    } finally {
      setImageScanning(false);
    }
  };

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
        setCamError(
          m(
            'Unable to access the camera. Please ensure camera permissions are granted. Note: Live scanning requires a secure HTTPS connection (or localhost).',
          ),
        );
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
            handleQrDetected(code.data);
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
    }).catch(() => setCamError(m('QR scanner library could not be loaded.')));

    return () => { cancelled = true; cancelAnimationFrame(rafRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanning, handleQrDetected]);

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
              <div className="text-white text-sm">{m('Scan Coupon QR Code')}</div>
              <div className="text-gray-400 text-xs">{m('Point camera at your coupon')}</div>
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
                <div className="text-sm mb-2" style={{ color: isDark ? '#6ee7b7' : 'rgb(5, 150, 105)' }}>{m('QR Code Detected!')}</div>
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
                <div className="text-xs mt-2" style={textMuted}>{m('Filling in promotion code…')}</div>
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

        <div className="mt-4 flex flex-col items-center justify-center w-full px-4 pb-4">
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            style={{ display: 'none' }}
          />
          <button
            type="button"
            disabled={imageScanning || Boolean(detected)}
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-2.5 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg border border-gray-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {imageScanning ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
            )}
            {imageScanning ? m('Scanning image…') : 'Upload from Gallery'}
          </button>
          {imageScanError && (
            <p className="text-xs text-center mt-2 text-red-400">{imageScanError}</p>
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
              {m('Align the QR code within the frame — it will be detected automatically')}
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
// 2026-06-16 (round ?) — used as figma-preview fallback when the
// container does not provide the `historyBookings` prop. Includes the
// `contactPerson` block (added for the new customer-info loading path)
// so the figma preview demonstrates the full "load from history"
// flow. In production the container overrides this with real API data.
const HISTORY_BOOKINGS: HistoryBooking[] = [
  {
    id: 1,
    bookingRef: 'D-20260112-84721',
    lounge: 'The Wing First Class Lounge',
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
    contactPerson: { name: 'John Smith', email: 'john.smith@example.com', phone: '+852 9876 5432' },
  },
  {
    id: 2,
    bookingRef: 'D-20260120-63195',
    lounge: 'The Pier Business Class Lounge',
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
    contactPerson: { name: 'Sarah Chen', email: 'sarah.chen@example.com', phone: '+852 9123 4567' },
  },
  {
    id: 3,
    bookingRef: 'D-20251228-29847',
    lounge: 'The Cabin Lounge',
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
    contactPerson: { name: 'Michael Lee', email: 'michael.lee@example.com', phone: '+852 9222 3344' },
  },
  {
    id: 4,
    bookingRef: 'A-20251215-51639',
    lounge: 'The Arrival Lounge',
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
    contactPerson: { name: 'Emily Chan', email: 'emily.chan@example.com', phone: '+852 9555 6677' },
  },
];

// ── Main component ───────────────────────────────────────────────────────────
export function NewBooking({ setActiveTab, memberData, prefillMember: prefillMemberProp, onSubmit, isSubmitting, error, successRef, historyBookings: historyBookingsProp, isLoadingHistory, historyDiagnostics, pricePreview, onFormChange, onValidatePromoCode, loungeExtensionPerHourDisplay, catalogAddonSlot, catalogAddonOptions }: NewBookingProps) {
  const m = useMsg();
  const priceLineLabel = (label: string) =>
    translatePriceLineLabel(label, toBcp47Locale(getAppLocale()), m, catalogAddonOptions);
  const { isDark, colors, card, fieldStyle, fieldClass, labelClass, labelStyle, textPrimary, textSecondary, textMuted, stepperCardBg, reviewSectionBg, reviewHeaderBg, secondaryBtnStyle, optionBg, optionStyle, addonItemBg, summaryBoxBg, summaryPurpleBg, addonTotalBg, dividerClass, borderSubtle, borderMedium, borderDivider, backBtnStyle, summaryBoxGoldBg, summaryBoxGoldHeaderBg, guestBadgeBg, taInfoBoxBg, creditTermsBoxBg, priceBreakdownTotalBg, iconMutedClass } = useThemedStyles();
  const { glassStyle } = useTheme();
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
    origin: '',
    destination: '',
    premiereSuites: 0,
    premiereVipPassengers: 0,
    premiereNonFlyingGuests: 0,
    vipPassengers: prefillMember ? 1 : 0,
    nonFlyingGuests: 0,
  });
  // 2026-06-08 (reactive fix) — leg 1 flight time. The step 1 form
  // previously had no time field (only a date field), so backend's
  // TransitLegsRule rejected legs[0] as missing flightTime when
  // flightType === 'Transit'. Required format: HH:MM in 00:00–23:59.
  // Used for both Transit (legs[0].flightTime) and non-Transit
  // (top-level flight_time field, via the existing data.time path in
  // api.ts). Kept as separate useState (not packed into `form`) for
  // the same reason as the leg2* cluster below.
  const [leg1FlightTime, setLeg1FlightTime] = useState('');
  // 2026-08-18 (round — Cirium Sky API migration, Task 11). Local
  // loading state for the Step 1 Lookup button. Mirrors the admin
  // figma-ui's `flightLookupLoading`. Prevents double-submit while
  // `flightsApi.lookupFlight` is in flight.
  const [flightLookupLoading, setFlightLookupLoading] = useState(false);
  // 2026-06-08 — Transit 2nd leg fields (I-T2, Q4A reuse). The 1st leg
  // uses date/flightNumber/flightClass above; the 2nd leg is collected
  // here. Only meaningful when flightType === 'Transit' — the backend's
  // TransitLegsRule is the source of truth; this is for UX.
  // Kept as separate useState (not packed into `form`) to avoid
  // disturbing the existing 7 `setForm((p) => ({...p, X: Y}))` call
  // sites which infer a partial-update shape; adding fields to `form`
  // breaks that inference under React 18 + TS strict.
  const [leg2ArrivalDate, setLeg2ArrivalDate] = useState('');
  const [leg2FlightNo, setLeg2FlightNo] = useState('');
  const [leg2FlightTime, setLeg2FlightTime] = useState('');
  const [leg2FlightClass, setLeg2FlightClass] = useState('');
  // 2026-06-08 (round 6.2.8): leg 2 destination. Per Sky's spec, leg 2
  // (outbound from HKG) carries its own destination field — separate
  // from the step-1 form's `form.destination` (which is used by
  // Departure mode only and was removed from Transit mode in this
  // round). backend's TransitLegsRule does not validate this field
  // today; it is captured for future display / pricing use.
  const [leg2Destination, setLeg2Destination] = useState('');
  // 2026-06-08 — live 6h gap pre-check error (I-T5). Backend is the source
  // of truth; this is the UX layer that blocks submit before the user
  // even tries a < 6h gap.
  const [transitGapError, setTransitGapError] = useState<string | null>(null);

  const prefillVipEntry: VipPassenger | null = prefillMember
    ? {
        vipTitle: prefillMember.title,
        vipFirstName: prefillMember.firstName,
        vipLastName: prefillMember.lastName,
        vipTravelDocNo: prefillMember.passportPrefix || '',
        vipMembershipNo: '',
        vipAgeGroup: 'Adults (aged 12 and above)',
        vipBirthday: '',
        foodAllergies: '',
        nationality: prefillMember.nationality || '',
      }
    : null;

  const [vipData, setVipData] = useState<VipPassenger[]>(
    prefillVipEntry ? [prefillVipEntry] : []
  );
  const [nonFlyingGuestData, setNonFlyingGuestData] = useState<NonFlyingGuest[]>([]);
  // 2026-06-27 (round 6.2.79 — customer bug fix). The pre-fix code
  // tracked `pendingVipCount` / `pendingGuestCount` as bare numbers
  // (the new total after decrement) and decremented the form
  // immediately. That had three user-visible defects:
  //   (a) clicking Cancel in the dialog still left the qty at the
  //       lower value,
  //   (b) the dialog listed ALL VIPs (PS + LD) when the user had
  //       only decreased PS VIPs, so LD VIPs were "wrongly
  //       included" as removal candidates,
  //   (c) the Premiere Suite label used `premiereSuiteEnd =
  //       form.premiereSuites`, which confused the suite count with
  //       the VIP array offset (vipData never holds suites).
  // The fix: pendingVipDeletion / pendingGuestDeletion are
  // segment-aware objects, set BEFORE the form is decremented.
  // `updateCount` only calls `setForm` when the decrement is safe
  // (no data loss), so Cancel is a true no-op. See
  // utils/passengerCountReducer.ts and __tests__/passengerCountReducer.test.ts.
  const [pendingVipDeletion, setPendingVipDeletion] = useState<PendingVipDeletion | null>(null);
  const [pendingGuestDeletion, setPendingGuestDeletion] = useState<PendingGuestDeletion | null>(null);
  const [flightDetails, setFlightDetails] = useState<{
    origin: string;
    destination: string;
    arrivalTime: string;
  } | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [promoCodeStatus, setPromoCodeStatus] = useState<'valid' | 'invalid' | 'used' | null>(null);
  const [promoCodeMessage, setPromoCodeMessage] = useState<string | null>(null);
  const [acceptedTC, setAcceptedTC] = useState(false);
  const [bookingNumber, setBookingNumber] = useState('');
  const [noAddonRequired, setNoAddonRequired] = useState(false);
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  // 2026-06-27 (round 6.2.97 — Sky): short-notice (<48h) warning.
  // When the customer's selected start time is within 48 hours
  // of now, intercept the Confirm click and show a warning
  // dialog. Per Sky: "The booking may not be able to fullfill,
  // further confiration will be made by HKIAL staffs." The user
  // can still confirm (booking submits as usual); Cancel returns
  // to the review step.
  const [showShortNoticeWarning, setShowShortNoticeWarning] = useState(false);
  // Round 6.2.140 — Individual free Lounge Deluxe / free Premiere Suite
  // upgrade opt-in (replaces mock booking/suite voucher UI). Default ON
  // when the member still has remaining credit; forced OFF + disabled when 0.
  const [useMembershipLdFree, setUseMembershipLdFree] = useState(true);
  const [useMembershipPsFree, setUseMembershipPsFree] = useState(true);
  const [stepLoading, setStepLoading] = useState(false);

  // ── Derived member flags (computed before any state that references them) ──
  // Accept both API (`TravelAgency`) and UI (`Travel Agency`) forms so Group
  // Admin book-on-behalf never falls through to Credit Card / Upfront when
  // memberData still has the raw account type string.
  const normalizedMemberType = String(memberData.memberType ?? '')
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, '');
  const isTravelAgency = normalizedMemberType === 'travelagency';
  // Spec §9 — real agency billing reference from /auth/member/me.
  // Figma Make standalone preview falls back to TA_AGENCY_CODE only when
  // the container has not supplied agencyCode.
  const agencyBillingCode =
    (typeof memberData.agencyCode === 'string' && memberData.agencyCode.trim() !== ''
      ? memberData.agencyCode.trim()
      : '') || (isTravelAgency ? TA_AGENCY_CODE : '');

  function formatFreeCreditRemaining(value: number | null | undefined): string {
    if (value === null || value === undefined) return m('Not available');
    if (value === -1) return m('Unlimited');
    if (value <= 0) return m('0 remaining');
    return `${value.toLocaleString()} ${m('remaining')}`;
  }

  function hasFreeCreditAvailable(value: number | null | undefined): boolean {
    if (value === null || value === undefined) return false;
    return value === -1 || value > 0;
  }

  const membershipExpiryOk = (() => {
    const exp = memberData.membershipExpiryDate;
    if (!exp) return false;
    const d = new Date(`${exp}T00:00:00`);
    if (Number.isNaN(d.getTime())) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return d.getTime() >= today.getTime();
  })();

  const isEligibleIndividualMembership =
    (memberData.memberType === 'Individual' || memberData.memberType === 'individual')
    && Boolean(memberData.membershipType)
    && membershipExpiryOk;

  const freeLdRemaining = memberData.freeLoungeDeluxeEntriesRemaining;
  const freePsRemaining = memberData.freePremiereSuiteUpgradesRemaining;
  const bookingIncludesPremiereSuite =
    form.premiereSuites > 0
    || (form.premiereVipPassengers ?? 0) > 0
    || (form.premiereNonFlyingGuests ?? 0) > 0;
  const canUseFreeLd = isEligibleIndividualMembership && hasFreeCreditAvailable(freeLdRemaining);
  // Free Premiere Suite upgrade is dual-quota: needs PS on the booking,
  // free PS voucher, LD remaining, and the LD credit checkbox on.
  // Cannot use free PS credit alone.
  const canUseFreePs =
    isEligibleIndividualMembership
    && bookingIncludesPremiereSuite
    && hasFreeCreditAvailable(freePsRemaining)
    && hasFreeCreditAvailable(freeLdRemaining)
    && useMembershipLdFree;

  // Keep toggles honest when quotas are exhausted (Sky Q5: disable when remaining = 0).
  useEffect(() => {
    if (!canUseFreeLd && useMembershipLdFree) {
      setUseMembershipLdFree(false);
    }
    if (!canUseFreePs && useMembershipPsFree) {
      setUseMembershipPsFree(false);
    }
  }, [canUseFreeLd, canUseFreePs, useMembershipLdFree, useMembershipPsFree]);

  function advanceStep(nextStep: number) {
    setStepLoading(true);
    setTimeout(() => {
      setCurrentStep(nextStep);
      setStepLoading(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 900);
  }

  // ── Addon unit rates (R6.2.100d — TA discount removed) ────────────────────
  // R6.2.100b (2026-07-02) — wrapper-supplied product-aware
  // per-hour base rate for the Lounge Extension chip +
  // per-line rows. When the wrapper passes a defined value
  // (PS → 3000, LD → 1000, mixed = sum of both, null = 0),
  // the chip + rows show the correct per-hour rate for the
  // current product context. When undefined (figma-ui
  // standalone preview with the in-file MOCK_* path), fall
  // back to the legacy `500` constant + empty breakdown so
  // the standalone preview remains visually consistent with
  // the legacy figma Make export. Per INV-X1, the wrapper
  // owns the product-aware knowledge; figma-ui stays
  // presentational.
  // R6.2.100c (2026-07-02, same day) — added the
  // `loungeExtensionBreakdown` array so the chip can show
  // "HK$4,000 per hour · HK$3,000 PS + HK$1,000 LD" for mixed
  // instead of the misleading $0. The chip renders the
  // breakdown when it has >1 item (mixed); single-product +
  // null render only the total (the breakdown is redundant
  // for those).
  // R6.2.100d (2026-07-02, same day, Sky) — TA discount
  // removed. `loungeRate` collapses to `loungeExtensionBaseRate`
  // (uniform rate, no TA branch). `loungeRateBreakdown`
  // collapses to `loungeExtensionBreakdown`. `limoRate` and
  // `wheelchairRate` lose their TA ternaries. Call sites that
  // reference these aliases are unchanged.
  const loungeExtensionBaseRate = loungeExtensionPerHourDisplay?.total ?? 500;
  const loungeExtensionBreakdown = loungeExtensionPerHourDisplay?.breakdown ?? [];
  const loungeRateBreakdownText = loungeExtensionBreakdown
    .map((b) => 'HK$' + b.amount.toLocaleString() + ' ' + b.label)
    .join(' + ');
  const loungeRate = loungeExtensionBaseRate;
  // 2026-06-26 (round 6.2.74, Sky): limo base rate HK$1,500
  // matches the backend `prices.add_on_limousine` and the
  // `bookable_items.Limousine Transfer` price.
  const limoRate = 1500;
  // Wheelchair Assistance is a complimentary service (bookable_items.price = 0).
  const wheelchairRate = 0;
  const bookingGuestNames = collectBookingGuestNames(vipData, nonFlyingGuestData);

  // ── Step 2 state ──────────────────────────────────────────────────────────
  const [step2Form, setStep2Form] = useState({
    loungeExtension: 0,
    limousineService: 0,
    destinationAddresses: [] as string[],
    limousineStops: [] as string[],
    limousinePickupTime: '',
    wheelchairService: 0,
    wheelchairPassengerNames: [] as string[],
    securityService: false,
    luggageCount: 0,
    privateTransport: 0,
    vehicles: [] as Array<{ driverName: string; driverContact: string; carPlateNo: string }>,
    promotionCode: '',
    // Book-for-member: contact = end customer; account (payer) stays the agency.
    // Without prefill, contact defaults to the logged-in member (agency self-book).
    contactName: prefillMember
      ? `${prefillMember.title} ${prefillMember.firstName} ${prefillMember.lastName}`.trim()
      : (memberData.name || ''),
    contactEmail: (prefillMember?.email && prefillMember.email.trim())
      || memberData.email
      || '',
    // 2026-06-24 (Sky) — split the contact number into a region
    // code combobox + a digits/dash number input. `contactNo` is
    // kept as a derived wire-shape field maintained in sync via
    // `setContactFields` below; the api.ts createBooking reads
    // `data.services?.contactNo` (api.ts:961-963), so we still
    // emit the combined string on submit for back-compat.
    //
    // 2026-06-28 (round 6.2.99 — Sky, item 5): pre-fill the Contact
    // Person phone from the account's current phone (via
    // MemberContext.buildMemberData → memberData.contactNumber).
    // Splits the stored phone ("+852 9876-5432") into the
    // region-code combobox + digits/dash number input via
    // splitContactPhone; derive the wire-shape contactNo via
    // combineContactNo. When memberData.contactNumber is undefined
    // (older accounts or local previews), splitContactPhone falls
    // back to region='+852' + empty number — same as the previous
    // hardcoded default.
    //
    // Book-for-member: prefer the end-customer's phone from Group Admin.
    ...(() => {
      const phoneSource =
        (prefillMember?.phone && prefillMember.phone.trim() && prefillMember.phone !== '—')
          ? prefillMember.phone
          : memberData.contactNumber;
      const split = splitContactPhone(phoneSource);
      return {
        regionCode: split.regionCode,
        contactNumber: split.contactNumber,
        contactNo: combineContactNo(split.regionCode, split.contactNumber),
      };
    })(),
    bookingMemo: '',
    // Travel Agency billing fields (auto-populated for TA, editable for others)
    paymentMethod: (() => {
      const t = String(memberData.memberType ?? '')
        .trim()
        .toLowerCase()
        .replace(/[\s_-]+/g, '');
      return t === 'travelagency' ? 'on-credit' : 'credit-card';
    })(),
    billingReference: (() => {
      const t = String(memberData.memberType ?? '')
        .trim()
        .toLowerCase()
        .replace(/[\s_-]+/g, '');
      if (t !== 'travelagency') return '';
      const code =
        typeof memberData.agencyCode === 'string' ? memberData.agencyCode.trim() : '';
      // Prefer live agency_code; TA_AGENCY_CODE is figma preview fallback only.
      return code || TA_AGENCY_CODE;
    })(),
  });

  // When /auth/member/me refreshes agency_code after first paint, replace the
  // figma-preview fallback (or empty) once — do not overwrite a user edit.
  useEffect(() => {
    if (!isTravelAgency) return;
    const code =
      typeof memberData.agencyCode === 'string' ? memberData.agencyCode.trim() : '';
    if (!code) return;
    setStep2Form((prev) => {
      if (prev.billingReference === code) return prev;
      if (
        prev.billingReference !== '' &&
        prev.billingReference !== TA_AGENCY_CODE
      ) {
        return prev;
      }
      return { ...prev, billingReference: code };
    });
  }, [isTravelAgency, memberData.agencyCode]);

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
  // 2026-06-08 — Transit 2nd leg validation. For Transit bookings,
  // all 4 leg 2 fields are required AND the 6h gap rule must hold.
  // The backend's TransitLegsRule is the source of truth; this is the
  // UX gate that disables the submit button before the user can try.
  // 2026-06-08 (reactive fix) — Transit also requires leg 1 flightTime
  // (HH:MM).
  // 2026-06-23 — For Arrival and Departure bookings, ALL visible step 1
  // fields are required (date, flight number, time, origin/destination,
  // flight class). Transit keeps its existing leg 1 + leg 2 validation.
  // 2026-06-08 (round 6.2.7): leg 2 flight time is now stored as the
  // time half of the combined `leg2ArrivalDate` (date+time were split
  // visually but kept as a single `YYYY-MM-DDTHH:MM` string so the
  // wire shape, submit handler, and 6h-gap validation all keep working).
  // The legacy `leg2FlightTime` useState is no longer bound to an input;
  // we derive the time from the combined state.
  // 2026-06-28 (round 6.2.98 — Sky): the 6h gap rule was FLIPPED from
  // MIN 6h to MAX 6h. Sky's directive: "for the transit type booking,
  // the arrival time and departure time is only allow to be 6 hours
  // apart." The error message + the useEffect below + the inline
  // onChange handlers at the leg 2 date/time inputs all enforce the
  // new rule. The backend's TransitLegsRule is the source of truth
  // (see app/Rules/TransitLegsRule.php, rev. 6.2.98).
  // 2026-06-28 (round 6.2.98 — Sky) — collect ALL step 1 validation
  // failures into a `step1FlightHints: string[]` array so the user
  // can see every missing field at once instead of fixing one
  // error at a time. The previous nested ternary only showed the
  // FIRST failure ("Please select a date" → "Please enter a flight
  // number" → ...) which forced the user to submit-fix-submit-fix
  // for 5+ fields. Now the hint is a bulleted list of every failure.
  const isArrivalOrDeparture = form.flightType === 'Arrival' || form.flightType === 'Departure';
  const step1Leg1TimeValid =
    form.flightType !== 'Transit' || leg1FlightTime !== '';
  const leg2TimeFromArrival = leg2ArrivalDate?.split('T')[1]?.slice(0, 5) || '';
  const step1Leg2Valid =
    form.flightType !== 'Transit' ||
    (leg2ArrivalDate !== '' &&
      leg2FlightNo.trim() !== '' &&
      leg2TimeFromArrival !== '' &&
      leg2FlightClass !== '' &&
      leg2Destination.trim() !== '' &&
      transitGapError === null);
  const step1OriginValid =
    form.flightType !== 'Arrival' || form.origin.trim() !== '';
  const step1DestinationValid =
    form.flightType !== 'Departure' || form.destination.trim() !== '';
  const step1TimeValid =
    !isArrivalOrDeparture || leg1FlightTime !== '';
  // 2026-06-30 (round ? — Sky) — date+time must be in the future.
  // The native `<input type="date" lang={DATE_INPUT_LANG} min={today}>` (line ~5422) only
  // blocks past DATES through the picker UI; it does NOT block (a)
  // typed / pasted past dates, OR (b) past TIMES on today's date.
  // Add a combined datetime check so the hint list catches every
  // past-datetime case (leg 1 for all flight types + leg 2 for
  // Transit). Both checks return `true` when the relevant inputs are
  // empty so the existing empty-field hints stay authoritative.
  const leg1DateTimeInFuture = (() => {
    if (form.date === '' || leg1FlightTime === '') return true;
    const dt = new Date(`${form.date}T${leg1FlightTime}:00`);
    if (Number.isNaN(dt.getTime())) return true;
    return dt.getTime() > Date.now();
  })();
  const leg2DateTimeInFuture = (() => {
    if (form.flightType !== 'Transit' || !leg2ArrivalDate) return true;
    const datePart = leg2ArrivalDate.split('T')[0] || '';
    const timePart = leg2ArrivalDate.split('T')[1]?.slice(0, 5) || '';
    if (datePart === '' || timePart === '') return true;
    const dt = new Date(`${datePart}T${timePart}:00`);
    if (Number.isNaN(dt.getTime())) return true;
    return dt.getTime() > Date.now();
  })();
  const step1FlightValid =
    form.date !== '' &&
    form.flightNumber.trim() !== '' &&
    form.flightClass !== '' &&
    step1Leg1TimeValid &&
    step1Leg2Valid &&
    step1OriginValid &&
    step1DestinationValid &&
    step1TimeValid &&
    leg1DateTimeInFuture &&
    leg2DateTimeInFuture;
  // 2026-06-28 (round 6.2.98): collect ALL step 1 validation failures
  // so the user sees every missing field at once. Order is stable
  // (leg 2 first for Transit, then leg 1, then common fields, then
  // origin/destination/time). The empty array means "all
  // required fields are present" — caller can render the list OR a
  // success state based on `step1FlightHints.length`.
  const step1FlightHints: string[] = [];
  if (form.flightType === 'Transit') {
    if (leg1FlightTime === '') {
      step1FlightHints.push(m('Please enter the leg 1 arrival time (HH:MM)'));
    }
    if (leg2ArrivalDate === '') {
      step1FlightHints.push(m('Please enter the 2nd leg arrival date and time'));
    }
    if (leg2FlightNo.trim() === '') {
      step1FlightHints.push(m('Please enter the 2nd leg flight number'));
    }
    if (leg2TimeFromArrival === '') {
      step1FlightHints.push(m('Please enter the 2nd leg flight time'));
    }
    if (leg2FlightClass === '') {
      step1FlightHints.push(m('Please select the 2nd leg flight class'));
    }
    if (leg2Destination.trim() === '') {
      step1FlightHints.push(m('Please enter the 2nd leg destination'));
    }
    if (transitGapError !== null) {
      step1FlightHints.push(transitGapError);
    }
  }
  if (form.date === '') {
    step1FlightHints.push(
      form.flightType === 'Departure'
        ? m('Please select a departure date to proceed')
        : m('Please select an arrival date to proceed'),
    );
  }
  if (form.flightNumber.trim() === '') {
    step1FlightHints.push(m('Please enter a flight number to proceed'));
  }
  if (!step1TimeValid) {
    step1FlightHints.push(
      form.flightType === 'Departure'
        ? m('Please enter the departure time')
        : m('Please enter the arrival time'),
    );
  }
  // 2026-06-30 (round ? — Sky) — surface past-datetime picks in the
  // existing bulleted hint list (see step1FlightHints comment at
  // line ~1748). Empty inputs return `true` from the checks above so
  // we don't double-up with the "please enter ..." hints.
  if (!leg1DateTimeInFuture) {
    step1FlightHints.push(
      form.flightType === 'Departure'
        ? m('Please select a future departure date and time (the selected datetime is in the past)')
        : m('Please select a future arrival date and time (the selected datetime is in the past)'),
    );
  }
  if (!leg2DateTimeInFuture) {
    step1FlightHints.push(m('Please select a future 2nd leg arrival date and time (the selected datetime is in the past)'));
  }
  if (!step1OriginValid) {
    step1FlightHints.push(m('Please enter the origin'));
  }
  if (!step1DestinationValid) {
    step1FlightHints.push(m('Please enter the destination'));
  }
  // Keep the legacy `step1FlightHintMsg` derived for any callers that
  // still read the single-string form. The new `step1FlightHints` array
  // is the source of truth for the JSX hint block (see the step-1
  // render's bullet list below).
  const step1FlightHintMsg =
    step1FlightHints.length > 0
      ? step1FlightHints[0]
      : m('Please complete all required fields to proceed');

  // ── Step 2 validation (passenger info) ───────────────────────────────────
  const allVipFilled = vipData.every(
    (v) =>
      v.vipFirstName.trim() !== ''
      && v.vipLastName.trim() !== ''
      && v.vipAgeGroup !== ''
      && isValidCountryCode(v.nationality)
  );
  const allGuestFilled = nonFlyingGuestData.every(
    (g) =>
      g.guestFirstName.trim() !== ''
      && g.guestLastName.trim() !== ''
      && g.guestAgeGroup !== ''
      && isNonFlyingChildAgeFilled(g.guestAgeGroup, g.guestAge)
      && isValidCountryCode(g.nationality)
  );
  // 2026-06-24 (Sky) — each PS / LD segment must include at least
  // one Adult (aged 12+) VIP passenger. Children / infants can't
  // book the VIP lounge unaccompanied. Skip the check on a segment
  // when its count is 0 (no segment → no rule).
  const ADULT_AGE_GROUP = 'Adults (aged 12 and above)';
  const psSegment = vipData.slice(0, form.premiereVipPassengers);
  const ldSegment = vipData.slice(
    form.premiereVipPassengers,
    form.premiereVipPassengers + form.vipPassengers,
  );
  const psHasAdult = psSegment.some((v) => v.vipAgeGroup === ADULT_AGE_GROUP);
  const ldHasAdult = ldSegment.some((v) => v.vipAgeGroup === ADULT_AGE_GROUP);
  const adultPerPsOk = form.premiereVipPassengers === 0 || psHasAdult;
  const adultPerLdOk = form.vipPassengers === 0 || ldHasAdult;
  const adultPerSegmentOk = adultPerPsOk && adultPerLdOk;
  // 2026-06-27 (round 6.2.96 — Sky): each Premiere Suite must
  // have at least 1 VIP Passenger. The 1:1 floor prevents the
  // booking from being created with e.g. 2 PS + 1 PS VIP
  // (which the backend would reject / mis-price). Mirrors the
  // existing `psHasAdult` adult-per-segment rule, but enforces
  // a count floor rather than an age-group floor. Skipped when
  // no suites are selected (no segment → no rule).
  const premiereVipFloorOk = form.premiereSuites === 0 || form.premiereVipPassengers >= form.premiereSuites;
  // 2026-06-28 (round 6.2.98 — Sky) — collect ALL step-1 (guest)
  // validation failures into `step1Hints: string[]` so the user can
  // see every missing field at once. The previous nested ternary
  // only showed the FIRST failure ("Please add at least 1 guest"
  // → "Please complete all required fields for each VIP
  // Passenger" → ...) which forced the user to submit-fix-submit-fix
  // for 5+ fields. Now the hint is a bulleted list of every
  // failure. Mirrors the change to `step1FlightHints` above.
  const step1Valid =
    totalGuests > 0
    && allVipFilled
    && allGuestFilled
    && adultPerSegmentOk
    && premiereVipFloorOk;

  const step1Hints: string[] = [];
  if (totalGuests === 0) {
    step1Hints.push('Please add at least 1 guest (VIP Passenger or Non-Flying Guest) to proceed');
  }
  if (!allVipFilled) {
    step1Hints.push('Please complete all required fields for each VIP Passenger (First Name, Last Name, Age Group, Nationality)');
  }
  if (!adultPerPsOk) {
    step1Hints.push('Each Premiere Suite must have at least one Adult (aged 12+) VIP Passenger');
  }
  if (!adultPerLdOk) {
    step1Hints.push('Each Lounge Deluxe booking must have at least one Adult (aged 12+) VIP Passenger');
  }
  if (!premiereVipFloorOk) {
    step1Hints.push('Each Premiere Suite requires at least 1 VIP Passenger');
  }
  if (!allGuestFilled) {
    step1Hints.push(
      'Please complete all required fields for each Non-Flying Guest (First Name, Last Name, Age Group, Nationality, and Age for children aged 2–11)',
    );
  }
  // Legacy single-string for any caller still reading the old field.
  // The JSX hint block (line ~6149) now renders the bulleted list.
  const step1HintMsg =
    step1Hints.length > 0
      ? step1Hints[0]
      : 'Please complete all required fields for each VIP Passenger (First Name, Last Name, Age Group, Nationality)';

  // Sync VIP passenger array length with totalVip
  //
  // 2026-06-27 (round 6.2.79 — customer bug fix). Previously this
  // effect ALSO opened the delete-VIP dialog when the new total
  // would drop below the number of filled entries. That had two
  // problems:
  //   - The form count was already decremented by `updateCount`
  //     before this effect ran, so clicking Cancel in the dialog
  //     left the qty at the lower value.
  //   - It used the (pre-decrement) `totalVip` to decide the
  //     dialog's "from N to M" message, but the dialog's candidate
  //     list was drawn from the full `vipData`, so it always
  //     included the opposite segment (PS+LD bleed).
  //
  // The dialog is now opened from `updateCount` itself via the
  // pure helpers in `utils/passengerCountReducer.ts`, with the
  // form change deferred until the user picks Remove (or
  // abandons via Cancel). This effect keeps `vipData.length`
  // in sync with `totalVip`:
  //   - When the count grows, INSERT empty entries at the
  //     segment boundary (PS grows → splice at the OLD PS/LD
  //     boundary; LD grows → push at end). This keeps the
  //     invariant `vipData[0..premiereVipPassengers)` is PS and
  //     `vipData[premiereVipPassengers..totalVip)` is LD.
  //   - When the count shrinks, slice trailing empty entries
  //     (the `handleDeleteVip` path already removed the matching
  //     entry before the form count went down, so the array is
  //     already in sync — this is just a defensive belt-and-braces
  //     guard against external state resets / Quick Fill / etc.).
  //
  // 2026-06-28 (round 6.2.99 — Sky): the pre-6.2.99 effect
  // ALWAYS appended the new empty entries to the END of
  // `vipData`. That was wrong when only the PS segment grew
  // AND there were existing LD VIPs: the new empty entry
  // landed at index `totalVip - 1` (the LD tail), pushing the
  // first LD VIP up by 1 into the PS slot. The render uses
  // `index < premiereVipPassengers` to badge the box as
  // "Premiere Suite - VIP Passenger", so the LAST PS box would
  // display the FIRST LD VIP's filled data — symptom reported
  // by Sky: "the last ps vip info will wrongly use the first ld
  // vip info, while it should insert a blank ps vip info at
  // the last of the ps vip info instead". The fix: track the
  // previous per-segment counts in a ref, and when the PS
  // segment grows, SPLICE the new empty entries at the OLD
  // PS/LD boundary (`prevSegCountsRef.current.ps`) so existing
  // LD entries get pushed back by `psDelta` slots. The LD
  // append path is unchanged (LD segments are always at the
  // tail).
  const prevSegCountsRef = useRef<{ ps: number; ld: number }>({ ps: 0, ld: 0 });
  useEffect(() => {
    const cur = vipData.length;
    const psNow = form.premiereVipPassengers;
    const ldNow = form.vipPassengers;
    const psPrev = prevSegCountsRef.current.ps;
    const ldPrev = prevSegCountsRef.current.ld;

    if (totalVip > cur) {
      const extra = Array.from({ length: totalVip - cur }, () => ({ vipTitle: 'Mr', vipFirstName: '', vipLastName: '', vipTravelDocNo: '', vipMembershipNo: '', vipAgeGroup: '', vipBirthday: '', foodAllergies: '', nationality: '' }));
      const psDelta = psNow - psPrev;
      const ldDelta = ldNow - ldPrev;
      setVipData((prev) => {
        const next = [...prev];
        // PS grew → insert blanks at the OLD PS/LD boundary.
        // The splice pushes existing LD entries back by
        // `psDelta` slots, preserving segment alignment.
        if (psDelta > 0) {
          next.splice(psPrev, 0, ...extra.slice(0, psDelta));
        }
        // LD grew → append blanks at the tail. LD is always
        // the trailing segment in `vipData`.
        if (ldDelta > 0) {
          next.push(...extra.slice(psDelta));
        }
        return next;
      });
    }
    // Defensive: if totalVip dropped below cur for any reason
    // (e.g. external state change, Quick Fill reset) and no
    // dialog is open, slice trailing empty entries so the array
    // length matches the form. We only slice when the trailing
    // slots are empty — filled entries are preserved (the
    // `updateCount` path handles the dialog case before we get
    // here).
    else if (totalVip < cur && !pendingVipDeletion) {
      const trailingFilled = vipData
        .slice(totalVip)
        .some(
          (v) =>
            v.vipFirstName || v.vipLastName || v.vipTravelDocNo || v.vipMembershipNo,
        );
      if (!trailingFilled) {
        setVipData((prev) => prev.slice(0, totalVip));
      }
    }

    // Sync the ref AFTER processing so the next run computes
    // deltas against the form state this run observed.
    prevSegCountsRef.current = { ps: psNow, ld: ldNow };
  }, [totalVip, form.premiereVipPassengers, form.vipPassengers, pendingVipDeletion]);

  // Validate promotion code
  //
  // 2026-06-30 (Pilot 2 Bug 4 follow-up) — defer to the
  // Container-supplied callback (the backend's
  // /api/promo-codes/validate). Pre-fix this useEffect checked
  // the in-file VALID_PROMO_CODES / USED_PROMO_CODES arrays
  // ONLY, so any backend-stored code (e.g. batch-created
  // UP1782649293237-B79YNZ) was reported 'invalid' regardless
  // of its real status. The local arrays are kept as a
  // figma-ui standalone-preview fallback (INV-X1) — they no
  // longer gate the production path.
  //
  // Mapping rules:
  //   - empty code                 → status null
  //   - USED_PROMO_CODES.includes  → 'used'  (legacy figma preview)
  //   - VALID_PROMO_CODES.includes → 'valid' (legacy figma preview)
  //   - callback present           → status = callback result
  //   - callback absent (figma-ui) → 'invalid' (no preview data)
  //
  // Cancellation: the previous in-flight validation is cancelled
  // on every code change so the last-call-wins guarantee holds.
  const onValidatePromoCodeRef = useRef(onValidatePromoCode);
  useEffect(() => {
    onValidatePromoCodeRef.current = onValidatePromoCode;
  }, [onValidatePromoCode]);
  const promoAbortRef = useRef<{ cancelled: boolean } | null>(null);
  useEffect(() => {
    const code = step2Form.promotionCode.trim();
    if (!code) {
      setPromoCodeStatus(null);
      setPromoCodeMessage(null);
      return;
    }
    
    // Legacy figma-ui preview fallback. The 4 hardcoded codes
    // are the only ones Randy's figma Make copy knows about;
    // they're consulted FIRST so MOCK-mode previews keep
    // working. Production always takes the backend path.
    if (USED_PROMO_CODES.includes(code)) {
      setPromoCodeStatus('used');
      setPromoCodeMessage(null);
      return;
    }
    if (VALID_PROMO_CODES.includes(code)) {
      setPromoCodeStatus('valid');
      setPromoCodeMessage(null);
      return;
    }

    const validate = onValidatePromoCodeRef.current;
    if (!validate) return; // figma-ui preview without callback — fall through to 'invalid' below

    // amount is the live price-preview total so the backend's
    // min_purchase check is wired through. Falls back to 0
    // when the user hasn't picked enough fields yet (pre-6.2.28
    // Option B); the backend treats amount=0 as a no-op for
    // the discount math and only flags existence + status.
    const amount = typeof pricePreview?.total === 'number' ? pricePreview.total : 0;
    if (promoAbortRef.current) promoAbortRef.current.cancelled = true;
    const handle = { cancelled: false };
    promoAbortRef.current = handle;
    validate(code, amount)
      .then((result) => {
        if (handle.cancelled) return;
        setPromoCodeStatus(result.status);
        setPromoCodeMessage(
          typeof result.message === 'string' && result.message.trim() !== ''
            ? result.message
            : null,
        );
      })
      .catch(() => {
        if (handle.cancelled) return;
      setPromoCodeStatus('invalid');
        setPromoCodeMessage(null);
      });
    return () => {
      handle.cancelled = true;
    };
    // Re-validate when LD count changes so a Free bookings code is
    // rejected after the user switches to PS-only (and vice versa).
  }, [step2Form.promotionCode, pricePreview?.total, form.vipPassengers]);

  // 2026-06-11 (round 6.2.36 — Sky ask: "ensure the 2nd leg time is at
  // least 6 hours apart from the 1st leg arrival"): recompute the
  // transit gap error whenever ANY of the 4 leg-1/leg-2 inputs change.
  // The pre-6.2.36 inline checks at leg 2's onChange handlers only
  // recompute the gap when leg 2 changes — if the user picks
  //   leg 1 = 2026-06-15 10:00, leg 2 = 2026-06-15 18:00 (gap 8h, OK)
  //   ...then changes leg 1 to 2026-06-15 14:00 (gap drops to 4h)
  // the inline checks DO NOT re-run, so `transitGapError` stays null
  // and the submit button stays enabled. The 4h violation slips
  // through the client-side gate. This useEffect closes the gap by
  // watching all 4 inputs.
  //
  // Also fixes doc note 3 from
  // `frontend_react/frontend/2026-06-08-customer-newbooking-3-bugs.md`:
  // the inline check used `new Date(form.date)` (parses as 00:00 UTC),
  // ignoring `leg1FlightTime`. This useEffect combines
  // `form.date + 'T' + leg1FlightTime + ':00'` for the leg 1 datetime.
  // The backend's `TransitLegsRule` uses full arrivalDate strings, so
  // any UTC-midnight edge case that the inline check missed will now
  // be caught here too.
  //
  // The inline `setTransitGapError` calls at the leg 2 onChange
  // handlers (the leg 2 date + time inputs below) are KEPT as a
  // fast-path for immediate UX feedback (synchronous setState before
  // the next render). This useEffect is the safety net that
  // re-asserts the correct value on the next render — both paths
  // converge to the same value.
  //
  // 2026-06-28 (round 6.2.98 — Sky): rule flipped from MIN 6h to MAX
  // 6h. Error fires when gap > 6h. Mirrors the backend's
  // TransitLegsRule (rev. 6.2.98).
  useEffect(() => {
    if (form.flightType !== 'Transit') {
      setTransitGapError(null);
      return;
    }
    // No leg 1 or leg 2 datetime yet → no error (the user is still
    // filling in the form; the inline required-field gate in
    // step1FlightValid handles the "all required fields" case).
    if (!form.date || !leg1FlightTime || !leg2ArrivalDate) {
      setTransitGapError(null);
      return;
    }
    // Combine leg 1 date + time into a full datetime. form.date is
    // 'YYYY-MM-DD', leg1FlightTime is 'HH:MM' (or 'HH:MM:SS'); build
    // 'YYYY-MM-DDTHH:MM:00' for the Date ctor.
    const leg1Iso = `${form.date}T${leg1FlightTime}:00`;
    const l0 = new Date(leg1Iso);
    const l1 = new Date(leg2ArrivalDate); // already datetime-local format
    if (isNaN(l0.getTime()) || isNaN(l1.getTime())) {
      setTransitGapError(null);
      return;
    }
    const diffMs = l1.getTime() - l0.getTime();
    const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
    if (diffMs > SIX_HOURS_MS) {
      const hours = Math.floor(diffMs / 3600000);
      const mins = Math.floor((diffMs % 3600000) / 60000);
      setTransitGapError(
        m('Transit gap must be at most 6 hours (got {hours}h {mins}m). Please pick an earlier outbound leg.')
          .replace('{hours}', String(hours))
          .replace('{mins}', String(mins)),
      );
    } else {
      setTransitGapError(null);
    }
  }, [form.flightType, form.date, leg1FlightTime, leg2ArrivalDate]);

  // 2026-06-17 (round 6.2.28 follow-up) — Push live form state up to
  // the Container so it can drive `usePricePreview` (the
  // `/api/member/bookings/price-preview` POST). The Container mirrors
  // these values via `handleFormChange` and forwards the
  // `pricePreview` prop back, which BookingSummaryCard then renders.
  //
  // Ref-wrapped so the parent can re-render the callback identity
  // (e.g. Container's `useCallback` deps change) without re-running
  // this effect. The effect itself only depends on the form state.
  const onFormChangeRef = useRef(onFormChange);
  useEffect(() => {
    onFormChangeRef.current = onFormChange;
  }, [onFormChange]);
  useEffect(() => {
    onFormChangeRef.current?.({
      form: form as unknown as Record<string, unknown>,
      step2Form: step2Form as unknown as Record<string, unknown>,
      vipData: vipData as unknown as Array<Record<string, unknown>>,
      nonFlyingGuestData: nonFlyingGuestData as unknown as Array<Record<string, unknown>>,
      useMembershipLdFree,
      useMembershipPsFree,
    });
  }, [form, step2Form, vipData, nonFlyingGuestData, useMembershipLdFree, useMembershipPsFree]);

  // Sync non-flying guest array length with totalNonFlying
  //
  // 2026-06-27 (round 6.2.79 — customer bug fix). Mirror of the
  // VIP useEffect above. The dialog-opening branch was removed
  // because `updateCount` now defers the form decrement and
  // opens the dialog via the pure helpers in
  // utils/passengerCountReducer.ts (which know which segment
  // was decremented). This effect keeps the array length in
  // sync with the form count.
  //
  // 2026-06-28 (round 6.2.101 — Sky): NFG mirror of the VIP
  // segment-boundary fix. The pre-6.2.101 effect appended the
  // new empty entries to the END of `nonFlyingGuestData`, which
  // was wrong when only the PS-NFG segment grew AND there were
  // existing LD NFGs: the new empty entry landed at the LD tail
  // and the first LD NFG got pushed into the PS slot. The render
  // binds by array index (and badged by `index <
  // premiereNonFlyingGuests`), so the LAST PS NFG box would
  // display the FIRST LD NFG's filled data. Fix mirrors the VIP
  // effect: track the previous per-segment counts in a ref,
  // SPLICE the new empty entries at the OLD PS/LD boundary when
  // PS grew (LD append path unchanged).
  const totalNonFlying = form.premiereNonFlyingGuests + form.nonFlyingGuests;
  const prevSegNfgCountsRef = useRef<{ ps: number; ld: number }>({ ps: 0, ld: 0 });
  useEffect(() => {
    const cur = nonFlyingGuestData.length;
    const psNow = form.premiereNonFlyingGuests;
    const ldNow = form.nonFlyingGuests;
    const psPrev = prevSegNfgCountsRef.current.ps;
    const ldPrev = prevSegNfgCountsRef.current.ld;

    if (totalNonFlying > cur) {
      const extra = Array.from({ length: totalNonFlying - cur }, () => ({
        guestTitle: 'Mr',
        guestFirstName: '',
        guestLastName: '',
        guestAgeGroup: '',
        guestAge: '',
        foodAllergies: '',
        nationality: '',
      }));
      const psDelta = psNow - psPrev;
      const ldDelta = ldNow - ldPrev;
      setNonFlyingGuestData((prev) => {
        const next = [...prev];
        // PS NFG grew → insert blanks at the OLD PS/LD boundary.
        // The splice pushes existing LD NFGs back by `psDelta`
        // slots, preserving segment alignment.
        if (psDelta > 0) {
          next.splice(psPrev, 0, ...extra.slice(0, psDelta));
        }
        // LD NFG grew → append blanks at the tail.
        if (ldDelta > 0) {
          next.push(...extra.slice(psDelta));
        }
        return next;
      });
    } else if (totalNonFlying < cur && !pendingGuestDeletion) {
      // Defensive slice when trailing entries are empty.
      const trailingFilled = nonFlyingGuestData
        .slice(totalNonFlying)
        .some((g) => g.guestFirstName || g.guestLastName);
      if (!trailingFilled) {
        setNonFlyingGuestData((prev) => prev.slice(0, totalNonFlying));
      }
    }

    // Sync the ref AFTER processing so the next run computes
    // deltas against the form state this run observed.
    prevSegNfgCountsRef.current = { ps: psNow, ld: ldNow };
  }, [totalNonFlying, form.premiereNonFlyingGuests, form.nonFlyingGuests, pendingGuestDeletion]);

  // ── Step 1 Handlers ───────────────────────────────────────────────────────
  const handleFlightNumber = (v: string) => {
    const upper = v.toUpperCase();
    const fd = flightDatabase[upper] ?? null;
    setFlightDetails(fd);
    setForm((p) => ({ ...p, flightNumber: upper, origin: fd?.origin ?? p.origin }));
  };

  // 2026-08-18 (round — Cirium Sky API migration, Task 11). Step 1
  // Lookup button handler. Mirrors the admin figma-ui's
  // `onFlightLookup` shape (line 2701-2742 of admin
  // CreateBooking.tsx) but with member-side wiring:
  //   - Auth: `flightsApi.lookupFlight` uses `auth.api` Bearer
  //     (read fresh from localStorage on every call → INV-X4).
  //   - Envelope: `request()` returns `{ data: laravelEnvelope, success }`
  //     → resource is unwrapped at `response.data.data` (INV-X5).
  //   - Transit: the backend returns `cirium_transit_unsupported` (400)
  //     and the form's Step 1 toggle currently only renders
  //     Arrival/Departure, so the guard is defensive (matches the
  //     brief's contract for parity with the admin surface).
  //   - Error toast: `error_code` + `message` are surfaced via the
  //     structured error fields the `request()` helper exposes on
  //     the thrown Error instance.
  //   - Success: populates `leg1FlightTime` (HH:MM), `form.origin`,
  //     `form.destination`, and the `flightDetails` summary so the
  //     "Flight Information Found" card lights up.
  const handleFlightLookup = async () => {
    const flightNo = form.flightNumber.trim();
    if (!flightNo || !form.date) return;
    if (form.flightType === 'Transit') {
      toast.error(m('Transit lookup is not supported in v1 — enter leg 1 and leg 2 manually.'));
      return;
    }
    setFlightLookupLoading(true);
    try {
      const res = await flightsApi.lookupFlight({
        flight_no: flightNo,
        date: form.date,
        flight_type: form.flightType as 'Arrival' | 'Departure' | 'Transit',
      });
      const data = res.data;
      if (!data) {
        toast.error(m('Flight lookup returned no data.'));
        return;
      }
      if (data.flight_no) {
        setForm((p) => ({ ...p, flightNumber: data.flight_no.toUpperCase() }));
      }
      if (data.flight_time) {
        // Backend returns HH:MM (or HH:MM:SS) — Time5MinSelect expects
        // HH:MM. Slice defensively so a 3-segment value still works.
        const hhmm = data.flight_time.length >= 5
          ? data.flight_time.slice(0, 5)
          : data.flight_time;
        setLeg1FlightTime(hhmm);
      }
      if (data.origin) {
        setForm((p) => ({ ...p, origin: data.origin }));
      }
      if (data.destination) {
        setForm((p) => ({ ...p, destination: data.destination }));
      }
      setFlightDetails({
        origin: data.origin ?? '',
        destination: data.destination ?? '',
        arrivalTime: data.flight_time ?? '',
      });
      const cachedSuffix = data.cached ? ' (cached)' : '';
      toast.success(m('Flight details loaded') + cachedSuffix);
    } catch (err) {
      const e = err as { error_code?: string; message?: string };
      const code = e?.error_code ? `${e.error_code}: ` : '';
      toast.error(m(code + (e?.message ?? 'Flight lookup failed.')));
    } finally {
      setFlightLookupLoading(false);
    }
  };

  const updateCount = (
    field: 'premiereSuites' | 'premiereVipPassengers' | 'premiereNonFlyingGuests' | 'vipPassengers' | 'nonFlyingGuests',
    delta: number
  ) => {
    // 2026-06-27 (round 6.2.79 — customer bug fix). Pre-fix, this
    // function committed the form change BEFORE asking the user
    // which filled entry to drop. That left Cancel in the dialog
    // a lie (the qty was already deducted) and let the dialog list
    // entries from the OPPOSITE segment (PS VIP decrement showed
    // LD VIPs as removal candidates). The fix: when decrementing a
    // per-kind VIP/NFG field and the new count would drop below
    // the number of filled entries in that segment, defer the
    // form change and open the dialog with a segment-aware
    // payload. The dialog's Cancel button is now a true no-op
    // (form was never touched); the dialog's Remove button
    // commits the form change + array removal atomically. See
    // utils/passengerCountReducer.ts for the pure decision logic.
    if (delta < 0) {
      if (field === 'premiereVipPassengers' || field === 'vipPassengers') {
        const pending = decideVipDecrement({
          field,
          premiereVipPassengers: form.premiereVipPassengers,
          vipPassengers: form.vipPassengers,
          vipData,
        });
        if (pending) {
          setPendingVipDeletion(pending);
          return;
        }
      } else if (
        field === 'premiereNonFlyingGuests' ||
        field === 'nonFlyingGuests'
      ) {
        const pending = decideGuestDecrement({
          field,
          premiereNonFlyingGuests: form.premiereNonFlyingGuests,
          nonFlyingGuests: form.nonFlyingGuests,
          nonFlyingGuestData,
        });
        if (pending) {
          setPendingGuestDeletion(pending);
          return;
        }
      }
    }
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

      // 2026-06-27 (round 6.2.96 — Sky): each Premiere Suite
      // requires at least 1 VIP Passenger. Floor the PS VIP
      // decrement at `premiereSuites` so the form never lands in
      // the "PS=2, PS VIP=1" invalid state. The user must
      // remove suites (or remove VIPs via the dialog) before
      // they can drop VIPs below the suite count.
      if (field === 'premiereVipPassengers') {
        newValue = Math.max(newValue, p.premiereSuites);
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
        // Note: the 1-VIP-per-suite floor (round 6.2.96) is NOT
        // auto-bumped here. The user must click PS-VIP increment
        // explicitly to add a VIP when they add a suite. The
        // helper text under the stepper surfaces the rule
        // ("Minimum 1 VIP per suite"), and `step1Valid` blocks
        // advancing to step 3 / submit when the floor is
        // violated. Auto-bumping the VIP count on suite
        // increment was considered but rejected because it
        // hides the user's action (they click suite+1 and VIPs
        // go up too — confusing), and breaks the existing
        // VIP-decrement dialog tests that assume the suite and
        // VIP steppers are independent.
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
      const row = { ...next[idx], [field]: value };
      if (field === 'guestAgeGroup' && value !== NFG_CHILDREN_AGE_GROUP) {
        row.guestAge = '';
      }
      next[idx] = row;
      return next;
    });
  };

  const handleDeleteVip = (displayIndex: number) => {
    // 2026-06-27 (round 6.2.79 — customer bug fix). The pre-fix
    // handler took the raw index in `vipData` and only removed
    // from the array — it did NOT update the form count. Result:
    // after a Remove click, `form.premiereVipPassengers` /
    // `form.vipPassengers` stayed at the pre-decrement value
    // (already-committed by `updateCount`) and the form's VIP
    // info-box count desynced from the rendered array length.
    // The fix: the dialog's `displayIndex` is offset by the
    // segment's start position (PS = 0, LD = premiereVipPassengers),
    // and after removing the array entry we apply the segment
    // decrement to the form via `applyVipRemovalToForm` (which
    // also preserves the existing PS-VIP=0 → PS-NFG=0 rule).
    if (!pendingVipDeletion) return;
    const absoluteIndex = resolveVipAbsoluteIndex(
      pendingVipDeletion.segment,
      displayIndex,
      form.premiereVipPassengers,
    );
    setVipData((prev) => prev.filter((_, i) => i !== absoluteIndex));
    setForm((p) => applyVipRemovalToForm(p, pendingVipDeletion.segment));
    setPendingVipDeletion(null);
  };

  const handleDeleteGuest = (displayIndex: number) => {
    // 2026-06-27 (round 6.2.79 — customer bug fix). Mirror of
    // `handleDeleteVip` for the NFG dialog. The dialog's list is
    // scoped to the affected segment, so the display index needs
    // the LD offset when the user is removing an LD NFG.
    if (!pendingGuestDeletion) return;
    const absoluteIndex = resolveGuestAbsoluteIndex(
      pendingGuestDeletion.segment,
      displayIndex,
      form.premiereNonFlyingGuests,
    );
    setNonFlyingGuestData((prev) =>
      prev.filter((_, i) => i !== absoluteIndex),
    );
    setForm((p) => applyGuestRemovalToForm(p, pendingGuestDeletion.segment));
    setPendingGuestDeletion(null);
  };

  // 2026-06-27 (round 6.2.79 — customer bug fix). Cancel in the
  // dialog is now a TRUE no-op: because `updateCount` defers the
  // form decrement until the user picks Remove (or abandons via
  // Cancel), there is nothing to revert here. Pre-fix, this
  // handler only dismissed the dialog while the (already
  // committed) lower form count stayed — that was the
  // "click cancel butoon, the qty is still dedeucted" bug.
  const handleCancelDelete = () => {
    setPendingVipDeletion(null);
    setPendingGuestDeletion(null);
  };


  // 2026-06-16 (round ?): "Use History as New Booking" — load the
  // step 2 data (PS / LD / VIP / NFG / customer info) from the
  // selected past booking. Per Sky: "we just need to fill step 2
  // data only" — do NOT touch the user's step 1 entries (flight
  // number / type / class / company / destination). The user has
  // already filled step 1 before opening this dialog (in step 2),
  // and we shouldn't blow it away.
  //
  // What this handler does:
  //   ✓ Updates form's PS / LD / VIP / NFG counts from the past
  //     booking (premiereSuites, premiereVipPassengers,
  //     premiereNonFlyingGuests, vipPassengers, nonFlyingGuests)
  //   ✓ Replaces vipData with cloned passengers (padded to match
  //     the new VIP count), including travel doc / membership /
  //     age / birthday / allergies / nationality
  //   ✓ Replaces nonFlyingGuestData from nonFlyingGuestDetails or
  //     advanced_details (padded to the new NFG count)
  //   ✓ Loads the contact person into step2Form (name / email /
  //     phone)
  //   ✗ Does NOT touch form.date (user's step 1 date is kept)
  //   ✗ Does NOT touch form.flightNumber / flightType /
  //     flightClass (user's step 1 flight is kept)
  //   ✗ Does NOT touch form.companyCode / destination
  //   ✗ Does NOT touch flightDetails (the user's step 1 origin →
  //     destination lookup is kept)
  const handleSelectHistory = (booking: HistoryBooking) => {
    setForm((prev) => ({
      ...prev,
      // Step 2 fields — per Sky's "fill step 2 data only" spec.
      premiereSuites: booking.premiereSuites,
      premiereVipPassengers: booking.premiereVipPassengers,
      premiereNonFlyingGuests: booking.premiereNonFlyingGuests,
      vipPassengers: booking.vipPassengers,
      nonFlyingGuests: loungeDeluxeNfgCount(booking),
      // Step 1 fields are intentionally NOT overwritten — the user
      // already filled them in step 1 before opening this dialog.
    }));
    const { vipData: nextVip, nonFlyingGuestData: nextNfg } = buildHistoryGuestForms(booking);
    setVipData(nextVip);
    setNonFlyingGuestData(nextNfg);
    // 2026-06-16 (round ?) — also load the customer info (contact
    // person) into step 2's step2Form so the user doesn't have to
    // re-type the contact details when cloning a past booking.
    // Skip if the source booking has no contactPerson (defensive —
    // matches the "old booking shape mismatch" handling done in the
    // container's isValidHistoryBooking gate; this branch is just
    // belt-and-braces for the MOCK_BOOKINGS path).
    if (booking.contactPerson) {
      // 2026-06-24 — split a stored contact phone (e.g. "+852
      // 9876-5432") back into the regionCode + contactNumber pair
      // that the split input uses, so the user can see/edit either
      // side independently when cloning a past booking.
      const { regionCode, contactNumber } = splitContactPhone(booking.contactPerson.phone);
      setStep2Form((prev) => ({
        ...prev,
        contactName: booking.contactPerson.name || prev.contactName,
        contactEmail: booking.contactPerson.email || prev.contactEmail,
        regionCode,
        contactNumber,
        contactNo: combineContactNo(
          booking.contactPerson.phone ? regionCode : prev.regionCode,
          booking.contactPerson.phone ? contactNumber : prev.contactNumber,
        ),
      }));
    }
    setShowHistoryDialog(false);
  };

  // 2026-06-16 (round ?) — the dialog's data source. Container-supplied
  // real bookings take precedence; when absent (figma preview path)
  // fall back to the in-file MOCK so the figma code base stays
  // self-previewable without requiring the parent app.
  const historyBookings: HistoryBooking[] = historyBookingsProp ?? HISTORY_BOOKINGS;

  const handleOpenHistoryDialog = () => setShowHistoryDialog(true);
  const handleCloseHistoryDialog = () => setShowHistoryDialog(false);

  // ── Step 2 Handlers ───────────────────────────────────────────────────────

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
      
      if (field === 'wheelchairService') {
        // Pad empty name slots when qty grows so controlled inputs stay writable.
        const updatedNames = [...prev.wheelchairPassengerNames];
        while (updatedNames.length < newValue) updatedNames.push('');
        return {
          ...prev,
          wheelchairService: newValue,
          wheelchairPassengerNames: updatedNames.slice(0, newValue),
        };
      }

      if (field === 'privateTransport') {
        const empty = { driverName: '', driverContact: '', carPlateNo: '' };
        const updatedVehicles = newValue > prev.vehicles.length
          ? [...prev.vehicles, ...Array.from({ length: newValue - prev.vehicles.length }, () => ({ ...empty }))]
          : prev.vehicles.slice(0, newValue);
        return { ...prev, privateTransport: newValue, vehicles: updatedVehicles };
      }
      
      return {
        ...prev,
        [field]: newValue,
      };
    });
  };

  const commitWheelchairPassengerName = (index: number, nextVal: string) => {
    setStep2Form((prev) => {
      const updated = [...prev.wheelchairPassengerNames];
      while (updated.length <= index) updated.push('');
      if (updated[index] === nextVal) return prev;
      updated[index] = nextVal;
      return { ...prev, wheelchairPassengerNames: updated };
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

  // 2026-06-27 (round 6.2.97 — Sky): derive the booking start
  // time for the short-notice (<48h) gate. Logic is in
  // utils/bookingShortNotice.ts (kept as a pure helper so the
  // <48h unit tests can verify it without rendering the full
  // NewBooking component). Transit uses the OUTBOUND leg
  // (leg2ArrivalDate — when the customer actually needs to be
  // at the lounge for the next flight); non-Transit uses the
  // single flight event (leg1FlightTime + form.date).
  const isWithin48Hours = (): boolean => {
    const startIso = deriveBookingStartIso({
      flightType: form.flightType,
      date: form.date,
      leg1FlightTime,
      leg2ArrivalDate,
    });
    return isBookingStartWithin48Hours(startIso);
  };

  const handleFinalConfirm = () => {
    // 2026-06-27 (round 6.2.97 — Sky): intercept <48h bookings
    // with a warning dialog before delegating to the container's
    // `onSubmit`. The customer can still confirm (booking
    // submits as usual) or Cancel (returns to the review step).
    // If any required piece is missing (startIso is null), skip
    // the gate — the step-1 required-field gate in step1Valid
    // already blocks that case at advance-to-step-2 time.
    if (isWithin48Hours()) {
      setShowShortNoticeWarning(true);
      return;
    }
    // Delegate to container — container handles API call, navigation, and error/success state
    if (onSubmit) {
      // Include flightDetails (origin/destination) so the API service can save
      // them to the backend. The form only holds flightNumber, not the looked-up
      // airport codes from the flight database.
      // 2026-06-08 — Transit 2nd leg fields. The backend's
      // advanced_details.flight.legs[2] requires 4 fields per leg + 6h gap.
      // Leg 1 reuses form.date/form.flightNumber/form.flightClass; leg 2
      // comes from the leg2* useStates. The api.ts createBooking
      // (services/api.ts:663) reads leg2* from this object and builds
      // the legs[] array when flightType === 'Transit'.
      // 2026-06-08 (reactive fix) — also emit leg1FlightTime for the
      // leg 1 flightTime field. api.ts reads this for both legs[0].flightTime
      // (Transit) and the top-level flight_time (non-Transit). Without
      // it, Transit legs[0] is missing flightTime → 422.
      onSubmit({
        form,
        step2Form,
        vipData,
        nonFlyingGuestData,
        memberData,
        flightDetails,
        leg1FlightTime,
        leg2ArrivalDate,
        leg2FlightNo,
        // 2026-06-08 (round 6.2.7): Leg 2 Arrival Time input was merged
        // into the combined leg2ArrivalDate state (split visually into
        // date + time, but stored as a single `YYYY-MM-DDTHH:MM` string).
        // Derive the wire-shape flightTime from the time half of that
        // string. The legacy `leg2FlightTime` useState is kept as a
        // back-compat field for the submit payload signature but is
        // no longer bound to any input — it will always be ''.
        leg2FlightTime: leg2ArrivalDate?.split('T')[1]?.slice(0, 5) || '',
        leg2FlightClass,
        // 2026-06-08 (round 6.2.8): leg 2 destination (outbound
        // destination, separate from step-1 form's `form.destination`
        // which is now Departure-only). api.ts reads this and emits
        // `legs[1].destination` for future use.
        leg2Destination,
        transitGapError,
        useMembershipLdFree,
        useMembershipPsFree,
      });
    } else {
      // Fallback: generate mock booking number (Figma demo site only, no container)
      const flightPrefixMap: Record<string, string> = { Arrival: 'A', Departure: 'D', Transit: 'T' };
      const flightPrefix = flightPrefixMap[form.flightType] || 'D';
      const now = new Date();
      const year = now.getFullYear();
      const month = (now.getMonth() + 1).toString().padStart(2, '0');
      const day = now.getDate().toString().padStart(2, '0');
      const randomNum = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
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

  const dateLocale = toBcp47Locale(getAppLocale());
  const formatDate = (s: string) => {
    if (!s) return '—';
    return new Date(s).toLocaleDateString(dateLocale, {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatBirthday = (s: string) => {
    if (!s) return '—';
    return new Date(s).toLocaleDateString(dateLocale, {
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
    m('Saving your information…'),
    m('Validating booking details…'),
    m('Processing…'),
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

  // 2026-06-28 (round 6.2.102 — Sky): the <48h warning dialog was
  // accidentally nested INSIDE step 2's <form> JSX in round 6.2.97,
  // which meant it only rendered when currentStep === 2. Customer
  // clicked Confirm on step 5 → handleFinalConfirm set
  // showShortNoticeWarning = true → BUT the dialog JSX tree was
  // gated by the `if (currentStep === 2)` early return, so nothing
  // rendered. User only saw the dialog appear after manually
  // navigating back to step 2 (via stepper), which is wrong UX.
  //
  // Fix: define the dialog at component-level (next to
  // stepLoadingOverlay, which already follows this same pattern),
  // and render it as a sibling of {stepLoadingOverlay} inside EVERY
  // step's return. This matches the existing overlay pattern and
  // keeps the dialog's z-50 stacking independent of the active
  // step's <form> subtree. Net diff: remove 88 lines from inside
  // step 2, add 5 sibling references + 95 lines of const above.
  //
  // Behavior matrix (post-fix):
  //   currentStep === 5 + click Confirm + within48h
  //     → setShowShortNoticeWarning(true) → dialog renders on step 5 ✓
  //   currentStep === 2 + click any handler → dialog renders on step 2 ✓
  //   All other steps → dialog renders if showShortNoticeWarning = true ✓
  //   Confirm Anyway → calls onSubmit exactly as before (unchanged)
  //   Cancel → just closes the dialog (unchanged)
  const shortNoticeWarningDialog = showShortNoticeWarning ? (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}
      data-hkial-dialog="short-notice-warning"
    >
      <div
        className="max-w-md w-full rounded-2xl p-6"
        style={{
          background: isDark ? '#0a1929' : '#FFFFFF',
          border: isDark ? '1px solid rgba(220,181,21,0.35)' : '1px solid rgba(200,199,190,0.5)',
          boxShadow: '0 32px 80px rgba(0,0,0,0.6)',
        }}
      >
        <div className="flex items-start gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{
              background: isDark ? 'rgba(251,191,36,0.18)' : 'rgba(251,191,36,0.2)',
              border: isDark ? '1px solid rgba(251,191,36,0.4)' : '1px solid rgba(251,191,36,0.5)',
            }}
          >
            <AlertTriangle className="w-5 h-5" style={{ color: 'rgb(220,181,21)' }} />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-semibold mb-1" style={textPrimary}>
              {m('Short-Notice Booking')}
            </h3>
            <p className="text-sm" style={textSecondary}>
              {m('The booking may not be able to fullfill, further confiration will be made by HKIAL staffs.')}
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 mt-6">
          <button
            type="button"
            onClick={() => setShowShortNoticeWarning(false)}
            className="py-2.5 px-4 rounded-xl text-sm transition-all hover:opacity-80"
            style={{ ...secondaryBtnStyle, color: colors.text }}
          >
            {m('Cancel')}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowShortNoticeWarning(false);
              // Re-enter the submit path WITHOUT re-triggering
              // the 48h gate (would loop forever). Delegate
              // directly to the same body as handleFinalConfirm
              // (the `onSubmit` / mock-booking-number branch).
              if (onSubmit) {
                onSubmit({
                  form,
                  step2Form,
                  vipData,
                  nonFlyingGuestData,
                  memberData,
                  flightDetails,
                  leg1FlightTime,
                  leg2ArrivalDate,
                  leg2FlightNo,
                  leg2FlightTime: leg2ArrivalDate?.split('T')[1]?.slice(0, 5) || '',
                  leg2FlightClass,
                  leg2Destination,
                  transitGapError,
                  useMembershipLdFree,
                  useMembershipPsFree,
                });
              } else {
                const flightPrefixMap: Record<string, string> = { Arrival: 'A', Departure: 'D', Transit: 'T' };
                const flightPrefix = flightPrefixMap[form.flightType] || 'D';
                const now = new Date();
                const year = now.getFullYear();
                const month = (now.getMonth() + 1).toString().padStart(2, '0');
                const day = now.getDate().toString().padStart(2, '0');
                const randomNum = Math.floor(Math.random() * 100000).toString().padStart(5, '0');
                const generatedBookingNumber = flightPrefix + '-' + year + month + day + '-' + randomNum;
                setBookingNumber(generatedBookingNumber);
                setSubmitted(true);
                setTimeout(() => navigate('/mybooking'), 3000);
              }
            }}
            className="py-2.5 px-4 rounded-xl text-white text-sm transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(90deg, rgb(220,181,21) 0%, rgb(180,140,10) 100%)' }}
          >
            {m('Confirm Anyway')}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  // Lifted out of the Step 2 early-return so Step 1 can open it too.
  // The button used to live only on Step 1; after the 2026-06-16 move it
  // was Step 2-only, which made the control look missing on first landing.
  const historyDialog = showHistoryDialog ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}
          data-hkial-dialog="use-history"
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
                  <div className="text-sm" style={textPrimary}>{m('Use History as New Booking')}</div>
                  <div className="text-xs mt-0.5" style={textMuted}>{m('Select a past booking to pre-fill the form')}</div>
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

            {/* Scrollable booking list — 2026-06-16 (round ?): source
                switched from in-file MOCK to the derived
                `historyBookings` (container-provided real data, or
                MOCK fallback for figma preview). Empty / loading
                states added so the user always sees something
                meaningful when opening the dialog. */}
            <div className="overflow-y-auto flex-1 p-5 space-y-3">
              {isLoadingHistory ? (
                <div
                  className="flex flex-col items-center justify-center gap-2 py-12"
                  data-testid="history-dialog-loading"
                >
                  <Loader2 className="w-7 h-7 animate-spin" style={{ color: 'rgb(220,181,21)' }} />
                  <div className="text-xs" style={textMuted}>{m('Loading your past bookings…')}</div>
                </div>
              ) : historyBookings.length === 0 ? (
                <div
                  className="flex flex-col items-center justify-center gap-2 py-12"
                  data-testid="history-dialog-empty"
                >
                  <Inbox className="w-7 h-7" style={{ color: colors.textMuted }} />
                  <div className="text-sm" style={textPrimary}>{m('No past bookings yet')}</div>
                  <div className="text-xs text-center max-w-xs" style={textMuted}>
                    {m('Completed and confirmed bookings will appear here so you can quickly clone their setup.')}
                  </div>
                  {/* 2026-06-16 (round ?): if the container received
                      bookings but all were rejected by the shape
                      gate, show a diagnostic hint so the user can
                      tell "I have no bookings" from "I have
                      bookings but they don't match the expected
                      shape". Helps the "I added a booking 792 but
                      it's not showing" debugging loop. The hint
                      is muted-styled so it doesn't break the
                      empty-state visual. */}
                  {historyDiagnostics && historyDiagnostics.totalReceived > 0 && (
                    <div
                      className="mt-3 px-3 py-2 rounded-lg text-xs text-center max-w-sm"
                      style={{
                        background: isDark ? 'rgba(220,181,21,0.08)' : 'rgba(220,181,21,0.12)',
                        border: isDark ? '1px solid rgba(220,181,21,0.2)' : '1px solid rgba(220,181,21,0.3)',
                        color: isDark ? 'rgba(255,255,255,0.7)' : 'rgb(120,96,4)',
                      }}
                      data-testid="history-dialog-diagnostics"
                    >
                      <div>
                        Loaded {historyDiagnostics.totalReceived} booking
                        {historyDiagnostics.totalReceived === 1 ? '' : 's'}
                        , but {historyDiagnostics.rejectedCount} didn&apos;t
                        match the expected shape{historyDiagnostics.sampleReason ? ` (first: ${historyDiagnostics.sampleReason})` : ''}.
                      </div>
                      <div className="mt-1" style={{ opacity: 0.75 }}>
                        {m('Open the browser console for full per-row details.')}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                historyBookings.map((booking) => {
                  const statusColors: { [key: string]: { bg: string; text: string; border: string } } = {
                    confirmed: { bg: 'rgba(34,197,94,0.12)', text: 'rgb(22,163,74)', border: 'rgba(34,197,94,0.3)' },
                    completed: { bg: 'rgba(59,130,246,0.12)', text: 'rgb(37,99,235)', border: 'rgba(59,130,246,0.3)' },
                  };
                  const sc = statusColors[booking.status] || statusColors.completed;
                  const statusLabel = booking.status.charAt(0).toUpperCase() + booking.status.slice(1);
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
                      {/* Card top row — date promoted to its own prominent
                          line per Sky's "show the date of the old booking"
                          request. `terminal` row dropped (per Sky: "we
                          don't use terminal now"). */}
                      <div className="px-4 pt-4 pb-3">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex-1 min-w-0">
                            {/* 2026-06-16: lounge is optional post-relax.
                                Show "—" muted fallback when missing so
                                the card header doesn't render an
                                empty div. */}
                            <div className="text-sm truncate" style={textPrimary}>
                              {booking.lounge || <span style={textMuted}>—</span>}
                            </div>
                            <div className="text-xs mt-1 flex items-center gap-1.5">
                              <Calendar className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgb(220,181,21)' }} />
                              <span className="font-medium" style={textSecondary}>
                                {new Date(booking.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                              </span>
                            </div>
                          </div>
                          <span
                            className="text-xs px-2.5 py-1 rounded-full flex-shrink-0"
                            style={{ background: sc.bg, color: sc.text, border: '1px solid ' + sc.border }}
                          >
                            {statusLabel}
                          </span>
                        </div>

                        {/* Info grid — 2026-06-16: each cell now hides
                            itself when its data is missing (per Sky:
                            "we just need to fill step 2 data only" →
                            step 1 fields are optional on a past
                            booking). Previously an undefined
                            `booking.flightNumber` would render the
                            literal "undefined · undefined". */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mb-3">
                          {booking.time && (
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: 'rgb(220,181,21)' }} />
                              <span className="text-xs" style={textSecondary}>{booking.time}</span>
                            </div>
                          )}
                          {(booking.flightNumber || booking.flightType) && (
                            <div className="flex items-center gap-1.5">
                              <Plane className="w-3.5 h-3.5 flex-shrink-0 text-blue-500" />
                              <span className="text-xs" style={textSecondary}>
                                {[booking.flightNumber, booking.flightType].filter(Boolean).join('  ·  ')}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 col-span-2">
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
                          {m('Select')}
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
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
                {m('Cancel')}
              </button>
            </div>
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
      { label: m('Flight Info'),      idx: 1 },
      { label: m('Suite & Guests'),   idx: 2 },
      { label: m('Add-on Services'),  idx: 3 },
      { label: m('Other Info'),       idx: 4 },
      { label: m('Final Review'),     idx: 5 },
      { label: m('Confirmation'),     idx: 6 },
    ];
    const stepsLeft = Math.max(0, 6 - effectiveStep);
    const progressCaption = effectiveStep >= 6
      ? m('Booking completed — all steps done')
      : (stepsLeft === 1
        ? `${m('Step')} ${effectiveStep} ${m('of')} 6 — ${m('1 step remaining')}`
        : `${m('Step')} ${effectiveStep} ${m('of')} 6 — ${stepsLeft} ${m('steps remaining')}`);

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
      const nfgStr =
        nfg === 1
          ? m('1 Non-Flying')
          : m('{n} Non-Flying').replace('{n}', String(nfg));
      const occupancyLabel =
        nfg > 0
          ? m('{n} VIP').replace('{n}', String(vip)) + ' · ' + nfgStr
          : m('{n} VIP').replace('{n}', String(vip));
      return { vip, nfg, total, capacityPct: Math.round((total / 6) * 100) + '%', occupancyLabel };
    });
    let gridCols = 'grid-cols-1';
    if (form.premiereSuites === 2) gridCols = 'grid-cols-2';
    else if (form.premiereSuites >= 3) gridCols = 'grid-cols-3';
    const hasLounge = form.vipPassengers > 0 || form.nonFlyingGuests > 0;
    const loungeTotalPax = form.vipPassengers + form.nonFlyingGuests;
    const lvStr =
      form.vipPassengers > 0
        ? m('{n} VIP').replace('{n}', String(form.vipPassengers))
        : '';
    const lnStr =
      form.nonFlyingGuests > 0
        ? form.nonFlyingGuests === 1
          ? m('1 Non-Flying')
          : m('{n} Non-Flying').replace('{n}', String(form.nonFlyingGuests))
        : '';
    const loungeLabel = lvStr + (lvStr && lnStr ? ' · ' : '') + lnStr;
    const addonOrig =
      step2Form.loungeExtension * loungeExtensionBaseRate +
      step2Form.limousineService * 1500 +
      step2Form.wheelchairService * wheelchairRate;
    const addonAmt =
      step2Form.loungeExtension * loungeRate +
      step2Form.limousineService * limoRate +
      step2Form.wheelchairService * wheelchairRate;
    const addonSave = addonOrig - addonAmt;
    const hasAddon =
      step2Form.loungeExtension > 0 ||
      step2Form.limousineService > 0 ||
      step2Form.wheelchairService > 0;

    // 2026-06-17 (round 6.2.28 follow-up) — Single-source-of-truth
    // pricing. Pull section prices from the Container's `pricePreview`
    // (backend `PricingService` via
    // `POST /api/member/bookings/price-preview`). The breakdown labels
    // contain "Premiere Suite" / "Lounge Deluxe" for product-specific
    // lines (base + per-kind addons); the folded addons line has
    // key=`addons`.
    //
    // Round 6.2.52 (2026-06-22) — drift fix: when `pricePreview` has
    // not loaded yet (figma-ui standalone preview without the
    // Container, or the 300ms before the debounced live preview
    // returns), do NOT render stale hardcoded rates or HK$0
    // placeholders. The previous `form.premiereSuites * 18000` /
    // `hasLounge ? 5000 : 0` fallback could silently disagree with
    // the backend's `prices` table whenever an admin updates the
    // rate card via `PUT /api/prices/{key}`. Per Sky's directive
    // "all places need price calculation are using the same logic
    // — go through the exact same code", the only canonical source
    // is `PricingService::compute()` on the backend. The section
    // subtotal rows are therefore gated on `ppHasLoaded`; the
    // existing total-row guard also stays in place so no price
    // figure appears until the backend's authoritative preview
    // lands.
    // R6.2.104 (2026-07-04, Sky): use the shared helper instead of
    // recomputing locally — keeps Step 2 chips + Step 5 summary card in
    // lock-step with the backend's `PricingService::compute()`.
    // R6.2.105 (2026-07-04, Sky): helper now sums all addon-related
    // keys (`add_on_additional_hour` + `add_on_limousine` + `addons`)
    // instead of just the `addons` folded line — the Lounge Extension
    // subtotal was being silently dropped from the Add-on Services
    // Subtotal before.
    const {
      psSectionPrice,
      ldSectionPrice,
      addonsAmtFinal,
      addonLines,
      membershipDiscounts,
      membershipDiscountTotal,
      promoDiscounts,
      promoDiscountTotal,
      accountDiscounts,
      accountDiscountTotal,
      ppHasLoaded,
      finalTotal,
    } = getPriceSectionPrices(pricePreview);
    // Gate the Add-on Services section on a non-zero subtotal. The
    // helper already zero-gates on `ppHasLoaded` so the section
    // stays hidden until the backend returns a real number.
    const hasAddonSection =
      addonsAmtFinal > 0 || addonLines.length > 0 || step2Form.securityService;

    return (
      <div className="rounded-xl overflow-hidden" style={summaryBoxGoldBg}>
        <div className="px-5 py-3 flex items-center justify-between" style={summaryBoxGoldHeaderBg}>
          <span className="text-sm" style={textPrimary}>{m('Booking Summary')}</span>
          <div className="flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5" style={{ color: accentColor }} />
            <span className="text-xs font-medium" style={{ color: accentColor }}>
              {m(totalGuests === 1 ? 'Total {n} guest' : 'Total {n} guests').replace('{n}', String(totalGuests))}
            </span>
          </div>
        </div>
        <div className="px-5 py-4 space-y-3">
          {form.premiereSuites > 0 && (
            <div>
              <div className="text-xs uppercase tracking-wider mb-2" style={{ color: sectionLabel }}>
                {m(form.premiereSuites > 1 ? 'Premiere Suites' : 'Premiere Suite')} ({form.premiereSuites})
              </div>
              <div className={`grid gap-2 ${gridCols}`}>
                {suiteDists.map((suite, i) => (
                  <div key={i} className="rounded-lg p-2.5" style={suiteTile}>
                    <div className="flex items-center gap-1 mb-1.5">
                      <Crown className="w-3 h-3" style={{ color: accentColor }} />
                      <span className="text-xs font-semibold" style={textPrimary}>
                        {m('Suite {n}').replace('{n}', String(i + 1))}
                      </span>
                    </div>
                    <div className="text-xs mb-1.5" style={{ color: colors.textMuted }}>{suite.occupancyLabel}</div>
                    <div className="h-0.5 w-full rounded-full overflow-hidden" style={capacityTrack}>
                      <div className="h-full rounded-full" style={{ width: suite.capacityPct, background: 'rgb(220,181,21)' }} />
                    </div>
                    <div className="text-xs mt-1" style={{ color: colors.textMuted }}>{suite.total}/6</div>
                  </div>
                ))}
              </div>
              {ppHasLoaded && (
                <div
                  className="flex items-center justify-between mt-2 pt-2"
                  style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.05)' }}
                >
                  <span className="text-xs" style={{ color: colors.textMuted }}>{m('Premiere Suite Subtotal')}</span>
                  <span className="text-xs font-medium" style={textPrimary}>HK${psSectionPrice.toLocaleString()}</span>
                </div>
              )}
            </div>
          )}
          {hasLounge && (
            <div>
              {form.premiereSuites > 0 && (
                <div className="text-xs uppercase tracking-wider mb-2" style={{ color: sectionLabel }}>{m('Lounge Deluxe')}</div>
              )}
              <div className="rounded-lg px-3 py-2.5 flex items-center justify-between" style={loungeTile}>
                <div className="flex items-center gap-2">
                  <Hotel className="w-3.5 h-3.5" style={{ color: iconMuted }} />
                  <div>
                    <div className="text-xs font-semibold" style={textPrimary}>{m('Lounge Deluxe')}</div>
                    <div className="text-xs" style={{ color: colors.textMuted }}>{loungeLabel}</div>
                  </div>
                </div>
                <span className="text-xs font-medium" style={{ color: colors.textMuted }}>| {m(loungeTotalPax === 1 ? 'Total {n} guest' : 'Total {n} guests').replace('{n}', String(loungeTotalPax))}</span>
              </div>
              {ppHasLoaded && (
                <div
                  className="flex items-center justify-between mt-2 pt-2"
                  style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.06)' : '1px solid rgba(0,0,0,0.05)' }}
                >
                  <span className="text-xs" style={{ color: colors.textMuted }}>{m('Lounge Deluxe Subtotal')}</span>
                  <span className="text-xs font-medium" style={textPrimary}>HK${ldSectionPrice.toLocaleString()}</span>
                </div>
              )}
                  </div>
          )}
          {membershipDiscounts.length > 0 && (
            <div className="space-y-1.5">
              {membershipDiscounts.map((d) => (
                <div key={d.key} className="flex items-center justify-between">
                  <span className="text-xs" style={{ color: colors.textMuted }}>
                    {priceLineLabel(d.label)}
                  </span>
                  <span className="text-xs font-medium" style={{ color: 'rgb(16,185,129)' }}>
                    −HK${Math.abs(d.subtotal).toLocaleString()}
                  </span>
                </div>
              ))}
                </div>
              )}
          {promoDiscounts.length > 0 && (
            <div className="space-y-1.5" data-testid="booking-summary-promo-discounts">
              {promoDiscounts.map((d, idx) => (
                <div
                  key={`${d.key}-${idx}`}
                  className="flex items-center justify-between"
                  data-testid="booking-summary-promo-discount-row"
                >
                  <span className="text-xs" style={{ color: colors.textMuted }}>
                    {priceLineLabel(d.label)}
                  </span>
                  <span className="text-xs font-medium" style={{ color: 'rgb(16,185,129)' }}>
                    −HK${Math.abs(d.subtotal).toLocaleString()}
                  </span>
                  </div>
              ))}
                </div>
              )}
          {accountDiscounts.length > 0 && (
            <div className="space-y-1.5" data-testid="booking-summary-account-discounts">
              {accountDiscounts.map((d, idx) => (
                <div
                  key={`${d.key}-${idx}`}
                  className="flex items-center justify-between"
                  data-testid="booking-summary-account-discount-row"
                >
                  <span className="text-xs" style={{ color: colors.textMuted }}>
                    {priceLineLabel(d.label)}
                  </span>
                  <span className="text-xs font-medium" style={{ color: 'rgb(16,185,129)' }}>
                    −HK${Math.abs(d.subtotal).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          )}
          {hasAddonSection && (
            <div
              className="rounded-lg px-3 py-2.5 space-y-1.5"
              style={{ background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)' }}
              data-testid="booking-summary-addon-services"
            >
              <div className="text-xs uppercase tracking-wider mb-2" style={{ color: colors.textMuted }}>{m('Add-on Services')}</div>
              {/* Render every price-preview addon line (Lane A + Lane B)
                  so the list matches Add-on Services Subtotal. */}
              {addonLines.map((line, idx) => (
                <div
                  key={`${line.key}-${line.label}-${idx}`}
                  className="flex items-center justify-between"
                  data-testid="booking-summary-addon-row"
                >
                  <span className="text-xs" style={{ color: colors.textMuted }}>
                    {priceLineLabel(line.label)}
                    {line.qty > 0 ? ` × ${line.qty}` : ''}
                  </span>
                  <div className="text-right">
                    <span className="text-xs font-medium" style={textPrimary}>
                      HK${line.subtotal.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
              {step2Form.securityService && (
                <div
                  className="flex items-center justify-between"
                  data-testid="booking-summary-security-row"
                >
                  <span className="text-xs" style={{ color: colors.textMuted }}>
                    {m('Security Escort Service')}
                  </span>
                  <span className="text-xs font-medium" style={textPrimary}>
                    {m('To be confirmed')}
                  </span>
                </div>
              )}
              <div
                className="flex items-center justify-between pt-1.5 mt-1"
                style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(0,0,0,0.06)' }}
              >
                <span className="text-xs font-medium" style={textPrimary}>{m('Add-on Services Subtotal')}</span>
                <span className="text-sm font-semibold" style={textPrimary}>HK${addonsAmtFinal.toLocaleString()}</span>
              </div>
              {/* R6.2.100d (2026-07-02, Sky): TA "Agency saving"
                  line removed (mock data — discount is gone). */}
            </div>
          )}
          {(psSectionPrice > 0 || ldSectionPrice > 0 || addonsAmtFinal > 0) && (
            <div
              className="pt-2.5 mt-2 space-y-1"
              style={{ borderTop: isDark ? '1px solid rgba(255,255,255,0.18)' : '1px solid rgba(0,0,0,0.12)' }}
            >
              {/* R6.2.104 (2026-07-04, Sky): explicit PS+LD+Add-ons
                  math line above the Total Charge row so the user can
                  see how the bottom number is composed (per Sky's
                  "Total is not really the Total Charge" complaint). */}
              <div className="flex items-center justify-between">
                <span className="text-xs" style={{ color: colors.textMuted }}>
                  {m('Subtotal')} HK${(psSectionPrice + ldSectionPrice + addonsAmtFinal).toLocaleString()}
                  {membershipDiscountTotal < 0 && (
                    <> − {m('Membership discount')} HK${Math.abs(membershipDiscountTotal).toLocaleString()}</>
                  )}
                  {promoDiscountTotal < 0 && (
                    <> − {m('Promo discount')} HK${Math.abs(promoDiscountTotal).toLocaleString()}</>
                  )}
                  {accountDiscountTotal < 0 && (
                    <> − {m('Account discount')} HK${Math.abs(accountDiscountTotal).toLocaleString()}</>
                  )}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-sm font-semibold" style={textPrimary}>{m('Total Charge')}</span>
                <span className="text-base font-semibold" style={textPrimary}>HK${finalTotal.toLocaleString()}</span>
              </div>
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
              <div className="text-xs" style={{ color: isDark ? '#6ee7b7' : 'rgb(5,150,105)' }}>{m(TA_PAYMENT_METHOD)}</div>
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
          <h2 className="text-3xl mb-4" style={textPrimary}>{m('Booking Request Submitted')}</h2>
          
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
            <div className="text-xs mb-1" style={textMuted}>{m('Booking Reference')}</div>
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
            {m('Your lounge booking request has been successfully submitted and is currently under staff approval.')}
            {' '}
            {m('You will receive a confirmation email once your booking is verified.')}
          </p>
          {step2Form.promotionCode && (
            <p className="text-yellow-400 text-sm mb-4">
              {m('Promotion / Redemption code')} <strong>{step2Form.promotionCode}</strong> {m('applied.')}
            </p>
          )}
          {/* 2026-06-08 (Q6C + Q7A-light) — Booking summary with guest counts.
              Brief one-liner showing VIP and NFG totals; detail lives on the
              Final Review (step 5). Kept short so the success screen stays
              focused on the booking reference + voucher info. */}
          {(vipData.length > 0 || nonFlyingGuestData.length > 0) && (
            <p className="text-sm mb-4" style={textSecondary}>
              <strong style={textPrimary}>
                {m(
                  vipData.length !== 1
                    ? 'Booking for {n} VIP Passengers'
                    : 'Booking for {n} VIP Passenger',
                ).replace('{n}', String(vipData.length))}
              </strong>
              {nonFlyingGuestData.length > 0 && (
                <>
                  {' + '}
                  <strong style={textPrimary}>
                    {nonFlyingGuestData.length}{' '}
                    {nonFlyingGuestData.length !== 1 ? m('Non-Flying Guests') : m('Non-Flying Guest')}
                  </strong>
                </>
              )}
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
                <span className="text-sm" style={{ color: isDark ? '#6ee7b7' : 'rgb(5, 150, 105)' }}>{m('Travel Agency Billing Confirmed')}</span>
              </div>
              <div className="text-xs space-y-1" style={textMuted}>
                <div>• {m('Payment:')} <span style={textPrimary}>{m(TA_PAYMENT_METHOD)}</span></div>
                <div>• {m('Billing Ref:')} <span style={textPrimary}>{step2Form.billingReference || agencyBillingCode}</span></div>
                <div>• {m('Invoice will be sent to your registered agency email within 3 business days')}</div>
              </div>
            </div>
          )}
          <p className="text-sm" style={textMuted}>{m('Redirecting to My Bookings…')}</p>
        </div>
      </div>
      {stepLoadingOverlay}
      {shortNoticeWarningDialog}
      {historyDialog}
      </>
    );
  }

  // ── Step 5: Final Review ──────────────────────────────────────────────────
  if (currentStep === 5) {

    const addonOriginal =
      step2Form.loungeExtension * loungeExtensionBaseRate +
      step2Form.limousineService * 1500 +
      step2Form.wheelchairService * wheelchairRate;
    const {
      addonsAmtFinal: reviewAddonsAmtFinal,
      addonLines: reviewAddonLines,
    } = getPriceSectionPrices(pricePreview);
    const reviewCatalogAddonLines = filterLaneBCatalogAddonLines(reviewAddonLines);
    const addonTotal =
      reviewAddonsAmtFinal > 0
        ? reviewAddonsAmtFinal
        : step2Form.loungeExtension * loungeRate +
      step2Form.limousineService * limoRate +
      step2Form.wheelchairService * wheelchairRate;
    const addonSaving = Math.max(0, addonOriginal - addonTotal);
    const hasAddons =
      step2Form.loungeExtension > 0 ||
      step2Form.limousineService > 0 ||
      step2Form.wheelchairService > 0 ||
      step2Form.securityService ||
      reviewCatalogAddonLines.length > 0;

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
      const nfgStr =
        nfg === 1
          ? m('1 Non-Flying')
          : m('{n} Non-Flying').replace('{n}', String(nfg));
      const occupancyLabel =
        nfg > 0
          ? m('{n} VIP').replace('{n}', String(vip)) + ' · ' + nfgStr
          : m('{n} VIP').replace('{n}', String(vip));
      return { vip, nfg, total, capacityPct: Math.round((total / 6) * 100) + '%', occupancyLabel };
    });
    const hasLoungeGuests = form.vipPassengers > 0 || form.nonFlyingGuests > 0;
    const loungeTotalGuests = form.vipPassengers + form.nonFlyingGuests;
    const loungeVipStr =
      form.vipPassengers > 0
        ? m('{n} VIP').replace('{n}', String(form.vipPassengers))
        : '';
    const loungeNfgStr =
      form.nonFlyingGuests > 0
        ? form.nonFlyingGuests === 1
          ? m('1 Non-Flying')
          : m('{n} Non-Flying').replace('{n}', String(form.nonFlyingGuests))
        : '';
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
            {m('Step 5: Final Review')}
          </h1>
          <p className="text-xs mt-1" style={textMuted}>
            {m('Please review your booking details before confirmation')}
          </p>
        </div>

        {error ? (
          <div
            className="rounded-xl px-4 py-3 text-sm font-medium border border-red-400/40"
            style={{ background: 'rgba(185,28,28,0.18)', color: isDark ? '#fecaca' : 'rgb(153,27,27)' }}
            role="alert"
          >
            {m(error)}
          </div>
        ) : null}

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
                {m('Booking on behalf of')}{' '}
                <strong>{prefillMember.title} {prefillMember.firstName} {prefillMember.lastName}</strong>
              </p>
              <p className="text-xs mt-0.5" style={{ color: isDark ? 'rgba(147,197,253,0.75)' : 'rgba(37,99,235,0.7)' }}>
                {m('Membership:')} {m(prefillMember.membershipLabel)} · {m("Vouchers deducted from this member's account")}
              </p>
            </div>
          </div>
        )}

        {/* ── Flight Information ─────────────────────────────────────────── */}
        <ReviewSection
          icon={<Plane className="w-4 h-4 text-white" />}
          iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
          title={m('Flight Information')}
        >
          {/* 2026-06-08 (round 6.2.7): labels are mode-aware. In
              Departure mode the relevant date/time is the outbound
              flight, so we render "Departure Date" / "Departure Time"
              instead of the default "Arrival Date" / "Arrival Time".
              In Arrival and Transit modes the inbound flight is the
              reference, so we keep "Arrival Date" / "Arrival Time".

              2026-06-08 (round 6.2.8): Origin is shown for both Arrival
              and Transit (the form's leg 1 = inbound to HKG; Origin
              = where the passenger is coming FROM). The "Destination"
              in the Flight Information Found banner applies to Arrival
              and Transit modes only; Departure omits it.

              2026-06-08 (round 6.2.8+): for Transit, render a second
              "Leg 2 (Outbound)" sub-section below the leg-1 fields so
              the user sees the full 2-leg structure on the review
              page. Each leg is its own ReviewGrid. */}
          <div className="mb-2 text-xs uppercase tracking-wider" style={{ color: sectionLabelColor }}>
            Leg 1{form.flightType === 'Transit' ? ' (Inbound)' : ''}
          </div>
          <ReviewGrid>
            <ReviewField
              label={form.flightType === 'Departure' ? m('Departure Date') : m('Arrival Date')}
              value={formatDate(form.date)}
            />
            <ReviewField label={m('Flight Number')} value={form.flightNumber || '—'} />
            {(form.flightType === 'Arrival' || form.flightType === 'Transit') && (
              <ReviewField label={m('Origin')} value={form.origin ? formatAirportDisplay(form.origin, dateLocale) : '—'} />
            )}
            <ReviewField label={m('Flight Class')} value={form.flightClass} />
            <ReviewField label={m('Flight Type')} value={form.flightType} />
            {flightDetails && form.flightType !== 'Departure' && (
              <ReviewField label={m('Arrival Time')} value={flightDetails.arrivalTime} />
            )}
          </ReviewGrid>

          {form.flightType === 'Transit' && (
            <div className="mt-4">
              <div className="mb-2 text-xs uppercase tracking-wider" style={{ color: sectionLabelColor }}>
                {m('Leg 2 (Outbound)')}
              </div>
              <ReviewGrid>
                <ReviewField
                  label={m('Departure Date')}
                  value={leg2ArrivalDate?.split('T')[0] ? formatDate(leg2ArrivalDate.split('T')[0]) : '—'}
                />
                <ReviewField
                  label={m('Departure Time')}
                  value={leg2ArrivalDate?.split('T')[1]?.slice(0, 5) || '—'}
                />
                <ReviewField label={m('Flight Number')} value={leg2FlightNo || '—'} />
                <ReviewField label={m('Destination')} value={leg2Destination ? formatAirportDisplay(leg2Destination, dateLocale) : '—'} />
                <ReviewField label={m('Flight Class')} value={leg2FlightClass || '—'} />
              </ReviewGrid>
            </div>
          )}
        </ReviewSection>

        {/* ── Accommodation ─────────────────────────────────────────────── */}
        <ReviewSection
          icon={<Building className="w-4 h-4 text-white" />}
          iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
          title={m('Accommodation')}
        >
          <div className="space-y-4">
            {form.premiereSuites > 0 && (
              <div>
                <div className="text-xs uppercase tracking-wider mb-2.5" style={{ color: sectionLabelColor }}>
                  {m(form.premiereSuites > 1 ? 'Premiere Suites' : 'Premiere Suite')}
                  {' — '}
                  {form.premiereSuites} {m('booked')}
                </div>
                <div className={`grid gap-2 ${suiteGridCols}`}>
                  {suiteDistributions.map((suite, i) => (
                    <div key={i} className="rounded-lg p-3" style={suiteTileStyle}>
                      <div className="flex items-center gap-1.5 mb-2">
                        <Crown className="w-3.5 h-3.5" style={{ color: suiteAccentColor }} />
                        <span className="text-xs font-semibold" style={textPrimary}>
                          {m('Suite {n}').replace('{n}', String(i + 1))}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs mb-2.5" style={textPrimary}>
                        <User className="w-3 h-3" style={{ color: colors.textMuted }} />
                        <span>{suite.occupancyLabel}</span>
                      </div>
                      <div className="h-1 w-full rounded-full overflow-hidden" style={capacityTrackStyle}>
                        <div className="h-full rounded-full" style={{ width: suite.capacityPct, background: 'rgb(220,181,21)' }} />
                      </div>
                      <div className="text-xs mt-1.5" style={{ color: colors.textMuted }}>
                        {m('{n} / 6 capacity').replace('{n}', String(suite.total))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {hasLoungeGuests && (
              <div>
                {form.premiereSuites > 0 && (
                  <div className="text-xs uppercase tracking-wider mb-2.5" style={{ color: sectionLabelColor }}>{m('Lounge Deluxe')}</div>
                )}
                <div className="rounded-lg p-3 flex items-center justify-between" style={loungeTileStyle}>
                  <div className="flex items-center gap-2.5">
                    <Hotel className="w-4 h-4" style={{ color: loungeIconColor }} />
                    <div>
                      <div className="text-xs font-semibold" style={textPrimary}>{m('Lounge Deluxe')}</div>
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
            title={m('VIP Passenger #{n}').replace('{n}', String(i + 1))}
          >
            <ReviewGrid>
              <ReviewField
                label="Full Name"
                value={`${p.vipTitle} ${p.vipFirstName} ${p.vipLastName}`.trim() || '—'}
              />
              <ReviewField label="Travel Document No." value={p.vipTravelDocNo || '—'} />

              <ReviewField label="Age Group" value={p.vipAgeGroup} />
              <ReviewField
                label="Nationality"
                value={
                  p.nationality
                    ? `${localizedCountryName(p.nationality, dateLocale)} (${p.nationality.toUpperCase()})`
                    : '—'
                }
              />
              {p.vipBirthday && (
                <ReviewField label="Birthday" value={formatBirthday(p.vipBirthday)} />
              )}
              {p.foodAllergies && (
                <ReviewField label="Food Allergies" value={p.foodAllergies} />
              )}
            </ReviewGrid>
          </ReviewSection>
        ))}

        {/* ── Non-Flying Guests ──────────────────────────────────────────── */}
        {/* 2026-06-08 (Q7A: mirror VIP pattern) — Final Review was missing
            the NFG detail section. Only render when at least one NFG row
            exists, mirroring the VIP conditional. The `guestType` label
            uses the same Premiere Suite / Lounge Deluxe split the step 2
            input form applies (computed from form.premiereNonFlyingGuests
            count). */}
        {nonFlyingGuestData.length > 0 && (
          <div className="space-y-3">
            <div
              className="text-xs font-semibold tracking-wide uppercase"
              style={textMuted}
            >
              {m('Non-Flying Guests')} ({nonFlyingGuestData.length})
            </div>
            {nonFlyingGuestData.map((g, i) => {
              const premiereNonFlyingEnd = form.premiereNonFlyingGuests;
              const isPremiere = i < premiereNonFlyingEnd;
              const guestType = isPremiere
                ? 'Premiere Suite - Non-Flying Guest'
                : 'Lounge Deluxe - Non-Flying Guest';
              return (
                <ReviewSection
                  key={i}
                  icon={<User className="w-4 h-4 text-white" />}
                  iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
                  title={m('Non-Flying Guest #{n}').replace('{n}', String(i + 1))}
                >
                  <ReviewGrid>
                    <ReviewField
                      label="Full Name"
                      value={`${g.guestTitle} ${g.guestFirstName} ${g.guestLastName}`.trim() || '—'}
                    />
                    {g.guestAgeGroup && (
                      <ReviewField label="Age Group" value={g.guestAgeGroup} />
                    )}
                    {isNfgChildrenAgeGroup(g.guestAgeGroup) && g.guestAge && (
                      <ReviewField
                        label="Age"
                        value={m('{n} years old').replace('{n}', g.guestAge)}
                      />
                    )}
                    <ReviewField
                      label="Nationality"
                      value={
                        g.nationality
                          ? `${localizedCountryName(g.nationality, dateLocale)} (${g.nationality.toUpperCase()})`
                          : '—'
                      }
                    />
                    {g.foodAllergies && (
                      <ReviewField label="Food Allergies" value={g.foodAllergies} />
                    )}
                    <ReviewField label="Type" value={guestType} />
                  </ReviewGrid>
                </ReviewSection>
              );
            })}
          </div>
        )}

        {/* ── Add-on Services ────────────────────────────────────────────── */}
        {hasAddons && (
          <ReviewSection
            icon={<Zap className="w-4 h-4 text-white" />}
            iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
            title={m('Add-on Services')}
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
                        <div className="text-xs" style={textMuted}>{m('Extension of Stay in VIP Lounge')}</div>
                        <div className="text-sm mt-0.5" style={textPrimary}>
                          {step2Form.loungeExtension}{' '}
                          {step2Form.loungeExtension !== 1 ? m('hours') : m('hour')}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      {/* R6.2.100d (2026-07-02, Sky): TA discount
                          branch removed (mock data). All members
                          see the uniform catalog rate. */}
                      <div className="text-xs" style={textMuted}>HK${loungeExtensionBaseRate} × {step2Form.loungeExtension}</div>
                      <div className="text-sm mt-0.5" style={textPrimary}>HK${(step2Form.loungeExtension * loungeExtensionBaseRate).toLocaleString()}</div>
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
                          {m('Airport Limousine Transfer Service')}
                        </div>
                        <div className="text-sm mt-0.5" style={textPrimary}>
                          {step2Form.limousineService}{' '}
                          {step2Form.limousineService !== 1 ? m('vehicles') : m('vehicle')}
                        </div>
                        {step2Form.destinationAddresses.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {step2Form.destinationAddresses.map((addr, idx) => (
                              addr && (
                                <div key={idx} className="text-xs" style={textMuted}>
                                  <span style={textMuted}>
                                    {step2Form.limousineService > 1
                                      ? m('Vehicle #{n}:').replace('{n}', String(idx + 1)) + ' '
                                      : m('Destination:') + ' '}
                                  </span>
                                  {addr}
                                </div>
                              )
                            ))}
                            {form.flightType === 'Departure' && step2Form.limousinePickupTime && (
                              <div className="text-xs" style={textMuted}>
                                <span style={textMuted}>{m('Pick-up Time:')} </span>
                                {step2Form.limousinePickupTime}
                              </div>
                            )}
                            {step2Form.limousineStops.length > 0 && (
                              <div className="mt-1.5 pt-1.5" style={{ borderTop: borderSubtle }}>
                                <div className="text-xs mb-1" style={textMuted}>{m('Additional Stops:')}</div>
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
                      {/* R6.2.100d (2026-07-02, Sky): TA discount
                          branch removed (mock data). */}
                      <div className="text-xs" style={textMuted}>HK$1,500 × {step2Form.limousineService}</div>
                      <div className="text-sm mt-0.5" style={textPrimary}>HK${(step2Form.limousineService * 1500).toLocaleString()}</div>
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
                        <div className="text-xs" style={textMuted}>{m('Wheelchair Assistance')}</div>
                        <div className="text-sm mt-0.5" style={textPrimary}>
                          {step2Form.wheelchairService}{' '}
                          {step2Form.wheelchairService !== 1 ? m('wheelchairs') : m('wheelchair')}
                        </div>
                        {step2Form.wheelchairPassengerNames.filter(Boolean).length > 0 && (
                          <div className="text-xs mt-1" style={textMuted}>
                            {step2Form.wheelchairPassengerNames.filter(Boolean).map((n, i) => (
                              <div key={i}>
                                {m('Passenger {n}:').replace('{n}', String(i + 1))} {n}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs" style={textMuted}>{m('Free')}</div>
                      <div className="text-sm mt-0.5" style={textPrimary}>HK$0</div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2026-07-16 — Lane B catalog add-ons from price-preview. */}
              {reviewCatalogAddonLines.map((line, idx) => (
                <div
                  key={`catalog-addon-${line.label}-${idx}`}
                  className="rounded-lg px-4 py-3"
                  style={addonItemBg}
                  data-testid="final-review-catalog-addon-row"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-2">
                      <Zap className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs" style={textMuted}>
                          {priceLineLabel(line.label)}
                        </div>
                        <div className="text-sm mt-0.5" style={textPrimary}>
                          {m('Qty')} {line.qty > 0 ? line.qty : 1}
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs" style={textMuted}>
                        HK${line.unit_price.toLocaleString()} × {line.qty > 0 ? line.qty : 1}
                      </div>
                      <div className="text-sm mt-0.5" style={textPrimary}>
                        HK${line.subtotal.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {step2Form.securityService && (
                <div
                  className="rounded-lg px-4 py-3"
                  style={addonItemBg}
                  data-testid="final-review-security-addon-row"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-2">
                      <Shield className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <div className="text-xs" style={textMuted}>
                          {m('Security Escort Service')}
                        </div>
                        <div className="text-sm mt-0.5" style={textPrimary}>
                          {m('Qty')} 1
                        </div>
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs" style={textMuted}>
                        {m('To be confirmed')}
                      </div>
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
                  <span className="text-sm" style={textPrimary}>{m('Total Add-on Services')}</span>
                  {isTravelAgency && addonSaving > 0 && (
                    <div className="text-xs text-green-400 mt-0.5">
                      {m('You save HK${amount} with TA pre-negotiated rates').replace(
                        '{amount}',
                        addonSaving.toLocaleString(),
                      )}
                    </div>
                  )}
                </div>
                <div className="text-right">
                  {/* R6.2.100d (2026-07-02, Sky): TA strikethrough
                      removed (mock data — no discount). */}
                  <span className="text-base" style={textPrimary}>
                    HK${addonTotal.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </ReviewSection>
        )}

        {/* ── Travel Agency Pricing & Payment (TA only) ──────────────────── */}
        {/* R6.2.100d (2026-07-02, Sky): TA discount badge
            removed (mock data). Payment / billing fields stay
            — TA members still get Direct Billing – Net 30 Terms
            and a billing reference. */}
        {isTravelAgency && (
          <ReviewSection
            icon={<BadgeCheck className="w-4 h-4 text-white" />}
            iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
            title={m('Travel Agency Pricing & Payment')}
          >
            <ReviewGrid>
              <ReviewField label="Payment Method" value={TA_PAYMENT_METHOD} />
              <ReviewField label="Agency Billing Reference" value={step2Form.billingReference || agencyBillingCode} />
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
            title={m('Payment Method')}
          >
            <ReviewField label="Payment" value="Credit Card" />
          </ReviewSection>
        )}

        {/* ── Other Information ──────────────────────────────────────────── */}
        <ReviewSection
          icon={<Package className="w-4 h-4 text-white" />}
          iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
          title={m('Other Information')}
        >
          <ReviewGrid>
            <ReviewField
              label="Number of Luggage"
              value={`${step2Form.luggageCount} ${
                step2Form.luggageCount !== 1 ? m('pieces') : m('piece')
              }`}
            />
            <ReviewField
              label="Private Transport"
              value={step2Form.privateTransport > 0 ? String(step2Form.privateTransport) : 'No'}
            />
          </ReviewGrid>
        </ReviewSection>

        {/* ── Private Vehicles ───────────────────────────────────────────── */}
        {step2Form.vehicles.map((vehicle, idx) => (
          <ReviewSection
            key={idx}
            icon={<Car className="w-4 h-4 text-white" />}
            iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
            title={
              step2Form.vehicles.length > 1
                ? m('Vehicle {n}').replace('{n}', String(idx + 1))
                : m('Private Vehicle')
            }
          >
            <ReviewGrid>
              <ReviewField label="Driver Name" value={vehicle.driverName || '—'} />
              <ReviewField label="Driver Contact" value={vehicle.driverContact || '—'} />
              <ReviewField label="Car Plate No." value={vehicle.carPlateNo || '—'} />
            </ReviewGrid>
          </ReviewSection>
        ))}

        {/* ── Membership benefits (round 6.2.140) ─────────────────────────────── */}
        {isEligibleIndividualMembership && (
          <ReviewSection
            icon={<BadgeCheck className="w-4 h-4 text-white" />}
            iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
            title={m('Membership Benefits')}
          >
            <ReviewGrid>
              <ReviewField
                label="Use free Lounge Deluxe entry"
                value={useMembershipLdFree ? 'Yes' : 'No — keep credit unused'}
              />
                <ReviewField
                label="Use free Premiere Suite upgrade"
                value={
                  useMembershipPsFree
                    ? 'Yes'
                    : 'No — pay reduced Suite rate if applicable'
                }
              />
            </ReviewGrid>
          </ReviewSection>
        )}

        {/* ── Promotion / Redemption Code ─────────────────────────────────────────────── */}
        {step2Form.promotionCode && (
          <ReviewSection
            icon={<Tag className="w-4 h-4 text-white" />}
            iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
            title={m('Promotion / Redemption Code')}
          >
            <div className="text-sm" style={textPrimary}>{step2Form.promotionCode}</div>
          </ReviewSection>
        )}

        {/* ── Contact Person ─────────────────────────────────────────────── */}
        <ReviewSection
          icon={<Phone className="w-4 h-4 text-white" />}
          iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
          title={m('Contact Person')}
        >
          <ReviewGrid>
            <ReviewField label="Name" value={step2Form.contactName || '—'} />
            <ReviewField label="Email" value={step2Form.contactEmail || '—'} />
            <ReviewField label="Contact No." value={step2Form.contactNo || '—'} />
          </ReviewGrid>
          {step2Form.bookingMemo && (
            <div className="mt-4 pt-4" style={{ borderTop: borderSubtle }}>
              <div className="text-xs mb-0.5" style={textMuted}>{m('Booking Memo')}</div>
              <div className="text-sm" style={{ lineHeight: '1.625', ...textPrimary }}>{step2Form.bookingMemo}</div>
            </div>
          )}
        </ReviewSection>

        {/* ── Booking Summary ────────────────────────────────────────────── */}
        <BookingSummaryCard />
        <p className="text-xs px-1" style={{ color: colors.textMuted }}>
          {m('Please review all information carefully before confirming your booking.')}
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
            <span className="text-sm font-medium" style={textPrimary}>{m('Terms & Conditions')}</span>
          </div>
          <div className="px-5 py-4">
            <div className="space-y-3 mb-4">
              <div className="flex items-start gap-2.5">
                <div 
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                  style={{ background: isDark ? 'rgb(220, 181, 21)' : 'rgb(180, 140, 10)' }}
                />
                <p className="text-xs leading-relaxed" style={textPrimary}>
                  {m('Lounge reservation shall be made')} <span className="font-medium" style={{ color: isDark ? 'rgb(251, 191, 36)' : 'rgb(180, 140, 10)' }}>{m('at least 48 hours in advance')}</span>.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <div 
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                  style={{ background: isDark ? 'rgb(220, 181, 21)' : 'rgb(180, 140, 10)' }}
                />
                <p className="text-xs leading-relaxed" style={textPrimary}>
                  {m('Payment needs to be settled')} <span className="font-medium" style={{ color: isDark ? 'rgb(251, 191, 36)' : 'rgb(180, 140, 10)' }}>{m('at least 12 hours prior to the flight time')}</span>, {m('otherwise it will be treated as cancelled.')}
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <div 
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                  style={{ background: isDark ? 'rgb(220, 181, 21)' : 'rgb(180, 140, 10)' }}
                />
                <p className="text-xs leading-relaxed" style={textPrimary}>
                  <span className="font-medium" style={{ color: isDark ? 'rgb(251, 191, 36)' : 'rgb(180, 140, 10)' }}>{m('No ad-hoc amendment')}</span> {m('of booking, and booking is')} <span className="font-medium" style={{ color: isDark ? 'rgb(251, 191, 36)' : 'rgb(180, 140, 10)' }}>{m('non-transferable')}</span>.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <div 
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                  style={{ background: isDark ? 'rgb(220, 181, 21)' : 'rgb(180, 140, 10)' }}
                />
                <p className="text-xs leading-relaxed" style={textPrimary}>
                  <span className="font-medium" style={{ color: isDark ? 'rgb(251, 191, 36)' : 'rgb(180, 140, 10)' }}>{m('No refund')}</span> {m('if cancellation is made')} <span className="font-medium" style={{ color: isDark ? 'rgb(251, 191, 36)' : 'rgb(180, 140, 10)' }}>{m('less than 48 hours')}</span>.
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <div 
                  className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-1.5"
                  style={{ background: isDark ? 'rgb(220, 181, 21)' : 'rgb(180, 140, 10)' }}
                />
                <p className="text-xs leading-relaxed" style={textPrimary}>
                  <span className="font-medium" style={{ color: isDark ? 'rgb(251, 191, 36)' : 'rgb(180, 140, 10)' }}>{m('No ad-hoc guests will be accepted.')}</span>
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
                  {m('I have read and agree to the Terms & Conditions stated above')}
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
              {m('Back to Edit')}
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
                  {m('Processing...')}
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  {m('Confirm Booking Request')}
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
                {m('Please accept the Terms & Conditions to proceed with your booking')}
              </p>
            </div>
          )}
        </div>
      </div>
      {stepLoadingOverlay}
      {shortNoticeWarningDialog}
      {historyDialog}
      </>
    );
  }

  // ── Step 3: Add-on Services ───────────────────────────────────────────────
  if (currentStep === 3) {
    return (
      <>
      <form onSubmit={handleNextFromStep3} data-hkial-step="3">
        <div className="space-y-4 pb-8" data-hkial-step="3">
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
              {m('Step 3: Add-on Services')}
            </h1>
            <p className="text-xs mt-1" style={textMuted}>
              {m('Enhance your lounge experience with optional services')}
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
                  {m('Booking on behalf of')}{' '}
                  <strong>{prefillMember.title} {prefillMember.firstName} {prefillMember.lastName}</strong>
                </p>
                <p className="text-xs mt-0.5" style={{ color: isDark ? 'rgba(147,197,253,0.75)' : 'rgba(37,99,235,0.7)' }}>
                  {m("Vouchers deducted from this member's account")} · {m('Balance:')} {prefillMember.voucherCount} {m('vouchers')}
                </p>
              </div>
            </div>
          )}

          {/* ── Travel Agency Benefits Banner ───────────────────────────── */}
          {/* R6.2.100d (2026-07-02, Sky): Travel Agency "Pre-
              Negotiated Benefits Active" info banner removed
              (was 100% TA discount display — all mock data).
              TA-specific payment info is shown in the step 5
              final review's "Travel Agency Pricing & Payment"
              section. */}

          {/* ── Add-on Services ─────────────────────────────────────────── */}
          <div className="p-5" style={card}>
            <SectionHeader
              title={m('Add-on Services')}
              subtitle={m('Enhance your experience with optional services')}
            />

            {/* Lounge Extension */}
            <SubSectionLabel label="Extension of Stay in VIP Lounge (Hours)" />
            <StepperCard
              icon={<Clock className="w-5 h-5 text-white" />}
              iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
              title={m('Lounge Extension')}
              // R6.2.100c (2026-07-02) — show the per-product
              // breakdown for mixed bookings (1 PS + 1 LD
              // → "HK$4,000 per hour · HK$3,000 PS + HK$1,000 LD")
              // so the chip no longer reads the misleading
              // "HK$0 per hour" (R6.2.100b returned 0 for mixed).
              // Single-product bookings (PS-only or LD-only)
              // render only the total — the breakdown is
              // redundant when there's just one item.
              // R6.2.100d (2026-07-02, same day, Sky) — TA
              // discount path removed (mock data). All members
              // see the uniform catalog rate.
              subtitle={
                loungeRateBreakdownText
                  ? 'HK$' + loungeExtensionBaseRate.toLocaleString() + ' ' + m('per hour') + '  ·  ' + loungeRateBreakdownText
                  : 'HK$' + loungeExtensionBaseRate.toLocaleString() + ' ' + m('per hour')
              }
              value={step2Form.loungeExtension}
              onDecrement={() => updateStep2Count('loungeExtension', -1)}
              onIncrement={() => updateStep2Count('loungeExtension', 1)}
            />

            {/* Limousine Service */}
            <SubSectionLabel label="Airport Limousine Transfer Service" />
            <StepperCard
              icon={<Car className="w-5 h-5 text-white" />}
              iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
              title={m('Limousine Service')}
              subtitle={'HK$1,500 ' + m('per vehicle')}
              value={step2Form.limousineService}
              onDecrement={() => updateStep2Count('limousineService', -1)}
              onIncrement={() => updateStep2Count('limousineService', 1)}
              addonKey="limousine"
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
                    ⚠️ {m('Extra charges will apply if waiting time is exceeded at pick-up point.')}
                  </div>
                )}
                <div
                  className="p-3 rounded-lg text-sm"
                  style={{
                    background: isDark ? 'rgba(220,181,21,0.1)' : 'rgba(220,181,21,0.15)',
                    border: isDark ? '1px solid rgba(220,181,21,0.3)' : '1px solid rgba(220,181,21,0.4)',
                    color: isDark ? 'rgba(220,181,21,1)' : 'rgba(180,145,17,1)',
                  }}
                >
                  ⚠️ {m('Extra charges will apply for additional stops and child car seats.')}
                </div>
                {step2Form.destinationAddresses.map((address, index) => (
                  <div key={index}>
                    <label className={labelClass}>
                      {step2Form.limousineService > 1
                        ? m('Destination / Pick-up Point #{n}').replace('{n}', String(index + 1))
                        : m('Destination / Pick-up Point')}{' '}
                      *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => handleDestinationAddressChange(index, e.target.value)}
                        required
                        placeholder={m('Enter destination or pick-up point')}
                        style={fieldStyle}
                        className={fieldClass + ' pl-10'}
                      />
                    </div>
                  </div>
                ))}
                {form.flightType === 'Departure' && (
                  <div>
                    <label className={labelClass}>{m('Pick-up Time *')}</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
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
                      <label className={labelClass}>
                        {m('Additional Stop #{n}').replace('{n}', String(index + 1))}
                      </label>
                      <button type="button" onClick={() => removeStop(index)} className="text-xs text-red-400 hover:text-red-300 transition-colors">{m('Remove')}</button>
                    </div>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <input
                        type="text"
                        value={stop}
                        onChange={(e) => handleStopChange(index, e.target.value)}
                        placeholder={m('Enter stop address')}
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
                  {m('Add Stop')}
                </button>
              </div>
            )}

            {/* Wheelchair Service */}
            <SubSectionLabel label="Wheelchair Service" />
            <StepperCard
              icon={<Accessibility className="w-5 h-5 text-white" />}
              iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
              title={m('Wheelchair Assistance')}
              subtitle={m('Free')}
              value={step2Form.wheelchairService}
              onDecrement={() => updateStep2Count('wheelchairService', -1)}
              onIncrement={() => updateStep2Count('wheelchairService', 1)}
              addonKey="wheelchair"
              testId="wheelchair-service"
            />

            {step2Form.wheelchairService > 0 && (
              <div className="mt-3 space-y-3" data-hkial-figma-wheelchair-names>
                {Array.from({ length: step2Form.wheelchairService }, (_, i) => {
                  const selectedName = step2Form.wheelchairPassengerNames[i] ?? '';
                  const takenNames = new Set(
                    step2Form.wheelchairPassengerNames
                      .map((n, idx) => (idx === i ? '' : n))
                      .filter(Boolean),
                  );
                  const options = bookingGuestNames.slice();
                  if (selectedName && !options.includes(selectedName)) {
                    options.unshift(selectedName);
                  }
                  return (
                  <div key={i}>
                    <label className={labelClass} style={labelStyle}>{m('Passenger {n} Name').replace('{n}', String(i + 1))} *</label>
                <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <select
                        value={selectedName}
                        onInput={(e) => {
                          commitWheelchairPassengerName(
                            i,
                            (e.target as HTMLSelectElement).value,
                          );
                        }}
                        onChange={(e) => {
                          commitWheelchairPassengerName(i, e.target.value);
                        }}
                    required
                        data-hkial-wheelchair-name-index={String(i)}
                        data-hkial-wheelchair-name-select=""
                    style={fieldStyle}
                        className={fieldClass + ' appearance-none pl-10 pr-10 cursor-pointer'}
                      >
                        <option value="" className={optionBg} style={optionStyle}>
                          {bookingGuestNames.length === 0
                            ? m('No named guests yet — add names in Step 2')
                            : m('Select guest name')}
                        </option>
                        {options.map((name) => (
                          <option
                            key={name}
                            value={name}
                            className={optionBg}
                            style={optionStyle}
                            disabled={takenNames.has(name)}
                          >
                            {name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                  </div>
                  );
                })}
              </div>
            )}

            {/* Security Service */}
            <SubSectionLabel label="Security Service" />
            <ToggleCard
              icon={<Shield className="w-5 h-5 text-white" />}
              iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
              title={m('Security Escort Service')}
              subtitle={m('Personal security personnel')}
              checked={step2Form.securityService}
              onChange={(v) => setStep2Form((p) => ({ ...p, securityService: v }))}
              addonKey="security"
            />

            {step2Form.securityService && (
              <div
                className="mt-3 p-3 rounded-lg text-sm"
                data-testid="security-escort-price-note"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(231,230,221,0.5)',
                  border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(200,199,190,0.4)',
                  color: colors.textSecondary,
                }}
              >
                {m('To be confirmed')}
              </div>
            )}
          </div>

          {catalogAddonSlot}

          {/* ── Navigation Buttons ──────────────────────────────────────── */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={handleBackToStep2}
              className="py-3 px-6 rounded-xl text-sm transition-all hover:opacity-80 flex items-center justify-center gap-2"
              style={backBtnStyle}
            >
              <ArrowLeft className="w-4 h-4" />
              {m('Back')}
            </button>
            <button
              type="submit"
              className="py-3 px-6 rounded-xl text-white text-sm transition-all hover:opacity-90 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(90deg, rgb(220, 181, 21) 0%, rgb(180, 140, 10) 100%)' }}
            >
              {m('Next: Other Information')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </form>
      {stepLoadingOverlay}
      {shortNoticeWarningDialog}
      {historyDialog}
      </>
    );
  }

  // ── Step 4: Other Information & Checkout ─────────────────────────────────
  if (currentStep === 4) {
    // Must be defined in this scope — Complete Booking Summary maps Lane B
    // catalog rows. Pre-fix only defined reviewCatalogAddonLines inside
    // currentStep === 5, which threw ReferenceError and blanked Step 4.
    const { addonLines: step4AddonLines } = getPriceSectionPrices(pricePreview);
    const reviewCatalogAddonLines = filterLaneBCatalogAddonLines(step4AddonLines);

    // Round 6.2.140 — membership benefits card styles (readable end-customer copy).
    const membershipBenefitsBg = isDark ? 'rgba(220,181,21,0.08)' : 'rgba(220,181,21,0.06)';
    const membershipBenefitsBorder = '1px solid rgba(220,181,21,0.35)';
    const summaryLuggageValue =
      step2Form.luggageCount +
      ' ' +
      (step2Form.luggageCount !== 1 ? m('pieces') : m('piece'));

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
              {m('Step 4: Other Information &amp; Checkout')}
            </h1>
            <p className="text-xs mt-1" style={textMuted}>
              {m('Add luggage info, membership vouchers, and contact details')}
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
                  {m('Booking on behalf of')}{' '}
                  <strong>{prefillMember.title} {prefillMember.firstName} {prefillMember.lastName}</strong>
                </p>
                <p className="text-xs mt-0.5" style={{ color: isDark ? 'rgba(147,197,253,0.75)' : 'rgba(37,99,235,0.7)' }}>
                  {m("Vouchers deducted from this member's account")} · {m('Balance:')} {prefillMember.voucherCount} {m('vouchers')}
                </p>
              </div>
            </div>
          )}


          {/* ── Other Information ───────────────────────────────────────── */}
          <div className="p-5" style={card}>
            <SectionHeader
              title={m('Other Information')}
              subtitle={m('Additional travel details')}
            />

            {/* Luggage Count */}
            <SubSectionLabel label="Number of Luggage" />
            <StepperCard
              icon={<Package className="w-5 h-5 text-white" />}
              iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
              title={m('Luggage Count')}
              subtitle={m('Number of luggage pieces')}
              value={step2Form.luggageCount}
              onDecrement={() => updateStep2Count('luggageCount', -1)}
              onIncrement={() => updateStep2Count('luggageCount', 1)}
            />

            {/* Private Transport */}
            <SubSectionLabel label="Private Transport" />
            <StepperCard
              icon={<Car className="w-5 h-5 text-white" />}
              iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
              title={m('Private Transport')}
              subtitle={m('Arriving with own vehicle')}
              value={step2Form.privateTransport}
              onDecrement={() => updateStep2Count('privateTransport', -1)}
              onIncrement={() => updateStep2Count('privateTransport', 1)}
              addonKey="private-transport"
              testId="private-transport"
            />

            {step2Form.privateTransport > 0 && (
              <div className="mt-4 space-y-5">
                {step2Form.vehicles.map((vehicle, idx) => {
                  const updateVehicle = (field: keyof typeof vehicle, value: string) => {
                    setStep2Form((p) => {
                      const updated = [...p.vehicles];
                      updated[idx] = { ...updated[idx], [field]: field === 'carPlateNo' ? value.toUpperCase() : value };
                      return { ...p, vehicles: updated };
                    });
                  };
                  return (
                    <div key={idx} className="rounded-xl p-4 space-y-4" style={{ border: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(200,199,190,0.4)', background: isDark ? 'rgba(255,255,255,0.02)' : 'rgba(231,230,221,0.3)' }}>
                      {step2Form.privateTransport > 1 && (
                        <div className="text-xs font-medium" style={{ color: 'rgb(220,181,21)' }}>Vehicle {idx + 1}</div>
                      )}
                {/* Driver Information */}
                <div>
                        <div className="text-xs mb-3" style={textPrimary}>{m('Driver Information')}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                            <label className={labelClass}>{m('Driver Name *')}</label>
                      <div className="relative">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input
                          type="text"
                                value={vehicle.driverName}
                                onChange={(e) => updateVehicle('driverName', e.target.value)}
                          required
                                placeholder={m('Driver name')}
                          style={fieldStyle}
                          className={fieldClass + ' pl-10'}
                        />
                      </div>
                    </div>
                    <div>
                            <label className={labelClass}>{m('Driver Contact *')}</label>
                      <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input
                          type="text"
                                value={vehicle.driverContact}
                                onChange={(e) => updateVehicle('driverContact', e.target.value)}
                          required
                                placeholder={m('+852 XXXX XXXX')}
                          style={fieldStyle}
                          className={fieldClass + ' pl-10'}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                {/* Private Car */}
                <div>
                        <div className="text-xs mb-3" style={textPrimary}>{m('Private Car')}</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                            <label className={labelClass}>{m('Car Plate No. *')}</label>
                      <div className="relative">
                              <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        <input
                          type="text"
                                value={vehicle.carPlateNo}
                                onChange={(e) => updateVehicle('carPlateNo', e.target.value)}
                          required
                                placeholder={m('e.g. HK1234')}
                          style={fieldStyle}
                          className={fieldClass + ' pl-10 uppercase'}
                        />
                      </div>
                    </div>
                      </div>
                    </div>
                  </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Membership benefits (round 6.2.140) ──────────────────────── */}
          {isEligibleIndividualMembership && (
          <div
            className="p-5 rounded-xl"
            style={{ background: membershipBenefitsBg, border: membershipBenefitsBorder }}
            data-testid="membership-benefits-card"
          >
            <div className="flex items-center gap-2 mb-1">
                <BadgeCheck className="w-4 h-4" style={{ color: 'rgb(220,181,21)' }} />
              <span className="text-sm" style={textPrimary}>{m('Your membership benefits for this booking')}</span>
              </div>
            <p className="text-xs mb-4" style={textMuted}>
              {m('You can choose whether to use your free credits on this booking. Unchecking keeps the credit for later. Membership does not add a percentage discount — free entries and free suite upgrades only.')}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="rounded-lg px-3 py-2.5" style={{ background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.7)' }}>
                <p className="text-xs mb-0.5" style={textMuted}>{m('Free Lounge Deluxe entries')}</p>
                <p className="text-sm font-medium" style={textPrimary} data-testid="membership-ld-remaining">
                  {formatFreeCreditRemaining(freeLdRemaining)}
                </p>
            </div>
              <div className="rounded-lg px-3 py-2.5" style={{ background: isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.7)' }}>
                <p className="text-xs mb-0.5" style={textMuted}>{m('Free Premiere Suite upgrades')}</p>
                <p className="text-sm font-medium" style={textPrimary} data-testid="membership-ps-remaining">
                  {formatFreeCreditRemaining(freePsRemaining)}
                </p>
            </div>
                  </div>

            <div className="space-y-3">
              <label
                className={`flex items-start gap-3 text-sm ${canUseFreeLd ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
              >
                <input
                  type="checkbox"
                  className="mt-1"
                  data-testid="use-membership-ld-free"
                  checked={useMembershipLdFree}
                  disabled={!canUseFreeLd}
                  onChange={(e) => {
                    const on = e.target.checked;
                    setUseMembershipLdFree(on);
                    if (!on) setUseMembershipPsFree(false);
                  }}
                />
                <span>
                  <span className="font-medium" style={textPrimary}>{m('Use free Lounge Deluxe entry on this booking')}</span>
                  <span className="block text-xs mt-0.5" style={textMuted}>
                    {m('For a Lounge Deluxe-only booking, this waives one Lounge Deluxe base fee when you still have free entries (or Unlimited). For a Premiere Suite booking, the membership 40% off Suite base also requires this credit (it uses one free Lounge Deluxe entry). Turn off to keep the free entry — Premiere Suite then charges the full base price.')}
                    {!canUseFreeLd ? ` ${m('You have no free Lounge Deluxe entries left.')}` : ''}
                      </span>
                      </span>
              </label>

              <label
                className={`flex items-start gap-3 text-sm ${canUseFreePs ? 'cursor-pointer' : 'opacity-60 cursor-not-allowed'}`}
              >
                <input
                  type="checkbox"
                  className="mt-1"
                  data-testid="use-membership-ps-free"
                  checked={useMembershipPsFree}
                  disabled={!canUseFreePs}
                  onChange={(e) => setUseMembershipPsFree(e.target.checked)}
                />
                <span>
                  <span className="font-medium" style={textPrimary}>{m('Use free Premiere Suite upgrade on this booking')}</span>
                  <span className="block text-xs mt-0.5" style={textMuted}>
                    {m('For a Premiere Suite booking, a free upgrade uses one free Suite upgrade and one free Lounge Deluxe entry together — you cannot use the Suite credit alone. If you turn this off (or have no free upgrade left), you can still get about 40% off the Premiere Suite base price — but only when the free Lounge Deluxe entry credit above is checked (that uses one LD entry). If the Lounge Deluxe credit is unchecked, or you have no LD entries left, you pay the full Premiere Suite base.')}
                    {!bookingIncludesPremiereSuite ? ` ${m('Add a Premiere Suite to this booking to use a free Suite upgrade.')}` : ''}
                    {bookingIncludesPremiereSuite && canUseFreeLd && !useMembershipLdFree ? ` ${m('Check the Lounge Deluxe credit above first — a free Suite upgrade cannot be used on its own.')}` : ''}
                    {bookingIncludesPremiereSuite && useMembershipLdFree && !hasFreeCreditAvailable(freePsRemaining) ? ` ${m('You have no free Premiere Suite upgrades left.')}` : ''}
                        </span>
                        </span>
              </label>
                </div>

            {(form.premiereSuites > 0 && (form.vipPassengers > 0 || form.nonFlyingGuests > 0)) && (
              <p className="text-xs mt-3" style={textMuted}>
                {m('Note: when this booking includes both Lounge Deluxe and Premiere Suite and both credits are on, only the free Premiere Suite upgrade applies (the Lounge Deluxe room is charged). That upgrade uses one Suite credit and one Lounge Deluxe entry together.')}
              </p>
                )}
              </div>
            )}

          {/* ── Payment & Billing (Travel Agency) / Promotion / Redemption Code (others) ── */}
          {isTravelAgency ? (
            <div className="p-5" style={card}>
              <div className="flex items-center gap-2 mb-1">
                <Banknote className="w-4 h-4 text-green-400" />
                <div className="text-sm" style={textPrimary}>{m('Payment & Billing')}</div>
              </div>
              <div className="text-xs mb-4" style={textMuted}>
                {m('Pre-negotiated payment terms applied automatically for your agency account')}
              </div>

              {/* Payment Method – locked for TA */}
              <div className="mb-4">
                <label className={labelClass}>{m('Payment Method')}</label>
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
                      {m('Auto-applied · Invoice issued within 3 business days')}
                    </div>
                  </div>
                  <Shield className="w-4 h-4 flex-shrink-0" style={{ color: isDark ? '#34d399' : 'rgb(5, 150, 105)' }} />
                </div>
              </div>

              {/* Billing Reference */}
              <div className="mb-4">
                <label className={labelClass}>{m('Agency Billing Reference')}</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={step2Form.billingReference}
                    onChange={(e) =>
                      setStep2Form((p) => ({ ...p, billingReference: e.target.value.toUpperCase() }))
                    }
                    placeholder={agencyBillingCode || TA_AGENCY_CODE}
                    style={fieldStyle}
                    className={fieldClass + ' pl-10 uppercase'}
                  />
                </div>
                <div className="text-xs mt-1.5" style={textMuted}>
                  {m('Pre-filled from your agency profile. You may override if booking under a sub-account.')}
                </div>
              </div>

              {/* Credit terms info */}
              <div
                className="rounded-lg px-4 py-3"
                style={creditTermsBoxBg}
              >
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { label: m('Credit Terms'), value: 'Net 30 days' },
                    { label: m('Currency'), value: 'HKD' },
                    { label: m('Invoice Delivery'), value: 'Email (auto)' },
                    { label: m('GST / VAT'), value: 'Exempt (B2B)' },
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
              <div className="text-sm mb-1" style={textPrimary}>{m('Promotion / Redemption Code')}</div>
              <div className="text-xs mb-4" style={textMuted}>{m('Apply a promo code for discounts')}</div>
              <div>
                <label className={labelClass}>{m('Promotion / Redemption Code (Optional)')}</label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={step2Form.promotionCode}
                    onChange={(e) =>
                      setStep2Form((p) => ({ ...p, promotionCode: e.target.value.toUpperCase() }))
                    }
                    placeholder={m('e.g. HKIAL2024')}
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
                    title={m('Scan coupon QR code with camera')}
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
                    <span>{m('Code')} <strong>{step2Form.promotionCode}</strong> {m('is valid and will be applied to your booking.')}</span>
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
                    <span>
                      {promoCodeMessage
                        ? m(promoCodeMessage)
                        : <>{m('Code')} <strong>{step2Form.promotionCode}</strong> {m('is invalid. Please check and try again.')}</>}
                    </span>
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
                    ⚠️ <span>{m('Code')} <strong>{step2Form.promotionCode}</strong> {m('has already been used or expired.')}</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5 mt-2">
                  <Camera className={`w-3 h-3 ${iconMutedClass}`} />
                  <span className="text-xs" style={textMuted}>
                    {m('Tap the camera icon to scan your coupon QR code')}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* ── Contact Person ──────────────────────────────────────────── */}
          <div className="p-5" style={card}>
            <div className="text-sm mb-1" style={textPrimary}>{m('Contact Person of this Booking')}</div>
            <div className="text-xs mb-4" style={textMuted}>{m('Primary contact for this reservation')}</div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className={labelClass}>{m('Name *')}</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={step2Form.contactName}
                    onChange={(e) =>
                      setStep2Form((p) => ({ ...p, contactName: e.target.value }))
                    }
                    required
                    placeholder={m('Full name')}
                    style={fieldStyle}
                    className={fieldClass + ' pl-10'}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>{m('Contact Email *')}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    value={step2Form.contactEmail}
                    onChange={(e) =>
                      setStep2Form((p) => ({ ...p, contactEmail: e.target.value }))
                    }
                    required
                    placeholder={m('email@example.com')}
                    style={fieldStyle}
                    className={fieldClass + ' pl-10'}
                  />
                </div>
              </div>
              <div>
                <label className={labelClass}>{m('Contact No. *')}</label>
                {/* 2026-06-24 (Sky) — split the contact number into a
                    type-ahead region code combobox + a digits/dash
                    number input. The combined value is kept in sync
                    on `step2Form.contactNo` so the wire shape (and
                    the existing api.ts `data.services?.contactNo`
                    path) doesn't change. */}
                <ContactNoSplit
                  regionCode={step2Form.regionCode}
                  contactNumber={step2Form.contactNumber}
                  onRegionCodeChange={(code) =>
                    setStep2Form((p) => ({
                      ...p,
                      regionCode: code,
                      contactNo: combineContactNo(code, p.contactNumber),
                    }))
                  }
                  onContactNumberChange={(num) =>
                    setStep2Form((p) => ({
                      ...p,
                      contactNumber: num,
                      contactNo: combineContactNo(p.regionCode, num),
                    }))
                  }
                  fieldStyle={fieldStyle}
                  fieldClass={fieldClass}
                  isDark={isDark}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>{m('Booking Memo')}</label>
              <div className="relative">
                <FileText className="absolute left-3 top-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
                <textarea
                  value={step2Form.bookingMemo}
                  onChange={(e) =>
                    setStep2Form((p) => ({ ...p, bookingMemo: e.target.value }))
                  }
                  rows={4}
                  placeholder={m('Any special requests or notes for this booking…')}
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
              <div className="text-sm" style={textPrimary}>{m('Complete Booking Summary')}</div>
            </div>
            <div className="p-5">
              <div className={`divide-y ${dividerClass}`}>
                <SummaryRow label={m('Flight Number')} value={form.flightNumber || '—'} />
                {/* 2026-06-08 (round 6.2.8): Origin shown for both
                    Arrival and Transit (the form's leg 1 = inbound to
                    HKG). Departure mode omits Origin (no inbound). */}
                {(form.flightType === 'Arrival' || form.flightType === 'Transit') && (
                  <SummaryRow label={m('Origin')} value={form.origin ? formatAirportDisplay(form.origin, dateLocale) : '—'} />
                )}
                {/* 2026-06-08 (round 6.2.7): mode-aware — "Departure Date"
                    when flightType === 'Departure', "Arrival Date" otherwise.
                    Mirrors the change in the Flight Information review
                    section and the Step 1 form. */}
                  <SummaryRow
                  label={form.flightType === 'Departure' ? m('Departure Date') : m('Arrival Date')}
                  value={formatDate(form.date)}
                />
                <SummaryRow label={m('Flight Class')} value={form.flightClass} />
                <SummaryRow label={m('Flight Type')} value={form.flightType} />
                {flightDetails && form.flightType !== 'Departure' && (
                  <SummaryRow label={m('Arrival Time')} value={flightDetails.arrivalTime} />
                )}

                {/* 2026-06-08 (round 6.2.8+): Transit 2-leg sub-section
                    on the Complete Booking Summary. Each Transit
                    booking needs to show both legs so the user
                    confirms all 5 outbound fields (date, time, flight
                    no, destination, class) before final review. */}
                {form.flightType === 'Transit' && (
                  <>
                    <SummaryRow
                      label="Leg 2 Departure Date"
                      value={leg2ArrivalDate?.split('T')[0] ? formatDate(leg2ArrivalDate.split('T')[0]) : '—'}
                    />
                    <SummaryRow
                      label="Leg 2 Departure Time"
                      value={leg2ArrivalDate?.split('T')[1]?.slice(0, 5) || '—'}
                    />
                    <SummaryRow label="Leg 2 Flight Number" value={leg2FlightNo || '—'} />
                    <SummaryRow label="Leg 2 Destination" value={leg2Destination ? formatAirportDisplay(leg2Destination, dateLocale) : '—'} />
                    <SummaryRow label="Leg 2 Flight Class" value={leg2FlightClass || '—'} />
                  </>
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
                    value={`${step2Form.loungeExtension} ${
                      step2Form.loungeExtension !== 1 ? m('hours') : m('hour')
                    }`}
                  />
                )}
                {step2Form.limousineService > 0 && (
                  <SummaryRow
                    label="Limousine Service"
                    value={`${step2Form.limousineService} ${
                      step2Form.limousineService !== 1 ? m('vehicles') : m('vehicle')
                    }`}
                  />
                )}
                {step2Form.wheelchairService > 0 && (
                  <SummaryRow
                    label="Wheelchair Service"
                    value={String(step2Form.wheelchairService)}
                  />
                )}
                {reviewCatalogAddonLines.map((line, idx) => (
                  <SummaryRow
                    key={`summary-catalog-${line.label}-${idx}`}
                    label={priceLineLabel(line.label)}
                    value={`× ${line.qty > 0 ? line.qty : 1} · HK$${line.subtotal.toLocaleString()}`}
                  />
                ))}
                {step2Form.securityService && (
                  <SummaryRow
                    label={m('Security Escort Service')}
                    value={m('To be confirmed')}
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
                {isEligibleIndividualMembership && (
                  <SummaryRow
                    label="Free Lounge Deluxe entry"
                    value={useMembershipLdFree ? 'Using for this booking' : 'Not using (kept for later)'}
                  />
                )}
                {isEligibleIndividualMembership && (
                  <SummaryRow
                    label="Free Premiere Suite upgrade"
                    value={useMembershipPsFree ? 'Using for this booking' : 'Not using (kept for later)'}
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
              {m('Back')}
            </button>
            <button
              type="submit"
              className="py-3 px-6 rounded-xl text-white text-sm transition-all hover:opacity-90 flex items-center justify-center gap-2"
              style={{ background: 'linear-gradient(90deg, rgb(220, 181, 21) 0%, rgb(180, 140, 10) 100%)' }}
            >
              {m('Final Review')}
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
      {shortNoticeWarningDialog}
      {historyDialog}
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
              <h1 className="text-xl" style={gradientTextS1}>{m('Step 1: Flight Information')}</h1>
              <p className="text-xs mt-1" style={textMuted}>
                {m('Reserve your lounge experience at Hong Kong International Airport')}
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {isTravelAgency && (
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg"
                  style={{ background: taBadgeBgS1, border: taBadgeBorderS1 }}
                >
                  <BadgeCheck className="w-3.5 h-3.5" style={{ color: isDark ? '#34d399' : 'rgb(5, 150, 105)' }} />
                  <span className="text-xs" style={{ color: isDark ? '#6ee7b7' : 'rgb(5, 150, 105)' }}>{m('TA Rates Active')}</span>
                </div>
              )}
              <button
                type="button"
                data-testid="use-history-button"
                onClick={handleOpenHistoryDialog}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all hover:opacity-90"
                style={{ background: histBtnBgS1, border: histBtnBorderS1, color: histBtnColorS1 }}
              >
                <History className="w-3.5 h-3.5 flex-shrink-0" />
                <span className="hidden sm:inline">{m('Use History as New Booking')}</span>
                <span className="sm:hidden">{m('Use History')}</span>
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
                  {m('Booking on behalf of')}{' '}
                  <strong>{prefillMember.title} {prefillMember.firstName} {prefillMember.lastName}</strong>
                </p>
                <p className="text-xs mt-0.5" style={{ color: memberBannerSubS1 }}>
                  {m('Membership:')} {m(prefillMember.membershipLabel)}
                  {' · '}
                  {m('Voucher balance:')} {prefillMember.voucherCount}{' '}
                  {prefillMember.voucherCount !== 1 ? m('vouchers') : m('voucher')}
                  {' '}{m("(booking vouchers deducted from this member's account)")}
                </p>
              </div>
            </div>
          )}

          {/* Flight Information card */}
          <div className="p-5" style={card}>
            <SectionHeader title={m('Flight Information')} />

            {/* Flight Type toggle */}
            <div className="mb-4">
              <label className={labelClass}>{m('Flight Type *')}</label>
              <div className="grid grid-cols-2 gap-3">
                {(['Arrival', 'Departure'] as const).map((type) => {
                  const active = form.flightType === type;
                  const planeRotation = type === 'Arrival' ? 'rotate(180deg)' : 'none';
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
                      <span className="text-sm" style={{ color: ftLabelColor }}>{m(type)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Flight Number — 2026-06-08 (round 6.2.7): moved to the top
                of the section, right after the Flight Type toggle. The
                user wanted Flight Number to be the first field the user
                sees / fills, so it sits above date/time/origin.
                2026-08-18 (round — Cirium Sky API migration, Task 11):
                Lookup button added next to the input. Mirrors the
                admin CreateBooking.tsx shape (testid
                `create-flight-lookup` → `customer-lookup-flight` for
                the customer surface). Gated on `flightNumber` trim
                + `form.date` (the backend's `date_format:Y-m-d`
                validator). Calls `flightsApi.lookupFlight` and
                populates flight_time / origin / destination on success. */}
            <div className="mb-4">
              <label className={labelClass}>{m('Flight Number *')}</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                    value={form.flightNumber}
                    onChange={(e) => handleFlightNumber(e.target.value)}
                    required
                    placeholder={m('e.g. CX888')}
                    style={fieldStyle}
                    className={fieldClass + ' pl-10 uppercase'}
                  />
                </div>
                <button
                  type="button"
                  data-testid="customer-lookup-flight"
                  disabled={flightLookupLoading || !form.flightNumber.trim() || !form.date}
                  title={!form.date ? m('Select flight date first') : m('Lookup flight details')}
                  onClick={handleFlightLookup}
                  className="shrink-0 px-3 py-2 text-sm font-medium border border-gray-300 rounded-md bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1.5"
                >
                  {flightLookupLoading
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Search className="w-3.5 h-3.5" />}
                  {m('Lookup')}
                </button>
              </div>
            </div>

            {/* Arrival Date — 2026-06-08 (round 6.2.7): label is mode-aware.
                "Arrival Date" when flightType is Arrival or Transit (the
                flight is inbound to HKG), "Departure Date" when flightType
                is Departure (the flight is outbound from HKG). */}
            <div className="mb-4">
              <label className={labelClass}>
                {form.flightType === 'Departure' ? m('Departure Date') : m('Arrival Date')} *
              </label>
              <div className="relative">
                <input
                  type="date" lang={DATE_INPUT_LANG}
                  value={form.date}
                  min={hktTodayYmd()}
                  onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
                  required
                  style={fieldStyle}
                  className={fieldClass + ' pr-10'}
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Arrival Time / Departure Time — 2026-06-08 (reactive fix)
                leg 1 flight time. Backend's TransitLegsRule rejects
                legs[0] as missing flightTime when flightType=Transit.
                Backend's `flight_time` validator (top-level,
                MemberBookingController L100) is `nullable|string|max:10`
                so non-Transit bookings can submit without a time, but
                Transit requires it. Reuses the same field for non-Transit
                top-level flight_time via the existing data.time path.
                2026-06-08 (round 6.2.7): label is mode-aware — same logic
                as the date field above. */}
            <div className="mb-4">
              <label className={labelClass}>
                {form.flightType === 'Departure' ? m('Departure Time') : m('Arrival Time')} *
              </label>
              <Time5MinSelect
                value={leg1FlightTime}
                onChange={setLeg1FlightTime}
                  required
                wrapperStyle={fieldStyle}
                wrapperClassName={fieldClass}
                testId="leg1-flightTime"
              />
            </div>

            {/* Origin (Arrival + Transit) — 2026-06-08 (round 6.2.8):
                Transit was showing "Destination" here before, but the
                step-1 form is the inbound leg (leg 1 = inbound to HKG),
                so the relevant field is where the passenger is coming
                FROM, i.e. the origin. The leg-2 block handles the
                outbound destination separately. Departure mode keeps
                showing Destination (since the only flight is outbound
                from HKG to a destination). */}
            {(form.flightType === 'Arrival' || form.flightType === 'Transit') && (
              <div className="mb-4">
                <label className={labelClass} htmlFor="new-booking-origin">{m('Origin *')}</label>
                <AirportTypeahead
                  id="new-booking-origin"
                  name="origin"
                  value={form.origin}
                  onChange={(code) => {
                    setForm((p) => ({ ...p, origin: code }));
                    setFlightDetails((fd) => (fd ? { ...fd, origin: code } : fd));
                  }}
                  required={form.flightType === 'Arrival' || form.flightType === 'Transit'}
                  placeholder={m('Search IATA or city (e.g. LHR, Tokyo)')}
                  style={fieldStyle}
                  className={fieldClass + ' pl-10 pr-8'}
                  listStyle={glassStyle}
                  highlightClassName={isDark ? 'bg-white/10' : 'bg-black/5'}
                  mutedClassName={isDark ? 'text-gray-400' : 'text-[rgb(160,159,148)]'}
                  data-testid="new-booking-origin"
                />
              </div>
            )}

            {/* Flight Info Found — 2026-06-08 (round 6.2.7): time field is
                hidden in Departure mode. flightDatabase only stores
                `arrivalTime` (inbound arrival at HKG); showing that value
                as "Departure Time" in Departure mode is misleading. The
                flightDatabase needs to be extended with departureTime
                entries to bring this field back in Departure mode. */}
            {flightDetails && (
              <div
                className="rounded-lg p-3 mb-4"
                style={{ background: flightFoundBgS1, border: flightFoundBorderS1 }}
              >
                <div className="flex items-center gap-1.5 text-xs mb-2" style={{ color: flightFoundColorS1 }}>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{m('Flight Information Found')}</span>
                </div>
                <div
                  className={`grid gap-1 text-xs ${form.flightType === 'Departure' ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-1 md:grid-cols-3'}`}
                >
                  <div><span style={textMuted}>{m('Origin:')} </span><span style={textPrimary}>{formatAirportDisplay(flightDetails.origin, dateLocale)}</span></div>
                  <div><span style={textMuted}>{m('Destination:')} </span><span style={textPrimary}>{formatAirportDisplay(flightDetails.destination, dateLocale)}</span></div>
                  {form.flightType !== 'Departure' && (
                    <div>
                      <span style={textMuted}>{m('Arrival Time:')} </span>
                      <span style={{ color: flightFoundTimeColorS1 }}>{flightDetails.arrivalTime}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Destination (Departure only) — 2026-06-08 (round 6.2.8):
                Transit no longer shows Destination here (the form
                represents leg 1 = inbound to HKG, which needs origin
                not destination). The Transit leg 2 block now carries
                its own Destination field for the outbound leg. */}
            {form.flightType === 'Departure' && (
              <div className="mb-4">
                <label className={labelClass} htmlFor="new-booking-destination">{m('Destination *')}</label>
                <AirportTypeahead
                  id="new-booking-destination"
                  name="destination"
                    value={form.destination}
                  onChange={(code) => {
                    setForm((p) => ({ ...p, destination: code }));
                    setFlightDetails((fd) => (fd ? { ...fd, destination: code } : fd));
                  }}
                    required
                  placeholder={m('Search IATA or city (e.g. LHR, Tokyo)')}
                    style={fieldStyle}
                  className={fieldClass + ' pl-10 pr-8'}
                  listStyle={glassStyle}
                  highlightClassName={isDark ? 'bg-white/10' : 'bg-black/5'}
                  mutedClassName={isDark ? 'text-gray-400' : 'text-[rgb(160,159,148)]'}
                  data-testid="new-booking-destination"
                />
              </div>
            )}

            {/* Flight Class */}
            <div>
              <label className={labelClass}>{m('Flight Class of Main VIP Passenger *')}</label>
              <div className="relative">
                <select
                  value={form.flightClass}
                  onChange={(e) => setForm((p) => ({ ...p, flightClass: e.target.value }))}
                  required
                  style={fieldStyle}
                  className={fieldClass + ' appearance-none pr-10 cursor-pointer'}
                >
                  <option value="Economy Class" className={optionBg}>{m('Economy Class')}</option>
                  <option value="Business Class" className={optionBg}>{m('Business Class')}</option>
                  <option value="First Class" className={optionBg}>{m('First Class')}</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* 2026-06-08 — Transit 2nd leg block (I-T2, Q5B). Only visible
                when flightType === 'Transit'. The 1st leg is the existing
                date/flightNumber/flightClass above. The 2nd leg is the
                outbound flight; backend's TransitLegsRule requires 4 fields
                + 6h gap. Mirrors admin figma-ui's transit-leg2-block.

                2026-06-08 (round 6.2.7): layout simplified to match the
                1-leg section — each field is a full-width single column
                (no `grid grid-cols-2`). The combined "Arrival Date & Time"
                datetime-local is split into a separate date input and a
                separate time input. The state model is unchanged:
                leg2ArrivalDate stays a `YYYY-MM-DDTHH:MM` string so the
                submit payload, the 6h-gap validation handler, and
                api.ts wire shape all keep working.

                2026-06-08 (round 6.2.8): per Sky's spec, the field
                labels are now "Leg 2 Departure Date" / "Leg 2 Departure
                Time" (leg 2 is the outbound flight from HKG, so its
                timestamp is the departure time at HKG, not arrival at
                the next destination). The 6h-gap rule still reads
                `legs[1].departureDate - legs[0].arrivalDate`. Field
                order changed per Sky: Flight Number now sits at the
                top, then Departure Date, then Departure Time, then
                the new Leg 2 Destination field, then Flight Class. */}
            {form.flightType === 'Transit' && (
              <div className="mt-5 pt-5" style={{ borderTop: borderSubtle }} data-testid="transit-leg2-block">
                <h3 className="text-sm font-semibold mb-1" style={textPrimary}>
                  {m('2nd Flight (Outbound)')} <span>*</span>
                </h3>
                <p className="text-xs mb-4" style={textMuted}>
                  {m('The 2nd leg of your transit. The 1st leg (above) is your inbound to HKG; this is your outbound.')}
                  {' '}
                  {m('Gap between leg 1 arrival and leg 2 departure must be at least 6 hours.')}
                </p>

                {/* 6h-gap pre-check handler. Called by the date/time
                    inputs whenever the combined value changes. Backend
                    TransitLegsRule is the source of truth; this is the
                    UX layer. */}
                {/* Leg 2 Flight Number — full width, top of section
                    (round 6.2.8 reorder per Sky). */}
                <div className="mb-4">
                  <label className={labelClass}>{m('Leg 2 Flight Number')} <span>*</span></label>
                <div className="relative">
                    <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  <input
                    type="text"
                      value={leg2FlightNo}
                      onChange={(e) => setLeg2FlightNo(e.target.value.toUpperCase())}
                      placeholder={m('e.g. CX889')}
                    style={fieldStyle}
                    className={fieldClass + ' pl-10 uppercase'}
                      data-testid="leg2-flightNo"
                  />
                </div>
                </div>

                {/* Leg 2 Departure Date — full width. 2026-06-08 (round
                    6.2.8): renamed from "Arrival Date" to "Departure
                    Date" because leg 2 is the outbound flight.
                    2026-06-28 (round 6.2.98): inline gap check flipped
                    from MIN 6h to MAX 6h — error fires when gap > 6h. */}
                <div className="mb-4">
                  <label className={labelClass}>{m('Leg 2 Departure Date')} <span>*</span></label>
                  <div className="relative">
                    <input
                      type="date" lang={DATE_INPUT_LANG}
                      value={leg2ArrivalDate?.split('T')[0] || ''}
                      min={form.date ? form.date : hktTodayYmd()}
                      onChange={(e) => {
                        const datePart = e.target.value;
                        const timePart = leg2ArrivalDate?.split('T')[1]?.slice(0, 5) || '';
                        const next = timePart ? `${datePart}T${timePart}` : datePart;
                        setLeg2ArrivalDate(next);
                        if (form.flightType !== 'Transit') { setTransitGapError(null); return; }
                        // MAX 6h (rev. 6.2.98). The useEffect below
                        // re-asserts the same value on the next render
                        // so the inline fast-path + the useEffect safety
                        // net always converge.
                        const l0Iso = form.date && leg1FlightTime
                          ? new Date(`${form.date}T${leg1FlightTime}:00`).getTime()
                          : null;
                        const l1Ms = next ? new Date(next).getTime() : null;
                        if (l0Iso === null || l1Ms === null || isNaN(l0Iso) || isNaN(l1Ms)) {
                          setTransitGapError(null);
                          return;
                        }
                        const diffMs = l1Ms - l0Iso;
                        const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
                        if (diffMs > SIX_HOURS_MS) {
                          const hours = Math.floor(diffMs / 3600000);
                          const mins = Math.floor((diffMs % 3600000) / 60000);
                          setTransitGapError(
                          m('Transit gap must be at most 6 hours (got {hours}h {mins}m). Please pick an earlier outbound leg.')
                            .replace('{hours}', String(hours))
                            .replace('{mins}', String(mins)),
                        );
                        } else {
                          setTransitGapError(null);
                        }
                      }}
                      style={fieldStyle}
                      className={fieldClass + ' pr-10'}
                      data-testid="leg2-arrivalDate"
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Leg 2 Departure Time — full width. 2026-06-08 (round
                    6.2.8): renamed from "Arrival Time" to "Departure
                    Time". The time half of the combined leg2ArrivalDate
                    state (datetime-local string).
                    2026-06-28 (round 6.2.98): inline gap check flipped
                    from MIN 6h to MAX 6h — error fires when gap > 6h. */}
                <div className="mb-4">
                  <label className={labelClass}>{m('Leg 2 Departure Time')} <span>*</span></label>
                  <Time5MinSelect
                    value={leg2ArrivalDate?.split('T')[1]?.slice(0, 5) || ''}
                    onChange={(timePart) => {
                      const datePart = leg2ArrivalDate?.split('T')[0] || '';
                      const next = datePart ? `${datePart}T${timePart}` : '';
                      setLeg2ArrivalDate(next);
                      if (form.flightType !== 'Transit') { setTransitGapError(null); return; }
                      const l0Iso = form.date && leg1FlightTime
                        ? new Date(`${form.date}T${leg1FlightTime}:00`).getTime()
                        : null;
                      const l1Ms = next ? new Date(next).getTime() : null;
                      if (l0Iso === null || l1Ms === null || isNaN(l0Iso) || isNaN(l1Ms)) {
                        setTransitGapError(null);
                        return;
                      }
                      const diffMs = l1Ms - l0Iso;
                      const SIX_HOURS_MS = 6 * 60 * 60 * 1000;
                      if (diffMs > SIX_HOURS_MS) {
                        const hours = Math.floor(diffMs / 3600000);
                        const mins = Math.floor((diffMs % 3600000) / 60000);
                        setTransitGapError(
                          m('Transit gap must be at most 6 hours (got {hours}h {mins}m). Please pick an earlier outbound leg.')
                            .replace('{hours}', String(hours))
                            .replace('{mins}', String(mins)),
                        );
                      } else {
                        setTransitGapError(null);
                      }
                    }}
                    required
                    wrapperStyle={fieldStyle}
                    wrapperClassName={fieldClass}
                    testId="leg2-flightTime"
                  />
                </div>

                {/* Leg 2 Destination — full width. 2026-06-08 (round
                    6.2.8): new field per Sky's spec. Captures the
                    outbound destination (e.g. "London (LHR)") for
                    leg 2. State held in `leg2Destination`; submit
                    payload emits `legs[1].destination` via api.ts.
                    backend's TransitLegsRule does not validate this
                    field today — it is captured for display / future
                    pricing use. */}
                <div className="mb-4">
                  <label className={labelClass} htmlFor="leg2-destination">{m('Leg 2 Destination')} <span>*</span></label>
                  <AirportTypeahead
                    id="leg2-destination"
                    name="leg2Destination"
                    value={leg2Destination}
                    onChange={setLeg2Destination}
                    required
                    placeholder={m('Search IATA or city (e.g. LHR, Tokyo)')}
                    style={fieldStyle}
                    className={fieldClass + ' pl-10 pr-8'}
                    listStyle={glassStyle}
                    highlightClassName={isDark ? 'bg-white/10' : 'bg-black/5'}
                    mutedClassName={isDark ? 'text-gray-400' : 'text-[rgb(160,159,148)]'}
                    data-testid="leg2-destination"
                  />
                </div>

                {/* Leg 2 Flight Class — full width. */}
                <div>
                  <label className={labelClass}>{m('Leg 2 Flight Class')} <span>*</span></label>
                  <div className="relative">
                    <select
                      value={leg2FlightClass}
                      onChange={(e) => setLeg2FlightClass(e.target.value)}
                      style={fieldStyle}
                      className={fieldClass + ' appearance-none pr-10 cursor-pointer'}
                      data-testid="leg2-flightClass"
                    >
                      <option value="" className={optionBg}>{m('Select class')}</option>
                      <option value="Economy Class" className={optionBg}>{m('Economy Class')}</option>
                      <option value="Business Class" className={optionBg}>{m('Business Class')}</option>
                      <option value="First Class" className={optionBg}>{m('First Class')}</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {transitGapError && (
                  <div
                    className="mt-3 flex items-center justify-center gap-2 px-4 py-2 rounded-lg"
                    style={{ background: hintBgS1, border: hintBorderS1 }}
                  >
                    <Info className="w-4 h-4 flex-shrink-0" style={{ color: hintColorS1 }} />
                    <p className="text-xs" style={{ color: hintColorS1 }}>
                      {transitGapError}
                    </p>
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
              {m('Cancel')}
            </button>
            <button
              type="submit"
              disabled={!step1FlightValid}
              className="py-3 px-6 rounded-xl text-white text-sm transition-all hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: 'linear-gradient(90deg, rgb(220, 181, 21) 0%, rgb(180, 140, 10) 100%)' }}
            >
              {m('Next: Guest Selection')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {!step1FlightValid && step1FlightHints.length > 0 && (
            <div
              className="flex items-start gap-2 px-4 py-3 rounded-lg"
              style={{ background: hintBgS1, border: hintBorderS1 }}
            >
              <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: hintColorS1 }} />
              <div className="flex-1">
                <p className="text-xs font-medium mb-1" style={{ color: hintColorS1 }}>
                  {m('Please address the following before continuing:')}
                </p>
                <ul className="text-xs space-y-0.5 list-disc list-inside" style={{ color: hintColorS1 }}>
                  {step1FlightHints.map((hint, idx) => (
                    <li key={idx}>{hint}</li>
                  ))}
                </ul>
            </div>
          </div>
        )}
        </div>
      </form>
      {stepLoadingOverlay}
      {shortNoticeWarningDialog}
      {historyDialog}
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
  // Pre-compute helperText values to avoid chained ternaries and complex template literals in JSX props.
  // English source keys stay in catalog; placeholders filled here so StepperCard m() can still
  // pass through already-translated dynamic strings.
  let premiereVipHelperText: string | undefined = undefined;
  if (form.premiereSuites === 0) {
    premiereVipHelperText = m('Please select at least 1 Premiere Suite first');
  } else {
    // 2026-06-27 (round 6.2.96 — Sky): show the minimum floor
    // (1 VIP per suite) alongside the cap. The 1:1 floor is
    // enforced in `updateCount` so the user can never land
    // below it via the stepper; the helper text just surfaces
    // the rule so they understand the auto-bump when they
    // increment suites.
    const cap = form.premiereSuites * 6;
    const used = form.premiereVipPassengers + form.premiereNonFlyingGuests;
    premiereVipHelperText = m(
      'Minimum 1 VIP per suite · Maximum: {cap} total guests per {suites} suite(s) ({used}/{cap} used)',
    )
      .replaceAll('{cap}', String(cap))
      .replaceAll('{suites}', String(form.premiereSuites))
      .replaceAll('{used}', String(used));
  }

  let premiereNfgHelperText: string | undefined = undefined;
  if (form.premiereVipPassengers === 0) {
    premiereNfgHelperText = m('Requires at least 1 VIP Passenger');
  } else if (form.premiereVipPassengers + form.premiereNonFlyingGuests >= form.premiereSuites * 6) {
    const used = form.premiereVipPassengers + form.premiereNonFlyingGuests;
    const cap = form.premiereSuites * 6;
    premiereNfgHelperText = m('Suite capacity reached ({used}/{cap})')
      .replaceAll('{used}', String(used))
      .replaceAll('{cap}', String(cap));
  }

  let loungeNfgHelperText: string | undefined = undefined;
  if (form.vipPassengers === 0) {
    loungeNfgHelperText = m('Requires at least 1 VIP Passenger');
  } else if (form.nonFlyingGuests >= 3) {
    loungeNfgHelperText = m('Maximum 3 non-flying guests per booking');
  }

  const gradientTextS2: React.CSSProperties = {
    background: 'linear-gradient(90deg, rgb(220, 181, 21) 0%, rgb(180, 140, 10) 100%)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    backgroundClip: 'text',
  };
  // 2026-06-16 (round ?) — the "Use History as New Booking" pill
  // button styles. Originally declared inside step 1's render block
  // (histBtnBgS1 etc.) where the button used to live; we moved the
  // button to step 2's header, so redeclare here. Keeping the visual
  // identical to the original pill so the move is a pure relocation.
  const histBtnBgS2 = isDark
    ? 'linear-gradient(135deg,rgba(220,181,21,0.2) 0%,rgba(180,140,10,0.12) 100%)'
    : 'linear-gradient(135deg,rgba(220,181,21,0.25) 0%,rgba(180,140,10,0.15) 100%)';
  const histBtnBorderS2 = isDark ? '1px solid rgba(220,181,21,0.4)' : '1px solid rgba(220,181,21,0.5)';
  const histBtnColorS2 = isDark ? 'rgb(220,181,21)' : 'rgb(160,128,8)';

  return (
    <>
    <form onSubmit={handleNextFromStep2}>
      <div className="space-y-4 pb-8">
        {/* Progress bar */}
        <BookingStepProgress skipAddons={noAddonRequired} />

        {/* Step 2 header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
            <h1 className="text-xl" style={gradientTextS2}>{m('Step 2: Suite &amp; Guest Selection')}</h1>
          <p className="text-xs mt-1" style={textMuted}>
              {m('Select lounge areas, add VIP passengers and non-flying guests')}
            </p>
          </div>
          {/* 2026-06-16 (round ?) — moved from step 1 to step 2 (per
              Sky's request). Picking a past booking to clone is more
              useful AFTER the user has the lounge/suite/VIP/NFG counts
              in mind. The dialog itself was already in step 2's
              branch as a "more detailed" duplicate; that copy is the
              one the button now opens, and the step-1 duplicate has
              been removed. */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              type="button"
              data-testid="use-history-button"
              onClick={handleOpenHistoryDialog}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all hover:opacity-90"
              style={{ background: histBtnBgS2, border: histBtnBorderS2, color: histBtnColorS2 }}
            >
              <History className="w-3.5 h-3.5 flex-shrink-0" />
              <span className="hidden sm:inline">{m('Use History as New Booking')}</span>
              <span className="sm:hidden">{m('Use History')}</span>
            </button>
          </div>
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
                {m('Booking on behalf of')}{' '}
                <strong>{prefillMember.title} {prefillMember.firstName} {prefillMember.lastName}</strong>
              </p>
              <p className="text-xs mt-0.5" style={{ color: isDark ? 'rgba(147,197,253,0.75)' : 'rgba(37,99,235,0.7)' }}>
                {m('Membership:')} {m(prefillMember.membershipLabel)}
                {' · '}
                {m('Voucher balance:')} {prefillMember.voucherCount}{' '}
                {prefillMember.voucherCount !== 1 ? m('vouchers') : m('voucher')}
                {' '}{m("(booking vouchers deducted from this member's account)")}
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
                {form.flightNumber} · {m(form.flightType)} · {m(form.flightClass)}
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
              {m('Edit')}
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
              {form.flightNumber} · {m(form.flightType)} · {m(form.flightClass)}
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
              {m('Edit')}
            </button>
          </div>
        )}

        {/* ── 2 & 4. Premiere Suite + Lounge Deluxe — 2-col on desktop ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

          {/* Premiere Suite */}
          <div className="p-5" style={card}>
            <SectionHeader
              title={m('Premiere Suite')}
              subtitle={m('Includes stays equivalent to exclusive benefits')}
            />

            <div className="mb-4">
              <label className={labelClass}>{m('Number of Premiere Suite')}</label>
              <StepperCard
                icon={<Building className="w-5 h-5 text-white" />}
                iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
                title={m('Premiere Suite')}
                subtitle={m('Private suite with exclusive benefits')}
                value={form.premiereSuites}
                onDecrement={() => updateCount('premiereSuites', -1)}
                onIncrement={() => updateCount('premiereSuites', 1)}
                testId="premiere-suites"
              />
            </div>

            <div className="mb-4">
              <label className={labelClass}>{m('Number of VIP Passengers in Premiere Suite')}</label>
              <StepperCard
                icon={<Users className="w-5 h-5 text-white" />}
                iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
                title={m('VIP Passengers')}
                subtitle={m('Select your VIP Passengers')}
                value={form.premiereVipPassengers}
                onDecrement={() => updateCount('premiereVipPassengers', -1)}
                onIncrement={() => updateCount('premiereVipPassengers', 1)}
                incrementDisabled={
                  form.premiereVipPassengers + form.premiereNonFlyingGuests >= form.premiereSuites * 6
                }
                helperText={premiereVipHelperText}
                testId="ps-vip"
              />
            </div>

            <div>
              <label className={labelClass}>{m('Number of Non Flying Guests in Premiere Suite')}</label>
              <StepperCard
                icon={<User className="w-5 h-5 text-white" />}
                iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
                title={m('Non-Flying Guests')}
                subtitle={m('Select non-flying Guests')}
                value={form.premiereNonFlyingGuests}
                onDecrement={() => updateCount('premiereNonFlyingGuests', -1)}
                onIncrement={() => updateCount('premiereNonFlyingGuests', 1)}
                incrementDisabled={
                  form.premiereVipPassengers === 0 ||
                  form.premiereVipPassengers + form.premiereNonFlyingGuests >= form.premiereSuites * 6
                }
                helperText={premiereNfgHelperText}
                testId="ps-nfg"
              />
            </div>

            {/* R6.2.104 (2026-07-04, Sky): running-subtotal chip
                that mirrors the Step 3 Add-on stepper pattern (see
                lines 3838-3839 for the per-stepper running subtotal).
                Gates on `ppHasLoaded` so we never flash a stale HK$0
                before the backend's `usePricePreview` returns. */}
            {(() => {
              const { psSectionPrice: psAmt, ppHasLoaded: ppReady } = getPriceSectionPrices(pricePreview);
              return ppReady && psAmt > 0 ? (
                <div
                  className="mt-3 pt-3 flex items-center justify-between"
                  style={{ borderTop: borderSubtle }}
                  data-hkial-ps-subtotal="1"
                >
                  <span className="text-xs" style={{ color: colors.textMuted }}>{m('Premiere Suite Subtotal')}</span>
                  <span className="text-sm font-semibold" style={textPrimary}>HK${psAmt.toLocaleString()}</span>
                </div>
              ) : null;
            })()}
          </div>

          {/* Lounge Deluxe */}
          <div className="p-5" style={card}>
            <SectionHeader
              title={m('Lounge Deluxe')}
              subtitle={m('Exclusive lounge for VIP passengers and guests')}
            />

            <div className="mb-4">
              <label className={labelClass}>{m('Number of VIP Passengers in Lounge Deluxe')}</label>
              <StepperCard
                icon={<Users className="w-5 h-5 text-white" />}
                iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
                title={m('VIP Passengers')}
                subtitle={m('Select your VIP Passengers')}
                value={form.vipPassengers}
                onDecrement={() => updateCount('vipPassengers', -1)}
                onIncrement={() => updateCount('vipPassengers', 1)}
                testId="ld-vip"
              />
            </div>

            <div>
              <label className={labelClass}>{m('Number of Non Flying Guests in Lounge Deluxe')}</label>
              <StepperCard
                icon={<User className="w-5 h-5 text-white" />}
                iconBg="bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)]"
                title={m('Non-Flying Guests')}
                subtitle={m('Select non-flying Guests')}
                value={form.nonFlyingGuests}
                onDecrement={() => updateCount('nonFlyingGuests', -1)}
                onIncrement={() => updateCount('nonFlyingGuests', 1)}
                incrementDisabled={form.vipPassengers === 0 || form.nonFlyingGuests >= 3}
                helperText={loungeNfgHelperText}
                testId="ld-nfg"
              />
            </div>

            {/* R6.2.104 (2026-07-04, Sky): running-subtotal chip for
                the Lounge Deluxe section. Same pattern as the PS chip
                above and the Step 3 Add-on per-stepper subtotals. */}
            {(() => {
              const { ldSectionPrice: ldAmt, ppHasLoaded: ppReady } = getPriceSectionPrices(pricePreview);
              return ppReady && ldAmt > 0 ? (
                <div
                  className="mt-3 pt-3 flex items-center justify-between"
                  style={{ borderTop: borderSubtle }}
                  data-hkial-ld-subtotal="1"
                >
                  <span className="text-xs" style={{ color: colors.textMuted }}>{m('Lounge Deluxe Subtotal')}</span>
                  <span className="text-sm font-semibold" style={textPrimary}>HK${ldAmt.toLocaleString()}</span>
                </div>
              ) : null;
            })()}
          </div>

        </div>

        {/* ── 5. VIP Passenger Information sections ──────────────────────── */}
        {/* Cap the rendered boxes to `totalVip` so the form always shows
            exactly the right number of boxes for the configured VIP passenger
            counts. If vipData has extra entries (e.g. leftover from Quick
            Fill's hardcoded 5 entries when totalVip is now 4), they are
            hidden from the UI but kept in state for user data preservation. */}
        {vipData.slice(0, totalVip).map((passenger, index) => {
          const isPremiereVip = index < form.premiereVipPassengers;

          let guestType: string;
          let badgeStyle: React.CSSProperties;

          if (isPremiereVip) {
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
            <div
              key={index}
              className="p-5"
              style={card}
              data-hkial-vip-info={index}
            >
              <SectionHeader
                title={m('VIP Passenger Information #{n}').replace('{n}', String(index + 1))}
                subtitle={m(`${guestType} — please fill in details`)}
              />

              {/* Badge */}
              <div className="mb-4">
                <span className="text-xs px-2.5 py-0.5 rounded-full" style={badgeStyle}>
                  {m(guestType)}
                </span>
              </div>

              {/* Two-column grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Title */}
                <div>
                  <label className={labelClass}>{m('Title *')}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
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
                  <label className={labelClass}>{m('First Name *')}</label>
                  <input
                    type="text"
                    value={passenger.vipFirstName}
                    onChange={(e) => handleVipChange(index, 'vipFirstName', e.target.value)}
                    required
                    placeholder={m('Enter first name')}
                    style={fieldStyle}
                    className={fieldClass}
                  />
                </div>

                {/* Last Name */}
                <div>
                  <label className={labelClass}>{m('Last Name *')}</label>
                  <input
                    type="text"
                    value={passenger.vipLastName}
                    onChange={(e) => handleVipChange(index, 'vipLastName', e.target.value)}
                    required
                    placeholder={m('Enter last name')}
                    style={fieldStyle}
                    className={fieldClass}
                  />
                </div>

                {/* Travel Doc */}
                <div>
                  <label className={labelClass}>{m('Travel Document No. (Travel or Indent)')}</label>
                  <input
                    type="text"
                    value={passenger.vipTravelDocNo}
                    onChange={(e) =>
                      handleVipChange(index, 'vipTravelDocNo', e.target.value.toUpperCase())
                    }
                    placeholder={m('e.g. P12345678 (Optional)')}
                    style={fieldStyle}
                    className={fieldClass + ' uppercase'}
                  />
                </div>

                {/* Age Group */}
                <div>
                  <label className={labelClass}>{m('Age Group')} <span>*</span></label>
                  <div className="relative">
                    <Cake className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                      value={passenger.vipAgeGroup}
                      onChange={(e) => handleVipChange(index, 'vipAgeGroup', e.target.value)}
                      required
                      style={fieldStyle}
                      className={fieldClass + ' pl-10 appearance-none pr-10 cursor-pointer'}
                    >
                      <option value="" disabled className={optionBg}>{m('Select age group')}</option>
                      <option value="Adults (aged 12 and above)" className={optionBg}>{m('Adults (aged 12 and above)')}</option>
                      <option value="Children (aged 2-11)" className={optionBg}>{m('Children (aged 2 to 11)')}</option>
                      <option value="Infants (under 2 years old)" className={optionBg}>{m('Infants (under 2 years old)')}</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Nationality */}
                <div>
                  <label className={labelClass}>{m('Nationality *')}</label>
                  <GuestNationalityTypeahead
                    value={passenger.nationality}
                    onChange={(code) => handleVipChange(index, 'nationality', code)}
                    fieldStyle={fieldStyle}
                    fieldClass={fieldClass}
                    isDark={isDark}
                    required
                  />
                </div>

                {/* Birthday */}
                <div>
                  <label className={labelClass}>{m('Birthday (Date / Month / Year)')}</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type="date" lang={DATE_INPUT_LANG}
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
                <label className={labelClass}>{m('Food Allergies')} <span className="text-xs opacity-60">{m('(optional)')}</span></label>
                <input
                  type="text"
                  value={passenger.foodAllergies}
                  onChange={(e) => handleVipChange(index, 'foodAllergies', e.target.value)}
                  placeholder={m('e.g. Peanuts, Shellfish, Gluten (leave blank if none)')}
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
            <div
              key={index}
              className="p-5"
              style={card}
              data-hkial-nfg-info={index}
            >
              <SectionHeader
                title={m('Non-Flying Guest Information #{n}').replace('{n}', String(index + 1))}
                subtitle={`${guestType} — please fill in details`}
              />

              {/* Badge */}
              <div className="mb-4">
                <span className="text-xs px-2.5 py-0.5 rounded-full" style={badgeStyle}>
                  {m(guestType)}
                </span>
              </div>

              {/* Two-column grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                {/* Title */}
                <div>
                  <label className={labelClass}>{m('Title *')}</label>
                  <div className="relative">
                    <select
                      value={guest.guestTitle}
                      onChange={(e) => handleNonFlyingGuestChange(index, 'guestTitle', e.target.value)}
                      required
                      style={fieldStyle}
                      className={fieldClass + ' appearance-none pr-10 cursor-pointer'}
                    >
                      <option value="Mr" className={optionBg}>{m('Mr')}</option>
                      <option value="Mrs" className={optionBg}>{m('Mrs')}</option>
                      <option value="Ms" className={optionBg}>{m('Ms')}</option>
                      <option value="Miss" className={optionBg}>{m('Miss')}</option>
                      <option value="Dr" className={optionBg}>{m('Dr')}</option>
                      <option value="Prof" className={optionBg}>{m('Prof')}</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* First Name */}
                <div>
                  <label className={labelClass}>{m('First Name *')}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      value={guest.guestFirstName}
                      onChange={(e) => handleNonFlyingGuestChange(index, 'guestFirstName', e.target.value)}
                      required
                      placeholder={m('e.g. John')}
                      style={fieldStyle}
                      className={fieldClass + ' pl-10'}
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div>
                  <label className={labelClass}>{m('Last Name *')}</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      value={guest.guestLastName}
                      onChange={(e) => handleNonFlyingGuestChange(index, 'guestLastName', e.target.value)}
                      required
                      placeholder={m('e.g. Smith')}
                      style={fieldStyle}
                      className={fieldClass + ' pl-10'}
                    />
                  </div>
                </div>

                {/* Age Group */}
                <div>
                  <label className={labelClass}>{m('Age Group')} <span>*</span></label>
                  <div className="relative">
                    <Cake className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    <select
                      value={guest.guestAgeGroup}
                      onChange={(e) => handleNonFlyingGuestChange(index, 'guestAgeGroup', e.target.value)}
                      required
                      style={fieldStyle}
                      className={fieldClass + ' pl-10 appearance-none pr-10 cursor-pointer'}
                    >
                      <option value="" disabled className={optionBg}>{m('Select age group')}</option>
                      <option value="Adults (aged 12 and above)" className={optionBg}>{m('Adults (aged 12 and above)')}</option>
                      <option value="Children (aged 2-11)" className={optionBg}>{m('Children (aged 2 to 11)')}</option>
                      <option value="Infants (under 2 years old)" className={optionBg}>{m('Infants (under 2 years old)')}</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {isNfgChildrenAgeGroup(guest.guestAgeGroup) && (
                  <div>
                    <label className={labelClass}>{m('Age *')}</label>
                    <div className="relative">
                      <Cake className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      <select
                        value={guest.guestAge}
                        onChange={(e) => handleNonFlyingGuestChange(index, 'guestAge', e.target.value)}
                        required
                        style={fieldStyle}
                        className={fieldClass + ' pl-10 appearance-none pr-10 cursor-pointer'}
                      >
                        <option value="" disabled className={optionBg}>{m('Select age')}</option>
                        {NFG_CHILD_AGE_VALUES.map((n) => (
                          <option key={n} value={String(n)} className={optionBg}>
                            {m('{n} years old').replace('{n}', String(n))}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                )}

                {/* Nationality */}
                <div>
                  <label className={labelClass}>{m('Nationality *')}</label>
                  <GuestNationalityTypeahead
                    value={guest.nationality}
                    onChange={(code) => handleNonFlyingGuestChange(index, 'nationality', code)}
                    fieldStyle={fieldStyle}
                    fieldClass={fieldClass}
                    isDark={isDark}
                    required
                  />
                </div>
              </div>

              {/* Food Allergies */}
              <div className="mt-4">
                <label className={labelClass}>{m('Food Allergies')} <span className="text-xs opacity-60">{m('(optional)')}</span></label>
                <input
                  type="text"
                  value={guest.foodAllergies}
                  onChange={(e) => handleNonFlyingGuestChange(index, 'foodAllergies', e.target.value)}
                  placeholder={m('e.g. Peanuts, Shellfish, Gluten (leave blank if none)')}
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
            <div className="text-sm" style={textPrimary}>{m('No add-on service required')}</div>
            <div className="text-xs mt-0.5" style={textMuted}>{m('Skip optional add-ons and proceed directly to the next step')}</div>
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
            onClick={handleBackToStep1}
            className="py-3 px-6 rounded-xl text-sm transition-all hover:opacity-80 flex items-center justify-center gap-2"
            style={{ ...backBtnStyle, color: colors.text }}
          >
            <ArrowLeft className="w-4 h-4" />
            {m('Back to Previous Page')}
          </button>
          <button
            type="submit"
            disabled={!step1Valid}
            className="py-3 px-6 rounded-xl text-white text-sm transition-all hover:opacity-90 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(90deg, rgb(220, 181, 21) 0%, rgb(180, 140, 10) 100%)' }}
          >
            {m('Next Step')}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {!step1Valid && step1Hints.length > 0 && (
          <div
            className="flex items-start gap-2 px-4 py-3 rounded-lg"
            style={{
              background: isDark ? 'rgba(220, 181, 21, 0.1)' : 'rgba(220, 181, 21, 0.15)',
              border: isDark ? '1px solid rgba(220, 181, 21, 0.2)' : '1px solid rgba(220, 181, 21, 0.3)',
            }}
          >
            <Info className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: isDark ? 'rgb(251, 191, 36)' : 'rgb(180, 140, 10)' }} />
            <div className="flex-1">
              <p className="text-xs font-medium mb-1" style={{ color: isDark ? 'rgb(251, 191, 36)' : 'rgb(180, 140, 10)' }}>
                {m('Please address the following before continuing:')}
              </p>
              <ul className="text-xs space-y-0.5 list-disc list-inside" style={{ color: isDark ? 'rgb(251, 191, 36)' : 'rgb(180, 140, 10)' }}>
                {step1Hints.map((hint, idx) => (
                  <li key={idx}>{m(hint)}</li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Delete VIP Passenger Dialog */}
      {pendingVipDeletion && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.7)' }}
          data-hkial-dialog="delete-vip"
          data-hkial-segment={pendingVipDeletion.segment}
        >
          <div
            className="max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-xl p-6"
            style={{
              background: isDark ? '#0a1929' : '#FFFFFF',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(200, 199, 190, 0.4)',
            }}
          >
            <h3 className="text-xl mb-4" style={textPrimary}>
              {m('Select {type} to Remove').replace(
                '{type}',
                m(getSegmentLabel(pendingVipDeletion.segment, 'vip')),
              )}
            </h3>
            <p className="text-sm mb-6" style={textSecondary}>
              {m(
                'You have reduced the number of {type}s from {from} to {to}. Please select {n} to remove:',
              )
                .replace('{type}', m(getSegmentLabel(pendingVipDeletion.segment, 'vip')))
                .replace('{from}', String(pendingVipDeletion.prevCount))
                .replace('{to}', String(pendingVipDeletion.newCount))
                .replace(
                  '{n}',
                  String(pendingVipDeletion.prevCount - pendingVipDeletion.newCount),
                )}
            </p>

            <div className="space-y-3 mb-6">
              {getVipSegmentEntries(
                pendingVipDeletion.segment,
                form.premiereVipPassengers,
                form.vipPassengers,
                vipData,
              ).map((vip, displayIndex) => {
                const absoluteIndex = resolveVipAbsoluteIndex(
                  pendingVipDeletion.segment,
                  displayIndex,
                  form.premiereVipPassengers,
                );
                const guestType = m(getSegmentLabel(pendingVipDeletion.segment, 'vip'));
                const displayName = vip.vipFirstName || vip.vipLastName
                  ? `${vip.vipTitle} ${vip.vipFirstName} ${vip.vipLastName}`.trim()
                  : m('VIP Passenger #{n} (Empty)').replace(
                      '{n}',
                      String(absoluteIndex + 1),
                    );

                return (
                  <div
                    key={displayIndex}
                    data-hkial-vip-candidate={absoluteIndex}
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
                        {vip.vipTravelDocNo && ` • ${m('Doc:')} ${vip.vipTravelDocNo}`}

                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteVip(displayIndex)}
                      className="px-4 py-2 rounded-lg text-sm text-white transition-all hover:opacity-80"
                      style={{ background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)' }}
                    >
                      {m('Remove')}
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
              {m('Cancel')}
            </button>
          </div>
        </div>
      )}

      {/* Delete Non-Flying Guest Dialog */}
      {pendingGuestDeletion && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0, 0, 0, 0.7)' }}
          data-hkial-dialog="delete-guest"
          data-hkial-segment={pendingGuestDeletion.segment}
        >
          <div
            className="max-w-2xl w-full max-h-[80vh] overflow-y-auto rounded-xl p-6"
            style={{
              background: isDark ? '#0a1929' : '#FFFFFF',
              border: isDark ? '1px solid rgba(255, 255, 255, 0.1)' : '1px solid rgba(200, 199, 190, 0.4)',
            }}
          >
            <h3 className="text-xl mb-4" style={textPrimary}>
              {m('Select {type} to Remove').replace(
                '{type}',
                m(getSegmentLabel(pendingGuestDeletion.segment, 'guest')),
              )}
            </h3>
            <p className="text-sm mb-6" style={textSecondary}>
              {m(
                'You have reduced the number of {type}s from {from} to {to}. Please select {n} to remove:',
              )
                .replace('{type}', m(getSegmentLabel(pendingGuestDeletion.segment, 'guest')))
                .replace('{from}', String(pendingGuestDeletion.prevCount))
                .replace('{to}', String(pendingGuestDeletion.newCount))
                .replace(
                  '{n}',
                  String(pendingGuestDeletion.prevCount - pendingGuestDeletion.newCount),
                )}
            </p>

            <div className="space-y-3 mb-6">
              {getGuestSegmentEntries(
                pendingGuestDeletion.segment,
                form.premiereNonFlyingGuests,
                form.nonFlyingGuests,
                nonFlyingGuestData,
              ).map((guest, displayIndex) => {
                const absoluteIndex = resolveGuestAbsoluteIndex(
                  pendingGuestDeletion.segment,
                  displayIndex,
                  form.premiereNonFlyingGuests,
                );
                const guestType = m(getSegmentLabel(pendingGuestDeletion.segment, 'guest'));
                const displayName = guest.guestFirstName || guest.guestLastName
                  ? `${guest.guestTitle} ${guest.guestFirstName} ${guest.guestLastName}`.trim()
                  : m('Non-Flying Guest #{n} (Empty)').replace(
                      '{n}',
                      String(absoluteIndex + 1),
                    );

                return (
                  <div
                    key={displayIndex}
                    data-hkial-guest-candidate={absoluteIndex}
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
                        {guestType} • {guest.guestAgeGroup ? m(guest.guestAgeGroup) : ''}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteGuest(displayIndex)}
                      className="px-4 py-2 rounded-lg text-sm text-white transition-all hover:opacity-80"
                      style={{ background: 'linear-gradient(90deg, #ef4444 0%, #dc2626 100%)' }}
                    >
                      {m('Remove')}
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
              {m('Cancel')}
            </button>
          </div>
        </div>
      )}


    </form>
    {stepLoadingOverlay}
    {shortNoticeWarningDialog}
      {historyDialog}
    </>
  );
  } // end if (currentStep === 2)

  return null;
}

export default NewBooking;
