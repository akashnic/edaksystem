import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { User, Lock, ArrowRight, Loader2, Languages } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import nicLogo from '../assets/nic_logo/iconic_logo_v1_english.png';
import loginBg from '../assets/login_bg.png';

export function LoginPage() {
  const { t, i18n } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'hi' : 'en';
    i18n.changeLanguage(newLang);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    const result = await login(username, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden font-sans">
      {/* Animated Abstract Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center animate-pulse"
        style={{ 
          backgroundImage: `url(${loginBg})`,
          animationDuration: '15s',
          filter: 'brightness(0.8)'
        }}
      />
      <div className="absolute inset-0 z-[1] bg-gradient-to-tr from-blue-900/40 via-transparent to-purple-900/40 backdrop-blur-[1px]" />

      <div className="relative z-10 w-full max-w-md px-6 animate-fade-in">
        {/* Branding Header */}
        <div className="text-center mb-8">
          <div className="inline-block p-4 rounded-3xl bg-white/40 backdrop-blur-md border border-white/30 mb-4 animate-float shadow-xl">
             <h2 className="text-3xl font-black text-blue-950 font-display tracking-tight">
               {t('APP_TITLE')}
             </h2>
          </div>
          <p className="text-blue-950 font-extrabold text-sm uppercase tracking-[0.25em] drop-shadow-sm">
            {t('ORG_SUBTITLE')}
          </p>
        </div>

        {/* Glassmorphic Login Card */}
        <div className="glass-card rounded-3xl p-8 sm:p-10 shadow-2xl">
          <div className="mb-8">
            <h3 className="text-2xl font-extrabold text-gray-900 font-display tracking-tight">{t('LOGIN_WELCOME')}</h3>
            <p className="text-gray-700 font-medium text-sm mt-1">{t('LOGIN_SUBTITLE')}</p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-500 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  required
                  className="block w-full pl-11 pr-4 py-3.5 bg-white/70 border border-gray-300 rounded-2xl text-gray-900 font-medium placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all sm:text-sm shadow-sm"
                  placeholder={t('LABEL_USERNAME')}
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-500 group-focus-within:text-blue-600 transition-colors" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="block w-full pl-11 pr-4 py-3.5 bg-white/70 border border-gray-300 rounded-2xl text-gray-900 font-medium placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 focus:bg-white transition-all sm:text-sm shadow-sm"
                  placeholder={t('LABEL_PASSWORD')}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>

            {/* Language Selector */}
            <div className="flex items-center justify-between py-2.5 px-4 bg-gray-50/50 rounded-2xl border border-gray-200/50 mt-1">
              <div className="flex items-center gap-2 text-gray-700 font-bold text-xs uppercase tracking-wider">
                <Languages className="h-4 w-4 text-blue-600" />
                {t('CHOOSE_LANGUAGE')}
              </div>
              <button 
                type="button"
                onClick={toggleLanguage}
                className="px-4 py-1.5 bg-white border border-gray-200 text-blue-600 text-xs font-black rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all shadow-sm active:scale-95"
              >
                {i18n.language === 'en' ? 'हिन्दी' : 'English'}
              </button>
            </div>

            {error && (
              <div className="text-red-700 text-xs font-bold bg-red-50 border border-red-200 p-3 rounded-xl animate-fade-in text-center shadow-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`group relative w-full flex items-center justify-center py-4 px-6 border border-transparent text-sm font-bold rounded-2xl text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all active:scale-[0.98] shadow-lg shadow-blue-500/25 ${
                isSubmitting ? 'opacity-80 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-3 h-5 w-5" />
                  {t('BTN_AUTHENTICATING')}
                </>
              ) : (
                <>
                  {t('BTN_SIGN_IN')}
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Branding */}
        <footer className="mt-12 flex flex-col items-center gap-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/20">
            <img src={nicLogo} alt="NIC Logo" className="h-8 w-auto brightness-50" />
          </div>
          <div className="flex flex-col items-center text-blue-950 font-bold text-[10px] uppercase tracking-[0.25em] space-y-1">
            <span>© {new Date().getFullYear()} National Informatics Centre</span>
            <span className="text-[8px] opacity-60">All Rights Reserved</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
