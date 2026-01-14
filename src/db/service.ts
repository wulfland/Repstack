/**
 * Database service layer for CRUD operations
 * Provides type-safe methods for interacting with IndexedDB
 */

import { db } from './index';
import type {
  UserProfile,
  Exercise,
  Workout,
  TrainingSession,
  Mesocycle,
} from '../types/models';
import {
  validateUserProfile,
  validateExercise,
  validateWorkout,
  validateTrainingSession,
  validateMesocycle,
  sanitizeString,
} from '../lib/validation';

// ===== UserProfile CRUD =====

export async function createUserProfile(
  profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const validation = validateUserProfile(profile);
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  const newProfile: UserProfile = {
    id: crypto.randomUUID(),
    name: sanitizeString(profile.name),
    experienceLevel: profile.experienceLevel,
    preferences: profile.preferences,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.userProfiles.add(newProfile);
  return newProfile.id;
}

export async function getUserProfile(
  id: string
): Promise<UserProfile | undefined> {
  return db.userProfiles.get(id);
}

export async function getAllUserProfiles(): Promise<UserProfile[]> {
  return db.userProfiles.toArray();
}

export async function updateUserProfile(
  id: string,
  updates: Partial<Omit<UserProfile, 'id' | 'createdAt'>>
): Promise<void> {
  const existing = await db.userProfiles.get(id);
  if (!existing) {
    throw new Error(`UserProfile with id ${id} not found`);
  }

  const updatedProfile = {
    ...existing,
    ...updates,
    updatedAt: new Date(),
  };

  const validation = validateUserProfile(updatedProfile);
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  if (updatedProfile.name) {
    updatedProfile.name = sanitizeString(updatedProfile.name);
  }

  await db.userProfiles.update(id, updatedProfile);
}

export async function deleteUserProfile(id: string): Promise<void> {
  await db.userProfiles.delete(id);
}

// ===== Exercise CRUD =====

export async function createExercise(
  exercise: Omit<Exercise, 'id' | 'createdAt'>
): Promise<string> {
  const validation = validateExercise(exercise);
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  const newExercise: Exercise = {
    id: crypto.randomUUID(),
    name: sanitizeString(exercise.name),
    category: exercise.category,
    muscleGroups: exercise.muscleGroups,
    equipment: exercise.equipment
      ? sanitizeString(exercise.equipment)
      : undefined,
    notes: exercise.notes ? sanitizeString(exercise.notes) : undefined,
    isCustom: exercise.isCustom,
    createdAt: new Date(),
  };

  await db.exercises.add(newExercise);
  return newExercise.id;
}

export async function getExercise(id: string): Promise<Exercise | undefined> {
  return db.exercises.get(id);
}

export async function getAllExercises(): Promise<Exercise[]> {
  return db.exercises.orderBy('name').toArray();
}

export async function getExercisesByCategory(
  category: Exercise['category']
): Promise<Exercise[]> {
  return db.exercises.where('category').equals(category).toArray();
}

export async function getCustomExercises(): Promise<Exercise[]> {
  return db.exercises
    .filter((exercise) => exercise.isCustom === true)
    .toArray();
}

export async function updateExercise(
  id: string,
  updates: Partial<Omit<Exercise, 'id' | 'createdAt'>>
): Promise<void> {
  const existing = await db.exercises.get(id);
  if (!existing) {
    throw new Error(`Exercise with id ${id} not found`);
  }

  const updatedExercise = {
    ...existing,
    ...updates,
  };

  const validation = validateExercise(updatedExercise);
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  if (updatedExercise.name) {
    updatedExercise.name = sanitizeString(updatedExercise.name);
  }
  if (updatedExercise.equipment) {
    updatedExercise.equipment = sanitizeString(updatedExercise.equipment);
  }
  if (updatedExercise.notes) {
    updatedExercise.notes = sanitizeString(updatedExercise.notes);
  }

  await db.exercises.update(id, updatedExercise);
}

export async function deleteExercise(id: string): Promise<void> {
  // Prevent deleting exercises that are referenced by workouts or training sessions
  // Check workouts by searching through their exercises arrays
  const workoutsWithExercise = await db.workouts
    .filter((workout) => workout.exercises.some((ex) => ex.exerciseId === id))
    .count();

  const referencingTrainingSessionsCount = await db.trainingSessions
    .where('exerciseId')
    .equals(id)
    .count();

  if (workoutsWithExercise > 0 || referencingTrainingSessionsCount > 0) {
    throw new Error(
      'Cannot delete exercise that is used in existing workouts or training sessions'
    );
  }

  await db.exercises.delete(id);
}

// ===== Workout CRUD =====

export async function createWorkout(
  workout: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const validation = validateWorkout(workout);
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  const newWorkout: Workout = {
    id: crypto.randomUUID(),
    date: workout.date,
    exercises: workout.exercises,
    notes: workout.notes ? sanitizeString(workout.notes) : undefined,
    completed: workout.completed,
    duration: workout.duration,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.workouts.add(newWorkout);
  return newWorkout.id;
}

export async function getWorkout(id: string): Promise<Workout | undefined> {
  return db.workouts.get(id);
}

export async function getAllWorkouts(): Promise<Workout[]> {
  return db.workouts.orderBy('date').reverse().toArray();
}

export async function getWorkoutsByDateRange(
  startDate: Date,
  endDate: Date
): Promise<Workout[]> {
  return db.workouts
    .where('date')
    .between(startDate, endDate, true, true)
    .reverse()
    .toArray();
}

export async function getCompletedWorkouts(): Promise<Workout[]> {
  const workouts = await db.workouts
    .filter((workout) => workout.completed === true)
    .toArray();
  return workouts.sort((a, b) => b.date.getTime() - a.date.getTime());
}

export async function updateWorkout(
  id: string,
  updates: Partial<Omit<Workout, 'id' | 'createdAt'>>
): Promise<void> {
  const existing = await db.workouts.get(id);
  if (!existing) {
    throw new Error(`Workout with id ${id} not found`);
  }

  const updatedWorkout = {
    ...existing,
    ...updates,
    updatedAt: new Date(),
  };

  const validation = validateWorkout(updatedWorkout);
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  if (updatedWorkout.notes) {
    updatedWorkout.notes = sanitizeString(updatedWorkout.notes);
  }

  await db.workouts.update(id, updatedWorkout);
}

export async function deleteWorkout(id: string): Promise<void> {
  // Also delete associated training sessions
  const sessions = await db.trainingSessions
    .where('workoutId')
    .equals(id)
    .toArray();

  await Promise.all([
    db.workouts.delete(id),
    ...sessions.map((session) => db.trainingSessions.delete(session.id)),
  ]);
}

// ===== TrainingSession CRUD =====

export async function createTrainingSession(
  session: Omit<TrainingSession, 'id' | 'createdAt'>
): Promise<string> {
  const validation = validateTrainingSession(session);
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  const newSession: TrainingSession = {
    id: crypto.randomUUID(),
    workoutId: session.workoutId,
    exerciseId: session.exerciseId,
    date: session.date,
    pump: session.pump,
    soreness: session.soreness,
    fatigue: session.fatigue,
    performance: session.performance,
    notes: session.notes ? sanitizeString(session.notes) : undefined,
    createdAt: new Date(),
  };

  await db.trainingSessions.add(newSession);
  return newSession.id;
}

export async function getTrainingSession(
  id: string
): Promise<TrainingSession | undefined> {
  return db.trainingSessions.get(id);
}

export async function getTrainingSessionsByWorkout(
  workoutId: string
): Promise<TrainingSession[]> {
  return db.trainingSessions.where('workoutId').equals(workoutId).toArray();
}

export async function getTrainingSessionsByExercise(
  exerciseId: string
): Promise<TrainingSession[]> {
  return db.trainingSessions
    .where('exerciseId')
    .equals(exerciseId)
    .reverse()
    .sortBy('date');
}

export async function updateTrainingSession(
  id: string,
  updates: Partial<Omit<TrainingSession, 'id' | 'createdAt'>>
): Promise<void> {
  const existing = await db.trainingSessions.get(id);
  if (!existing) {
    throw new Error(`TrainingSession with id ${id} not found`);
  }

  const updatedSession = {
    ...existing,
    ...updates,
  };

  const validation = validateTrainingSession(updatedSession);
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  if (updatedSession.notes) {
    updatedSession.notes = sanitizeString(updatedSession.notes);
  }

  await db.trainingSessions.update(id, updatedSession);
}

export async function deleteTrainingSession(id: string): Promise<void> {
  await db.trainingSessions.delete(id);
}

// ===== Mesocycle CRUD =====

export async function createMesocycle(
  mesocycle: Omit<Mesocycle, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const validation = validateMesocycle(mesocycle);
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  const newMesocycle: Mesocycle = {
    id: crypto.randomUUID(),
    name: sanitizeString(mesocycle.name),
    startDate: mesocycle.startDate,
    endDate: mesocycle.endDate,
    weekNumber: mesocycle.weekNumber,
    trainingSplit: mesocycle.trainingSplit,
    isDeloadWeek: mesocycle.isDeloadWeek,
    status: mesocycle.status,
    notes: mesocycle.notes ? sanitizeString(mesocycle.notes) : undefined,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  await db.mesocycles.add(newMesocycle);
  return newMesocycle.id;
}

export async function getMesocycle(id: string): Promise<Mesocycle | undefined> {
  return db.mesocycles.get(id);
}

export async function getAllMesocycles(): Promise<Mesocycle[]> {
  return db.mesocycles.orderBy('startDate').reverse().toArray();
}

export async function getActiveMesocycle(): Promise<Mesocycle | undefined> {
  return db.mesocycles.where('status').equals('active').first();
}

export async function getMesocyclesByStatus(
  status: Mesocycle['status']
): Promise<Mesocycle[]> {
  return db.mesocycles
    .where('status')
    .equals(status)
    .reverse()
    .sortBy('startDate');
}

export async function updateMesocycle(
  id: string,
  updates: Partial<Omit<Mesocycle, 'id' | 'createdAt'>>
): Promise<void> {
  const existing = await db.mesocycles.get(id);
  if (!existing) {
    throw new Error(`Mesocycle with id ${id} not found`);
  }

  const updatedMesocycle = {
    ...existing,
    ...updates,
    updatedAt: new Date(),
  };

  const validation = validateMesocycle(updatedMesocycle);
  if (!validation.valid) {
    throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
  }

  if (updatedMesocycle.name) {
    updatedMesocycle.name = sanitizeString(updatedMesocycle.name);
  }
  if (updatedMesocycle.notes) {
    updatedMesocycle.notes = sanitizeString(updatedMesocycle.notes);
  }

  await db.mesocycles.update(id, updatedMesocycle);
}

export async function deleteMesocycle(id: string): Promise<void> {
  await db.mesocycles.delete(id);
}

// ===== Utility functions =====

export async function clearAllData(): Promise<void> {
  await Promise.all([
    db.userProfiles.clear(),
    db.exercises.clear(),
    db.workouts.clear(),
    db.trainingSessions.clear(),
    db.mesocycles.clear(),
  ]);
}

export async function exportData(): Promise<string> {
  const data = {
    userProfiles: await db.userProfiles.toArray(),
    exercises: await db.exercises.toArray(),
    workouts: await db.workouts.toArray(),
    trainingSessions: await db.trainingSessions.toArray(),
    mesocycles: await db.mesocycles.toArray(),
    exportDate: new Date().toISOString(),
    version: 2,
  };

  return JSON.stringify(data, null, 2);
}

export async function importData(jsonData: string): Promise<void> {
  // Parse JSON safely and revive ISO date strings back to Date objects
  let data: unknown;
  try {
    const isoDateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?Z$/;

    data = JSON.parse(jsonData, (_key, value) => {
      if (typeof value === 'string' && isoDateRegex.test(value)) {
        const d = new Date(value);
        if (!Number.isNaN(d.getTime())) {
          return d;
        }
      }
      return value;
    });
  } catch {
    // Do not clear existing data if the JSON is invalid
    throw new Error('Failed to parse import data: invalid JSON.');
  }

  if (!data || typeof data !== 'object') {
    throw new Error('Import data has invalid format: expected an object.');
  }

  const { userProfiles, exercises, workouts, trainingSessions, mesocycles } =
    data as {
      userProfiles?: unknown;
      exercises?: unknown;
      workouts?: unknown;
      trainingSessions?: unknown;
      mesocycles?: unknown;
    };

  const isArrayOrUndefined = (value: unknown): boolean =>
    value === undefined || Array.isArray(value);

  if (
    !isArrayOrUndefined(userProfiles) ||
    !isArrayOrUndefined(exercises) ||
    !isArrayOrUndefined(workouts) ||
    !isArrayOrUndefined(trainingSessions) ||
    !isArrayOrUndefined(mesocycles)
  ) {
    throw new Error(
      'Import data has invalid format: collections must be arrays.'
    );
  }

  const safeUserProfiles = (userProfiles as UserProfile[] | undefined) ?? [];
  const safeExercises = (exercises as Exercise[] | undefined) ?? [];
  const safeWorkouts = (workouts as Workout[] | undefined) ?? [];
  const safeTrainingSessions =
    (trainingSessions as TrainingSession[] | undefined) ?? [];
  const safeMesocycles = (mesocycles as Mesocycle[] | undefined) ?? [];

  // Clear existing data only after the new data has been parsed and validated
  await clearAllData();

  // Import new data
  if (safeUserProfiles.length > 0) {
    await db.userProfiles.bulkAdd(safeUserProfiles);
  }
  if (safeExercises.length > 0) {
    await db.exercises.bulkAdd(safeExercises);
  }
  if (safeWorkouts.length > 0) {
    await db.workouts.bulkAdd(safeWorkouts);
  }
  if (safeTrainingSessions.length > 0) {
    await db.trainingSessions.bulkAdd(safeTrainingSessions);
  }
  if (safeMesocycles.length > 0) {
    await db.mesocycles.bulkAdd(safeMesocycles);
  }
}
