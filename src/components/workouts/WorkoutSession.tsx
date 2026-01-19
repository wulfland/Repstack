/**
 * Main workout session page component
 * Handles active workout logging and tracking
 */

import { useState } from 'react';
import { useWorkoutSession } from '../../hooks/useWorkoutSession';
import { useExercises } from '../../hooks/useDatabase';
import ExerciseSelector from './ExerciseSelector';
import WorkoutExerciseCard from './WorkoutExerciseCard';
import RestTimer from './RestTimer';
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
  } = useWorkoutSession();

  const exercises = useExercises();
  const [showExerciseSelector, setShowExerciseSelector] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showRestTimer, setShowRestTimer] = useState(false);

  const handleStartWorkout = () => {
    startWorkout();
  };

  const handleEndWorkout = async () => {
    if (!workout || workout.exercises.length === 0) {
      alert('Please add at least one exercise before ending the workout.');
      return;
    }

    await endWorkout();
    alert('Workout saved successfully!');
  };

  const handleCancelWorkout = () => {
    setShowCancelDialog(true);
  };

  const confirmCancelWorkout = () => {
    cancelWorkout();
    setShowCancelDialog(false);
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
          <button onClick={handleStartWorkout} className="btn-primary btn-large">
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
            <p>No exercises added yet. Add your first exercise to get started!</p>
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
              onRemoveExercise={() => removeExercise(workoutExercise.exerciseId)}
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
        <div className="dialog-overlay" onClick={() => setShowCancelDialog(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <h2>Cancel Workout?</h2>
            <p>
              Are you sure you want to cancel this workout? All unsaved progress
              will be lost.
            </p>
            <div className="dialog-actions">
              <button
                onClick={() => setShowCancelDialog(false)}
                className="btn-secondary"
              >
                Keep Training
              </button>
              <button onClick={confirmCancelWorkout} className="btn-danger">
                Cancel Workout
              </button>
            </div>
          </div>
        </div>
      )}

      {showRestTimer && (
        <RestTimer onClose={() => setShowRestTimer(false)} />
      )}
    </div>
  );
}
