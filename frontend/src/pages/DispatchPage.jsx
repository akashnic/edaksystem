import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { DispatchTable } from '../components/dispatch/DispatchTable';
import { Button } from '../components/common/Button';
import api from '../api';
import { useTranslation } from 'react-i18next';
import { Search } from 'lucide-react';

export function DispatchPage() {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchDispatches = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('dispatch/');
      setData(res.data?.results || res.data || []);
    } catch (err) {
      toast.error(t('TOAST_LOAD_DISPATCHES_FAIL'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDispatches();
  }, []);

  const filteredData = data.filter(item => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (item.dispatch_number && item.dispatch_number.toLowerCase().includes(term)) ||
      (item.receive_letter_number && item.receive_letter_number.toLowerCase().includes(term)) ||
      (item.receive_subject && item.receive_subject.toLowerCase().includes(term)) ||
      (item.receiver_officer_department && item.receiver_officer_department.toLowerCase().includes(term)) ||
      (item.receiver_name && item.receiver_name.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('DISPATCH_TITLE')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('DISPATCH_SUBTITLE')}</p>
        </div>
        <div className="flex space-x-3 items-center">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder={t('SEARCH_PLACEHOLDER', 'Search...')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-100">
        <DispatchTable
          data={filteredData}
          isLoading={isLoading}
          onRefresh={fetchDispatches}
        />
      </div>
    </div>
  );
}
