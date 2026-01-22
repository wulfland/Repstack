/**
 * Main workout session page component
 * Handles active workout logging and tracking
 */

import { useState, useMemo } from 'react';
import { useWorkoutSession } from '../../hooks/useWorkoutSession';
import { useExercises, useActiveMesocycle } from '../../hooks/useDatabase';
import { useToast } from '../../hooks/useToast';
import { getMesocycleWeekDescription } from '../../lib/mesocycleUtils';
import type { WorkoutFeedback as WorkoutFeedbackType, MuscleGroup } from '../../types/models';
import ExerciseSelector from './ExerciseSelector';
import WorkoutExerciseCard from './WorkoutExerciseCard';
import WorkoutFeedback from './WorkoutFeedback';
import RestTimer from './RestTimer';
import ToastContainer from '../common/ToastContainer';
import ConfirmDialog from '../common/ConfirmDialog';
import './WorkoutSession.css';

export default function WorkoutSession() {
  const {
    workout,
    isActive,
    startWorkout,
    endWorkout,
    cancelWorkout,
    addExercise,
    removeExercise,
    addSet,
    removeSet,
    updateSet,
    updateExerciseNotes,
    updateWorkoutNotes,
    updateWorkoutFeedback,
  } = useWorkoutSession();

  const exercises = useExercises();
  const activeMesocycle = useActiveMesocycle();
  const { toasts, showToast, removeToast } = useToast();
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);

  // Memoize mesocycle context to avoid recalculation on every render
  const mesocycleContext = useMemo(() => {
    return activeMesocycle
      ? `${activeMesocycle.name} - ${getMesocycleWeekDescription(activeMesocycle, activeMesocycle.currentWeek)}`
      : null;
  }, [activeMesocycle]);

  // Get all unique muscle groups from workout exercises
  const workoutMuscleGroups = useMemo(() => {
    if (!workout || !exercises) return [];
    
    const muscleGroupSet = new Set<MuscleGroup>();
    workout.exercises.forEach((workoutEx) => {
      const exercise = exercises.find((ex) => ex.id === workoutEx.exerciseId);
      if (exercise) {
        exercise.muscleGroups.forEach((mg) => muscleGroupSet.add(mg));
      }
    });
    
    return Array.from(muscleGroupSet);
  }, [workout, exercises]);

  const handleStartWorkout = () => {
    startWorkout();
  };

  const handleEndWorkout = async () => {
    if (!workout || workout.exercises.length === 0) {
      showToast(
        'Please add at least one exercise before ending the workout.',
        'error'
      );
      return;
    }

    // Show feedback prompt
    setShowFeedback(true);
  };

  const handleFeedbackSubmit = async (feedback: WorkoutFeedbackType) => {
    updateWorkoutFeedback(feedback);
    setShowFeedback(false);
    await endWorkout();
    showToast('Workout saved successfully!', 'success');
  };

  const handleSkipFeedback = async () => {
    setShowFeedback(false);
    await endWorkout();
    showToast('Workout saved successfully!', 'success');
  };

  const handleCancelWorkout = () => {
    setShowCancelDialog(true);
  };

  const confirmCancelWorkout = () => {
    cancelWorkout();
    setShowCancelDialog(false);
    showToast('Workout cancelled', 'info');
  };

  const handleAddExercise = (exerciseId: string) => {
    addExercise(exerciseId);
    setShowExerciseSelector(false);
  };

  const handleSetComplete = () => {
    // Show rest timer when a set is completed
    setShowRestTimer(true);
  };

  if (!isActive) {
    return (
      <div className="workout-session-container">
        <div className="workout-start-screen">
          <h1>Ready to Train?</h1>
          <p>Start a new workout session to log your training.</p>
          {activeMesocycle && (
            <div className="mesocycle-context-banner">
              <span className="banner-icon">📅</span>
              <div>
                <div className="banner-title">{activeMesocycle.name}</div>
                <div className="banner-subtitle">
                  {getMesocycleWeekDescription(
                    activeMesocycle,
                    activeMesocycle.currentWeek
                  )}
                </div>
              </div>
            </div>
          )}
          <button
            onClick={handleStartWorkout}
            className="btn-primary btn-large"
          >
            🏋️ Start Workout
          </button>
        </div>
      </div>
    );
  }

  if (!workout) {
    return null;
  }

  const workoutDuration = Math.round(
    (new Date().getTime() - workout.date.getTime()) / 60000
  );

  return (
    <div className="workout-session-container">
      {mesocycleContext && (
        <div className="mesocycle-context-banner active-workout">
          <span className="banner-icon">📅</span>
          <span className="banner-text">{mesocycleContext}</span>
        </div>
      )}
      <div className="workout-header">
        <div className="workout-header-info">
          <h1>Active Workout</h1>
          <div className="workout-meta">
            <span className="workout-time">⏱️ {workoutDuration} min</span>
            <span className="workout-exercises">
              💪 {workout.exercises.length} exercises
            </span>
          </div>
        </div>
        <div className="workout-header-actions">
          <button onClick={handleCancelWorkout} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleEndWorkout} className="btn-primary">
            Finish Workout
          </button>
        </div>
      </div>

      <div className="workout-content">
        {workout.exercises.length === 0 && (
          <div className="empty-workout-state">
            <p>
              No exercises added yet. Add your first exercise to get started!
            </p>
          </div>
        )}

        {workout.exercises.map((workoutExercise, index) => {
          const exercise = exercises?.find(
            (ex) => ex.id === workoutExercise.exerciseId
          );
          if (!exercise) return null;

          return (
            <WorkoutExerciseCard
              key={workoutExercise.exerciseId}
              exercise={exercise}
              workoutExercise={workoutExercise}
              exerciseNumber={index + 1}
              onAddSet={() => addSet(workoutExercise.exerciseId)}
              onRemoveSet={(setId) =>
                removeSet(workoutExercise.exerciseId, setId)
              }
              onUpdateSet={(setId, updates) =>
                updateSet(workoutExercise.exerciseId, setId, updates)
              }
              onUpdateNotes={(notes) =>
                updateExerciseNotes(workoutExercise.exerciseId, notes)
              }
              onRemoveExercise={() =>
                removeExercise(workoutExercise.exerciseId)
              }
              onSetComplete={handleSetComplete}
            />
          );
        })}

        <button
          onClick={() => setShowExerciseSelector(true)}
          className="btn-add-exercise"
        >
          + Add Exercise
        </button>

        <div className="workout-notes-section">
          <label htmlFor="workout-notes">Workout Notes (optional)</label>
          <textarea
            id="workout-notes"
            value={workout.notes || ''}
            onChange={(e) => updateWorkoutNotes(e.target.value)}
            placeholder="Add notes about your workout..."
            rows={3}
          />
        </div>
      </div>

      {showExerciseSelector && (
        <ExerciseSelector
          exercises={exercises || []}
          selectedExerciseIds={workout.exercises.map((ex) => ex.exerciseId)}
          onSelect={handleAddExercise}
          onClose={() => setShowExerciseSelector(false)}
        />
      )}

      {showCancelDialog && (
        <ConfirmDialog
          title="Cancel Workout?"
          message="Are you sure you want to cancel this workout? All unsaved progress will be lost."
          confirmLabel="Cancel Workout"
          cancelLabel="Keep Training"
          onConfirm={confirmCancelWorkout}
          onCancel={() => setShowCancelDialog(false)}
          variant="danger"
        />
      )}

      {showRestTimer && <RestTimer onClose={() => setShowRestTimer(false)} />}

      {showFeedback && (
        <WorkoutFeedback
          muscleGroups={workoutMuscleGroups}
          onSubmit={handleFeedbackSubmit}
          onSkip={handleSkipFeedback}
        />
      )}

      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
