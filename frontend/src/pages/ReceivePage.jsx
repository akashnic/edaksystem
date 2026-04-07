import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { ReceiveTable } from '../components/receive/ReceiveTable';
import { ReceiveForm } from '../components/receive/ReceiveForm';
import { DispatchForm } from '../components/dispatch/DispatchForm';
import { Drawer } from '../components/common/Drawer';
import { Modal } from '../components/common/Modal';
import { Button } from '../components/common/Button';
import { useTranslation } from 'react-i18next';
import api, { getMediaUrl } from '../api';
import { BulkDispatchSelectionModal } from '../components/receive/BulkDispatchSelectionModal';
import { BulkDispatchForm } from '../components/dispatch/BulkDispatchForm';
import { Plus, Send, Search } from 'lucide-react';

export function ReceivePage() {
  const { t } = useTranslation();
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Drawer states
  const [isReceiveDrawerOpen, setIsReceiveDrawerOpen] = useState(false);
  const [isDispatchDrawerOpen, setIsDispatchDrawerOpen] = useState(false);
  
  // Bulk Dispatch states
  const [isBulkSelectionOpen, setIsBulkSelectionOpen] = useState(false);
  const [isBulkDispatchDrawerOpen, setIsBulkDispatchDrawerOpen] = useState(false);
  const [selectedBulkItems, setSelectedBulkItems] = useState([]);
  
  // View states
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  
  // Editing state
  const [editItem, setEditItem] = useState(null);
  
  const [currentItem, setCurrentItem] = useState(null);

  const fetchReceives = async () => {
    setIsLoading(true);
    try {
      // we assume the API returns an array or an object with 'results' array (DRF default)
      const res = await api.get('receive/');
      setData(res.data?.results || res.data || []);
    } catch (err) {
      toast.error(t('TOAST_LOAD_RECEIVES_FAIL'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReceives();
  }, []);

  const filteredData = data.filter(item => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (item.letter_number && item.letter_number.toLowerCase().includes(term)) ||
      (item.subject && item.subject.toLowerCase().includes(term)) ||
      (item.sender_name && item.sender_name.toLowerCase().includes(term)) ||
      (item.remarks && item.remarks.toLowerCase().includes(term))
    );
  });

  const handleCreateOrUpdateReceive = async (formData) => {
    try {
      const fd = new FormData();
      Object.keys(formData).forEach(key => {
        let value = formData[key];
        if (value === "") value = null;
        
        if (key === 'letter_image') {
          if (value instanceof File || value instanceof Blob) {
            fd.append(key, value);
          } else if (value === null) {
            fd.append(key, '');
          }
          // Skip if string (unchanged url)
        } else if (value !== null && value !== undefined) {
          fd.append(key, value);
        } else if (value === null) {
          fd.append(key, ''); // Ensure nulls clear out text fields correctly via DRF
        }
      });
      
      const config = {
        headers: { 'Content-Type': 'multipart/form-data' }
      };
      
      if (editItem) {
        await api.put(`receive/${editItem.l_id}/`, fd, config);
        toast.success(t('TOAST_DOCUMENT_UPDATED'));
      } else {
        await api.post('receive/', fd, config);
        toast.success(t('TOAST_DOCUMENT_RECEIVED'));
      }
      
      setIsReceiveDrawerOpen(false);
      setEditItem(null);
      fetchReceives();
    } catch (err) {
      toast.error(editItem ? t('TOAST_UPDATE_RECEIPT_ERR') : t('TOAST_CREATE_RECEIPT_ERR'));
    }
  };

  const handleCreateDispatch = async (dispatchData) => {
    try {
      // Changed to bulk-dispatch endpoint since DispatchForm now sends bulk structure
      await api.post('dispatch/bulk-dispatch/', dispatchData);
      toast.success(t('TOAST_DISPATCH_SUCCESS'));
      setIsDispatchDrawerOpen(false);
      // Close view modal if it was open from the dispatch action
      setIsViewModalOpen(false);
      fetchReceives(); // Refresh to update status to DISPATCHED
    } catch (err) {
      toast.error(t('TOAST_DISPATCH_ERR'));
    }
  };

  const handleDispatchSelected = (selected) => {
    setSelectedBulkItems(selected);
    setIsBulkSelectionOpen(false);
    setIsBulkDispatchDrawerOpen(true);
  };
  
  const handleCreateBulkDispatch = async (bulkData) => {
    try {
      await api.post('dispatch/bulk-dispatch/', bulkData);
      toast.success(t('TOAST_DISPATCH_SUCCESS'));
      setIsBulkDispatchDrawerOpen(false);
      setSelectedBulkItems([]);
      fetchReceives();
    } catch (err) {
      toast.error(t('TOAST_DISPATCH_ERR'));
    }
  };

  const openDispatchDrawer = (item) => {
    setCurrentItem(item);
    setIsDispatchDrawerOpen(true);
  };
  
  const openViewModal = (item) => {
    setViewItem(item);
    setIsViewModalOpen(true);
  };
  
  const openEditDrawer = (item) => {
    setEditItem(item);
    setIsReceiveDrawerOpen(true);
  };
  
  const closeReceiveDrawer = () => {
    setIsReceiveDrawerOpen(false);
    setEditItem(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('RECEIVE_TITLE')}</h1>
          <p className="text-gray-500 text-sm mt-1">{t('RECEIVE_SUBTITLE')}</p>
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
          <Button variant="outline" onClick={() => setIsBulkSelectionOpen(true)}>
            <Send className="w-5 h-5 mr-2" /> {t('BULK_DISPATCH')}
          </Button>
          <Button onClick={() => setIsReceiveDrawerOpen(true)}>
            <Plus className="w-5 h-5 mr-2" /> {t('NEW_RECEIPT_BTN')}
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg p-2 shadow-sm border border-gray-100">
        <ReceiveTable
          data={filteredData}
          isLoading={isLoading}
          
          onView={openViewModal}
          onEdit={openEditDrawer}
          onDispatch={openDispatchDrawer}
        />
      </div>

      <Drawer 
        isOpen={isReceiveDrawerOpen} 
        onClose={closeReceiveDrawer}
        title={editItem ? t('DRAWER_EDIT_RECEIPT_TITLE') : t('DRAWER_NEW_RECEIPT_TITLE')}
      >
        <ReceiveForm 
          onSubmit={handleCreateOrUpdateReceive} 
          defaultValues={editItem || { date_of_receipt: new Date().toISOString().split('T')[0] }} 
          isEdit={!!editItem} 
        />
      </Drawer>

      <Drawer
        isOpen={isDispatchDrawerOpen}
        onClose={() => setIsDispatchDrawerOpen(false)}
        title={t('DISPATCH_DRAWER_TITLE')}
      >
        {currentItem && (
          <DispatchForm 
            receiveItem={currentItem} 
            onSubmit={handleCreateDispatch} 
          />
        )}
      </Drawer>
      
      <BulkDispatchSelectionModal
        isOpen={isBulkSelectionOpen}
        onClose={() => setIsBulkSelectionOpen(false)}
        data={data}
        onDispatchSelected={handleDispatchSelected}
      />
      
      <Drawer
        isOpen={isBulkDispatchDrawerOpen}
        onClose={() => setIsBulkDispatchDrawerOpen(false)}
        title={t('DISPATCH_DRAWER_TITLE')}
      >
        <BulkDispatchForm
          selectedReceives={selectedBulkItems}
          onSubmit={handleCreateBulkDispatch}
        />
      </Drawer>
      
      <Modal 
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title={t('VIEW_RECEIVE_MODAL_TITLE')}
      >
        {viewItem && (
          <div className="space-y-4 text-left">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">{t('DETAIL_LETTER_NUMBER')}</p>
                <p className="text-gray-900">{viewItem.letter_number}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{t('DETAIL_LETTER_DATE')}</p>
                <p className="text-gray-900">{viewItem.letter_date}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{t('DETAIL_SUBJECT')}</p>
                <p className="text-gray-900">{viewItem.subject || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{t('DETAIL_SENDER_DETAILS')}</p>
                <p className="text-gray-900">{viewItem.sender_name || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{t('DETAIL_DATE_OF_RECEIPT')}</p>
                <p className="text-gray-900">{viewItem.date_of_receipt || '-'}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">{t('DETAIL_STATUS')}</p>
                <p className="text-gray-900">{viewItem.current_status}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm font-medium text-gray-500">{t('DETAIL_REMARKS')}</p>
                <p className="text-gray-900 whitespace-pre-wrap">{viewItem.remarks || '-'}</p>
              </div>
            </div>
            
            {viewItem.letter_image && (
              <div className="mt-4 border-t border-gray-100 pt-4">
                <p className="text-sm font-medium text-gray-500 mb-2">{t('FORM_LETTER_IMAGE', 'Letter Image')}</p>
                <img 
                  src={getMediaUrl(viewItem.letter_image)} 
                  alt="Letter Capture" 
                  className="max-h-96 rounded-md border border-gray-200 object-contain mx-auto" 
                />
              </div>
            )}
            
            <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100 mt-4">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
                {t('BTN_CLOSE')}
              </Button>
              {viewItem.current_status === 'NEW' && (
                <Button variant="primary" onClick={() => {
                  openDispatchDrawer(viewItem);
                  // We do NOT immediately close the modal, wait for successful dispatch
                  // Actually, `openDispatchDrawer` sets a new drawer state so it might overlap.
                    // Close modal here for cleaner UX.
                  setIsViewModalOpen(false);
                }}>
                  {t('BTN_DISPATCH')}
                </Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
