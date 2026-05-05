import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router';
import { Shield, ArrowLeft, Zap } from 'lucide-react';
import { useTheme } from '../components/ThemeContext';
import { useMember } from '../contexts/MemberContext';

export function TwoFAPage() {
  const { colors, mode } = useTheme();
  const { pendingLoginData, completeMemberLogin } = useMember();
  const navigate = useNavigate();
  const [verificationCode, setVerificationCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');

  // If no pending login data, redirect to login
  if (!pendingLoginData) {
    return <Navigate to="/" replace />;
  }

  const isDark = mode === 'dark';
  const pageText = isDark ? '#ffffff' : 'rgb(64,63,52)';
  const subText = isDark ? 'rgba(255,255,255,0.55)' : 'rgb(130,129,118)';
  const cardBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.85)';
  const cardBorder = isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(200,199,190,0.5)';
  const inputBg = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(231,230,221,0.6)';
  const inputBorder = isDark ? '1px solid rgba(255,255,255,0.15)' : '1px solid rgba(200,199,190,0.6)';

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }
    if (!/^\d*$/.test(value)) return;

    const newCode = [...verificationCode];
    newCode[index] = value;
    setVerificationCode(newCode);
    setError('');

    if (value && index < 5) {
      const nextInput = document.getElementById(`twofa-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !verificationCode[index] && index > 0) {
      const prevInput = document.getElementById(`twofa-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleQuickFill = () => {
    setVerificationCode(['1', '2', '3', '4', '5', '6']);
    setError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = verificationCode.join('');
    if (code.length === 6) {
      completeMemberLogin(pendingLoginData);
      navigate('/dashboard', { replace: true });
    } else {
      setError('Please enter all 6 digits.');
    }
  };

  const handleBack = () => {
    navigate('/');
  };

  const allFilled = verificationCode.every(d => d !== '');

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

      <div className="relative z-10 w-full max-w-sm">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="flex items-center gap-2 mb-6 transition-opacity hover:opacity-70"
          style={{ color: subText }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Login</span>
        </button>

        {/* Card */}
        <div className="rounded-2xl p-8" style={{ background: cardBg, border: cardBorder, boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}>
          {/* Icon */}
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
            style={{ background: 'linear-gradient(135deg, rgb(220,181,21), rgb(160,128,8))', boxShadow: '0 8px 24px rgba(220,181,21,0.35)' }}
          >
            <Shield className="w-8 h-8 text-white" />
          </div>

          <h1 className="text-2xl text-center mb-2" style={{ color: pageText }}>
            Two-Factor Verification
          </h1>
          <p className="text-sm text-center mb-8" style={{ color: subText }}>
            Enter the 6-digit code sent to your registered device.
          </p>

          <form onSubmit={handleSubmit}>
            {/* Code inputs */}
            <div className="flex gap-2 justify-center mb-6">
              {verificationCode.map((digit, index) => (
                <input
                  key={index}
                  id={`twofa-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-11 h-14 text-center text-lg rounded-xl outline-none transition-all"
                  style={{
                    background: inputBg,
                    border: digit ? '2px solid rgb(220,181,21)' : inputBorder,
                    color: pageText,
                  }}
                />
              ))}
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-center mb-4" style={{ color: 'rgb(239,68,68)' }}>
                {error}
              </p>
            )}

            {/* Quick Fill Demo */}
            <div className="flex justify-center mb-4">
              <button
                type="button"
                onClick={handleQuickFill}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all hover:opacity-80"
                style={{ background: 'rgba(220,181,21,0.12)', border: '1px solid rgba(220,181,21,0.3)', color: 'rgb(220,181,21)' }}
              >
                <Zap className="w-3 h-3" />
                Quick Fill (Demo)
              </button>
            </div>

            {/* Resend */}
            <p className="text-xs text-center mb-6" style={{ color: subText }}>
              Didn't receive a code?{' '}
              <button
                type="button"
                className="transition-colors"
                style={{ color: 'rgb(220,181,21)' }}
              >
                Resend
              </button>
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={!allFilled}
              className="w-full py-3.5 rounded-xl text-sm text-white transition-all hover:opacity-90 active:scale-[0.98]"
              style={{
                background: 'linear-gradient(135deg, rgb(220,181,21) 0%, rgb(160,128,8) 100%)',
                boxShadow: allFilled ? '0 8px 24px rgba(220,181,21,0.35)' : 'none',
                opacity: allFilled ? 1 : 0.5,
                cursor: allFilled ? 'pointer' : 'not-allowed',
              }}
            >
              Verify & Sign In
            </button>
          </form>
        </div>
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
