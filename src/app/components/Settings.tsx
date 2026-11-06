import React, { useState } from "react";
import {
  User,
  Eye,
  EyeOff,
  Save,
  Palette,
  Sun,
  Moon,
  Phone,
  Mail,
  CreditCard,
  Loader2,
  Check,
  X,
  Calendar,
  Heart,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useTheme } from "./ThemeContext";
import { NationalityTypeahead } from "../../../../../components/NationalityTypeahead";
import { isValidCountryCode } from "../../../../../utils/countries";
import { sanitizeEnglishName } from "../../../../../utils/englishName";
import { MEMBER_PASSWORD_SPECIAL_CHAR_PATTERN } from "../../../../../utils/memberPasswordValidation";
import {
  LOCALE_LABELS,
  SUPPORTED_LOCALES,
  normalizeLocale,
  type AppLocale,
} from "../../../../../i18n";
import { useMsg } from '../../../../../i18n/useMsg';
import { DateInput } from './ui/date-input';

// ── Props interface ─────────────────────────────────────────────────────────
export interface SettingsProps {
  isLoading?: boolean;
  isSaving?: boolean;
  saveMessage?: string;
  activeSection?: string;
  showPassword?: boolean;
  settings?: {
    profile?: {
      title?: string;
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
      nationality?: string;
      passportFirst4?: string;
      passportLast4?: string;
      regionCode?: string;
      birthday?: string;
      spouseTitle?: string;
      spouseFirstName?: string;
      spouseLastName?: string;
      spouseEmail?: string;
      spousePhone?: string;
      spouseNationality?: string;
      spousePassportFirst4?: string;
      spouseBirthday?: string;
    };
    appearance?: {
      theme?: "light" | "dark";
      language?: string;
    };
  };
  passwordFields?: {
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  };
  fieldErrors?: Record<string, string>;
  highlightBirthday?: boolean;
  /** After the first saved spouse record, fields are read-only for the member. */
  spouseLocked?: boolean;
  /** Canonical email from last successful load — used to detect rebind. */
  originalEmail?: string;
  onTogglePassword?: () => void;
  onSectionChange?: (section: string) => void;
  onSettingChange?: (
    section: string,
    key: string,
    value: string,
  ) => void;
  onPasswordChange?: (
    field:
      | "currentPassword"
      | "newPassword"
      | "confirmPassword",
    value: string,
  ) => void;
  onThemeChange?: (theme: "light" | "dark" | "system") => void;
  /** RFQ 3.3 language switch — parent wires i18n.changeLanguage */
  onLanguageChange?: (locale: string) => void;
  onSave?: () => void;
}

// ── Mock data for Figma preview (used when no real props are provided) ───────
const MOCK_SETTINGS = {
  profile: {
    title: 'Mr',
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phone: "+852 9876 5432",
    nationality: "HK",
    passportFirst4: "1234",
    birthday: "1988-04-20",
    spouseTitle: "Mrs",
    spouseFirstName: "Jane",
    spouseLastName: "Doe",
    spouseEmail: "jane.doe@example.com",
    spousePhone: "+852 9123 4567",
    spouseNationality: "HK",
    spousePassportFirst4: "5678",
    spouseBirthday: "1990-11-02",
  },
  appearance: {
    theme: "light",
    language: "en",
  },
};

function RequiredStar() {
  return <span style={{ color: "rgb(220,181,21)" }}>*</span>;
}

function SettingsFieldError({ msg }: { msg?: string }) {
  const m = useMsg();
  if (!msg) return null;
  return (
    <p className="mt-1 text-xs" style={{ color: "#ef4444" }}>
      {m(msg)}
    </p>
  );
}

export function Settings({
  isLoading = false,
  isSaving = false,
  saveMessage = "",
  activeSection: propActiveSection,
  showPassword: propShowPassword,
  settings: propSettings,
  passwordFields: propPasswordFields,
  fieldErrors: propFieldErrors,
  highlightBirthday = false,
  spouseLocked = false,
  originalEmail = "",
  onTogglePassword,
  onSectionChange,
  onSettingChange,
  onPasswordChange,
  onThemeChange,
  onLanguageChange,
  onSave,
}: SettingsProps) {
  const m = useMsg();
  const { t, i18n } = useTranslation();
  const { mode, colors, setTheme, glassStyle } = useTheme();
  const isDark = mode === "dark";

  // Use prop settings if provided, otherwise fall back to mock data for Figma preview
  const settings = propSettings ?? MOCK_SETTINGS;
  const profile = settings.profile ?? MOCK_SETTINGS.profile;
  const appearance =
    settings.appearance ?? MOCK_SETTINGS.appearance;
  const emailChanging =
    String(profile.email ?? "").trim().toLowerCase() !== ""
    && String(originalEmail ?? "").trim().toLowerCase() !== ""
    && String(profile.email ?? "").trim().toLowerCase()
      !== String(originalEmail ?? "").trim().toLowerCase();

  // Password fields state (can be controlled via props or managed internally)
  const [internalPasswordFields, setInternalPasswordFields] =
    useState({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  const passwordFields =
    propPasswordFields ?? internalPasswordFields;

  // Field errors from the server (keyed by field name, e.g. 'current_password', 'email')
  const fieldErrors = propFieldErrors ?? {};

  const handlePasswordChange = (
    field:
      | "currentPassword"
      | "newPassword"
      | "confirmPassword",
    value: string,
  ) => {
    if (onPasswordChange) {
      onPasswordChange(field, value);
    } else {
      setInternalPasswordFields((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  // Allow parent to control active section, but default to 'profile' for Figma preview
  const [internalActiveSection, setInternalActiveSection] =
    useState("profile");
  const activeSection =
    propActiveSection ?? internalActiveSection;

  const handleSectionChange = (section: string) => {
    if (onSectionChange) {
      onSectionChange(section);
    } else {
      setInternalActiveSection(section);
    }
  };

  const [internalShowPassword, setInternalShowPassword] =
    useState(false);
  const [
    internalShowCurrentPassword,
    setInternalShowCurrentPassword,
  ] = useState(false);
  const [internalShowNewPassword, setInternalShowNewPassword] =
    useState(false);
  const [
    internalShowConfirmPassword,
    setInternalShowConfirmPassword,
  ] = useState(false);
  const showPassword = propShowPassword ?? internalShowPassword;

  const handleTogglePassword = () => {
    if (onTogglePassword) {
      onTogglePassword();
    } else {
      setInternalShowPassword((prev) => !prev);
    }
  };

  const handleToggleCurrentPassword = () => {
    setInternalShowCurrentPassword((prev) => !prev);
  };

  const handleToggleNewPassword = () => {
    setInternalShowNewPassword((prev) => !prev);
  };

  const handleToggleConfirmPassword = () => {
    setInternalShowConfirmPassword((prev) => !prev);
  };

  const updateSetting = (
    section: string,
    key: string,
    value: string,
  ) => {
    if (onSettingChange) {
      onSettingChange(section, key, value);
    }
  };

  const handleThemeChangeInternal = (
    newTheme: "light" | "dark" | "system",
  ) => {
    if (onThemeChange) {
      onThemeChange(newTheme);
    } else {
      setTheme(newTheme === "system" ? "light" : newTheme);
    }
  };

  const sections = [
    { id: "profile", label: t("settings.profile"), icon: User },
    { id: "appearance", label: t("settings.appearance"), icon: Palette },
  ];

  const currentLanguage: AppLocale = normalizeLocale(
    appearance.language ?? i18n.language ?? "en",
  );

  const handleLanguageSelect = (value: string) => {
    if (onLanguageChange) {
      onLanguageChange(value);
      return;
    }
    updateSetting("appearance", "language", value);
  };

  const handlePassportChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4);
    updateSetting("profile", "passportFirst4", value);
  };

  const navHoverBg = isDark
    ? "rgba(255,255,255,0.1)"
    : "rgba(231,230,221,0.6)";
  const handleNavEnter =
    (isActive: boolean) =>
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!isActive)
        e.currentTarget.style.background = navHoverBg;
    };
  const handleNavLeave =
    (isActive: boolean) =>
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!isActive)
        e.currentTarget.style.background = "transparent";
    };

  const inputStyle: React.CSSProperties = {
    background: isDark
      ? "rgba(255,255,255,0.1)"
      : "rgba(231,230,221,0.7)",
    border: `1px solid ${colors.inputBorder}`,
    color: colors.inputText,
  };

  const newPasswordValue = passwordFields.newPassword ?? "";
  const confirmPasswordValue = passwordFields.confirmPassword ?? "";

  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (MEMBER_PASSWORD_SPECIAL_CHAR_PATTERN.test(password)) strength += 25;
    return Math.min(strength, 100);
  };

  const passwordStrength = calculatePasswordStrength(newPasswordValue);
  const getStrengthColor = (strength: number) => {
    if (strength < 40) return "rgb(239, 68, 68)";
    if (strength < 70) return "rgb(234, 179, 8)";
    return "rgb(34, 197, 94)";
  };
  const getStrengthText = (strength: number) => {
    if (strength < 40) return t("auth.passwordStrengthWeak");
    if (strength < 70) return t("auth.passwordStrengthMedium");
    return t("auth.passwordStrengthStrong");
  };

  const passwordRequirements = [
    { met: newPasswordValue.length >= 8, text: t("auth.reqMin8") },
    { met: /[A-Z]/.test(newPasswordValue), text: t("auth.reqUppercase") },
    { met: /[a-z]/.test(newPasswordValue), text: t("auth.reqLowercase") },
    { met: MEMBER_PASSWORD_SPECIAL_CHAR_PATTERN.test(newPasswordValue), text: t("auth.reqSpecial") },
  ];

  const passwordsMatch =
    newPasswordValue &&
    confirmPasswordValue &&
    newPasswordValue === confirmPasswordValue;
  const passwordsDontMatch =
    newPasswordValue &&
    confirmPasswordValue &&
    newPasswordValue !== confirmPasswordValue;
  const mutedColor = isDark ? "text-gray-400" : "text-[rgb(160,159,148)]";

  // ── Loading skeleton ────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,141,11)] bg-clip-text text-transparent">
            {t("settings.title")}
          </h1>
          <p
            className="mt-1"
            style={{ color: colors.textSecondary }}
          >
            {t("settings.subtitle")}
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div
              className="rounded-2xl p-4 shadow-xl animate-pulse"
              style={glassStyle}
            >
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div
                    key={i}
                    className="h-12 rounded-xl bg-white/10"
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-3">
            <div
              className="rounded-2xl p-6 shadow-xl animate-pulse"
              style={glassStyle}
            >
              <div className="space-y-4">
                <div className="h-6 w-32 rounded bg-white/10" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-12 rounded-xl bg-white/10"
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderProfileSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Title */}
        <div>
          <label
            className="block text-sm mb-2"
            style={{ color: colors.textSecondary }}
          >
            {t("auth.title")}{" "}
            <RequiredStar />
          </label>
          <div className="relative">
            <User
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
              style={{ color: colors.textMuted }}
            />
            <select
              value={profile.title}
              onChange={(e) =>
                updateSetting(
                  "profile",
                  "title",
                  e.target.value,
                )
              }
              className="w-full pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]/40 appearance-none cursor-pointer"
              style={inputStyle}
            >
              <option value="Mr">{m('Mr')}</option>
              <option value="Miss">{m('Miss')}</option>
              <option value="Mrs">{m('Mrs')}</option>
              <option value="Ms">{m('Ms')}</option>
              <option value="Dr">{m('Dr')}</option>
            </select>
          </div>
        </div>

        {/* First Name */}
        <div>
          <label
            className="block text-sm mb-2"
            style={{ color: colors.textSecondary }}
          >
            {m('First Name (in English)')}{" "}
            <RequiredStar />
          </label>
          <div className="relative">
            <User
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
              style={{ color: colors.textMuted }}
            />
            <input
              type="text"
              value={profile.firstName}
              onChange={(e) =>
                updateSetting(
                  "profile",
                  "firstName",
                  sanitizeEnglishName(e.target.value),
                )
              }
              className="w-full pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]/40"
              style={inputStyle}
            />
          </div>
          <SettingsFieldError msg={fieldErrors["firstName"]} />
        </div>

        {/* Last Name */}
        <div>
          <label
            className="block text-sm mb-2"
            style={{ color: colors.textSecondary }}
          >
            {m('Last Name (in English)')}{" "}
            <RequiredStar />
          </label>
          <div className="relative">
            <User
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
              style={{ color: colors.textMuted }}
            />
            <input
              type="text"
              value={profile.lastName}
              onChange={(e) =>
                updateSetting(
                  "profile",
                  "lastName",
                  sanitizeEnglishName(e.target.value),
                )
              }
              className="w-full pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]/40"
              style={inputStyle}
            />
          </div>
          <SettingsFieldError msg={fieldErrors["lastName"]} />
        </div>

        {/* Email — editable (HKIAL-05). Changing email requires current password. */}
        <div>
          <label
            className="block text-sm mb-2"
            style={{ color: colors.textSecondary }}
          >
            {t("auth.email")}
          </label>
          <div className="relative">
            <Mail
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
              style={{ color: colors.textMuted }}
            />
            <input
              type="email"
              value={profile.email}
              onChange={(e) =>
                updateSetting("profile", "email", e.target.value.trim())
              }
              autoComplete="email"
              className="w-full pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]/40"
              style={inputStyle}
              data-testid="settings-email-input"
            />
          </div>
          <SettingsFieldError msg={fieldErrors["email"]} />
        </div>

        {emailChanging && (
          <div data-testid="settings-email-current-password">
            <label
              className="block text-sm mb-2"
              style={{ color: colors.textSecondary }}
            >
              {t("settings.currentPassword")}{" "}
              <RequiredStar />
            </label>
            <p
              className="text-xs mb-2"
              style={{ color: colors.textMuted }}
            >
              {t("settings.emailChangePasswordHint")}
            </p>
            <div className="relative">
              <input
                type={
                  internalShowCurrentPassword ? "text" : "password"
                }
                value={passwordFields.currentPassword}
                onChange={(e) =>
                  handlePasswordChange(
                    "currentPassword",
                    e.target.value,
                  )
                }
                placeholder={m("Enter current password")}
                autoComplete="current-password"
                className="w-full px-4 py-2 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]/40"
                style={inputStyle}
              />
              <button
                type="button"
                onClick={handleToggleCurrentPassword}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-60 transition-opacity"
                style={{ color: colors.textMuted }}
              >
                {internalShowCurrentPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <SettingsFieldError msg={fieldErrors["current_password"]} />
          </div>
        )}

        {/* Phone */}
        <div>
          <label
            className="block text-sm mb-2"
            style={{ color: colors.textSecondary }}
          >
            {t("auth.phone")}{" "}
            <RequiredStar />
          </label>
          <div className="relative">
            <Phone
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
              style={{ color: colors.textMuted }}
            />
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) =>
                updateSetting(
                  "profile",
                  "phone",
                  e.target.value,
                )
              }
              className="w-full pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]/40"
              style={inputStyle}
            />
          </div>
          <SettingsFieldError msg={fieldErrors["phone"]} />
        </div>

        {/* Nationality — ISO 3166-1 alpha-2 typeahead (mandatory) */}
        <div>
          <label
            className="block text-sm mb-2"
            style={{ color: colors.textSecondary }}
          >
            {t("auth.nationality")}{" "}
            <RequiredStar />
          </label>
          <NationalityTypeahead
            id="settings-nationality"
            value={profile.nationality ?? ""}
            required
            onChange={(code) => updateSetting("profile", "nationality", code)}
            className="w-full pl-10 pr-10 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]/40"
            listStyle={{
              ...inputStyle,
              background: isDark ? "rgba(30,30,30,0.98)" : "rgba(255,255,255,0.98)",
            }}
            highlightClassName={
              isDark ? "bg-white/15" : "bg-[rgb(231,230,221)]"
            }
            mutedClassName={mutedColor}
          />
          {profile.nationality && !isValidCountryCode(profile.nationality) && (
            <p className="mt-1 text-xs text-red-500">
              {m('Select a nationality from the list (ISO country code).')}
            </p>
          )}
          <SettingsFieldError msg={fieldErrors["nationality"]} />
        </div>

        {/* Passport First 4 Digits */}
        <div>
          <label
            className="block text-sm mb-2"
            style={{ color: colors.textSecondary }}
          >
            {t("settings.passportPrefix")}{" "}
            <span style={{ color: colors.textMuted }}>
              ({t("common.optional")})
            </span>
          </label>
          <div className="relative">
            <CreditCard
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
              style={{ color: colors.textMuted }}
            />
            <input
              type="text"
              value={profile.passportFirst4}
              onChange={handlePassportChange}
              className="w-full pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]/40"
              style={inputStyle}
              placeholder="1234"
              maxLength={4}
            />
          </div>
        </div>

        {/* Date of birth — required before membership purchase */}
        <div id="settings-birthday">
          <label
            className="block text-sm mb-2"
            style={{ color: colors.textSecondary }}
          >
            {t("settings.birthday")}{" "}
            <RequiredStar />
          </label>
          <div className="relative">
            <Calendar
              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
              style={{ color: colors.textMuted }}
            />
            <DateInput
              value={profile.birthday ?? ""}
              max={new Intl.DateTimeFormat("en-CA", {
                timeZone: "Asia/Hong_Kong",
              }).format(new Date())}
              min="1900-01-01"
              onChange={(value) =>
                updateSetting("profile", "birthday", value)
              }
              className="w-full pl-10 pr-10 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]/40"
              style={{
                ...inputStyle,
                boxShadow: highlightBirthday
                  ? "0 0 0 2px rgba(220,181,21,0.55)"
                  : undefined,
              }}
            />
          </div>
          <p className="mt-1 text-xs" style={{ color: colors.textMuted }}>
            {t("settings.birthdayRequiredHint")}
          </p>
          <SettingsFieldError msg={fieldErrors["birthday"]} />
        </div>
      </div>

      {/* Spouse / partner — optional once; locked after the first save */}
      <div id="settings-spouse" className="space-y-4 pt-2">
        <div>
          <h3
            className="text-sm flex items-center gap-2"
            style={{ color: colors.text }}
          >
            <Heart className="w-4 h-4" style={{ color: "rgb(220,181,21)" }} />
            {t("settings.spouseSection")}{" "}
            <span className="text-xs font-normal" style={{ color: colors.textMuted }}>
              ({t(spouseLocked ? "settings.spouseReadOnly" : "settings.spouseOptional")})
            </span>
          </h3>
          <p className="mt-1 text-xs" style={{ color: colors.textMuted }}>
            {t(spouseLocked ? "settings.spouseLockedHint" : "settings.spouseHint")}
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: colors.textSecondary }}
            >
              {t("auth.title")}
            </label>
            <select
              value={profile.spouseTitle ?? "Mr"}
              disabled={spouseLocked}
              aria-readonly={spouseLocked ? "true" : undefined}
              onChange={(e) => {
                if (spouseLocked) return;
                updateSetting("profile", "spouseTitle", e.target.value);
              }}
              className={`w-full px-4 py-2 rounded-xl focus:outline-none appearance-none ${
                spouseLocked
                  ? "cursor-not-allowed opacity-70"
                  : "cursor-pointer focus:ring-2 focus:ring-[rgb(220,181,21)]/40"
              }`}
              style={inputStyle}
            >
              <option value="Mr">{m("Mr")}</option>
              <option value="Miss">{m("Miss")}</option>
              <option value="Mrs">{m("Mrs")}</option>
              <option value="Ms">{m("Ms")}</option>
              <option value="Dr">{m("Dr")}</option>
            </select>
          </div>
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: colors.textSecondary }}
            >
              {m('First Name (in English)')}{" "}
              <RequiredStar />
            </label>
            <input
              type="text"
              value={profile.spouseFirstName ?? ""}
              readOnly={spouseLocked}
              disabled={spouseLocked}
              aria-readonly={spouseLocked ? "true" : undefined}
              onChange={(e) => {
                if (spouseLocked) return;
                updateSetting("profile", "spouseFirstName", sanitizeEnglishName(e.target.value));
              }}
              className={`w-full px-4 py-2 rounded-xl focus:outline-none ${
                spouseLocked
                  ? "cursor-not-allowed opacity-70"
                  : "focus:ring-2 focus:ring-[rgb(220,181,21)]/40"
              }`}
              style={inputStyle}
            />
            <SettingsFieldError msg={fieldErrors["spouseFirstName"]} />
          </div>
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: colors.textSecondary }}
            >
              {m('Last Name (in English)')}{" "}
              <RequiredStar />
            </label>
            <input
              type="text"
              value={profile.spouseLastName ?? ""}
              readOnly={spouseLocked}
              disabled={spouseLocked}
              aria-readonly={spouseLocked ? "true" : undefined}
              onChange={(e) => {
                if (spouseLocked) return;
                updateSetting("profile", "spouseLastName", sanitizeEnglishName(e.target.value));
              }}
              className={`w-full px-4 py-2 rounded-xl focus:outline-none ${
                spouseLocked
                  ? "cursor-not-allowed opacity-70"
                  : "focus:ring-2 focus:ring-[rgb(220,181,21)]/40"
              }`}
              style={inputStyle}
            />
            <SettingsFieldError msg={fieldErrors["spouseLastName"]} />
          </div>
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: colors.textSecondary }}
            >
              {t("settings.spouseEmail")}
            </label>
            <input
              type="email"
              value={profile.spouseEmail ?? ""}
              readOnly={spouseLocked}
              disabled={spouseLocked}
              aria-readonly={spouseLocked ? "true" : undefined}
              onChange={(e) => {
                if (spouseLocked) return;
                updateSetting("profile", "spouseEmail", e.target.value);
              }}
              className={`w-full px-4 py-2 rounded-xl focus:outline-none ${
                spouseLocked
                  ? "cursor-not-allowed opacity-70"
                  : "focus:ring-2 focus:ring-[rgb(220,181,21)]/40"
              }`}
              style={inputStyle}
            />
            <SettingsFieldError msg={fieldErrors["spouseEmail"]} />
          </div>
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: colors.textSecondary }}
            >
              {t("settings.spousePhone")}
            </label>
            <input
              type="tel"
              value={profile.spousePhone ?? ""}
              readOnly={spouseLocked}
              disabled={spouseLocked}
              aria-readonly={spouseLocked ? "true" : undefined}
              onChange={(e) => {
                if (spouseLocked) return;
                updateSetting("profile", "spousePhone", e.target.value);
              }}
              className={`w-full px-4 py-2 rounded-xl focus:outline-none ${
                spouseLocked
                  ? "cursor-not-allowed opacity-70"
                  : "focus:ring-2 focus:ring-[rgb(220,181,21)]/40"
              }`}
              style={inputStyle}
            />
          </div>
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: colors.textSecondary }}
            >
              {t("settings.spouseNationality")}
            </label>
            <NationalityTypeahead
              id="settings-spouse-nationality"
              value={profile.spouseNationality ?? ""}
              disabled={spouseLocked}
              onChange={(code) => {
                if (spouseLocked) return;
                updateSetting("profile", "spouseNationality", code);
              }}
              className={`w-full pl-10 pr-10 py-2 rounded-xl focus:outline-none ${
                spouseLocked
                  ? "cursor-not-allowed opacity-70"
                  : "focus:ring-2 focus:ring-[rgb(220,181,21)]/40"
              }`}
              listStyle={{
                ...inputStyle,
                background: isDark
                  ? "rgba(30,30,30,0.98)"
                  : "rgba(255,255,255,0.98)",
              }}
              highlightClassName={
                isDark ? "bg-white/15" : "bg-[rgb(231,230,221)]"
              }
              mutedClassName={mutedColor}
            />
            <SettingsFieldError msg={fieldErrors["spouseNationality"]} />
          </div>
          <div>
            <label
              className="block text-sm mb-2"
              style={{ color: colors.textSecondary }}
            >
              {t("settings.spousePassport")}
            </label>
            <input
              type="text"
              value={profile.spousePassportFirst4 ?? ""}
              readOnly={spouseLocked}
              disabled={spouseLocked}
              aria-readonly={spouseLocked ? "true" : undefined}
              onChange={(e) => {
                if (spouseLocked) return;
                updateSetting(
                  "profile",
                  "spousePassportFirst4",
                  e.target.value.slice(0, 4),
                );
              }}
              className={`w-full px-4 py-2 rounded-xl focus:outline-none ${
                spouseLocked
                  ? "cursor-not-allowed opacity-70"
                  : "focus:ring-2 focus:ring-[rgb(220,181,21)]/40"
              }`}
              style={inputStyle}
              placeholder="AB12"
              maxLength={4}
            />
          </div>
          <div id="settings-spouse-birthday">
            <label
              className="block text-sm mb-2"
              style={{ color: colors.textSecondary }}
            >
              {t("settings.spouseBirthday")}{" "}
              <RequiredStar />
            </label>
            <div className="relative">
              <Calendar
                className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4"
                style={{ color: colors.textMuted }}
              />
              <DateInput
                value={profile.spouseBirthday ?? ""}
                readOnly={spouseLocked}
                disabled={spouseLocked}
                aria-readonly={spouseLocked ? "true" : undefined}
                max={new Intl.DateTimeFormat("en-CA", {
                  timeZone: "Asia/Hong_Kong",
                }).format(new Date())}
                min="1900-01-01"
                onChange={(value) => {
                  if (spouseLocked) return;
                  updateSetting("profile", "spouseBirthday", value);
                }}
                className={`w-full pl-10 pr-10 py-2 rounded-xl focus:outline-none ${
                  spouseLocked
                    ? "cursor-not-allowed opacity-70"
                    : "focus:ring-2 focus:ring-[rgb(220,181,21)]/40"
                }`}
                style={inputStyle}
              />
            </div>
            <SettingsFieldError msg={fieldErrors["spouseBirthday"]} />
          </div>
        </div>
      </div>

      {/* Current Password */}
      <div>
        <label
          className="block text-sm mb-2"
          style={{ color: colors.textSecondary }}
        >
          {t("settings.currentPassword")}
        </label>
        <div className="relative">
          <input
            type={
              internalShowCurrentPassword ? "text" : "password"
            }
            value={passwordFields.currentPassword}
            onChange={(e) =>
              handlePasswordChange(
                "currentPassword",
                e.target.value,
              )
            }
            placeholder={m('Enter current password')}
            className="w-full px-4 py-2 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]/40"
            style={inputStyle}
          />
          <button
            onClick={handleToggleCurrentPassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-60 transition-opacity"
            style={{ color: colors.textMuted }}
          >
            {internalShowCurrentPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <SettingsFieldError msg={fieldErrors["current_password"]} />
      </div>

      {/* New Password */}
      <div>
        <label
          className="block text-sm mb-2"
          style={{ color: colors.textSecondary }}
        >
          {t("settings.newPassword")}
        </label>
        <div className="relative">
          <input
            type={internalShowNewPassword ? "text" : "password"}
            value={passwordFields.newPassword}
            onChange={(e) =>
              handlePasswordChange(
                "newPassword",
                e.target.value,
              )
            }
            placeholder={m('Enter new password')}
            className="w-full px-4 py-2 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]/40"
            style={inputStyle}
          />
          <button
            onClick={handleToggleNewPassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-60 transition-opacity"
            style={{ color: colors.textMuted }}
          >
            {internalShowNewPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <SettingsFieldError msg={fieldErrors["password"]} />
        {newPasswordValue && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs ${mutedColor}`}>
                {t("auth.password")}:
              </span>
              <span
                className="text-xs"
                style={{ color: getStrengthColor(passwordStrength) }}
              >
                {getStrengthText(passwordStrength)}
              </span>
            </div>
            <div
              className="h-2 rounded-full"
              style={{
                background: isDark
                  ? "rgba(255,255,255,0.1)"
                  : "rgba(231,230,221,0.6)",
              }}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${passwordStrength}%`,
                  background: getStrengthColor(passwordStrength),
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Confirm New Password */}
      <div>
        <label
          className="block text-sm mb-2"
          style={{ color: colors.textSecondary }}
        >
          {t("settings.confirmNewPassword")}
        </label>
        <div className="relative">
          <input
            type={
              internalShowConfirmPassword ? "text" : "password"
            }
            value={passwordFields.confirmPassword}
            onChange={(e) =>
              handlePasswordChange(
                "confirmPassword",
                e.target.value,
              )
            }
            placeholder={t("settings.confirmNewPassword")}
            className="w-full px-4 py-2 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]/40"
            style={inputStyle}
          />
          <button
            onClick={handleToggleConfirmPassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-60 transition-opacity"
            style={{ color: colors.textMuted }}
          >
            {internalShowConfirmPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        {confirmPasswordValue && (
          <div className="mt-2">
            {passwordsMatch ? (
              <div
                className="flex items-center gap-2 text-xs"
                style={{ color: "rgb(34, 197, 94)" }}
              >
                <Check className="w-4 h-4" />
                <span>{t("auth.passwordsMatch")}</span>
              </div>
            ) : passwordsDontMatch ? (
              <div
                className="flex items-center gap-2 text-xs"
                style={{ color: "rgb(239, 68, 68)" }}
              >
                <X className="w-4 h-4" />
                <span>{t("auth.passwordsDontMatch")}</span>
              </div>
            ) : null}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <p
          className={`text-xs ${mutedColor}`}
          style={{ color: colors.textSecondary }}
        >
          {t("settings.changePassword")}:
        </p>
        {passwordRequirements.map((req, index) => {
          const reqColorClass = req.met
            ? isDark
              ? "text-green-400"
              : "text-green-600"
            : mutedColor;
          return (
            <div key={index} className="flex items-center gap-2">
              {req.met ? (
                <Check
                  className="w-4 h-4"
                  style={{ color: "rgb(34, 197, 94)" }}
                />
              ) : (
                <X
                  className="w-4 h-4"
                  style={{ color: "rgb(160, 159, 148)" }}
                />
              )}
              <span className={`text-xs ${reqColorClass}`}>
                {req.text}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      {/* Theme Toggle */}
      <div
        className="rounded-xl p-5"
        style={{
          background: isDark
            ? "rgba(255,255,255,0.05)"
            : "rgba(231,230,221,0.4)",
          border: `1px solid ${colors.glassBorder}`,
        }}
      >
        <h4 className="mb-1" style={{ color: colors.text }}>
          {t("settings.theme")}
        </h4>
        <p
          className="text-sm mb-4"
          style={{ color: colors.textSecondary }}
        >
          {t("settings.lightMode")} / {t("settings.darkMode")}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isDark ? (
              <Moon
                className="w-5 h-5"
                style={{ color: colors.accent }}
              />
            ) : (
              <Sun
                className="w-5 h-5"
                style={{ color: colors.accent }}
              />
            )}
            <span style={{ color: colors.text }}>
              {isDark ? t("settings.darkMode") : t("settings.lightMode")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Sun
              className="w-4 h-4"
              style={{ color: colors.textMuted }}
            />
            <button
              onClick={() =>
                handleThemeChangeInternal(
                  isDark ? "light" : "dark",
                )
              }
              className="relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300"
              style={{
                background: isDark
                  ? "linear-gradient(90deg, rgb(220, 181, 21), rgb(180, 141, 11))"
                  : colors.other,
                border: `1px solid ${colors.glassBorder}`,
              }}
            >
              <span
                className="inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300"
                style={{
                  transform: isDark
                    ? "translateX(32px)"
                    : "translateX(4px)",
                }}
              />
            </button>
            <Moon
              className="w-4 h-4"
              style={{ color: colors.textMuted }}
            />
          </div>
        </div>
      </div>

      <div
        className="rounded-xl p-5"
        style={{
          background: isDark
            ? "rgba(255,255,255,0.05)"
            : "rgba(231,230,221,0.4)",
          border: `1px solid ${colors.glassBorder}`,
        }}
      >
        <h4 className="mb-1" style={{ color: colors.text }}>
          {t("settings.language")}
        </h4>
        <p
          className="text-sm mb-4"
          style={{ color: colors.textSecondary }}
        >
          {t("settings.languageHint")}
        </p>
        <select
          value={currentLanguage}
          onChange={(e) => handleLanguageSelect(e.target.value)}
          className="w-full px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]/40 appearance-none cursor-pointer"
          style={inputStyle}
          aria-label={t("settings.language")}
        >
          {SUPPORTED_LOCALES.map((locale) => (
            <option key={locale} value={locale}>
              {LOCALE_LABELS[locale]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case "profile":
        return renderProfileSettings();
      case "appearance":
        return renderAppearanceSettings();
      default:
        return renderProfileSettings();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,141,11)] bg-clip-text text-transparent">
          {t("settings.title")}
        </h1>
        <p
          className="mt-1"
          style={{ color: colors.textSecondary }}
        >
          {t("settings.subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div
            className="rounded-2xl p-4 shadow-xl"
            style={glassStyle}
          >
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() =>
                      handleSectionChange(section.id)
                    }
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300"
                    style={
                      isActive
                        ? {
                            background:
                              "linear-gradient(90deg, rgb(220,181,21), rgb(180,141,11))",
                            color: "#fff",
                          }
                        : {
                            color: colors.text,
                            background: "transparent",
                          }
                    }
                    onMouseEnter={handleNavEnter(isActive)}
                    onMouseLeave={handleNavLeave(isActive)}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">
                      {section.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div
            className="rounded-2xl p-6 shadow-xl"
            style={glassStyle}
          >
            <div className="flex justify-between items-center mb-6">
              <h2
                className="text-xl"
                style={{ color: colors.text }}
              >
                {
                  sections.find((s) => s.id === activeSection)
                    ?.label
                }
              </h2>
              <div className="flex items-center gap-3">
                {saveMessage && (
                  <span
                    className="text-sm"
                    style={{
                      color:
                        saveMessage === t("settings.saved") ||
                        saveMessage.includes("success") ||
                        saveMessage.includes("updated") ||
                        saveMessage.includes("成功")
                          ? "#22c55e"
                          : "#ef4444",
                    }}
                  >
                    {m(saveMessage)}
                  </span>
                )}
                <button
                  onClick={onSave}
                  disabled={isSaving}
                  className="px-4 py-2 bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,141,11)] text-white rounded-xl hover:shadow-lg transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
                >
                  {isSaving ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4" />
                  )}
                  {isSaving ? t("settings.saving") : t("settings.saveChanges")}
                </button>
              </div>
            </div>
            {renderContent()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;