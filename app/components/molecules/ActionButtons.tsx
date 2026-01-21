import Button from '../atoms/Button';

interface ActionButtonsProps {
  onCopy?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onSave?: () => void;
  onCancel?: () => void;
  isEditing?: boolean;
  isUpdating?: boolean;
  copyLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
  saveLabel?: string;
  cancelLabel?: string;
}

export default function ActionButtons({
  onCopy,
  onEdit,
  onDelete,
  onSave,
  onCancel,
  isEditing = false,
  isUpdating = false,
  copyLabel = 'Copy',
  editLabel = 'Edit',
  deleteLabel = 'Delete',
  saveLabel = 'Save',
  cancelLabel = 'Cancel'
}: ActionButtonsProps) {
  if (isEditing) {
    return (
      <div className="flex space-x-2">
        <Button
          onClick={onSave}
          disabled={isUpdating}
          variant="primary"
        >
          {isUpdating ? 'Menyimpan...' : saveLabel}
        </Button>
        <Button
          onClick={onCancel}
          disabled={isUpdating}
          variant="secondary"
        >
          {cancelLabel}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex space-x-2">
      {onCopy && (
        <Button onClick={onCopy} variant="primary" size="sm">
          {copyLabel}
        </Button>
      )}
      {onEdit && (
        <Button onClick={onEdit} variant="primary" size="sm">
          {editLabel}
        </Button>
      )}
      {onDelete && (
        <Button onClick={onDelete} variant="danger" size="sm">
          {deleteLabel}
        </Button>
      )}
    </div>
  );
}
