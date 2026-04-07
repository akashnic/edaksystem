import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '../common/Button';
import { Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { ConfirmDialog } from '../common/ConfirmDialog';

export function DispatchForm({ receiveItem, onSubmit, isLoading }) {
  const { t } = useTranslation();
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  
  // Starting with one empty department dispatch entry
  const [departments, setDepartments] = useState([
    { id: 1, receiver_officer_department: '', dispatch_number: '' }
  ]);

  const handleAddDepartment = () => {
    setDepartments([
      ...departments,
      { id: Date.now(), receiver_officer_department: '', dispatch_number: '' }
    ]);
  };

  const handleRemoveDepartment = (id) => {
    if (departments.length > 1) {
      setDepartments(departments.filter(d => d.id !== id));
    }
  };

  const handleDepartmentChange = (id, field, value) => {
    setDepartments(departments.map(d => 
      d.id === id ? { ...d, [field]: value } : d
    ));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate inputs
    const isValid = departments.every(d => d.receiver_officer_department.trim() && d.dispatch_number.trim());
    if (!isValid) {
      toast.error(t('Please fill all department and dispatch number fields.'));
      return;
    }

    setIsConfirmOpen(true);
  };

  const handleConfirm = () => {
    setIsConfirmOpen(false);

    const cleanedDepartments = departments.map(d => ({
      receiver_officer_department: d.receiver_officer_department,
      dispatch_number: d.dispatch_number
    }));

    // We pass back bulk payload format so the parent can use the bulk-dispatch endpoint
    onSubmit({
      receives: [receiveItem.l_id],
      departments: cleanedDepartments
    });
  };

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* Selected Letter Summary */}
        <div className="bg-blue-50 p-4 rounded-md border border-blue-100 shadow-sm">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            {t('SELECTED')}
          </h3>
          <div className="text-sm text-blue-800 space-y-1">
            <p><strong>{t('SIGN_DETAIL_LETTER_NO')}</strong> {receiveItem?.letter_number}</p>
            <p><strong>{t('COL_RECEIVE_DATE')}:</strong> {receiveItem?.letter_date}</p>
            <p><strong>{t('SIGN_DETAIL_SUBJECT')}</strong> {receiveItem?.subject || 'No Subject'}</p>
          </div>
        </div>

        {/* Dynamic Departments Form */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-gray-900">{t('BULK_DISPATCH_DESTINATION_LABEL')}</h3>
            <Button type="button" size="sm" variant="outline" onClick={handleAddDepartment}>
              <Plus className="w-4 h-4 mr-1" /> {t('BULK_DISPATCH_ADD_DESTINATION')}
            </Button>
          </div>

          <form id="single-dispatch-form" onSubmit={handleSubmit} className="space-y-4">
            {departments.map((dept) => (
              <div key={dept.id} className="relative bg-gray-50 border border-gray-200 p-4 rounded-md shadow-sm flex flex-col space-y-4">
                {departments.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveDepartment(dept.id)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 hover:bg-red-50 p-1 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('FORM_RECEIVER_OFFICER')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    placeholder="Enter Department or Officer"
                    value={dept.receiver_officer_department}
                    onChange={(e) => handleDepartmentChange(dept.id, 'receiver_officer_department', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('FORM_DISPATCH_NUMBER')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                    placeholder="Enter Dispatch Number"
                    value={dept.dispatch_number}
                    onChange={(e) => handleDepartmentChange(dept.id, 'dispatch_number', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </form>
        </div>

      </div>

      <div className="p-4 border-t bg-gray-50 flex justify-end">
        <Button 
          type="submit" 
          form="single-dispatch-form" 
          variant="primary" 
          isLoading={isLoading}
          className="w-full sm:w-auto"
        >
          {t('BTN_DISPATCH_DOCUMENT')}
        </Button>
      </div>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title={t('CONFIRM_ACTION')}
        message={t('CONFIRM_DISPATCH_MSG')}
        onConfirm={handleConfirm}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
