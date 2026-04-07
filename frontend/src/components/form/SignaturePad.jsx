import React, { useRef, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { Button } from '../common/Button';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '../common/ConfirmDialog';

export function SignaturePad({ onSave }) {
  const { t } = useTranslation();
  const sigCanvas = useRef({});
  const [error, setError] = useState('');
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const clear = () => {
    sigCanvas.current.clear();
    setError('');
  };

  const attemptSave = () => {
    if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
      setError(t('TOAST_SIGNATURE_REQUIRED'));
      return;
    }
    setIsConfirmOpen(true);
  };

  const save = () => {
    setIsConfirmOpen(false);

    try {
      // getTrimmedCanvas can sometimes throw an error if the canvas is near empty or 0 dimensions.
      // We safely fall back to the full canvas if it fails.
      let sourceCanvas;
      try {
        sourceCanvas = sigCanvas.current.getTrimmedCanvas();
      } catch (err) {
        sourceCanvas = sigCanvas.current.getCanvas();
      }

      if (!sourceCanvas || sourceCanvas.width === 0 || sourceCanvas.height === 0) {
         sourceCanvas = sigCanvas.current.getCanvas();
      }
      
      // Create a temporary canvas to scale down and format as jpeg
      const tempCanvas = document.createElement('canvas');
      const scale = window.innerWidth < 768 ? 0.8 : 0.5; // scale factor
      
      // Ensure dimensions are integers
      tempCanvas.width = Math.max(1, Math.floor(sourceCanvas.width * scale));
      tempCanvas.height = Math.max(1, Math.floor(sourceCanvas.height * scale));
      
      const ctx = tempCanvas.getContext('2d');
      // Fill white background for JPEG
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
      // Draw signature scaled down
      ctx.drawImage(sourceCanvas, 0, 0, tempCanvas.width, tempCanvas.height);
      
      // Capture as JPEG with 0.5 quality (highly compressed)
      // This ensures minimum storage space and avoids large payload blocked by backend/db
      const signatureUrl = tempCanvas.toDataURL('image/jpeg', 0.5);
      
      onSave(signatureUrl);
    } catch (e) {
      console.error('Signature Capture Error:', e);
      setError(t('TOAST_SIGNATURE_CAPTURE_ERR'));
    }
  };

  return (
    <div className="flex flex-col space-y-2 mt-4">
      <label className="text-sm font-medium text-gray-700">{t('SIGNATURE_LABEL')}</label>
      <div className="border border-gray-300 rounded-md bg-white">
        <SignatureCanvas
          ref={sigCanvas}
          penColor="black"
          canvasProps={{ className: 'w-full h-40' }}
        />
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex space-x-2 justify-end">
        <Button variant="outline" size="sm" type="button" onClick={clear}>{t('BTN_CLEAR')}</Button>
        <Button variant="primary" size="sm" type="button" onClick={attemptSave}>{t('BTN_CAPTURE')}</Button>
      </div>
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title={t('CONFIRM_ACTION')}
        message={t('CONFIRM_SIGN_MSG')}
        onConfirm={save}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  );
}
