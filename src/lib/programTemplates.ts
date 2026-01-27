/**
 * Program template definitions for common training splits
 * Following evidence-based hypertrophy training principles
 */

import type { ProgramTemplate } from '../types/models';

/**
 * Upper/Lower Split Template
 * 4 days per week - ideal for intermediate lifters
 * Alternates between upper and lower body training
 */
const upperLowerTemplate: ProgramTemplate = {
  id: 'upper_lower',
  name: 'Upper/Lower Split',
  description:
    '4 days per week training split alternating between upper and lower body. Great for building strength and size with balanced recovery.',
  daysPerWeek: 4,
  targetLevel: 'intermediate',
  days: [
    {
      name: 'Upper Day A',
      exercises: [
        {
          name: 'Horizontal Push (chest focus)',
          description: 'Bench press, dumbbell press, or chest press machine',
          muscleGroups: ['chest', 'triceps', 'shoulders'],
          targetSets: '3-4 sets',
          targetReps: '8-12 reps',
        },
        {
          name: 'Horizontal Pull (back focus)',
          description: 'Barbell row, dumbbell row, or seated cable row',
          muscleGroups: ['back', 'biceps'],
          targetSets: '3-4 sets',
          targetReps: '8-12 reps',
        },
        {
          name: 'Vertical Push (shoulders)',
          description: 'Overhead press, shoulder press machine, or dumbbell press',
          muscleGroups: ['shoulders', 'triceps'],
          targetSets: '2-3 sets',
          targetReps: '10-15 reps',
        },
        {
          name: 'Vertical Pull (lats)',
          description: 'Lat pulldown, pull-ups, or high cable row',
          muscleGroups: ['back', 'biceps'],
          targetSets: '2-3 sets',
          targetReps: '10-15 reps',
        },
        {
          name: 'Biceps',
          description: 'Barbell curl, dumbbell curl, or cable curl',
          muscleGroups: ['biceps'],
          targetSets: '2-3 sets',
          targetReps: '10-15 reps',
        },
        {
          name: 'Triceps',
          description: 'Tricep pushdown, overhead extension, or dips',
          muscleGroups: ['triceps'],
          targetSets: '2-3 sets',
          targetReps: '10-15 reps',
        },
      ],
    },
    {
      name: 'Lower Day A',
      exercises: [
        {
          name: 'Quad-dominant (squat pattern)',
          description: 'Barbell squat, front squat, or goblet squat',
          muscleGroups: ['quads', 'glutes'],
          targetSets: '3-4 sets',
          targetReps: '8-12 reps',
        },
        {
          name: 'Hip-hinge (hamstring focus)',
          description: 'Romanian deadlift, stiff-leg deadlift, or good mornings',
          muscleGroups: ['hamstrings', 'glutes', 'back'],
          targetSets: '3-4 sets',
          targetReps: '8-12 reps',
        },
        {
          name: 'Leg Press/Hack Squat',
          description: 'Additional quad volume with machine work',
          muscleGroups: ['quads', 'glutes'],
          targetSets: '3 sets',
          targetReps: '10-15 reps',
        },
        {
          name: 'Leg Curl',
          description: 'Lying, seated, or standing leg curl',
          muscleGroups: ['hamstrings'],
          targetSets: '3 sets',
          targetReps: '10-15 reps',
        },
        {
          name: 'Calves',
          description: 'Standing or seated calf raise',
          muscleGroups: ['calves'],
          targetSets: '3-4 sets',
          targetReps: '12-20 reps',
        },
      ],
    },
    {
      name: 'Upper Day B',
      exercises: [
        {
          name: 'Horizontal Push (chest focus)',
          description: 'Incline press, decline press, or different angle than Day A',
          muscleGroups: ['chest', 'triceps', 'shoulders'],
          targetSets: '3-4 sets',
          targetReps: '8-12 reps',
        },
        {
          name: 'Horizontal Pull (back focus)',
          description: 'Different rowing variation than Day A',
          muscleGroups: ['back', 'biceps'],
          targetSets: '3-4 sets',
          targetReps: '8-12 reps',
        },
        {
          name: 'Vertical Push (shoulders)',
          description: 'Lateral raises or upright row',
          muscleGroups: ['shoulders'],
          targetSets: '2-3 sets',
          targetReps: '12-15 reps',
        },
        {
          name: 'Vertical Pull (lats)',
          description: 'Different vertical pull than Day A',
          muscleGroups: ['back', 'biceps'],
          targetSets: '2-3 sets',
          targetReps: '10-15 reps',
        },
        {
          name: 'Biceps',
          description: 'Different curl variation than Day A',
          muscleGroups: ['biceps'],
          targetSets: '2-3 sets',
          targetReps: '10-15 reps',
        },
        {
          name: 'Triceps',
          description: 'Different tricep exercise than Day A',
          muscleGroups: ['triceps'],
          targetSets: '2-3 sets',
          targetReps: '10-15 reps',
        },
      ],
    },
    {
      name: 'Lower Day B',
      exercises: [
        {
          name: 'Quad-dominant (squat pattern)',
          description: 'Different squat variation than Day A',
          muscleGroups: ['quads', 'glutes'],
          targetSets: '3-4 sets',
          targetReps: '8-12 reps',
        },
        {
          name: 'Hip-hinge (hamstring focus)',
          description: 'Different hinge variation than Day A',
          muscleGroups: ['hamstrings', 'glutes', 'back'],
          targetSets: '3-4 sets',
          targetReps: '8-12 reps',
        },
        {
          name: 'Leg Extension',
          description: 'Quad isolation',
          muscleGroups: ['quads'],
          targetSets: '3 sets',
          targetReps: '12-15 reps',
        },
        {
          name: 'Leg Curl',
          description: 'Different leg curl variation than Day A',
          muscleGroups: ['hamstrings'],
          targetSets: '3 sets',
          targetReps: '10-15 reps',
        },
        {
          name: 'Calves',
          description: 'Different calf variation than Day A',
          muscleGroups: ['calves'],
          targetSets: '3-4 sets',
          targetReps: '12-20 reps',
        },
      ],
    },
  ],
};

/**
 * Push/Pull/Legs Template
 * 6 days per week - for advanced lifters with good recovery
 * Can also be run 3 days per week (one of each)
 */
const pushPullLegsTemplate: ProgramTemplate = {
  id: 'push_pull_legs',
  name: 'Push/Pull/Legs',
  description:
    '6 days per week split (or 3 days for beginners). Separates pushing, pulling, and leg movements for focused training and optimal recovery.',
  daysPerWeek: 6,
  targetLevel: 'intermediate',
  days: [
    {
      name: 'Push Day',
      exercises: [
        {
          name: 'Chest Compound',
          description: 'Barbell or dumbbell press (flat, incline, or decline)',
          muscleGroups: ['chest', 'triceps', 'shoulders'],
          targetSets: '3-4 sets',
          targetReps: '8-12 reps',
        },
        {
          name: 'Chest Isolation',
          description: 'Chest fly, cable crossover, or pec deck',
          muscleGroups: ['chest'],
          targetSets: '2-3 sets',
          targetReps: '10-15 reps',
        },
        {
          name: 'Shoulder Press',
          description: 'Overhead press with barbell, dumbbells, or machine',
          muscleGroups: ['shoulders', 'triceps'],
          targetSets: '3 sets',
          targetReps: '8-12 reps',
        },
        {
          name: 'Lateral Raises',
          description: 'Dumbbell or cable lateral raises for side delts',
          muscleGroups: ['shoulders'],
          targetSets: '3 sets',
          targetReps: '12-15 reps',
        },
        {
          name: 'Triceps',
          description: 'Tricep pushdown, overhead extension, or dips',
          muscleGroups: ['triceps'],
          targetSets: '3-4 sets',
          targetReps: '10-15 reps',
        },
      ],
    },
    {
      name: 'Pull Day',
      exercises: [
        {
          name: 'Back Compound',
          description: 'Deadlift, barbell row, or T-bar row',
          muscleGroups: ['back', 'biceps'],
          targetSets: '3-4 sets',
          targetReps: '6-10 reps',
        },
        {
          name: 'Lat-focused',
          description: 'Lat pulldown, pull-ups, or straight-arm pulldown',
          muscleGroups: ['back'],
          targetSets: '3 sets',
          targetReps: '8-12 reps',
        },
        {
          name: 'Rear Delts',
          description: 'Face pulls, reverse fly, or rear delt machine',
          muscleGroups: ['shoulders', 'back'],
          targetSets: '2-3 sets',
          targetReps: '12-15 reps',
        },
        {
          name: 'Biceps',
          description: 'Barbell curl, dumbbell curl, or cable curl',
          muscleGroups: ['biceps'],
          targetSets: '3-4 sets',
          targetReps: '10-15 reps',
        },
      ],
    },
    {
      name: 'Leg Day',
      exercises: [
        {
          name: 'Squat Variation',
          description: 'Barbell squat, front squat, or safety bar squat',
          muscleGroups: ['quads', 'glutes'],
          targetSets: '4 sets',
          targetReps: '6-10 reps',
        },
        {
          name: 'Leg Press',
          description: 'Heavy leg press for quad development',
          muscleGroups: ['quads', 'glutes'],
          targetSets: '3 sets',
          targetReps: '10-15 reps',
        },
        {
          name: 'Romanian Deadlift',
          description: 'RDL for hamstring and glute development',
          muscleGroups: ['hamstrings', 'glutes'],
          targetSets: '3 sets',
          targetReps: '8-12 reps',
        },
        {
          name: 'Leg Curl',
          description: 'Lying, seated, or standing leg curl',
          muscleGroups: ['hamstrings'],
          targetSets: '3 sets',
          targetReps: '10-15 reps',
        },
        {
          name: 'Calves',
          description: 'Standing or seated calf raise',
          muscleGroups: ['calves'],
          targetSets: '4 sets',
          targetReps: '12-20 reps',
        },
      ],
    },
  ],
};

/**
 * Full Body Template
 * 3 days per week - ideal for beginners or time-constrained lifters
 * Trains all major muscle groups each session
 */
const fullBodyTemplate: ProgramTemplate = {
  id: 'full_body',
  name: 'Full Body',
  description:
    '3 days per week full body training. Perfect for beginners or those with limited time. Hits all major muscle groups each session with adequate recovery.',
  daysPerWeek: 3,
  targetLevel: 'beginner',
  days: [
    {
      name: 'Day A',
      exercises: [
        {
          name: 'Compound Push',
          description: 'Bench press, overhead press, or push-ups',
          muscleGroups: ['chest', 'shoulders', 'triceps'],
          targetSets: '3 sets',
          targetReps: '8-12 reps',
        },
        {
          name: 'Compound Pull',
          description: 'Barbell row, lat pulldown, or pull-ups',
          muscleGroups: ['back', 'biceps'],
          targetSets: '3 sets',
          targetReps: '8-12 reps',
        },
        {
          name: 'Leg Compound',
          description: 'Squat, leg press, or goblet squat',
          muscleGroups: ['quads', 'glutes'],
          targetSets: '3 sets',
          targetReps: '8-12 reps',
        },
        {
          name: 'Isolation - Biceps',
          description: 'Any curl variation',
          muscleGroups: ['biceps'],
          targetSets: '2-3 sets',
          targetReps: '10-15 reps',
        },
        {
          name: 'Isolation - Calves',
          description: 'Calf raises',
          muscleGroups: ['calves'],
          targetSets: '2-3 sets',
          targetReps: '12-20 reps',
        },
      ],
    },
    {
      name: 'Day B',
      exercises: [
        {
          name: 'Compound Push',
          description: 'Different variation than Day A',
          muscleGroups: ['chest', 'shoulders', 'triceps'],
          targetSets: '3 sets',
          targetReps: '8-12 reps',
        },
        {
          name: 'Compound Pull',
          description: 'Different pulling pattern than Day A',
          muscleGroups: ['back', 'biceps'],
          targetSets: '3 sets',
          targetReps: '8-12 reps',
        },
        {
          name: 'Leg Compound',
          description: 'Romanian deadlift or leg press',
          muscleGroups: ['hamstrings', 'glutes'],
          targetSets: '3 sets',
          targetReps: '8-12 reps',
        },
        {
          name: 'Isolation - Triceps',
          description: 'Tricep pushdown or overhead extension',
          muscleGroups: ['triceps'],
          targetSets: '2-3 sets',
          targetReps: '10-15 reps',
        },
        {
          name: 'Isolation - Shoulders',
          description: 'Lateral raises',
          muscleGroups: ['shoulders'],
          targetSets: '2-3 sets',
          targetReps: '12-15 reps',
        },
      ],
    },
    {
      name: 'Day C',
      exercises: [
        {
          name: 'Compound Push',
          description: 'Third variation of pressing movement',
          muscleGroups: ['chest', 'shoulders', 'triceps'],
          targetSets: '3 sets',
          targetReps: '8-12 reps',
        },
        {
          name: 'Compound Pull',
          description: 'Third variation of pulling movement',
          muscleGroups: ['back', 'biceps'],
          targetSets: '3 sets',
          targetReps: '8-12 reps',
        },
        {
          name: 'Leg Compound',
          description: 'Different leg exercise than Day A & B',
          muscleGroups: ['quads', 'hamstrings', 'glutes'],
          targetSets: '3 sets',
          targetReps: '8-12 reps',
        },
        {
          name: 'Isolation - Abs',
          description: 'Crunches, planks, or cable crunch',
          muscleGroups: ['abs'],
          targetSets: '2-3 sets',
          targetReps: '12-20 reps',
        },
        {
          name: 'Isolation - Hamstrings',
          description: 'Leg curl variation',
          muscleGroups: ['hamstrings'],
          targetSets: '2-3 sets',
          targetReps: '10-15 reps',
        },
      ],
    },
  ],
};

/**
 * All available program templates
 */
export const PROGRAM_TEMPLATES: ProgramTemplate[] = [
  fullBodyTemplate,
  upperLowerTemplate,
  pushPullLegsTemplate,
];

/**
 * Get a template by ID
 */
export function getTemplateById(
  id: string
): ProgramTemplate | undefined {
  return PROGRAM_TEMPLATES.find((template) => template.id === id);
}
