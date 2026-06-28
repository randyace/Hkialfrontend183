import React, { createContext, useContext, useState } from 'react';

export interface MemberData {
  name: string;
  memberType: string;
  companyName?: string;
  bookingsRemaining?: number;
  totalBookings?: number;
  voucherCount?: number;
  email?: string;
  membershipExpiryDate?: string;
  membershipStartDate?: string;
}

interface MemberContextType {
  memberData: MemberData;
  isAuthenticated: boolean;
  pendingLoginData: any | null;
  registrationData: any | null;
  setPendingLoginData: (data: any) => void;
  completeMemberLogin: (formData: any) => void;
  completeRegistration: (formData: any) => void;
  handleLogout: () => void;
  handleAdjournPurchase: (addedVisits: number, addedCredit: number, addedVouchers: number) => void;
}

const MemberContext = createContext<MemberContextType | null>(null);

function buildMemberData(formData: any): MemberData {
  // Round 6.2.61 (post-reset): removed hardcoded mock data — no fake
  // membership dates, voucher counts, totalBookings, or bookingsRemaining
  // are seeded from `formData`. Real values come from the backend via
  // /auth/member/me on the live app; this figma-ui copy is for Figma Make
  // preview only and should not invent fake data on register.
  const base: MemberData = {
    name: `${formData.firstName} ${formData.lastName}`.trim(),
    memberType: formData.memberType || 'Individual',
    email: formData.email,
  };
  if (formData.memberType === 'Corporate' || formData.memberType === 'Travel Agency') {
    base.companyName = formData.companyName;
  }
  return base;
}

export function MemberProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pendingLoginData, setPendingLoginData] = useState<any | null>(null);
  const [registrationData, setRegistrationData] = useState<any | null>(null);
  const [memberData, setMemberData] = useState<MemberData>({
    // Round 6.2.61: initial state has no fake membership tier / voucher
    // count / expiry dates. Figma Make preview renders an empty profile
    // until completeMemberLogin or completeRegistration fills the real
    // fields from the (mock) formData.
    name: '',
    memberType: 'Individual',
  });

  const completeMemberLogin = (formData: any) => {
    setMemberData(buildMemberData(formData));
    setIsAuthenticated(true);
    setPendingLoginData(null);
  };

  const completeRegistration = (formData: any) => {
    // Round 6.2.61: removed fake membershipExpiryDate / membershipStartDate
    // seeding on registration. The real backend only sets those fields when
    // the account is linked to a package; this figma-ui copy should mirror
    // that and not invent dates the backend hasn't earned.
    setMemberData(buildMemberData(formData));
    setRegistrationData(formData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPendingLoginData(null);
    setRegistrationData(null);
  };

  const handleAdjournPurchase = (addedVisits: number, addedCredit: number, addedVouchers: number) => {
    setMemberData(prev => {
      const isTA = prev.memberType === 'Travel Agency';
      return {
        ...prev,
        bookingsRemaining: isTA
          ? (prev.bookingsRemaining || 0) + addedCredit
          : (prev.bookingsRemaining || 0) + addedVisits,
        voucherCount: (prev.voucherCount || 0) + addedVouchers,
      };
    });
  };
  // Round 6.2.61 note: the `prev.voucherCount || 0` fallback above is
  // intentional — a freshly-registered member has no voucherCount until
  // the backend's /auth/member/me returns one. Defaulting to 0 means
  // handleAdjournPurchase is a safe no-op for an empty profile.

  const value: MemberContextType = {
    memberData,
    isAuthenticated,
    pendingLoginData,
    registrationData,
    setPendingLoginData,
    completeMemberLogin,
    completeRegistration,
    handleLogout,
    handleAdjournPurchase,
  };

  return (
    <MemberContext.Provider value={value}>
      {children}
    </MemberContext.Provider>
  );
}

export function useMember() {
  const ctx = useContext(MemberContext);
  if (!ctx) throw new Error('useMember must be used within MemberProvider');
  return ctx;
}
