'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import Header from '../components/Header';
import CreateURLForm from '../components/CreateURLForm';
import URLTable from '../components/URLTable';
import Pagination from '../components/Pagination';
import QRModal from '../components/QRModal';
import Alert from '../components/Alert';
import ConfirmationDialog, { useConfirmation } from '../components/ConfirmationDialog';

interface URL {
  id: number;
  original_url: string;
  short_code: string;
  short_url: string;
  click_count: number;
  created_at: string;
  qr_code?: string;
}

interface AlertState {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  show: boolean;
}

export default function DashboardPage() {
  const [urls, setUrls] = useState<URL[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [creating, setCreating] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedQR, setSelectedQR] = useState<{ url: string; qrCode: string } | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editOriginalUrl, setEditOriginalUrl] = useState('');
  const [editShortCode, setEditShortCode] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [alert, setAlert] = useState<AlertState | null>(null);
  const { confirmation, showConfirmation, hideConfirmation } = useConfirmation();

  // Helper functions for alerts
  const showAlert = (type: 'success' | 'error' | 'warning' | 'info', message: string, duration = 5000) => {
    setAlert({ type, message, show: true });
    if (duration > 0) {
      setTimeout(() => {
        setAlert(null);
      }, duration);
    }
  };

  const hideAlert = () => {
    setAlert(null);
  };
  const [pagination, setPagination] = useState({
    currentPage: 1,
    perPage: 5,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.location.href = '/login';
      return;
    }
    fetchUrls();
  }, []);

  // Generate QR Code for a URL
  const generateQRCode = async (shortUrl: string): Promise<string> => {
    try {
      return await QRCode.toDataURL(shortUrl, {
        width: 400,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF',
        },
        errorCorrectionLevel: 'H',
      });
    } catch (err) {
      console.error('Error generating QR code:', err);
      return '';
    }
  };

  // Fetch URLs from backend
  const fetchUrls = async (page: number = 1) => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:3000/api/urls?page=${page}&limit=${pagination.perPage}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch URLs');
      }

      const data = await response.json();
      console.log('API Response:', data); // Debug log
      
      if (data.status && data.data) {
        // Generate QR codes for each URL
        const urlsWithQR = await Promise.all(
          data.data.urls.map(async (url: URL) => {
            return {
              ...url,
              qr_code: await generateQRCode(url.short_url),
            };
          })
        );
        setUrls(urlsWithQR);
        
        // Ensure pagination values are numbers
        const paginationData = {
          currentPage: Number(data.data.pagination.current_page) || 1,
          perPage: Number(data.data.pagination.per_page) || 10,
          total: Number(data.data.pagination.total) || 0,
          totalPages: Number(data.data.pagination.total_pages) || 0,
          hasNext: Boolean(data.data.pagination.has_next),
          hasPrev: Boolean(data.data.pagination.has_prev),
        };
        
        console.log('Pagination Data:', paginationData); // Debug log
        setPagination(paginationData);
      } else {
        setError('Failed to load URLs');
      }
    } catch (err) {
      setError('Failed to load URLs. Please try again.');
      console.error('Error fetching URLs:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create new short URL
  const createUrl = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUrl.trim()) {
      setError('Please enter a valid URL');
      return;
    }

    try {
      setCreating(true);
      setError('');

      const response = await fetch('http://localhost:3000/api/shorten', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ original_url: newUrl }),
      });

      if (!response.ok) {
        throw new Error('Failed to create short URL');
      }

      const data = await response.json();
      if (data.status && data.data) {
        // Generate QR code for the new URL
        const newUrlWithQR = {
          ...data.data,
          qr_code: await generateQRCode(data.data.short_url),
        };
        setUrls([newUrlWithQR, ...urls]);
        setNewUrl('');
        setShowCreateForm(false);
      } else {
        throw new Error(data.message || 'Failed to create short URL');
      }
    } catch (err) {
      setError('Failed to create short URL. Please try again.');
      console.error('Error creating URL:', err);
    } finally {
      setCreating(false);
    }
  };

  // Delete URL with confirmation
  const deleteUrl = async (id: number) => {
    const confirmed = await showConfirmation({
      title: 'Hapus URL',
      message: 'Apakah Anda yakin ingin menghapus URL ini? Tindakan ini tidak dapat dibatalkan.',
      confirmText: 'Ya, Hapus',
      cancelText: 'Batal',
      type: 'danger'
    });
    
    if (confirmed) {
      try {
        const response = await fetch(`http://localhost:3000/api/urls/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
          },
        });

        if (!response.ok) {
          throw new Error('Failed to delete URL');
        }

        setUrls(urls.filter(url => url.id !== id));
        showAlert('success', 'URL berhasil dihapus!');
      } catch (err) {
        showAlert('error', 'Gagal menghapus URL. Silakan coba lagi.');
        console.error('Error deleting URL:', err);
      }
    }
  };

  // Copy to clipboard
  const copyToClipboard = async (text: string, urlId?: number) => {
    try {
      await navigator.clipboard.writeText(text);
      if (urlId) {
        setCopiedId(urlId);
        // Reset after 2 seconds
        setTimeout(() => setCopiedId(null), 2000);
      }
      showAlert('success', 'Link berhasil disalin ke clipboard!');
    } catch (err) {
      console.error('Failed to copy:', err);
      showAlert('error', 'Gagal menyalin link!');
    }
  };

  // Show QR modal
  const openQRModal = (url: URL) => {
    setSelectedQR({
      url: url.short_url,
      qrCode: url.qr_code || '',
    });
    setShowQRModal(true);
  };

  // Download QR code
  const downloadQRCode = () => {
    if (!selectedQR) return;
    
    const link = document.createElement('a');
    link.href = selectedQR.qrCode;
    link.download = `qrcode-${selectedQR.url.split('/').pop()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Start editing
  const startEditing = (url: URL) => {
    setEditingId(url.id);
    setEditOriginalUrl(url.original_url);
    setEditShortCode(url.short_code);
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditingId(null);
    setEditOriginalUrl('');
    setEditShortCode('');
  };

  // Update URL
  const updateURL = async () => {
    if (!editOriginalUrl.trim()) {
      setError('Original URL tidak boleh kosong');
      return;
    }

    try {
      setIsUpdating(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/urls/${editingId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          original_url: editOriginalUrl.trim(),
          short_code: editShortCode.trim() || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update URL');
      }

      const data = await response.json();
      
      if (data.status && data.data) {
        // Update the URL in the list
        setUrls(urls.map(url => 
          url.id === editingId 
            ? {
                ...url,
                original_url: data.data.original_url,
                short_code: data.data.short_code,
                short_url: data.data.short_url,
                updated_at: data.data.updated_at,
              }
            : url
        ));
        
        // Generate new QR code if short code changed
        if (data.data.short_url) {
          const qrCode = await generateQRCode(data.data.short_url);
          setUrls(urls.map(url => 
            url.id === editingId 
              ? { ...url, qr_code: qrCode }
              : url
          ));
        }
      }

      cancelEditing();
      setError('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <Header 
        title="URL Shortener Dashboard"
        subtitle="Manage your shortened URLs"
        showCreateButton={true}
        onCreateClick={() => setShowCreateForm(!showCreateForm)}
        createButtonText={showCreateForm ? 'Cancel' : 'Create New URL'}
      />

      <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6 py-6">
        {/* Alert Component */}
        {alert && (
          <Alert
            type={alert.type}
            message={alert.message}
            show={alert.show}
            onClose={hideAlert}
          />
        )}

        {/* Create URL Form */}
        <CreateURLForm
          showForm={showCreateForm}
          newUrl={newUrl}
          setNewUrl={setNewUrl}
          creating={creating}
          createUrl={createUrl}
        />

        {/* URLs Table */}
        <URLTable
          urls={urls}
          loading={loading}
          editingId={editingId}
          copiedId={copiedId}
          editOriginalUrl={editOriginalUrl}
          editShortCode={editShortCode}
          isUpdating={isUpdating}
          onEdit={startEditing}
          onCancel={cancelEditing}
          onSave={updateURL}
          onDelete={deleteUrl}
          onCopy={copyToClipboard}
          onViewQR={openQRModal}
          onCreateFirstURL={() => setShowCreateForm(true)}
        />

        {/* Pagination */}
        {urls.length > 0 && (
          <Pagination
            pagination={pagination}
            onPageChange={fetchUrls}
          />
        )}

        {/* QR Code Modal */}
        <QRModal
          show={showQRModal}
          selectedQR={selectedQR}
          onClose={() => setShowQRModal(false)}
          onCopy={copyToClipboard}
          onDownload={downloadQRCode}
        />

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
    </div>
  );
}
