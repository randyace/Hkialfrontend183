/**
 * BookingDetailPanel
 * Detailed view of a single booking — shown in a slide-over or full-page panel.
 * All data and callbacks arrive via props. Zero internal state.
 */
import React from 'react';
import {
  X,
  Calendar,
  Clock,
  Plane,
  Users,
  MapPin,
  Download,
  Edit,
  Ban,
  Hash,
  Phone,
  Mail,
  User,
  Car,
  Accessibility,
  Package,
  Layers,
  FileText,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react';
import { StatusBadge } from './StatusBadge';
import { GlassButton } from './GlassButton';
import { GlassCard } from './GlassCard';
import { palette, GOLD, type BookingStatus, type BookingRecord } from './tokens';

export interface BookingDetailPanelProps {
  /** Full booking data object */
  booking: BookingRecord;
  /** Close / back callback */
  onClose?: () => void;
  /** Edit callback */
  onEdit?: () => void;
  /** Cancel booking callback */
  onCancel?: () => void;
  /** Download PDF/receipt callback */
  onDownload?: () => void;
  /** Dark-mode flag */
  isDark?: boolean;
  /** Render as a slide-over panel (fixed right) vs. inline page content */
  asPanel?: boolean;
  /** Extra classes on root */
  className?: string;
}

// ── Section heading helper ────────────────────────────────────────────────────────
function SectionHeading({
  icon,
  label,
  textColor,
}: {
  icon: React.ReactNode;
  label: string;
  textColor: string;
}) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="w-4 h-4 flex-shrink-0" style={{ color: GOLD }}>
        {icon}
      </span>
      <h4 className="text-sm font-semibold" style={{ color: textColor }}>
        {label}
      </h4>
    </div>
  );
}

// ── Key–value row helper ──────────────────────────────────────────────────────────
function InfoRow({
  label,
  value,
  labelColor,
  valueColor,
}: {
  label: string;
  value: React.ReactNode;
  labelColor: string;
  valueColor: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3 py-1.5">
      <span className="text-xs flex-shrink-0" style={{ color: labelColor }}>
        {label}
      </span>
      <span className="text-xs font-medium text-right" style={{ color: valueColor }}>
        {value}
      </span>
    </div>
  );
}

export function BookingDetailPanel({
  booking,
  onClose,
  onEdit,
  onCancel,
  onDownload,
  isDark = false,
  asPanel = false,
  className = '',
}: BookingDetailPanelProps) {
  const p = palette(isDark);

  const isCancellable =
    booking.status === 'confirmed' || booking.status === 'pending';
  const isEditable =
    booking.status === 'confirmed' || booking.status === 'pending';

  // ── Formatted helpers ────────────────────────────────────────────────────────
  const formattedDate = new Date(booking.date).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  // ── Styles ────────────────────────────────────────────────────────────────────
  const panelStyle: React.CSSProperties = asPanel
    ? {
        position: 'fixed',
        top: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        maxWidth: '560px',
        zIndex: 80,
        backdropFilter: 'blur(20px)',
        background: p.modalBackground,
        border: `1px solid ${p.glassBorder}`,
        boxShadow: isDark
          ? '-20px 0 60px rgba(0,0,0,0.5)'
          : '-20px 0 60px rgba(64,63,52,0.12)',
        overflowY: 'auto',
      }
    : {};

  const wrapperClass = asPanel
    ? `animate-scale-in ${className}`
    : `rounded-2xl overflow-hidden ${className}`;

  const inlineCardStyle: React.CSSProperties = asPanel
    ? {}
    : {
        backdropFilter: 'blur(16px)',
        background: p.glassBackground,
        border: `1px solid ${p.glassBorder}`,
        boxShadow: p.glassShadow,
      };

  const sectionDivider: React.CSSProperties = {
    borderTop: `1px solid ${p.glassBorder}`,
  };

  // ── Handlers ─────────────────────────────────────────────────────────────────
  function handleClose() {
    if (onClose) onClose();
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

  // ── Content ───────────────────────────────────────────────────────────────────
  const content = (
    <div className="flex flex-col h-full">
      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div
        className="flex items-start justify-between gap-3 px-6 py-5"
        style={sectionDivider}
      >
        <div className="flex items-center gap-3 min-w-0">
          {asPanel ? (
            <button
              type="button"
              onClick={handleClose}
              className="flex-shrink-0 p-1.5 rounded-lg transition-colors hover:bg-white/10"
              style={{ color: p.textMuted }}
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          ) : (
            onClose && (
              <button
                type="button"
                onClick={handleClose}
                className="flex-shrink-0 p-1.5 rounded-lg transition-colors hover:bg-white/10"
                style={{ color: p.textMuted }}
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )
          )}
          <div className="min-w-0">
            <h3 className="truncate" style={{ color: p.text }}>
              Booking Details
            </h3>
            <p className="text-xs mt-0.5 font-mono" style={{ color: p.textMuted }}>
              {booking.bookingRef}
            </p>
          </div>
        </div>
        <StatusBadge status={booking.status} isDark={isDark} size="sm" />
      </div>

      {/* ── Scrollable body ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
        {/* Lounge & flight block */}
        <div
          className="rounded-2xl p-5 space-y-3"
          style={{
            background: isDark ? 'rgba(255,255,255,0.05)' : p.other,
            border: `1px solid ${p.glassBorder}`,
          }}
        >
          <div>
            <p className="text-xs mb-1" style={{ color: p.textMuted }}>
              Lounge
            </p>
            <p className="font-semibold" style={{ color: p.text }}>
              {booking.lounge}
            </p>
            <div
              className="flex items-center gap-1.5 text-xs mt-0.5"
              style={{ color: p.textMuted }}
            >
              <MapPin className="w-3.5 h-3.5" />
              {booking.terminal} · {booking.flightType}
            </div>
          </div>

          <div
            className="grid grid-cols-2 gap-x-6 gap-y-3 pt-3"
            style={sectionDivider}
          >
            <div>
              <p className="text-xs mb-1" style={{ color: p.textMuted }}>
                Date
              </p>
              <div className="flex items-center gap-1.5 text-sm" style={{ color: p.text }}>
                <Calendar className="w-3.5 h-3.5 flex-shrink-0" style={{ color: GOLD }} />
                {formattedDate}
              </div>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: p.textMuted }}>
                Time
              </p>
              <div className="flex items-center gap-1.5 text-sm" style={{ color: p.text }}>
                <Clock className="w-3.5 h-3.5 flex-shrink-0" style={{ color: GOLD }} />
                {booking.time}
                {booking.duration && (
                  <span style={{ color: p.textMuted }}>({booking.duration})</span>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: p.textMuted }}>
                Flight
              </p>
              <div className="flex items-center gap-1.5 text-sm" style={{ color: p.text }}>
                <Plane className="w-3.5 h-3.5 flex-shrink-0" style={{ color: GOLD }} />
                <span className="truncate">{booking.flight}</span>
              </div>
            </div>
            <div>
              <p className="text-xs mb-1" style={{ color: p.textMuted }}>
                Guests
              </p>
              <div className="flex items-center gap-1.5 text-sm" style={{ color: p.text }}>
                <Users className="w-3.5 h-3.5 flex-shrink-0" style={{ color: GOLD }} />
                {booking.guests > 0
                  ? `+${booking.guests} guest${booking.guests > 1 ? 's' : ''}`
                  : 'Solo'}
              </div>
            </div>
          </div>
        </div>

        {/* Passengers */}
        {booking.passengers && booking.passengers.length > 0 && (
          <div>
            <SectionHeading
              icon={<User />}
              label={`Passengers (${booking.passengers.length})`}
              textColor={p.text}
            />
            <div className="space-y-2">
              {booking.passengers.map((pax, idx) => (
                <div
                  key={idx}
                  className="rounded-xl px-4 py-3 flex items-start justify-between gap-3"
                  style={{
                    background: isDark ? 'rgba(255,255,255,0.05)' : p.cardItemBg,
                    border: `1px solid ${p.cardItemBorder}`,
                  }}
                >
                  <div>
                    <p className="text-sm font-medium" style={{ color: p.text }}>
                      {pax.title} {pax.firstName} {pax.lastName}
                    </p>
                    <p className="text-xs mt-0.5 font-mono" style={{ color: p.textMuted }}>
                      {pax.travelDoc}
                    </p>
                  </div>
                  {pax.membership && (
                    <span className="text-xs" style={{ color: GOLD }}>
                      {pax.membership}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Amenities */}
        {booking.amenities && booking.amenities.length > 0 && (
          <div>
            <SectionHeading
              icon={<CheckCircle />}
              label="Amenities"
              textColor={p.text}
            />
            <div className="flex flex-wrap gap-2">
              {booking.amenities.map((a) => (
                <span
                  key={a}
                  className="px-3 py-1 rounded-full text-xs font-medium"
                  style={{
                    background: isDark ? 'rgba(220,181,21,0.12)' : 'rgba(220,181,21,0.1)',
                    border: '1px solid rgba(220,181,21,0.3)',
                    color: GOLD,
                  }}
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Additional services */}
        {booking.services && (
          <div>
            <SectionHeading
              icon={<Package />}
              label="Additional Services"
              textColor={p.text}
            />
            <div className="rounded-xl overflow-hidden" style={sectionDivider}>
              {booking.services.loungeExtension !== undefined &&
                booking.services.loungeExtension > 0 && (
                  <InfoRow
                    label="Lounge Extension"
                    value={`${booking.services.loungeExtension} hr${booking.services.loungeExtension > 1 ? 's' : ''}`}
                    labelColor={p.textMuted}
                    valueColor={p.text}
                  />
                )}
              {booking.services.limousineService !== undefined &&
                booking.services.limousineService > 0 && (
                  <InfoRow
                    label="Limousine Service"
                    value={`${booking.services.limousineService} vehicle${booking.services.limousineService > 1 ? 's' : ''}`}
                    labelColor={p.textMuted}
                    valueColor={p.text}
                  />
                )}
              {booking.services.wheelchairService !== undefined &&
                booking.services.wheelchairService > 0 && (
                  <InfoRow
                    label="Wheelchair Service"
                    value={String(booking.services.wheelchairService)}
                    labelColor={p.textMuted}
                    valueColor={p.text}
                  />
                )}
              {booking.services.luggageCount !== undefined &&
                booking.services.luggageCount > 0 && (
                  <InfoRow
                    label="Luggage Pieces"
                    value={String(booking.services.luggageCount)}
                    labelColor={p.textMuted}
                    valueColor={p.text}
                  />
                )}
            </div>
          </div>
        )}

        {/* Contact person */}
        {booking.contactPerson && (
          <div>
            <SectionHeading icon={<FileText />} label="Contact Person" textColor={p.text} />
            <div
              className="rounded-xl px-4 py-3 space-y-2"
              style={{
                background: isDark ? 'rgba(255,255,255,0.05)' : p.cardItemBg,
                border: `1px solid ${p.cardItemBorder}`,
              }}
            >
              <div className="flex items-center gap-2">
                <User className="w-3.5 h-3.5 flex-shrink-0" style={{ color: GOLD }} />
                <span className="text-sm" style={{ color: p.text }}>
                  {booking.contactPerson.name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 flex-shrink-0" style={{ color: p.textMuted }} />
                <span className="text-sm" style={{ color: p.textSecondary }}>
                  {booking.contactPerson.email}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 flex-shrink-0" style={{ color: p.textMuted }} />
                <span className="text-sm" style={{ color: p.textSecondary }}>
                  {booking.contactPerson.phone}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Total */}
        {booking.totalAmount !== undefined && (
          <div
            className="flex items-center justify-between rounded-xl px-5 py-4"
            style={{
              background: isDark ? 'rgba(220,181,21,0.08)' : 'rgba(220,181,21,0.07)',
              border: '1px solid rgba(220,181,21,0.25)',
            }}
          >
            <span className="text-sm font-medium" style={{ color: p.text }}>
              Total Amount
            </span>
            <span className="text-xl font-bold" style={{ color: GOLD }}>
              HKD {booking.totalAmount.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* ── Footer actions ────────────────────────────────────────────────────── */}
      <div
        className="flex-shrink-0 px-6 py-4 flex flex-wrap items-center gap-3"
        style={sectionDivider}
      >
        {onDownload && (
          <GlassButton
            label="Download"
            variant="secondary"
            size="sm"
            iconLeft={<Download />}
            onClick={handleDownload}
            isDark={isDark}
          />
        )}
        {isEditable && onEdit && (
          <GlassButton
            label="Edit Booking"
            variant="ghost"
            size="sm"
            iconLeft={<Edit />}
            onClick={handleEdit}
            isDark={isDark}
          />
        )}
        {isCancellable && onCancel && (
          <GlassButton
            label="Cancel Booking"
            variant="danger"
            size="sm"
            iconLeft={<Ban />}
            onClick={handleCancel}
            isDark={isDark}
          />
        )}
      </div>
    </div>
  );

  if (asPanel) {
    return (
      <div className={wrapperClass} style={panelStyle}>
        {content}
      </div>
    );
  }

  return (
    <div className={wrapperClass} style={inlineCardStyle}>
      {content}
    </div>
  );
}
