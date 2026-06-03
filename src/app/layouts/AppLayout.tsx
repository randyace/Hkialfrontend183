import React, { useState } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router';
import { Menu } from 'lucide-react';
import { Sidebar } from '../components/Sidebar';
import { useTheme } from '../components/ThemeContext';
import { useMember } from '../contexts/MemberContext';

export function AppLayout() {
  const { colors, mode } = useTheme();
  const { isAuthenticated, memberData, handleLogout } = useMember();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const isDark = mode === 'dark';

  const darkModeOverrides = `
    .text-gray-800 { color: #ffffff !important; }
    .text-gray-700 { color: #e5e7eb !important; }
    .text-gray-600 { color: #d1d5db !important; }
  `;
  const lightModeOverrides = `
    .text-gray-800 { color: rgb(64, 63, 52) !important; }
    .text-gray-700 { color: rgb(90, 89, 78) !important; }
    .text-gray-600 { color: rgb(130, 129, 118) !important; }
    .text-gray-500 { color: rgb(160, 159, 148) !important; }
    .text-gray-400 { color: rgb(160, 159, 148) !important; }
  `;
  const themeOverrides = isDark ? darkModeOverrides : lightModeOverrides;

  const topBarBorderColor = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(200,199,190,0.4)';
  const topBarTextColor = isDark ? '#ffffff' : 'rgb(64,63,52)';

  const handleOpenSidebar = () => setSidebarOpen(true);
  const handleCloseSidebar = () => setSidebarOpen(false);

  const handleLogoutClick = () => {
    handleLogout();
    navigate('/');
  };

  return (
    <div
      className="min-h-screen transition-colors duration-300"
      style={{ background: colors.background }}
    >
      {/* Background blobs */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{ opacity: colors.blobOpacity }}
      >
        <div
          className={`absolute top-0 left-0 w-72 h-72 ${
            isDark ? 'bg-blue-400' : 'bg-[rgb(220,181,21)]'
          } rounded-full mix-blend-multiply filter blur-xl animate-blob`}
        />
        <div
          className={`absolute top-0 right-0 w-72 h-72 ${
            isDark ? 'bg-teal-400' : 'bg-[rgb(231,230,221)]'
          } rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000`}
        />
        <div
          className={`absolute bottom-0 left-0 w-72 h-72 ${
            isDark ? 'bg-indigo-400' : 'bg-[rgb(220,181,21)]'
          } rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000`}
        />
      </div>

      {/* Mobile top bar */}
      <div
        className="md:hidden fixed top-0 left-0 right-0 z-40 flex items-center gap-3 px-4 h-14"
        style={{
          backdropFilter: 'blur(20px)',
          background: colors.sidebarBackground,
          borderBottom: `1px solid ${topBarBorderColor}`,
        }}
      >
        <button
          onClick={handleOpenSidebar}
          className="p-2 rounded-lg transition-colors hover:bg-white/10 flex-shrink-0"
          style={{ color: topBarTextColor }}
          aria-label="Open menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <span className="text-sm font-semibold tracking-wide" style={{ color: topBarTextColor }}>
          HKIA Lounge
        </span>
      </div>

      {/* Sidebar */}
      <Sidebar
        onLogout={handleLogoutClick}
        memberData={memberData}
        isOpen={sidebarOpen}
        onClose={handleCloseSidebar}
      />

      {/* Main content */}
      <main className="relative z-10 md:ml-64 min-h-screen p-4 md:p-6 pt-14 md:pt-5 overflow-y-auto">
        <Outlet />
      </main>

      <style>{themeOverrides + `
        @keyframes blob {
          0%   { transform: translate(0px, 0px) scale(1); }
          33%  { transform: translate(30px, -50px) scale(1.1); }
          66%  { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob { animation: blob 7s infinite; }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
    </div>
  );
}
