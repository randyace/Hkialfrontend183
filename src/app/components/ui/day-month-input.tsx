import * as React from "react";

import {
  birthDateFromParts,
  birthDateParts,
  daysInMonth,
} from "@/utils/birthDate";

export interface DayMonthInputProps
  extends Omit<
    React.HTMLAttributes<HTMLDivElement>,
    "onChange" | "defaultValue"
  > {
  /** Accepts YYYY-MM-DD / 1904-MM-DD / MM-DD / null — only day & month are shown. */
  value?: string | null;
  /** Emits `1904-MM-DD` when both parts selected, or `''` when cleared. */
  onChange?: (value: string) => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  id?: string;
  selectClassName?: string;
  selectStyle?: React.CSSProperties;
  "aria-label"?: string;
}

const MONTH_OPTIONS = Array.from({ length: 12 }, (_, i) => i + 1);

export function DayMonthInput({
  value,
  onChange,
  disabled = false,
  readOnly = false,
  required = false,
  id,
  className,
  style,
  selectClassName,
  selectStyle,
  "aria-label": ariaLabel,
  ...rest
}: DayMonthInputProps) {
  const parts = birthDateParts(value);
  const [month, setMonth] = React.useState<number | null>(parts.month);
  const [day, setDay] = React.useState<number | null>(parts.day);

  React.useEffect(() => {
    const next = birthDateParts(value);
    setMonth(next.month);
    setDay(next.day);
  }, [value]);

  const maxDay = month != null ? daysInMonth(month) : 31;
  const dayOptions = Array.from({ length: maxDay }, (_, i) => i + 1);

  const emit = (nextDay: number | null, nextMonth: number | null) => {
    if (readOnly || disabled) return;
    onChange?.(birthDateFromParts(nextDay, nextMonth));
  };

  const handleMonthChange = (raw: string) => {
    if (raw === "") {
      setMonth(null);
      setDay(null);
      emit(null, null);
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
  const selectCls =
    selectClassName ??
    "appearance-none rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]/40 disabled:cursor-not-allowed disabled:opacity-70";

  return (
    <div
      id={id}
      className={className}
      style={style}
      role="group"
      aria-label={ariaLabel ?? "Date of birth day and month"}
      aria-disabled={locked || undefined}
      {...rest}
    >
      <div className="flex gap-2">
        <label className="sr-only" htmlFor={id ? `${id}-day` : undefined}>
          Day
        </label>
        <select
          id={id ? `${id}-day` : undefined}
          value={day ?? ""}
          disabled={locked}
          required={required}
          aria-label="Day"
          className={`${selectCls} flex-1 min-w-0`}
          style={selectStyle}
          onChange={(e) => handleDayChange(e.target.value)}
        >
          <option value="">Day</option>
          {dayOptions.map((d) => (
            <option key={d} value={d}>
              {String(d).padStart(2, "0")}
            </option>
          ))}
        </select>
        <label className="sr-only" htmlFor={id ? `${id}-month` : undefined}>
          Month
        </label>
        <select
          id={id ? `${id}-month` : undefined}
          value={month ?? ""}
          disabled={locked}
          required={required}
          aria-label="Month"
          className={`${selectCls} flex-1 min-w-0`}
          style={selectStyle}
          onChange={(e) => handleMonthChange(e.target.value)}
        >
          <option value="">Month</option>
          {MONTH_OPTIONS.map((m) => (
            <option key={m} value={m}>
              {String(m).padStart(2, "0")}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
