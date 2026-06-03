import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  ChevronRight,
  Plane,
  Users,
  Building2,
  Wallet,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Shield,
} from 'lucide-react';
import { useTheme } from './ThemeContext';

interface MemberDashboardProps {
  memberData: {
    name: string;
    memberType: string;
    companyName?: string;
    bookingsRemaining?: number;
    totalBookings?: number;
    voucherCount?: number;
    email?: string;
    membershipExpiryDate?: string;
    membershipStartDate?: string;
  };
  // Optional real-data overrides. The parent DashboardContainer fetches
  // /member/bookings and passes the derived arrays, so the dashboard
  // shows real data when these are provided. The legacy figma prototype
  // (no real API) renders the hardcoded fallback arrays below. The
  // figma code base can either pass these or omit them — the component
  // is fully backwards-compatible.
  upcomingBookings?: Array<{
    id: number;
    lounge: string;
    date: string;
    time: string;
    flight?: string;
    guests?: number;
    status?: string;
  }>;
  recentActivity?: Array<{ date: string; lounge: string; duration: string }>;
  quickStats?: Array<{ label: string; value: string; icon?: React.ComponentType<{ className?: string; style?: React.CSSProperties }>; color?: string }>;
  isLoading?: boolean;
  error?: string | null;
}

// ── Membership status helper ───────────────────────────────────────────────
function getMembershipStatus(expiryDate: string) {
  const today = new Date();
  const expiry = new Date(expiryDate);
  const daysRemaining = Math.ceil(
    (expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysRemaining < 0) {
    return {
      status: 'expired' as const,
      label: 'Expired',
      daysText: `Expired ${Math.abs(daysRemaining)} day${Math.abs(daysRemaining) !== 1 ? 's' : ''} ago`,
      daysRemaining,
    };
  }
  if (daysRemaining <= 30) {
    return {
      status: 'expiring' as const,
      label: 'Expiring Soon',
      daysText: `${daysRemaining} day${daysRemaining !== 1 ? 's' : ''} remaining`,
      daysRemaining,
    };
  }
  return {
    status: 'active' as const,
    label: 'Active',
    daysText: `${daysRemaining} days remaining`,
    daysRemaining,
  };
}

export function MemberDashboard({ memberData: propMemberData, upcomingBookings: propUpcoming, recentActivity: propRecent, quickStats: propQuickStats, isLoading: propIsLoading, error: propError }: MemberDashboardProps) {
  const { colors, glassStyle, mode } = useTheme();
  const [memberData, setMemberData] = useState({
    name: propMemberData.name || 'Sarah Chen',
    memberType: propMemberData.memberType || 'Corporate',
    companyName: propMemberData.companyName || 'Cathay Pacific Airways',
    department: propMemberData.memberType === 'Individual' ? '' : 'Executive Management',
    membershipTier: propMemberData.memberType === 'Individual' ? 'Platinum' : '',
    memberSince: propMemberData.membershipStartDate || '2022-03-15',
    membershipNumber: propMemberData.memberType === 'Individual' ? 'HKIAL-PLT-2847' : 'HKIAL-CORP-2847',
    expiryDate: propMemberData.membershipExpiryDate || '2026-12-31',
    bookingsRemaining: propMemberData.bookingsRemaining || 5,
    totalBookings: propMemberData.totalBookings || 10,
    upcomingBookings: 2,
    totalVisits: 47,
    favoriteLounge: 'The Wing'
  });

  // Update member data when props change
  useEffect(() => {
    setMemberData({
      name: propMemberData.name || 'Sarah Chen',
      memberType: propMemberData.memberType || 'Corporate',
      companyName: propMemberData.companyName || 'Cathay Pacific Airways',
      department: propMemberData.memberType === 'Individual' ? '' : 'Executive Management',
      membershipTier: propMemberData.memberType === 'Individual' ? 'Platinum' : '',
      memberSince: propMemberData.membershipStartDate || '2022-03-15',
      membershipNumber: propMemberData.memberType === 'Individual' ? 'HKIAL-PLT-2847' : 'HKIAL-CORP-2847',
      expiryDate: propMemberData.membershipExpiryDate || '2026-12-31',
      bookingsRemaining: propMemberData.bookingsRemaining || 5,
      totalBookings: propMemberData.totalBookings || 10,
      upcomingBookings: 2,
      totalVisits: 47,
      favoriteLounge: 'The Wing'
    });
  }, [propMemberData]);

  const [upcomingBookings, setUpcomingBookings] = useState(
    propUpcoming ?? [
      {
        id: 1,
        lounge: 'The Wing First Class Lounge',
        date: '2026-01-12',
        time: '14:30',
        flight: 'CX 888 to London',
        guests: 1,
        status: 'confirmed'
      },
      {
        id: 2,
        lounge: 'The Pier Business Class Lounge',
        date: '2026-01-20',
        time: '10:15',
        flight: 'CX 250 to Tokyo',
        guests: 0,
        status: 'confirmed'
      }
    ]
  );

  const [quickStats, setQuickStats] = useState(
    propQuickStats ?? [
      { label: 'Visits This Month', value: '4', icon: Clock, color: 'purple' },
      { label: 'Total Bookings', value: '47', icon: Calendar, color: 'teal' }
    ]
  );

  const [recentActivity, setRecentActivity] = useState(
    propRecent ?? [
      { date: '2026-01-05', lounge: 'The Wing', duration: '3h 20m' },
      { date: '2025-12-28', lounge: 'The Pier', duration: '2h 45m' },
      { date: '2025-12-15', lounge: 'The Cabin', duration: '1h 30m' },
      { date: '2025-12-08', lounge: 'The Arrival', duration: '2h 10m' }
    ]
  );

  // When the parent container provides fresh real data, sync it into local
  // state. The container now fetches /member/bookings and passes the
  // derived arrays, so this is what makes the dashboard show real data
  // instead of the legacy hardcoded mocks. The figma code base (no real
  // data) just doesn't pass these props, so the fallback is rendered.
  useEffect(() => {
    if (propUpcoming) setUpcomingBookings(propUpcoming);
  }, [propUpcoming]);
  useEffect(() => {
    if (propRecent) setRecentActivity(propRecent);
  }, [propRecent]);
  useEffect(() => {
    if (propQuickStats) setQuickStats(propQuickStats);
  }, [propQuickStats]);

  const getTierGradient = (tier: string) => {
    switch(tier) {
      case 'Platinum': return 'from-gray-400 to-gray-600';
      case 'Gold': return 'from-[rgb(220,181,21)] to-[rgb(180,141,11)]';
      case 'Silver': return 'from-gray-300 to-gray-500';
      default: return 'from-[rgb(220,181,21)] to-[rgb(180,141,11)]';
    }
  };

  // ── Membership status ──────────────────────────────────────────────────
  const isDark = mode === 'dark';
  const memberStatus = getMembershipStatus(memberData.expiryDate);

  const statusConfig = {
    active: {
      icon: CheckCircle,
      bgStyle: {
        background: isDark ? 'rgba(16,185,129,0.12)' : 'rgba(16,185,129,0.1)',
        border: isDark ? '1px solid rgba(16,185,129,0.3)' : '1px solid rgba(16,185,129,0.4)',
      },
      iconColor: isDark ? '#34d399' : 'rgb(5,150,105)',
      labelColor: isDark ? '#6ee7b7' : 'rgb(5,150,105)',
      badgeBg: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.15)',
      badgeBorder: isDark ? '1px solid rgba(16,185,129,0.4)' : '1px solid rgba(16,185,129,0.4)',
    },
    expiring: {
      icon: AlertTriangle,
      bgStyle: {
        background: isDark ? 'rgba(245,158,11,0.12)' : 'rgba(245,158,11,0.1)',
        border: isDark ? '1px solid rgba(245,158,11,0.35)' : '1px solid rgba(245,158,11,0.4)',
      },
      iconColor: isDark ? '#fbbf24' : 'rgb(180,120,0)',
      labelColor: isDark ? '#fcd34d' : 'rgb(180,120,0)',
      badgeBg: isDark ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.15)',
      badgeBorder: isDark ? '1px solid rgba(245,158,11,0.4)' : '1px solid rgba(245,158,11,0.4)',
    },
    expired: {
      icon: XCircle,
      bgStyle: {
        background: isDark ? 'rgba(239,68,68,0.12)' : 'rgba(239,68,68,0.08)',
        border: isDark ? '1px solid rgba(239,68,68,0.35)' : '1px solid rgba(239,68,68,0.35)',
      },
      iconColor: isDark ? '#f87171' : 'rgb(185,28,28)',
      labelColor: isDark ? '#fca5a5' : 'rgb(185,28,28)',
      badgeBg: isDark ? 'rgba(239,68,68,0.15)' : 'rgba(239,68,68,0.12)',
      badgeBorder: isDark ? '1px solid rgba(239,68,68,0.4)' : '1px solid rgba(239,68,68,0.35)',
    },
  };

  const sc = statusConfig[memberStatus.status];
  const StatusIcon = sc.icon;

  // Pre-compute card badge styles to avoid chained ternaries in JSX style props
  let cardBadgeBg = 'rgba(239,68,68,0.3)';
  let cardBadgeBorder = '1px solid rgba(239,68,68,0.6)';
  if (memberStatus.status === 'active') {
    cardBadgeBg = 'rgba(16,185,129,0.3)';
    cardBadgeBorder = '1px solid rgba(16,185,129,0.6)';
  } else if (memberStatus.status === 'expiring') {
    cardBadgeBg = 'rgba(245,158,11,0.3)';
    cardBadgeBorder = '1px solid rgba(245,158,11,0.6)';
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center gap-4">
        <div>
          <h1 className="text-3xl bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,141,11)] bg-clip-text text-transparent mb-2">
            Welcome back, {memberData.name}
          </h1>
        </div>
        <div className="flex gap-4">
          {/* Credit Balance / Booking Credits - Show for all member types */}
          {(propMemberData.bookingsRemaining !== undefined || propMemberData.memberType === 'Travel Agency') && (
            null
          )}
          {/* Vouchers - Show for all member types */}
          {propMemberData.voucherCount !== undefined && (
            null
          )}
        </div>
      </div>

      {/* ── Membership Status Banner ─────────────────────────────────────────── */}
      <div className="rounded-2xl px-5 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4" style={sc.bgStyle}>
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: sc.badgeBg, border: sc.badgeBorder }}
          >
            <StatusIcon className="w-5 h-5" style={{ color: sc.iconColor }} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm" style={{ color: colors.text }}>
                Membership Status:
              </span>
              <span
                className="px-2.5 py-0.5 rounded-full text-xs"
                style={{
                  background: sc.badgeBg,
                  border: sc.badgeBorder,
                  color: sc.labelColor,
                }}
              >
                {memberStatus.label}
              </span>
            </div>
            <div className="flex items-center gap-4 mt-0.5 flex-wrap">
              <span className="text-xs" style={{ color: colors.textMuted }}>
                <Shield className="w-3 h-3 inline mr-1" style={{ color: sc.iconColor }} />
                {memberStatus.daysText}
              </span>
              <span className="text-xs" style={{ color: colors.textMuted }}>
                Valid until{' '}
                <strong style={{ color: colors.textSecondary }}>
                  {new Date(memberData.expiryDate).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </strong>
              </span>
            </div>
          </div>
        </div>
        {/* Action based on status */}
        {memberStatus.status !== 'active' && (
          <button
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm flex-shrink-0 transition-all hover:opacity-90"
            style={{ background: 'linear-gradient(90deg, rgb(220,181,21), rgb(180,141,11))' }}
          >
            <RefreshCw className="w-4 h-4" />
            {memberStatus.status === 'expired' ? 'Renew Membership' : 'Renew Early'}
          </button>
        )}
        {memberStatus.status === 'active' && memberStatus.daysRemaining <= 90 && (
          <button
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm flex-shrink-0 transition-all hover:opacity-80"
            style={{
              background: isDark ? 'rgba(16,185,129,0.15)' : 'rgba(16,185,129,0.18)',
              border: isDark ? '1px solid rgba(16,185,129,0.35)' : '1px solid rgba(16,185,129,0.45)',
              color: sc.iconColor,
            }}
          >
            <RefreshCw className="w-4 h-4" />
            Renew Early
          </button>
        )}
      </div>

      {/* Membership Card */}
      <div className="rounded-2xl p-8 text-white relative overflow-hidden" style={{
        background: 'linear-gradient(135deg, rgb(209, 175, 125) 0%, rgb(167, 139, 100) 100%)',
        boxShadow: '0 20px 60px rgba(209, 175, 125, 0.3)'
      }}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24"></div>
        
        <div className="relative z-10">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold">{memberData.name}</h2>
              <p className="text-white/70 text-xs mt-1">M000325</p>
              {propMemberData.email && (
                <p className="text-white/70 text-xs mt-0.5">{propMemberData.email}</p>
              )}
            </div>
            <div className="text-right">
              {memberData.memberType === 'Individual' && memberData.membershipTier && (
                <div className={`px-4 py-2 rounded-full bg-gradient-to-r ${getTierGradient(memberData.membershipTier)} text-white font-semibold mb-2`}>
                  {memberData.membershipTier}
                </div>
              )}
              {/* Status badge on card */}
              <div
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs"
                style={{
                  background: cardBadgeBg,
                  border: cardBadgeBorder,
                  color: '#fff',
                }}
              >
                <StatusIcon className="w-3 h-3" />
                {memberStatus.label}
              </div>
              <p className="text-white/70 text-xs mt-1">Member Since {new Date(memberData.memberSince).getFullYear()}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-white/80 text-sm">Valid Until</p>
              <p className="text-xl font-semibold mt-1">{new Date(memberData.expiryDate).toLocaleDateString('en-GB')}</p>
            </div>
            <div>
              <p className="text-white/80 text-sm">Total Visits</p>
              <p className="text-3xl font-bold mt-1">{memberData.totalVisits}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="rounded-2xl p-6 border border-white/20" style={glassStyle}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br from-${stat.color}-500 to-${stat.color}-600 flex items-center justify-center`}>
                  <Icon className="w-6 h-6" style={{ color: mode === 'dark' ? '#ffffff' : 'rgb(64, 63, 52)' }} />
                </div>
              </div>
              <h3 className="text-2xl" style={{ color: colors.text }}>{stat.value}</h3>
              <p className="text-sm mt-1" style={{ color: colors.textSecondary }}>{stat.label}</p>
            </div>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Bookings */}
        <div className="rounded-2xl p-6 border border-white/20" style={glassStyle}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl flex items-center gap-2" style={{ color: colors.text }}>
              <Calendar className="w-5 h-5 text-purple-600" />
              Upcoming Bookings
            </h2>
            <button className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-4">
            {upcomingBookings.map((booking) => (
              <div key={booking.id} className="p-4 rounded-xl bg-white/30 border border-white/20">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-semibold" style={{ color: colors.text }}>{booking.lounge}</h3>
                    <p className="text-sm flex items-center gap-2 mt-1" style={{ color: colors.textSecondary }}>
                      <Plane className="w-4 h-4" />
                      {booking.flight}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs bg-green-100 text-green-700 border border-green-200">
                    {booking.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm mt-3" style={{ color: colors.textSecondary }}>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    {new Date(booking.date).toLocaleDateString('en-GB')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {booking.time}
                  </span>
                  {booking.guests > 0 && (
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      +{booking.guests} guest{booking.guests > 1 ? 's' : ''}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <button className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,141,11)] font-semibold hover:shadow-lg transition-all" style={{ color: '#ffffff' }}>
            Book New Visit
          </button>
        </div>

        {/* Recent Activity */}
        <div className="rounded-2xl p-6 border border-white/20" style={glassStyle}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl flex items-center gap-2" style={{ color: colors.text }}>
              <Clock className="w-5 h-5 text-teal-600" />
              Recent Activity
            </h2>
          </div>

          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-white/30 border border-white/20">
                <div>
                  <p className="font-medium" style={{ color: colors.text }}>{activity.lounge}</p>
                  <p className="text-sm" style={{ color: colors.textSecondary }}>{new Date(activity.date).toLocaleDateString('en-GB')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm" style={{ color: colors.textSecondary }}>{activity.duration}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}