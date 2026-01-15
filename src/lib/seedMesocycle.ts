/**
 * Seed sample mesocycle with workouts for demonstration
 */

import { createMesocycle, createWorkout } from '../db/service';
import { db } from '../db';

/**
 * Seeds a sample mesocycle with workouts if none exist
 * Returns true if seeded, false if already exists
 */
export async function seedSampleMesocycle(): Promise<boolean> {
  const existingMesocycles = await db.mesocycles.count();
  
  // Only seed if no mesocycles exist
  if (existingMesocycles > 0) {
    return false;
  }

  // Get some exercises to use in workouts
  const exercises = await db.exercises.limit(10).toArray();
  
  if (exercises.length === 0) {
    console.warn('No exercises found, skipping mesocycle seeding');
    return false;
  }

  // Create a mesocycle (6-week hypertrophy block)
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 42); // 6 weeks

  const mesocycleId = await createMesocycle({
    name: 'Hypertrophy Block - January 2026',
    startDate,
    endDate,
    weekNumber: 1,
    trainingSplit: 'push_pull_legs',
    isDeloadWeek: false,
    status: 'active',
    notes: 'Focus on progressive overload and muscle building',
  });

  console.log('Created sample mesocycle:', mesocycleId);

  // Create a few sample workouts with exercises
  const pushExercises = exercises.filter(ex => 
    ex.muscleGroups.some(mg => ['chest', 'shoulders', 'triceps'].includes(mg))
  ).slice(0, 4);

  const pullExercises = exercises.filter(ex =>
    ex.muscleGroups.some(mg => ['back', 'biceps'].includes(mg))
  ).slice(0, 4);

  const legExercises = exercises.filter(ex =>
    ex.muscleGroups.some(mg => ['quads', 'hamstrings', 'glutes', 'calves'].includes(mg))
  ).slice(0, 4);

  // Create Push workout
  if (pushExercises.length > 0) {
    const pushDate = new Date(startDate);
    pushDate.setDate(pushDate.getDate() - 2); // 2 days ago

    await createWorkout({
      date: pushDate,
      exercises: pushExercises.map((ex, index) => ({
        exerciseId: ex.id,
        sets: Array.from({ length: 3 }, (_, setIndex) => ({
          id: crypto.randomUUID(),
          exerciseId: ex.id,
          setNumber: setIndex + 1,
          targetReps: 10,
          actualReps: 10,
          weight: 100 + index * 10,
          rir: 2,
          completed: true,
        })),
      })),
      notes: 'Push day - Chest, Shoulders, Triceps',
      completed: true,
      duration: 75,
    });
  }

  // Create Pull workout
  if (pullExercises.length > 0) {
    const pullDate = new Date(startDate);
    pullDate.setDate(pullDate.getDate() - 1); // 1 day ago

    await createWorkout({
      date: pullDate,
      exercises: pullExercises.map((ex, index) => ({
        exerciseId: ex.id,
        sets: Array.from({ length: 3 }, (_, setIndex) => ({
          id: crypto.randomUUID(),
          exerciseId: ex.id,
          setNumber: setIndex + 1,
          targetReps: 10,
          actualReps: 9 + setIndex,
          weight: 90 + index * 10,
          rir: 2,
          completed: true,
        })),
      })),
      notes: 'Pull day - Back, Biceps',
      completed: true,
      duration: 70,
    });
  }

  // Create Leg workout (today)
  if (legExercises.length > 0) {
    await createWorkout({
      date: new Date(),
      exercises: legExercises.map((ex, index) => ({
        exerciseId: ex.id,
        sets: Array.from({ length: 4 }, (_, setIndex) => ({
          id: crypto.randomUUID(),
          exerciseId: ex.id,
          setNumber: setIndex + 1,
          targetReps: 12,
          actualReps: setIndex < 3 ? 12 : 10, // Last set to failure
          weight: 150 + index * 20,
          rir: setIndex < 3 ? 2 : 0,
          completed: true,
        })),
      })),
      notes: 'Leg day - Quads, Hamstrings, Glutes, Calves',
      completed: true,
      duration: 90,
    });
  }

  console.log('Created sample workouts');
  return true;
}
