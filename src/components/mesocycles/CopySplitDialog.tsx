/**
 * Dialog for copying exercises from one split day to another
 */

import { useState } from 'react';
import type { MesocycleSplitDay } from '../../types/models';
import './CopySplitDialog.css';

interface CopySplitDialogProps {
  sourceSplitDay: MesocycleSplitDay;
  availableSplitDays: MesocycleSplitDay[];
  onConfirm: (targetSplitDayIds: string[], mode: 'replace' | 'append') => void;
  onCancel: () => void;
}

export default function CopySplitDialog({
  sourceSplitDay,
  availableSplitDays,
  onConfirm,
  onCancel,
}: CopySplitDialogProps) {
  const [selectedTargetIds, setSelectedTargetIds] = useState<string[]>([]);
  const [copyMode, setCopyMode] = useState<'replace' | 'append'>('replace');

  const handleToggleTarget = (targetId: string) => {
    setSelectedTargetIds((prev) =>
      prev.includes(targetId)
        ? prev.filter((id) => id !== targetId)
        : [...prev, targetId]
    );
  };

  const handleConfirm = () => {
    if (selectedTargetIds.length === 0) return;
    onConfirm(selectedTargetIds, copyMode);
  };

  // Filter out the source split day from available targets
  const targetSplitDays = availableSplitDays.filter(
    (day) => day.id !== sourceSplitDay.id
  );

  // Check which targets have exercises
  const targetsWithExercises = targetSplitDays.filter(
    (day) => day.exercises.length > 0
  );

  const hasSelectedTargetsWithExercises = selectedTargetIds.some((id) =>
    targetsWithExercises.find((day) => day.id === id)
  );

  return (
    <div
      className="dialog-overlay"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="copy-dialog-title"
    >
      <div className="copy-split-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="dialog-header">
          <h2 id="copy-dialog-title">Copy Exercises</h2>
          <button
            className="dialog-close"
            onClick={onCancel}
            aria-label="Close dialog"
          >
            ×
          </button>
        </div>

        <div className="dialog-body">
          <p className="dialog-description">
            Copy {sourceSplitDay.exercises.length} exercise
            {sourceSplitDay.exercises.length !== 1 ? 's' : ''} from{' '}
            <strong>{sourceSplitDay.name}</strong> to:
          </p>

          <div className="target-selection">
            {targetSplitDays.map((splitDay) => {
              const isSelected = selectedTargetIds.includes(splitDay.id);
              const hasExercises = splitDay.exercises.length > 0;

              return (
                <label
                  key={splitDay.id}
                  className={`target-option ${isSelected ? 'selected' : ''}`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => handleToggleTarget(splitDay.id)}
                  />
                  <span className="target-name">{splitDay.name}</span>
                  {hasExercises && (
                    <span className="target-badge">
                      {splitDay.exercises.length} exercise
                      {splitDay.exercises.length !== 1 ? 's' : ''}
                    </span>
                  )}
                </label>
              );
            })}
          </div>

          {targetSplitDays.length === 0 && (
            <p className="empty-targets">
              No other split days available to copy to.
            </p>
          )}

          {hasSelectedTargetsWithExercises && (
            <div className="copy-mode-section">
              <p className="copy-mode-label">
                One or more selected targets already have exercises:
              </p>
              <div className="copy-mode-options">
                <label
                  className={`mode-option ${copyMode === 'replace' ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="copyMode"
                    value="replace"
                    checked={copyMode === 'replace'}
                    onChange={() => setCopyMode('replace')}
                  />
                  <div className="mode-content">
                    <strong>Replace</strong>
                    <span className="mode-hint">
                      Remove existing exercises and replace with copied ones
                    </span>
                  </div>
                </label>
                <label
                  className={`mode-option ${copyMode === 'append' ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="copyMode"
                    value="append"
                    checked={copyMode === 'append'}
                    onChange={() => setCopyMode('append')}
                  />
                  <div className="mode-content">
                    <strong>Append</strong>
                    <span className="mode-hint">
                      Add copied exercises after existing ones
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}
        </div>

        <div className="dialog-footer">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleConfirm}
            disabled={selectedTargetIds.length === 0}
          >
            Copy to {selectedTargetIds.length || 0} split
            {selectedTargetIds.length !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </div>
  );
}
