/**
 * Utilities for seeding initial data for new users
 */

import { db } from '../db';
import { createExercise } from '../db/service';
import { starterExercises } from './starterExercises';

/**
 * Seeds starter exercises if the database is empty
 * Returns true if exercises were seeded, false if already populated
 */
export async function seedStarterExercises(): Promise<boolean> {
  const existingExercises = await db.exercises.count();
  
  // Only seed if database is empty
  if (existingExercises > 0) {
    return false;
  }

  // Add all starter exercises one by one to avoid race conditions
  for (const exercise of starterExercises) {
    // Check if exercise with this name already exists
    const existing = await db.exercises
      .where('name')
      .equals(exercise.name)
      .first();
    
    if (!existing) {
      await createExercise(exercise);
    }
  }

  return true;
}

/**
 * Check if starter exercises have been seeded
 */
export async function hasStarterExercises(): Promise<boolean> {
  const count = await db.exercises.count();
  return count > 0;
}
