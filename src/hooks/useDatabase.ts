/**
 * React hooks for interacting with the database
 * Provides reactive queries and CRUD operations
 */

import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import type { Exercise, Workout, Mesocycle } from '../types/models';

// Re-export service functions for convenience
export {
  createUserProfile,
  getUserProfile,
  getAllUserProfiles,
  updateUserProfile,
  deleteUserProfile,
  createExercise,
  getExercise,
  getAllExercises,
  getExercisesByCategory,
  getCustomExercises,
  updateExercise,
  deleteExercise,
  createWorkout,
  getWorkout,
  getAllWorkouts,
  getWorkoutsByDateRange,
  getCompletedWorkouts,
  updateWorkout,
  deleteWorkout,
  createWorkoutSet,
  getWorkoutSet,
  getWorkoutSetsByExercise,
  updateWorkoutSet,
  deleteWorkoutSet,
  createTrainingSession,
  getTrainingSession,
  getTrainingSessionsByWorkout,
  getTrainingSessionsByExercise,
  updateTrainingSession,
  deleteTrainingSession,
  createMesocycle,
  getMesocycle,
  getAllMesocycles,
  getActiveMesocycle,
  getMesocyclesByStatus,
  updateMesocycle,
  deleteMesocycle,
  clearAllData,
  exportData,
  importData,
} from '../db/service';

// Re-export types for convenience
export type {
  UserProfile,
  Exercise,
  Workout,
  WorkoutSet,
  TrainingSession,
  Mesocycle,
  MuscleGroup,
} from '../types/models';

// ===== Reactive Hooks using useLiveQuery =====

/**
 * Get all user profiles with live updates
 */
export function useUserProfiles() {
  return useLiveQuery(() => db.userProfiles.toArray());
}

/**
 * Get a specific user profile by ID with live updates
 */
export function useUserProfile(id: string | undefined) {
  return useLiveQuery(() => {
    if (!id) return undefined;
    return db.userProfiles.get(id);
  }, [id]);
}

/**
 * Get all exercises with live updates
 */
export function useExercises() {
  return useLiveQuery(() => db.exercises.orderBy('name').toArray());
}

/**
 * Get a specific exercise by ID with live updates
 */
export function useExercise(id: string | undefined) {
  return useLiveQuery(() => {
    if (!id) return undefined;
    return db.exercises.get(id);
  }, [id]);
}

/**
 * Get exercises by category with live updates
 */
export function useExercisesByCategory(category: Exercise['category']) {
  return useLiveQuery(
    () => db.exercises.where('category').equals(category).toArray(),
    [category]
  );
}

/**
 * Get custom exercises with live updates
 */
export function useCustomExercises() {
  return useLiveQuery(() =>
    db.exercises.filter(exercise => exercise.isCustom === true).toArray()
  );
}

/**
 * Get all workouts sorted by date (most recent first) with live updates
 */
export function useWorkouts() {
  return useLiveQuery(() => db.workouts.orderBy('date').reverse().toArray());
}

/**
 * Get a specific workout by ID with live updates
 */
export function useWorkout(id: string | undefined) {
  return useLiveQuery(() => {
    if (!id) return undefined;
    return db.workouts.get(id);
  }, [id]);
}

/**
 * Get workouts within a date range with live updates
 */
export function useWorkoutsByDateRange(startDate: Date, endDate: Date) {
  return useLiveQuery(
    () =>
      db.workouts
        .where('date')
        .between(startDate, endDate, true, true)
        .reverse()
        .toArray(),
    [startDate, endDate]
  );
}

/**
 * Get completed workouts with live updates
 */
export function useCompletedWorkouts() {
  return useLiveQuery(async () => {
    const workouts = await db.workouts
      .filter(workout => workout.completed === true)
      .toArray();
    return workouts.sort((a, b) => b.date.getTime() - a.date.getTime());
  });
}

/**
 * Get workout sets for a specific exercise with live updates
 */
export function useWorkoutSetsByExercise(exerciseId: string | undefined) {
  return useLiveQuery(() => {
    if (!exerciseId) return [];
    return db.workoutSets.where('exerciseId').equals(exerciseId).toArray();
  }, [exerciseId]);
}

/**
 * Get training sessions for a specific workout with live updates
 */
export function useTrainingSessionsByWorkout(workoutId: string | undefined) {
  return useLiveQuery(() => {
    if (!workoutId) return [];
    return db.trainingSessions.where('workoutId').equals(workoutId).toArray();
  }, [workoutId]);
}

/**
 * Get training sessions for a specific exercise with live updates
 */
export function useTrainingSessionsByExercise(exerciseId: string | undefined) {
  return useLiveQuery(() => {
    if (!exerciseId) return [];
    return db.trainingSessions
      .where('exerciseId')
      .equals(exerciseId)
      .reverse()
      .sortBy('date');
  }, [exerciseId]);
}

/**
 * Get all mesocycles sorted by start date with live updates
 */
export function useMesocycles() {
  return useLiveQuery(() =>
    db.mesocycles.orderBy('startDate').reverse().toArray()
  );
}

/**
 * Get a specific mesocycle by ID with live updates
 */
export function useMesocycle(id: string | undefined) {
  return useLiveQuery(() => {
    if (!id) return undefined;
    return db.mesocycles.get(id);
  }, [id]);
}

/**
 * Get the active mesocycle with live updates
 */
export function useActiveMesocycle() {
  return useLiveQuery(() =>
    db.mesocycles.where('status').equals('active').first()
  );
}

/**
 * Get mesocycles by status with live updates
 */
export function useMesocyclesByStatus(status: Mesocycle['status']) {
  return useLiveQuery(
    () =>
      db.mesocycles
        .where('status')
        .equals(status)
        .reverse()
        .sortBy('startDate'),
    [status]
  );
}

// ===== Legacy compatibility functions =====
// These maintain backwards compatibility with existing code

/**
 * @deprecated Use createExercise instead
 */
export async function addExercise(
  exercise: Omit<Exercise, 'id' | 'createdAt'>
) {
  const { createExercise } = await import('../db/service');
  return createExercise(exercise);
}

/**
 * @deprecated Use createWorkout instead
 */
export async function addWorkout(
  workout: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>
) {
  const { createWorkout } = await import('../db/service');
  return createWorkout(workout);
}

/**
 * @deprecated Use createMesocycle instead
 */
export async function addMesocycle(
  mesocycle: Omit<Mesocycle, 'id' | 'createdAt' | 'updatedAt'>
) {
  const { createMesocycle } = await import('../db/service');
  return createMesocycle(mesocycle);
}
