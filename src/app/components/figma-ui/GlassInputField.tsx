/**
 * GlassInputField
 * Glassmorphic input / select / textarea with label, error, and help-text.
 * Zero internal state — all values and handlers are prop-driven.
 */
import React from 'react';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';
import { palette } from './tokens';

export type InputType =
  | 'text'
  | 'email'
  | 'password'
  | 'number'
  | 'tel'
  | 'date'
  | 'time'
  | 'datetime-local'
  | 'search'
  | 'url';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface GlassInputFieldProps {
  /** Displayed label text */
  label?: string;
  /** Placeholder shown when empty */
  placeholder?: string;
  /** Controlled value */
  value?: string;
  /** Input type — ignored when `as="select"` or `as="textarea"` */
  type?: InputType;
  /** Element variant */
  as?: 'input' | 'select' | 'textarea';
  /** Options list — only used when `as="select"` */
  options?: SelectOption[];
  /** Number of rows — only used when `as="textarea"` */
  rows?: number;
  /** Inline error message */
  error?: string;
  /** Subordinate help text shown below field */
  helpText?: string;
  /** Icon rendered on the left side */
  iconLeft?: React.ReactNode;
  /** Marks field as required */
  required?: boolean;
  /** Marks field as disabled */
  disabled?: boolean;
  /** Whether a password field shows the reveal toggle */
  showPasswordToggle?: boolean;
  /** Controlled visibility state for password */
  passwordVisible?: boolean;
  /** Callback to toggle password visibility */
  onTogglePassword?: () => void;
  /** Change callback — receives the new string value */
  onChange?: (value: string) => void;
  /** Focus callback */
  onFocus?: () => void;
  /** Blur callback */
  onBlur?: () => void;
  /** Dark-mode flag */
  isDark?: boolean;
  /** HTML id (auto-derived from label if omitted) */
  id?: string;
  /** Extra class applied to the outer wrapper */
  className?: string;
}

export function GlassInputField({
  label,
  placeholder,
  value,
  type = 'text',
  as = 'input',
  options = [],
  rows = 4,
  error,
  helpText,
  iconLeft,
  required = false,
  disabled = false,
  showPasswordToggle = false,
  passwordVisible = false,
  onTogglePassword,
  onChange,
  onFocus,
  onBlur,
  isDark = false,
  id,
  className = '',
}: GlassInputFieldProps) {
  const p = palette(isDark);

  // Derive a stable id from the label if none provided
  const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  // ── Computed styles ──────────────────────────────────────────────────────────
  const wrapperStyle: React.CSSProperties = {
    background: error
      ? isDark
        ? 'rgba(239,68,68,0.08)'
        : 'rgba(239,68,68,0.04)'
      : p.inputBackground,
    border: error
      ? isDark
        ? '1px solid rgba(239,68,68,0.5)'
        : '1px solid rgba(239,68,68,0.4)'
      : `1px solid ${p.inputBorder}`,
    backdropFilter: 'blur(8px)',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const inputTextStyle: React.CSSProperties = {
    color: p.inputText,
    background: 'transparent',
    caretColor: p.inputText,
  };

  const placeholderClass = isDark
    ? 'placeholder-[#9ca3af]'
    : 'placeholder-[rgb(160,159,148)]';

  const labelColor = error
    ? isDark
      ? '#fca5a5'
      : 'rgb(185,28,28)'
    : p.text;

  const helpColor = error
    ? isDark
      ? '#fca5a5'
      : 'rgb(185,28,28)'
    : p.textMuted;

  const disabledWrapperStyle: React.CSSProperties = disabled
    ? { opacity: 0.5, cursor: 'not-allowed' }
    : {};

  // ── Resolved input type (password toggle) ──────────────────────────────────
  const resolvedType = type === 'password' && passwordVisible ? 'text' : type;

  // ── Handlers ─────────────────────────────────────────────────────────────────
  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ) {
    if (onChange) onChange(e.target.value);
  }

  function handleTogglePassword() {
    if (onTogglePassword) onTogglePassword();
  }

  // ── Shared inner field classes ─────────────────────────────────────────────
  const fieldClass = [
    'flex-1 min-w-0 bg-transparent outline-none',
    'text-sm',
    placeholderClass,
    disabled ? 'cursor-not-allowed' : '',
  ]
    .filter(Boolean)
    .join(' ');

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className={`flex flex-col gap-1.5 ${className}`} style={disabledWrapperStyle}>
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-medium"
          style={{ color: labelColor }}
        >
          {label}
          {required && (
            <span className="ml-1" style={{ color: 'rgb(220,181,21)' }}>
              *
            </span>
          )}
        </label>
      )}

      {/* Field wrapper */}
      <div
        className="flex items-center gap-2 rounded-xl px-3 py-2.5"
        style={wrapperStyle}
      >
        {iconLeft && (
          <span className="flex-shrink-0 w-4 h-4" style={{ color: p.textMuted }}>
            {iconLeft}
          </span>
        )}

        {as === 'select' && (
          <select
            id={inputId}
            value={value}
            disabled={disabled}
            onChange={handleChange}
            onFocus={onFocus}
            onBlur={onBlur}
            className={`${fieldClass} cursor-pointer`}
            style={inputTextStyle}
          >
            {placeholder && (
              <option value="" disabled style={{ color: p.inputPlaceholder }}>
                {placeholder}
              </option>
            )}
            {options.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                {opt.label}
              </option>
            ))}
          </select>
        )}

        {as === 'textarea' && (
          <textarea
            id={inputId}
            value={value}
            placeholder={placeholder}
            rows={rows}
            disabled={disabled}
            onChange={handleChange}
            onFocus={onFocus}
            onBlur={onBlur}
            className={`${fieldClass} resize-y`}
            style={inputTextStyle}
          />
        )}

        {as === 'input' && (
          <input
            id={inputId}
            type={resolvedType}
            value={value}
            placeholder={placeholder}
            disabled={disabled}
            onChange={handleChange}
            onFocus={onFocus}
            onBlur={onBlur}
            className={fieldClass}
            style={inputTextStyle}
          />
        )}

        {/* Error icon */}
        {error && (
          <AlertCircle
            className="flex-shrink-0 w-4 h-4"
            style={{ color: isDark ? '#f87171' : 'rgb(185,28,28)' }}
          />
        )}

        {/* Password toggle */}
        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            onClick={handleTogglePassword}
            className="flex-shrink-0 transition-opacity hover:opacity-70"
            style={{ color: p.textMuted }}
          >
            {passwordVisible ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}
      </div>

      {/* Help / error text */}
      {(helpText || error) && (
        <p className="text-xs" style={{ color: helpColor }}>
          {error ?? helpText}
        </p>
      )}
    </div>
  );
}
