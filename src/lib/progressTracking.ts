/**
 * Progress tracking utilities for workout history and analytics
 */

import type { Workout, WorkoutSet, Exercise, MuscleGroup } from '../types/models';

/**
 * Calculate 1RM using Epley formula
 * 1RM = weight × (1 + reps / 30)
 */
export function calculateOneRepMax(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  return weight * (1 + reps / 30);
}

/**
 * Calculate 1RM using Brzycki formula (alternative, more conservative)
 * 1RM = weight × (36 / (37 - reps))
 */
export function calculateOneRepMaxBrzycki(weight: number, reps: number): number {
  if (reps <= 0 || weight <= 0) return 0;
  if (reps === 1) return weight;
  if (reps >= 37) return weight; // Formula breaks down at high reps
  return weight * (36 / (37 - reps));
}

/**
 * Calculate volume for a set (reps × weight)
 */
export function calculateSetVolume(set: WorkoutSet): number {
  const reps = set.actualReps ?? set.targetReps;
  return reps * set.weight;
}

/**
 * Calculate total volume for an exercise in a workout
 */
export function calculateExerciseVolume(sets: WorkoutSet[]): number {
  return sets.reduce((total, set) => {
    if (set.completed) {
      return total + calculateSetVolume(set);
    }
    return total;
  }, 0);
}

/**
 * Calculate total volume for a workout
 */
export function calculateWorkoutVolume(workout: Workout): number {
  return workout.exercises.reduce((total, exercise) => {
    return total + calculateExerciseVolume(exercise.sets);
  }, 0);
}

/**
 * Find personal records for an exercise
 * Returns best weight at various rep ranges (1RM, 5RM, 10RM, etc.)
 */
export interface PersonalRecord {
  repRange: string;
  weight: number;
  reps: number;
  estimatedOneRM: number;
  date: Date;
  workoutId: string;
}

export function findPersonalRecords(
  workouts: Workout[],
  exerciseId: string
): PersonalRecord[] {
  const repRanges = [
    { min: 1, max: 1, label: '1RM' },
    { min: 2, max: 3, label: '3RM' },
    { min: 4, max: 6, label: '5RM' },
    { min: 7, max: 9, label: '8RM' },
    { min: 10, max: 12, label: '10RM' },
    { min: 13, max: 15, label: '15RM' },
    { min: 16, max: 30, label: '20RM' },
  ];

  const records: PersonalRecord[] = [];

  for (const range of repRanges) {
    let bestSet: { weight: number; reps: number; date: Date; workoutId: string } | null = null;

    for (const workout of workouts) {
      if (!workout.completed) continue;

      for (const exercise of workout.exercises) {
        if (exercise.exerciseId !== exerciseId) continue;

        for (const set of exercise.sets) {
          if (!set.completed) continue;

          const reps = set.actualReps ?? set.targetReps;
          if (reps < range.min || reps > range.max) continue;

          if (!bestSet || set.weight > bestSet.weight) {
            bestSet = {
              weight: set.weight,
              reps,
              date: workout.date,
              workoutId: workout.id,
            };
          }
        }
      }
    }

    if (bestSet) {
      records.push({
        repRange: range.label,
        weight: bestSet.weight,
        reps: bestSet.reps,
        estimatedOneRM: calculateOneRepMax(bestSet.weight, bestSet.reps),
        date: bestSet.date,
        workoutId: bestSet.workoutId,
      });
    }
  }

  return records;
}

/**
 * Calculate volume per muscle group from workouts
 */
export interface MuscleGroupVolume {
  muscleGroup: MuscleGroup;
  volume: number;
  sets: number;
}

export function calculateMuscleGroupVolume(
  workouts: Workout[],
  exercises: Exercise[],
  startDate?: Date,
  endDate?: Date
): MuscleGroupVolume[] {
  const volumeMap = new Map<MuscleGroup, { volume: number; sets: number }>();

  // Create exercise lookup map
  const exerciseMap = new Map(exercises.map(ex => [ex.id, ex]));

  for (const workout of workouts) {
    if (!workout.completed) continue;

    // Filter by date range if provided
    if (startDate && workout.date < startDate) continue;
    if (endDate && workout.date > endDate) continue;

    for (const workoutExercise of workout.exercises) {
      const exercise = exerciseMap.get(workoutExercise.exerciseId);
      if (!exercise) continue;

      const volume = calculateExerciseVolume(workoutExercise.sets);
      const completedSets = workoutExercise.sets.filter(s => s.completed).length;

      // Add volume to each muscle group targeted by this exercise
      for (const muscleGroup of exercise.muscleGroups) {
        const current = volumeMap.get(muscleGroup) || { volume: 0, sets: 0 };
        volumeMap.set(muscleGroup, {
          volume: current.volume + volume,
          sets: current.sets + completedSets,
        });
      }
    }
  }

  return Array.from(volumeMap.entries()).map(([muscleGroup, data]) => ({
    muscleGroup,
    volume: data.volume,
    sets: data.sets,
  }));
}

/**
 * Calculate training statistics
 */
export interface TrainingStatistics {
  totalWorkouts: number;
  totalCompletedWorkouts: number;
  totalSets: number;
  totalVolume: number;
  averageWorkoutDuration: number;
  workoutsPerWeek: number;
  currentStreak: number;
  longestStreak: number;
  firstWorkoutDate: Date | null;
  lastWorkoutDate: Date | null;
}

export function calculateTrainingStatistics(workouts: Workout[]): TrainingStatistics {
  const completedWorkouts = workouts.filter(w => w.completed);

  if (completedWorkouts.length === 0) {
    return {
      totalWorkouts: workouts.length,
      totalCompletedWorkouts: 0,
      totalSets: 0,
      totalVolume: 0,
      averageWorkoutDuration: 0,
      workoutsPerWeek: 0,
      currentStreak: 0,
      longestStreak: 0,
      firstWorkoutDate: null,
      lastWorkoutDate: null,
    };
  }

  // Sort workouts by date
  const sortedWorkouts = [...completedWorkouts].sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  );

  const firstWorkoutDate = sortedWorkouts[0].date;
  const lastWorkoutDate = sortedWorkouts[sortedWorkouts.length - 1].date;

  // Calculate total sets and volume
  let totalSets = 0;
  let totalVolume = 0;
  let totalDuration = 0;
  let workoutsWithDuration = 0;

  for (const workout of completedWorkouts) {
    for (const exercise of workout.exercises) {
      totalSets += exercise.sets.filter(s => s.completed).length;
      totalVolume += calculateExerciseVolume(exercise.sets);
    }

    if (workout.duration) {
      totalDuration += workout.duration;
      workoutsWithDuration++;
    }
  }

  // Calculate average workout duration
  const averageWorkoutDuration =
    workoutsWithDuration > 0 ? totalDuration / workoutsWithDuration : 0;

  // Calculate workouts per week
  const daysBetween =
    (lastWorkoutDate.getTime() - firstWorkoutDate.getTime()) / (1000 * 60 * 60 * 24);
  const weeksBetween = daysBetween / 7;
  const workoutsPerWeek = weeksBetween > 0 ? completedWorkouts.length / weeksBetween : 0;

  // Calculate streaks (consecutive days with workouts)
  const { currentStreak, longestStreak } = calculateStreaks(sortedWorkouts);

  return {
    totalWorkouts: workouts.length,
    totalCompletedWorkouts: completedWorkouts.length,
    totalSets,
    totalVolume,
    averageWorkoutDuration,
    workoutsPerWeek,
    currentStreak,
    longestStreak,
    firstWorkoutDate,
    lastWorkoutDate,
  };
}

/**
 * Calculate current and longest training streaks
 */
function calculateStreaks(sortedWorkouts: Workout[]): {
  currentStreak: number;
  longestStreak: number;
} {
  if (sortedWorkouts.length === 0) {
    return { currentStreak: 0, longestStreak: 0 };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;
  let lastDate = sortedWorkouts[0].date;
  lastDate.setHours(0, 0, 0, 0);

  // Check if the most recent workout was today or yesterday
  const lastWorkoutDate = new Date(sortedWorkouts[sortedWorkouts.length - 1].date);
  lastWorkoutDate.setHours(0, 0, 0, 0);
  const daysSinceLastWorkout =
    (today.getTime() - lastWorkoutDate.getTime()) / (1000 * 60 * 60 * 24);

  for (let i = 1; i < sortedWorkouts.length; i++) {
    const currentDate = new Date(sortedWorkouts[i].date);
    currentDate.setHours(0, 0, 0, 0);

    const daysDiff = (currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24);

    if (daysDiff === 1) {
      // Consecutive day
      tempStreak++;
    } else if (daysDiff > 1) {
      // Streak broken
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
    // If daysDiff === 0 (same day), don't increment streak but continue

    lastDate = currentDate;
  }

  longestStreak = Math.max(longestStreak, tempStreak);

  // Current streak is the temp streak only if the last workout was today or yesterday
  if (daysSinceLastWorkout <= 1) {
    currentStreak = tempStreak;
  }

  return { currentStreak, longestStreak };
}

/**
 * Get workout calendar data (for heat map visualization)
 */
export interface CalendarDay {
  date: Date;
  workoutCount: number;
  workouts: Workout[];
}

export function getWorkoutCalendar(
  workouts: Workout[],
  startDate: Date,
  endDate: Date
): CalendarDay[] {
  const calendar: CalendarDay[] = [];
  const workoutsByDate = new Map<string, Workout[]>();

  // Group workouts by date
  for (const workout of workouts) {
    if (!workout.completed) continue;
    if (workout.date < startDate || workout.date > endDate) continue;

    const dateKey = workout.date.toISOString().split('T')[0];
    const existing = workoutsByDate.get(dateKey) || [];
    existing.push(workout);
    workoutsByDate.set(dateKey, existing);
  }

  // Create calendar entries for each day in range
  const currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dateKey = currentDate.toISOString().split('T')[0];
    const dayWorkouts = workoutsByDate.get(dateKey) || [];

    calendar.push({
      date: new Date(currentDate),
      workoutCount: dayWorkouts.length,
      workouts: dayWorkouts,
    });

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return calendar;
}

/**
 * Get progress trend data for an exercise
 */
export interface ProgressDataPoint {
  date: Date;
  weight: number;
  reps: number;
  volume: number;
  estimatedOneRM: number;
}

export function getExerciseProgressTrend(
  workouts: Workout[],
  exerciseId: string
): ProgressDataPoint[] {
  const dataPoints: ProgressDataPoint[] = [];

  const completedWorkouts = workouts
    .filter(w => w.completed)
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  for (const workout of completedWorkouts) {
    for (const exercise of workout.exercises) {
      if (exercise.exerciseId !== exerciseId) continue;

      // Find the best set (highest weight or volume)
      let bestSet: WorkoutSet | null = null;
      let bestVolume = 0;

      for (const set of exercise.sets) {
        if (!set.completed) continue;

        const volume = calculateSetVolume(set);
        if (!bestSet || volume > bestVolume) {
          bestSet = set;
          bestVolume = volume;
        }
      }

      if (bestSet) {
        const reps = bestSet.actualReps ?? bestSet.targetReps;
        dataPoints.push({
          date: workout.date,
          weight: bestSet.weight,
          reps,
          volume: bestVolume,
          estimatedOneRM: calculateOneRepMax(bestSet.weight, reps),
        });
      }
    }
  }

  return dataPoints;
}
