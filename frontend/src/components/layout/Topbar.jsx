import React from 'react';
import { Menu, Search, Sun, Moon, Languages, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useUI } from '../../contexts/UIContext';

export function Topbar({ toggleSidebar }) {
  const { i18n } = useTranslation();
  const { logout, user } = useAuth();
  const { fontSize, increaseFontSize, decreaseFontSize, resetFontSize } = useUI();

  const handleLanguageToggle = () => {
    i18n.changeLanguage(i18n.language === 'en' ? 'hi' : 'en');
  };

  return (
    <header className="h-16 bg-white border-b flex items-center justify-between px-4 lg:px-6 z-10 shadow-sm">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="p-2 mr-4 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
        >
          <Menu className="w-6 h-6" />
        </button>
        <div className="hidden lg:block">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            {i18n.t('APP_TITLE')}
          </h1>
        </div>
      </div>

      <div className="flex items-center space-x-2 lg:space-x-6">
        {/* Font Size Controls */}
        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={decreaseFontSize}
            className="px-3 py-1 text-sm font-bold text-gray-600 hover:bg-white rounded-md transition-all border border-transparent hover:border-gray-200"
            title="Decrease Text Size"
          >
            A-
          </button>
          <button
            onClick={resetFontSize}
            className="px-3 py-1 text-sm font-bold text-gray-600 hover:bg-white rounded-md transition-all border border-transparent hover:border-gray-200"
            title="Reset Text Size"
          >
            A
          </button>
          <button
            onClick={increaseFontSize}
            className="px-3 py-1 text-sm font-bold text-gray-600 hover:bg-white rounded-md transition-all border border-transparent hover:border-gray-200"
            title="Increase Text Size"
          >
            A+
          </button>
        </div>

        {/* Language Toggle */}
        <button
          onClick={handleLanguageToggle}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-gray-600 hover:bg-gray-100 transition-all border border-gray-200"
        >
          <Languages className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-bold">
            {i18n.language === 'en' ? 'हिन्दी' : 'English'}
          </span>
        </button>

        <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
              {user?.username ? user.username[0].toUpperCase() : 'A'}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-gray-800 leading-tight">
                {user?.username || 'Admin'}
              </p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">
                {user?.role || 'User'}
              </p>
            </div>
          </div>
          
          <button 
            onClick={logout} 
            className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all group"
            title="Logout"
          >
            <LogOut className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>
    </header>
  );
}
