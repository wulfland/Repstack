import Dexie, { type EntityTable } from 'dexie';
import type {
  UserProfile,
  Exercise,
  Workout,
  TrainingSession,
  Mesocycle,
} from '../types/models';

// Re-export types for convenience
export type {
  UserProfile,
  Exercise,
  Workout,
  TrainingSession,
  Mesocycle,
  MuscleGroup,
  WorkoutExercise,
  VolumeLandmarks,
} from '../types/models';

// Define the database with proper typing
class RepstackDatabase extends Dexie {
  userProfiles!: EntityTable<UserProfile, 'id'>;
  exercises!: EntityTable<Exercise, 'id'>;
  workouts!: EntityTable<Workout, 'id'>;
  trainingSessions!: EntityTable<TrainingSession, 'id'>;
  mesocycles!: EntityTable<Mesocycle, 'id'>;

  constructor() {
    super('RepstackDB');

    // IMPORTANT: Dexie does not support changing primary key types between versions.
    // To work around this, we use completely new table names when we need different
    // primary key types. The old tables are marked as null (deleted) in later versions.

    // Version 1: Initial schema (legacy - auto-increment integer IDs)
    this.version(1).stores({
      users: '++id, email, createdAt',
      exercises: '++id, name, category, createdAt',
      workouts: '++id, date, completed, createdAt',
      mesocycles: '++id, startDate, endDate, status, createdAt',
    });

    // Version 2: Transition version - prepare for UUID migration
    this.version(2)
      .stores({
        // Keep old tables for now (will be deleted in v4)
        users: '++id, email, createdAt',
        exercises: '++id, name, category, createdAt',
        workouts: '++id, date, completed, createdAt',
        mesocycles: '++id, startDate, endDate, status, createdAt',
        // New UUID-based tables with different names to avoid primary key change error
        userProfiles: 'id, createdAt, updatedAt',
        exercisesV2: 'id, name, category, isCustom, createdAt',
        workoutsV2: 'id, date, completed, createdAt, updatedAt',
        trainingSessions: 'id, workoutId, exerciseId, date, createdAt',
        mesocyclesV2:
          'id, startDate, endDate, weekNumber, status, createdAt, updatedAt',
      })
      .upgrade(async (tx) => {
        // Migrate old users to userProfiles if they exist.
        try {
          const users = await tx.table('users').toArray();

          if (users && users.length > 0) {
            await Promise.all(
              users.map(
                (user: {
                  id?: number;
                  name?: string;
                  trainingExperience?: string;
                  createdAt?: Date;
                  updatedAt?: Date;
                }) => {
                  const profile: UserProfile = {
                    id: user.id?.toString() || crypto.randomUUID(),
                    name: user.name || 'User',
                    experienceLevel:
                      (user.trainingExperience as
                        | 'beginner'
                        | 'intermediate'
                        | 'advanced') || 'beginner',
                    preferences: {
                      units: 'metric',
                      theme: 'system',
                    },
                    createdAt: user.createdAt || new Date(),
                    updatedAt: user.updatedAt || new Date(),
                  };
                  return tx.table('userProfiles').add(profile);
                }
              )
            );
          }
        } catch (error: unknown) {
          // If the legacy "users" table doesn't exist (e.g., fresh v2 install),
          // Dexie may throw an error when accessing it. In that case we can
          // safely skip the migration.
          const err = error as { name?: string; message?: string };
          const message = typeof err?.message === 'string' ? err.message : '';
          if (
            err?.name === 'NotFoundError' ||
            /NoSuchTable|MissingTable|does not exist/i.test(message)
          ) {
            // Ignore - table doesn't exist
          } else {
            throw error;
          }
        }

        // Migrate exercises to new exercisesV2 table with UUID primary keys
        try {
          const oldExercises = await tx.table('exercises').toArray();
          if (oldExercises && oldExercises.length > 0) {
            const newExercises = oldExercises.map(
              (oldEx: {
                id?: number | string;
                name?: string;
                category?: string;
                muscleGroups?: string[];
                equipment?: string;
                notes?: string;
                isCustom?: boolean;
                createdAt?: Date;
              }) => ({
                id: crypto.randomUUID(),
                name: oldEx.name || 'Unnamed Exercise',
                category: oldEx.category || 'other',
                muscleGroups: oldEx.muscleGroups || [],
                equipment: oldEx.equipment,
                notes: oldEx.notes,
                isCustom: oldEx.isCustom ?? true,
                createdAt: oldEx.createdAt || new Date(),
              })
            );
            await tx.table('exercisesV2').bulkAdd(newExercises);
          }
        } catch (error: unknown) {
          const err = error as { name?: string; message?: string };
          const message = typeof err?.message === 'string' ? err.message : '';
          if (
            err?.name === 'NotFoundError' ||
            /NoSuchTable|MissingTable|does not exist/i.test(message)
          ) {
            // Ignore - table doesn't exist
          } else {
            throw error;
          }
        }

        // Migrate workouts to new workoutsV2 table
        try {
          const oldWorkouts = await tx.table('workouts').toArray();
          if (oldWorkouts && oldWorkouts.length > 0) {
            const newWorkouts = oldWorkouts.map(
              (oldW: {
                id?: number | string;
                date?: Date;
                completed?: boolean;
                exercises?: unknown[];
                notes?: string;
                createdAt?: Date;
                updatedAt?: Date;
              }) => ({
                id: crypto.randomUUID(),
                date: oldW.date || new Date(),
                completed: oldW.completed ?? false,
                exercises: oldW.exercises || [],
                notes: oldW.notes,
                createdAt: oldW.createdAt || new Date(),
                updatedAt: oldW.updatedAt || new Date(),
              })
            );
            await tx.table('workoutsV2').bulkAdd(newWorkouts);
          }
        } catch (error: unknown) {
          const err = error as { name?: string; message?: string };
          const message = typeof err?.message === 'string' ? err.message : '';
          if (
            err?.name === 'NotFoundError' ||
            /NoSuchTable|MissingTable|does not exist/i.test(message)
          ) {
            // Ignore - table doesn't exist
          } else {
            throw error;
          }
        }

        // Migrate mesocycles to new mesocyclesV2 table
        try {
          const oldMesocycles = await tx.table('mesocycles').toArray();
          if (oldMesocycles && oldMesocycles.length > 0) {
            const newMesocycles = oldMesocycles.map(
              (oldM: {
                id?: number | string;
                name?: string;
                startDate?: Date;
                endDate?: Date;
                weekNumber?: number;
                status?: string;
                weeks?: unknown[];
                createdAt?: Date;
                updatedAt?: Date;
              }) => ({
                id: crypto.randomUUID(),
                name: oldM.name || 'Mesocycle',
                startDate: oldM.startDate || new Date(),
                endDate: oldM.endDate,
                weekNumber: oldM.weekNumber ?? 1,
                status: oldM.status || 'planned',
                weeks: oldM.weeks || [],
                createdAt: oldM.createdAt || new Date(),
                updatedAt: oldM.updatedAt || new Date(),
              })
            );
            await tx.table('mesocyclesV2').bulkAdd(newMesocycles);
          }
        } catch (error: unknown) {
          const err = error as { name?: string; message?: string };
          const message = typeof err?.message === 'string' ? err.message : '';
          if (
            err?.name === 'NotFoundError' ||
            /NoSuchTable|MissingTable|does not exist/i.test(message)
          ) {
            // Ignore - table doesn't exist
          } else {
            throw error;
          }
        }
      });

    // Version 3: Clean up old tables and map new table names to expected properties
    // This version deletes the old auto-increment tables and creates aliases
    this.version(3).stores({
      // Delete old auto-increment tables
      users: null,
      exercises: null,
      workouts: null,
      mesocycles: null,
      // Keep the UUID-based tables
      userProfiles: 'id, createdAt, updatedAt',
      exercisesV2: 'id, name, category, isCustom, createdAt',
      workoutsV2: 'id, date, completed, createdAt, updatedAt',
      trainingSessions: 'id, workoutId, exerciseId, date, createdAt',
      mesocyclesV2:
        'id, startDate, endDate, weekNumber, status, createdAt, updatedAt',
    });

    // Version 4: Update mesocycles schema with new fields
    this.version(4)
      .stores({
        userProfiles: 'id, createdAt, updatedAt',
        exercisesV2: 'id, name, category, isCustom, createdAt',
        workoutsV2: 'id, date, mesocycleId, completed, createdAt, updatedAt',
        trainingSessions: 'id, workoutId, exerciseId, date, createdAt',
        mesocyclesV2:
          'id, startDate, endDate, durationWeeks, currentWeek, status, createdAt, updatedAt',
      })
      .upgrade(async (tx) => {
        // Migrate existing mesocycles to new schema
        const existingMesocycles = await tx.table('mesocyclesV2').toArray();

        for (const mesocycle of existingMesocycles) {
          // Calculate durationWeeks from start and end dates
          const startDate = new Date(mesocycle.startDate);
          const endDate = new Date(mesocycle.endDate);
          const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          const durationWeeks = Math.ceil(diffDays / 7);

          // Migrate old fields to new schema
          const updates: Partial<Mesocycle> = {
            durationWeeks: Math.min(Math.max(durationWeeks, 4), 6), // Clamp to 4-6 weeks
            currentWeek: (mesocycle as { weekNumber?: number }).weekNumber || 1,
            deloadWeek:
              durationWeeks === 4 ? 4 : durationWeeks === 5 ? 5 : 6, // Default deload week
          };

          await tx.table('mesocyclesV2').update(mesocycle.id, updates);
        }
      });

    // Map the V2 tables to the expected property names
    // This allows the rest of the code to use db.exercises, db.workouts, etc.
    this.exercises = this.table('exercisesV2') as EntityTable<Exercise, 'id'>;
    this.workouts = this.table('workoutsV2') as EntityTable<Workout, 'id'>;
    this.mesocycles = this.table('mesocyclesV2') as EntityTable<
      Mesocycle,
      'id'
    >;
  }
}

// Create and export the database instance
export const db = new RepstackDatabase();

/**
 * Initialize the database with error recovery.
 * If the database is corrupted from a failed migration, this will
 * delete it and create a fresh one.
 */
export async function initializeDatabase(): Promise<void> {
  try {
    // Try to open the database - this triggers migrations
    await db.open();
  } catch (error: unknown) {
    const err = error as { name?: string; message?: string };
    const message = err?.message || '';

    // Check if this is a primary key change error (corrupted from old migration)
    if (
      message.includes('changing primary key') ||
      message.includes('UpgradeError') ||
      err?.name === 'UpgradeError'
    ) {
      console.warn(
        'Database migration failed due to schema incompatibility. Resetting database...',
        error
      );

      // Delete the corrupted database
      await Dexie.delete('RepstackDB');

      // Recreate and open - this will create fresh tables
      await db.open();

      console.log('Database reset successfully.');
    } else {
      // Re-throw other errors
      throw error;
    }
  }
}
