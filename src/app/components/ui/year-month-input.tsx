import * as React from "react";
import { useTranslation } from "react-i18next";

import {
  birthDateFromParts,
  birthDateMissingPart,
  birthDateParts,
  encodeIncompleteBirthDate,
  maxBirthYear,
  type BirthDateMissingPart,
} from "@/utils/birthDate";

export interface YearMonthInputProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "defaultValue"
  > {
  /** Accepts YYYY-MM-DD / YYYY-MM / INCOMPLETE:* / null — only year & month are shown. */
  value?: string | null;
  /**
   * Emits `YYYY-MM-01` when both parts selected,
   * `INCOMPLETE:YYYY:` / `INCOMPLETE::MM` when half-filled,
   * or `''` when cleared.
   */
  onChange?: (value: string) => void;
  onIncompleteChange?: (incomplete: boolean, missing: BirthDateMissingPart) => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  forceShowError?: boolean;
  id?: string;
  selectClassName?: string;
  selectStyle?: React.CSSProperties;
  errorSelectClassName?: string;
  "aria-label"?: string;
}

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

function yearOptions(now = new Date()): number[] {
  const max = maxBirthYear(now);
  const years: number[] = [];
  for (let y = max; y >= 1900; y -= 1) years.push(y);
  return years;
}

export function YearMonthInput({
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
}: YearMonthInputProps) {
  const { t } = useTranslation();
  const parts = birthDateParts(value);
  const [year, setYear] = React.useState<number | null>(parts.year);
  const [month, setMonth] = React.useState<number | null>(parts.month);

  const missing = birthDateMissingPart(year, month);
  const incomplete = missing != null;

  React.useEffect(() => {
    const next = birthDateParts(value);
    setYear(next.year);
    setMonth(next.month);
  }, [value]);

  React.useEffect(() => {
    onIncompleteChange?.(incomplete, missing);
  }, [incomplete, missing, onIncompleteChange]);

  const emit = (nextYear: number | null, nextMonth: number | null) => {
    if (readOnly || disabled) return;
    const nextMissing = birthDateMissingPart(nextYear, nextMonth);
    if (nextMissing != null) {
      onChange?.(encodeIncompleteBirthDate(nextYear, nextMonth));
      return;
    }
    if (nextYear == null && nextMonth == null) {
      onChange?.("");
      return;
    }
    onChange?.(birthDateFromParts(nextYear, nextMonth));
  };

  const handleYearChange = (raw: string) => {
    if (raw === "") {
      setYear(null);
      emit(null, month);
      return;
    }
    const nextYear = Number(raw);
    setYear(nextYear);
    emit(nextYear, month);
  };

  const handleMonthChange = (raw: string) => {
    if (raw === "") {
      setMonth(null);
      emit(year, null);
      return;
    }
    const nextMonth = Number(raw);
    setMonth(nextMonth);
    emit(year, nextMonth);
  };

  const locked = disabled || readOnly;
  void forceShowError;
  const showError = incomplete;
  const selectCls =
    selectClassName ??
    "appearance-none rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]/40 disabled:cursor-not-allowed disabled:opacity-70";
  const errorCls =
    errorSelectClassName ?? "border border-red-500 ring-1 ring-red-400/40";
  const yearCls = `${selectCls} flex-1 min-w-0${showError && missing === "year" ? ` ${errorCls}` : ""}`;
  const monthCls = `${selectCls} flex-1 min-w-0${showError && missing === "month" ? ` ${errorCls}` : ""}`;

  const yearPlaceholder = t("settings.year");
  const monthPlaceholder = t("settings.month");
  const errorMessage =
    missing === "month"
      ? t("settings.yearMonthNeedMonth")
      : missing === "year"
        ? t("settings.yearMonthNeedYear")
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
        <label className="sr-only" htmlFor={id ? `${id}-year` : undefined}>
          {yearPlaceholder}
        </label>
        <select
          id={id ? `${id}-year` : undefined}
          value={year ?? ""}
          disabled={locked}
          required={required}
          aria-label={yearPlaceholder}
          aria-invalid={showError && missing === "year" ? true : undefined}
          className={yearCls}
          style={selectStyle}
          onChange={(e) => handleYearChange(e.target.value)}
        >
          <option value="">{yearPlaceholder}</option>
          {yearOptions().map((y) => (
            <option key={y} value={y}>
              {y}
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
          data-testid={id ? `${id}-error` : "year-month-error"}
        >
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
