import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';

const getPasswordStrength = (password: string): 'weak' | 'medium' | 'strong' => {
  if (password.length < 8) return 'weak';
  let score = 0;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^a-zA-Z0-9]/.test(password)) score++;
  if (password.length >= 12) score++;
  if (score >= 4) return 'strong';
  if (score >= 2) return 'medium';
  return 'weak';
};

const ForgotPassword: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { sendVerificationCode, resetPassword } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState<string[]>(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(val);
  };

  const handleStep1Next = async () => {
    if (phone.length !== 10) {
      setError(t('auth.invalidPhone'));
      return;
    }
    setLoading(true);
    setError('');
    const success = await sendVerificationCode(phone);
    setLoading(false);
    if (success) {
      setCountdown(60);
      setStep(2);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (index + i < 6) newOtp[index + i] = d;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      otpRefs.current[nextIndex]?.focus();
      return;
    }
    const digit = value.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleResendCode = useCallback(async () => {
    if (countdown > 0) return;
    setLoading(true);
    const success = await sendVerificationCode(phone);
    setLoading(false);
    if (success) {
      setCountdown(60);
    }
  }, [countdown, phone, sendVerificationCode]);

  const handleStep2Next = () => {
    const code = otp.join('');
    if (code.length !== 6) {
      setError(t('auth.invalidCode'));
      return;
    }
    setError('');
    setStep(3);
  };

  const handleStep3Submit = async () => {
    if (newPassword.length < 8) {
      setError(t('auth.passwordTooShort'));
      return;
    }
    if (newPassword !== confirmPassword) {
      setError(t('auth.passwordMismatch'));
      return;
    }
    setLoading(true);
    setError('');
    const code = otp.join('');
    const success = await resetPassword(phone, code, newPassword);
    setLoading(false);
    if (success) {
      setStep(4);
    } else {
      setError(t('auth.invalidCode'));
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

  const passwordStrength = getPasswordStrength(newPassword);
  const strengthColors = {
    weak: 'bg-red-500',
    medium: 'bg-yellow-500',
    strong: 'bg-green-500',
  };
  const strengthSegments = {
    weak: 1,
    medium: 2,
    strong: 3,
  };

  const steps = [
    t('auth.stepPhone'),
    t('auth.stepCode'),
    t('auth.stepNewPassword'),
    t('auth.stepSuccess'),
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        {/* Language toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleLanguage}
            className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-white rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
          >
            {i18n.language === 'zh' ? 'EN' : '中文'}
          </button>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Back to login */}
          {step < 4 && (
            <Link
              to="/login"
              className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700 mb-6 transition-colors"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t('auth.backToLogin')}
            </Link>
          )}

          {/* Title */}
          <h2 className="text-xl font-bold text-gray-800 mb-2">{t('auth.resetPassword')}</h2>
          <p className="text-sm text-gray-500 mb-6">{t('auth.resetPasswordDesc')}</p>

          {/* Step indicator */}
          <div className="flex items-center justify-between mb-8">
            {steps.map((label, index) => {
              const stepNum = index + 1;
              const isCompleted = step > stepNum;
              const isCurrent = step === stepNum;
              return (
                <React.Fragment key={stepNum}>
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        isCompleted || isCurrent
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isCompleted ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        stepNum
                      )}
                    </div>
                    <span className={`text-xs mt-1 ${isCurrent || isCompleted ? 'text-blue-600' : 'text-gray-400'}`}>
                      {label}
                    </span>
                  </div>
                  {index < 3 && (
                    <div
                      className={`flex-1 h-0.5 mx-2 mt-[-16px] transition-colors ${
                        step > stepNum ? 'bg-blue-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* Error */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Step 1: Phone number */}
          {step === 1 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('auth.phoneNumber')}
              </label>
              <div className="flex mb-6">
                <span className="inline-flex items-center px-3 bg-gray-50 border border-r-0 border-gray-300 rounded-l-lg text-gray-500 text-sm">
                  +1
                </span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={phone}
                  onChange={handlePhoneChange}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={t('auth.phoneNumberPlaceholder')}
                />
              </div>
              <button
                onClick={handleStep1Next}
                disabled={loading || phone.length !== 10}
                className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('common.loading') : t('auth.next')}
              </button>
            </div>
          )}

          {/* Step 2: OTP input */}
          {step === 2 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-4 text-center">
                {t('auth.verificationCode')}
              </label>
              <div className="flex justify-center space-x-3 mb-4">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { otpRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(index, e)}
                    className="w-12 h-14 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                ))}
              </div>
              <div className="text-center mb-6">
                {countdown > 0 ? (
                  <span className="text-sm text-gray-500">
                    {t('auth.resendCodeCountdown', { seconds: countdown })}
                  </span>
                ) : (
                  <button
                    onClick={handleResendCode}
                    disabled={loading}
                    className="text-sm text-blue-500 hover:text-blue-600 transition-colors"
                  >
                    {t('auth.resendCode')}
                  </button>
                )}
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('auth.previous')}
                </button>
                <button
                  onClick={handleStep2Next}
                  disabled={otp.join('').length !== 6}
                  className="flex-1 py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {t('auth.next')}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: New password */}
          {step === 3 && (
            <div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.newPassword')}
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={t('auth.newPasswordPlaceholder')}
                />
                {/* Password strength bar */}
                {newPassword && (
                  <div className="mt-2">
                    <div className="flex space-x-1 mb-1">
                      {[1, 2, 3].map((seg) => (
                        <div
                          key={seg}
                          className={`h-1.5 flex-1 rounded-full transition-colors ${
                            seg <= strengthSegments[passwordStrength]
                              ? strengthColors[passwordStrength]
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                    <span className={`text-xs ${
                      passwordStrength === 'weak' ? 'text-red-500' :
                      passwordStrength === 'medium' ? 'text-yellow-600' : 'text-green-500'
                    }`}>
                      {t(`auth.password${passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}`)}
                    </span>
                  </div>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.confirmPassword')}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={t('auth.confirmPasswordPlaceholder')}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setStep(2)}
                  className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t('auth.previous')}
                </button>
                <button
                  onClick={handleStep3Submit}
                  disabled={loading || newPassword.length < 8 || newPassword !== confirmPassword}
                  className="flex-1 py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? t('common.loading') : t('auth.confirmReset')}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="text-center py-4">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">{t('auth.resetSuccess')}</h3>
              <p className="text-sm text-gray-500 mb-6">{t('auth.resetSuccessDesc')}</p>
              <button
                onClick={() => navigate('/login')}
                className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
              >
                {t('auth.backToLogin')}
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          © 2026 iOrderAI. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
