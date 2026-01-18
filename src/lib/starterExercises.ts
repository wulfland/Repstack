/**
 * Starter exercises seeded for new users
 * Can be deleted or modified by users
 */

import type { Exercise } from '../types/models';

export const starterExercises: Omit<Exercise, 'id' | 'createdAt'>[] = [
  // Chest exercises
  {
    name: 'Barbell Bench Press',
    category: 'barbell',
    muscleGroups: ['chest', 'triceps', 'shoulders'],
    isCustom: false,
    notes: 'Compound upper body exercise',
  },
  {
    name: 'Dumbbell Incline Press',
    category: 'dumbbell',
    muscleGroups: ['chest', 'shoulders', 'triceps'],
    isCustom: false,
  },
  {
    name: 'Chest Press Machine',
    category: 'machine',
    muscleGroups: ['chest', 'triceps'],
    isCustom: false,
  },
  {
    name: 'Cable Chest Fly',
    category: 'cable',
    muscleGroups: ['chest'],
    isCustom: false,
  },
  {
    name: 'Push-ups',
    category: 'bodyweight',
    muscleGroups: ['chest', 'triceps', 'shoulders'],
    isCustom: false,
  },

  // Back exercises
  {
    name: 'Barbell Row',
    category: 'barbell',
    muscleGroups: ['back', 'biceps'],
    isCustom: false,
    notes: 'Compound back exercise',
  },
  {
    name: 'Lat Pulldown',
    category: 'machine',
    muscleGroups: ['back', 'biceps'],
    isCustom: false,
  },
  {
    name: 'Seated Cable Row',
    category: 'cable',
    muscleGroups: ['back', 'biceps'],
    isCustom: false,
  },
  {
    name: 'Dumbbell Row',
    category: 'dumbbell',
    muscleGroups: ['back', 'biceps'],
    isCustom: false,
  },
  {
    name: 'Pull-ups',
    category: 'bodyweight',
    muscleGroups: ['back', 'biceps'],
    isCustom: false,
  },

  // Shoulder exercises
  {
    name: 'Overhead Press',
    category: 'barbell',
    muscleGroups: ['shoulders', 'triceps'],
    isCustom: false,
    notes: 'Compound shoulder exercise',
  },
  {
    name: 'Dumbbell Lateral Raise',
    category: 'dumbbell',
    muscleGroups: ['shoulders'],
    isCustom: false,
  },
  {
    name: 'Cable Face Pull',
    category: 'cable',
    muscleGroups: ['shoulders', 'back'],
    isCustom: false,
  },
  {
    name: 'Shoulder Press Machine',
    category: 'machine',
    muscleGroups: ['shoulders', 'triceps'],
    isCustom: false,
  },

  // Arm exercises
  {
    name: 'Barbell Curl',
    category: 'barbell',
    muscleGroups: ['biceps'],
    isCustom: false,
  },
  {
    name: 'Dumbbell Hammer Curl',
    category: 'dumbbell',
    muscleGroups: ['biceps', 'forearms'],
    isCustom: false,
  },
  {
    name: 'Cable Tricep Pushdown',
    category: 'cable',
    muscleGroups: ['triceps'],
    isCustom: false,
  },
  {
    name: 'Dumbbell Overhead Tricep Extension',
    category: 'dumbbell',
    muscleGroups: ['triceps'],
    isCustom: false,
  },

  // Leg exercises
  {
    name: 'Barbell Squat',
    category: 'barbell',
    muscleGroups: ['quads', 'glutes', 'hamstrings'],
    isCustom: false,
    notes: 'Compound lower body exercise',
  },
  {
    name: 'Leg Press',
    category: 'machine',
    muscleGroups: ['quads', 'glutes'],
    isCustom: false,
  },
  {
    name: 'Romanian Deadlift',
    category: 'barbell',
    muscleGroups: ['hamstrings', 'glutes', 'back'],
    isCustom: false,
  },
  {
    name: 'Leg Curl Machine',
    category: 'machine',
    muscleGroups: ['hamstrings'],
    isCustom: false,
  },
  {
    name: 'Leg Extension Machine',
    category: 'machine',
    muscleGroups: ['quads'],
    isCustom: false,
  },
  {
    name: 'Bulgarian Split Squat',
    category: 'dumbbell',
    muscleGroups: ['quads', 'glutes'],
    isCustom: false,
  },
  {
    name: 'Calf Raise Machine',
    category: 'machine',
    muscleGroups: ['calves'],
    isCustom: false,
  },
  {
    name: 'Walking Lunges',
    category: 'bodyweight',
    muscleGroups: ['quads', 'glutes', 'hamstrings'],
    isCustom: false,
  },

  // Core exercises
  {
    name: 'Plank',
    category: 'bodyweight',
    muscleGroups: ['abs', 'obliques'],
    isCustom: false,
  },
  {
    name: 'Cable Crunch',
    category: 'cable',
    muscleGroups: ['abs'],
    isCustom: false,
  },
  {
    name: 'Russian Twist',
    category: 'bodyweight',
    muscleGroups: ['abs', 'obliques'],
    isCustom: false,
  },
];
