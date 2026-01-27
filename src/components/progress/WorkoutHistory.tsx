import { useState, useMemo } from 'react';
import { useWorkouts, useExercises, useMesocycles } from '../../hooks/useDatabase';
import type { Workout } from '../../types/models';
import { calculateWorkoutVolume } from '../../lib/progressTracking';
import './WorkoutHistory.css';

interface WorkoutHistoryProps {
  onViewWorkout?: (workoutId: string) => void;
}

export default function WorkoutHistory({ onViewWorkout }: WorkoutHistoryProps) {
  const workouts = useWorkouts();
  const exercises = useExercises();
  const mesocycles = useMesocycles();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterExercise, setFilterExercise] = useState<string>('');
  const [filterMuscleGroup, setFilterMuscleGroup] = useState<string>('');
  const [filterMesocycle, setFilterMesocycle] = useState<string>('');
  const [dateRangeStart, setDateRangeStart] = useState<string>('');
  const [dateRangeEnd, setDateRangeEnd] = useState<string>('');

  // Filter workouts based on criteria
  const filteredWorkouts = useMemo(() => {
    if (!workouts) return [];

    let filtered = workouts.filter(w => w.completed);

    // Filter by date range
    if (dateRangeStart) {
      const startDate = new Date(dateRangeStart);
      filtered = filtered.filter(w => w.date >= startDate);
    }
    if (dateRangeEnd) {
      const endDate = new Date(dateRangeEnd);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(w => w.date <= endDate);
    }

    // Filter by mesocycle
    if (filterMesocycle) {
      filtered = filtered.filter(w => w.mesocycleId === filterMesocycle);
    }

    // Filter by exercise
    if (filterExercise) {
      filtered = filtered.filter(w =>
        w.exercises.some(ex => ex.exerciseId === filterExercise)
      );
    }

    // Filter by muscle group
    if (filterMuscleGroup && exercises) {
      filtered = filtered.filter(w =>
        w.exercises.some(ex => {
          const exercise = exercises.find(e => e.id === ex.exerciseId);
          return exercise?.muscleGroups.includes(
            filterMuscleGroup as never
          );
        })
      );
    }

    // Filter by search term (notes)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(w => w.notes?.toLowerCase().includes(term));
    }

    return filtered;
  }, [workouts, exercises, searchTerm, filterExercise, filterMuscleGroup, filterMesocycle, dateRangeStart, dateRangeEnd]);

  const handleClearFilters = () => {
    setSearchTerm('');
    setFilterExercise('');
    setFilterMuscleGroup('');
    setFilterMesocycle('');
    setDateRangeStart('');
    setDateRangeEnd('');
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
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

  const getMesocycleName = (mesocycleId?: string) => {
    if (!mesocycleId || !mesocycles) return '';
    const mesocycle = mesocycles.find(m => m.id === mesocycleId);
    return mesocycle ? mesocycle.name : '';
  };

  const getExerciseCount = (workout: Workout) => {
    return workout.exercises.length;
  };

  const getTotalSets = (workout: Workout) => {
    return workout.exercises.reduce(
      (total, ex) => total + ex.sets.filter(s => s.completed).length,
      0
    );
  };

  if (!workouts || !exercises) {
    return <div className="loading">Loading workout history...</div>;
  }

  return (
    <div className="workout-history">
      <div className="history-header">
        <h2>Workout History</h2>
        <p className="history-count">
          {filteredWorkouts.length} workout{filteredWorkouts.length !== 1 ? 's' : ''}
          {filteredWorkouts.length !== workouts.filter(w => w.completed).length &&
            ` (${workouts.filter(w => w.completed).length} total)`}
        </p>
      </div>

      <div className="history-filters">
        <div className="filter-row">
          <input
            type="text"
            placeholder="Search notes..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="search-input"
          />

          <select
            value={filterExercise}
            onChange={e => setFilterExercise(e.target.value)}
            className="filter-select"
          >
            <option value="">All Exercises</option>
            {exercises.map(ex => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>

          <select
            value={filterMuscleGroup}
            onChange={e => setFilterMuscleGroup(e.target.value)}
            className="filter-select"
          >
            <option value="">All Muscle Groups</option>
            <option value="chest">Chest</option>
            <option value="back">Back</option>
            <option value="shoulders">Shoulders</option>
            <option value="biceps">Biceps</option>
            <option value="triceps">Triceps</option>
            <option value="quads">Quads</option>
            <option value="hamstrings">Hamstrings</option>
            <option value="glutes">Glutes</option>
            <option value="calves">Calves</option>
            <option value="abs">Abs</option>
          </select>

          <select
            value={filterMesocycle}
            onChange={e => setFilterMesocycle(e.target.value)}
            className="filter-select"
          >
            <option value="">All Mesocycles</option>
            {mesocycles?.map(m => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-row">
          <div className="date-filter">
            <label>From:</label>
            <input
              type="date"
              value={dateRangeStart}
              onChange={e => setDateRangeStart(e.target.value)}
              className="date-input"
            />
          </div>

          <div className="date-filter">
            <label>To:</label>
            <input
              type="date"
              value={dateRangeEnd}
              onChange={e => setDateRangeEnd(e.target.value)}
              className="date-input"
            />
          </div>

          <button onClick={handleClearFilters} className="clear-filters-btn">
            Clear Filters
          </button>
        </div>
      </div>

      <div className="history-list">
        {filteredWorkouts.length === 0 ? (
          <div className="empty-state">
            <p>No workouts found matching your filters.</p>
            <p>Try adjusting your filters or start logging workouts!</p>
          </div>
        ) : (
          filteredWorkouts.map(workout => (
            <div
              key={workout.id}
              className="workout-card"
              onClick={() => onViewWorkout?.(workout.id)}
            >
              <div className="workout-card-header">
                <div className="workout-date">
                  <span className="date-text">{formatDate(workout.date)}</span>
                  {workout.mesocycleId && (
                    <span className="mesocycle-badge">
                      {getMesocycleName(workout.mesocycleId)}
                      {workout.weekNumber && ` - Week ${workout.weekNumber}`}
                    </span>
                  )}
                </div>
                <div className="workout-duration">{formatDuration(workout.duration)}</div>
              </div>

              <div className="workout-card-body">
                <div className="workout-stats">
                  <div className="stat">
                    <span className="stat-label">Exercises</span>
                    <span className="stat-value">{getExerciseCount(workout)}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Sets</span>
                    <span className="stat-value">{getTotalSets(workout)}</span>
                  </div>
                  <div className="stat">
                    <span className="stat-label">Volume</span>
                    <span className="stat-value">
                      {Math.round(calculateWorkoutVolume(workout))} kg
                    </span>
                  </div>
                </div>

                <div className="workout-exercises">
                  {workout.exercises.map((ex, idx) => {
                    const exercise = exercises.find(e => e.id === ex.exerciseId);
                    return (
                      <span key={idx} className="exercise-tag">
                        {exercise?.name || 'Unknown'}
                      </span>
                    );
                  })}
                </div>

                {workout.notes && (
                  <div className="workout-notes">
                    <p>{workout.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
