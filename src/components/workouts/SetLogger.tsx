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
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleWeightChange = (value: string) => {
    const weight = parseFloat(value) || 0;
    onUpdate({ weight });
    setValidationError(null);
  };

  const handleWeightIncrement = (amount: number) => {
    onUpdate({ weight: Math.max(0, set.weight + amount) });
  };

  const handleRepsChange = (value: string) => {
    const reps = parseInt(value) || 0;
    onUpdate({ actualReps: reps });
    setValidationError(null);
  };

  const handleRIRChange = (value: string) => {
    const rir = value === '' ? undefined : parseInt(value) || 0;
    onUpdate({ rir });
  };

  const handleComplete = () => {
    if (!set.actualReps || set.actualReps === 0) {
      setValidationError('Please enter reps completed');
      return;
    }

    onUpdate({ completed: true });
    setValidationError(null);
    onComplete();
  };

  const handleUncomplete = () => {
    onUpdate({ completed: false });
  };

  return (
    <div className={`set-logger ${set.completed ? 'completed' : ''}`}>
      <div className="set-number">{setNumber}</div>

      <div className="set-previous">
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
        <div className="weight-input-group">
          <button
            onClick={() => handleWeightIncrement(-2.5)}
            className="weight-btn weight-btn-decrement"
            disabled={set.completed}
          >
            -2.5
          </button>
          <input
            type="number"
            value={set.weight || ''}
            onChange={(e) => handleWeightChange(e.target.value)}
            placeholder="0"
            className="set-input weight-input"
            disabled={set.completed}
            inputMode="decimal"
            step="0.5"
          />
          <button
            onClick={() => handleWeightIncrement(2.5)}
            className="weight-btn weight-btn-increment"
            disabled={set.completed}
          >
            +2.5
          </button>
        </div>
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
          />
        ) : (
          <button
            onClick={() => setShowRIR(true)}
            className="btn-add-rir"
            disabled={set.completed}
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
              className="btn-complete-set"
              title="Complete set"
            >
              ✓
            </button>
            <button
              onClick={onRemove}
              className="btn-remove-set"
              title="Remove set"
            >
              ✕
            </button>
          </>
        ) : (
          <button
            onClick={handleUncomplete}
            className="btn-uncomplete-set"
            title="Edit set"
          >
            ✏️
          </button>
        )}
      </div>
    </div>
  );
}
