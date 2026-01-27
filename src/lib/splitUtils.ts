/**
 * Utility functions for managing mesocycle split days
 */

import type {
  Mesocycle,
  MesocycleSplitDay,
  MuscleGroup,
} from '../types/models';

/**
 * Generate default split days based on training split type
 */
export function generateDefaultSplitDays(
  trainingSplit: Mesocycle['trainingSplit']
): MesocycleSplitDay[] {
  const splitDays: MesocycleSplitDay[] = [];

  switch (trainingSplit) {
    case 'upper_lower':
      splitDays.push(
        {
          id: crypto.randomUUID(),
          name: 'Upper A',
          dayOrder: 1,
          exercises: [],
        },
        {
          id: crypto.randomUUID(),
          name: 'Lower A',
          dayOrder: 2,
          exercises: [],
        },
        {
          id: crypto.randomUUID(),
          name: 'Upper B',
          dayOrder: 3,
          exercises: [],
        },
        {
          id: crypto.randomUUID(),
          name: 'Lower B',
          dayOrder: 4,
          exercises: [],
        }
      );
      break;

    case 'push_pull_legs':
      splitDays.push(
        {
          id: crypto.randomUUID(),
          name: 'Push',
          dayOrder: 1,
          exercises: [],
        },
        {
          id: crypto.randomUUID(),
          name: 'Pull',
          dayOrder: 2,
          exercises: [],
        },
        {
          id: crypto.randomUUID(),
          name: 'Legs',
          dayOrder: 3,
          exercises: [],
        }
      );
      break;

    case 'full_body':
      splitDays.push(
        {
          id: crypto.randomUUID(),
          name: 'Full Body A',
          dayOrder: 1,
          exercises: [],
        },
        {
          id: crypto.randomUUID(),
          name: 'Full Body B',
          dayOrder: 2,
          exercises: [],
        },
        {
          id: crypto.randomUUID(),
          name: 'Full Body C',
          dayOrder: 3,
          exercises: [],
        }
      );
      break;

    case 'bro_split':
      splitDays.push(
        {
          id: crypto.randomUUID(),
          name: 'Chest',
          dayOrder: 1,
          exercises: [],
        },
        {
          id: crypto.randomUUID(),
          name: 'Back',
          dayOrder: 2,
          exercises: [],
        },
        {
          id: crypto.randomUUID(),
          name: 'Shoulders',
          dayOrder: 3,
          exercises: [],
        },
        {
          id: crypto.randomUUID(),
          name: 'Arms',
          dayOrder: 4,
          exercises: [],
        },
        {
          id: crypto.randomUUID(),
          name: 'Legs',
          dayOrder: 5,
          exercises: [],
        }
      );
      break;

    case 'custom':
      // For custom splits, start with one empty day
      splitDays.push({
        id: crypto.randomUUID(),
        name: 'Day 1',
        dayOrder: 1,
        exercises: [],
      });
      break;
  }

  return splitDays;
}

/**
 * Get expected muscle groups for a split day based on its name
 */
export function getExpectedMuscleGroupsForSplitDay(
  splitDayName: string
): MuscleGroup[] {
  const lowerName = splitDayName.toLowerCase();

  // Push day muscle groups
  if (lowerName.includes('push')) {
    return ['chest', 'shoulders', 'triceps'];
  }

  // Pull day muscle groups
  if (lowerName.includes('pull')) {
    return ['back', 'biceps', 'forearms'];
  }

  // Leg day muscle groups
  if (lowerName.includes('leg')) {
    return ['quads', 'hamstrings', 'glutes', 'calves'];
  }

  // Upper body
  if (lowerName.includes('upper')) {
    return [
      'chest',
      'back',
      'shoulders',
      'biceps',
      'triceps',
      'forearms',
      'abs',
      'obliques',
    ];
  }

  // Lower body
  if (lowerName.includes('lower')) {
    return ['quads', 'hamstrings', 'glutes', 'calves', 'abs', 'obliques'];
  }

  // Chest day
  if (lowerName.includes('chest')) {
    return ['chest', 'triceps', 'shoulders'];
  }

  // Back day
  if (lowerName.includes('back')) {
    return ['back', 'biceps', 'forearms'];
  }

  // Shoulder day
  if (lowerName.includes('shoulder')) {
    return ['shoulders', 'triceps'];
  }

  // Arm day
  if (lowerName.includes('arm')) {
    return ['biceps', 'triceps', 'forearms'];
  }

  // Full body can include any muscle group
  if (lowerName.includes('full')) {
    return [
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
  }

  // Default for custom or unknown - allow all muscle groups
  return [
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
}

/**
 * Validate if an exercise's muscle groups are appropriate for a split day
 * Returns true if at least one muscle group matches
 */
export function isExerciseValidForSplitDay(
  exerciseMuscleGroups: MuscleGroup[],
  splitDayName: string
): boolean {
  const expectedMuscleGroups =
    getExpectedMuscleGroupsForSplitDay(splitDayName);

  // Check if at least one exercise muscle group is in the expected list
  return exerciseMuscleGroups.some((muscle) =>
    expectedMuscleGroups.includes(muscle)
  );
}
