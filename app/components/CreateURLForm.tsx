'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';

interface CreateURLFormProps {
  showForm: boolean;
  newUrl: string;
  setNewUrl: (url: string) => void;
  creating: boolean;
  createUrl: (e: React.FormEvent) => void;
}

export default function CreateURLForm({ 
  showForm, 
  newUrl, 
  setNewUrl, 
  creating, 
  createUrl 
}: CreateURLFormProps) {
  if (!showForm) return null;

  return (
    <div className="mb-6 bg-white p-3 sm:p-4 rounded-lg shadow">
      <h2 className="text-base font-medium text-gray-900 mb-3">Create New Short URL</h2>
      <form onSubmit={createUrl} className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
        <input
          type="url"
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="https://example.com/very-long-url"
          className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
          required
        />
        <button
          type="submit"
          disabled={creating}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 text-sm rounded-md font-medium transition-colors w-full sm:w-auto"
        >
          {creating ? 'Creating...' : 'Shorten'}
        </button>
      </form>
    </div>
  );
}
