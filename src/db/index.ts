import Dexie, { type EntityTable } from 'dexie';
import type {
  UserProfile,
  Exercise,
  Workout,
  TrainingSession,
  Mesocycle,
  MuscleGroup,
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
  workoutSets!: EntityTable<'id'>;
  trainingSessions!: EntityTable<TrainingSession, 'id'>;
  mesocycles!: EntityTable<Mesocycle, 'id'>;

  constructor() {
    super('RepstackDB');

    // Version 1: Initial schema
    this.version(1).stores({
      users: '++id, email, createdAt',
      exercises: '++id, name, category, createdAt',
      workouts: '++id, date, completed, createdAt',
      mesocycles: '++id, startDate, endDate, status, createdAt',
    });

    // Version 2: Enhanced schema with new models and improved indexes
    // Copy exercises to temp table and prepare for migration
    this.version(2)
      .stores({
        // Rename users to userProfiles and add better indexes
        userProfiles: 'id, createdAt, updatedAt',
        // Remove old exercises table
        exercises: null,
        // Temporary table to hold exercises during migration
        exercisesTemp: '++id, name, category, createdAt',
        // Enhanced workout model with better date indexing
        workouts: 'id, date, completed, createdAt, updatedAt',
        // New table for training session feedback
        trainingSessions: 'id, workoutId, exerciseId, date, createdAt',
        // Enhanced mesocycle model
        mesocycles:
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

        // Copy exercises to temp table for migration
        try {
          const oldExercises = await tx.table('exercises').toArray();
          if (oldExercises && oldExercises.length > 0) {
            await tx.table('exercisesTemp').bulkAdd(oldExercises);
          }
        } catch (error: unknown) {
          // If exercises table doesn't exist, that's okay (fresh install)
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

    // Version 3: Re-create exercises table with UUID primary keys and migrate data
    this.version(3)
      .stores({
        // Remove temp table
        exercisesTemp: null,
        // Re-create exercises with UUID primary key
        exercises: 'id, name, category, isCustom, createdAt',
      })
      .upgrade(async (tx) => {
        // Migrate exercises from temp table to new table with UUIDs
        try {
          const oldExercises = await tx.table('exercisesTemp').toArray();

          if (!oldExercises || oldExercises.length === 0) {
            return;
          }

          // Convert old exercises to new format with UUID primary keys
          const newExercises = oldExercises.map(
            (oldExercise: {
              id?: number;
              name?: string;
              category?: string;
              muscleGroups?: string[];
              equipment?: string;
              notes?: string;
              isCustom?: boolean;
              createdAt?: Date;
            }) => {
              const exercise: Exercise = {
                id: crypto.randomUUID(),
                name: oldExercise.name || 'Unnamed Exercise',
                category:
                  (oldExercise.category as Exercise['category']) || 'other',
                muscleGroups: (oldExercise.muscleGroups || []) as MuscleGroup[],
                equipment: oldExercise.equipment,
                notes: oldExercise.notes,
                isCustom: oldExercise.isCustom ?? true,
                createdAt: oldExercise.createdAt || new Date(),
              };
              return exercise;
            }
          );

          await tx.table('exercises').bulkAdd(newExercises);
        } catch (error: unknown) {
          // If temp table doesn't exist, that's okay (fresh install or already migrated)
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
  }
}

// Create and export the database instance
export const db = new RepstackDatabase();
