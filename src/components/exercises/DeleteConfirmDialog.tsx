/**
 * Confirmation dialog for deleting exercises
 */

import './DeleteConfirmDialog.css';

interface DeleteConfirmDialogProps {
  isOpen: boolean;
  exerciseName: string;
  hasHistory: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmDialog({
  isOpen,
  exerciseName,
  hasHistory,
  onConfirm,
  onCancel,
}: DeleteConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div className="dialog-content" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2>Delete Exercise</h2>
          <button
            className="dialog-close"
            onClick={onCancel}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>
        <div className="dialog-body">
          <p>
            Are you sure you want to delete <strong>{exerciseName}</strong>?
          </p>
          {hasHistory && (
            <div className="dialog-warning">
              <span className="warning-icon">⚠️</span>
              <p>
                This exercise has workout history. Deleting it will prevent you
                from viewing historical data for this exercise.
              </p>
            </div>
          )}
        </div>
        <div className="dialog-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
