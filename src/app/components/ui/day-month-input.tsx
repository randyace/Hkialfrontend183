import * as React from "react";
import { useTranslation } from "react-i18next";

import {
  birthDateFromParts,
  birthDateMissingPart,
  birthDateParts,
  daysInMonth,
  encodeIncompleteBirthDate,
  type BirthDateMissingPart,
} from "@/utils/birthDate";

export interface DayMonthInputProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "defaultValue"
  > {
  /** Accepts YYYY-MM-DD / 1904-MM-DD / MM-DD / INCOMPLETE:* / null — only day & month are shown. */
  value?: string | null;
  /**
   * Emits `1904-MM-DD` when both parts selected,
   * `INCOMPLETE:DD:` / `INCOMPLETE::MM` when half-filled,
   * or `''` when cleared.
   */
  onChange?: (value: string) => void;
  /**
   * Fires whenever half-filled state changes.
   * `missing` is `'day' | 'month'` when incomplete, otherwise `null`.
   */
  onIncompleteChange?: (incomplete: boolean, missing: BirthDateMissingPart) => void;
  disabled?: boolean;
  readOnly?: boolean;
  /** When true, both selects must be filled (HTML required). Optional DOB leaves this false. */
  required?: boolean;
  /** Force showing the half-filled error even before blur (e.g. after submit attempt). */
  forceShowError?: boolean;
  id?: string;
  selectClassName?: string;
  selectStyle?: React.CSSProperties;
  errorSelectClassName?: string;
  "aria-label"?: string;
}

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

export function DayMonthInput({
  value,
  onChange,
  onIncompleteChange,
  disabled = false,
  readOnly = false,
  required = false,
  forceShowError = false,
  id,
  className,
  style,
  selectClassName,
  selectStyle,
  errorSelectClassName,
  "aria-label": ariaLabel,
  ...rest
}: DayMonthInputProps) {
  // Same i18n path as Settings labels (`t("settings.birthday")` → 出生日期（日／月）).
  const { t } = useTranslation();
  const parts = birthDateParts(value);
  const [month, setMonth] = React.useState<number | null>(parts.month);
  const [day, setDay] = React.useState<number | null>(parts.day);

  const missing = birthDateMissingPart(day, month);
  const incomplete = missing != null;

  React.useEffect(() => {
    const next = birthDateParts(value);
    setMonth(next.month);
    setDay(next.day);
  }, [value]);

  React.useEffect(() => {
    onIncompleteChange?.(incomplete, missing);
  }, [incomplete, missing, onIncompleteChange]);

  const maxDay = month != null ? daysInMonth(month) : 31;
  const dayOptions = Array.from({ length: maxDay }, (_, i) => i + 1);

  const emit = (nextDay: number | null, nextMonth: number | null) => {
    if (readOnly || disabled) return;
    const nextMissing = birthDateMissingPart(nextDay, nextMonth);
    if (nextMissing != null) {
      onChange?.(encodeIncompleteBirthDate(nextDay, nextMonth));
      return;
    }
    if (nextDay == null && nextMonth == null) {
      onChange?.("");
      return;
    }
    onChange?.(birthDateFromParts(nextDay, nextMonth));
  };

  const handleMonthChange = (raw: string) => {
    if (raw === "") {
      setMonth(null);
      emit(day, null);
      return;
    }
    const nextMonth = Number(raw);
    let nextDay = day;
    if (nextDay != null && nextDay > daysInMonth(nextMonth)) {
      nextDay = null;
    }
    setMonth(nextMonth);
    setDay(nextDay);
    emit(nextDay, nextMonth);
  };

  const handleDayChange = (raw: string) => {
    if (raw === "") {
      setDay(null);
      emit(null, month);
      return;
    }
    const nextDay = Number(raw);
    setDay(nextDay);
    emit(nextDay, month);
  };

  const locked = disabled || readOnly;
  // Half-filled is always invalid — show inline error immediately.
  // forceShowError kept for call-site compat (submit gates still set it).
  void forceShowError;
  const showError = incomplete;
  const selectCls =
    selectClassName ??
    "appearance-none rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]/40 disabled:cursor-not-allowed disabled:opacity-70";
  const errorCls =
    errorSelectClassName ?? "border border-red-500 ring-1 ring-red-400/40";
  const dayCls = `${selectCls} flex-1 min-w-0${showError && missing === "day" ? ` ${errorCls}` : ""}`;
  const monthCls = `${selectCls} flex-1 min-w-0${showError && missing === "month" ? ` ${errorCls}` : ""}`;

  const dayPlaceholder = t("settings.day");
  const monthPlaceholder = t("settings.month");
  const errorMessage =
    missing === "month"
      ? t("settings.dayMonthNeedMonth")
      : missing === "day"
        ? t("settings.dayMonthNeedDay")
        : null;

  return (
    <div
      id={id}
      className={className}
      style={style}
      role="group"
      aria-label={ariaLabel ?? t("settings.birthday")}
      aria-disabled={locked || undefined}
      aria-invalid={showError || undefined}
      {...rest}
    >
      <div className="flex gap-2">
        <label className="sr-only" htmlFor={id ? `${id}-day` : undefined}>
          {dayPlaceholder}
        </label>
        <select
          id={id ? `${id}-day` : undefined}
          value={day ?? ""}
          disabled={locked}
          required={required}
          aria-label={dayPlaceholder}
          aria-invalid={showError && missing === "day" ? true : undefined}
          className={dayCls}
          style={selectStyle}
          onChange={(e) => handleDayChange(e.target.value)}
        >
          <option value="">{dayPlaceholder}</option>
          {dayOptions.map((d) => (
            <option key={d} value={d}>
              {String(d).padStart(2, "0")}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor={id ? `${id}-month` : undefined}>
          {monthPlaceholder}
        </label>
        <select
          id={id ? `${id}-month` : undefined}
          value={month ?? ""}
          disabled={locked}
          required={required}
          aria-label={monthPlaceholder}
          aria-invalid={showError && missing === "month" ? true : undefined}
          className={monthCls}
          style={selectStyle}
          onChange={(e) => handleMonthChange(e.target.value)}
        >
          <option value="">{monthPlaceholder}</option>
          {MONTH_OPTIONS.map((mo) => (
            <option key={mo} value={mo}>
              {String(mo).padStart(2, "0")}
            </option>
          ))}
        </select>
      </div>
      {showError && errorMessage ? (
        <p
          className="mt-1 text-xs text-red-500"
          role="alert"
          data-testid={id ? `${id}-error` : "day-month-error"}
        >
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
