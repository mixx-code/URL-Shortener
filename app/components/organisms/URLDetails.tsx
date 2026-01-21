import { useState } from 'react';
import Card from '../atoms/Card';
import URLInput from '../molecules/URLInput';
import ActionButtons from '../molecules/ActionButtons';

interface URLDetailsProps {
  urlStats: {
    id: number;
    original_url: string;
    short_code: string;
    short_url: string;
    click_count: number;
    created_at: string;
    updated_at: string;
  };
  onUpdate: (originalUrl: string, shortCode?: string) => Promise<void>;
  onDelete: () => Promise<void>;
  onCopy: (text: string) => void;
}

export default function URLDetails({
  urlStats,
  onUpdate,
  onDelete,
  onCopy
}: URLDetailsProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editUrl, setEditUrl] = useState('');
  const [editShortCode, setEditShortCode] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const startEditing = () => {
    setIsEditing(true);
    setEditUrl(urlStats.original_url);
    setEditShortCode(urlStats.short_code);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditUrl('');
    setEditShortCode('');
  };

  const handleUpdate = async () => {
    if (!editUrl.trim()) return;
    
    setIsUpdating(true);
    try {
      await onUpdate(editUrl.trim(), editShortCode.trim() || undefined);
      setIsEditing(false);
      setEditUrl('');
      setEditShortCode('');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <Card>
      <h2 className="text-lg font-semibold text-gray-900 mb-4">URL Details</h2>
      
      <div className="space-y-4">
        <URLInput
          label="URL Original"
          value={isEditing ? editUrl : urlStats.original_url}
          onChange={setEditUrl}
          placeholder="https://example.com"
          disabled={!isEditing}
          id="original-url"
        />

        {isEditing && (
          <URLInput
            label="Short Code"
            value={editShortCode}
            onChange={setEditShortCode}
            placeholder="custom-code"
            disabled={isUpdating}
            id="short-code"
            type="text"
          />
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Short URL</label>
          <div className="flex items-center space-x-2">
            <div className="bg-gray-50 p-3 rounded-md flex-1">
              <p className="text-sm text-blue-600 font-medium">{urlStats.short_url}</p>
            </div>
            <ActionButtons
              onCopy={() => onCopy(urlStats.short_url)}
              onDelete={onDelete}
              isEditing={isEditing}
              isUpdating={isUpdating}
              onEdit={startEditing}
              onSave={handleUpdate}
              onCancel={cancelEditing}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Short Code</label>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-900 font-mono">{urlStats.short_code}</p>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Click Count</label>
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-900 font-bold">{urlStats.click_count}</p>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
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
    </Card>
  );
}
