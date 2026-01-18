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
        // Also handle the case where users have the broken v2 schema
        let oldExercises: Array<{
          id?: number | string;
          name?: string;
          category?: string;
          muscleGroups?: string[];
          equipment?: string;
          notes?: string;
          isCustom?: boolean;
          createdAt?: Date;
        }> = [];

        // Try to get exercises from temp table first (normal migration path)
        try {
          oldExercises = await tx.table('exercisesTemp').toArray();
        } catch {
          // If temp table doesn't exist, try to get from exercises table
          // (for users who already have the broken v2 schema)
          try {
            oldExercises = await tx.table('exercises').toArray();
          } catch {
            // Neither table exists - fresh install, nothing to migrate
            return;
          }
        }

        if (!oldExercises || oldExercises.length === 0) {
          return;
        }

        // Create mapping from old IDs to new UUIDs
        const idMapping = new Map<number | string, string>();

        // Convert old exercises to new format with UUID primary keys
        const newExercises = oldExercises.map((oldExercise) => {
          const newId = crypto.randomUUID();
          const oldId = oldExercise.id;

          // Store mapping for foreign key updates
          if (oldId !== undefined) {
            idMapping.set(oldId, newId);
          }

          const exercise: Exercise = {
            id: newId,
            name: oldExercise.name || 'Unnamed Exercise',
            category: (oldExercise.category as Exercise['category']) || 'other',
            muscleGroups: (oldExercise.muscleGroups || []) as MuscleGroup[],
            equipment: oldExercise.equipment,
            notes: oldExercise.notes,
            isCustom: oldExercise.isCustom ?? true,
            createdAt: oldExercise.createdAt || new Date(),
          };
          return exercise;
        });

        // Add new exercises to the table
        await tx.table('exercises').bulkAdd(newExercises);

        // Update foreign key references in workouts
        try {
          const workouts = await tx.table('workouts').toArray();

          if (workouts && workouts.length > 0) {
            const updatedWorkouts = workouts.map((workout: Workout) => {
              // Update exerciseId references in workout exercises
              const updatedExercises = workout.exercises.map((we) => {
                const newExerciseId = idMapping.get(we.exerciseId);
                if (newExerciseId) {
                  // Update exerciseId in WorkoutExercise
                  const updatedSets = we.sets.map((set) => ({
                    ...set,
                    exerciseId: newExerciseId,
                  }));
                  return {
                    ...we,
                    exerciseId: newExerciseId,
                    sets: updatedSets,
                  };
                }
                return we;
              });

              return {
                ...workout,
                exercises: updatedExercises,
              };
            });

            // Update all workouts with new exercise IDs
            await Promise.all(
              updatedWorkouts.map((w) => tx.table('workouts').put(w))
            );
          }
        } catch (workoutError: unknown) {
          // Workouts table might not exist yet, that's okay
          console.warn(
            'Could not update workout exercise references:',
            workoutError
          );
        }

        // Update foreign key references in training sessions
        try {
          const sessions = await tx.table('trainingSessions').toArray();

          if (sessions && sessions.length > 0) {
            const updatedSessions = sessions.map((session: TrainingSession) => {
              const newExerciseId = idMapping.get(session.exerciseId);
              if (newExerciseId) {
                return {
                  ...session,
                  exerciseId: newExerciseId,
                };
              }
              return session;
            });

            // Update all training sessions with new exercise IDs
            await Promise.all(
              updatedSessions.map((s) => tx.table('trainingSessions').put(s))
            );
          }
        } catch (sessionError: unknown) {
          // Training sessions table might not exist yet, that's okay
          console.warn(
            'Could not update training session exercise references:',
            sessionError
          );
        }
      });
  }
}

// Create and export the database instance
export const db = new RepstackDatabase();
