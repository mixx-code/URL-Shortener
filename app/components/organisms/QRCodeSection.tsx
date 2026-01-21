import { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import Card from '../atoms/Card';
import Button from '../atoms/Button';
import Spinner from '../atoms/Spinner';

interface QRCodeSectionProps {
  shortUrl: string;
  shortCode: string;
  onCopy: (text: string) => void;
}

export default function QRCodeSection({ shortUrl, shortCode, onCopy }: QRCodeSectionProps) {
  const [qrCode, setQrCode] = useState('');
  const [isGenerating, setIsGenerating] = useState(true);

  const generateQRCode = async (url: string) => {
    try {
      setIsGenerating(true);
      const qr = await QRCode.toDataURL(url, {
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H',
      });
      setQrCode(qr);
    } catch (err) {
      console.error('Error generating QR code:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadQR = () => {
    if (!qrCode) return;
    
    const link = document.createElement('a');
    link.href = qrCode;
    link.download = `qrcode-${shortCode}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Generate QR code when component mounts or shortUrl changes
  useEffect(() => {
    if (shortUrl && !qrCode) {
      generateQRCode(shortUrl);
    }
  }, [shortUrl]);

  return (
    <Card>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">QR Code</h2>
      
      {isGenerating ? (
        <div className="text-center py-8">
          <Spinner size="md" className="mx-auto mb-4" />
          <p className="text-gray-600">Membuat QR Code...</p>
        </div>
      ) : qrCode ? (
        <div className="space-y-4">
          <div className="flex justify-center">
            <div className="p-4 bg-white rounded-lg border border-gray-200">
              <img 
                src={qrCode} 
                alt="QR Code" 
                className="w-48 h-48"
              />
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              onClick={downloadQR}
              variant="success"
              className="flex-1"
            >
              Download QR
            </Button>
            <Button
              onClick={() => onCopy(shortUrl)}
              variant="primary"
              className="flex-1"
            >
              Salin Link
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-600">Gagal membuat QR Code</p>
        </div>
      )}
    </Card>
  );
}
