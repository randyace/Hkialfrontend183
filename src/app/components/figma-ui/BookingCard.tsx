/**
 * BookingCard
 * Portal-specific card representing a single lounge booking in list views.
 * All actions (view, edit, cancel, download) are prop callbacks.
 * Zero internal state.
 */
import React from 'react';
import {
  Calendar,
  Clock,
  Plane,
  Users,
  MapPin,
  Edit,
  Trash2,
  Eye,
  Download,
  Hash,
  ArrowRight,
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { palette, GOLD, type BookingStatus } from './tokens';

export interface BookingCardProps {
  /** Booking reference code */
  bookingRef: string;
  /** Lounge name */
  lounge: string;
  /** Terminal identifier */
  terminal: string;
  /** ISO date string (YYYY-MM-DD) */
  date: string;
  /** Time string (HH:MM) */
  time: string;
  /** Duration label e.g. "3 hours" */
  duration?: string;
  /** Flight identifier e.g. "CX 888 to London" */
  flight: string;
  /** Flight type */
  flightType?: 'Departure' | 'Arrival' | 'Transit';
  /** Total number of guests (excluding account holder) */
  guests: number;
  /** Booking status */
  status: BookingStatus;
  /** List of selected amenities */
  amenities?: string[];
  /** Total booking cost */
  totalAmount?: number;
  /** View detail callback */
  onView?: () => void;
  /** Edit booking callback */
  onEdit?: () => void;
  /** Cancel booking callback */
  onCancel?: () => void;
  /** Download PDF/receipt callback */
  onDownload?: () => void;
  /** Dark-mode flag */
  isDark?: boolean;
  /** Extra classes on root element */
  className?: string;
}

export function BookingCard({
  bookingRef,
  lounge,
  terminal,
  date,
  time,
  duration,
  flight,
  flightType = 'Departure',
  guests,
  status,
  amenities = [],
  totalAmount,
  onView,
  onEdit,
  onCancel,
  onDownload,
  isDark = false,
  className = '',
}: BookingCardProps) {
  const p = palette(isDark);

  // ── Styles ──────────────────────────────────────────────────────────────────
  const cardStyle: React.CSSProperties = {
    backdropFilter: 'blur(16px)',
    background: p.glassBackground,
    border: `1px solid ${p.glassBorder}`,
    boxShadow: p.glassShadow,
  };

  const dividerStyle: React.CSSProperties = {
    borderTop: `1px solid ${p.glassBorder}`,
  };

  const metaColor = p.textMuted;
  const labelColor = p.textSecondary;

  const isCancellable = status === 'confirmed' || status === 'pending';
  const isEditable = status === 'confirmed' || status === 'pending';

  // ── Formatted date ───────────────────────────────────────────────────────────
  const formattedDate = new Date(date).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  // ── Handlers ────────────────────────────────────────────────────────────────
  function handleView() {
    if (onView) onView();
  }
  function handleEdit() {
    if (onEdit) onEdit();
  }
  function handleCancel() {
    if (onCancel) onCancel();
  }
  function handleDownload() {
    if (onDownload) onDownload();
  }

  return (
    <div
      className={`rounded-2xl overflow-hidden transition-shadow hover:shadow-xl ${className}`}
      style={cardStyle}
    >
      {/* Top: lounge + status */}
      <div className="px-5 pt-5 pb-4 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="truncate" style={{ color: p.text }}>
              {lounge}
            </h3>
            <StatusBadge status={status} isDark={isDark} size="sm" />
          </div>
          <div className="flex items-center gap-1.5 text-xs" style={{ color: metaColor }}>
            <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{terminal}</span>
            {flightType && (
              <>
                <span>·</span>
                <span>{flightType}</span>
              </>
            )}
          </div>
        </div>
        {totalAmount !== undefined && (
          <p className="text-sm font-semibold flex-shrink-0" style={{ color: GOLD }}>
            HKD {totalAmount.toLocaleString()}
          </p>
        )}
      </div>

      {/* Middle: key details grid */}
      <div
        className="px-5 py-4 grid grid-cols-2 sm:grid-cols-4 gap-y-3 gap-x-4"
        style={dividerStyle}
      >
        {/* Date */}
        <div>
          <p className="text-xs mb-0.5" style={{ color: metaColor }}>
            Date
          </p>
          <div
            className="flex items-center gap-1.5 text-sm font-medium"
            style={{ color: p.text }}
          >
            <Calendar className="w-3.5 h-3.5 flex-shrink-0" style={{ color: GOLD }} />
            {formattedDate}
          </div>
        </div>

        {/* Time */}
        <div>
          <p className="text-xs mb-0.5" style={{ color: metaColor }}>
            Time
          </p>
          <div
            className="flex items-center gap-1.5 text-sm font-medium"
            style={{ color: p.text }}
          >
            <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: GOLD }} />
            {time}
            {duration && <span style={{ color: labelColor }}>({duration})</span>}
          </div>
        </div>

        {/* Flight */}
        <div>
          <p className="text-xs mb-0.5" style={{ color: metaColor }}>
            Flight
          </p>
          <div
            className="flex items-center gap-1.5 text-sm font-medium"
            style={{ color: p.text }}
          >
            <Plane className="w-3.5 h-3.5 flex-shrink-0" style={{ color: GOLD }} />
            <span className="truncate">{flight}</span>
          </div>
        </div>

        {/* Guests */}
        <div>
          <p className="text-xs mb-0.5" style={{ color: metaColor }}>
            Guests
          </p>
          <div
            className="flex items-center gap-1.5 text-sm font-medium"
            style={{ color: p.text }}
          >
            <Users className="w-3.5 h-3.5 flex-shrink-0" style={{ color: GOLD }} />
            {guests > 0 ? `+${guests} guest${guests > 1 ? 's' : ''}` : 'Solo'}
          </div>
        </div>
      </div>

      {/* Booking ref + amenities row */}
      <div className="px-5 py-3" style={dividerStyle}>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs" style={{ color: metaColor }}>
            <Hash className="w-3.5 h-3.5" />
            <span className="font-mono">{bookingRef}</span>
          </div>
          {amenities.slice(0, 4).map((a) => (
            <span
              key={a}
              className="px-2 py-0.5 rounded-full text-xs"
              style={{
                background: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(231,230,221,0.6)',
                border: `1px solid ${p.glassBorder}`,
                color: labelColor,
              }}
            >
              {a}
            </span>
          ))}
          {amenities.length > 4 && (
            <span className="text-xs" style={{ color: metaColor }}>
              +{amenities.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div
        className="px-5 py-3 flex items-center justify-between gap-3"
        style={dividerStyle}
      >
        {/* Primary: view detail */}
        <button
          type="button"
          onClick={handleView}
          className="flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
          style={{ color: GOLD }}
        >
          View Details <ArrowRight className="w-4 h-4" />
        </button>

        {/* Secondary actions */}
        <div className="flex items-center gap-2">
          {onDownload && (
            <button
              type="button"
              onClick={handleDownload}
              className="p-2 rounded-lg transition-colors hover:bg-white/10"
              style={{ color: p.textMuted }}
              title="Download"
            >
              <Download className="w-4 h-4" />
            </button>
          )}
          {isEditable && onEdit && (
            <button
              type="button"
              onClick={handleEdit}
              className="p-2 rounded-lg transition-colors hover:bg-white/10"
              style={{ color: p.textMuted }}
              title="Edit Booking"
            >
              <Edit className="w-4 h-4" />
            </button>
          )}
          {isCancellable && onCancel && (
            <button
              type="button"
              onClick={handleCancel}
              className="p-2 rounded-lg transition-colors hover:bg-red-500/10"
              style={{ color: isDark ? '#f87171' : 'rgb(185,28,28)' }}
              title="Cancel Booking"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
