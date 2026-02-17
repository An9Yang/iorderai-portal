import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';

type LoginTab = 'phone' | 'account';

const Login: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { login, loginWithPhone, sendVerificationCode, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<LoginTab>('phone');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Phone login state
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [codeSending, setCodeSending] = useState(false);

  // Account login state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleTabSwitch = (tab: LoginTab) => {
    setActiveTab(tab);
    setError('');
    setPhone('');
    setCode('');
    setUsername('');
    setPassword('');
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setPhone(val);
  };

  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 6);
    setCode(val);
  };

  const handleSendCode = useCallback(async () => {
    if (phone.length !== 10) {
      setError(t('auth.invalidPhone'));
      return;
    }
    setCodeSending(true);
    setError('');
    const success = await sendVerificationCode(phone);
    setCodeSending(false);
    if (success) {
      setCountdown(60);
    }
  }, [phone, sendVerificationCode, t]);

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (phone.length !== 10) {
      setError(t('auth.invalidPhone'));
      return;
    }
    setLoading(true);
    const success = await loginWithPhone(phone, code);
    if (success) {
      navigate('/');
    } else {
      setError(t('auth.phoneLoginFailed'));
    }
    setLoading(false);
  };

  const handleAccountLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const success = await login(username, password);
    if (success) {
      navigate('/');
    } else {
      setError(t('auth.loginFailed'));
    }
    setLoading(false);
  };

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const toggleLanguage = () => {
    const newLang = i18n.language === 'zh' ? 'en' : 'zh';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
  };

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

        {/* Login card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo and title */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500 rounded-xl mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">{t('common.appName')}</h1>
            <p className="text-gray-500 mt-2">{t('auth.login')}</p>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => handleTabSwitch('phone')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'phone'
                  ? 'bg-white shadow-sm text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('auth.phoneLogin')}
            </button>
            <button
              onClick={() => handleTabSwitch('account')}
              className={`flex-1 py-2.5 text-sm font-medium rounded-md transition-all duration-200 ${
                activeTab === 'account'
                  ? 'bg-white shadow-sm text-blue-600'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t('auth.accountLogin')}
            </button>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
              {error}
            </div>
          )}

          {/* Phone login tab */}
          {activeTab === 'phone' && (
            <form onSubmit={handlePhoneLogin}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.phoneNumber')}
                </label>
                <div className="flex">
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
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.verificationCode')}
                </label>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={code}
                    onChange={handleCodeChange}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder={t('auth.verificationCodePlaceholder')}
                    required
                  />
                  <button
                    type="button"
                    onClick={handleSendCode}
                    disabled={countdown > 0 || codeSending || phone.length !== 10}
                    className="px-4 py-3 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    {codeSending
                      ? t('common.loading')
                      : countdown > 0
                        ? t('auth.resendCodeCountdown', { seconds: countdown })
                        : t('auth.sendCode')}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('common.loading') : t('auth.loginButton')}
              </button>
            </form>
          )}

          {/* Account login tab */}
          {activeTab === 'account' && (
            <form onSubmit={handleAccountLogin}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.username')}
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={t('auth.username')}
                  required
                />
              </div>

              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('auth.password')}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder={t('auth.password')}
                  required
                />
              </div>

              <div className="flex justify-end mb-6">
                <Link
                  to="/forgot-password"
                  className="text-sm text-blue-500 hover:text-blue-600 transition-colors"
                >
                  {t('auth.forgotPassword')}
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? t('common.loading') : t('auth.loginButton')}
              </button>
            </form>
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

export default Login;
