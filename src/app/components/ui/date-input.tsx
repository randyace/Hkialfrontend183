import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays } from "lucide-react";
import type { Formatters, Labels, Matcher } from "react-day-picker";

import { Calendar } from "./calendar";
import {
  Popover,
  PopoverAnchor,
  PopoverContent,
  PopoverTrigger,
} from "./popover";
import { cn } from "./utils";
import { useTheme } from "../ThemeContext";

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
  /** Optional BCP-47 tag for the calendar popup. */
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

function isoDateFromDate(date: Date): string {
  return [
    String(date.getFullYear()).padStart(4, "0"),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function hktTodayIso(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Hong_Kong",
  }).format(new Date());
}

function resolveCalendarLocale(locale?: string): string {
  const raw =
    locale ??
    (typeof document !== "undefined"
      ? document.documentElement.lang
      : "en-GB");
  const normalized = raw.trim().replace("_", "-").toLowerCase();

  if (normalized.startsWith("zh-hans") || normalized === "zh-cn") {
    return "zh-CN";
  }
  if (
    normalized.startsWith("zh-hant") ||
    normalized === "zh-tw" ||
    normalized === "zh-hk" ||
    normalized === "zh-mo"
  ) {
    return "zh-HK";
  }
  if (normalized.startsWith("en")) return "en-GB";
  return raw || "en-GB";
}

function isWithinBounds(
  value: string,
  min: string | undefined,
  max: string | undefined,
): boolean {
  return (!min || value >= min) && (!max || value <= max);
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
  onBlur,
  onFocus,
  onKeyDown,
  ...inputProps
}: DateInputProps) {
  const { mode } = useTheme();
  const canonicalValue = formatIsoDateForDisplay(value);
  const [draft, setDraft] = useState(canonicalValue);
  const [focused, setFocused] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const calendarLocale = resolveCalendarLocale(locale);

  useEffect(() => {
    if (!focused) {
      setDraft(canonicalValue);
      setInvalid(false);
    }
  }, [canonicalValue, focused]);

  const minDate = useMemo(() => parseIsoDate(min), [min]);
  const maxDate = useMemo(() => parseIsoDate(max), [max]);
  const selectedDate = useMemo(() => parseIsoDate(value), [value]);
  const todayDate = useMemo(
    () => parseIsoDate(hktTodayIso()) ?? new Date(),
    [],
  );

  const disabledDays = useMemo<Matcher[]>(() => {
    const matchers: Matcher[] = [];
    if (minDate) matchers.push({ before: minDate });
    if (maxDate) matchers.push({ after: maxDate });
    return matchers;
  }, [maxDate, minDate]);

  const formatters = useMemo<Formatters>(() => {
    const monthYear = new Intl.DateTimeFormat(calendarLocale, {
      month: "long",
      year: "numeric",
    });
    const month = new Intl.DateTimeFormat(calendarLocale, {
      month: "long",
    });
    const year = new Intl.DateTimeFormat(calendarLocale, {
      year: "numeric",
    });
    const weekday = new Intl.DateTimeFormat(calendarLocale, {
      weekday: "short",
    });

    return {
      formatCaption: (date) => monthYear.format(date),
      formatMonthCaption: (date) => month.format(date),
      formatYearCaption: (date) => year.format(date),
      formatDay: (date) => String(date.getDate()),
      formatWeekNumber: (weekNumber) => String(weekNumber),
      formatWeekdayName: (date) => weekday.format(date),
    };
  }, [calendarLocale]);

  const labels = useMemo<Labels>(() => {
    const fullDate = new Intl.DateTimeFormat(calendarLocale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
    const weekday = new Intl.DateTimeFormat(calendarLocale, {
      weekday: "long",
    });
    const isChinese = calendarLocale.startsWith("zh");
    const isSimplified = calendarLocale === "zh-CN";

    return {
      labelMonthDropdown: () => (isChinese ? "月份" : "Month"),
      labelYearDropdown: () => (isChinese ? "年份" : "Year"),
      labelNext: (date) =>
        `${isChinese ? (isSimplified ? "下个月" : "下個月") : "Next month"}${date ? `: ${formatters.formatCaption(date)}` : ""}`,
      labelPrevious: (date) =>
        `${isChinese ? (isSimplified ? "上个月" : "上個月") : "Previous month"}${date ? `: ${formatters.formatCaption(date)}` : ""}`,
      labelDay: (date) => fullDate.format(date),
      labelWeekday: (date) => weekday.format(date),
      labelWeekNumber: (weekNumber) =>
        `${isChinese ? "第" : "Week "}${weekNumber}${isChinese ? (isSimplified ? "周" : "週") : ""}`,
    };
  }, [calendarLocale, formatters]);

  const emitDraft = (raw: string) => {
    const nextDraft = formatDateForInput(raw);
    setDraft(nextDraft);

    const nextValue = parseDisplayDate(nextDraft);
    if (
      !nextValue ||
      !isWithinBounds(nextValue, min, max)
    ) {
      setInvalid(nextDraft.length > 0);
      onChange?.("");
      return;
    }

    setInvalid(false);
    setDraft(formatIsoDateForDisplay(nextValue));
    onChange?.(nextValue);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    const nextValue = parseDisplayDate(draft);
    if (draft && (!nextValue || !isWithinBounds(nextValue, min, max))) {
      setDraft("");
      setInvalid(true);
      onChange?.("");
    } else if (nextValue) {
      setDraft(formatIsoDateForDisplay(nextValue));
      setInvalid(false);
      onChange?.(nextValue);
    } else {
      setDraft("");
      setInvalid(false);
      onChange?.("");
    }

    setFocused(false);
    onBlur?.(event);
  };

  const handleSelect = (date: Date | undefined) => {
    if (!date) return;
    const nextValue = isoDateFromDate(date);
    if (!isWithinBounds(nextValue, min, max)) return;

    setDraft(formatIsoDateForDisplay(nextValue));
    setInvalid(false);
    onChange?.(nextValue);
    setOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") setOpen(false);
    if (
      (event.key === "Enter" || event.key === "ArrowDown") &&
      !disabled &&
      !readOnly
    ) {
      setOpen(true);
    }
    onKeyDown?.(event);
  };

  const popupClass = mode === "dark"
    ? "w-auto border-white/20 bg-[#0a1929] p-1 text-white"
    : "w-auto border-gray-200 bg-white p-1 text-gray-900";

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div className="relative min-w-0 flex-1">
          <input
            {...inputProps}
            ref={inputRef}
            id={inputProps.id}
            name={name ? `${name}-display` : undefined}
            type="text"
            inputMode="numeric"
            autoComplete={inputProps.autoComplete ?? "off"}
            value={draft}
            placeholder={placeholder}
            disabled={disabled}
            readOnly={readOnly}
            required={required}
            maxLength={10}
            data-date-value={value ?? ""}
            aria-haspopup="dialog"
            aria-expanded={open}
            aria-invalid={invalid ? "true" : inputProps["aria-invalid"]}
            className={cn(className, "w-full pr-10")}
            style={style}
            onChange={(event) => {
              if (!readOnly) emitDraft(event.target.value);
            }}
            onClick={() => {
              if (!disabled && !readOnly) setOpen(true);
            }}
            onFocus={(event) => {
              setFocused(true);
              setInvalid(false);
              onFocus?.(event);
            }}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
          />
          <PopoverTrigger asChild>
            <button
              type="button"
              tabIndex={disabled || readOnly ? -1 : 0}
              disabled={disabled || readOnly}
              aria-label={
                calendarLocale === "zh-CN"
                  ? "打开日历"
                  : calendarLocale.startsWith("zh")
                    ? "開啟日曆"
                    : "Open calendar"
              }
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-gray-400 hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <CalendarDays className="h-4 w-4" aria-hidden="true" />
            </button>
          </PopoverTrigger>
        </div>
      </PopoverAnchor>
      {name && <input type="hidden" name={name} value={value ?? ""} />}
      <PopoverContent side="bottom" align="start" className={popupClass}>
        <Calendar
          mode="single"
          selected={selectedDate ?? undefined}
          defaultMonth={selectedDate ?? minDate ?? maxDate ?? todayDate}
          onSelect={handleSelect}
          disabled={disabledDays.length > 0 ? disabledDays : undefined}
          formatters={formatters}
          labels={labels}
          weekStartsOn={1}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
