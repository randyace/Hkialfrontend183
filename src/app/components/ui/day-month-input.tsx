import * as React from "react";

import {
  birthDateFromParts,
  birthDateMissingPart,
  birthDateParts,
  daysInMonth,
  type BirthDateMissingPart,
} from "@/utils/birthDate";
import { useMsg } from "@/i18n/useMsg";

export interface DayMonthInputProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "defaultValue"
  > {
  /** Accepts YYYY-MM-DD / 1904-MM-DD / MM-DD / null — only day & month are shown. */
  value?: string | null;
  /** Emits `1904-MM-DD` when both parts selected, or `''` when cleared. */
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
  const m = useMsg();
  const parts = birthDateParts(value);
  const [month, setMonth] = React.useState<number | null>(parts.month);
  const [day, setDay] = React.useState<number | null>(parts.day);
  const [touched, setTouched] = React.useState(false);
  const incompleteDraftRef = React.useRef(false);

  const missing = birthDateMissingPart(day, month);
  const incomplete = missing != null;

  React.useEffect(() => {
    const next = birthDateParts(value);
    if (next.day != null && next.month != null) {
      incompleteDraftRef.current = false;
      setMonth(next.month);
      setDay(next.day);
      return;
    }
    // Parent cleared value — keep local draft while half-filled so the user
    // can finish the other select without losing the first choice.
    if (!value && incompleteDraftRef.current) {
      return;
    }
    incompleteDraftRef.current = false;
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
    incompleteDraftRef.current = nextMissing != null;
    if (nextMissing != null) {
      // Half-filled: clear parent stored value so API never gets a partial date,
      // while local state retains the selected part.
      onChange?.("");
      return;
    }
    onChange?.(birthDateFromParts(nextDay, nextMonth));
  };

  const handleMonthChange = (raw: string) => {
    setTouched(true);
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
    setTouched(true);
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
  const showError = incomplete && (touched || forceShowError);
  const selectCls =
    selectClassName ??
    "appearance-none rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]/40 disabled:cursor-not-allowed disabled:opacity-70";
  const errorCls =
    errorSelectClassName ?? "border border-red-500 ring-1 ring-red-400/40";
  const dayCls = `${selectCls} flex-1 min-w-0${showError && missing === "day" ? ` ${errorCls}` : ""}`;
  const monthCls = `${selectCls} flex-1 min-w-0${showError && missing === "month" ? ` ${errorCls}` : ""}`;

  const dayPlaceholder = m("Day");
  const monthPlaceholder = m("Month");
  const errorMessage =
    missing === "month"
      ? m("Please also select the month.")
      : missing === "day"
        ? m("Please also select the day.")
        : null;

  return (
    <div
      id={id}
      className={className}
      style={style}
      role="group"
      aria-label={ariaLabel ?? m("Date of Birth (Day / Month)")}
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
          onBlur={() => setTouched(true)}
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
          onBlur={() => setTouched(true)}
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
        <p className="mt-1 text-xs text-red-500" role="alert" data-testid={id ? `${id}-error` : "day-month-error"}>
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
