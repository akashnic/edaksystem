import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useTranslation } from 'react-i18next';
import { DataTable } from '../table/DataTable';

export function BulkDispatchSelectionModal({ isOpen, onClose, data, onDispatchSelected }) {
  const { t } = useTranslation();
  const [selectedIds, setSelectedIds] = useState([]);

  // Reset selection when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedIds([]);
    }
  }, [isOpen]);

  // Filter NEW and sort by date_of_receipt desc
  const filteredData = React.useMemo(() => {
    return data
      .filter((item) => item.current_status === 'NEW')
      .sort((a, b) => {
        if (!a.date_of_receipt) return 1;
        if (!b.date_of_receipt) return -1;
        return new Date(b.date_of_receipt) - new Date(a.date_of_receipt);
      });
  }, [data]);

  const handleToggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds(filteredData.map((item) => item.l_id));
    } else {
      setSelectedIds([]);
    }
  };

  const isAllSelected = filteredData.length > 0 && selectedIds.length === filteredData.length;

  const columns = [
    {
      key: 'select',
      label: (
        <input
          type="checkbox"
          checked={isAllSelected}
          onChange={handleSelectAll}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
        />
      ),
      render: (row) => (
        <div className="flex items-center" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={selectedIds.includes(row.l_id)}
            onChange={() => handleToggleSelect(row.l_id)}
            className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
          />
        </div>
      ),
    },
    { key: 'letter_number', label: t('COL_RECEIVE_LETTER_DETAIL') },
    { key: 'subject', label: t('COL_RECEIVE_SUBJECT') },
    { key: 'date_of_receipt', label: t('COL_RECEIVE_DATE') },
    { key: 'sender_name', label: t('COL_RECEIVE_SENDER') },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('BULK_DISPATCH_SELECTION_TITLE', 'Select Letters to Dispatch')}>
      <div className="space-y-4">

        <div className="max-h-[60vh] overflow-y-auto border border-gray-200 rounded-lg">
          <DataTable
            columns={columns}
            data={filteredData}
            isLoading={false}
            rowClassConfig={(row) => (selectedIds.includes(row.l_id) ? 'bg-blue-50/50' : '')}
            onRowClick={(row) => handleToggleSelect(row.l_id)}
          />
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-100">
          <span className="text-sm font-medium text-gray-700">
            {selectedIds.length} {t('SELECTED')}
          </span>
          <div className="space-x-2">
            <Button variant="outline" onClick={onClose}>
              {t('BTN_CLOSE')}
            </Button>
            <Button
              variant="primary"
              onClick={() => onDispatchSelected(filteredData.filter((i) => selectedIds.includes(i.l_id)))}
              disabled={selectedIds.length === 0}
            >
              {t('BTN_DISPATCH')}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
