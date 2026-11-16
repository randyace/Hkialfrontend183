import React from 'react';
import { createBrowserRouter, Navigate, useNavigate } from 'react-router';
import { AppLayout } from './layouts/AppLayout';
import { AuthPage } from './components/AuthPage';
import { TwoFAPage } from './pages/TwoFAPage';
import { RegisteredPage } from './pages/RegisteredPage';
import { MemberDashboard } from './components/MemberDashboard';
import { NewBooking } from './components/NewBooking';
import { Bookings } from './components/Bookings';
// Round 6.2.153 L7 — figma-ui EditBooking.tsx deleted (dead Make-demo only).
// Live prod `/mybooking/details` uses parent `src/components/EditBooking.tsx`
// via `src/routes/index.tsx`. Make preview redirects details → list.
import { MyMembership } from './components/MyMembership';
import { MembershipPackages } from './components/MembershipPackages';
import { VoucherBatches } from './components/VoucherBatches';
import { GroupAdmin } from './components/GroupAdmin';
import { Settings } from './components/Settings';
import { useMember } from './contexts/MemberContext';
import { useLocation } from 'react-router';
import { FigmaUIShowcase } from './components/figma-ui/FigmaUIShowcase';

// ── Page wrappers that bridge context → component props ──────────────────────

function DashboardPage() {
  const { memberData } = useMember();
  return <MemberDashboard memberData={memberData} />;
}

function NewBookingPage() {
  const { memberData } = useMember();
  const location = useLocation();
  const prefillMember = location.state?.prefillMember ?? null;
  return <NewBooking memberData={memberData} prefillMember={prefillMember} />;
}

function BookingsPage() {
  return <Bookings />;
}

function MyMembershipPage() {
  const { memberData, handleAdjournPurchase } = useMember();
  return (
    <MyMembership
      memberData={memberData}
      onAdjournPurchase={handleAdjournPurchase}
    />
  );
}

function GroupAdminPage() {
  return <GroupAdmin />;
}

// ── Router ───────────────────────────────────────────────────────────────────

export const router = createBrowserRouter([
  // Public routes
  { path: '/', element: <AuthPage /> },
  // Legacy email CTAs used /login — member portal login is `/`.
  { path: '/login', element: <Navigate to="/" replace /> },
  { path: '/2fa-verification', element: <TwoFAPage /> },
  { path: '/registered', element: <RegisteredPage /> },

  // Protected routes (AppLayout checks auth)
  {
    element: <AppLayout />,
    children: [
      { path: '/dashboard', element: <DashboardPage /> },
      { path: '/newbooking', element: <NewBookingPage /> },
      { path: '/mybooking', element: <BookingsPage /> },
      // L7: dead figma-ui EditBooking removed — redirect Make preview to list
      { path: '/mybooking/details/:id', element: <Navigate to="/mybooking" replace /> },
      { path: '/my-membership', element: <MyMembershipPage /> },
      { path: '/membership-packages', element: <MembershipPackages /> },
      { path: '/voucher-batches', element: <VoucherBatches /> },
      { path: '/admin', element: <GroupAdminPage /> },
      { path: '/settings', element: <Settings /> },
    ],
  },

  // Component showcase (standalone — no auth required)
  { path: '/ui-showcase', element: <FigmaUIShowcase /> },

  // Catch-all
  { path: '*', element: <Navigate to="/" replace /> },
]);