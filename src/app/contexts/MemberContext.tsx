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
  const base: MemberData = {
    name: `${formData.firstName} ${formData.lastName}`,
    memberType: formData.memberType || 'Individual',
    email: formData.email,
    membershipExpiryDate: '2026-12-31',
    membershipStartDate: '2022-03-15',
  };
  if (formData.memberType === 'Corporate' || formData.memberType === 'Travel Agency') {
    base.companyName = formData.companyName;
    base.totalBookings = formData.memberType === 'Corporate' ? 10 : 8;
    base.bookingsRemaining = formData.memberType === 'Corporate' ? 5 : 7000;
    base.voucherCount = formData.memberType === 'Corporate' ? 8 : 5;
  } else {
    base.totalBookings = 10;
    base.bookingsRemaining = 5;
    base.voucherCount = 3;
  }
  return base;
}

export function MemberProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pendingLoginData, setPendingLoginData] = useState<any | null>(null);
  const [registrationData, setRegistrationData] = useState<any | null>(null);
  const [memberData, setMemberData] = useState<MemberData>({
    name: 'Sarah Chen',
    memberType: 'Corporate',
    companyName: 'Tech Corporation Ltd',
    bookingsRemaining: 5,
    totalBookings: 10,
    voucherCount: 8,
    email: 'sarah.chen@example.com',
    membershipExpiryDate: '2026-12-31',
    membershipStartDate: '2022-03-15',
  });

  const completeMemberLogin = (formData: any) => {
    setMemberData(buildMemberData(formData));
    setIsAuthenticated(true);
    setPendingLoginData(null);
  };

  const completeRegistration = (formData: any) => {
    const expiry = new Date();
    expiry.setFullYear(expiry.getFullYear() + 1);
    const newData = buildMemberData(formData);
    newData.membershipExpiryDate = expiry.toISOString().split('T')[0];
    newData.membershipStartDate = new Date().toISOString().split('T')[0];
    setMemberData(newData);
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
