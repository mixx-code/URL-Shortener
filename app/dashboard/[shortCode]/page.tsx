'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '../../components/Header';
import URLDetails from '../../components/organisms/URLDetails';
import AnalyticsOverview from '../../components/organisms/AnalyticsOverview';
import QRCodeSection from '../../components/organisms/QRCodeSection';
import QuickActions from '../../components/organisms/QuickActions';
import Spinner from '../../components/atoms/Spinner';
import Alert, { useAlert } from '../../components/Alert';
import ConfirmationDialog, { useConfirmation } from '../../components/ConfirmationDialog';

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
  
  // Hooks for alerts and confirmation
  const { alerts, showAlert, removeAlert } = useAlert();
  const { confirmation, showConfirmation } = useConfirmation();

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    fetchURLStats();
  }, [shortCode, router]);


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

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showAlert('success', 'Link berhasil disalin ke clipboard!');
    } catch (err) {
      showAlert('error', 'Gagal menyalin link ke clipboard');
    }
  };

  const deleteURL = async () => {
    const confirmed = await showConfirmation({
      title: 'Hapus URL',
      message: 'Apakah Anda yakin ingin menghapus URL ini? Tindakan ini tidak dapat dibatalkan.',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      type: 'danger'
    });

    if (!confirmed) return;

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

      showAlert('success', 'URL berhasil dihapus!');
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      showAlert('error', 'Gagal menghapus URL: ' + errorMessage);
    }
  };

  const updateURL = async (originalUrl: string, shortCode?: string) => {
    const confirmed = await showConfirmation({
      title: 'Edit URL',
      message: 'Apakah Anda yakin ingin menyimpan perubahan pada URL ini?',
      confirmText: 'Ya, Simpan',
      cancelText: 'Batal',
      type: 'warning'
    });

    if (!confirmed) throw new Error('User cancelled');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/urls/${urlStats?.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          original_url: originalUrl,
          short_code: shortCode,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update URL');
      }

      const data = await response.json();
      
      // Update local state with new data
      if (data.status && data.data) {
        setUrlStats(data.data);
      }

      setError('');
      showAlert('success', 'URL berhasil diperbarui!');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      if (errorMessage !== 'User cancelled') {
        showAlert('error', 'Gagal memperbarui URL: ' + errorMessage);
      }
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Spinner size="lg" className="mx-auto mb-4" />
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
            <URLDetails
              urlStats={urlStats}
              onUpdate={updateURL}
              onDelete={deleteURL}
              onCopy={copyToClipboard}
            />

            {/* Analytics Overview */}
            {urlStats.analytics && (
              <AnalyticsOverview analytics={urlStats.analytics} />
            )}
          </div>

          {/* QR Code Section and Quick Actions */}
          <div className="space-y-6">
            <QRCodeSection
              shortUrl={urlStats.short_url}
              shortCode={urlStats.short_code}
              onCopy={copyToClipboard}
            />

            <QuickActions
              shortUrl={urlStats.short_url}
              originalUrl={urlStats.original_url}
              onCopyShortUrl={() => copyToClipboard(urlStats.short_url)}
              onCopyOriginalUrl={() => copyToClipboard(urlStats.original_url)}
            />
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.map((alert) => (
        <Alert
          key={alert.id}
          type={alert.type}
          message={alert.message}
          onClose={() => removeAlert(alert.id)}
        />
      ))}

      {/* Confirmation Dialog */}
      <ConfirmationDialog
        show={confirmation.show}
        title={confirmation.title}
        message={confirmation.message}
        confirmText={confirmation.confirmText}
        cancelText={confirmation.cancelText}
        type={confirmation.type}
        onConfirm={confirmation.onConfirm || (() => {})}
        onCancel={confirmation.onCancel || (() => {})}
      />
    </div>
  );
}
