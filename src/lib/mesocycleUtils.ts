/**
 * Utility functions for mesocycle operations
 */

import type { Mesocycle } from '../types/models';
import { db } from '../db';
import { updateMesocycle } from '../db/service';

/**
 * Calculate which week of the mesocycle a given date falls into
 * Returns 1-6 for valid weeks, or null if date is outside mesocycle range
 */
export function calculateMesocycleWeek(
  mesocycle: Mesocycle,
  date: Date
): number | null {
  const startDate = new Date(mesocycle.startDate);
  const endDate = new Date(mesocycle.endDate);
  const checkDate = new Date(date);

  // Reset times to midnight for accurate comparison
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);
  checkDate.setHours(0, 0, 0, 0);

  // Check if date is within mesocycle range
  if (checkDate < startDate || checkDate > endDate) {
    return null;
  }

  // Calculate which week the date falls into
  const diffTime = checkDate.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  const weekNumber = Math.floor(diffDays / 7) + 1;

  return Math.min(weekNumber, mesocycle.durationWeeks);
}

/**
 * Update mesocycle's currentWeek based on the most recent workout
 * Should be called after creating/updating a workout
 */
export async function updateMesocycleProgress(
  mesocycleId: string
): Promise<void> {
  const mesocycle = await db.mesocycles.get(mesocycleId);
  if (!mesocycle || mesocycle.status !== 'active') {
    return;
  }

  // Get all workouts for this mesocycle, sorted by date
  const workouts = await db.workouts
    .filter((w) => w.mesocycleId === mesocycleId)
    .toArray();

  if (workouts.length === 0) {
    return;
  }

  // Find the most recent completed workout
  const completedWorkouts = workouts
    .filter((w) => w.completed)
    .sort((a, b) => b.date.getTime() - a.date.getTime());

  if (completedWorkouts.length === 0) {
    return;
  }

  const latestWorkout = completedWorkouts[0];
  const calculatedWeek = calculateMesocycleWeek(mesocycle, latestWorkout.date);

  // Update currentWeek if it has changed
  if (calculatedWeek && calculatedWeek !== mesocycle.currentWeek) {
    await updateMesocycle(mesocycleId, {
      currentWeek: calculatedWeek,
    });
  }
}

/**
 * Get the active mesocycle and associate a workout with it
 * Returns the mesocycleId and weekNumber for the workout
 */
export async function getWorkoutMesocycleInfo(
  workoutDate: Date
): Promise<{ mesocycleId: string; weekNumber: number } | null> {
  const activeMesocycle = await db.mesocycles
    .where('status')
    .equals('active')
    .first();

  if (!activeMesocycle) {
    return null;
  }

  const weekNumber = calculateMesocycleWeek(activeMesocycle, workoutDate);
  if (!weekNumber) {
    return null;
  }

  return {
    mesocycleId: activeMesocycle.id,
    weekNumber,
  };
}

/**
 * Check if a mesocycle should be automatically completed
 * (e.g., if the end date has passed)
 */
export async function checkMesocycleCompletion(
  mesocycleId: string
): Promise<void> {
  const mesocycle = await db.mesocycles.get(mesocycleId);
  if (!mesocycle || mesocycle.status !== 'active') {
    return;
  }

  const now = new Date();
  const endDate = new Date(mesocycle.endDate);

  // If mesocycle end date has passed, mark it as completed
  if (now > endDate) {
    await updateMesocycle(mesocycleId, {
      status: 'completed',
    });
  }
}

/**
 * Get a human-readable description of the mesocycle week
 */
export function getMesocycleWeekDescription(
  mesocycle: Mesocycle,
  weekNumber: number
): string {
  if (weekNumber === mesocycle.deloadWeek) {
    return `Week ${weekNumber} - Deload`;
  }

  if (weekNumber <= 2) {
    return `Week ${weekNumber} - Accumulation`;
  }

  if (weekNumber === mesocycle.durationWeeks - 1 && weekNumber !== mesocycle.deloadWeek) {
    return `Week ${weekNumber} - Intensification`;
  }

  if (weekNumber === mesocycle.durationWeeks && weekNumber !== mesocycle.deloadWeek) {
    return `Week ${weekNumber} - Peak`;
  }

  return `Week ${weekNumber}`;
}
