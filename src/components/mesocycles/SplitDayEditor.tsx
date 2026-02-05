/**
 * Component for editing exercises in a single split day
 */

import { useState } from 'react';
import type {
  Exercise,
  MesocycleExercise,
  MesocycleSplitDay,
} from '../../types/models';
import ExerciseSelector from '../workouts/ExerciseSelector';
import { isExerciseValidForSplitDay } from '../../lib/splitUtils';
import { getExerciseWorkoutCount } from '../../db/service';
import '../common/shared-dialog.css';
import './SplitDayEditor.css';

const DEFAULT_REST_SECONDS = 90;

interface SplitDayEditorProps {
  splitDay: MesocycleSplitDay;
  exercises: Exercise[];
  onChange: (updatedSplitDay: MesocycleSplitDay) => void;
  mesocycleId?: string; // Optional: if provided, check for exercise history in this mesocycle
  onCopy?: () => void; // Optional: callback to initiate copy operation
  canCopy?: boolean; // Optional: whether copy is available (need multiple splits)
}

export default function SplitDayEditor({
  splitDay,
  exercises,
  onChange,
  mesocycleId,
  onCopy,
  canCopy = false,
}: SplitDayEditorProps) {
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleAddExercise = (exerciseId: string) => {
    const exercise = exercises.find((e) => e.id === exerciseId);
    if (!exercise) return;

    // Validate muscle groups
    if (!isExerciseValidForSplitDay(exercise.muscleGroups, splitDay.name)) {
      alert(
        `Warning: ${exercise.name} may not be appropriate for ${splitDay.name}. The muscle groups don't match the split focus.`
      );
    }

    const newExercise: MesocycleExercise = {
      exerciseId,
      order: splitDay.exercises.length,
      targetSets: 3,
      targetRepsMin: 8,
      targetRepsMax: 12,
    };

    onChange({
      ...splitDay,
      exercises: [...splitDay.exercises, newExercise],
    });

    setShowExerciseSelector(false);
  };

  const handleRemoveExercise = async (index: number) => {
    const exercise = splitDay.exercises[index];

    // Check if this exercise has workout history
    if (mesocycleId) {
      const workoutCount = await getExerciseWorkoutCount(
        exercise.exerciseId,
        mesocycleId
      );

      if (workoutCount > 0) {
        const exerciseName = getExerciseName(exercise.exerciseId);
        if (
          !confirm(
            `Warning: "${exerciseName}" has ${workoutCount} logged workout(s) in this mesocycle.\n\nRemoving this exercise will not delete the workout history, but it will no longer be part of this mesocycle's plan.\n\nContinue?`
          )
        ) {
          return;
        }
      }
    }

    const updatedExercises = splitDay.exercises.filter((_, i) => i !== index);
    // Update order values
    updatedExercises.forEach((ex, i) => {
      ex.order = i;
    });

    onChange({
      ...splitDay,
      exercises: updatedExercises,
    });
  };

  const handleUpdateExercise = (
    index: number,
    updates: Partial<MesocycleExercise>
  ) => {
    const updatedExercises = [...splitDay.exercises];
    updatedExercises[index] = { ...updatedExercises[index], ...updates };

    onChange({
      ...splitDay,
      exercises: updatedExercises,
    });
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const updatedExercises = [...splitDay.exercises];
    const draggedItem = updatedExercises[draggedIndex];

    // Remove from old position
    updatedExercises.splice(draggedIndex, 1);
    // Insert at new position
    updatedExercises.splice(index, 0, draggedItem);

    // Update order values
    updatedExercises.forEach((ex, i) => {
      ex.order = i;
    });

    onChange({
      ...splitDay,
      exercises: updatedExercises,
    });

    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const getExerciseName = (exerciseId: string): string => {
    return exercises.find((e) => e.id === exerciseId)?.name || 'Unknown';
  };

  const selectedExerciseIds = splitDay.exercises.map((e) => e.exerciseId);

  return (
    <div className="split-day-editor">
      <div className="split-day-header">
        <h3>{splitDay.name}</h3>
        <div className="header-actions">
          {canCopy && onCopy && splitDay.exercises.length > 0 && (
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onCopy}
              title="Copy exercises to other split days"
            >
              Copy to...
            </button>
          )}
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setShowExerciseSelector(true)}
          >
            + Add Exercise
          </button>
        </div>
      </div>

      {splitDay.exercises.length === 0 ? (
        <div className="empty-state">
          <p>No exercises added yet.</p>
          <p className="empty-state-hint">
            Click "Add Exercise" to get started.
          </p>
        </div>
      ) : (
        <div className="exercise-list">
          {splitDay.exercises.map((exercise, index) => (
            <div
              key={exercise.exerciseId}
              className={`exercise-item ${draggedIndex === index ? 'dragging' : ''}`}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
            >
              <div className="exercise-drag-handle" title="Drag to reorder">
                ⋮⋮
              </div>

              <div className="exercise-content">
                <div className="exercise-name">
                  {index + 1}. {getExerciseName(exercise.exerciseId)}
                </div>

                <div className="exercise-config">
                  <div className="config-group">
                    <label>Sets</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      value={exercise.targetSets}
                      onChange={(e) =>
                        handleUpdateExercise(index, {
                          targetSets: parseInt(e.target.value, 10),
                        })
                      }
                      className="config-input"
                    />
                  </div>

                  <div className="config-group">
                    <label>Reps</label>
                    <div className="rep-range">
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={exercise.targetRepsMin}
                        onChange={(e) =>
                          handleUpdateExercise(index, {
                            targetRepsMin: parseInt(e.target.value, 10),
                          })
                        }
                        className="config-input"
                      />
                      <span>-</span>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={exercise.targetRepsMax}
                        onChange={(e) =>
                          handleUpdateExercise(index, {
                            targetRepsMax: parseInt(e.target.value, 10),
                          })
                        }
                        className="config-input"
                      />
                    </div>
                  </div>

                  <div className="config-group">
                    <label>Rest (sec)</label>
                    <input
                      type="number"
                      min="0"
                      max="600"
                      step="15"
                      value={exercise.restSeconds ?? DEFAULT_REST_SECONDS}
                      onChange={(e) =>
                        handleUpdateExercise(index, {
                          restSeconds: parseInt(e.target.value, 10),
                        })
                      }
                      className="config-input"
                      placeholder={DEFAULT_REST_SECONDS.toString()}
                    />
                  </div>
                </div>

                {exercise.notes && (
                  <div className="exercise-notes">{exercise.notes}</div>
                )}
              </div>

              <button
                type="button"
                className="btn-remove"
                onClick={() => handleRemoveExercise(index)}
                aria-label="Remove exercise"
                title="Remove exercise"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {showExerciseSelector && (
        <ExerciseSelector
          exercises={exercises}
          selectedExerciseIds={selectedExerciseIds}
          onSelect={handleAddExercise}
          onClose={() => setShowExerciseSelector(false)}
        />
      )}
    </div>
  );
}
