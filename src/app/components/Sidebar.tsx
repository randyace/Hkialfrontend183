import React from 'react';
import { useNavigate, useLocation } from 'react-router';
import {
  LayoutDashboard,
  Settings,
  Calendar,
  LogOut,
  UserCog,
  Plus,
  BadgeCheck,
  Ticket,
  Star,
  X,
  Wallet,
} from 'lucide-react';
import logoImage from 'figma:asset/5314118f44483d10b69aeb99485c2f5942c726a2.png';
import { useTheme } from './ThemeContext';

interface MemberData {
  name: string;
  memberType: string;
  companyName?: string;
  bookingsRemaining?: number;
  totalBookings?: number;
  voucherCount?: number;
  email?: string;
}

interface SidebarProps {
  onLogout: () => void;
  memberData: MemberData;
  isOpen?: boolean;
  onClose?: () => void;
}

// Maps menu item id → URL path
const TAB_TO_PATH: Record<string, string> = {
  'dashboard': '/dashboard',
  'new-booking': '/newbooking',
  'bookings': '/mybooking',
  'my-membership': '/my-membership',
  'membership-packages': '/membership-packages',
  'voucher-batches': '/voucher-batches',
  'admin': '/admin',
  'settings': '/settings',
};

// Determines active tab id from current pathname
function getActiveTabFromPath(pathname: string): string {
  if (pathname.startsWith('/mybooking')) return 'bookings';
  if (pathname === '/newbooking') return 'new-booking';
  if (pathname === '/my-membership') return 'my-membership';
  if (pathname === '/membership-packages') return 'membership-packages';
  if (pathname === '/voucher-batches') return 'voucher-batches';
  if (pathname === '/admin') return 'admin';
  if (pathname === '/settings') return 'settings';
  return 'dashboard';
}

export function Sidebar({ onLogout, memberData, isOpen, onClose }: SidebarProps) {
  const { colors } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isTravelAgency = memberData.memberType === 'Travel Agency';

  const activeTab = getActiveTabFromPath(location.pathname);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'new-booking', label: 'New Booking', icon: Plus },
    { id: 'bookings', label: 'My Bookings', icon: Calendar },
    ...(!isTravelAgency ? [
      { id: 'my-membership', label: 'My Membership', icon: BadgeCheck },
      { id: 'membership-packages', label: 'Membership Packages', icon: Star },
    ] : []),
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  // Add admin menu item for Travel Agency only
  if (memberData.memberType === 'Travel Agency') {
    menuItems.splice(3, 0, { id: 'admin', label: 'Group Admin', icon: UserCog });
  }

  // Add Voucher Batches menu item for Corporate only
  if (memberData.memberType === 'Corporate') {
    menuItems.splice(3, 0, { id: 'voucher-batches', label: 'Voucher Batches', icon: Ticket });
  }

  const glassStyle = {
    backdropFilter: 'none',
    background: colors.sidebarBackground,
    border: colors.sidebarBorder,
    boxShadow: colors.sidebarShadow,
  };

  const mobileTransformClass = isOpen ? 'translate-x-0' : '-translate-x-full';
  const sidebarClass = `w-64 shadow-2xl flex flex-col h-screen fixed top-0 left-0 z-[60] transition-transform duration-300 ${mobileTransformClass} md:translate-x-0`;

  const handleNavClick = (tabId: string) => {
    const path = TAB_TO_PATH[tabId];
    if (path) navigate(path);
    if (onClose) onClose();
  };

  const handleLogoutClick = () => {
    onLogout();
    if (onClose) onClose();
  };

  return (
    <>
      {/* Mobile backdrop overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-[55] md:hidden"
          onClick={onClose}
        />
      )}

      <aside className={sidebarClass} style={glassStyle}>
        {/* Header */}
        <div className="p-6 flex items-center justify-between" style={{ borderBottom: `1px solid ${colors.glassBorder}` }}>
          <div className="flex items-center justify-center flex-1" style={{ height: '60px' }}>
            <img src={logoImage} alt="HKIAL Logo" style={{ height: '60px', width: 'auto' }} className="object-contain" />
          </div>
          {/* Close button — mobile only */}
          <button
            onClick={onClose}
            className="md:hidden ml-2 p-1.5 rounded-lg flex-shrink-0 transition-colors hover:bg-white/10"
            style={{ color: colors.sidebarTextPrimary }}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Member Info Section */}
        <div className="p-4" style={{ borderBottom: `1px solid ${colors.glassBorder}` }}>
          <div className="rounded-xl p-4" style={{ backgroundColor: colors.sidebarInfoBg, border: `1px solid ${colors.glassBorder}` }}>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)] flex items-center justify-center font-bold flex-shrink-0" style={{ color: '#ffffff' }}>
                {memberData.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate" style={{ color: '#ffffff' }}>{memberData.name}</p>
                <p className="text-xs mt-0.5" style={{ color: '#9ca3af' }}>M000325</p>
                {memberData.email && (
                  <p className="text-xs mt-0.5 truncate" style={{ color: '#9ca3af' }}>{memberData.email}</p>
                )}
              </div>
            </div>

            {/* Bookings Remaining / Credit Balance */}
            {memberData.bookingsRemaining !== undefined && memberData.totalBookings !== undefined && (
              <div className="rounded-lg p-2.5" style={{ background: colors.sidebarInfoItemBg }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wallet className="w-3.5 h-3.5 text-green-400" />
                    <span className="text-xs" style={{ color: '#d1d5db' }}>
                      {memberData.memberType === 'Travel Agency' ? 'Credit Balance' : 'Bookings Remaining'}
                    </span>
                  </div>
                  <span className="text-sm font-semibold" style={{ color: '#ffffff' }}>
                    {memberData.memberType === 'Travel Agency'
                      ? `HKD$${memberData.bookingsRemaining.toLocaleString()}`
                      : `${memberData.bookingsRemaining}`
                    }
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            const hoverBg = colors.sidebarHoverBg;
            const handleEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
              if (!isActive) e.currentTarget.style.background = hoverBg;
            };
            const handleLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
              if (!isActive) e.currentTarget.style.background = 'transparent';
            };
            const activeClass = isActive
              ? 'bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,140,10)] transform translate-x-1'
              : 'hover:translate-x-1';
            const activeStyle = isActive
              ? { color: '#ffffff' }
              : { color: colors.sidebarTextPrimary, background: 'transparent' };

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 ${activeClass}`}
                style={activeStyle}
                onMouseEnter={handleEnter}
                onMouseLeave={handleLeave}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 mt-auto">
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-300 text-red-300 hover:bg-red-500/20 hover:translate-x-1 border border-red-400/30"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
