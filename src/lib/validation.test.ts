/**
 * Unit tests for validation utilities
 */

import { describe, it, expect } from 'vitest';
import {
  isValidMuscleGroup,
  isValidExperienceLevel,
  isValidUnits,
  isValidTheme,
  isValidExerciseCategory,
  validateUserProfile,
  validateExercise,
  validateWorkoutSet,
  validateWorkout,
  validateTrainingSession,
  validateMesocycle,
  validateMesocycleExercise,
  validateMesocycleSplitDay,
  sanitizeString,
  sanitizeNumber,
} from '../lib/validation';
import type {
  UserProfile,
  Exercise,
  WorkoutSet,
  Workout,
  TrainingSession,
  Mesocycle,
  MesocycleExercise,
  MesocycleSplitDay,
} from '../types/models';

describe('Type Guards', () => {
  describe('isValidMuscleGroup', () => {
    it('should return true for valid muscle groups', () => {
      expect(isValidMuscleGroup('chest')).toBe(true);
      expect(isValidMuscleGroup('back')).toBe(true);
      expect(isValidMuscleGroup('quads')).toBe(true);
      expect(isValidMuscleGroup('calves')).toBe(true);
    });

    it('should return false for invalid muscle groups', () => {
      expect(isValidMuscleGroup('invalid')).toBe(false);
      expect(isValidMuscleGroup('')).toBe(false);
      expect(isValidMuscleGroup('Chest')).toBe(false); // Case sensitive
    });
  });

  describe('isValidExperienceLevel', () => {
    it('should return true for valid experience levels', () => {
      expect(isValidExperienceLevel('beginner')).toBe(true);
      expect(isValidExperienceLevel('intermediate')).toBe(true);
      expect(isValidExperienceLevel('advanced')).toBe(true);
    });

    it('should return false for invalid experience levels', () => {
      expect(isValidExperienceLevel('expert')).toBe(false);
      expect(isValidExperienceLevel('')).toBe(false);
    });
  });

  describe('isValidUnits', () => {
    it('should return true for valid units', () => {
      expect(isValidUnits('metric')).toBe(true);
      expect(isValidUnits('imperial')).toBe(true);
    });

    it('should return false for invalid units', () => {
      expect(isValidUnits('pounds')).toBe(false);
      expect(isValidUnits('')).toBe(false);
    });
  });

  describe('isValidTheme', () => {
    it('should return true for valid themes', () => {
      expect(isValidTheme('light')).toBe(true);
      expect(isValidTheme('dark')).toBe(true);
      expect(isValidTheme('system')).toBe(true);
    });

    it('should return false for invalid themes', () => {
      expect(isValidTheme('auto')).toBe(false);
      expect(isValidTheme('')).toBe(false);
    });
  });

  describe('isValidExerciseCategory', () => {
    it('should return true for valid exercise categories', () => {
      expect(isValidExerciseCategory('machine')).toBe(true);
      expect(isValidExerciseCategory('barbell')).toBe(true);
      expect(isValidExerciseCategory('dumbbell')).toBe(true);
      expect(isValidExerciseCategory('bodyweight')).toBe(true);
      expect(isValidExerciseCategory('cable')).toBe(true);
      expect(isValidExerciseCategory('other')).toBe(true);
    });

    it('should return false for invalid exercise categories', () => {
      expect(isValidExerciseCategory('kettlebell')).toBe(false);
      expect(isValidExerciseCategory('')).toBe(false);
    });
  });
});

describe('validateUserProfile', () => {
  it('should validate a valid user profile', () => {
    const profile: Partial<UserProfile> = {
      name: 'John Doe',
      experienceLevel: 'intermediate',
      preferences: {
        units: 'metric',
        theme: 'dark',
        firstDayOfWeek: 1,
        defaultRestTimerSeconds: 90,
        restTimerSound: true,
        restTimerVibration: true,
        showRIRByDefault: true,
        autoAdvanceSet: false,
      },
    };

    const result = validateUserProfile(profile);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject profile without name', () => {
    const profile: Partial<UserProfile> = {
      experienceLevel: 'beginner',
    };

    const result = validateUserProfile(profile);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Name is required');
  });

  it('should reject profile with empty name', () => {
    const profile: Partial<UserProfile> = {
      name: '   ',
      experienceLevel: 'beginner',
    };

    const result = validateUserProfile(profile);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Name is required');
  });

  it('should reject profile with name too long', () => {
    const profile: Partial<UserProfile> = {
      name: 'a'.repeat(101),
      experienceLevel: 'beginner',
    };

    const result = validateUserProfile(profile);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Name must be less than 100 characters');
  });

  it('should reject profile with invalid experience level', () => {
    const profile: Partial<UserProfile> = {
      name: 'John',
      // @ts-expect-error Testing invalid value
      experienceLevel: 'expert',
    };

    const result = validateUserProfile(profile);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid experience level');
  });

  it('should reject profile with invalid units', () => {
    const profile: Partial<UserProfile> = {
      name: 'John',
      // @ts-expect-error Testing invalid preferences
      preferences: {
        units: 'pounds',
      },
    };

    const result = validateUserProfile(profile);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid units preference');
  });

  it('should reject profile with invalid theme', () => {
    const profile: Partial<UserProfile> = {
      name: 'John',
      // @ts-expect-error Testing invalid preferences
      preferences: {
        theme: 'auto',
      },
    };

    const result = validateUserProfile(profile);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid theme preference');
  });
});

describe('validateExercise', () => {
  it('should validate a valid exercise', () => {
    const exercise: Partial<Exercise> = {
      name: 'Bench Press',
      category: 'barbell',
      muscleGroups: ['chest', 'triceps'],
      isCustom: true,
    };

    const result = validateExercise(exercise);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject exercise without name', () => {
    const exercise: Partial<Exercise> = {
      category: 'barbell',
      muscleGroups: ['chest'],
    };

    const result = validateExercise(exercise);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Exercise name is required');
  });

  it('should reject exercise with name too long', () => {
    const exercise: Partial<Exercise> = {
      name: 'a'.repeat(201),
      category: 'barbell',
      muscleGroups: ['chest'],
    };

    const result = validateExercise(exercise);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      'Exercise name must be less than 200 characters'
    );
  });

  it('should reject exercise with invalid category', () => {
    const exercise: Partial<Exercise> = {
      name: 'Test',
      // @ts-expect-error Testing invalid category
      category: 'kettlebell',
      muscleGroups: ['chest'],
    };

    const result = validateExercise(exercise);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid exercise category');
  });

  it('should reject exercise without muscle groups', () => {
    const exercise: Partial<Exercise> = {
      name: 'Test',
      category: 'barbell',
      muscleGroups: [],
    };

    const result = validateExercise(exercise);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('At least one muscle group is required');
  });

  it('should reject exercise with invalid muscle groups', () => {
    const exercise: Partial<Exercise> = {
      name: 'Test',
      category: 'barbell',
      // @ts-expect-error Testing invalid muscle group
      muscleGroups: ['chest', 'invalid'],
    };

    const result = validateExercise(exercise);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Invalid muscle groups'))).toBe(
      true
    );
  });
});

describe('validateWorkoutSet', () => {
  it('should validate a valid workout set', () => {
    const set: Partial<WorkoutSet> = {
      exerciseId: 'ex-123',
      setNumber: 1,
      targetReps: 10,
      actualReps: 10,
      weight: 100,
      rir: 2,
      completed: true,
    };

    const result = validateWorkoutSet(set);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject set without exercise ID', () => {
    const set: Partial<WorkoutSet> = {
      setNumber: 1,
      targetReps: 10,
      weight: 100,
    };

    const result = validateWorkoutSet(set);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Exercise ID is required');
  });

  it('should reject set with invalid set number', () => {
    const set: Partial<WorkoutSet> = {
      exerciseId: 'ex-123',
      setNumber: 0,
      targetReps: 10,
      weight: 100,
    };

    const result = validateWorkoutSet(set);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Set number must be at least 1');
  });

  it('should reject set with invalid target reps', () => {
    const set: Partial<WorkoutSet> = {
      exerciseId: 'ex-123',
      setNumber: 1,
      targetReps: 0,
      weight: 100,
    };

    const result = validateWorkoutSet(set);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Target reps must be at least 1');
  });

  it('should reject set with target reps over 100', () => {
    const set: Partial<WorkoutSet> = {
      exerciseId: 'ex-123',
      setNumber: 1,
      targetReps: 101,
      weight: 100,
    };

    const result = validateWorkoutSet(set);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Target reps must be less than 100');
  });

  it('should reject set with negative actual reps', () => {
    const set: Partial<WorkoutSet> = {
      exerciseId: 'ex-123',
      setNumber: 1,
      targetReps: 10,
      actualReps: -1,
      weight: 100,
    };

    const result = validateWorkoutSet(set);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Actual reps cannot be negative');
  });

  it('should reject set with negative weight', () => {
    const set: Partial<WorkoutSet> = {
      exerciseId: 'ex-123',
      setNumber: 1,
      targetReps: 10,
      weight: -10,
    };

    const result = validateWorkoutSet(set);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Weight cannot be negative');
  });

  it('should reject set with invalid RIR', () => {
    const set: Partial<WorkoutSet> = {
      exerciseId: 'ex-123',
      setNumber: 1,
      targetReps: 10,
      weight: 100,
      rir: 11,
    };

    const result = validateWorkoutSet(set);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('RIR must be between 0 and 10');
  });
});

describe('validateWorkout', () => {
  it('should validate a valid workout', () => {
    const workout: Partial<Workout> = {
      date: new Date(),
      exercises: [
        {
          exerciseId: 'ex-123',
          sets: [
            {
              id: 'set-1',
              exerciseId: 'ex-123',
              setNumber: 1,
              targetReps: 10,
              weight: 100,
              completed: true,
            },
          ],
        },
      ],
      completed: true,
      duration: 60,
    };

    const result = validateWorkout(workout);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject workout without date', () => {
    const workout: Partial<Workout> = {
      exercises: [],
    };

    const result = validateWorkout(workout);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Workout date is required');
  });

  it('should reject workout with future date', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 2);

    const workout: Partial<Workout> = {
      date: futureDate,
      exercises: [
        {
          exerciseId: 'ex-123',
          sets: [],
        },
      ],
    };

    const result = validateWorkout(workout);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Workout date cannot be in the future');
  });

  it('should accept workout with date within 1 minute tolerance', () => {
    const now = new Date();
    now.setSeconds(now.getSeconds() + 30); // 30 seconds in future

    const workout: Partial<Workout> = {
      date: now,
      exercises: [
        {
          exerciseId: 'ex-123',
          sets: [],
        },
      ],
    };

    const result = validateWorkout(workout);
    expect(result.valid).toBe(true);
  });

  it('should reject workout without exercises', () => {
    const workout: Partial<Workout> = {
      date: new Date(),
      exercises: [],
    };

    const result = validateWorkout(workout);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('At least one exercise is required');
  });

  it('should reject workout with negative duration', () => {
    const workout: Partial<Workout> = {
      date: new Date(),
      exercises: [
        {
          exerciseId: 'ex-123',
          sets: [],
        },
      ],
      duration: -10,
    };

    const result = validateWorkout(workout);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Duration cannot be negative');
  });

  it('should reject workout with duration over 12 hours', () => {
    const workout: Partial<Workout> = {
      date: new Date(),
      exercises: [
        {
          exerciseId: 'ex-123',
          sets: [],
        },
      ],
      duration: 721,
    };

    const result = validateWorkout(workout);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      'Duration must be less than 720 minutes (12 hours)'
    );
  });
});

describe('validateTrainingSession', () => {
  it('should validate a valid training session', () => {
    const session: Partial<TrainingSession> = {
      workoutId: 'workout-123',
      exerciseId: 'ex-123',
      date: new Date(),
      pump: 4,
      soreness: 3,
      fatigue: 2,
      performance: 'good',
    };

    const result = validateTrainingSession(session);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject session without workout ID', () => {
    const session: Partial<TrainingSession> = {
      exerciseId: 'ex-123',
      date: new Date(),
    };

    const result = validateTrainingSession(session);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Workout ID is required');
  });

  it('should reject session without exercise ID', () => {
    const session: Partial<TrainingSession> = {
      workoutId: 'workout-123',
      date: new Date(),
    };

    const result = validateTrainingSession(session);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Exercise ID is required');
  });

  it('should reject session without date', () => {
    const session: Partial<TrainingSession> = {
      workoutId: 'workout-123',
      exerciseId: 'ex-123',
    };

    const result = validateTrainingSession(session);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Session date is required');
  });

  it('should reject session with invalid pump rating', () => {
    const session: Partial<TrainingSession> = {
      workoutId: 'workout-123',
      exerciseId: 'ex-123',
      date: new Date(),
      pump: 6,
    };

    const result = validateTrainingSession(session);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Pump rating must be between 1 and 5');
  });

  it('should reject session with invalid soreness rating', () => {
    const session: Partial<TrainingSession> = {
      workoutId: 'workout-123',
      exerciseId: 'ex-123',
      date: new Date(),
      soreness: 0,
    };

    const result = validateTrainingSession(session);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Soreness rating must be between 1 and 5');
  });

  it('should reject session with invalid fatigue rating', () => {
    const session: Partial<TrainingSession> = {
      workoutId: 'workout-123',
      exerciseId: 'ex-123',
      date: new Date(),
      fatigue: 6,
    };

    const result = validateTrainingSession(session);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Fatigue rating must be between 1 and 5');
  });

  it('should reject session with invalid performance rating', () => {
    const session: Partial<TrainingSession> = {
      workoutId: 'workout-123',
      exerciseId: 'ex-123',
      date: new Date(),
      // @ts-expect-error Testing invalid performance value
      performance: 'amazing',
    };

    const result = validateTrainingSession(session);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid performance rating');
  });
});

describe('validateMesocycle', () => {
  it('should validate a valid mesocycle', () => {
    const mesocycle: Partial<Mesocycle> = {
      name: 'Test Mesocycle',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-02-12'),
      durationWeeks: 6,
      currentWeek: 1,
      deloadWeek: 6,
      trainingSplit: 'upper_lower',
      status: 'active',
      splitDays: [
        {
          id: 'split-1',
          name: 'Upper',
          dayOrder: 1,
          exercises: [
            {
              exerciseId: 'ex-1',
              order: 0,
              targetSets: 3,
              targetRepsMin: 8,
              targetRepsMax: 12,
            },
          ],
        },
      ],
    };

    const result = validateMesocycle(mesocycle);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject mesocycle without name', () => {
    const mesocycle: Partial<Mesocycle> = {
      startDate: new Date(),
      endDate: new Date(),
      splitDays: [],
    };

    const result = validateMesocycle(mesocycle);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Mesocycle name is required');
  });

  it('should reject mesocycle with name too long', () => {
    const mesocycle: Partial<Mesocycle> = {
      name: 'a'.repeat(101),
      startDate: new Date(),
      endDate: new Date(),
      splitDays: [],
    };

    const result = validateMesocycle(mesocycle);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      'Mesocycle name must be less than 100 characters'
    );
  });

  it('should reject mesocycle without start date', () => {
    const mesocycle: Partial<Mesocycle> = {
      name: 'Test',
      endDate: new Date(),
      splitDays: [],
    };

    const result = validateMesocycle(mesocycle);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Start date is required');
  });

  it('should reject mesocycle without end date', () => {
    const mesocycle: Partial<Mesocycle> = {
      name: 'Test',
      startDate: new Date(),
      splitDays: [],
    };

    const result = validateMesocycle(mesocycle);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('End date is required');
  });

  it('should reject mesocycle with end date before start date', () => {
    const mesocycle: Partial<Mesocycle> = {
      name: 'Test',
      startDate: new Date('2024-02-01'),
      endDate: new Date('2024-01-01'),
      splitDays: [],
    };

    const result = validateMesocycle(mesocycle);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('End date must be after start date');
  });

  it('should reject mesocycle with invalid duration', () => {
    const mesocycle: Partial<Mesocycle> = {
      name: 'Test',
      startDate: new Date(),
      endDate: new Date(),
      durationWeeks: 3,
      splitDays: [],
    };

    const result = validateMesocycle(mesocycle);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Duration must be between 4 and 6 weeks');
  });

  it('should reject mesocycle with invalid current week', () => {
    const mesocycle: Partial<Mesocycle> = {
      name: 'Test',
      startDate: new Date(),
      endDate: new Date(),
      currentWeek: 7,
      splitDays: [],
    };

    const result = validateMesocycle(mesocycle);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Current week must be between 1 and 6');
  });

  it('should reject mesocycle with invalid training split', () => {
    const mesocycle: Partial<Mesocycle> = {
      name: 'Test',
      startDate: new Date(),
      endDate: new Date(),
      // @ts-expect-error Testing invalid training split
      trainingSplit: 'invalid',
      splitDays: [],
    };

    const result = validateMesocycle(mesocycle);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid training split');
  });

  it('should reject mesocycle with invalid status', () => {
    const mesocycle: Partial<Mesocycle> = {
      name: 'Test',
      startDate: new Date(),
      endDate: new Date(),
      // @ts-expect-error Testing invalid status
      status: 'invalid',
      splitDays: [],
    };

    const result = validateMesocycle(mesocycle);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Invalid mesocycle status');
  });

  it('should reject mesocycle without split days', () => {
    const mesocycle: Partial<Mesocycle> = {
      name: 'Test',
      startDate: new Date(),
      endDate: new Date(),
    };

    const result = validateMesocycle(mesocycle);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Split days configuration is required');
  });
});

describe('validateMesocycleExercise', () => {
  it('should validate a valid mesocycle exercise', () => {
    const exercise: Partial<MesocycleExercise> = {
      exerciseId: 'ex-123',
      order: 0,
      targetSets: 3,
      targetRepsMin: 8,
      targetRepsMax: 12,
      restSeconds: 90,
    };

    const result = validateMesocycleExercise(exercise);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject exercise without exercise ID', () => {
    const exercise: Partial<MesocycleExercise> = {
      order: 0,
      targetSets: 3,
      targetRepsMin: 8,
      targetRepsMax: 12,
    };

    const result = validateMesocycleExercise(exercise);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Exercise ID is required');
  });

  it('should reject exercise with invalid target sets', () => {
    const exercise: Partial<MesocycleExercise> = {
      exerciseId: 'ex-123',
      order: 0,
      targetSets: 11,
      targetRepsMin: 8,
      targetRepsMax: 12,
    };

    const result = validateMesocycleExercise(exercise);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Target sets must be between 1 and 10');
  });

  it('should reject exercise with min reps > max reps', () => {
    const exercise: Partial<MesocycleExercise> = {
      exerciseId: 'ex-123',
      order: 0,
      targetSets: 3,
      targetRepsMin: 15,
      targetRepsMax: 10,
    };

    const result = validateMesocycleExercise(exercise);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      'Target minimum reps cannot exceed maximum reps'
    );
  });

  it('should reject exercise with invalid rest seconds', () => {
    const exercise: Partial<MesocycleExercise> = {
      exerciseId: 'ex-123',
      order: 0,
      targetSets: 3,
      targetRepsMin: 8,
      targetRepsMax: 12,
      restSeconds: 601,
    };

    const result = validateMesocycleExercise(exercise);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      'Rest time must be between 0 and 600 seconds'
    );
  });
});

describe('validateMesocycleSplitDay', () => {
  it('should validate a valid split day', () => {
    const splitDay: Partial<MesocycleSplitDay> = {
      name: 'Upper Day',
      dayOrder: 1,
      exercises: [
        {
          exerciseId: 'ex-1',
          order: 0,
          targetSets: 3,
          targetRepsMin: 8,
          targetRepsMax: 12,
        },
      ],
    };

    const result = validateMesocycleSplitDay(splitDay);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('should reject split day without name', () => {
    const splitDay: Partial<MesocycleSplitDay> = {
      dayOrder: 1,
      exercises: [],
    };

    const result = validateMesocycleSplitDay(splitDay);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Split day name is required');
  });

  it('should reject split day with name too long', () => {
    const splitDay: Partial<MesocycleSplitDay> = {
      name: 'a'.repeat(51),
      dayOrder: 1,
      exercises: [],
    };

    const result = validateMesocycleSplitDay(splitDay);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain(
      'Split day name must be less than 50 characters'
    );
  });

  it('should reject split day with invalid day order', () => {
    const splitDay: Partial<MesocycleSplitDay> = {
      name: 'Upper',
      dayOrder: 0,
      exercises: [],
    };

    const result = validateMesocycleSplitDay(splitDay);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Day order must be at least 1');
  });

  it('should propagate exercise validation errors', () => {
    const splitDay: Partial<MesocycleSplitDay> = {
      name: 'Upper',
      dayOrder: 1,
      exercises: [
        {
          exerciseId: '',
          order: 0,
          targetSets: 3,
          targetRepsMin: 8,
          targetRepsMax: 12,
        },
      ],
    };

    const result = validateMesocycleSplitDay(splitDay);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Exercise 1'))).toBe(true);
  });
});

describe('Sanitization', () => {
  describe('sanitizeString', () => {
    it('should trim whitespace', () => {
      expect(sanitizeString('  hello  ')).toBe('hello');
    });

    it('should encode HTML special characters', () => {
      expect(sanitizeString('<script>alert("xss")</script>')).toBe(
        '&lt;script&gt;alert(&quot;xss&quot;)&lt;/script&gt;'
      );
    });

    it('should handle ampersands', () => {
      expect(sanitizeString('Tom & Jerry')).toBe('Tom &amp; Jerry');
    });

    it('should handle single quotes', () => {
      expect(sanitizeString("It's a test")).toBe('It&#39;s a test');
    });

    it('should handle empty string', () => {
      expect(sanitizeString('')).toBe('');
    });
  });

  describe('sanitizeNumber', () => {
    it('should clamp number to range', () => {
      expect(sanitizeNumber(5, 0, 10)).toBe(5);
      expect(sanitizeNumber(-5, 0, 10)).toBe(0);
      expect(sanitizeNumber(15, 0, 10)).toBe(10);
    });

    it('should work with negative ranges', () => {
      expect(sanitizeNumber(-5, -10, -1)).toBe(-5);
      expect(sanitizeNumber(-15, -10, -1)).toBe(-10);
      expect(sanitizeNumber(0, -10, -1)).toBe(-1);
    });
  });
});
