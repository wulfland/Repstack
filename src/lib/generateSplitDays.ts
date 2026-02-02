/**
 * Generate split day configurations based on training split type
 */

import type { MesocycleSplitDay } from '../types/models';

/**
 * Generates empty split day configurations for a given training split type
 * Users can configure exercises for these split days later
 */
export function generateSplitDays(
  trainingSplit:
    | 'upper_lower'
    | 'push_pull_legs'
    | 'full_body'
    | 'bro_split'
    | 'custom'
): MesocycleSplitDay[] {
  switch (trainingSplit) {
    case 'full_body':
      return [
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
        },
      ];

    case 'upper_lower':
      return [
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
        },
      ];

    case 'push_pull_legs':
      return [
        {
          id: crypto.randomUUID(),
          name: 'Push Day',
          dayOrder: 1,
          exercises: [],
        },
        {
          id: crypto.randomUUID(),
          name: 'Pull Day',
          dayOrder: 2,
          exercises: [],
        },
        {
          id: crypto.randomUUID(),
          name: 'Leg Day',
          dayOrder: 3,
          exercises: [],
        },
      ];

    case 'bro_split':
      return [
        {
          id: crypto.randomUUID(),
          name: 'Chest Day',
          dayOrder: 1,
          exercises: [],
        },
        {
          id: crypto.randomUUID(),
          name: 'Back Day',
          dayOrder: 2,
          exercises: [],
        },
        {
          id: crypto.randomUUID(),
          name: 'Shoulder Day',
          dayOrder: 3,
          exercises: [],
        },
        {
          id: crypto.randomUUID(),
          name: 'Leg Day',
          dayOrder: 4,
          exercises: [],
        },
        {
          id: crypto.randomUUID(),
          name: 'Arm Day',
          dayOrder: 5,
          exercises: [],
        },
      ];

    case 'custom':
      return [
        {
          id: crypto.randomUUID(),
          name: 'Day 1',
          dayOrder: 1,
          exercises: [],
        },
      ];

    default:
      return [];
  }
}
