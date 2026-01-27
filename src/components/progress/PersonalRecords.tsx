import { useState, useMemo } from 'react';
import { useWorkouts, useExercises } from '../../hooks/useDatabase';
import { findPersonalRecords } from '../../lib/progressTracking';
import './PersonalRecords.css';

export default function PersonalRecords() {
  const workouts = useWorkouts();
  const exercises = useExercises();
  const [selectedExercise, setSelectedExercise] = useState<string>('');

  // Filter exercises that have workout history
  const exercisesWithHistory = useMemo(() => {
    if (!exercises || !workouts) return [];

    return exercises.filter(exercise => {
      return workouts.some(w =>
        w.completed && w.exercises.some(ex => ex.exerciseId === exercise.id)
      );
    });
  }, [exercises, workouts]);

  const personalRecords = useMemo(() => {
    if (!workouts || !selectedExercise) return [];
    return findPersonalRecords(workouts, selectedExercise);
  }, [workouts, selectedExercise]);

  const selectedExerciseData = useMemo(() => {
    if (!exercises || !selectedExercise) return null;
    return exercises.find(ex => ex.id === selectedExercise);
  }, [exercises, selectedExercise]);

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  if (!workouts || !exercises) {
    return <div className="loading">Loading personal records...</div>;
  }

  return (
    <div className="personal-records">
      <h2>Personal Records</h2>

      <div className="pr-controls">
        <label htmlFor="exercise-select">Select Exercise:</label>
        <select
          id="exercise-select"
          value={selectedExercise}
          onChange={e => setSelectedExercise(e.target.value)}
          className="exercise-select"
        >
          <option value="">-- Choose an exercise --</option>
          {exercisesWithHistory.map(ex => (
            <option key={ex.id} value={ex.id}>
              {ex.name}
            </option>
          ))}
        </select>
      </div>

      {!selectedExercise ? (
        <div className="empty-state">
          <p>Select an exercise to view personal records</p>
        </div>
      ) : personalRecords.length === 0 ? (
        <div className="empty-state">
          <p>No personal records found for this exercise</p>
          <p>Complete some workouts to start tracking your PRs!</p>
        </div>
      ) : (
        <>
          {selectedExerciseData && (
            <div className="exercise-info">
              <h3>{selectedExerciseData.name}</h3>
              <div className="exercise-meta">
                <span className="exercise-category">
                  {selectedExerciseData.category}
                </span>
                <span className="exercise-muscles">
                  {selectedExerciseData.muscleGroups
                    .map(mg => mg.charAt(0).toUpperCase() + mg.slice(1))
                    .join(', ')}
                </span>
              </div>
            </div>
          )}

          <div className="pr-table">
            <div className="pr-table-header">
              <span>Rep Range</span>
              <span>Weight</span>
              <span>Reps</span>
              <span>Est. 1RM</span>
              <span>Date Achieved</span>
            </div>
            {personalRecords.map(pr => (
              <div key={pr.repRange} className="pr-table-row">
                <span className="pr-rep-range">{pr.repRange}</span>
                <span className="pr-weight">{pr.weight} kg</span>
                <span className="pr-reps">{pr.reps}</span>
                <span className="pr-one-rm">{Math.round(pr.estimatedOneRM)} kg</span>
                <span className="pr-date">{formatDate(pr.date)}</span>
              </div>
            ))}
          </div>

          <div className="pr-info">
            <h4>About 1RM Estimates</h4>
            <p>
              One-rep max (1RM) estimates are calculated using the Epley formula:
              <br />
              <strong>1RM = weight × (1 + reps / 30)</strong>
            </p>
            <p className="pr-note">
              Note: These are estimates. Actual 1RM values may vary based on technique,
              recovery, and other factors.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
