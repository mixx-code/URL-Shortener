'use client';

import { Copy } from 'lucide-react';

interface QRModalProps {
  show: boolean;
  selectedQR: { url: string; qrCode: string } | null;
  onClose: () => void;
  onCopy: (text: string) => void;
  onDownload: () => void;
}

export default function QRModal({ show, selectedQR, onClose, onCopy, onDownload }: QRModalProps) {
  if (!show || !selectedQR) return null;

  return (
    <div className="fixed inset-0 bg-black/60 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4 sm:mb-6">
          <h3 className="text-base font-semibold text-gray-900">QR Code</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>
        
        <div className="flex flex-col items-center space-y-4">
          <img 
            src={selectedQR.qrCode} 
            alt="QR Code" 
            className="w-48 h-48 sm:w-64 sm:h-64 border border-gray-200 rounded-lg"
          />
          
          <div className="text-center space-y-2">
            <p className="text-sm text-gray-600 break-all">{selectedQR.url}</p>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3 justify-center">
              <button
                onClick={() => onCopy(selectedQR.url)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm w-full sm:w-auto"
              >
                Copy URL
              </button>
              <button
                onClick={onDownload}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm w-full sm:w-auto"
              >
                Download QR
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
