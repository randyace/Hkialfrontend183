import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import {
  Calendar,
  Clock,
  Users,
  Plane,
  Plus,
  Search,
  CheckCircle,
  XCircle,
  AlertCircle,
  Edit,
  Trash2,
  Download,
  X,
  Building,
  QrCode,
  Car,
  Accessibility,
  Package,
  Tag,
  Phone,
  Mail,
  User,
  FileText,
  MapPin,
  Ban,
  FileDown,
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';

import { useTheme } from './ThemeContext';

interface BookingsProps {
  setActiveTab?: (tab: string) => void;
  onEditBooking?: (booking: any) => void;
  onCancelBooking?: (id: number) => Promise<string | null>;
  cancelLoading?: boolean;
  bookings?: any[];
  allBookings?: any[];
  isLoading?: boolean;
  stats?: { upcoming: number; completed: number; cancelled: number; total: number };
  searchTerm?: string;
  filterStatus?: string;
  dateFilter?: { start: string; end: string };
  setSearchTerm?: (v: string) => void;
  setFilterStatus?: (v: string) => void;
  setDateFilter?: (v: { start: string; end: string }) => void;
}

// Mock fallback for Figma standalone preview
const MOCK_BOOKINGS_DATA: any[] = [
    {
      id: 1,
      lounge: 'The Wing First Class Lounge',
      terminal: 'Terminal 1',
      date: '2026-01-12',
      time: '14:30',
      duration: '3 hours',
      flight: 'CX 888 to London Heathrow',
      flightNumber: 'CX888',
      flightClass: 'First Class',
      flightType: 'Departure',
      guests: 1,
      status: 'confirmed',
      bookingRef: 'D-20260112-84721',
      amenities: ['Shower', 'Private Dining', 'Meeting Room'],
      premiereSuites: 1,
      premiereVipPassengers: 2,
      premiereNonFlyingGuests: 0,
      vipPassengers: 0,
      nonFlyingGuests: 0,
      passengers: [
        { title: 'Mr', firstName: 'John', lastName: 'Smith', travelDoc: 'P12345678', membership: 'HKIAL001' },
        { title: 'Mrs', firstName: 'Jane', lastName: 'Smith', travelDoc: 'P87654321', membership: 'HKIAL002' }
      ],
      services: {
        loungeExtension: 2,
        limousineService: 1,
        destinationAddresses: ['123 Victoria Road, Central, Hong Kong'],
        limousineStops: ['MTR Central Station'],
        wheelchairService: 0,
        luggageCount: 3
      },
      contactPerson: { name: 'John Smith', email: 'john.smith@example.com', phone: '+852 9876 5432' },
      totalAmount: 2700
    },
    {
      id: 2,
      lounge: 'The Pier Business Class Lounge',
      terminal: 'Terminal 1',
      date: '2026-01-20',
      time: '10:15',
      duration: '2 hours',
      flight: 'CX 250 to Tokyo Narita',
      flightNumber: 'CX250',
      flightClass: 'Business Class',
      flightType: 'Departure',
      guests: 0,
      status: 'confirmed',
      bookingRef: 'D-20260120-63195',
      amenities: ['Buffet', 'Bar', 'Business Center'],
      premiereSuites: 0,
      premiereVipPassengers: 0,
      premiereNonFlyingGuests: 0,
      vipPassengers: 2,
      nonFlyingGuests: 1,
      passengers: [
        { title: 'Ms', firstName: 'Sarah', lastName: 'Chen', travelDoc: 'P11223344', membership: 'HKIAL003' },
        { title: 'Mr', firstName: 'David', lastName: 'Wong', travelDoc: 'P99887766', membership: 'HKIAL004' }
      ],
      services: {
        loungeExtension: 0,
        limousineService: 0,
        destinationAddresses: [],
        limousineStops: [],
        wheelchairService: 1,
        luggageCount: 2
      },
      contactPerson: { name: 'Sarah Chen', email: 'sarah.chen@example.com', phone: '+852 9123 4567' },
      totalAmount: 300
    },
    {
      id: 3,
      lounge: 'The Cabin Lounge',
      terminal: 'Terminal 1',
      date: '2025-12-28',
      time: '16:45',
      duration: '2 hours',
      flight: 'CX 505 to Singapore',
      flightNumber: 'CX505',
      flightClass: 'Economy Class',
      flightType: 'Departure',
      guests: 2,
      status: 'completed',
      bookingRef: 'D-20251228-29847',
      amenities: ['Buffet', 'Noodle Bar', 'Shower'],
      premiereSuites: 0,
      premiereVipPassengers: 0,
      premiereNonFlyingGuests: 0,
      vipPassengers: 1,
      nonFlyingGuests: 2,
      passengers: [
        { title: 'Mr', firstName: 'Michael', lastName: 'Lee', travelDoc: 'P55667788', membership: 'HKIAL005' }
      ],
      services: {
        loungeExtension: 1,
        limousineService: 0,
        destinationAddresses: [],
        limousineStops: [],
        wheelchairService: 0,
        luggageCount: 1
      },
      contactPerson: { name: 'Michael Lee', email: 'michael.lee@example.com', phone: '+852 9234 5678' },
      totalAmount: 500
    },
    {
      id: 4,
      lounge: 'The Arrival Lounge',
      terminal: 'Terminal 1',
      date: '2025-12-15',
      time: '08:30',
      duration: '1.5 hours',
      flight: 'CX 270 from Seoul',
      flightNumber: 'CX270',
      flightClass: 'Business Class',
      flightType: 'Arrival',
      guests: 0,
      status: 'completed',
      bookingRef: 'A-20251215-51639',
      amenities: ['Shower', 'Breakfast', 'Barista'],
      premiereSuites: 0,
      premiereVipPassengers: 0,
      premiereNonFlyingGuests: 0,
      vipPassengers: 1,
      nonFlyingGuests: 0,
      passengers: [
        { title: 'Mrs', firstName: 'Emily', lastName: 'Chan', travelDoc: 'P44332211', membership: 'HKIAL006' }
      ],
      services: {
        loungeExtension: 0,
        limousineService: 0,
        destinationAddresses: [],
        limousineStops: [],
        wheelchairService: 0,
        luggageCount: 2
      },
      contactPerson: { name: 'Emily Chan', email: 'emily.chan@example.com', phone: '+852 9345 6789' },
      totalAmount: 0
    },
    {
      id: 5,
      lounge: 'The Pier First Class Lounge',
      terminal: 'Terminal 1',
      date: '2026-02-05',
      time: '19:00',
      duration: '4 hours',
      flight: 'CX 251 to New York JFK',
      flightNumber: 'CX251',
      flightClass: 'First Class',
      flightType: 'Departure',
      guests: 0,
      status: 'pending',
      bookingRef: 'D-20260205-74103',
      amenities: ['Private Cabanas', 'Fine Dining', 'Spa'],
      premiereSuites: 2,
      premiereVipPassengers: 4,
      premiereNonFlyingGuests: 1,
      vipPassengers: 0,
      nonFlyingGuests: 0,
      passengers: [
        { title: 'Dr', firstName: 'Robert', lastName: 'Anderson', travelDoc: 'P77889900', membership: 'HKIAL007' },
        { title: 'Mrs', firstName: 'Patricia', lastName: 'Anderson', travelDoc: 'P00998877', membership: 'HKIAL008' },
        { title: 'Miss', firstName: 'Sophie', lastName: 'Anderson', travelDoc: 'P11001100', membership: 'HKIAL009' },
        { title: 'Mr', firstName: 'James', lastName: 'Anderson', travelDoc: 'P22112211', membership: 'HKIAL010' }
      ],
      services: {
        loungeExtension: 3,
        limousineService: 2,
        destinationAddresses: ['1 Harbour View Street, Central', '88 Queensway, Admiralty'],
        limousineStops: [],
        wheelchairService: 0,
        luggageCount: 8
      },
      contactPerson: { name: 'Dr Robert Anderson', email: 'r.anderson@example.com', phone: '+852 9456 7890' },
      totalAmount: 3900
    },
    {
      id:6,
      lounge: 'The Bridge Lounge',
      terminal: 'Terminal 2',
      date: '2026-01-08',
      time: '11:00',
      duration: '2 hours',
      flight: 'CX 406 to Bangkok',
      flightNumber: 'CX406',
      flightClass: 'Business Class',
      flightType: 'Departure',
      guests: 0,
      status: 'cancelled',
      bookingRef: 'D-20260108-38561',
      amenities: ['Buffet', 'Bar'],
      premiereSuites: 0,
      premiereVipPassengers: 0,
      premiereNonFlyingGuests: 0,
      vipPassengers: 1,
      nonFlyingGuests: 0,
      passengers: [
        { title: 'Mr', firstName: 'James', lastName: 'Ng', travelDoc: 'P33445566', membership: 'HKIAL011' }
      ],
      services: {
        loungeExtension: 0,
        limousineService: 0,
        destinationAddresses: [],
        limousineStops: [],
        wheelchairService: 0,
        luggageCount: 1
      },
      contactPerson: { name: 'James Ng', email: 'james.ng@example.com', phone: '+852 9567 8901' },
      totalAmount: 150
    },
    {
      id: 7,
      lounge: 'The Cabin Lounge',
      terminal: 'Terminal 1',
      date: '2026-02-15',
      time: '09:45',
      duration: '2 hours',
      flight: 'CX 614 to Shanghai',
      flightNumber: 'CX614',
      flightClass: 'Economy Class',
      flightType: 'Departure',
      guests: 1,
      status: 'reviewing',
      bookingRef: 'D-20260215-92047',
      amenities: ['Buffet', 'Noodle Bar'],
      premiereSuites: 0,
      premiereVipPassengers: 0,
      premiereNonFlyingGuests: 0,
      vipPassengers: 0,
      nonFlyingGuests: 1,
      passengers: [
        { title: 'Ms', firstName: 'Linda', lastName: 'Wu', travelDoc: 'P66778899', membership: 'HKIAL012' }
      ],
      services: {
        loungeExtension: 0,
        limousineService: 0,
        destinationAddresses: [],
        limousineStops: [],
        wheelchairService: 0,
        luggageCount: 2
      },
      contactPerson: { name: 'Linda Wu', email: 'linda.wu@example.com', phone: '+852 9678 9012' },
      totalAmount: 200
    },
    {
      id: 8,
      lounge: 'The Pier Business Class Lounge',
      terminal: 'Terminal 1',
      date: '2026-01-25',
      time: '13:00',
      duration: '2 hours',
      flight: 'CX 471 to Sydney',
      flightNumber: 'CX471',
      flightClass: 'Business Class',
      flightType: 'Departure',
      guests: 2,
      status: 'rejected',
      bookingRef: 'D-20260125-16384',
      amenities: ['Buffet', 'Bar', 'Business Center'],
      premiereSuites: 0,
      premiereVipPassengers: 0,
      premiereNonFlyingGuests: 0,
      vipPassengers: 2,
      nonFlyingGuests: 2,
      passengers: [
        { title: 'Mr', firstName: 'Thomas', lastName: 'Leung', travelDoc: 'P88990011', membership: 'HKIAL013' },
        { title: 'Ms', firstName: 'Grace', lastName: 'Leung', travelDoc: 'P22334455', membership: 'HKIAL014' }
      ],
      services: {
        loungeExtension: 0,
        limousineService: 0,
        destinationAddresses: [],
        limousineStops: [],
        wheelchairService: 0,
        luggageCount: 4
      },
      contactPerson: { name: 'Thomas Leung', email: 'thomas.leung@example.com', phone: '+852 9789 0123' },
      totalAmount: 0
    }
  ];

function formatDateDDMMYYYY(dateStr: string): string {
  if (!dateStr) return '—';
  const datePart = dateStr.split('T')[0];
  const parts = datePart.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

export function Bookings({
  setActiveTab,
  onEditBooking,
  onCancelBooking,
  cancelLoading,
  bookings: propBookings,
  stats: propStats,
  searchTerm: propSearchTerm,
  filterStatus: propFilterStatus,
  dateFilter: propDateFilter,
  setSearchTerm: propSetSearchTerm,
  setFilterStatus: propSetFilterStatus,
  setDateFilter: propSetDateFilter,
}: BookingsProps) {
  const { colors, glassStyle, mode } = useTheme();
  const isDark = mode === 'dark';
  const navigate = useNavigate();

  // Use container data when provided, fall back to mock for Figma standalone
  const bookings = propBookings ?? MOCK_BOOKINGS_DATA;
  const stats = propStats ?? {
    upcoming: bookings.filter((b: any) => b.status === 'confirmed' || b.status === 'pending' || b.status === 'reviewing').length,
    completed: bookings.filter((b: any) => b.status === 'completed').length,
    cancelled: bookings.filter((b: any) => b.status === 'cancelled' || b.status === 'rejected').length,
    total: bookings.length
  };
  const searchTerm = propSearchTerm ?? '';
  const filterStatus = propFilterStatus ?? 'all';
  const dateFilter = propDateFilter ?? { start: '', end: '' };
  const handleSetSearchTerm = propSetSearchTerm ?? ((v: string) => {});
  const handleSetFilterStatus = propSetFilterStatus ?? ((v: string) => {});
  const handleSetDateFilter = propSetDateFilter ?? ((v: { start: string; end: string }) => {});

  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<any>(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<any>(null);
  const [cancelError, setCancelError] = useState('');
  const [bookingForm, setBookingForm] = useState({
    date: '',
    time: '',
    flightType: 'Departure',
    premiereSuites: 0,
    vipPassengers: 0,
    nonFlyingGuests: 0
  });

  // Theme-aware styles
  const inputStyle: React.CSSProperties = {
    background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(231,230,221,0.7)',
    border: `1px solid ${colors.inputBorder}`,
    color: colors.inputText,
  };

  const modalBg: React.CSSProperties = {
    backdropFilter: 'blur(20px)',
    background: colors.modalBackground,
    border: `1px solid ${colors.glassBorder}`,
  };

  const secondaryBtnStyle: React.CSSProperties = {
    background: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(231,230,221,0.7)',
    border: `1px solid ${colors.glassBorder}`,
    color: colors.text,
  };

  const tagStyle: React.CSSProperties = {
    background: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(231,230,221,0.6)',
    border: `1px solid ${colors.cardItemBorder}`,
    color: colors.textSecondary,
  };

  const handleBookingFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: name === 'premiereSuites' || name === 'vipPassengers' || name === 'nonFlyingGuests'
        ? parseInt(value) || 0
        : value
    }));
  };

  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowBookingModal(false);
    setBookingForm({ date: '', time: '', flightType: 'Departure', premiereSuites: 0, vipPassengers: 0, nonFlyingGuests: 0 });
  };

  const handleEditClick = (booking: any) => {
    if (onEditBooking) {
      onEditBooking(booking);
    }
    navigate('/mybooking/details/' + booking.id, { state: { booking } });
  };

  const isWithin48Hours = (dateStr: string, timeStr: string) => {
    const bookingDateTime = new Date(`${dateStr}T${timeStr}:00`);
    const now = new Date();
    const diffMs = bookingDateTime.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    return diffHours < 48;
  };

  const handleCancelClick = (booking: any) => {
    setBookingToCancel(booking);
    setShowCancelDialog(true);
  };

  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;
    setCancelError('');
    if (onCancelBooking) {
      const errMsg = await onCancelBooking(bookingToCancel.id);
      if (errMsg) {
        setCancelError(errMsg);
        return;
      }
    }
    setShowCancelDialog(false);
    setBookingToCancel(null);
    setCancelError('');
  };

  const handleDismissCancel = () => {
    setShowCancelDialog(false);
    setBookingToCancel(null);
  };

  const handleShowQR = (booking: typeof bookings[number]) => {
    setSelectedBooking(booking);
    setShowQRModal(true);
  };

  // ── Apple Wallet ──────────────────────────────────────────────────────────
  const handleAddToWallet = () => {
    if (!selectedBooking) return;
    toast.success('Added to Apple Wallet', {
      description: `Booking ${selectedBooking.bookingRef} has been added to your Apple Wallet.`,
    });
  };

  // ── Download PDF (browser-native print-to-PDF) ───────────────────────────
  const handleDownloadPDF = () => {
    if (!selectedBooking) return;

    const b = selectedBooking;
    const statusLabel = b.status.charAt(0).toUpperCase() + b.status.slice(1);
    const dateLabel = formatDateDDMMYYYY(b.date);

    const detailRows: Array<[string, string]> = [
      ['Lounge',    b.lounge],
      ['Terminal',  b.terminal],
      ['Date',      dateLabel],
      ['Time',      b.time],
      ['Flight',    b.flight],
      ['Flight No', b.flightNumber],
      ['Class',     b.flightClass],
      ['Type',      b.flightType],
      ['Status',    statusLabel],
    ];

    const passengerRows = b.passengers.map((p: any, i: number) =>
      `<tr style="background:${i % 2 === 0 ? '#f5f4ee' : '#ffffff'}">
        <td style="padding:8px 12px;color:#141929;font-weight:600">${p.title} ${p.firstName} ${p.lastName}</td>
        <td style="padding:8px 12px;color:#64646e">${p.travelDoc}</td>
        <td style="padding:8px 12px;color:#64646e">${p.membership}</td>
      </tr>`
    ).join('');

    const detailRowsHtml = detailRows.map(([label, value], i) =>
      `<tr style="background:${i % 2 === 0 ? '#f5f4ee' : '#ffffff'}">
        <td style="padding:8px 12px;color:#64646e;font-size:11px;text-transform:uppercase;letter-spacing:0.05em;width:140px">${label}</td>
        <td style="padding:8px 12px;color:#141929;font-weight:500">${value}</td>
      </tr>`
    ).join('');

    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8"/>
  <title>HKIA Entry Pass – ${b.bookingRef}</title>
  <style>
    @media print { @page { margin: 0; size: A4; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
    body { background: #fff; }
    .header { background: #0a1929; color: #fff; padding: 36px 48px 28px; border-bottom: 5px solid rgb(220,181,21); text-align: center; }
    .header-title { color: rgb(220,181,21); font-size: 22px; letter-spacing: 0.08em; font-weight: 700; margin-bottom: 6px; }
    .header-sub { font-size: 14px; color: #e5e7eb; margin-bottom: 4px; }
    .header-note { font-size: 11px; color: rgb(180,160,60); }
    .body { padding: 36px 48px; }
    .qr-section { display: flex; flex-direction: column; align-items: center; margin-bottom: 28px; }
    .qr-box { width: 160px; height: 160px; background: linear-gradient(135deg, rgba(220,181,21,0.35), rgba(180,140,10,0.25)); border: 2px solid rgba(220,181,21,0.6); border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 10px; }
    .qr-grid { display: grid; grid-template-columns: repeat(10, 12px); grid-template-rows: repeat(10, 12px); gap: 1px; }
    .qr-cell { width: 12px; height: 12px; background: #0a1929; border-radius: 1px; }
    .qr-label { font-size: 11px; color: #64646e; }
    .ref-badge { background: #0a1929; color: rgb(220,181,21); font-family: monospace; font-size: 22px; letter-spacing: 0.1em; text-align: center; border-radius: 10px; padding: 14px 24px; margin-bottom: 28px; }
    .section { border: 1px solid rgba(220,181,21,0.4); border-radius: 10px; overflow: hidden; margin-bottom: 24px; }
    .section-header { background: rgb(220,181,21); color: #0a1929; font-size: 12px; font-weight: 700; letter-spacing: 0.1em; text-align: center; padding: 8px; text-transform: uppercase; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    .footer { background: #0a1929; color: rgb(220,181,21); text-align: center; padding: 14px 24px; margin-top: 32px; border-top: 3px solid rgb(220,181,21); font-size: 11px; letter-spacing: 0.04em; }
    .footer-sub { color: rgb(130,120,80); font-size: 10px; margin-top: 4px; }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-title">HONG KONG INTERNATIONAL AIRPORT</div>
    <div class="header-sub">Exclusive Lounge — Entry Pass</div>
    <div class="header-note">This pass grants access to HKIA Premium Lounges. Present at entrance.</div>
  </div>
  <div class="body">
    <div class="qr-section">
      <div class="qr-box">
        <div class="qr-grid">
          ${[
            [1,1,1,1,1,1,1,0,1,0],
            [1,0,0,0,0,0,1,0,0,1],
            [1,0,1,1,1,0,1,0,1,0],
            [1,0,1,1,1,0,1,1,0,1],
            [1,0,1,1,1,0,1,0,1,1],
            [1,0,0,0,0,0,1,1,0,0],
            [1,1,1,1,1,1,1,0,1,0],
            [0,0,0,0,0,0,0,1,1,0],
            [1,0,1,1,0,1,0,0,1,1],
            [0,1,0,1,1,0,1,0,0,1],
          ].map(row => row.map(v => v
            ? '<div class="qr-cell"></div>'
            : '<div class="qr-cell" style="background:transparent"></div>'
          ).join('')).join('')}
        </div>
      </div>
      <div class="qr-label">Scan to verify at lounge entrance</div>
    </div>
    <div class="ref-badge">${b.bookingRef}</div>
    <div class="section">
      <div class="section-header">Booking Details</div>
      <table>${detailRowsHtml}</table>
    </div>
    <div class="section">
      <div class="section-header">Passengers</div>
      <table>
        <thead><tr style="background:#f5f4ee">
          <th style="padding:8px 12px;text-align:left;font-size:11px;color:#64646e;font-weight:600">Name</th>
          <th style="padding:8px 12px;text-align:left;font-size:11px;color:#64646e;font-weight:600">Travel Document</th>
          <th style="padding:8px 12px;text-align:left;font-size:11px;color:#64646e;font-weight:600">Membership</th>
        </tr></thead>
        <tbody>${passengerRows}</tbody>
      </table>
    </div>
  </div>
  <div class="footer">
    HKIA PREMIUM LOUNGE SERVICES &nbsp;·&nbsp; Hong Kong International Airport &nbsp;·&nbsp; Lantau Island, Hong Kong
    <div class="footer-sub">This document is system-generated. For assistance call +852 2181 8888.</div>
  </div>
  <script>window.onload = function(){ window.print(); }</script>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    printWindow.document.write(html);
    printWindow.document.close();

    toast.success('Print dialog opened', {
      description: `Save as PDF to download entry details for ${b.bookingRef}.`,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="px-3 py-1 rounded-full text-xs flex items-center gap-1 bg-green-100 text-green-700 border border-green-200">
            <CheckCircle className="w-3 h-3" /> Confirmed
          </span>
        );
      case 'reviewing':
        return (
          <span className="px-3 py-1 rounded-full text-xs flex items-center gap-1 bg-purple-100 text-purple-700 border border-purple-200">
            <AlertCircle className="w-3 h-3" /> Reviewing
          </span>
        );
      case 'pending':
        return (
          <span className="px-3 py-1 rounded-full text-xs flex items-center gap-1 bg-yellow-100 text-yellow-700 border border-yellow-200">
            <AlertCircle className="w-3 h-3" /> Pending
          </span>
        );
      case 'completed':
        return (
          <span className="px-3 py-1 rounded-full text-xs flex items-center gap-1 bg-blue-100 text-blue-700 border border-blue-200">
            <CheckCircle className="w-3 h-3" /> Completed
          </span>
        );
      case 'cancelled':
        return (
          <span className="px-3 py-1 rounded-full text-xs flex items-center gap-1 bg-red-100 text-red-700 border border-red-200">
            <XCircle className="w-3 h-3" /> Cancelled
          </span>
        );
      case 'rejected':
        return (
          <span className="px-3 py-1 rounded-full text-xs flex items-center gap-1 bg-orange-100 text-orange-700 border border-orange-200">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch =
      booking.lounge.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.flight.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.bookingRef.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || booking.status === filterStatus;
    const matchesDateFilter =
      !dateFilter.start || !dateFilter.end ||
      (new Date(booking.date) >= new Date(dateFilter.start) && new Date(booking.date) <= new Date(dateFilter.end));
    return matchesSearch && matchesFilter && matchesDateFilter;
  });

  const sortedBookings = [...filteredBookings].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // ── Booking Status Progress Bar ─────────────────────────────────────────
  const BookingStatusProgress = ({ status }: { status: string }) => {
    const gold = 'rgb(220,181,21)';
    const goldLight = 'rgba(220,181,21,0.15)';
    const red = 'rgb(210,55,55)';
    const redLight = 'rgba(210,55,55,0.12)';
    const grayBorder = isDark ? 'rgba(255,255,255,0.22)' : 'rgba(64,63,52,0.28)';
    const grayLine   = isDark ? 'rgba(255,255,255,0.14)' : 'rgba(64,63,52,0.18)';
    const grayText   = isDark ? 'rgba(255,255,255,0.38)' : 'rgba(64,63,52,0.48)';
    const divider    = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(64,63,52,0.09)';

    type StepState = 'completed' | 'active' | 'inactive' | 'terminated';

    const isCancelled = status === 'cancelled';
    const isRejected  = status === 'rejected';
    const isTerminated = isCancelled || isRejected;

    const activeStep = (() => {
      switch (status) {
        case 'reviewing':  return 0;
        case 'pending':    return 1;
        case 'confirmed':  return 2;
        case 'completed':  return 3;
        default:           return -1;
      }
    })();

    const getStepState = (idx: number): StepState => {
      if (isTerminated) {
        if (idx === 0 || idx === 1) return 'completed';
        if (idx === 2) return 'terminated';
        return 'inactive';
      }
      if (activeStep > idx)  return 'completed';
      if (activeStep === idx) return 'active';
      return 'inactive';
    };

    const steps = [
      { baseLabel: 'Reviewing',  idx: 0 },
      { baseLabel: 'Pending',    idx: 1 },
      { baseLabel: 'Confirmed',  idx: 2 },
      { baseLabel: 'Completed',  idx: 3 },
    ].map(s => ({
      ...s,
      label: isTerminated && s.idx === 2
        ? (isCancelled ? 'Cancelled' : 'Rejected')
        : s.baseLabel,
    }));

    const footnote = isCancelled
      ? 'Cancelled by member'
      : isRejected
      ? 'Rejected by administrator'
      : null;

    return (
      <div className="w-full mt-4 pt-4" style={{ borderTop: `1px solid ${divider}` }}>
        {/* Label row */}
        <p className="text-xs mb-3" style={{ color: grayText }}>Booking Status</p>

        {/* Step nodes + connector lines — nodes pinned at edges, lines stretch between */}
        <div className="flex items-start w-full">
          {steps.map(({ label, idx }) => {
            const state   = getStepState(idx);
            const isFirst = idx === 0;
            const isLast  = idx === steps.length - 1;

            let dotBorder = gold;
            let dotBg = goldLight;
            let labelCol = gold;
            if (state === 'terminated') {
              dotBorder = red;
              dotBg = redLight;
              labelCol = red;
            } else if (state === 'inactive') {
              dotBorder = grayBorder;
              dotBg = 'transparent';
              labelCol = grayText;
            }

            // Line drawn BEFORE each non-first node
            const prevIdx = idx - 1;
            let lineStyle: React.CSSProperties = {};
            if (!isFirst) {
              if (isTerminated && (prevIdx === 0 || prevIdx === 1)) {
                lineStyle = { background: gold };
              } else if (isTerminated && prevIdx >= 2) {
                lineStyle = {
                  background: 'repeating-linear-gradient(to right, ' + grayLine + ' 0px, ' + grayLine + ' 5px, transparent 5px, transparent 11px)',
                };
              } else {
                lineStyle = { background: activeStep > prevIdx ? gold : grayLine };
              }
            }

            const elements = [];

            // Pre-compute alignment class to avoid nested ternary in JSX
            let alignClass = '';
            if (isLast) {
              alignClass = ' text-right';
            } else if (isFirst) {
              alignClass = ' text-left';
            }

            // Connector before this node (skip for first)
            if (!isFirst) {
              elements.push(
                <div
                  key={`connector-${idx}`}
                  className="flex-1 h-0.5 self-start mx-2"
                  style={{ marginTop: '18px', ...lineStyle }}
                />
              );
            }

            // Node
            elements.push(
              <div key={`node-${idx}`} className="flex flex-col items-center flex-shrink-0">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center border-2 transition-all"
                  style={{ borderColor: dotBorder, background: dotBg }}
                >
                  {state === 'completed'  && <CheckCircle className="w-4 h-4" style={{ color: gold }} />}
                  {state === 'terminated' && <XCircle className="w-4 h-4" style={{ color: red }} />}
                  {state === 'active'     && (
                    <div className="w-3 h-3 rounded-full" style={{ background: gold }} />
                  )}
                  {state === 'inactive'   && (
                    <span className="text-xs" style={{ color: grayBorder }}>{idx + 1}</span>
                  )}
                </div>
                <span
                  className={`text-xs mt-2 text-center whitespace-nowrap${alignClass}`}
                  style={{ color: labelCol, lineHeight: '1.25' }}
                >
                  {label}
                </span>
              </div>
            );

            return elements;
          })}
        </div>

        {/* Footnote for cancelled / rejected */}
        {footnote && (
          <p className="text-xs mt-3 italic" style={{ color: red, opacity: 0.8 }}>
            {footnote}
          </p>
        )}
      </div>
    );
  };

  const within48 = bookingToCancel
    ? isWithin48Hours(bookingToCancel.date, bookingToCancel.time)
    : false;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-3xl bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)] bg-clip-text text-transparent">
            My Bookings
          </h1>
          <p className="mt-1" style={{ color: colors.textSecondary }}>
            Manage your lounge reservations and visit history.
          </p>
        </div>
        <button
          onClick={() => navigate('/newbooking')}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)] text-white font-semibold hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Booking
        </button>
      </div>

      {/* Search and Filter */}
      <div className="rounded-2xl p-6" style={glassStyle}>
        <div className="flex flex-col gap-4">
          {/* Search Bar Row */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: colors.textMuted }} />
              <input
                type="text"
                placeholder="Search by lounge, flight, or reference..."
                value={searchTerm}
                 onChange={(e) => handleSetSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]/40"
                style={inputStyle}
              />
            </div>
            <select
              value={filterStatus}
               onChange={(e) => handleSetFilterStatus(e.target.value)}
              className="px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]/40"
              style={inputStyle}
            >
              <option value="all">All Status</option>
              <option value="confirmed">Confirmed</option>
              <option value="reviewing">Reviewing</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
            </select>
            <button
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)] text-white hover:opacity-90 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <Search className="w-5 h-5" />
              Search
            </button>
          </div>

          {/* Date Filter Row */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2" style={{ color: colors.text }}>
              <Calendar className="w-5 h-5" style={{ color: 'rgb(220, 181, 21)' }} />
              <span className="text-sm font-medium">Filter by Date:</span>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={dateFilter.start}
                 onChange={(e) => handleSetDateFilter({ ...dateFilter, start: e.target.value })}
                className="flex-1 min-w-0 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]/40 text-sm"
                style={inputStyle}
              />
              <span className="flex-shrink-0 text-sm" style={{ color: colors.textSecondary }}>to</span>
              <input
                type="date"
                value={dateFilter.end}
                 onChange={(e) => handleSetDateFilter({ ...dateFilter, end: e.target.value })}
                className="flex-1 min-w-0 px-3 py-2.5 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]/40 text-sm"
                style={inputStyle}
              />
              {(dateFilter.start || dateFilter.end) && (
                <button
                  onClick={() => handleSetDateFilter({ start: '', end: '' })}
                  className="flex-shrink-0 px-3 py-2.5 rounded-xl bg-red-100 border border-red-200 text-red-700 hover:bg-red-200 transition-all text-sm whitespace-nowrap"
                >
                  Clear Dates
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {sortedBookings.map((booking) => (
          <div key={booking.id} className="rounded-2xl p-6" style={glassStyle}>
            {/* Top section: Details and Action Buttons side by side */}
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-xl font-semibold" style={{ color: colors.text }}>{booking.lounge}</h3>
                    <p className="text-sm" style={{ color: colors.textSecondary }}>{booking.terminal}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2" style={{ color: colors.text }}>
                    <Calendar className="w-4 h-4 text-purple-500" />
                    <div>
                      <p className="text-xs" style={{ color: colors.textMuted }}>Date</p>
                      <p className="text-sm font-medium">{formatDateDDMMYYYY(booking.date)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2" style={{ color: colors.text }}>
                    <Clock className="w-4 h-4" style={{ color: 'rgb(220,181,21)' }} />
                    <div>
                      <p className="text-xs" style={{ color: colors.textMuted }}>Time</p>
                      <p className="text-sm font-medium">{booking.time}{booking.duration ? ` (${booking.duration})` : ''}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2" style={{ color: colors.text }}>
                    <Plane className="w-4 h-4 text-blue-500" />
                    <div>
                      <p className="text-xs" style={{ color: colors.textMuted }}>Flight</p>
                      <p className="text-sm font-medium">{booking.flight}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2" style={{ color: colors.text }}>
                    <Users className="w-4 h-4 text-purple-500" />
                    <div>
                      <p className="text-xs" style={{ color: colors.textMuted }}>Guests</p>
                      <p className="text-sm font-medium">
                        {booking.guests === 0 ? 'Solo' : `+${booking.guests} guest${booking.guests > 1 ? 's' : ''}`}
                      </p>
                    </div>
                  </div>
                </div>

                

                <p className="text-xs" style={{ color: colors.textMuted }}>
                  Booking Reference: {booking.bookingRef}
                </p>
              </div>

              <div className="flex lg:flex-col gap-2 lg:pt-1">
                {booking.status === 'confirmed' && (
                  <button
                    onClick={() => handleShowQR(booking)}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)] text-white hover:opacity-90 transition-all flex items-center gap-2 text-sm whitespace-nowrap"
                  >
                    <QrCode className="w-4 h-4" />
                    QR Code
                  </button>
                )}
                {(booking.status === 'confirmed' || booking.status === 'pending' || booking.status === 'reviewing') && (
                  <>
                    <button
                      onClick={() => handleEditClick(booking)}
                      className="px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-sm"
                      style={secondaryBtnStyle}
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleCancelClick(booking)}
                      className="px-4 py-2 rounded-xl bg-red-100 border border-red-200 text-red-700 hover:bg-red-200 transition-all flex items-center gap-2 text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Cancel
                    </button>
                  </>
                )}
                {booking.status === 'completed' && (
                  <button
                    className="px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-sm"
                    style={secondaryBtnStyle}
                  >
                    <Download className="w-4 h-4" />
                    Receipt
                  </button>
                )}
              </div>
            </div>

            {/* Bottom section: Status Progress Bar - full width */}
            <BookingStatusProgress status={booking.status} />
          </div>
        ))}
      </div>

      {filteredBookings.length === 0 && (
        <div className="rounded-2xl p-12 text-center" style={glassStyle}>
          <Calendar className="w-16 h-16 mx-auto mb-4" style={{ color: colors.textMuted }} />
          <h3 className="text-xl mb-2" style={{ color: colors.text }}>No bookings found</h3>
          <p className="mb-4" style={{ color: colors.textSecondary }}>Try adjusting your search or filter criteria</p>
          <button
            onClick={() => navigate('/newbooking')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)] text-white font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Make Your First Booking
          </button>
        </div>
      )}

      {/* Cancel Confirmation Dialog */}
      {showCancelDialog && bookingToCancel && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="rounded-2xl p-8 max-w-md w-full" style={modalBg}>
              {/* Icon */}
              <div className="flex justify-center mb-5">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: 'rgba(210,55,55,0.12)', border: '2px solid rgba(210,55,55,0.4)' }}>
                  <Ban className="w-8 h-8" style={{ color: 'rgb(210,55,55)' }} />
                </div>
              </div>

              <h2 className="text-xl text-center mb-2" style={{ color: colors.text }}>
                Cancel Booking
              </h2>
              <p className="text-sm text-center mb-5" style={{ color: colors.textSecondary }}>
                Are you sure you want to cancel booking{' '}
                <span style={{ color: 'rgb(220,181,21)' }}>{bookingToCancel.bookingRef}</span>?
              </p>

              {/* Booking summary */}
              <div className="rounded-xl p-4 mb-5 space-y-2" style={{ background: isDark ? 'rgba(255,255,255,0.06)' : 'rgba(231,230,221,0.5)', border: `1px solid ${colors.glassBorder}` }}>
                <div className="flex items-center gap-2" style={{ color: colors.text }}>
                  <Building className="w-4 h-4 flex-shrink-0" style={{ color: 'rgb(220,181,21)' }} />
                  <span className="text-sm">{bookingToCancel.lounge}</span>
                </div>
                <div className="flex items-center gap-2" style={{ color: colors.text }}>
                  <Calendar className="w-4 h-4 flex-shrink-0 text-purple-500" />
                  <span className="text-sm">{formatDateDDMMYYYY(bookingToCancel.date)}</span>
                </div>
                <div className="flex items-center gap-2" style={{ color: colors.text }}>
                  <Clock className="w-4 h-4 flex-shrink-0" style={{ color: 'rgb(220,181,21)' }} />
                  <span className="text-sm">{bookingToCancel.time} &mdash; {bookingToCancel.flight}</span>
                </div>
              </div>

              {/* 48-hour warning */}
              {within48 ? (
                <div className="rounded-xl p-4 mb-6 flex items-start gap-3" style={{ background: 'rgba(210,55,55,0.10)', border: '1px solid rgba(210,55,55,0.35)' }}>
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'rgb(210,55,55)' }} />
                  <div>
                    <p className="text-sm" style={{ color: 'rgb(210,55,55)' }}>
                      <span style={{ fontWeight: 600 }}>No Refund Applicable</span>
                    </p>
                    <p className="text-xs mt-1" style={{ color: isDark ? 'rgba(255,100,100,0.85)' : 'rgba(180,40,40,0.85)' }}>
                      Your booking is within <span style={{ fontWeight: 600 }}>48 hours</span>. Cancellations made less than 48 hours before the booking date are not eligible for a refund.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="rounded-xl p-4 mb-6 flex items-start gap-3" style={{ background: 'rgba(220,181,21,0.10)', border: '1px solid rgba(220,181,21,0.35)' }}>
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: 'rgb(220,181,21)' }} />
                  <p className="text-xs" style={{ color: isDark ? 'rgba(220,181,21,0.9)' : 'rgba(140,110,0,0.9)' }}>
                    Please note: cancellations made <span style={{ fontWeight: 600 }}>less than 48 hours</span> before the booking date are not eligible for a refund.
                  </p>
                </div>
              )}

              {/* Cancel error message */}
              {cancelError && (
                <div className="rounded-xl p-3 mb-4 flex items-start gap-2.5" style={{ background: 'rgba(210,55,55,0.10)', border: '1px solid rgba(210,55,55,0.35)' }}>
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: 'rgb(210,55,55)' }} />
                  <p className="text-xs" style={{ color: 'rgb(210,55,55)' }}>{cancelError}</p>
                </div>
              )}

              {/* Action buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleDismissCancel}
                  disabled={!!cancelLoading}
                  className="flex-1 px-4 py-3 rounded-xl transition-all text-sm disabled:opacity-50"
                  style={secondaryBtnStyle}
                >
                  Keep Booking
                </button>
                <button
                  onClick={handleConfirmCancel}
                  disabled={!!cancelLoading}
                  className="flex-1 px-4 py-3 rounded-xl transition-all text-sm text-white disabled:opacity-50"
                  style={{ background: cancelLoading ? 'rgba(180,30,30,0.5)' : 'linear-gradient(to right, rgb(210,55,55), rgb(180,30,30))' }}
                >
                  {cancelLoading ? 'Cancelling…' : 'Yes, Cancel Booking'}
                </button>
              </div>
            </div>
          </div>
      )}

      {filteredBookings.length === 0 && (
        <div className="rounded-2xl p-12 text-center" style={glassStyle}>
          <Calendar className="w-16 h-16 mx-auto mb-4" style={{ color: colors.textMuted }} />
          <h3 className="text-xl mb-2" style={{ color: colors.text }}>No bookings found</h3>
          <p className="mb-4" style={{ color: colors.textSecondary }}>Try adjusting your search or filter criteria</p>
          <button
            onClick={() => navigate('/newbooking')}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)] text-white font-semibold hover:shadow-lg transition-all inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Make Your First Booking
          </button>
        </div>
      )}

      {/* New Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto" style={modalBg}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl" style={{ color: colors.text }}>New Booking</h2>
                <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>Reserve your lounge experience</p>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                className="hover:opacity-60 transition-opacity"
                style={{ color: colors.textMuted }}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleBookingSubmit} className="space-y-6">
              <div>
                <label className="block text-sm mb-2" style={{ color: colors.textSecondary }}>Flight Type</label>
                <div className="relative">
                  <Plane className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: colors.textMuted }} />
                  <select
                    name="flightType"
                    value={bookingForm.flightType}
                    onChange={handleBookingFormChange}
                    className="w-full pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]/40 appearance-none cursor-pointer"
                    style={inputStyle}
                    required
                  >
                    <option value="Departure">Departure</option>
                    <option value="Arrival">Arrival</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-2" style={{ color: colors.textSecondary }}>Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: colors.textMuted }} />
                    <input
                      type="date"
                      name="date"
                      value={bookingForm.date}
                      onChange={handleBookingFormChange}
                      className="w-full pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]/40"
                      style={inputStyle}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm mb-2" style={{ color: colors.textSecondary }}>Time</label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: colors.textMuted }} />
                    <input
                      type="time"
                      name="time"
                      value={bookingForm.time}
                      onChange={handleBookingFormChange}
                      className="w-full pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]/40"
                      style={inputStyle}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg" style={{ color: colors.text }}>Select Services</h3>
                {[
                  { id: 'premiereSuites', label: 'Number of Premiere Suite', icon: Building, max: 10, placeholder: 'Enter number of suites' },
                  { id: 'vipPassengers', label: 'Number of VIP Passenger in Lounge Deluxe', icon: Users, max: 20, placeholder: 'Enter number of VIP passengers' },
                  { id: 'nonFlyingGuests', label: 'Number of Non Flying Guests in Lounge Deluxe', icon: Users, max: 20, placeholder: 'Enter number of non-flying guests' },
                ].map(({ id, label, icon: Icon, max, placeholder }) => (
                  <div key={id}>
                    <label className="block text-sm mb-2" style={{ color: colors.textSecondary }}>{label}</label>
                    <div className="relative">
                      <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5" style={{ color: colors.textMuted }} />
                      <input
                        type="number"
                        name={id}
                        min="0"
                        max={max}
                        value={(bookingForm as any)[id]}
                        onChange={handleBookingFormChange}
                        className="w-full pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)]/40"
                        style={inputStyle}
                        placeholder={placeholder}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Booking Summary */}
              <div className="rounded-xl p-4"
                style={{
                  background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(231,230,221,0.5)',
                  border: `1px solid ${colors.glassBorder}`
                }}>
                <h4 className="text-sm mb-3" style={{ color: colors.textSecondary }}>Booking Summary</h4>
                <div className="space-y-2 text-sm">
                  {[
                    { label: 'Date & Time:', value: bookingForm.date && bookingForm.time ? `${formatDateDDMMYYYY(bookingForm.date)} at ${bookingForm.time}` : 'Not selected' },
                    { label: 'Flight Type:', value: bookingForm.flightType },
                    { label: 'Premiere Suites:', value: bookingForm.premiereSuites },
                    { label: 'VIP Passengers:', value: bookingForm.vipPassengers },
                    { label: 'Non-Flying Guests:', value: bookingForm.nonFlyingGuests },
                  ].map(({ label, value }) => (
                    <div key={label} className="flex justify-between">
                      <span style={{ color: colors.textMuted }}>{label}</span>
                      <span style={{ color: colors.text }}>{value}</span>
                    </div>
                  ))}
                  <div className="pt-2 flex justify-between" style={{ borderTop: `1px solid ${colors.glassBorder}` }}>
                    <span style={{ color: colors.textMuted }}>Total Guests:</span>
                    <span className="font-semibold" style={{ color: colors.text }}>
                      {bookingForm.premiereSuites + bookingForm.vipPassengers + bookingForm.nonFlyingGuests}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowBookingModal(false)}
                  className="flex-1 py-3 px-4 rounded-xl transition-all"
                  style={secondaryBtnStyle}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)] text-white hover:opacity-90 transition-all"
                >
                  Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="rounded-2xl p-8 max-w-md w-full" style={modalBg}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl" style={{ color: colors.text }}>Entry QR Code</h2>
                <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>Show this at the lounge entrance</p>
              </div>
              <button
                onClick={() => setShowQRModal(false)}
                className="hover:opacity-60 transition-opacity"
                style={{ color: colors.textMuted }}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="bg-white rounded-xl p-8 mb-6">
              <div className="w-full aspect-square bg-gradient-to-br from-[rgb(220,181,21)]/40 to-[rgb(180,140,10)]/40 rounded-lg flex items-center justify-center">
                <QrCode className="w-48 h-48 text-gray-800 mx-auto" />
              </div>
            </div>

            <div className="text-center mb-6">
              <p className="text-sm mb-1" style={{ color: colors.textMuted }}>Booking Reference</p>
              <p className="text-2xl font-mono" style={{ color: colors.text }}>{selectedBooking.bookingRef}</p>
            </div>

            <div className="rounded-xl p-4 space-y-2 text-sm mb-6"
              style={{
                background: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(231,230,221,0.5)',
                border: `1px solid ${colors.glassBorder}`
              }}>
              {[
                { label: 'Date:', value: formatDateDDMMYYYY(selectedBooking.date) },
                { label: 'Time:', value: selectedBooking.time },
                { label: 'Flight:', value: selectedBooking.flightNumber },
                { label: 'Terminal:', value: selectedBooking.terminal },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between">
                  <span style={{ color: colors.textMuted }}>{label}</span>
                  <span style={{ color: colors.text }}>{value}</span>
                </div>
              ))}
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-3 mb-3">
              {/* Add to Apple Wallet */}
              <button
                onClick={handleAddToWallet}
                className="w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2.5 transition-all hover:opacity-85 active:scale-[0.98]"
                style={{ background: '#000000', color: '#ffffff' }}
              >
                <svg viewBox="0 0 814 1000" className="w-5 h-5 flex-shrink-0" fill="white" xmlns="http://www.w3.org/2000/svg">
                  <path d="M788.1 340.9c-5.8 4.5-108.2 62.2-108.2 190.5 0 148.4 130.3 200.9 134.2 202.2-.6 3.2-20.7 71.9-68.7 141.9-42.8 61.6-87.5 123.1-155.5 123.1s-85.5-39.5-164-39.5c-76 0-103.7 40.8-165.9 40.8s-105-37.5-150.3-81.4c-52-50.9-98.1-128.2-98.1-205.5 0-42.7 15.2-86.9 45.8-121.9 42.4-48.8 103.8-80.8 168.1-80.8 62.4 0 107.7 41.5 162.6 41.5 52.7 0 85.1-41.5 165.9-41.5 22.1 0 93.5 2.6 141.9 66.5zm-64.7-204.9c27.2-34.4 49.6-82.2 49.6-130.2 0-6.3-.6-12.7-1.9-18.7-47 1.9-103.6 33.5-137.5 71.4-28.8 33.2-56.8 80.7-56.8 129.8 0 7 1.3 13.9 1.9 16.1 2.6.3 6.4.9 10.3.9 42.4 0 97.6-29.8 134.4-69.3z" />
                </svg>
                <span className="text-sm font-semibold tracking-wide">Add to Apple Wallet</span>
              </button>

              {/* Download Entry Details PDF */}
              <button
                onClick={handleDownloadPDF}
                className="w-full py-3 px-4 rounded-xl flex items-center justify-center gap-2.5 transition-all hover:opacity-90 active:scale-[0.98]"
                style={{
                  background: isDark
                    ? 'linear-gradient(135deg, rgba(220,181,21,0.2) 0%, rgba(180,140,10,0.12) 100%)'
                    : 'linear-gradient(135deg, rgba(220,181,21,0.25) 0%, rgba(180,140,10,0.15) 100%)',
                  border: isDark ? '1px solid rgba(220,181,21,0.45)' : '1px solid rgba(220,181,21,0.55)',
                  color: isDark ? 'rgb(220,181,21)' : 'rgb(140,108,5)',
                }}
              >
                <FileDown className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm font-semibold">Download Entry Details PDF</span>
              </button>
            </div>

            <button
              onClick={() => setShowQRModal(false)}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)] text-white hover:opacity-90 transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}