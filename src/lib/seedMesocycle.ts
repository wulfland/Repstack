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
  const exercises = await db.exercises.limit(50).toArray();

  if (exercises.length === 0) {
    console.warn('No exercises found, skipping mesocycle seeding');
    return false;
  }

  // Categorize exercises by type
  const pushExercises = exercises
    .filter((ex) =>
      ex.muscleGroups.some((mg) =>
        ['chest', 'shoulders', 'triceps'].includes(mg)
      )
    )
    .slice(0, 5);

  const pullExercises = exercises
    .filter((ex) =>
      ex.muscleGroups.some((mg) => ['back', 'biceps'].includes(mg))
    )
    .slice(0, 5);

  const legExercises = exercises
    .filter((ex) =>
      ex.muscleGroups.some((mg) =>
        ['quads', 'hamstrings', 'glutes', 'calves'].includes(mg)
      )
    )
    .slice(0, 5);

  // Create a mesocycle (6-week hypertrophy block)
  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + 42); // 6 weeks

  // Generate a dynamic name based on the current month and year
  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  const mesocycleName = `Hypertrophy Block - ${monthNames[startDate.getMonth()]} ${startDate.getFullYear()}`;

  // Prepare split day exercises
  const pushExercises = exercises
    .filter((ex) =>
      ex.muscleGroups.some((mg) =>
        ['chest', 'shoulders', 'triceps'].includes(mg)
      )
    )
    .slice(0, 4);

  const pullExercises = exercises
    .filter((ex) =>
      ex.muscleGroups.some((mg) => ['back', 'biceps'].includes(mg))
    )
    .slice(0, 4);

  const legExercises = exercises
    .filter((ex) =>
      ex.muscleGroups.some((mg) =>
        ['quads', 'hamstrings', 'glutes', 'calves'].includes(mg)
      )
    )
    .slice(0, 4);

  // Create split days with exercise configurations
  const splitDays: import('../types/models').MesocycleSplitDay[] = [
    {
      id: crypto.randomUUID(),
      name: 'Push Day',
      dayOrder: 1,
      exercises: pushExercises.map((ex, idx) => ({
        exerciseId: ex.id,
        order: idx,
        targetSets: 3,
        targetRepsMin: 8,
        targetRepsMax: 12,
        restSeconds: 90,
      })),
    },
    {
      id: crypto.randomUUID(),
      name: 'Pull Day',
      dayOrder: 2,
      exercises: pullExercises.map((ex, idx) => ({
        exerciseId: ex.id,
        order: idx,
        targetSets: 3,
        targetRepsMin: 8,
        targetRepsMax: 12,
        restSeconds: 90,
      })),
    },
    {
      id: crypto.randomUUID(),
      name: 'Leg Day',
      dayOrder: 3,
      exercises: legExercises.map((ex, idx) => ({
        exerciseId: ex.id,
        order: idx,
        targetSets: 3,
        targetRepsMin: 8,
        targetRepsMax: 12,
        restSeconds: 120,
      })),
    },
  ];

  const mesocycleId = await createMesocycle({
    name: mesocycleName,
    startDate,
    endDate,
    durationWeeks: 6,
    currentWeek: 1,
    deloadWeek: 6,
    trainingSplit: 'push_pull_legs',
    splitDays,
    status: 'active',
    notes: 'Focus on progressive overload and muscle building',
  });

  console.log('Created sample mesocycle:', mesocycleId);

  // Create a few sample workouts with exercises
  // Create Push workout
  if (pushExercises.length > 0) {
    const pushDate = new Date(startDate);
    pushDate.setDate(pushDate.getDate() - 2); // 2 days ago

    await createWorkout({
      date: pushDate,
      mesocycleId,
      weekNumber: 1,
      splitDayId: pushSplitId,
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
      mesocycleId,
      weekNumber: 1,
      splitDayId: pullSplitId,
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

  // Don't create the Leg workout yet - let the user test the tracker!
  // This will show Push and Pull as completed, and Legs as "Next"

  console.log('Created sample workouts');
  return true;
}
