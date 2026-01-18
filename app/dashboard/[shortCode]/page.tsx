'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import QRCode from 'qrcode';
import Header from '../../components/Header';

interface URLStats {
  id: number;
  original_url: string;
  short_code: string;
  short_url: string;
  click_count: number;
  created_at: string;
  updated_at: string;
  qr_code?: string;
  analytics?: {
    total_clicks: number;
    unique_visitors: number;
    top_countries: Array<{ country: string; count: number }>;
    top_devices: Array<{ device: string; count: number }>;
    daily_clicks: Array<{ date: string; clicks: number }>;
  };
}

export default function URLDetailPage() {
  const params = useParams();
  const router = useRouter();
  const shortCode = params.shortCode as string;
  
  console.log(shortCode);
  const [urlStats, setUrlStats] = useState<URLStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editUrl, setEditUrl] = useState('');
  const [editShortCode, setEditShortCode] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchURLStats();
  }, [shortCode, router]);

  // Generate QR Code when URL stats are loaded
  useEffect(() => {
    if (urlStats?.short_url) {
      generateQRCode(urlStats.short_url);
    }
  }, [urlStats]);

  const generateQRCode = async (shortUrl: string) => {
    try {
      const qr = await QRCode.toDataURL(shortUrl, {
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
    }
  };

  const fetchURLStats = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/stats/${shortCode}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch URL statistics');
      }

      const apiResponse = await response.json();
      console.log('API Response:', apiResponse);
      
      // Extract data from nested response
      if (apiResponse.status && apiResponse.data) {
        setUrlStats(apiResponse.data);
      } else {
        throw new Error('Invalid API response structure');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Link disalin ke clipboard!');
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

  const deleteURL = async () => {
    if (!confirm('Apakah Anda yakin ingin menghapus URL ini?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/urls/${urlStats?.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to delete URL');
      }

      router.push('/dashboard');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    }
  };

  const startEditing = () => {
    setIsEditing(true);
    setEditUrl(urlStats?.original_url || '');
    setEditShortCode(urlStats?.short_code || '');
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditUrl('');
    setEditShortCode('');
  };

  const updateURL = async () => {
    if (!editUrl.trim()) {
      setError('URL tidak boleh kosong');
      return;
    }

    try {
      setIsUpdating(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/urls/${urlStats?.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          original_url: editUrl.trim(),
          short_code: editShortCode.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update URL');
      }

      const data = await response.json();
      
      // Update local state with new data
      if (data.status && data.data) {
        setUrlStats(data.data);
        // Regenerate QR code with new URL
        if (data.data.short_url) {
          generateQRCode(data.data.short_url);
        }
      }

      setIsEditing(false);
      setEditUrl('');
      setEditShortCode('');
      setError('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat detail URL...</p>
        </div>
      </div>
    );
  }

  if (error || !urlStats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 text-red-600 px-6 py-4 rounded-lg mb-4">
            {error || 'URL tidak ditemukan'}
          </div>
          <Link
            href="/dashboard"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            Kembali ke Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header 
        title="Detail URL"
        subtitle="Manage and analyze your short link"
        showBackButton={true}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* URL Information */}
          <div className="lg:col-span-2 space-y-6">
            {/* URL Details Card */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi URL</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Asli</label>
                  {isEditing ? (
                    <div className="space-y-3">
                      <input
                        type="url"
                        value={editUrl}
                        onChange={(e) => setEditUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                        disabled={isUpdating}
                      />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Kode Pendek</label>
                        <input
                          type="text"
                          value={editShortCode}
                          onChange={(e) => setEditShortCode(e.target.value)}
                          placeholder="custom-code"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black font-mono"
                          disabled={isUpdating}
                        />
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={updateURL}
                          disabled={isUpdating}
                          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-md font-medium transition-colors"
                        >
                          {isUpdating ? 'Menyimpan...' : 'Simpan'}
                        </button>
                        <button
                          onClick={cancelEditing}
                          disabled={isUpdating}
                          className="bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white px-4 py-2 rounded-md font-medium transition-colors"
                        >
                          Batal
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="bg-gray-50 p-3 rounded-md flex-1">
                        <p className="text-sm text-gray-900 break-all">{urlStats.original_url}</p>
                      </div>
                      <button
                        onClick={startEditing}
                        className="ml-3 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md font-medium transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL Pendek</label>
                  <div className="flex items-center space-x-2">
                    <div className="bg-gray-50 p-3 rounded-md flex-1">
                      <p className="text-sm text-blue-600 font-medium">{urlStats.short_url}</p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(urlStats.short_url)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Salin
                    </button>
                    <button
                      onClick={deleteURL}
                      className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kode Pendek</label>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-900 font-mono">{urlStats.short_code}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Total Klik</label>
                    <div className="bg-gray-50 p-3 rounded-md">
                      <p className="text-sm text-gray-900 font-bold">{urlStats.click_count}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dibuat</label>
                  <div className="bg-gray-50 p-3 rounded-md">
                    <p className="text-sm text-gray-900">
                      {new Date(urlStats.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Analytics Overview */}
            {urlStats.analytics && (
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Analytics Overview</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600 font-medium">Total Klik</p>
                    <p className="text-2xl font-bold text-blue-900">{urlStats.analytics.total_clicks}</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600 font-medium">Pengunjung Unik</p>
                    <p className="text-2xl font-bold text-green-900">{urlStats.analytics.unique_visitors}</p>
                  </div>
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <p className="text-sm text-purple-600 font-medium">Rata-rata per Hari</p>
                    <p className="text-2xl font-bold text-purple-900">
                      {urlStats.analytics?.daily_clicks && urlStats.analytics.daily_clicks.length > 0 
                        ? Math.round(urlStats.analytics.total_clicks / urlStats.analytics.daily_clicks.length)
                        : 0}
                    </p>
                  </div>
                </div>

                {/* Top Countries */}
                {urlStats.analytics?.top_countries && urlStats.analytics.top_countries.length > 0 && (
                  <div className="mb-6">
                    <h3 className="text-md font-medium text-gray-900 mb-3">Negara Teratas</h3>
                    <div className="space-y-2">
                      {urlStats.analytics.top_countries.map((country, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{country.country}</span>
                          <div className="flex items-center space-x-2">
                            <div className="bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${(country.count / urlStats.analytics!.total_clicks) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{country.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Devices */}
                {urlStats.analytics?.top_devices && urlStats.analytics.top_devices.length > 0 && (
                  <div>
                    <h3 className="text-md font-medium text-gray-900 mb-3">Perangkat Teratas</h3>
                    <div className="space-y-2">
                      {urlStats.analytics.top_devices.map((device, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{device.device}</span>
                          <div className="flex items-center space-x-2">
                            <div className="bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full"
                                style={{ width: `${(device.count / urlStats.analytics!.total_clicks) * 100}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">{device.count}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* QR Code Section */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">QR Code</h2>
              
              {qrCode ? (
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
                    <button
                      onClick={downloadQR}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                    >
                      Download QR
                    </button>
                    <button
                      onClick={() => copyToClipboard(urlStats?.short_url || '')}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                    >
                      Salin Link
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Membuat QR Code...</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Aksi Cepat</h2>
              
              <div className="space-y-3">
                <button
                  onClick={() => copyToClipboard(urlStats.short_url)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Salin URL Pendek
                </button>
                <button
                  onClick={() => copyToClipboard(urlStats.original_url)}
                  className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                >
                  Salin URL Asli
                </button>
                <Link
                  href={urlStats.short_url || '#'}
                  target="_blank"
                  className="block w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium text-center transition-colors"
                >
                  Buka URL
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
