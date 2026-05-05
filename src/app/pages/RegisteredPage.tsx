import React from 'react';
import { Navigate, useNavigate } from 'react-router';
import { useTheme } from '../components/ThemeContext';
import { useMember } from '../contexts/MemberContext';

export function RegisteredPage() {
  const { colors, mode } = useTheme();
  const { isAuthenticated, registrationData, memberData } = useMember();
  const navigate = useNavigate();

  // If not authenticated (came here directly), redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const isDark = mode === 'dark';
  const textMain = isDark ? '#ffffff' : 'rgb(64,63,52)';
  const textSub = isDark ? 'rgba(255,255,255,0.55)' : 'rgb(130,129,118)';
  const cardBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(231,230,221,0.55)';
  const cardBorder = isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(200,199,190,0.55)';
  const infoRowBg = isDark ? 'rgba(0,0,0,0.25)' : 'rgba(255,255,255,0.75)';
  const infoRowBorder = isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(200,199,190,0.4)';
  const badgeBg = isDark ? 'rgba(220,181,21,0.18)' : 'rgba(220,181,21,0.2)';
  const badgeBorder = isDark ? '1px solid rgba(220,181,21,0.4)' : '1px solid rgba(220,181,21,0.45)';

  const regName = memberData.name;
  const regEmail = memberData.email || '';
  const regType = memberData.memberType;

  const handleGoToDashboard = () => {
    navigate('/dashboard', { replace: true });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 transition-colors duration-300"
      style={{ background: colors.background }}
    >
      {/* Background blobs */}
      <div className="fixed inset-0 pointer-events-none" style={{ opacity: isDark ? 0.08 : 0.18 }}>
        <div
          className="absolute top-0 left-0 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl"
          style={{ background: 'rgb(220,181,21)', animation: 'blob 7s infinite' }}
        />
        <div
          className="absolute bottom-0 right-0 w-72 h-72 rounded-full mix-blend-multiply filter blur-xl"
          style={{ background: 'rgb(180,140,10)', animation: 'blob 7s infinite', animationDelay: '2s' }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md text-center">
        {/* Success icon */}
        <div
          className="w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgb(220,181,21) 0%, rgb(160,128,8) 100%)',
            boxShadow: '0 0 48px rgba(220,181,21,0.45)',
          }}
        >
          <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-3xl mb-2" style={{ color: textMain }}>Welcome aboard!</h1>
        <p className="text-sm mb-8" style={{ color: textSub }}>
          Your HKIA Lounge membership account has been created successfully.
        </p>

        {/* Membership details card */}
        <div className="rounded-2xl overflow-hidden mb-6" style={{ background: cardBg, border: cardBorder }}>
          <div
            className="px-6 py-4 flex items-center justify-between"
            style={{
              background: isDark
                ? 'linear-gradient(90deg,rgba(220,181,21,0.2) 0%,rgba(180,140,10,0.12) 100%)'
                : 'linear-gradient(90deg,rgba(220,181,21,0.18) 0%,rgba(180,140,10,0.1) 100%)',
              borderBottom: isDark ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(200,199,190,0.4)',
            }}
          >
            <span className="text-sm" style={{ color: textMain }}>Membership Details</span>
            <span
              className="text-xs px-2.5 py-1 rounded-full"
              style={{ background: badgeBg, border: badgeBorder, color: 'rgb(220,181,21)' }}
            >
              {regType}
            </span>
          </div>
          <div className="p-4 space-y-2.5">
            {[
              { label: 'Full Name', value: regName },
              { label: 'Email', value: regEmail },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between px-4 py-2.5 rounded-lg"
                style={{ background: infoRowBg, border: infoRowBorder }}
              >
                <span className="text-xs" style={{ color: textSub }}>{row.label}</span>
                <span className="text-xs" style={{ color: textMain }}>{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={handleGoToDashboard}
          className="w-full py-3.5 rounded-xl text-sm text-white transition-all hover:opacity-90 active:scale-[0.98]"
          style={{
            background: 'linear-gradient(135deg, rgb(220,181,21) 0%, rgb(160,128,8) 100%)',
            boxShadow: '0 8px 24px rgba(220,181,21,0.35)',
          }}
        >
          Go to My Dashboard
        </button>
      </div>

      <style>{`
        @keyframes blob {
          0%   { transform: translate(0px,0px) scale(1); }
          33%  { transform: translate(30px,-50px) scale(1.1); }
          66%  { transform: translate(-20px,20px) scale(0.9); }
          100% { transform: translate(0px,0px) scale(1); }
        }
      `}</style>
    </div>
  );
}
