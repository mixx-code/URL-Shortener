'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Link as LinkIcon, Copy, Edit, Save, X, Eye, Trash2, ExternalLink } from 'lucide-react';

interface URL {
  id: number;
  original_url: string;
  short_code: string;
  short_url: string;
  click_count: number;
  created_at: string;
  qr_code?: string;
}

interface URLTableProps {
  urls: URL[];
  loading: boolean;
  editingId: number | null;
  copiedId: number | null;
  editOriginalUrl: string;
  editShortCode: string;
  isUpdating: boolean;
  onEdit: (url: URL) => void;
  onCancel: () => void;
  onSave: () => void;
  onDelete: (id: number) => void;
  onCopy: (text: string, id?: number) => void;
  onViewQR: (url: URL) => void;
  onCreateFirstURL?: () => void;
}

export default function URLTable({
  urls,
  loading,
  editingId,
  copiedId,
  editOriginalUrl,
  editShortCode,
  isUpdating,
  onEdit,
  onCancel,
  onSave,
  onDelete,
  onCopy,
  onViewQR,
  onCreateFirstURL
}: URLTableProps) {
  if (loading) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full mb-3">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        </div>
        <p className="text-gray-600 font-medium text-sm">Loading your URLs...</p>
      </div>
    );
  }

  if (urls.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full mb-3">
          <LinkIcon className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="text-base font-semibold text-gray-900 mb-2">No URLs yet</h3>
        <p className="text-gray-600 mb-4 text-sm">Create your first short URL to get started!</p>
        <button
          onClick={onCreateFirstURL}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
        >
          Create Your First URL
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200">
        <h3 className="text-base font-semibold text-gray-900">Your URLs</h3>
        <p className="text-xs text-gray-500 mt-1">Manage and track your shortened links</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[500px] table-fixed">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-40 sm:w-48">
                Short URL
              </th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-20 sm:w-24">
                QR Code
              </th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-16 sm:w-20">
                Clicks
              </th>
              <th className="hidden sm:table-cell px-3 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider w-24 sm:w-28">
                Created
              </th>
              <th className="px-3 py-2 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider w-32 sm:w-40">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {urls.map((url) => (
              <tr key={url.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-3 py-2">
                  {editingId === url.id ? (
                    <div className="space-y-2 ">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">Original URL</label>
                        <input
                          type="url"
                          value={editOriginalUrl}
                          onChange={(e) => {}}
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
                          onChange={(e) => {}}
                          placeholder="custom-code"
                          className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-black font-mono"
                          disabled={isUpdating}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start space-x-2 sm:space-x-3">
                      <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-green-100 rounded-lg flex items-center justify-center">
                        <LinkIcon className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-xs sm:text-sm font-medium text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1 sm:gap-2" title={url.short_url}>
                            <span className="truncate max-w-[120px] sm:max-w-[280px]">{url.short_url}</span>
                            <button
                              onClick={() => onCopy(url.short_url, url.id)}
                              className="inline-flex items-center px-1 sm:px-2 py-1 text-xs font-medium transition-colors rounded flex-shrink-0"
                            >
                              {copiedId === url.id ? (
                                <Copy className="w-3 h-3 text-green-600" />
                              ) : (
                                <Copy className="w-3 h-3 text-blue-700" />
                              )}
                            </button>
                          </p>
                        </div>
                        <p className="text-xs text-gray-500 font-mono mb-1">
                          {url.short_code}
                        </p>
                        <p className="text-xs text-gray-400 truncate max-w-[100px] sm:max-w-xs" title={url.original_url}>
                          {url.original_url}
                        </p>
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-3 py-2 text-center">
                  {url.qr_code ? (
                    <div className="inline-flex flex-col items-center space-y-1 sm:space-y-2">
                      <img 
                        src={url.qr_code} 
                        alt="QR Code" 
                        className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-blue-400 hover:shadow-md transition-all"
                        onClick={() => onViewQR(url)}
                      />
                      <button
                        onClick={() => onViewQR(url)}
                        className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                      >
                        View
                      </button>
                    </div>
                  ) : (
                    <div className="w-10 h-10 sm:w-12 sm:h-12 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                      <div className="w-4 h-4 sm:w-6 sm:h-6 text-gray-400">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 0h-6a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V6a2 2 0 00-2-2h-6a2 2 0 00-2-2v-3a1 1 0 00-1-1h3a1 1 0 001 1v3a1 1 0 001 1H6a1 1 0 00-1-1z" />
                        </svg>
                      </div>
                    </div>
                  )}
                </td>
                <td className="px-3 py-2 text-center">
                  <div className="inline-flex items-center px-2 sm:px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                    {url.click_count}
                  </div>
                </td>
                <td className="hidden sm:table-cell px-3 py-2">
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
                <td className="px-3 py-2">
                  <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                    {editingId === url.id ? (
                      <>
                        <button
                          onClick={onSave}
                          disabled={isUpdating}
                          className="inline-flex items-center px-2 sm:px-3 py-1.5 text-xs font-medium text-green-700 bg-green-100 rounded-md hover:bg-green-200 transition-colors disabled:opacity-50"
                        >
                          <Save className="w-3 h-3 mr-1" />
                          <span className="hidden sm:inline">{isUpdating ? 'Saving...' : 'Save'}</span>
                          <span className="sm:hidden">{isUpdating ? '...' : '✓'}</span>
                        </button>
                        <button
                          onClick={onCancel}
                          disabled={isUpdating}
                          className="inline-flex items-center px-2 sm:px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                          <X className="w-3 h-3 mr-1" />
                          <span className="hidden sm:inline">Cancel</span>
                          <span className="sm:hidden">×</span>
                        </button>
                      </>
                    ) : (
                      <>
                        {/* <button
                          onClick={() => onEdit(url)}
                          className="inline-flex items-center px-2 sm:px-3 py-1.5 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-md hover:bg-yellow-200 transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-3 h-3 sm:mr-1" />
                          <span className="hidden sm:inline">Edit</span>
                        </button> */}
                        <Link
                          href={`/dashboard/${url.short_code}`}
                          className="inline-flex items-center px-2 sm:px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-100 rounded-md hover:bg-blue-200 transition-colors"
                          title="View Details"
                        >
                          <ExternalLink className="w-3 h-3 sm:mr-1" />
                          <span className="hidden sm:inline">Details</span>
                        </Link>
                        <button
                          onClick={() => onDelete(url.id)}
                          className="inline-flex items-center px-2 sm:px-3 py-1.5 text-xs font-medium text-red-700 bg-red-100 rounded-md hover:bg-red-200 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3 sm:mr-1" />
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
  );
}
