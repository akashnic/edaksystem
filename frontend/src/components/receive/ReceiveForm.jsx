import React, { useState } from 'react';
import { FormWrapper } from '../form/FormWrapper';
import { getReceiveFormFields } from '../../configs/receiveFormConfig';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '../common/ConfirmDialog';

export function ReceiveForm({ onSubmit, defaultValues, isLoading, isEdit }) {
  const { t } = useTranslation();
  const [confirmData, setConfirmData] = useState(null);

  const handleSubmit = (data) => {
    if (!isEdit) {
      setConfirmData(data);
    } else {
      onSubmit(data);
    }
  };

  const handleConfirm = () => {
    onSubmit(confirmData);
    setConfirmData(null);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
      <h2 className="text-lg font-semibold mb-4">{isEdit ? t('EDIT_RECEIPT_TITLE') : t('NEW_RECEIPT_TITLE')}</h2>
      <FormWrapper 
        config={getReceiveFormFields(t)} 
        onSubmit={handleSubmit} 
        defaultValues={defaultValues}
        isLoading={isLoading}
        submitLabel={isEdit ? t('BTN_SAVE') : t('BTN_SUBMIT')}
      />
      <ConfirmDialog
        isOpen={!!confirmData}
        title={t('CONFIRM_ACTION')}
        message={t('CONFIRM_CREATE_RECEIPT_MSG')}
        onConfirm={handleConfirm}
        onCancel={() => setConfirmData(null)}
      />
    </div>
  );
}
