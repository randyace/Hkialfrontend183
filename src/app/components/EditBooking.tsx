import React, { useState } from 'react';
import {
  ArrowLeft,
  Plane,
  Calendar,
  Clock,
  Building,
  Users,
  Car,
  Accessibility,
  Package,
  Phone,
  Mail,
  User,
  MapPin,
  FileText,
  Send,
  CheckCircle,
  Tag,
  Hotel,
  MessageSquare,
  Plus,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  X,
  Trash2,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router';
import { useTheme } from './ThemeContext';

interface Passenger {
  id: number;
  title: string;
  firstName: string;
  lastName: string;
  travelDoc: string;
  membership: string;
}

interface RemoveDialogState {
  open: boolean;
  needed: number;
  pendingField: string;
  pendingValue: number;
}

interface EditBookingProps {
  booking?: any;
  setActiveTab?: (tab: string) => void;
}

const TITLES = ['Mr', 'Mrs', 'Ms', 'Miss', 'Dr', 'Prof'];

export function EditBooking({ booking: bookingProp, setActiveTab }: EditBookingProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const booking = bookingProp ?? location.state?.booking ?? null;
  const [submitted, setSubmitted] = useState(false);

  const [passengers, setPassengers] = useState<Passenger[]>(
    (booking?.passengers || []).map((p: any, i: number) => ({
      id: Date.now() + i,
      title: p.title || 'Mr',
      firstName: p.firstName || '',
      lastName: p.lastName || '',
      travelDoc: p.travelDoc || '',
      membership: p.membership || '',
    }))
  );

  const [expandedPassengers, setExpandedPassengers] = useState<Set<number>>(
    new Set((booking?.passengers || []).map((_: any, i: number) => i))
  );

  const [removeDialog, setRemoveDialog] = useState<RemoveDialogState | null>(null);
  const [selectedForRemoval, setSelectedForRemoval] = useState<Set<number>>(new Set());

  // 2026-06-08 (round 6.2.7): hydrate leg 2 from
  // booking.advanced_details.flight.legs[1] when present (Transit
  // bookings). For non-Transit, legs[1] is undefined and the legs
  // editor block is hidden in the UI. The state model mirrors
  // NewBooking: leg2ArrivalDate holds a combined `YYYY-MM-DDTHH:MM`
  // string so the date + time inputs can split/join the same value
  // without changing the wire shape.
  // Backend stores legs[1].departureDate (round 6.2.8) OR legacy
  // legs[1].arrivalDate as "YYYY-MM-DD HH:MM:SS" (space) — convert
  // to "YYYY-MM-DDTHH:MM" (T) so the date input can consume the
  // date part and the time input the time part. Prefer
  // `departureDate` (the new canonical name); fall back to
  // `arrivalDate` for pre-6.2.8 bookings.
  const initialLeg2 = booking?.advanced_details?.flight?.legs?.[1];
  const initialLeg2DateStr =
    typeof initialLeg2?.departureDate === 'string'
      ? initialLeg2.departureDate
      : (typeof initialLeg2?.arrivalDate === 'string' ? initialLeg2.arrivalDate : '');
  const initialLeg2Arrival = initialLeg2DateStr
    ? initialLeg2DateStr.replace(' ', 'T').slice(0, 16)
    : '';

  const [leg2ArrivalDate, setLeg2ArrivalDate] = useState<string>(initialLeg2Arrival);
  const [leg2FlightNo, setLeg2FlightNo] = useState<string>(
    typeof initialLeg2?.flightNo === 'string' ? initialLeg2.flightNo : ''
  );
  // 2026-06-08 (round 6.2.7): leg 2 flight time is derived from
  // leg2ArrivalDate (the time half of the combined string) to keep
  // state and UI in sync — but we still expose `leg2FlightTime` for
  // any pre-existing readers. New code should read
  // `leg2ArrivalDate?.split('T')[1]?.slice(0, 5)` instead.
  const [leg2FlightTime, setLeg2FlightTime] = useState<string>(
    initialLeg2Arrival?.split('T')[1]?.slice(0, 5) || ''
  );
  const [leg2FlightClass, setLeg2FlightClass] = useState<string>(
    typeof initialLeg2?.flightClass === 'string' ? initialLeg2.flightClass : ''
  );
  // 2026-06-08 (round 6.2.8): leg 2 destination (outbound
  // destination, e.g. "London (LHR)"). New field per Sky's spec,
  // hydrated from booking.advanced_details.flight.legs[1].destination
  // when present.
  const [leg2Destination, setLeg2Destination] = useState<string>(
    typeof initialLeg2?.destination === 'string' ? initialLeg2.destination : ''
  );

  const [form, setForm] = useState({
    flightNumber: booking?.flightNumber || '',
    flightClass: booking?.flightClass || '',
    flightType: booking?.flightType || 'Departure',
    date: booking?.date || '',
    time: booking?.time || '',
    // 2026-06-08 (round 6.2.7): added origin / destination hydration
    // (the edit form previously had no origin / destination fields
    // at all, which is why Transit couldn't round-trip). The api.ts
    // flatten exposes these as `flightOrigin` / `flightDestination`.
    origin: booking?.flightOrigin || '',
    destination: booking?.flightDestination || '',
    lounge: booking?.lounge || '',
    terminal: booking?.terminal || '',
    duration: booking?.duration || '',
    premiereSuites: booking?.premiereSuites ?? 0,
    premiereVipPassengers: booking?.premiereVipPassengers ?? 0,
    premiereNonFlyingGuests: booking?.premiereNonFlyingGuests ?? 0,
    vipPassengers: booking?.vipPassengers ?? 0,
    nonFlyingGuests: booking?.nonFlyingGuests ?? 0,
    loungeExtension: booking?.services?.loungeExtension ?? 0,
    limousineService: booking?.services?.limousineService ?? 0,
    destinationAddresses: booking?.services?.destinationAddresses?.join('\n') || '',
    wheelchairService: booking?.services?.wheelchairService ?? 0,
    luggageCount: booking?.services?.luggageCount ?? 0,
    contactName: booking?.contactPerson?.name || '',
    contactEmail: booking?.contactPerson?.email || '',
    contactPhone: booking?.contactPerson?.phone || '',
    remarks: '',
  });

  const { colors, glassStyle, mode } = useTheme();
  const isDark = mode === 'dark';

  // Theme-aware styles
  const inputStyle: React.CSSProperties = {
    background: isDark ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.9)',
    border: `1px solid ${colors.inputBorder}`,
    color: colors.inputText,
  };

  const inputClass = `w-full px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]/40 transition-all ${
    isDark ? 'placeholder-gray-500' : 'placeholder-[rgb(160,159,148)]'
  }`;

  const labelStyle: React.CSSProperties = { color: colors.textMuted };
  const labelClass = 'block text-xs mb-1.5 uppercase tracking-wide';

  const sectionStyle: React.CSSProperties = {
    ...glassStyle,
    borderRadius: '16px',
    padding: '24px',
  };

  const secondaryBtnStyle: React.CSSProperties = {
    background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(231,230,221,0.7)',
    border: `1px solid ${colors.glassBorder}`,
    color: colors.text,
  };

  const modalBg: React.CSSProperties = {
    backdropFilter: 'blur(20px)',
    background: isDark ? '#0e2237' : '#FFFFFF',
    border: `1px solid ${colors.glassBorder}`,
    boxShadow: '0 24px 48px rgba(0,0,0,0.5)',
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSimpleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: parseInt(value) || 0 }));
  };

  const handleVipCountChange = (field: 'premiereVipPassengers' | 'vipPassengers', rawValue: string) => {
    const newValue = Math.max(0, parseInt(rawValue) || 0);
    const newTotal =
      field === 'premiereVipPassengers'
        ? newValue + form.vipPassengers
        : form.premiereVipPassengers + newValue;

    if (newTotal < passengers.length) {
      setRemoveDialog({ open: true, needed: passengers.length - newTotal, pendingField: field, pendingValue: newValue });
      setSelectedForRemoval(new Set());
    } else {
      if (newTotal > passengers.length) {
        const toAdd = newTotal - passengers.length;
        const newPs = [...passengers];
        for (let i = 0; i < toAdd; i++) {
          newPs.push({ id: Date.now() + i, title: 'Mr', firstName: '', lastName: '', travelDoc: '', membership: '' });
        }
        setPassengers(newPs);
      }
      setForm((prev) => ({ ...prev, [field]: newValue }));
    }
  };

  const toggleRemoval = (id: number) => {
    setSelectedForRemoval((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else if (next.size < (removeDialog?.needed ?? 0)) {
        next.add(id);
      }
      return next;
    });
  };

  const confirmRemoval = () => {
    if (!removeDialog || selectedForRemoval.size !== removeDialog.needed) return;
    setPassengers((prev) => prev.filter((p) => !selectedForRemoval.has(p.id)));
    setForm((prev) => ({ ...prev, [removeDialog.pendingField]: removeDialog.pendingValue }));
    setRemoveDialog(null);
    setSelectedForRemoval(new Set());
  };

  const cancelRemoval = () => {
    setRemoveDialog(null);
    setSelectedForRemoval(new Set());
  };

  const updatePassenger = (id: number, field: keyof Passenger, value: string) => {
    setPassengers((prev) => prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const addPassenger = () => {
    const newP: Passenger = { id: Date.now(), title: 'Mr', firstName: '', lastName: '', travelDoc: '', membership: '' };
    setPassengers((prev) => [...prev, newP]);
    setExpandedPassengers((prev) => new Set([...prev, newP.id]));
    setForm((prev) => ({ ...prev, vipPassengers: prev.vipPassengers + 1 }));
  };

  const toggleExpand = (id: number) => {
    setExpandedPassengers((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  // Pre-compute summary items to avoid IIFE in JSX
  const summaryDateStr = form.date ? new Date(form.date).toLocaleDateString('en-GB') : '—';
  const summaryTimeStr = form.time ? ' at ' + form.time : '';
  const summaryDateTimeValue = summaryDateStr + summaryTimeStr;
  const summaryItems = [
    { label: 'Booking Reference', value: booking?.bookingRef || '', mono: true },
    { label: 'Flight', value: form.flightNumber + ' (' + form.flightType + ')' },
    { label: 'Date & Time', value: summaryDateTimeValue },
    { label: 'Lounge', value: form.lounge },
    { label: 'VIP Passengers', value: String(passengers.length) },
    { label: 'Contact', value: form.contactName || '—' },
  ];
  // 2026-06-08 (round 6.2.8+): Transit 2-leg sub-section. The form
  // carries `legs[1]` data in `leg2ArrivalDate` (datetime-local string),
  // `leg2FlightNo`, `leg2Destination`, `leg2FlightClass`. Format the
  // summary block the same way the NewBooking Final Review does (date
  // + time, flight no, destination, class). Only render when flightType
  // is Transit AND at least one leg-2 field is populated (defensive
  // against pre-6.2.7 bookings that may not have full leg 2 data).
  const isTransitView = form.flightType === 'Transit';
  const hasLeg2Data = !!(leg2ArrivalDate || leg2FlightNo || leg2Destination || leg2FlightClass);
  const leg2DateStr = leg2ArrivalDate?.split('T')[0]
    ? new Date(leg2ArrivalDate.split('T')[0]).toLocaleDateString('en-GB')
    : '—';
  const leg2TimeStr = leg2ArrivalDate?.split('T')[1]?.slice(0, 5) || '—';

  if (!booking) {
    return (
      <div className="flex flex-col items-center justify-center h-64" style={{ color: colors.textMuted }}>
        <FileText className="w-12 h-12 mb-4" />
        <p>No booking selected.</p>
        <button
          onClick={() => navigate('/mybooking')}
          className="mt-4 px-6 py-2 rounded-xl transition-all text-sm"
          style={secondaryBtnStyle}
        >
          Back to My Bookings
        </button>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-5">
        <div className="rounded-2xl p-10 max-w-md w-full text-center" style={glassStyle}>
          <CheckCircle className="w-16 h-16 mx-auto mb-4" style={{ color: 'rgb(220,181,21)' }} />
          <h2 className="text-2xl mb-2" style={{ color: colors.text }}>Change Request Sent</h2>
          <p className="text-sm mb-1" style={{ color: colors.textSecondary }}>
            Your change request for booking{' '}
            <span className="font-mono" style={{ color: colors.text }}>{booking.bookingRef}</span> has been submitted.
          </p>
          <p className="text-xs mb-6" style={{ color: colors.textMuted }}>
            Our team will review your request and confirm the changes within 1 business day.
          </p>
          <button
            onClick={() => navigate('/mybooking')}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)] text-white transition-all"
          >
            Back to My Bookings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/mybooking')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all text-sm"
          style={secondaryBtnStyle}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <div>
          <h1 className="text-3xl bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)] bg-clip-text text-transparent">
            Edit Booking
          </h1>
          <p className="text-sm mt-0.5" style={{ color: colors.textMuted }}>
            Reference:{' '}
            <span className="font-mono" style={{ color: colors.textSecondary }}>{booking.bookingRef}</span>
          </p>
        </div>
      </div>

      {/* Notice Banner */}
      <div
        className="rounded-xl px-5 py-4 flex items-start gap-3"
        style={{ background: 'rgba(220,181,21,0.08)', border: '1px solid rgba(220,181,21,0.3)' }}
      >
        <MessageSquare className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: 'rgb(220,181,21)' }} />
        <p className="text-sm" style={{ color: colors.textSecondary }}>
          All changes are subject to staff approval. Please update the fields below and click{' '}
          <span className="font-medium" style={{ color: colors.text }}>Send Change Request</span> to submit your request.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Flight Information */}
        <div className="rounded-2xl p-6 space-y-4" style={glassStyle}>
          <div className="flex items-center gap-2 mb-1">
            <Plane className="w-5 h-5 text-purple-400" />
            <h3 className="font-medium" style={{ color: colors.text }}>Flight Information</h3>
          </div>
          {/* 2026-06-08 (round 6.2.7): the previous edit form had no
              Origin / Destination fields, which made Transit mode
              incoherent. Both fields are now added as full-width
              controls below the basic 1-leg fields; the date/time
              labels are mode-aware (Departure Date / Departure Time
              when flightType === 'Departure', Arrival Date / Arrival
              Time otherwise). The labels match NewBooking's step 1
              form so the user sees consistent wording. */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Flight Number — moved to the top of the section so it
                matches the NewBooking ordering (round 6.2.7). */}
            <div>
              <label className={labelClass} style={labelStyle}>Flight Number</label>
              <input
                type="text"
                name="flightNumber"
                value={form.flightNumber}
                onChange={handleChange}
                className={inputClass}
                style={inputStyle}
                placeholder="e.g. CX888"
              />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>
                {form.flightType === 'Departure' ? 'Departure Date' : 'Arrival Date'}
              </label>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>
                {form.flightType === 'Departure' ? 'Departure Time' : 'Arrival Time'}
              </label>
              <input
                type="time"
                name="time"
                value={form.time}
                onChange={handleChange}
                className={inputClass}
                style={inputStyle}
              />
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Flight Class</label>
              <select
                name="flightClass"
                value={form.flightClass}
                onChange={handleChange}
                className={inputClass + ' appearance-none cursor-pointer'}
                style={inputStyle}
              >
                {['First Class', 'Business Class', 'Premium Economy', 'Economy Class'].map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Flight Type</label>
              <select
                name="flightType"
                value={form.flightType}
                onChange={handleChange}
                className={inputClass + ' appearance-none cursor-pointer'}
                style={inputStyle}
              >
                {/* 2026-06-08 (round 6.2.7): Transit was missing. */}
                <option value="Departure">Departure</option>
                <option value="Arrival">Arrival</option>
                <option value="Transit">Transit</option>
              </select>
            </div>
          </div>

          {/* Origin / Destination — full width controls, conditional
              per flight type, same as NewBooking. The "Origin (Arrival
              only)" / "Destination (Departure / Transit only)" rule
              is mirrored exactly. */}
          {/* 2026-06-08 (round 6.2.8): Origin / Destination conditional
              matches NewBooking. Transit now shows Origin (the form
              represents leg 1 = inbound to HKG). Destination in
              step-1 form is Departure-only; the Transit leg 2 block
              carries its own Destination field. */}
          {(form.flightType === 'Arrival' || form.flightType === 'Transit') && (
            <div>
              <label className={labelClass} style={labelStyle}>Origin</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: colors.textMuted }} />
                <input
                  type="text"
                  name="origin"
                  value={form.origin}
                  onChange={handleChange}
                  className={inputClass + ' pl-10'}
                  style={inputStyle}
                  placeholder="e.g. Tokyo Narita (NRT)"
                />
              </div>
            </div>
          )}
          {form.flightType === 'Departure' && (
            <div>
              <label className={labelClass} style={labelStyle}>Destination</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: colors.textMuted }} />
                <input
                  type="text"
                  name="destination"
                  value={form.destination}
                  onChange={handleChange}
                  className={inputClass + ' pl-10'}
                  style={inputStyle}
                  placeholder="e.g. London Heathrow (LHR)"
                />
              </div>
            </div>
          )}

          {/* 2026-06-08 (round 6.2.7): Transit 2nd leg block, mirrors
              NewBooking. Each field is full-width (matches the 1-leg
              section style). Combined "Arrival Date & Time" is split
              into separate date + time inputs that read/write the same
              `leg2ArrivalDate` state (datetime-local string). State is
              hydrated from booking.advanced_details.flight.legs[1].

              2026-06-08 (round 6.2.8): per Sky's spec, field labels
              changed "Arrival Date" / "Arrival Time" → "Departure
              Date" / "Departure Time" (leg 2 is the outbound flight,
              so the timestamp is the departure time). Field order
              changed: Flight Number now sits at the top, then
              Departure Date, then Departure Time, then the new Leg 2
              Destination field, then Flight Class. */}
          {form.flightType === 'Transit' && (
            <div
              className="mt-3 pt-4 space-y-4"
              style={{ borderTop: `1px solid ${colors.glassBorder}` }}
              data-testid="transit-leg2-block"
            >
              <h4 className="text-sm font-medium" style={{ color: colors.text }}>
                2nd Flight (Outbound)
              </h4>

              <div>
                <label className={labelClass} style={labelStyle}>Leg 2 Flight Number</label>
                <div className="relative">
                  <Plane className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: colors.textMuted }} />
                  <input
                    type="text"
                    value={leg2FlightNo}
                    onChange={(e) => setLeg2FlightNo(e.target.value.toUpperCase())}
                    className={inputClass + ' pl-10 uppercase'}
                    style={inputStyle}
                    placeholder="e.g. CX889"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass} style={labelStyle}>Leg 2 Departure Date</label>
                <div className="relative">
                  <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: colors.textMuted }} />
                  <input
                    type="date"
                    value={leg2ArrivalDate?.split('T')[0] || ''}
                    min={form.date || undefined}
                    onChange={(e) => {
                      const datePart = e.target.value;
                      const timePart = leg2ArrivalDate?.split('T')[1]?.slice(0, 5) || '';
                      setLeg2ArrivalDate(timePart ? `${datePart}T${timePart}` : datePart);
                    }}
                    className={inputClass + ' pr-10'}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass} style={labelStyle}>Leg 2 Departure Time</label>
                <div className="relative">
                  <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: colors.textMuted }} />
                  <input
                    type="time"
                    value={leg2ArrivalDate?.split('T')[1]?.slice(0, 5) || ''}
                    onChange={(e) => {
                      const timePart = e.target.value;
                      const datePart = leg2ArrivalDate?.split('T')[0] || '';
                      setLeg2ArrivalDate(datePart ? `${datePart}T${timePart}` : '');
                    }}
                    className={inputClass + ' pr-10'}
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* 2026-06-08 (round 6.2.8): new field per Sky's spec.
                  The outbound destination (e.g. "London (LHR)"). */}
              <div>
                <label className={labelClass} style={labelStyle}>Leg 2 Destination</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: colors.textMuted }} />
                  <input
                    type="text"
                    value={leg2Destination}
                    onChange={(e) => setLeg2Destination(e.target.value)}
                    className={inputClass + ' pl-10'}
                    style={inputStyle}
                    placeholder="e.g. London Heathrow (LHR)"
                  />
                </div>
              </div>

              <div>
                <label className={labelClass} style={labelStyle}>Leg 2 Flight Class</label>
                <div className="relative">
                  <select
                    value={leg2FlightClass}
                    onChange={(e) => setLeg2FlightClass(e.target.value)}
                    className={inputClass + ' appearance-none cursor-pointer pr-10'}
                    style={inputStyle}
                  >
                    <option value="">Select class</option>
                    {['First Class', 'Business Class', 'Premium Economy', 'Economy Class'].map(v => (
                      <option key={v} value={v}>{v}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: colors.textMuted }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Lounge Information */}
        <div className="rounded-2xl p-6 space-y-4" style={glassStyle}>
          <div className="flex items-center gap-2 mb-1">
            <Hotel className="w-5 h-5" style={{ color: 'rgb(220,181,21)' }} />
            <h3 className="font-medium" style={{ color: colors.text }}>Lounge Information</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelClass} style={labelStyle}>Lounge Name</label>
              <select
                name="lounge"
                value={form.lounge}
                onChange={handleChange}
                className={inputClass + ' appearance-none cursor-pointer'}
                style={inputStyle}
              >
                {[
                  'The Wing First Class Lounge',
                  'The Pier First Class Lounge',
                  'The Pier Business Class Lounge',
                  'The Bridge Business Class Lounge',
                  'The Cabin Lounge',
                  'The Arrival Lounge',
                ].map(v => <option key={v} value={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Terminal</label>
              <select
                name="terminal"
                value={form.terminal}
                onChange={handleChange}
                className={inputClass + ' appearance-none cursor-pointer'}
                style={inputStyle}
              >
                <option value="Terminal 1">Terminal 1</option>
                <option value="Terminal 2">Terminal 2</option>
              </select>
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Duration</label>
              <input
                type="text"
                name="duration"
                value={form.duration}
                onChange={handleChange}
                className={inputClass}
                style={inputStyle}
                placeholder="e.g. 2 hours"
              />
            </div>
          </div>
        </div>

        {/* Suite & Guest Counts */}
        <div className="rounded-2xl p-6 space-y-4" style={glassStyle}>
          <div className="flex items-center gap-2 mb-1">
            <Building className="w-5 h-5 text-blue-400" />
            <h3 className="font-medium" style={{ color: colors.text }}>Suite & Guest Counts</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left column: Premiere */}
            <div className="space-y-4">
              <div>
                <label className={labelClass} style={labelStyle}>Premiere Suites</label>
                <input
                  type="number"
                  name="premiereSuites"
                  min="0"
                  max="20"
                  value={form.premiereSuites}
                  onChange={handleSimpleNumberChange}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className={labelClass} style={labelStyle}>VIP Passengers (Premiere)</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={form.premiereVipPassengers}
                  onChange={(e) => handleVipCountChange('premiereVipPassengers', e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className={labelClass} style={labelStyle}>Non-Flying Guests (Premiere)</label>
                <input
                  type="number"
                  name="premiereNonFlyingGuests"
                  min="0"
                  max="20"
                  value={form.premiereNonFlyingGuests}
                  onChange={handleSimpleNumberChange}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
            </div>
            {/* Right column: Deluxe */}
            <div className="space-y-4">
              <div>
                <label className={labelClass} style={labelStyle}>VIP Passengers (Deluxe)</label>
                <input
                  type="number"
                  min="0"
                  max="20"
                  value={form.vipPassengers}
                  onChange={(e) => handleVipCountChange('vipPassengers', e.target.value)}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
              <div>
                <label className={labelClass} style={labelStyle}>Non-Flying Guests (Deluxe)</label>
                <input
                  type="number"
                  name="nonFlyingGuests"
                  min="0"
                  max="20"
                  value={form.nonFlyingGuests}
                  onChange={handleSimpleNumberChange}
                  className={inputClass}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
          <p className="text-xs" style={{ color: colors.textMuted }}>
            Total named VIP passengers:{' '}
            <span style={{ color: colors.text }}>{passengers.length}</span>
            {' '}/ count:{' '}
            <span style={{ color: colors.text }}>{form.premiereVipPassengers + form.vipPassengers}</span>
            {passengers.length !== form.premiereVipPassengers + form.vipPassengers && (
              <span className="ml-2 text-yellow-400">⚠ Count mismatch — please add or remove passenger records</span>
            )}
          </p>
        </div>

        {/* VIP Passenger Details */}
        <div className="rounded-2xl p-6 space-y-4" style={glassStyle}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-amber-400" />
              <h3 className="font-medium" style={{ color: colors.text }}>VIP Passenger Details</h3>
              <span
                className="px-2 py-0.5 rounded-full text-xs"
                style={{ background: 'rgba(220,181,21,0.15)', color: 'rgb(220,181,21)' }}
              >
                {passengers.length}
              </span>
            </div>
            <button
              type="button"
              onClick={addPassenger}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm transition-all"
              style={{ background: 'rgba(220,181,21,0.12)', border: '1px solid rgba(220,181,21,0.3)', color: 'rgb(220,181,21)' }}
            >
              <Plus className="w-4 h-4" />
              Add Passenger
            </button>
          </div>

          {passengers.length === 0 ? (
            <div className="text-center py-8 text-sm" style={{ color: colors.textMuted }}>
              <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
              No VIP passengers added yet. Increase the VIP passenger counts above or click "Add Passenger".
            </div>
          ) : (
            <div className="space-y-3">
              {passengers.map((p, idx) => {
                const isExpanded = expandedPassengers.has(p.id);
                return (
                  <div
                    key={p.id}
                    className="rounded-xl transition-all"
                    style={{
                      background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(231,230,221,0.4)',
                      border: `1px solid ${colors.cardItemBorder}`,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => toggleExpand(p.id)}
                      className="w-full flex items-center justify-between px-4 py-3 text-left"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0"
                          style={{ background: 'rgba(220,181,21,0.15)', color: 'rgb(220,181,21)' }}
                        >
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-sm" style={{ color: colors.text }}>
                            {p.firstName || p.lastName
                              ? `${p.title} ${p.firstName} ${p.lastName}`.trim()
                              : <span style={{ color: colors.textMuted, fontStyle: 'italic' }}>Unnamed passenger</span>}
                          </p>
                          {p.travelDoc && (
                            <p className="text-xs" style={{ color: colors.textMuted }}>Doc: {p.travelDoc}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2" style={{ color: colors.textMuted }}>
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="px-4 pb-4 pt-4" style={{ borderTop: `1px solid ${colors.glassBorder}` }}>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          <div>
                            <label className={labelClass} style={labelStyle}>Title</label>
                            <select
                              value={p.title}
                              onChange={(e) => updatePassenger(p.id, 'title', e.target.value)}
                              className={inputClass + ' appearance-none cursor-pointer'}
                              style={inputStyle}
                            >
                              {TITLES.map((t) => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </div>
                          <div>
                            <label className={labelClass} style={labelStyle}>First Name</label>
                            <input
                              type="text"
                              value={p.firstName}
                              onChange={(e) => updatePassenger(p.id, 'firstName', e.target.value)}
                              className={inputClass}
                              style={inputStyle}
                              placeholder="First name"
                            />
                          </div>
                          <div>
                            <label className={labelClass} style={labelStyle}>Last Name</label>
                            <input
                              type="text"
                              value={p.lastName}
                              onChange={(e) => updatePassenger(p.id, 'lastName', e.target.value)}
                              className={inputClass}
                              style={inputStyle}
                              placeholder="Last name"
                            />
                          </div>
                          <div>
                            <label className={labelClass} style={labelStyle}>Travel Document No.</label>
                            <input
                              type="text"
                              value={p.travelDoc}
                              onChange={(e) => updatePassenger(p.id, 'travelDoc', e.target.value)}
                              className={inputClass}
                              style={inputStyle}
                              placeholder="e.g. P12345678"
                            />
                          </div>
                          <div>
                            <label className={labelClass} style={labelStyle}>Membership No.</label>
                            <input
                              type="text"
                              value={p.membership}
                              onChange={(e) => updatePassenger(p.id, 'membership', e.target.value)}
                              className={inputClass}
                              style={inputStyle}
                              placeholder="e.g. HKIAL001"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Additional Services */}
        <div className="rounded-2xl p-6 space-y-4" style={glassStyle}>
          <div className="flex items-center gap-2 mb-1">
            <Package className="w-5 h-5 text-orange-400" />
            <h3 className="font-medium" style={{ color: colors.text }}>Additional Services</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={labelClass} style={labelStyle}>Lounge Extension (hours)</label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: colors.textMuted }} />
                <input
                  type="number"
                  name="loungeExtension"
                  min="0"
                  max="12"
                  value={form.loungeExtension}
                  onChange={handleSimpleNumberChange}
                  className={inputClass + ' pl-10'}
                  style={inputStyle}
                />
              </div>
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Limousine Service (vehicles)</label>
              <div className="relative">
                <Car className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: colors.textMuted }} />
                <input
                  type="number"
                  name="limousineService"
                  min="0"
                  max="10"
                  value={form.limousineService}
                  onChange={handleSimpleNumberChange}
                  className={inputClass + ' pl-10'}
                  style={inputStyle}
                />
              </div>
            </div>
            {form.limousineService > 0 && (
              <div className="md:col-span-2">
                <label className={labelClass} style={labelStyle}>Destination Addresses (one per line)</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4" style={{ color: colors.textMuted }} />
                  <textarea
                    name="destinationAddresses"
                    value={form.destinationAddresses}
                    onChange={handleChange}
                    rows={3}
                    className={inputClass + ' pl-10 resize-none'}
                    style={inputStyle}
                    placeholder="Enter each destination on a new line..."
                  />
                </div>
              </div>
            )}
            <div>
              <label className={labelClass} style={labelStyle}>Wheelchair Assistance</label>
              <div className="relative">
                <Accessibility className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: colors.textMuted }} />
                <input
                  type="number"
                  name="wheelchairService"
                  min="0"
                  max="10"
                  value={form.wheelchairService}
                  onChange={handleSimpleNumberChange}
                  className={inputClass + ' pl-10'}
                  style={inputStyle}
                />
              </div>
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Luggage Count (pieces)</label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: colors.textMuted }} />
                <input
                  type="number"
                  name="luggageCount"
                  min="0"
                  max="30"
                  value={form.luggageCount}
                  onChange={handleSimpleNumberChange}
                  className={inputClass + ' pl-10'}
                  style={inputStyle}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Contact Person */}
        <div className="rounded-2xl p-6 space-y-4" style={glassStyle}>
          <div className="flex items-center gap-2 mb-1">
            <Phone className="w-5 h-5 text-indigo-400" />
            <h3 className="font-medium" style={{ color: colors.text }}>Contact Person</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelClass} style={labelStyle}>Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: colors.textMuted }} />
                <input
                  type="text"
                  name="contactName"
                  value={form.contactName}
                  onChange={handleChange}
                  className={inputClass + ' pl-10'}
                  style={inputStyle}
                  placeholder="Full name"
                />
              </div>
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: colors.textMuted }} />
                <input
                  type="email"
                  name="contactEmail"
                  value={form.contactEmail}
                  onChange={handleChange}
                  className={inputClass + ' pl-10'}
                  style={inputStyle}
                  placeholder="email@example.com"
                />
              </div>
            </div>
            <div>
              <label className={labelClass} style={labelStyle}>Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: colors.textMuted }} />
                <input
                  type="tel"
                  name="contactPhone"
                  value={form.contactPhone}
                  onChange={handleChange}
                  className={inputClass + ' pl-10'}
                  style={inputStyle}
                  placeholder="+852 XXXX XXXX"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Remarks */}
        <div className="rounded-2xl p-6 space-y-4" style={glassStyle}>
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="w-5 h-5 text-teal-400" />
            <h3 className="font-medium" style={{ color: colors.text }}>Remarks / Special Requests</h3>
          </div>
          <div>
            <label className={labelClass} style={labelStyle}>
              Please describe the changes you'd like to make or any special requirements
            </label>
            <textarea
              name="remarks"
              value={form.remarks}
              onChange={handleChange}
              rows={4}
              className={inputClass + ' resize-none'}
              style={inputStyle}
              placeholder="Describe any additional changes or special requests here..."
            />
          </div>
        </div>

        {/* Change Request Summary */}
        <div
          className="rounded-2xl p-6"
          style={{ background: 'rgba(220,181,21,0.06)', border: '1px solid rgba(220,181,21,0.2)' }}
        >
          <h3 className="font-medium mb-4 flex items-center gap-2" style={{ color: colors.text }}>
            <FileText className="w-5 h-5" style={{ color: 'rgb(220,181,21)' }} />
            Change Request Summary
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
            {summaryItems.map(({ label, value, mono }) => (
              <div key={label}>
                <p className="text-xs mb-0.5" style={{ color: colors.textMuted }}>{label}</p>
                <p className={mono ? 'font-mono' : ''} style={{ color: colors.text }}>{value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* 2026-06-08 (round 6.2.8+): Transit 2-leg sub-section in the
            mybooking/details summary. Rendered when the booking's
            flightType is Transit AND at least one leg-2 field is
            populated. The fields mirror what the NewBooking Final
            Review shows: Leg 1 (Inbound) + Leg 2 (Outbound) — same
            leg-1 (top-level form fields) + leg-2 (form state) data. */}
        {isTransitView && hasLeg2Data && (
          <div
            className="rounded-2xl p-6"
            style={{
              background: 'rgba(124,58,237,0.04)',
              border: '1px solid rgba(124,58,237,0.18)',
            }}
          >
            <h3 className="font-medium mb-4 flex items-center gap-2" style={{ color: colors.text }}>
              <Plane className="w-5 h-5" style={{ color: '#a78bfa' }} />
              Flight Information — Transit (2 legs)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Leg 1 — inbound */}
              <div>
                <div className="text-xs uppercase tracking-wider mb-2" style={{ color: colors.textMuted }}>
                  Leg 1 (Inbound)
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs" style={{ color: colors.textMuted }}>Arrival Date</p>
                    <p style={{ color: colors.text }}>{summaryDateStr}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: colors.textMuted }}>Arrival Time</p>
                    <p style={{ color: colors.text }}>{form.time || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: colors.textMuted }}>Flight Number</p>
                    <p style={{ color: colors.text }}>{form.flightNumber || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: colors.textMuted }}>Origin</p>
                    <p style={{ color: colors.text }}>{form.origin || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: colors.textMuted }}>Flight Class</p>
                    <p style={{ color: colors.text }}>{form.flightClass || '—'}</p>
                  </div>
                </div>
              </div>

              {/* Leg 2 — outbound */}
              <div>
                <div className="text-xs uppercase tracking-wider mb-2" style={{ color: colors.textMuted }}>
                  Leg 2 (Outbound)
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-xs" style={{ color: colors.textMuted }}>Departure Date</p>
                    <p style={{ color: colors.text }}>{leg2DateStr}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: colors.textMuted }}>Departure Time</p>
                    <p style={{ color: colors.text }}>{leg2TimeStr}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: colors.textMuted }}>Flight Number</p>
                    <p style={{ color: colors.text }}>{leg2FlightNo || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: colors.textMuted }}>Destination</p>
                    <p style={{ color: colors.text }}>{leg2Destination || '—'}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: colors.textMuted }}>Flight Class</p>
                    <p style={{ color: colors.text }}>{leg2FlightClass || '—'}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 pt-2">
          <button
            type="button"
            onClick={() => navigate('/mybooking')}
            className="flex-1 py-3 px-6 rounded-xl transition-all text-sm"
            style={secondaryBtnStyle}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 py-3 px-6 rounded-xl bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)] text-white hover:shadow-lg hover:shadow-[rgb(220,181,21)]/20 transition-all flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Send className="w-4 h-4" />
            Send Change Request
          </button>
        </div>
      </form>

      {/* Passenger Removal Dialog */}
      {removeDialog?.open && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl p-6 max-w-lg w-full" style={modalBg}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
                  style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)' }}
                >
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <div>
                  <h3 className="font-medium text-lg" style={{ color: colors.text }}>
                    Remove Passenger{removeDialog.needed > 1 ? 's' : ''}
                  </h3>
                  <p className="text-sm mt-0.5" style={{ color: colors.textSecondary }}>
                    You are reducing the passenger count by{' '}
                    <span className="font-medium" style={{ color: colors.text }}>{removeDialog.needed}</span>.
                    Please select which passenger{removeDialog.needed > 1 ? 's' : ''} to remove.
                  </p>
                </div>
              </div>
              <button
                onClick={cancelRemoval}
                className="ml-2 hover:opacity-60 transition-opacity"
                style={{ color: colors.textMuted }}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div
              className="rounded-lg px-4 py-2.5 mb-4 flex items-center justify-between text-sm"
              style={{ background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(231,230,221,0.5)', border: `1px solid ${colors.glassBorder}` }}
            >
              <span style={{ color: colors.textSecondary }}>
                Select <span className="font-medium" style={{ color: colors.text }}>{removeDialog.needed}</span> passenger{removeDialog.needed > 1 ? 's' : ''} to remove
              </span>
              <span className={`font-medium ${selectedForRemoval.size === removeDialog.needed ? 'text-green-400' : 'text-yellow-400'}`}>
                {selectedForRemoval.size} / {removeDialog.needed} selected
              </span>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto pr-1 mb-5">
              {passengers.map((p, idx) => {
                const isSelected = selectedForRemoval.has(p.id);
                const isDisabled = !isSelected && selectedForRemoval.size >= removeDialog.needed;
                const rowBg = isSelected ? 'rgba(239,68,68,0.12)' : (isDark ? 'rgba(255,255,255,0.04)' : 'rgba(231,230,221,0.4)');
                const rowBorder = isSelected ? '1px solid rgba(239,68,68,0.4)' : '1px solid ' + colors.cardItemBorder;
                const checkboxBg = isSelected ? 'rgba(239,68,68,0.8)' : 'transparent';
                const checkboxBorder = isSelected ? '1px solid transparent' : '1px solid ' + colors.textMuted;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => toggleRemoval(p.id)}
                    disabled={isDisabled}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all"
                    style={{
                      background: rowBg,
                      border: rowBorder,
                      opacity: isDisabled ? 0.4 : 1,
                      cursor: isDisabled ? 'not-allowed' : 'pointer',
                    }}
                  >
                    <div
                      className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0 transition-all"
                      style={{
                        background: checkboxBg,
                        border: checkboxBorder,
                      }}
                    >
                      {isSelected && <X className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                        style={{ background: 'rgba(220,181,21,0.15)', color: 'rgb(220,181,21)' }}
                      >
                        {idx + 1}
                      </span>
                      <div>
                        <p className="text-sm" style={{ color: colors.text }}>
                          {p.firstName || p.lastName
                            ? `${p.title} ${p.firstName} ${p.lastName}`.trim()
                            : 'Unnamed passenger'}
                        </p>
                        {p.travelDoc && (
                          <p className="text-xs" style={{ color: colors.textMuted }}>Doc: {p.travelDoc}</p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={cancelRemoval}
                className="flex-1 py-2.5 rounded-xl text-sm transition-all"
                style={secondaryBtnStyle}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmRemoval}
                disabled={selectedForRemoval.size !== removeDialog.needed}
                className="flex-1 py-2.5 rounded-xl text-sm font-medium transition-all disabled:opacity-40"
                style={{
                  background: 'rgba(239,68,68,0.85)',
                  border: '1px solid rgba(239,68,68,0.5)',
                  color: '#fff',
                }}
              >
                Remove {removeDialog.needed} Passenger{removeDialog.needed > 1 ? 's' : ''}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}