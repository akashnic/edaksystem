import React from 'react';
import { DataTable } from '../table/DataTable';
import { getReceiveColumns } from '../../configs/receiveColumns';
import { useTranslation } from 'react-i18next';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Plus, Edit, Eye } from 'lucide-react';

export function ReceiveTable({ data, isLoading, onDispatch, onView, onEdit }) {
  const { t } = useTranslation();
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'NEW': return <Badge variant="new">{t('STATUS_NEW')}</Badge>;
      case 'DISPATCHED': return <Badge variant="dispatched">{t('STATUS_DISPATCHED')}</Badge>;
      case 'RECEIVED': return <Badge variant="received">{t('STATUS_RECEIVED')}</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const enhancedColumns = [
    ...getReceiveColumns(t).map(col => {
      if (col.key === 'current_status') {
        return { ...col, render: (row) => getStatusBadge(row.current_status) };
      }
      return col;
    }),
    {
      key: 'actions',
      label: t('COL_RECEIVE_ACTION'),
      render: (row) => (
        <div className="flex space-x-2">
          
          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onView(row); }}>
            <Eye className="w-4 h-4" />
          </Button>
          {row.current_status !== 'RECEIVED' && <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); onEdit(row); }}>
            <Edit className="w-4 h-4" />
          </Button>}
          {row.current_status === 'NEW' && (
            <Button size="sm" variant="primary" onClick={(e) => { e.stopPropagation(); onDispatch(row); }}>
              {t('BTN_DISPATCH')}
            </Button>
          )}
        </div>
      )
    }
  ];

  const rowClassConfig = (row) => {
    if (row.current_status === 'NEW') return "bg-blue-50/30";
    if (row.current_status === 'DISPATCHED') return "bg-red-50/30";
    if (row.current_status === 'RECEIVED') return "bg-gray-100/50";
    return "";
  };

  return (
    <DataTable 
      columns={enhancedColumns} 
      data={data} 
      isLoading={isLoading} 
      rowClassConfig={rowClassConfig}
    />
  );
}
