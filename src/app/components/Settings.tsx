import React, { useState } from 'react';
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
  Globe,
  Loader2
} from 'lucide-react';
import { useTheme } from './ThemeContext';

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
    };
    appearance?: {
      theme?: 'light' | 'dark';
      language?: string;
    };
  };
  onTogglePassword?: () => void;
  onSectionChange?: (section: string) => void;
  onSettingChange?: (section: string, key: string, value: string) => void;
  onThemeChange?: (theme: 'light' | 'dark' | 'system') => void;
  onSave?: () => void;
}

// ── Mock data for Figma preview (used when no real props are provided) ───────
const MOCK_SETTINGS = {
  profile: {
    title: 'Mr',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    phone: '+852 9876 5432',
    nationality: 'Hong Kong SAR',
    passportFirst4: '1234',
  },
  appearance: {
    theme: 'light',
    language: 'en',
  },
};

export function Settings({
  isLoading = false,
  isSaving = false,
  saveMessage = '',
  activeSection: propActiveSection,
  showPassword: propShowPassword,
  settings: propSettings,
  onTogglePassword,
  onSectionChange,
  onSettingChange,
  onThemeChange,
  onSave,
}: SettingsProps) {
  const { mode, colors, setTheme, glassStyle } = useTheme();
  const isDark = mode === 'dark';

  // Use prop settings if provided, otherwise fall back to mock data for Figma preview
  const settings = propSettings ?? MOCK_SETTINGS;
  const profile = settings.profile ?? MOCK_SETTINGS.profile;
  const appearance = settings.appearance ?? MOCK_SETTINGS.appearance;

  // Allow parent to control active section, but default to 'profile' for Figma preview
  const [internalActiveSection, setInternalActiveSection] = useState('profile');
  const activeSection = propActiveSection ?? internalActiveSection;

  const handleSectionChange = (section: string) => {
    if (onSectionChange) {
      onSectionChange(section);
    } else {
      setInternalActiveSection(section);
    }
  };

  const [internalShowPassword, setInternalShowPassword] = useState(false);
  const showPassword = propShowPassword ?? internalShowPassword;

  const handleTogglePassword = () => {
    if (onTogglePassword) {
      onTogglePassword();
    } else {
      setInternalShowPassword((prev) => !prev);
    }
  };

  const updateSetting = (section: string, key: string, value: string) => {
    if (onSettingChange) {
      onSettingChange(section, key, value);
    }
  };

  const handleThemeChangeInternal = (newTheme: 'light' | 'dark' | 'system') => {
    if (onThemeChange) {
      onThemeChange(newTheme);
    } else {
      setTheme(newTheme === 'system' ? 'light' : newTheme);
    }
  };

  const sections = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'appearance', label: 'Appearance', icon: Palette },
  ];

  const handlePassportChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    updateSetting('profile', 'passportFirst4', value);
  };

  const navHoverBg = isDark ? 'rgba(255,255,255,0.1)' : 'rgba(231,230,221,0.6)';
  const handleNavEnter = (isActive: boolean) => (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isActive) e.currentTarget.style.background = navHoverBg;
  };
  const handleNavLeave = (isActive: boolean) => (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isActive) e.currentTarget.style.background = 'transparent';
  };

  const inputStyle: React.CSSProperties = {
    background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(231,230,221,0.7)',
    border: `1px solid ${colors.inputBorder}`,
    color: colors.inputText,
  };

  // ── Loading skeleton ────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,141,11)] bg-clip-text text-transparent">
            Settings
          </h1>
          <p className="mt-1" style={{ color: colors.textSecondary }}>
            Manage your account preferences and application settings.
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="rounded-2xl p-4 shadow-xl animate-pulse" style={glassStyle}>
              <div className="space-y-2">
                {[1, 2].map((i) => (
                  <div key={i} className="h-12 rounded-xl bg-white/10" />
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="rounded-2xl p-6 shadow-xl animate-pulse" style={glassStyle}>
              <div className="space-y-4">
                <div className="h-6 w-32 rounded bg-white/10" />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-12 rounded-xl bg-white/10" />
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
          <label className="block text-sm mb-2" style={{ color: colors.textSecondary }}>Title</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: colors.textMuted }} />
            <select
              value={profile.title}
              onChange={(e) => updateSetting('profile', 'title', e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]/40 appearance-none cursor-pointer"
              style={inputStyle}
            >
              <option value="Mr">Mr</option>
              <option value="Miss">Miss</option>
              <option value="Mrs">Mrs</option>
              <option value="Ms">Ms</option>
              <option value="Dr">Dr</option>
            </select>
          </div>
        </div>

        {/* First Name */}
        <div>
          <label className="block text-sm mb-2" style={{ color: colors.textSecondary }}>First Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: colors.textMuted }} />
            <input
              type="text"
              value={profile.firstName}
              onChange={(e) => updateSetting('profile', 'firstName', e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]/40"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Last Name */}
        <div>
          <label className="block text-sm mb-2" style={{ color: colors.textSecondary }}>Last Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: colors.textMuted }} />
            <input
              type="text"
              value={profile.lastName}
              onChange={(e) => updateSetting('profile', 'lastName', e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]/40"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm mb-2" style={{ color: colors.textSecondary }}>Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: colors.textMuted }} />
            <input
              type="email"
              value={profile.email}
              onChange={(e) => updateSetting('profile', 'email', e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]/40"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm mb-2" style={{ color: colors.textSecondary }}>Phone Number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: colors.textMuted }} />
            <input
              type="tel"
              value={profile.phone}
              onChange={(e) => updateSetting('profile', 'phone', e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]/40"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Nationality */}
        <div>
          <label className="block text-sm mb-2" style={{ color: colors.textSecondary }}>Nationality <span style={{ color: colors.textMuted }}>(Optional)</span></label>
          <div className="relative">
            <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: colors.textMuted }} />
            <input
              type="text"
              value={profile.nationality}
              onChange={(e) => updateSetting('profile', 'nationality', e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]/40"
              style={inputStyle}
              placeholder="e.g., Hong Kong SAR, United States"
            />
          </div>
        </div>

        {/* Passport First 4 Digits */}
        <div>
          <label className="block text-sm mb-2" style={{ color: colors.textSecondary }}>
            First 4 Digits of Passport Number <span style={{ color: colors.textMuted }}>(Optional)</span>
          </label>
          <div className="relative">
            <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4" style={{ color: colors.textMuted }} />
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
      </div>

      <div>
        <label className="block text-sm mb-2" style={{ color: colors.textSecondary }}>Change Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter new password"
            className="w-full px-4 py-2 pr-12 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]/40"
            style={inputStyle}
          />
          <button
            onClick={handleTogglePassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 hover:opacity-60 transition-opacity"
            style={{ color: colors.textMuted }}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );

  const renderAppearanceSettings = () => (
    <div className="space-y-6">
      {/* Theme Toggle */}
      <div className="rounded-xl p-5" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(231,230,221,0.4)', border: `1px solid ${colors.glassBorder}` }}>
        <h4 className="mb-1" style={{ color: colors.text }}>Theme</h4>
        <p className="text-sm mb-4" style={{ color: colors.textSecondary }}>Switch between dark and light mode</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isDark
              ? <Moon className="w-5 h-5" style={{ color: colors.accent }} />
              : <Sun className="w-5 h-5" style={{ color: colors.accent }} />
            }
            <span style={{ color: colors.text }}>
              {isDark ? 'Dark Mode' : 'Light Mode'}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Sun className="w-4 h-4" style={{ color: colors.textMuted }} />
            <button
              onClick={() => handleThemeChangeInternal(isDark ? 'light' : 'dark')}
              className="relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300"
              style={{
                background: isDark
                  ? 'linear-gradient(90deg, rgb(220, 181, 21), rgb(180, 141, 11))'
                  : colors.other,
                border: `1px solid ${colors.glassBorder}`,
              }}
            >
              <span
                className="inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300"
                style={{ transform: isDark ? 'translateX(32px)' : 'translateX(4px)' }}
              />
            </button>
            <Moon className="w-4 h-4" style={{ color: colors.textMuted }} />
          </div>
        </div>
      </div>

      <div className="rounded-xl p-5" style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(231,230,221,0.4)', border: `1px solid ${colors.glassBorder}` }}>
        <h4 className="mb-3" style={{ color: colors.text }}>Language</h4>
        <select
          value={appearance.language ?? 'en'}
          onChange={(e) => updateSetting('appearance', 'language', e.target.value)}
          className="w-full px-4 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]/40 appearance-none cursor-pointer"
          style={inputStyle}
        >
          <option value="en">English</option>
          <option value="es">Español</option>
          <option value="fr">Français</option>
          <option value="de">Deutsch</option>
        </select>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeSection) {
      case 'profile': return renderProfileSettings();
      case 'appearance': return renderAppearanceSettings();
      default: return renderProfileSettings();
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,141,11)] bg-clip-text text-transparent">
          Settings
        </h1>
        <p className="mt-1" style={{ color: colors.textSecondary }}>
          Manage your account preferences and application settings.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl p-4 shadow-xl" style={glassStyle}>
            <nav className="space-y-2">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => handleSectionChange(section.id)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300"
                    style={
                      isActive
                        ? { background: 'linear-gradient(90deg, rgb(220,181,21), rgb(180,141,11))', color: '#fff' }
                        : { color: colors.text, background: 'transparent' }
                    }
                    onMouseEnter={handleNavEnter(isActive)}
                    onMouseLeave={handleNavLeave(isActive)}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-sm">{section.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl p-6 shadow-xl" style={glassStyle}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl" style={{ color: colors.text }}>
                {sections.find(s => s.id === activeSection)?.label}
              </h2>
              <div className="flex items-center gap-3">
                {saveMessage && (
                  <span className="text-sm" style={{ color: saveMessage.includes('success') || saveMessage.includes('updated') ? '#22c55e' : '#ef4444' }}>
                    {saveMessage}
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
                  {isSaving ? 'Saving...' : 'Save Changes'}
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
