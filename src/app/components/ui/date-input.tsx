import * as React from "react";
import { useTranslation } from "react-i18next";

import {
  CustomDatePicker,
  formatDateValue,
  parseDateValue,
} from "@/components/ui/CustomDatePicker";
import { getAppLocale, toBcp47Locale } from "@/i18n";

export const DATE_INPUT_PLACEHOLDER = "dd/mm/yyyy";

export interface DateInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    | "type"
    | "value"
    | "defaultValue"
    | "onChange"
    | "min"
    | "max"
    | "placeholder"
  > {
  /** Canonical date value used by the application and API. */
  value?: string | null;
  /** Receives the canonical `YYYY-MM-DD` value, or an empty string. */
  onChange?: (value: string) => void;
  /** Canonical `YYYY-MM-DD` bounds. */
  min?: string;
  max?: string;
  /** Optional BCP-47 / app locale tag for the calendar popup. */
  locale?: string;
  placeholder?: string;
}

function dateFromParts(year: number, month: number, day: number): Date | null {
  const date = new Date();
  date.setHours(0, 0, 0, 0);
  date.setFullYear(year, month - 1, day);

  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function parseIsoDate(value: string | null | undefined): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec((value ?? "").trim());
  if (!match) return null;

  return dateFromParts(
    Number(match[1]),
    Number(match[2]),
    Number(match[3]),
  );
}

export function formatIsoDateForDisplay(
  value: string | null | undefined,
): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec((value ?? "").trim());
  if (!match || !parseIsoDate(value)) return "";
  return `${match[3]}/${match[2]}/${match[1]}`;
}

export function parseDisplayDate(value: string): string | null {
  const match = /^(\d{1,2})[/. -](\d{1,2})[/. -](\d{4})$/.exec(value.trim());
  if (!match) return null;

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  if (!dateFromParts(year, month, day)) return null;

  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function formatDateForInput(value: string): string {
  const iso = value.trim();
  const isoMatch = /^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})$/.exec(iso);
  if (isoMatch) {
    return `${isoMatch[3].padStart(2, "0")}/${isoMatch[2].padStart(2, "0")}/${isoMatch[1]}`;
  }

  const parts = iso.split(/[/. -]/).filter((part) => part.length > 0);
  if (parts.length > 1) {
    return parts
      .slice(0, 3)
      .map((part, index) =>
        part.replace(/\D/g, "").slice(0, index === 2 ? 4 : 2),
      )
      .join("/");
  }

  const digits = iso.replace(/\D/g, "").slice(0, 8);
  if (digits.length <= 2) return digits;
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function DateInput({
  value,
  onChange,
  min,
  max,
  locale,
  placeholder = DATE_INPUT_PLACEHOLDER,
  className,
  style,
  disabled = false,
  readOnly = false,
  required = false,
  name,
  id,
  onBlur,
  onFocus,
  onKeyDown,
}: DateInputProps) {
  const { i18n } = useTranslation();
  const resolvedLocale =
    locale ?? toBcp47Locale(i18n.language || getAppLocale());

  return (
    <>
      <CustomDatePicker
        id={id}
        mode="date"
        value={parseDateValue(value)}
        onChange={(date) => onChange?.(formatDateValue(date))}
        minDate={parseDateValue(min)}
        maxDate={parseDateValue(max)}
        disabled={disabled || readOnly}
        required={required}
        isClearable={!required}
        placeholderText={placeholder}
        className={className}
        style={style}
        locale={resolvedLocale}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
      />
      {name && <input type="hidden" name={name} value={value ?? ""} />}
    </>
  );
}
