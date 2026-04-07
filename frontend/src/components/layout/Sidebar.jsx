import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Inbox, Send, Users } from 'lucide-react';
import { cn } from '../common/Button';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import nicLogoIcon from '../../assets/nic_logo/iconic_logo_v1.png';
import nicLogoFull from '../../assets/nic_logo/iconic_logo_v3_english.png';

export function Sidebar({ isOpen }) {
  const { t } = useTranslation();
  const { isReceiver, isDispatcher, isAdmin } = useAuth();
  
  const navItems = [
    { name: t('NAV_SUMMARY'), path: '/', icon: LayoutDashboard, show: true },
    { name: t('NAV_RECEIVE_REGISTER'), path: '/receive', icon: Inbox, show: isReceiver },
    { name: t('NAV_DISPATCH_REGISTER'), path: '/dispatch', icon: Send, show: isDispatcher },
    { name: t('NAV_USER_MANAGEMENT'), path: '/users', icon: Users, show: isAdmin },
  ].filter(item => item.show);

  return (
    <aside
      className={cn(
        "bg-slate-900 border-r border-slate-800 text-white flex flex-col transition-all duration-300 overflow-hidden shrink-0 h-full z-50",
        "absolute lg:relative",
        isOpen ? "w-64 translate-x-0" : "w-0 -translate-x-full lg:w-16 lg:translate-x-0"
      )}
    >
      <div className="h-16 flex items-center justify-center border-b border-slate-800 px-4">
        <img src={nicLogoIcon} alt="NIC Logo" className="w-8 h-8 object-contain flex-shrink-0" />
        {isOpen && (
          <div className="ml-3 flex flex-col justify-center overflow-hidden">
            <span className="font-bold text-base leading-tight whitespace-nowrap">{t('APP_TITLE')}</span>
            <span className="text-[9px] text-slate-400 font-medium leading-tight whitespace-nowrap">{t('ORG_SUBTITLE')}</span>
          </div>
        )}
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center px-4 py-3 mx-2 rounded-md transition-colors",
                    isActive ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
                  )
                }
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span className="ml-3 whitespace-nowrap">{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {isOpen && (
        <div className="p-4 border-t border-slate-800 mt-auto bg-slate-900/50">
          <img 
            src={nicLogoFull} 
            alt="NIC National Informatics Centre" 
            className="w-full h-auto object-contain opacity-80 hover:opacity-100 transition-opacity bg-white/5 p-2 rounded"
          />
        </div>
      )}
    </aside>
  );
}
