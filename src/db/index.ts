import Dexie, { type EntityTable } from 'dexie';
import type {
  UserProfile,
  Exercise,
  Workout,
  WorkoutSet,
  TrainingSession,
  Mesocycle,
} from '../types/models';

// Re-export types for convenience
export type {
  UserProfile,
  Exercise,
  Workout,
  WorkoutSet,
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
  workoutSets!: EntityTable<WorkoutSet, 'id'>;
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
    this.version(2)
      .stores({
        // Rename users to userProfiles and add better indexes
        userProfiles: 'id, createdAt, updatedAt',
        // Enhanced exercise model
        exercises: 'id, name, category, isCustom, createdAt',
        // Enhanced workout model with better date indexing
        workouts: 'id, date, completed, createdAt, updatedAt',
        // Separate table for workout sets for better querying
        workoutSets: 'id, exerciseId, completed',
        // New table for training session feedback
        trainingSessions: 'id, workoutId, exerciseId, date, createdAt',
        // Enhanced mesocycle model
        mesocycles:
          'id, startDate, endDate, weekNumber, status, createdAt, updatedAt',
      })
      .upgrade(async (tx) => {
        // Migrate old users to userProfiles if they exist.
        // On fresh v2 installs, the legacy "users" table may not exist at all,
        // so we defensively handle that case and simply skip the migration.
        try {
          const users = await tx.table('users').toArray();

          if (!users || users.length === 0) {
            // Nothing to migrate.
            return;
          }

          await Promise.all(
            users.map((user: { id?: number; name?: string; trainingExperience?: string; createdAt?: Date; updatedAt?: Date }) => {
              const profile: UserProfile = {
                id: user.id?.toString() || crypto.randomUUID(),
                name: user.name || 'User',
                experienceLevel:
                  (user.trainingExperience as 'beginner' | 'intermediate' | 'advanced') ||
                  'beginner',
                preferences: {
                  units: 'metric',
                  theme: 'system',
                },
                createdAt: user.createdAt || new Date(),
                updatedAt: user.updatedAt || new Date(),
              };
              return tx.table('userProfiles').add(profile);
            })
          );
        } catch (error: any) {
          // If the legacy "users" table doesn't exist (e.g., fresh v2 install),
          // Dexie may throw an error when accessing it. In that case we can
          // safely skip the migration. Re-throw for any other unexpected errors.
          const message = typeof error?.message === 'string' ? error.message : '';
          if (
            error?.name === 'NotFoundError' ||
            /NoSuchTable|MissingTable|does not exist/i.test(message)
          ) {
            return;
          }
          throw error;
        }
      });
  }
}

// Create and export the database instance
export const db = new RepstackDatabase();
