import React, { useState, useMemo } from 'react';
import { DataTable } from '../table/DataTable';
import { getDispatchColumns } from '../../configs/dispatchColumns';
import { useTranslation } from 'react-i18next';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { Drawer } from '../common/Drawer';
import { SignaturePad } from '../form/SignaturePad';
import { ChevronDown, ChevronRight, CornerDownRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api';

export function DispatchTable({ data, isLoading, onRefresh }) {
  const { t } = useTranslation();
  const [inputs, setInputs] = useState({});
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [currentSignTarget, setCurrentSignTarget] = useState(null); // { type: 'single' | 'group', id: string, dispatchIds: [] }

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingRow, setViewingRow] = useState(null);
  const [expandedGroups, setExpandedGroups] = useState({});
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });

  const toggleGroup = (groupId) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const handleSort = (config) => {
    setSortConfig(config);
  };

  const groupedData = useMemo(() => {
    if (!data) return [];
    
    // Group by Date + Department
    const groups = {};

    data.forEach(item => {
      // Create a date key (YYYY-MM-DD) from dispatched_at
      const dateKey = item.dispatched_at ? item.dispatched_at.split('T')[0] : 'undated';
      item.dispatch_date = dateKey; // map for the column
      
      const deptKey = item.receiver_officer_department || 'unknown';
      const dispatchNo = item.dispatch_number || 'unknown';
      const groupKey = `${dateKey}_${deptKey}_${dispatchNo}`;

      if (!groups[groupKey]) {
        groups[groupKey] = {
          isGroupHeader: true,
          groupId: groupKey,
          dispatch_id: `hdr_${groupKey}`, // Added to ensure stable key for React rendering
          department: item.receiver_officer_department,
          dispatch_number: item.dispatch_number,
          dispatch_date: dateKey,
          date: dateKey,
          items: [],
          status: 'RECEIVED' // will evaluate below
        };
      }
      groups[groupKey].items.push(item);
    });

    let sortedGroups = Object.values(groups);
    
    // Determine status for each group first to allow sorting by status
    sortedGroups.forEach(group => {
      const hasNotReceived = group.items.some(i => i.status === 'NOT_RECEIVED');
      group.status = hasNotReceived ? 'NOT_RECEIVED' : 'RECEIVED';
    });

    if (sortConfig.key && sortConfig.direction) {
      sortedGroups.sort((a, b) => {
        let aVal, bVal;
        
        if (sortConfig.key === 'receiver_officer_department') {
          aVal = (a.department || '').toLowerCase();
          bVal = (b.department || '').toLowerCase();
        } else if (sortConfig.key === 'status') {
          aVal = a.status;
          bVal = b.status;
        } else {
          aVal = a[sortConfig.key];
          bVal = b[sortConfig.key];
        }

        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    const display = [];
    sortedGroups.forEach(group => {
      if (group.items.length === 1) {
        // Just single row
        display.push({ ...group.items[0], isSingle: true });
      } else {
        group.receiver_name = group.items[0].receiver_name;
        group.mobile_number = group.items[0].mobile_number;
        group.signature_image = group.items[0].signature_image;
        
        display.push(group);
        if (expandedGroups[group.groupId]) {
          group.items.forEach(item => {
            display.push({ ...item, isGroupChild: true, parentGroupId: group.groupId });
          });
        }
      }
    });

    return display;
  }, [data, expandedGroups, sortConfig]);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'NOT_RECEIVED': return <Badge variant="warning">{t('STATUS_NOT_RECEIVED')}</Badge>;
      case 'RECEIVED': return <Badge variant="received">{t('STATUS_RECEIVED')}</Badge>;
      default: return <Badge>{status}</Badge>;
    }
  };

  const handleInputChange = (id, field, value) => {
    setInputs(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  const handleSignClick = (targetId, type, dispatchIds) => {
    const rowInputs = inputs[targetId] || {};
    if (!rowInputs.name) {
      toast.error(t('TOAST_RECEIVER_NAME_REQ'));
      return;
    }
    setCurrentSignTarget({ id: targetId, type, dispatchIds });
    setIsSignModalOpen(true);
  };

  const handleViewSignClick = (row) => {
    setViewingRow(row);
    setIsViewModalOpen(true);
  };

  const handleSaveSignature = async (signatureUrl) => {
    try {
      const { id, type, dispatchIds } = currentSignTarget;
      const rowInputs = inputs[id];
      
      if (type === 'group' || dispatchIds.length > 1) {
        // Bulk sign
        await api.post('dispatch/bulk-mark-received/', {
          dispatch_ids: dispatchIds,
          receiver_name: rowInputs.name,
          mobile_number: rowInputs.contact || '',
          signature_image: signatureUrl
        });
      } else {
        // Single sign
        await api.put(`dispatch/${dispatchIds[0]}/mark-received/`, {
          receiver_name: rowInputs.name,
          mobile_number: rowInputs.contact || '',
          signature_image: signatureUrl
        });
      }

      toast.success(t('TOAST_SIGNATURE_SAVED'));
      setIsSignModalOpen(false);
      
      setInputs(prev => {
        const newInputs = { ...prev };
        delete newInputs[id];
        return newInputs;
      });

      if (onRefresh) onRefresh();
    } catch (error) {
      toast.error(t('TOAST_SIGNATURE_SAVE_ERR'));
    }
  };

  const enhancedColumns = [
    ...getDispatchColumns(t).map(col => {
      return {
        ...col,
        render: (row) => {
          if (row.isGroupHeader) {
            if (col.key === 'dispatch_number') {
              return (
                 <div 
                   className="font-bold flex items-center cursor-pointer text-blue-600 hover:text-blue-800"
                   onClick={() => toggleGroup(row.groupId)}
                 >
                   {expandedGroups[row.groupId] ? <ChevronDown className="w-4 h-4 mr-1"/> : <ChevronRight className="w-4 h-4 mr-1"/>}
                   {row.dispatch_number || 'Grouped'} ({row.items.length})
                 </div>
              );
            }
            if (col.key === 'receive_letter_number') return <span className="text-gray-400 italic">Multiple</span>;
            if (col.key === 'receive_subject') return <span className="text-gray-400 italic">-</span>;
            if (col.key === 'dispatch_date') return <span className="font-bold">{row.dispatch_date}</span>;
            if (col.key === 'receiver_officer_department') return <span className="font-bold">{row.department}</span>;
            if (col.key === 'status') return getStatusBadge(row.status);
            if (col.key === 'dispatch_id') return '-';
            return '';
          }
          if (row.isGroupChild) {
            if (col.key === 'dispatch_number') return (
              <div className="flex items-center text-gray-400 pl-4">
                 <CornerDownRight className="w-4 h-4 mr-2" />
                 {row.dispatch_number}
              </div>
            );
            if (col.key === 'receiver_officer_department') return <span className="text-gray-400">"</span>;
            if (col.key === 'dispatch_date') return <span className="text-gray-400">"</span>;
            if (col.key === 'status') return getStatusBadge(row.status);
          }
          if (col.key === 'status') return getStatusBadge(row.status);
          return row[col.key];
        }
      }
    }),
    {
      key: 'action',
      label: t('COL_DISPATCH_ACTION'),
      render: (row) => {
        if (row.isGroupChild && row.status !== 'RECEIVED') {
          return null; // hide sign action for individual group children if not received
        }
        
        const targetId = row.isGroupHeader ? row.groupId : row.dispatch_id;
        const formType = row.isGroupHeader ? 'group' : 'single';
        const dIds = row.isGroupHeader ? row.items.map(i=>i.dispatch_id) : [row.dispatch_id];

        if (row.status === 'RECEIVED') {
          return (
            <div className="flex flex-col space-y-2 w-48 text-sm" onClick={e => e.stopPropagation()}>
              <p className="font-medium">{row.receiver_name}</p>
              <p className="text-gray-500">{row.mobile_number}</p>
              <Button size="sm" variant="outline" onClick={() => handleViewSignClick(row)}>
                {t('BTN_VIEW_SIGN')}
              </Button>
            </div>
          );
        }
        
        return (
          <div className="flex flex-col space-y-2 w-48" onClick={e => e.stopPropagation()}>
            <input 
              type="text" 
              placeholder={t('INPUT_RECEIVER_NAME_PLACEHOLDER')} 
              className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={inputs[targetId]?.name || ''}
              onChange={(e) => handleInputChange(targetId, 'name', e.target.value)}
            />
            <input 
              type="text" 
              placeholder={t('INPUT_CONTACT_PLACEHOLDER')} 
              className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
              value={inputs[targetId]?.contact || ''}
              onChange={(e) => handleInputChange(targetId, 'contact', e.target.value)}
            />
            <Button size="sm" variant="primary" onClick={() => handleSignClick(targetId, formType, dIds)}>
              {t('BTN_SIGN_AND_SAVE')}
            </Button>
          </div>
        );
      }
    }
  ];

  return (
    <>
      <DataTable 
        columns={enhancedColumns} 
        data={groupedData} 
        isLoading={isLoading} 
        rowClassConfig={(row) => row.isGroupHeader ? 'bg-blue-50/20' : row.isGroupChild ? 'bg-gray-100/30' : ''}
        onSort={handleSort}
      />
      
      <Drawer
        isOpen={isSignModalOpen}
        onClose={() => setIsSignModalOpen(false)}
        title={t('SIGNATURE_CAPTURE_TITLE')}
      >
        <SignaturePad onSave={handleSaveSignature} />
      </Drawer>

      <Drawer
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={t('SIGNATURE_VIEW_TITLE')}
      >
        {viewingRow && (
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-md border text-sm space-y-2">
              {viewingRow.isGroupHeader ? (
                <>
                  <p><strong>Department:</strong> {viewingRow.department}</p>
                  <p><strong>Letters Enclosed:</strong> {viewingRow.items.length}</p>
                  <p><strong>Date:</strong> {viewingRow.date}</p>
                </>
              ) : (
                <>
                  <p><strong>{t('SIGN_DETAIL_LETTER_NO')}</strong> {viewingRow.receive_letter_number}</p>
                  <p><strong>{t('SIGN_DETAIL_SUBJECT')}</strong> {viewingRow.receive_subject}</p>
                  <p><strong>{t('SIGN_DETAIL_DISPATCH_NO')}</strong> {viewingRow.dispatch_number}</p>
                </>
              )}
              <div className="border-t pt-2 mt-2">
                <p><strong>{t('SIGN_DETAIL_RECEIVER_NAME')}</strong> {viewingRow.receiver_name}</p>
                <p><strong>{t('SIGN_DETAIL_CONTACT')}</strong> {viewingRow.mobile_number}</p>
              </div>
            </div>
            {viewingRow.signature_image ? (
               <div className="mt-4">
                 <p className="text-sm font-medium mb-2 text-gray-700">{t('SIGN_DETAIL_PROOF_LABEL')}</p>
                 <img src={viewingRow.signature_image} alt="Signature" className="w-full object-contain border border-gray-200 rounded-md bg-white p-2" />
               </div>
            ) : (
               <p className="text-gray-500 italic mt-4">{t('SIGN_DETAIL_NO_SIGNATURE')}</p>
            )}
          </div>
        )}
      </Drawer>
    </>
  );
}
