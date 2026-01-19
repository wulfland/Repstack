/**
 * Card component for an exercise in an active workout
 * Shows sets, allows logging, and displays previous performance
 */

import { useState } from 'react';
import type { Exercise, WorkoutExercise, WorkoutSet } from '../../types/models';
import { usePreviousPerformance } from '../../hooks/usePreviousPerformance';
import SetLogger from './SetLogger';
import PreviousPerformance from './PreviousPerformance';
import ConfirmDialog from '../common/ConfirmDialog';
import './WorkoutExerciseCard.css';

interface WorkoutExerciseCardProps {
  exercise: Exercise;
  workoutExercise: WorkoutExercise;
  exerciseNumber: number;
  onAddSet: () => void;
  onRemoveSet: (setId: string) => void;
  onUpdateSet: (setId: string, updates: Partial<WorkoutSet>) => void;
  onUpdateNotes: (notes: string) => void;
  onRemoveExercise: () => void;
  onSetComplete: () => void;
}

export default function WorkoutExerciseCard({
  exercise,
  workoutExercise,
  exerciseNumber,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
  onUpdateNotes,
  onRemoveExercise,
  onSetComplete,
}: WorkoutExerciseCardProps) {
  const [showNotes, setShowNotes] = useState(false);
  const [showPrevious, setShowPrevious] = useState(false);
  const [showRemoveDialog, setShowRemoveDialog] = useState(false);
  const previousPerformance = usePreviousPerformance(exercise.id);

  const handleRemoveExercise = () => {
    setShowRemoveDialog(true);
  };

  const confirmRemoveExercise = () => {
    onRemoveExercise();
    setShowRemoveDialog(false);
  };

  return (
    <div className="workout-exercise-card">
      <div className="workout-exercise-header">
        <div className="workout-exercise-title">
          <span className="exercise-number">{exerciseNumber}</span>
          <h3>{exercise.name}</h3>
        </div>
        <div className="workout-exercise-actions">
          {previousPerformance && (
            <button
              onClick={() => setShowPrevious(!showPrevious)}
              className="btn-icon"
              title="View previous performance"
              aria-label="View previous performance"
            >
              📊
            </button>
          )}
          <button
            onClick={() => setShowNotes(!showNotes)}
            className="btn-icon"
            title="Add notes"
            aria-label="Add notes"
          >
            📝
          </button>
          <button
            onClick={handleRemoveExercise}
            className="btn-icon btn-icon-danger"
            title="Remove exercise"
            aria-label="Remove exercise"
          >
            🗑️
          </button>
        </div>
      </div>

      {showPrevious && previousPerformance && (
        <PreviousPerformance
          date={previousPerformance.date}
          sets={previousPerformance.sets}
        />
      )}

      <div className="workout-sets">
        <div className="sets-header">
          <span className="set-col-header">Set</span>
          <span className="set-col-header">Previous</span>
          <span className="set-col-header">Weight</span>
          <span className="set-col-header">Reps</span>
          <span className="set-col-header">RIR</span>
          <span className="set-col-header"></span>
        </div>

        {workoutExercise.sets.map((set, index) => (
          <SetLogger
            key={set.id}
            set={set}
            setNumber={index + 1}
            previousSet={previousPerformance?.sets[index]}
            onUpdate={(updates) => onUpdateSet(set.id, updates)}
            onRemove={() => onRemoveSet(set.id)}
            onComplete={onSetComplete}
          />
        ))}

        <button onClick={onAddSet} className="btn-add-set">
          + Add Set
        </button>
      </div>

      {showNotes && (
        <div className="exercise-notes-input">
          <textarea
            value={workoutExercise.notes || ''}
            onChange={(e) => onUpdateNotes(e.target.value)}
            placeholder="Add notes for this exercise..."
            rows={2}
          />
        </div>
      )}

      {showRemoveDialog && (
        <ConfirmDialog
          title="Remove Exercise?"
          message={`Remove ${exercise.name} from this workout? This cannot be undone.`}
          confirmLabel="Remove"
          cancelLabel="Cancel"
          onConfirm={confirmRemoveExercise}
          onCancel={() => setShowRemoveDialog(false)}
          variant="danger"
        />
      )}
    </div>
  );
}
