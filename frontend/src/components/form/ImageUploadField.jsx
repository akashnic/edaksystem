import React, { useRef, useState, useEffect } from 'react';
import { Camera, Image as ImageIcon, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from '../common/Button';
import { getMediaUrl } from '../../api';

export function ImageUploadField({ name, label, setValue, currentValue, error }) {
  const { t } = useTranslation();
  const fileInputRef = useRef(null);
  const previewSrc = React.useMemo(() => {
    if (!currentValue) return null;
    if (typeof currentValue === 'string') return getMediaUrl(currentValue);
    if (currentValue instanceof File || currentValue instanceof Blob) {
      return URL.createObjectURL(currentValue);
    }
    return null;
  }, [currentValue]);

  useEffect(() => {
    return () => {
      // Cleanup object URL if it was created
      if (previewSrc && previewSrc.startsWith('blob:')) {
        URL.revokeObjectURL(previewSrc);
      }
    };
  }, [previewSrc]);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Compress the image before setting value
    compressImage(file, (compressedBlob) => {
      setValue(name, compressedBlob, { shouldDirty: true, shouldValidate: true });
    });
  };

  const compressImage = (file, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Max aspect constraint
        const MAX_DIMENSION = 1000;
        if (width > height) {
          if (width > MAX_DIMENSION) {
            height *= MAX_DIMENSION / width;
            width = MAX_DIMENSION;
          }
        } else {
          if (height > MAX_DIMENSION) {
            width *= MAX_DIMENSION / height;
            height = MAX_DIMENSION;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Compress to webp format 80% quality
        canvas.toBlob(
          (blob) => {
            // Also maintain original filename if possible, but change extension
            const compressedFile = new File([blob], "capture.webp", {
              type: "image/webp",
              lastModified: Date.now(),
            });
            callback(compressedFile);
          },
          'image/webp',
          0.8
        );
      };
    };
  };

  const handleRemove = () => {
    setValue(name, null, { shouldDirty: true, shouldValidate: true });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="flex flex-col space-y-2 mb-4">
      <label className="text-sm font-medium text-gray-700">{label}</label>

      {/* Hidden file inputs for capture and gallery */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      {!previewSrc ? (
        <div className="flex space-x-3">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => {
              // Reset capture attribute for standard file picker
              fileInputRef.current.removeAttribute('capture');
              fileInputRef.current.click();
            }}
          >
            <ImageIcon className="w-5 h-5 mr-2" />
            {t('BTN_UPLOAD_IMAGE', 'Upload Image')}
          </Button>
          <Button 
            type="button" 
            variant="primary" 
            onClick={() => {
              // Set capture attribute for camera
              fileInputRef.current.setAttribute('capture', 'environment');
              fileInputRef.current.click();
            }}
          >
            <Camera className="w-5 h-5 mr-2" />
            {t('BTN_CAPTURE', 'Capture Option')}
          </Button>
        </div>
      ) : (
        <div className="relative inline-block border rounded p-2 bg-gray-50 border-gray-200">
          <img
            src={previewSrc}
            alt="Preview"
            className="max-h-[300px] object-contain rounded"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-3 right-3 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-md transition-colors"
            title={t('BTN_REMOVE_IMAGE', 'Remove Image')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && <p className="text-xs text-red-500">{error.message}</p>}
    </div>
  );
}
