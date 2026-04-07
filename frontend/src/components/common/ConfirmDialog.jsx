import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Button } from './Button';
import { useTranslation } from 'react-i18next';

export function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, confirmText, cancelText }) {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center transform transition-all animate-in zoom-in-95 duration-200">
        <div className="mx-auto flex items-center justify-center h-14 w-14 rounded-full bg-blue-100 mb-4">
          <AlertCircle className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="mb-2 text-lg font-bold text-gray-900">{title || t('CONFIRM_ACTION', 'Confirm')}</h3>
        <p className="mb-6 text-sm text-gray-600 leading-relaxed">{message}</p>
        <div className="flex justify-center gap-3">
          <Button variant="outline" className="flex-1" onClick={onCancel}>
            {cancelText || t('BTN_CANCEL', 'Cancel')}
          </Button>
          <Button variant="primary" className="flex-1" onClick={onConfirm}>
            {confirmText || t('BTN_CONFIRM', 'Yes')}
          </Button>
        </div>
      </div>
    </div>
  );
}
