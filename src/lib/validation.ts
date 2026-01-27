/**
 * Data validation utilities for ensuring data integrity
 */

import type {
  UserProfile,
  Exercise,
  WorkoutSet,
  Workout,
  TrainingSession,
  Mesocycle,
  MuscleGroup,
  MesocycleExercise,
  MesocycleSplitDay,
} from '../types/models';

// Type guards
export function isValidMuscleGroup(value: string): value is MuscleGroup {
  const validMuscleGroups: MuscleGroup[] = [
    'chest',
    'back',
    'shoulders',
    'biceps',
    'triceps',
    'forearms',
    'abs',
    'obliques',
    'quads',
    'hamstrings',
    'glutes',
    'calves',
  ];
  return validMuscleGroups.includes(value as MuscleGroup);
}

export function isValidExperienceLevel(
  value: string
): value is 'beginner' | 'intermediate' | 'advanced' {
  return ['beginner', 'intermediate', 'advanced'].includes(value);
}

export function isValidUnits(value: string): value is 'metric' | 'imperial' {
  return ['metric', 'imperial'].includes(value);
}

export function isValidTheme(
  value: string
): value is 'light' | 'dark' | 'system' {
  return ['light', 'dark', 'system'].includes(value);
}

export function isValidExerciseCategory(
  value: string
): value is
  | 'machine'
  | 'barbell'
  | 'dumbbell'
  | 'bodyweight'
  | 'cable'
  | 'other' {
  return [
    'machine',
    'barbell',
    'dumbbell',
    'bodyweight',
    'cable',
    'other',
  ].includes(value);
}

// Validation functions
export function validateUserProfile(profile: Partial<UserProfile>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!profile.name || profile.name.trim().length === 0) {
    errors.push('Name is required');
  }

  if (profile.name && profile.name.length > 100) {
    errors.push('Name must be less than 100 characters');
  }

  if (
    profile.experienceLevel &&
    !isValidExperienceLevel(profile.experienceLevel)
  ) {
    errors.push('Invalid experience level');
  }

  if (profile.preferences?.units && !isValidUnits(profile.preferences.units)) {
    errors.push('Invalid units preference');
  }

  if (profile.preferences?.theme && !isValidTheme(profile.preferences.theme)) {
    errors.push('Invalid theme preference');
  }

  return { valid: errors.length === 0, errors };
}

export function validateExercise(exercise: Partial<Exercise>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!exercise.name || exercise.name.trim().length === 0) {
    errors.push('Exercise name is required');
  }

  if (exercise.name && exercise.name.length > 200) {
    errors.push('Exercise name must be less than 200 characters');
  }

  if (exercise.category && !isValidExerciseCategory(exercise.category)) {
    errors.push('Invalid exercise category');
  }

  if (exercise.muscleGroups && exercise.muscleGroups.length === 0) {
    errors.push('At least one muscle group is required');
  }

  if (exercise.muscleGroups) {
    const invalidMuscleGroups = exercise.muscleGroups.filter(
      (mg) => !isValidMuscleGroup(mg)
    );
    if (invalidMuscleGroups.length > 0) {
      errors.push(`Invalid muscle groups: ${invalidMuscleGroups.join(', ')}`);
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateWorkoutSet(set: Partial<WorkoutSet>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!set.exerciseId || set.exerciseId.trim().length === 0) {
    errors.push('Exercise ID is required');
  }

  if (set.setNumber !== undefined && set.setNumber < 1) {
    errors.push('Set number must be at least 1');
  }

  if (set.targetReps !== undefined && set.targetReps < 1) {
    errors.push('Target reps must be at least 1');
  }

  if (set.targetReps !== undefined && set.targetReps > 100) {
    errors.push('Target reps must be less than 100');
  }

  if (set.actualReps !== undefined && set.actualReps < 0) {
    errors.push('Actual reps cannot be negative');
  }

  if (set.weight !== undefined && set.weight < 0) {
    errors.push('Weight cannot be negative');
  }

  if (set.rir !== undefined && (set.rir < 0 || set.rir > 10)) {
    errors.push('RIR must be between 0 and 10');
  }

  return { valid: errors.length === 0, errors };
}

export function validateWorkout(workout: Partial<Workout>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!workout.date) {
    errors.push('Workout date is required');
  }

  if (workout.date) {
    const now = new Date();
    // Allow a small tolerance to avoid flagging "just now" workouts as future
    const FUTURE_TOLERANCE_MS = 60 * 1000; // 1 minute
    if (workout.date.getTime() - now.getTime() > FUTURE_TOLERANCE_MS) {
      errors.push('Workout date cannot be in the future');
    }
  }

  if (!workout.exercises || workout.exercises.length === 0) {
    errors.push('At least one exercise is required');
  }

  if (workout.duration !== undefined && workout.duration < 0) {
    errors.push('Duration cannot be negative');
  }

  if (workout.duration !== undefined && workout.duration > 720) {
    errors.push('Duration must be less than 720 minutes (12 hours)');
  }

  return { valid: errors.length === 0, errors };
}

export function validateTrainingSession(session: Partial<TrainingSession>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!session.workoutId || session.workoutId.trim().length === 0) {
    errors.push('Workout ID is required');
  }

  if (!session.exerciseId || session.exerciseId.trim().length === 0) {
    errors.push('Exercise ID is required');
  }

  if (!session.date) {
    errors.push('Session date is required');
  }

  if (session.pump !== undefined && (session.pump < 1 || session.pump > 5)) {
    errors.push('Pump rating must be between 1 and 5');
  }

  if (
    session.soreness !== undefined &&
    (session.soreness < 1 || session.soreness > 5)
  ) {
    errors.push('Soreness rating must be between 1 and 5');
  }

  if (
    session.fatigue !== undefined &&
    (session.fatigue < 1 || session.fatigue > 5)
  ) {
    errors.push('Fatigue rating must be between 1 and 5');
  }

  if (
    session.performance &&
    !['excellent', 'good', 'average', 'poor'].includes(session.performance)
  ) {
    errors.push('Invalid performance rating');
  }

  return { valid: errors.length === 0, errors };
}

export function validateMesocycle(mesocycle: Partial<Mesocycle>): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!mesocycle.name || mesocycle.name.trim().length === 0) {
    errors.push('Mesocycle name is required');
  }

  if (mesocycle.name && mesocycle.name.length > 100) {
    errors.push('Mesocycle name must be less than 100 characters');
  }

  if (!mesocycle.startDate) {
    errors.push('Start date is required');
  }

  if (!mesocycle.endDate) {
    errors.push('End date is required');
  }

  if (mesocycle.startDate && mesocycle.endDate) {
    if (mesocycle.endDate < mesocycle.startDate) {
      errors.push('End date must be after start date');
    }
  }

  if (
    mesocycle.durationWeeks !== undefined &&
    (mesocycle.durationWeeks < 4 || mesocycle.durationWeeks > 6)
  ) {
    errors.push('Duration must be between 4 and 6 weeks');
  }

  if (
    mesocycle.currentWeek !== undefined &&
    (mesocycle.currentWeek < 1 || mesocycle.currentWeek > 6)
  ) {
    errors.push('Current week must be between 1 and 6');
  }

  if (
    mesocycle.deloadWeek !== undefined &&
    (mesocycle.deloadWeek < 1 || mesocycle.deloadWeek > 6)
  ) {
    errors.push('Deload week must be between 1 and 6');
  }

  if (
    mesocycle.trainingSplit &&
    ![
      'upper_lower',
      'push_pull_legs',
      'full_body',
      'bro_split',
      'custom',
    ].includes(mesocycle.trainingSplit)
  ) {
    errors.push('Invalid training split');
  }

  if (
    mesocycle.status &&
    !['planned', 'active', 'completed', 'abandoned'].includes(mesocycle.status)
  ) {
    errors.push('Invalid mesocycle status');
  }

  if (mesocycle.splitDays) {
    mesocycle.splitDays.forEach((splitDay, index) => {
      const splitDayValidation = validateMesocycleSplitDay(splitDay);
      if (!splitDayValidation.valid) {
        errors.push(
          `Split day ${index + 1}: ${splitDayValidation.errors.join(', ')}`
        );
      }
    });
  }

  return { valid: errors.length === 0, errors };
}

// Sanitization functions
export function sanitizeString(input: string): string {
  const safeInput = (input ?? '').trim();

  // Encode special HTML characters to reduce XSS risk when rendering as HTML
  return safeInput.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      case "'":
        return '&#39;';
      default:
        return char;
    }
  });
}

export function sanitizeNumber(
  input: number,
  min: number,
  max: number
): number {
  return Math.max(min, Math.min(max, input));
}

// Validation for MesocycleExercise
export function validateMesocycleExercise(
  exercise: Partial<MesocycleExercise>
): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!exercise.exerciseId || exercise.exerciseId.trim().length === 0) {
    errors.push('Exercise ID is required');
  }

  if (exercise.order !== undefined && exercise.order < 0) {
    errors.push('Exercise order must be non-negative');
  }

  if (
    exercise.targetSets !== undefined &&
    (exercise.targetSets < 1 || exercise.targetSets > 10)
  ) {
    errors.push('Target sets must be between 1 and 10');
  }

  if (
    exercise.targetRepsMin !== undefined &&
    (exercise.targetRepsMin < 1 || exercise.targetRepsMin > 50)
  ) {
    errors.push('Target minimum reps must be between 1 and 50');
  }

  if (
    exercise.targetRepsMax !== undefined &&
    (exercise.targetRepsMax < 1 || exercise.targetRepsMax > 50)
  ) {
    errors.push('Target maximum reps must be between 1 and 50');
  }

  if (
    exercise.targetRepsMin !== undefined &&
    exercise.targetRepsMax !== undefined &&
    exercise.targetRepsMin > exercise.targetRepsMax
  ) {
    errors.push('Target minimum reps cannot exceed maximum reps');
  }

  if (
    exercise.restSeconds !== undefined &&
    (exercise.restSeconds < 0 || exercise.restSeconds > 600)
  ) {
    errors.push('Rest time must be between 0 and 600 seconds');
  }

  return { valid: errors.length === 0, errors };
}

// Validation for MesocycleSplitDay
export function validateMesocycleSplitDay(
  splitDay: Partial<MesocycleSplitDay>
): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!splitDay.name || splitDay.name.trim().length === 0) {
    errors.push('Split day name is required');
  }

  if (splitDay.name && splitDay.name.length > 50) {
    errors.push('Split day name must be less than 50 characters');
  }

  if (splitDay.dayOrder !== undefined && splitDay.dayOrder < 1) {
    errors.push('Day order must be at least 1');
  }

  if (splitDay.exercises) {
    splitDay.exercises.forEach((exercise, index) => {
      const exerciseValidation = validateMesocycleExercise(exercise);
      if (!exerciseValidation.valid) {
        errors.push(
          `Exercise ${index + 1}: ${exerciseValidation.errors.join(', ')}`
        );
      }
    });
  }

  return { valid: errors.length === 0, errors };
}
