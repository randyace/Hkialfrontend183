import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router';
import { Plane, Mail, Lock, User, Eye, EyeOff, Building2, Users, Phone, Hash, Zap, Shield, ArrowLeft, CheckCircle, Check, X } from 'lucide-react';
import logoImage from 'figma:asset/5314118f44483d10b69aeb99485c2f5942c726a2.png';
import { useTheme } from './ThemeContext';
import { useMember } from '../contexts/MemberContext';

export function AuthPage() {
  const { colors, mode } = useTheme();
  const { isAuthenticated, setPendingLoginData, completeRegistration } = useMember();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordSent, setForgotPasswordSent] = useState(false);
  const [showResetPasswordForm, setShowResetPasswordForm] = useState(false);
  const [resetPasswordSuccess, setResetPasswordSuccess] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false);
  const [formData, setFormData] = useState({
    title: 'Mr',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    memberType: 'Individual',
    companyName: '',
    companyCode: '',
    regionCode: '+852',
    contactNumber: ''
  });

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      // Store form data and navigate to 2FA
      setPendingLoginData(formData);
      navigate('/2fa-verification');
    } else {
      // Complete registration and go to registered page
      completeRegistration(formData);
      navigate('/registered');
    }
  };

  // Removed: handle2FASubmit, handleVerificationCodeChange, handleVerificationCodeKeyDown, handleQuickFill2FA

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleQuickFillLogin = () => {
    setFormData({
      ...formData,
      email: 'john.doe@example.com',
      password: 'demo123456'
    });
  };

  const handleQuickFillLoginIndividual = () => {
    setFormData({
      title: 'Mr',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'demo123456',
      memberType: 'Individual',
      companyName: '',
      companyCode: '',
      regionCode: '+852',
      contactNumber: '98765432'
    });
  };

  const handleQuickFillLoginCorporate = () => {
    setFormData({
      title: 'Mrs',
      firstName: 'Sarah',
      lastName: 'Chen',
      email: 'sarah.chen@techcorp.com',
      password: 'demo123456',
      memberType: 'Corporate',
      companyName: 'Tech Corporation Ltd',
      companyCode: 'TECH2024',
      regionCode: '+852',
      contactNumber: '91234567'
    });
  };

  const handleQuickFillLoginTravelAgency = () => {
    setFormData({
      title: 'Mr',
      firstName: 'Michael',
      lastName: 'Wong',
      email: 'michael.wong@travelagency.com',
      password: 'demo123456',
      memberType: 'Travel Agency',
      companyName: 'Global Travel Agency',
      companyCode: 'GTA2024',
      regionCode: '+852',
      contactNumber: '95551234'
    });
  };

  const handleQuickFillRegister = () => {
    setFormData({
      title: 'Mr',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      password: 'demo123456',
      confirmPassword: 'demo123456',
      memberType: 'Individual',
      companyName: '',
      companyCode: '',
      regionCode: '+852',
      contactNumber: '98765432'
    });
  };

  const handleQuickFillCorporate = () => {
    setFormData({
      title: 'Mrs',
      firstName: 'Sarah',
      lastName: 'Chen',
      email: 'sarah.chen@techcorp.com',
      password: 'demo123456',
      confirmPassword: 'demo123456',
      memberType: 'Corporate',
      companyName: 'Tech Corporation Ltd',
      companyCode: 'TECH2024',
      regionCode: '+852',
      contactNumber: '91234567'
    });
  };

  const handleQuickFillTravelAgency = () => {
    setFormData({
      title: 'Mr',
      firstName: 'Michael',
      lastName: 'Wong',
      email: 'michael.wong@travelagency.com',
      password: 'demo123456',
      confirmPassword: 'demo123456',
      memberType: 'Travel Agency',
      companyName: 'Global Travel Agency',
      companyCode: 'GTA2024',
      regionCode: '+852',
      contactNumber: '95551234'
    });
  };

  const handleForgotPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo: simulate sending reset email
    setForgotPasswordSent(true);
  };

  const handleRetryForgotPassword = () => {
    setForgotPasswordSent(false);
    setForgotPasswordEmail('');
  };

  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setForgotPasswordSent(false);
    setForgotPasswordEmail('');
    setShowResetPasswordForm(false);
    setResetPasswordSuccess(false);
    setNewPassword('');
    setConfirmNewPassword('');
    setIsLogin(true);
  };

  const handleResetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Demo: simulate password reset
    if (newPassword === confirmNewPassword && newPassword.length >= 8) {
      setResetPasswordSuccess(true);
    }
  };

  const handleBackToSignIn = () => {
    setShowForgotPassword(false);
    setForgotPasswordSent(false);
    setForgotPasswordEmail('');
    setShowResetPasswordForm(false);
    setResetPasswordSuccess(false);
    setNewPassword('');
    setConfirmNewPassword('');
    setShowNewPassword(false);
    setShowConfirmNewPassword(false);
    setIsLogin(true);
  };

  const handleGoldHoverEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.color = 'rgb(200, 161, 11)';
  };
  const handleGoldHoverLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.currentTarget.style.color = 'rgb(220, 181, 21)';
  };

  // Password strength calculation
  const calculatePasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 12) strength += 25;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 20;
    if (/\d/.test(password)) strength += 15;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength += 15;
    return Math.min(strength, 100);
  };

  const passwordStrength = calculatePasswordStrength(newPassword);
  const getStrengthColor = (strength: number) => {
    if (strength < 40) return 'rgb(239, 68, 68)';
    if (strength < 70) return 'rgb(234, 179, 8)';
    return 'rgb(34, 197, 94)';
  };
  const getStrengthText = (strength: number) => {
    if (strength < 40) return 'Weak';
    if (strength < 70) return 'Medium';
    return 'Strong';
  };

  const passwordRequirements = [
    { met: newPassword.length >= 8, text: 'At least 8 characters' },
    { met: /[a-z]/.test(newPassword) && /[A-Z]/.test(newPassword), text: 'Upper and lowercase letters' },
    { met: /\d/.test(newPassword), text: 'At least one number' },
    { met: /[!@#$%^&*(),.?":{}|<>]/.test(newPassword), text: 'At least one special character' }
  ];

  const passwordsMatch = newPassword && confirmNewPassword && newPassword === confirmNewPassword;
  const passwordsDontMatch = newPassword && confirmNewPassword && newPassword !== confirmNewPassword;

  // Glassmorphism styles
  const glassStyle = {
    backdropFilter: 'blur(20px)',
    background: mode === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(231, 230, 221, 0.6)',
    border: `1px solid ${mode === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(200, 199, 190, 0.6)'}`,
    boxShadow: mode === 'dark' ? '0 8px 32px 0 rgba(31, 38, 135, 0.2)' : '0 8px 32px rgba(64, 63, 52, 0.1)',
  };

  const inputClass = mode === 'dark'
    ? 'bg-white/10 border border-white/20 text-white placeholder-gray-400'
    : 'bg-white/60 border border-[rgb(231,230,221)] text-[rgb(64,63,52)] placeholder-[rgb(160,159,148)]';

  const labelColor = mode === 'dark' ? 'text-gray-300' : 'text-[rgb(90,89,78)]';
  const headingColor = mode === 'dark' ? 'text-white' : 'text-[rgb(64,63,52)]';
  const subtextColor = mode === 'dark' ? 'text-gray-300' : 'text-[rgb(130,129,118)]';
  const mutedColor = mode === 'dark' ? 'text-gray-400' : 'text-[rgb(160,159,148)]';

  return (
    <div className="min-h-screen flex items-center justify-center p-6 transition-colors duration-300" style={{ background: colors.background }}>
      {/* Background Pattern */}
      <div className="fixed inset-0" style={{ opacity: colors.blobOpacity }}>
        <div className={`absolute top-0 left-0 w-96 h-96 ${mode === 'dark' ? 'bg-blue-400' : 'bg-[rgb(220,181,21)]'} rounded-full mix-blend-multiply filter blur-xl animate-blob`}></div>
        <div className={`absolute top-0 right-0 w-96 h-96 ${mode === 'dark' ? 'bg-teal-400' : 'bg-[rgb(231,230,221)]'} rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-2000`}></div>
        <div className={`absolute bottom-0 left-1/2 w-96 h-96 ${mode === 'dark' ? 'bg-indigo-400' : 'bg-[rgb(220,181,21)]'} rounded-full mix-blend-multiply filter blur-xl animate-blob animation-delay-4000`}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src={logoImage} alt="HKIAL Logo" style={{ height: '80px', width: 'auto' }} className="object-contain" />
          </div>
          <h1 className={`text-3xl ${headingColor} mb-2`}>Hong Kong International Airport Lounge</h1>
          <p className={subtextColor}>Premium Airport Lounge Experience</p>
        </div>

        {/* Auth Form */}
        <div className="rounded-2xl p-8 border border-white/20" style={glassStyle}>
            {/* Forgot Password Flow */}
            {showForgotPassword ? (
              <>
                {!forgotPasswordSent ? (
                  /* Step 1: Enter Email */
                  <div>
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,141,11)] flex items-center justify-center">
                        <Lock className="w-8 h-8 text-white" />
                      </div>
                      <h2 className={`text-2xl mb-2 ${headingColor}`}>Forgot Password?</h2>
                      <p className={`text-sm ${subtextColor}`}>
                        Enter your registered email address and we'll send you a link to reset your password.
                      </p>
                    </div>

                    <form onSubmit={handleForgotPasswordSubmit} className="space-y-5">
                      <div>
                        <label htmlFor="forgot-email" className={`block text-sm mb-2 ${labelColor}`}>
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            id="forgot-email"
                            value={forgotPasswordEmail}
                            onChange={(e) => setForgotPasswordEmail(e.target.value)}
                            className={`w-full pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)] transition-all ${inputClass}`}
                            placeholder="Enter your registered email"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,141,11)] text-white hover:from-[rgb(200,161,11)] hover:to-[rgb(160,121,1)] transition-all duration-300 transform hover:scale-105"
                      >
                        Send Reset Link
                      </button>

                      <div className="text-center">
                        <button
                          type="button"
                          onClick={handleBackToLogin}
                          className={`text-sm flex items-center justify-center gap-1 mx-auto transition-colors ${mutedColor} hover:text-[rgb(220,181,21)]`}
                        >
                          <ArrowLeft className="w-4 h-4" />
                          Back to Sign In
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  /* Step 2: Confirmation */
                  <div>
                    {!showResetPasswordForm && !resetPasswordSuccess ? (
                      /* Email Confirmation Screen */
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,141,11)] flex items-center justify-center">
                          <CheckCircle className="w-10 h-10 text-white" />
                        </div>
                        <h2 className={`text-2xl mb-3 ${headingColor}`}>Check Your Email</h2>
                        <p className={`text-sm mb-2 ${subtextColor}`}>
                          A password reset link has been sent to:
                        </p>
                        <p className="text-sm mb-5 px-4 py-2 rounded-lg inline-block" style={{ color: 'rgb(220,181,21)', background: 'rgba(220,181,21,0.1)', border: '1px solid rgba(220,181,21,0.3)' }}>
                          {forgotPasswordEmail}
                        </p>
                        <p className={`text-xs mb-6 ${mutedColor}`}>
                          Please check your inbox and follow the instructions in the email. The link will expire in 30 minutes.
                        </p>

                        <div className="space-y-3">
                          <button
                            type="button"
                            onClick={() => setShowResetPasswordForm(true)}
                            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,141,11)] text-white hover:from-[rgb(200,161,11)] hover:to-[rgb(160,121,1)] transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                          >
                            <Zap className="w-4 h-4" />
                            Demo: Open Reset Link
                          </button>
                          <button
                            type="button"
                            onClick={handleBackToLogin}
                            className={`w-full py-3 px-4 rounded-xl transition-all text-sm ${mode === 'dark' ? 'text-gray-400 hover:bg-white/10' : 'text-[rgb(130,129,118)] hover:bg-[rgb(231,230,221)]'}`}
                          >
                            Back to Sign In
                          </button>
                          <button
                            type="button"
                            onClick={() => setForgotPasswordSent(false)}
                            className={`w-full py-3 px-4 rounded-xl transition-all text-sm ${mode === 'dark' ? 'text-gray-400 hover:bg-white/10' : 'text-[rgb(130,129,118)] hover:bg-[rgb(231,230,221)]'}`}
                          >
                            Resend Email
                          </button>
                        </div>

                        <p className={`text-xs mt-5 ${mutedColor}`}>
                          Didn't receive the email? Check your spam folder or{' '}
                          <button
                            type="button"
                            className="transition-colors"
                            style={{ color: 'rgb(220,181,21)' }}
                            onMouseEnter={handleGoldHoverEnter}
                            onMouseLeave={handleGoldHoverLeave}
                            onClick={handleRetryForgotPassword}
                          >
                            try a different email
                          </button>
                          .
                        </p>
                      </div>
                    ) : showResetPasswordForm && !resetPasswordSuccess ? (
                      /* Step 3: Reset Password Form */
                      <div>
                        <div className="text-center mb-6">
                          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,141,11)] flex items-center justify-center">
                            <Lock className="w-8 h-8 text-white" />
                          </div>
                          <h2 className={`text-2xl mb-2 ${headingColor}`}>Create New Password</h2>
                          <p className={`text-sm ${subtextColor}`}>
                            Please enter your new password below.
                          </p>
                        </div>

                        <form onSubmit={handleResetPasswordSubmit} className="space-y-5">
                          {/* New Password */}
                          <div>
                            <label htmlFor="new-password" className={`block text-sm mb-2 ${labelColor}`}>
                              New Password
                            </label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <input
                                type={showNewPassword ? 'text' : 'password'}
                                id="new-password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className={`w-full pl-11 pr-11 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)] transition-all ${inputClass}`}
                                placeholder="Enter new password"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowNewPassword(!showNewPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                              >
                                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>

                            {/* Password Strength Bar */}
                            {newPassword && (
                              <div className="mt-3">
                                <div className="flex items-center justify-between mb-2">
                                  <span className={`text-xs ${labelColor}`}>Password Strength:</span>
                                  <span className="text-xs" style={{ color: getStrengthColor(passwordStrength) }}>
                                    {getStrengthText(passwordStrength)}
                                  </span>
                                </div>
                                <div className="h-2 rounded-full" style={{ background: mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(231,230,221,0.6)' }}>
                                  <div
                                    className="h-full rounded-full transition-all duration-300"
                                    style={{
                                      width: `${passwordStrength}%`,
                                      background: getStrengthColor(passwordStrength)
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Confirm New Password */}
                          <div>
                            <label htmlFor="confirm-new-password" className={`block text-sm mb-2 ${labelColor}`}>
                              Confirm New Password
                            </label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                              <input
                                type={showConfirmNewPassword ? 'text' : 'password'}
                                id="confirm-new-password"
                                value={confirmNewPassword}
                                onChange={(e) => setConfirmNewPassword(e.target.value)}
                                className={`w-full pl-11 pr-11 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)] transition-all ${inputClass}`}
                                placeholder="Confirm new password"
                                required
                              />
                              <button
                                type="button"
                                onClick={() => setShowConfirmNewPassword(!showConfirmNewPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                              >
                                {showConfirmNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                              </button>
                            </div>

                            {/* Password Match Indicator */}
                            {confirmNewPassword && (
                              <div className="mt-2">
                                {passwordsMatch ? (
                                  <div className="flex items-center gap-2 text-xs" style={{ color: 'rgb(34, 197, 94)' }}>
                                    <Check className="w-4 h-4" />
                                    <span>Passwords match</span>
                                  </div>
                                ) : passwordsDontMatch ? (
                                  <div className="flex items-center gap-2 text-xs" style={{ color: 'rgb(239, 68, 68)' }}>
                                    <X className="w-4 h-4" />
                                    <span>Passwords do not match</span>
                                  </div>
                                ) : null}
                              </div>
                            )}
                          </div>

                          {/* Password Requirements */}
                          <div className="space-y-2">
                            <p className={`text-xs ${labelColor}`}>Password must contain:</p>
                            {passwordRequirements.map((req, index) => {
                              const reqColorClass = req.met ? (mode === 'dark' ? 'text-green-400' : 'text-green-600') : mutedColor;
                              return (
                              <div key={index} className="flex items-center gap-2">
                                {req.met ? (
                                  <Check className="w-4 h-4" style={{ color: 'rgb(34, 197, 94)' }} />
                                ) : (
                                  <X className="w-4 h-4" style={{ color: 'rgb(160, 159, 148)' }} />
                                )}
                                <span className={`text-xs ${reqColorClass}`}>
                                  {req.text}
                                </span>
                              </div>
                              );
                            })}
                          </div>

                          <button
                            type="submit"
                            disabled={!passwordsMatch || passwordStrength < 40}
                            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,141,11)] text-white hover:from-[rgb(200,161,11)] hover:to-[rgb(160,121,1)] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                          >
                            Reset Password
                          </button>

                          <div className="text-center">
                            <button
                              type="button"
                              onClick={() => setShowResetPasswordForm(false)}
                              className={`text-sm flex items-center justify-center gap-1 mx-auto transition-colors ${mutedColor} hover:text-[rgb(220,181,21)]`}
                            >
                              <ArrowLeft className="w-4 h-4" />
                              Back
                            </button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      /* Step 4: Success Screen */
                      <div className="text-center">
                        <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,141,11)] flex items-center justify-center">
                          <CheckCircle className="w-10 h-10 text-white" />
                        </div>
                        <h2 className={`text-2xl mb-3 ${headingColor}`}>Password Reset Successful!</h2>
                        <p className={`text-sm mb-6 ${subtextColor}`}>
                          Your password has been successfully reset. You can now sign in with your new password.
                        </p>

                        <button
                          type="button"
                          onClick={handleBackToSignIn}
                          className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,141,11)] text-white hover:from-[rgb(200,161,11)] hover:to-[rgb(160,121,1)] transition-all duration-300 transform hover:scale-105"
                        >
                          Sign In Now
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Toggle Tabs */}
                <div className="flex gap-4 mb-6">
                  <button
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 py-3 px-4 rounded-xl transition-all duration-300 ${
                      isLogin
                        ? 'bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,141,11)] text-white'
                        : `${labelColor} hover:bg-white/10`
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 py-3 px-4 rounded-xl transition-all duration-300 ${
                      !isLogin
                        ? 'bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,141,11)] text-white'
                        : `${labelColor} hover:bg-white/10`
                    }`}
                  >
                    Register
                  </button>
                </div>

                {/* Quick Fill Buttons */}
                {isLogin ? (
                  <div className="mb-4 space-y-2">
                    <p className={`text-xs mb-2 text-center ${mutedColor}`}>Demo Login as:</p>
                    <button
                      type="button"
                      onClick={handleQuickFillLoginIndividual}
                      className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-[rgb(220,181,21)]/20 to-[rgb(180,141,11)]/20 border border-[rgb(220,181,21)]/30 text-[rgb(220,181,21)] hover:from-[rgb(220,181,21)]/30 hover:to-[rgb(180,141,11)]/30 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <User className="w-4 h-4" />
                      Demo: Individual Member
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={handleQuickFillLoginCorporate}
                        className="py-2 px-3 rounded-lg bg-gradient-to-r from-[rgb(220,181,21)]/20 to-[rgb(180,141,11)]/20 border border-[rgb(220,181,21)]/30 text-[rgb(220,181,21)] hover:from-[rgb(220,181,21)]/30 hover:to-[rgb(180,141,11)]/30 transition-all flex items-center justify-center gap-1 text-xs"
                      >
                        <Building2 className="w-3 h-3" />
                        Demo: Corporate
                      </button>
                      <button
                        type="button"
                        onClick={handleQuickFillLoginTravelAgency}
                        className="py-2 px-3 rounded-lg bg-gradient-to-r from-[rgb(220,181,21)]/20 to-[rgb(180,141,11)]/20 border border-[rgb(220,181,21)]/30 text-[rgb(220,181,21)] hover:from-[rgb(220,181,21)]/30 hover:to-[rgb(180,141,11)]/30 transition-all flex items-center justify-center gap-1 text-xs"
                      >
                        <Plane className="w-3 h-3" />
                        Demo: Travel Agency
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 space-y-2">
                    <button
                      type="button"
                      onClick={handleQuickFillRegister}
                      className="w-full py-2 px-4 rounded-lg bg-gradient-to-r from-[rgb(220,181,21)]/20 to-[rgb(180,141,11)]/20 border border-[rgb(220,181,21)]/30 text-[rgb(220,181,21)] hover:from-[rgb(220,181,21)]/30 hover:to-[rgb(180,141,11)]/30 transition-all flex items-center justify-center gap-2 text-sm"
                    >
                      <Zap className="w-4 h-4" />
                      Quick Fill (Demo)
                    </button>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Title, First Name, Last Name - Only for Register */}
                  {!isLogin && (
                    <>
                      {/* Title */}
                      <div>
                        <label htmlFor="title" className={`block text-sm mb-2 ${labelColor}`}>
                          Title
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <select
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className={`w-full pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)] transition-all appearance-none cursor-pointer ${inputClass}`}
                            required={!isLogin}
                          >
                            <option value="Mr" className="bg-gray-800">Mr</option>
                            <option value="Miss" className="bg-gray-800">Miss</option>
                            <option value="Mrs" className="bg-gray-800">Mrs</option>
                          </select>
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>

                      {/* First Name */}
                      <div>
                        <label htmlFor="firstName" className={`block text-sm mb-2 ${labelColor}`}>
                          First Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            id="firstName"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleInputChange}
                            className={`w-full pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)] transition-all ${inputClass}`}
                            placeholder="Enter your first name"
                            required={!isLogin}
                          />
                        </div>
                      </div>

                      {/* Last Name */}
                      <div>
                        <label htmlFor="lastName" className={`block text-sm mb-2 ${labelColor}`}>
                          Last Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            id="lastName"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleInputChange}
                            className={`w-full pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)] transition-all ${inputClass}`}
                            placeholder="Enter your last name"
                            required={!isLogin}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className={`block text-sm mb-2 ${labelColor}`}>
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)] transition-all ${inputClass}`}
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  {/* Contact Number - Only for Register */}
                  {!isLogin && (
                    <div>
                      <label htmlFor="contactNumber" className={`block text-sm mb-2 ${labelColor}`}>
                        Contact Number
                      </label>
                      <div className="flex gap-2">
                        <div className="relative w-32">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <select
                            id="regionCode"
                            name="regionCode"
                            value={formData.regionCode}
                            onChange={handleInputChange}
                            className={`w-full pl-11 pr-2 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)] transition-all appearance-none cursor-pointer ${inputClass}`}
                            required={!isLogin}
                          >
                            <option value="+852" className="bg-gray-800">+852</option>
                            <option value="+86" className="bg-gray-800">+86</option>
                            <option value="+1" className="bg-gray-800">+1</option>
                            <option value="+44" className="bg-gray-800">+44</option>
                            <option value="+65" className="bg-gray-800">+65</option>
                            <option value="+81" className="bg-gray-800">+81</option>
                            <option value="+82" className="bg-gray-800">+82</option>
                            <option value="+886" className="bg-gray-800">+886</option>
                          </select>
                        </div>
                        <div className="relative flex-1">
                          <input
                            type="tel"
                            id="contactNumber"
                            name="contactNumber"
                            value={formData.contactNumber}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)] transition-all ${inputClass}`}
                            placeholder="Enter your contact number"
                            required={!isLogin}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className={`block text-sm mb-2 ${labelColor}`}>
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className={`w-full pl-11 pr-11 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)] transition-all ${inputClass}`}
                        placeholder="Enter your password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password - Only for Register */}
                  {!isLogin && (
                    <div>
                      <label htmlFor="confirmPassword" className={`block text-sm mb-2 ${labelColor}`}>
                        Confirm Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          id="confirmPassword"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className={`w-full pl-11 pr-11 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[rgb(220,181,21)] transition-all ${inputClass}`}
                          placeholder="Confirm your password"
                          required={!isLogin}
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Forgot Password - Only for Login */}
                  {isLogin && (
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => setShowForgotPassword(true)}
                        className="text-sm transition-colors"
                        style={{ color: 'rgb(220, 181, 21)' }}
                        onMouseEnter={handleGoldHoverEnter}
                        onMouseLeave={handleGoldHoverLeave}
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[rgb(220,181,21)] to-[rgb(180,141,11)] text-white hover:from-[rgb(200,161,11)] hover:to-[rgb(160,121,1)] transition-all duration-300 transform hover:scale-105"
                  >
                    {isLogin ? 'Sign In' : 'Create Account'}
                  </button>
                </form>

                {/* Additional Info */}
                <div className="mt-6 text-center">
                  <p className={`text-sm ${mutedColor}`}>
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                      onClick={() => setIsLogin(!isLogin)}
                      className="transition-colors"
                      style={{ color: 'rgb(220, 181, 21)' }}
                      onMouseEnter={handleGoldHoverEnter}
                      onMouseLeave={handleGoldHoverLeave}
                    >
                      {isLogin ? 'Register here' : 'Login here'}
                    </button>
                  </p>
                </div>
              </>
            )}
          </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-400">
            Secure booking system for HKIAL members
          </p>
          <div className="flex justify-center gap-4 mt-4 text-xs text-gray-500">
            <button className="hover:text-gray-300 transition-colors">Privacy Policy</button>
            <span>•</span>
            <button className="hover:text-gray-300 transition-colors">Terms of Service</button>
            <span>•</span>
            <button className="hover:text-gray-300 transition-colors">Contact Us</button>
          </div>
        </div>
      </div>
    </div>
  );
}