/**
 * Component for logging a single set
 * Provides large touch-friendly inputs for gym use
 */

import { useState } from 'react';
import type { WorkoutSet } from '../../types/models';
import './SetLogger.css';

interface SetLoggerProps {
  set: WorkoutSet;
  setNumber: number;
  previousSet?: WorkoutSet;
  onUpdate: (updates: Partial<WorkoutSet>) => void;
  onRemove: () => void;
  onComplete: () => void;
}

export default function SetLogger({
  set,
  setNumber,
  previousSet,
  onUpdate,
  onRemove,
  onComplete,
}: SetLoggerProps) {
  const [showRIR, setShowRIR] = useState(false);

  const handleWeightChange = (value: string) => {
    const weight = parseFloat(value) || 0;
    onUpdate({ weight });
  };

  const handleRepsChange = (value: string) => {
    const reps = parseInt(value) || 0;
    onUpdate({ actualReps: reps });
  };

  const handleRIRChange = (value: string) => {
    const rir = value === '' ? undefined : parseInt(value) || 0;
    onUpdate({ rir });
  };

  const canComplete = set.actualReps !== undefined && set.actualReps > 0;

  const handleComplete = () => {
    if (!canComplete) {
      return;
    }

    onUpdate({ completed: true });
    onComplete();
  };

  const handleUncomplete = () => {
    onUpdate({ completed: false });
  };

  return (
    <div
      className={`set-logger ${set.completed ? 'completed' : ''}`}
      role="group"
      aria-label={`Set ${setNumber}${set.completed ? ' - completed' : ''}`}
    >
      <div className="set-number" aria-hidden="true">
        {setNumber}
      </div>

      <div className="set-previous" aria-label="Previous performance">
        {previousSet ? (
          <span className="previous-data">
            {previousSet.weight} ×{' '}
            {previousSet.actualReps || previousSet.targetReps}
          </span>
        ) : (
          <span className="no-previous">-</span>
        )}
      </div>

      <div className="set-weight">
        <input
          type="number"
          value={set.weight || ''}
          onChange={(e) => handleWeightChange(e.target.value)}
          placeholder="0"
          className="set-input weight-input"
          disabled={set.completed}
          inputMode="decimal"
          step="2.5"
          aria-label={`Weight for set ${setNumber}`}
        />
      </div>

      <div className="set-reps">
        <input
          type="number"
          value={set.actualReps ?? ''}
          onChange={(e) => handleRepsChange(e.target.value)}
          placeholder={set.targetReps.toString()}
          className="set-input reps-input"
          disabled={set.completed}
          inputMode="numeric"
          aria-label={`Reps for set ${setNumber}, target ${set.targetReps}`}
        />
      </div>

      <div className="set-rir">
        {showRIR || set.rir !== undefined ? (
          <input
            type="number"
            value={set.rir ?? ''}
            onChange={(e) => handleRIRChange(e.target.value)}
            placeholder="0"
            className="set-input rir-input"
            disabled={set.completed}
            min="0"
            max="10"
            inputMode="numeric"
            aria-label={`Reps in reserve for set ${setNumber}`}
          />
        ) : (
          <button
            onClick={() => setShowRIR(true)}
            className="btn-add-rir"
            disabled={set.completed}
            aria-label="Add reps in reserve"
          >
            +
          </button>
        )}
      </div>

      <div className="set-actions">
        {!set.completed ? (
          <>
            <button
              onClick={handleComplete}
              className={`btn-complete-set ${canComplete ? 'ready' : ''}`}
              aria-label={
                canComplete
                  ? 'Complete set and start rest timer'
                  : 'Enter reps to complete set'
              }
              disabled={!canComplete}
            >
              <span aria-hidden="true">✓</span>
            </button>
            <button
              onClick={onRemove}
              className="btn-remove-set"
              aria-label={`Remove set ${setNumber}`}
            >
              <span aria-hidden="true">✕</span>
            </button>
          </>
        ) : (
          <button
            onClick={handleUncomplete}
            className="btn-uncomplete-set"
            aria-label={`Edit set ${setNumber}`}
          >
            <span aria-hidden="true">✏️</span>
          </button>
        )}
      </div>
    </div>
  );
}
