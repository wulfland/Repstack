import { useExercises } from '../../hooks/useDatabase';
import type { Workout } from '../../types/models';
import { calculateSetVolume, calculateExerciseVolume } from '../../lib/progressTracking';
import './WorkoutDetail.css';

interface WorkoutDetailProps {
  workout: Workout;
  onClose: () => void;
}

export default function WorkoutDetail({ workout, onClose }: WorkoutDetailProps) {
  const exercises = useExercises();

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const formatDuration = (minutes?: number) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const getExerciseName = (exerciseId: string) => {
    const exercise = exercises?.find(e => e.id === exerciseId);
    return exercise?.name || 'Unknown Exercise';
  };

  const getTotalSets = () => {
    return workout.exercises.reduce(
      (total, ex) => total + ex.sets.filter(s => s.completed).length,
      0
    );
  };

  const getTotalVolume = () => {
    return workout.exercises.reduce(
      (total, ex) => total + calculateExerciseVolume(ex.sets),
      0
    );
  };

  if (!exercises) {
    return <div className="loading">Loading workout details...</div>;
  }

  return (
    <div className="workout-detail-overlay" onClick={onClose}>
      <div className="workout-detail-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Workout Details</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-content">
          <div className="detail-header">
            <div className="detail-date">{formatDate(workout.date)}</div>
            <div className="detail-stats">
              <div className="detail-stat">
                <span className="detail-stat-label">Duration</span>
                <span className="detail-stat-value">{formatDuration(workout.duration)}</span>
              </div>
              <div className="detail-stat">
                <span className="detail-stat-label">Total Sets</span>
                <span className="detail-stat-value">{getTotalSets()}</span>
              </div>
              <div className="detail-stat">
                <span className="detail-stat-label">Total Volume</span>
                <span className="detail-stat-value">{Math.round(getTotalVolume())} kg</span>
              </div>
            </div>
          </div>

          {workout.notes && (
            <div className="detail-notes">
              <h3>Workout Notes</h3>
              <p>{workout.notes}</p>
            </div>
          )}

          <div className="detail-exercises">
            <h3>Exercises</h3>
            {workout.exercises.map((workoutExercise, exIdx) => {
              const exerciseVolume = calculateExerciseVolume(workoutExercise.sets);
              const completedSets = workoutExercise.sets.filter(s => s.completed);

              return (
                <div key={exIdx} className="exercise-detail">
                  <div className="exercise-detail-header">
                    <h4>{getExerciseName(workoutExercise.exerciseId)}</h4>
                    <div className="exercise-volume">
                      Volume: {Math.round(exerciseVolume)} kg
                    </div>
                  </div>

                  <div className="sets-table">
                    <div className="sets-table-header">
                      <span>Set</span>
                      <span>Weight</span>
                      <span>Reps</span>
                      <span>RIR</span>
                      <span>Volume</span>
                    </div>
                    {completedSets.map((set, setIdx) => {
                      const reps = set.actualReps ?? set.targetReps;
                      const volume = calculateSetVolume(set);

                      return (
                        <div key={set.id} className="sets-table-row">
                          <span className="set-number">{setIdx + 1}</span>
                          <span className="set-weight">{set.weight} kg</span>
                          <span className="set-reps">
                            {set.actualReps !== undefined ? (
                              <>
                                {set.actualReps}
                                {set.actualReps !== set.targetReps && (
                                  <span className="target-reps">
                                    {' '}
                                    (target: {set.targetReps})
                                  </span>
                                )}
                              </>
                            ) : (
                              reps
                            )}
                          </span>
                          <span className="set-rir">{set.rir ?? '-'}</span>
                          <span className="set-volume">{Math.round(volume)} kg</span>
                        </div>
                      );
                    })}
                  </div>

                  {workoutExercise.notes && (
                    <div className="exercise-notes">
                      <strong>Notes:</strong> {workoutExercise.notes}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {workout.feedback && (
            <div className="detail-feedback">
              <h3>Workout Feedback</h3>
              {workout.feedback.overallRecovery && (
                <div className="feedback-item">
                  <strong>Overall Recovery:</strong> {workout.feedback.overallRecovery}
                </div>
              )}
              {workout.feedback.muscleGroupFeedback &&
                workout.feedback.muscleGroupFeedback.length > 0 && (
                  <div className="feedback-item">
                    <strong>Muscle Group Feedback:</strong>
                    <ul>
                      {workout.feedback.muscleGroupFeedback.map((mgf, idx) => (
                        <li key={idx}>
                          {mgf.muscleGroup}: Pump {mgf.pump}/5
                          {mgf.soreness && `, Soreness ${mgf.soreness}/5`}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              {workout.feedback.notes && (
                <div className="feedback-item">
                  <strong>Notes:</strong> {workout.feedback.notes}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="close-footer-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
