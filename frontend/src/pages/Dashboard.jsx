import React, { useEffect, useState } from 'react';
import api from '../api';
import { Inbox, Send, FileCheck2, Users, ShieldCheck } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';

export function Dashboard() {
  const { t } = useTranslation();
  const { user, isAdmin, isReceiver, isDispatcher } = useAuth();
  const [stats, setStats] = useState({ 
    new: 0, 
    dispatched: 0, 
    received: 0,
    totalUsers: 0,
    pendingReceipt: 0 
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const counters = { new: 0, dispatched: 0, received: 0, totalUsers: 0, pendingReceipt: 0 };
        
        // Fetch User counts for Admin
        if (isAdmin) {
          const userRes = await api.get('accounts/users/');
          counters.totalUsers = userRes.data?.count || userRes.data?.length || 0;
        }

        // Fetch Receive stats if allowed
        if (isReceiver) {
          const res = await api.get('receive/');
          const data = res.data?.results || res.data || [];
          data.forEach(item => {
            if (item.current_status === 'NEW') counters.new++;
            if (item.current_status === 'DISPATCHED') counters.dispatched++;
            if (item.current_status === 'RECEIVED') counters.received++;
          });
        }

        // Fetch Dispatch stats if allowed
        if (isDispatcher) {
          const res = await api.get('dispatch/');
          const data = res.data?.results || res.data || [];
          data.forEach(item => {
            if (item.status === 'NOT_RECEIVED') counters.pendingReceipt++;
            if (item.status === 'RECEIVED') {
              // If not already counted via isReceiver
              if (!isReceiver) counters.received++;
            }
          });
        }

        setStats(counters);
      } catch (err) {
        console.error("Dashboard fetch err:", err);
      }
    };
    fetchStats();
  }, [isAdmin, isReceiver, isDispatcher]);

  return (
    <div className="space-y-6 text-left">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('DASHBOARD_TITLE')}</h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, {user?.full_name || user?.username} ({user?.role})</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isAdmin && (
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500 flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Total Users</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
            </div>
          </div>
        )}

        {isReceiver && (
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500 flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              <Inbox className="w-8 h-8" />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{t('DASHBOARD_STAT_NEW')}</p>
              <p className="text-3xl font-bold text-gray-900">{stats.new}</p>
            </div>
          </div>
        )}
        
        {isDispatcher && (
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-orange-500 flex items-center">
            <div className="p-3 rounded-full bg-orange-100 text-orange-600 mr-4">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">Pending Receipt</p>
              <p className="text-3xl font-bold text-gray-900">{stats.pendingReceipt}</p>
            </div>
          </div>
        )}
        
        {(isReceiver || isDispatcher) && (
          <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500 flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              <FileCheck2 className="w-8 h-8" />
            </div>
            <div>
              <p className="text-gray-500 text-sm font-medium uppercase tracking-wide">{t('DASHBOARD_STAT_RECEIVED')}</p>
              <p className="text-3xl font-bold text-gray-900">{stats.received}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
