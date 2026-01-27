import { useMemo } from 'react';
import { useWorkouts, useExercises } from '../../hooks/useDatabase';
import {
  calculateTrainingStatistics,
  calculateMuscleGroupVolume,
} from '../../lib/progressTracking';
import './ProgressStats.css';

export default function ProgressStats() {
  const workouts = useWorkouts();
  const exercises = useExercises();

  const stats = useMemo(() => {
    if (!workouts) return null;
    return calculateTrainingStatistics(workouts);
  }, [workouts]);

  // Calculate last 7 days muscle group volume
  const weeklyMuscleVolume = useMemo(() => {
    if (!workouts || !exercises) return [];

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    return calculateMuscleGroupVolume(workouts, exercises, startDate, endDate);
  }, [workouts, exercises]);

  // Calculate last 30 days muscle group volume
  const monthlyMuscleVolume = useMemo(() => {
    if (!workouts || !exercises) return [];

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);

    return calculateMuscleGroupVolume(workouts, exercises, startDate, endDate);
  }, [workouts, exercises]);

  const formatDate = (date: Date | null) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  if (!stats || !workouts || !exercises) {
    return <div className="loading">Loading statistics...</div>;
  }

  return (
    <div className="progress-stats">
      <h2>Training Statistics</h2>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🏋️</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalCompletedWorkouts}</div>
            <div className="stat-label">Total Workouts</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💪</div>
          <div className="stat-content">
            <div className="stat-value">{stats.totalSets.toLocaleString()}</div>
            <div className="stat-label">Total Sets</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚖️</div>
          <div className="stat-content">
            <div className="stat-value">
              {Math.round(stats.totalVolume).toLocaleString()} kg
            </div>
            <div className="stat-label">Total Volume</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-value">{stats.workoutsPerWeek.toFixed(1)}</div>
            <div className="stat-label">Workouts/Week</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-content">
            <div className="stat-value">
              {Math.round(stats.averageWorkoutDuration)} min
            </div>
            <div className="stat-label">Avg Duration</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🔥</div>
          <div className="stat-content">
            <div className="stat-value">{stats.currentStreak}</div>
            <div className="stat-label">
              Current Streak{stats.currentStreak !== 1 ? ' Days' : ' Day'}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🏆</div>
          <div className="stat-content">
            <div className="stat-value">{stats.longestStreak}</div>
            <div className="stat-label">
              Longest Streak{stats.longestStreak !== 1 ? ' Days' : ' Day'}
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📆</div>
          <div className="stat-content">
            <div className="stat-value">
              {formatDate(stats.firstWorkoutDate)}
            </div>
            <div className="stat-label">First Workout</div>
          </div>
        </div>
      </div>

      <div className="muscle-volume-section">
        <h3>Volume by Muscle Group (Last 7 Days)</h3>
        <div className="muscle-volume-list">
          {weeklyMuscleVolume.length === 0 ? (
            <p className="no-data">No workout data for the last 7 days.</p>
          ) : (
            weeklyMuscleVolume
              .sort((a, b) => b.volume - a.volume)
              .map((mgv) => (
                <div key={mgv.muscleGroup} className="muscle-volume-item">
                  <div className="muscle-info">
                    <span className="muscle-name">
                      {mgv.muscleGroup.charAt(0).toUpperCase() +
                        mgv.muscleGroup.slice(1)}
                    </span>
                    <span className="muscle-sets">{mgv.sets} sets</span>
                  </div>
                  <div className="muscle-volume-bar">
                    <div
                      className="muscle-volume-fill"
                      style={{
                        width: `${
                          (mgv.volume /
                            Math.max(
                              ...weeklyMuscleVolume.map((m) => m.volume)
                            )) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <div className="muscle-volume-value">
                    {Math.round(mgv.volume).toLocaleString()} kg
                  </div>
                </div>
              ))
          )}
        </div>
      </div>

      <div className="muscle-volume-section">
        <h3>Volume by Muscle Group (Last 30 Days)</h3>
        <div className="muscle-volume-list">
          {monthlyMuscleVolume.length === 0 ? (
            <p className="no-data">No workout data for the last 30 days.</p>
          ) : (
            monthlyMuscleVolume
              .sort((a, b) => b.volume - a.volume)
              .map((mgv) => (
                <div key={mgv.muscleGroup} className="muscle-volume-item">
                  <div className="muscle-info">
                    <span className="muscle-name">
                      {mgv.muscleGroup.charAt(0).toUpperCase() +
                        mgv.muscleGroup.slice(1)}
                    </span>
                    <span className="muscle-sets">{mgv.sets} sets</span>
                  </div>
                  <div className="muscle-volume-bar">
                    <div
                      className="muscle-volume-fill"
                      style={{
                        width: `${
                          (mgv.volume /
                            Math.max(
                              ...monthlyMuscleVolume.map((m) => m.volume)
                            )) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                  <div className="muscle-volume-value">
                    {Math.round(mgv.volume).toLocaleString()} kg
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
