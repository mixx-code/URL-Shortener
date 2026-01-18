'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import QRCode from 'qrcode';
import Header from '../components/Header';

interface URL {
  id: number;
  original_url: string;
  short_code: string;
  short_url: string;
  click_count: number;
  created_at: string;
  qr_code?: string;
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

  // Delete URL
  const deleteUrl = async (id: number) => {
    if (!confirm('Are you sure you want to delete this URL?')) {
      return;
    }

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
    } catch (err) {
      setError('Failed to delete URL. Please try again.');
      console.error('Error deleting URL:', err);
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
      } else {
        alert('Link disalin ke clipboard!');
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Gagal menyalin link!');
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        {/* Create URL Form */}
        {showCreateForm && (
          <div className="mb-8 bg-white p-4 sm:p-6 rounded-lg shadow">
            <h2 className="text-lg font-medium text-gray-900 mb-4">Create New Short URL</h2>
            <form onSubmit={createUrl} className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://example.com/very-long-url"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                required
              />
              <button
                type="submit"
                disabled={creating}
                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2 rounded-md font-medium transition-colors w-full sm:w-auto"
              >
                {creating ? 'Creating...' : 'Shorten'}
              </button>
            </form>
          </div>
        )}

        {/* URLs Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mb-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              </div>
              <p className="text-gray-600 font-medium">Loading your URLs...</p>
            </div>
          ) : urls.length === 0 ? (
            <div className="p-12 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.586 7.414l-4.172 4.172a4 4 0 00-5.656 0l4-4a4 4 0 005.656 0l4.172-4.172a4 4 0 005.656 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No URLs yet</h3>
              <p className="text-gray-600 mb-6">Create your first short URL to get started!</p>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Create Your First URL
              </button>
            </div>
          ) : (
            <div className="overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Your URLs</h3>
                <p className="text-sm text-gray-500 mt-1">Manage and track your shortened links</p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[600px] table-fixed">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-48 sm:w-56">
                        Short URL
                      </th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-24 sm:w-32">
                        QR Code
                      </th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-16 sm:w-24">
                        Clicks
                      </th>
                      <th className="hidden sm:table-cell px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-32">
                        Created
                      </th>
                      <th className="px-4 sm:px-6 py-3 sm:py-4 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-40 sm:w-48">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {urls.map((url, index) => (
                      <tr key={url.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          {editingId === url.id ? (
                            <div className="space-y-2">
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Original URL</label>
                                <input
                                  type="url"
                                  value={editOriginalUrl}
                                  onChange={(e) => setEditOriginalUrl(e.target.value)}
                                  placeholder="https://example.com"
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-black"
                                  disabled={isUpdating}
                                />
                              </div>
                              <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Short Code</label>
                                <input
                                  type="text"
                                  value={editShortCode}
                                  onChange={(e) => setEditShortCode(e.target.value)}
                                  placeholder="custom-code"
                                  className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-black font-mono"
                                  disabled={isUpdating}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-start space-x-2 sm:space-x-3">
                              <div className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                <svg className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m9.032 4.026a9.001 9.001 0 01-7.432 0m9.032-4.026A9.001 9.001 0 0112 3c-4.474 0-8.268 3.12-9.032 7.326m9.032 4.026A9.001 9.001 0 013 12c0-1.605.42-3.113 1.157-4.418" />
                                </svg>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <p className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1 sm:gap-2" title={url.short_url}>
                                    <span className="truncate max-w-[120px] sm:max-w-xs">{url.short_url}</span>
                                    <button
                                      onClick={() => copyToClipboard(url.short_url, url.id)}
                                      className="inline-flex items-center px-1 sm:px-2 py-1 text-xs font-medium transition-colors rounded flex-shrink-0"
                                    >
                                      {copiedId === url.id ? (
                                        <svg className="w-3 h-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                      ) : (
                                        <svg className="w-3 h-3 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                        </svg>
                                      )}
                                    </button>
                                  </p>
                                </div>
                                <p className="text-xs text-gray-500 font-mono mb-1">
                                  {url.short_code}
                                </p>
                                <p className="text-xs text-gray-400 truncate max-w-[120px] sm:max-w-xs" title={url.original_url}>
                                  {url.original_url}
                                </p>
                                <div className="sm:hidden mt-2 text-xs text-gray-500">
                                  Created: {new Date(url.created_at).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </div>
                              </div>
                            </div>
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                          {url.qr_code ? (
                            <div className="inline-flex flex-col items-center space-y-1 sm:space-y-2">
                              <img 
                                src={url.qr_code} 
                                alt="QR Code" 
                                className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 hover:shadow-md transition-all"
                                onClick={() => openQRModal(url)}
                              />
                              <button
                                onClick={() => openQRModal(url)}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                              >
                                View
                              </button>
                            </div>
                          ) : (
                            <div className="w-12 h-12 sm:w-16 sm:h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                              <svg className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 0h-6a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V6a2 2 0 00-2-2h-6a2 2 0 00-2-2v-3a1 1 0 00-1-1h3a1 1 0 001 1v3a1 1 0 001 1H6a1 1 0 00-1-1z" />
                              </svg>
                            </div>
                          )}
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4 text-center">
                          <div className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                            {url.click_count}
                          </div>
                        </td>
                        <td className="hidden sm:table-cell px-6 py-4">
                          <div className="text-sm text-gray-600">
                            {new Date(url.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          <div className="text-xs text-gray-400">
                            {new Date(url.created_at).toLocaleTimeString('en-US', {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </td>
                        <td className="px-4 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                            {editingId === url.id ? (
                              <>
                                <button
                                  onClick={updateURL}
                                  disabled={isUpdating}
                                  className="inline-flex items-center px-2 sm:px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors disabled:opacity-50"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span className="hidden sm:inline">{isUpdating ? 'Saving...' : 'Save'}</span>
                                  <span className="sm:hidden">{isUpdating ? '...' : '✓'}</span>
                                </button>
                                <button
                                  onClick={cancelEditing}
                                  disabled={isUpdating}
                                  className="inline-flex items-center px-2 sm:px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  <span className="hidden sm:inline">Cancel</span>
                                  <span className="sm:hidden">×</span>
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => startEditing(url)}
                                  className="inline-flex items-center px-2 sm:px-3 py-1.5 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-md hover:bg-yellow-200 transition-colors"
                                  title="Edit"
                                >
                                  <svg className="w-3 h-3 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                  <span className="hidden sm:inline">Edit</span>
                                </button>
                                <Link
                                  href={`/dashboard/${url.short_code}`}
                                  className="inline-flex items-center px-2 sm:px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors"
                                  title="Details"
                                >
                                  <svg className="w-3 h-3 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                  </svg>
                                  <span className="hidden sm:inline">Details</span>
                                </Link>
                                <button
                                  onClick={() => deleteUrl(url.id)}
                                  className="inline-flex items-center px-2 sm:px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
                                  title="Delete"
                                >
                                  <svg className="w-3 h-3 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  <span className="hidden sm:inline">Delete</span>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Pagination */}
          {urls.length > 0 && (
            <div className="px-4 sm:px-6 py-4 border-t border-gray-200 text-black">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                <div className="text-sm text-gray-700 text-center sm:text-left">
                  <p>
                    Showing {((pagination.currentPage - 1) * pagination.perPage) + 1} to{' '}
                    {Math.min(pagination.currentPage * pagination.perPage, pagination.total || 0)} of{' '}
                    {pagination.total || 0} results
                  </p>
                </div>
                <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                  <button
                    onClick={() => fetchUrls(pagination.currentPage - 1)}
                    disabled={!pagination.hasPrev}
                    className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={!pagination.hasPrev ? "You're on the first page" : "Go to previous page"}
                  >
                    <span className="hidden sm:inline">Previous</span>
                    <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  
                  <div className="flex items-center space-x-1">
                    {Array.from({ length: Math.max(1, pagination.totalPages) }, (_, i) => i + 1).map((pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => fetchUrls(pageNum)}
                        className={`px-2 sm:px-3 py-1 text-xs sm:text-sm border rounded-md ${
                          pageNum === pagination.currentPage
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-gray-300 hover:bg-gray-50'
                        }`}
                        title={`Go to page ${pageNum}`}
                      >
                        {pageNum}
                      </button>
                    ))}
                  </div>
                  
                  <button
                    onClick={() => fetchUrls(pagination.currentPage + 1)}
                    disabled={!pagination.hasNext}
                    className="px-2 sm:px-3 py-1 text-xs sm:text-sm border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    title={!pagination.hasNext ? "You're on the last page" : "Go to next page"}
                  >
                    <span className="hidden sm:inline">Next</span>
                    <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRModal && selectedQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-4 sm:p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h3 className="text-lg font-semibold text-gray-900">QR Code</h3>
              <button
                onClick={() => setShowQRModal(false)}
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
                    onClick={() => copyToClipboard(selectedQR.url)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm w-full sm:w-auto"
                  >
                    Copy URL
                  </button>
                  <button
                    onClick={downloadQRCode}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors text-sm w-full sm:w-auto"
                  >
                    Download QR
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
