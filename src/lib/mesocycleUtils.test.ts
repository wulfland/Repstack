/**
 * Unit tests for mesocycle utilities
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  calculateMesocycleWeek,
  getMesocycleWeekDescription,
  updateMesocycleProgress,
  getWorkoutMesocycleInfo,
  checkMesocycleCompletion,
  getNextSplitDay,
} from '../lib/mesocycleUtils';
import { db } from '../db';
import {
  createMesocycle,
  createWorkout,
  createExercise,
} from '../db/service';
import type { Mesocycle, Workout } from '../types/models';

describe('Mesocycle Utilities', () => {
  describe('calculateMesocycleWeek', () => {
    it('should calculate week 1 for start date', () => {
      const mesocycle: Mesocycle = {
        id: 'meso-1',
        name: 'Test Mesocycle',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-02-11'),
        durationWeeks: 6,
        currentWeek: 1,
        deloadWeek: 6,
        trainingSplit: 'upper_lower',
        splitDays: [],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const week = calculateMesocycleWeek(
        mesocycle,
        new Date('2024-01-01')
      );
      expect(week).toBe(1);
    });

    it('should calculate week 2 for second week', () => {
      const mesocycle: Mesocycle = {
        id: 'meso-1',
        name: 'Test Mesocycle',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-02-11'),
        durationWeeks: 6,
        currentWeek: 1,
        deloadWeek: 6,
        trainingSplit: 'upper_lower',
        splitDays: [],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Day 8 should be week 2
      const week = calculateMesocycleWeek(
        mesocycle,
        new Date('2024-01-08')
      );
      expect(week).toBe(2);
    });

    it('should calculate correct week for middle of mesocycle', () => {
      const mesocycle: Mesocycle = {
        id: 'meso-1',
        name: 'Test Mesocycle',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-02-11'),
        durationWeeks: 6,
        currentWeek: 1,
        deloadWeek: 6,
        trainingSplit: 'upper_lower',
        splitDays: [],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Day 22 should be week 4 (days 22-28)
      const week = calculateMesocycleWeek(
        mesocycle,
        new Date('2024-01-22')
      );
      expect(week).toBe(4);
    });

    it('should calculate week 6 for last week', () => {
      const mesocycle: Mesocycle = {
        id: 'meso-1',
        name: 'Test Mesocycle',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-02-11'),
        durationWeeks: 6,
        currentWeek: 1,
        deloadWeek: 6,
        trainingSplit: 'upper_lower',
        splitDays: [],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Day 36 should be week 6
      const week = calculateMesocycleWeek(
        mesocycle,
        new Date('2024-02-05')
      );
      expect(week).toBe(6);
    });

    it('should return null for date before mesocycle start', () => {
      const mesocycle: Mesocycle = {
        id: 'meso-1',
        name: 'Test Mesocycle',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-02-11'),
        durationWeeks: 6,
        currentWeek: 1,
        deloadWeek: 6,
        trainingSplit: 'upper_lower',
        splitDays: [],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const week = calculateMesocycleWeek(
        mesocycle,
        new Date('2023-12-31')
      );
      expect(week).toBeNull();
    });

    it('should return null for date after mesocycle end', () => {
      const mesocycle: Mesocycle = {
        id: 'meso-1',
        name: 'Test Mesocycle',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-02-11'),
        durationWeeks: 6,
        currentWeek: 1,
        deloadWeek: 6,
        trainingSplit: 'upper_lower',
        splitDays: [],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const week = calculateMesocycleWeek(
        mesocycle,
        new Date('2024-02-12')
      );
      expect(week).toBeNull();
    });

    it('should handle dates with different times on same day', () => {
      const mesocycle: Mesocycle = {
        id: 'meso-1',
        name: 'Test Mesocycle',
        startDate: new Date('2024-01-01T00:00:00'),
        endDate: new Date('2024-02-11T23:59:59'),
        durationWeeks: 6,
        currentWeek: 1,
        deloadWeek: 6,
        trainingSplit: 'upper_lower',
        splitDays: [],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Both should be week 1 regardless of time
      const morning = calculateMesocycleWeek(
        mesocycle,
        new Date('2024-01-01T08:00:00')
      );
      const evening = calculateMesocycleWeek(
        mesocycle,
        new Date('2024-01-01T20:00:00')
      );

      expect(morning).toBe(1);
      expect(evening).toBe(1);
    });

    it('should not exceed durationWeeks', () => {
      const mesocycle: Mesocycle = {
        id: 'meso-1',
        name: 'Test Mesocycle',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-28'),
        durationWeeks: 4,
        currentWeek: 1,
        deloadWeek: 4,
        trainingSplit: 'upper_lower',
        splitDays: [],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Last day should be week 4, not higher
      const week = calculateMesocycleWeek(
        mesocycle,
        new Date('2024-01-28')
      );
      expect(week).toBe(4);
    });
  });

  describe('getMesocycleWeekDescription', () => {
    it('should label deload week', () => {
      const mesocycle: Mesocycle = {
        id: 'meso-1',
        name: 'Test',
        startDate: new Date(),
        endDate: new Date(),
        durationWeeks: 6,
        currentWeek: 6,
        deloadWeek: 6,
        trainingSplit: 'upper_lower',
        splitDays: [],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const description = getMesocycleWeekDescription(mesocycle, 6);
      expect(description).toBe('Week 6 - Deload');
    });

    it('should label accumulation phase (weeks 1-2)', () => {
      const mesocycle: Mesocycle = {
        id: 'meso-1',
        name: 'Test',
        startDate: new Date(),
        endDate: new Date(),
        durationWeeks: 6,
        currentWeek: 1,
        deloadWeek: 6,
        trainingSplit: 'upper_lower',
        splitDays: [],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(getMesocycleWeekDescription(mesocycle, 1)).toBe(
        'Week 1 - Accumulation'
      );
      expect(getMesocycleWeekDescription(mesocycle, 2)).toBe(
        'Week 2 - Accumulation'
      );
    });

    it('should label intensification phase (second to last week)', () => {
      const mesocycle: Mesocycle = {
        id: 'meso-1',
        name: 'Test',
        startDate: new Date(),
        endDate: new Date(),
        durationWeeks: 6,
        currentWeek: 5,
        deloadWeek: 6,
        trainingSplit: 'upper_lower',
        splitDays: [],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const description = getMesocycleWeekDescription(mesocycle, 5);
      expect(description).toBe('Week 5 - Intensification');
    });

    it('should label peak phase (last week if not deload)', () => {
      const mesocycle: Mesocycle = {
        id: 'meso-1',
        name: 'Test',
        startDate: new Date(),
        endDate: new Date(),
        durationWeeks: 6,
        currentWeek: 6,
        deloadWeek: 4,
        trainingSplit: 'upper_lower',
        splitDays: [],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const description = getMesocycleWeekDescription(mesocycle, 6);
      expect(description).toBe('Week 6 - Peak');
    });

    it('should handle 4-week mesocycle', () => {
      const mesocycle: Mesocycle = {
        id: 'meso-1',
        name: 'Test',
        startDate: new Date(),
        endDate: new Date(),
        durationWeeks: 4,
        currentWeek: 1,
        deloadWeek: 4,
        trainingSplit: 'upper_lower',
        splitDays: [],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(getMesocycleWeekDescription(mesocycle, 1)).toBe(
        'Week 1 - Accumulation'
      );
      expect(getMesocycleWeekDescription(mesocycle, 3)).toBe(
        'Week 3 - Intensification'
      );
      expect(getMesocycleWeekDescription(mesocycle, 4)).toBe('Week 4 - Deload');
    });

    it('should label middle weeks generically', () => {
      const mesocycle: Mesocycle = {
        id: 'meso-1',
        name: 'Test',
        startDate: new Date(),
        endDate: new Date(),
        durationWeeks: 6,
        currentWeek: 3,
        deloadWeek: 6,
        trainingSplit: 'upper_lower',
        splitDays: [],
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Week 3 and 4 don't have special labels in a 6-week cycle
      const description3 = getMesocycleWeekDescription(mesocycle, 3);
      const description4 = getMesocycleWeekDescription(mesocycle, 4);

      expect(description3).toBe('Week 3');
      expect(description4).toBe('Week 4');
    });
  });

  describe('Database-dependent functions', () => {
    beforeEach(async () => {
      await db.delete();
      await db.open();
    });

    afterEach(async () => {
      await db.delete();
    });

    describe('updateMesocycleProgress', () => {
      it('should update mesocycle currentWeek based on latest workout', async () => {
        // Create mesocycle
        const mesocycleId = await createMesocycle({
          name: 'Test Mesocycle',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-02-11'),
          durationWeeks: 6,
          currentWeek: 1,
          deloadWeek: 6,
          trainingSplit: 'upper_lower',
          splitDays: [
            {
              id: 'split-1',
              name: 'Upper',
              dayOrder: 1,
              exercises: [],
            },
          ],
          status: 'active',
        });

        // Create exercise
        const exerciseId = await createExercise({
          name: 'Bench Press',
          category: 'barbell',
          muscleGroups: ['chest'],
          isCustom: true,
        });

        // Create workout in week 2
        await createWorkout({
          date: new Date('2024-01-10'),
          mesocycleId,
          exercises: [
            {
              exerciseId,
              sets: [],
            },
          ],
          completed: true,
        });

        // Update progress
        await updateMesocycleProgress(mesocycleId);

        // Check that currentWeek was updated to 2
        const mesocycle = await db.mesocycles.get(mesocycleId);
        expect(mesocycle?.currentWeek).toBe(2);
      });

      it('should not update if mesocycle is not active', async () => {
        const mesocycleId = await createMesocycle({
          name: 'Test Mesocycle',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-02-11'),
          durationWeeks: 6,
          currentWeek: 1,
          deloadWeek: 6,
          trainingSplit: 'upper_lower',
          splitDays: [
            {
              id: 'split-1',
              name: 'Upper',
              dayOrder: 1,
              exercises: [],
            },
          ],
          status: 'completed',
        });

        await updateMesocycleProgress(mesocycleId);

        const mesocycle = await db.mesocycles.get(mesocycleId);
        expect(mesocycle?.currentWeek).toBe(1); // Unchanged
      });

      it('should handle no workouts', async () => {
        const mesocycleId = await createMesocycle({
          name: 'Test Mesocycle',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-02-11'),
          durationWeeks: 6,
          currentWeek: 1,
          deloadWeek: 6,
          trainingSplit: 'upper_lower',
          splitDays: [
            {
              id: 'split-1',
              name: 'Upper',
              dayOrder: 1,
              exercises: [],
            },
          ],
          status: 'active',
        });

        await updateMesocycleProgress(mesocycleId);

        const mesocycle = await db.mesocycles.get(mesocycleId);
        expect(mesocycle?.currentWeek).toBe(1); // Unchanged
      });
    });

    describe('getWorkoutMesocycleInfo', () => {
      it('should return mesocycle info for active mesocycle', async () => {
        const mesocycleId = await createMesocycle({
          name: 'Test Mesocycle',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-02-11'),
          durationWeeks: 6,
          currentWeek: 1,
          deloadWeek: 6,
          trainingSplit: 'upper_lower',
          splitDays: [
            {
              id: 'split-1',
              name: 'Upper',
              dayOrder: 1,
              exercises: [],
            },
          ],
          status: 'active',
        });

        const info = await getWorkoutMesocycleInfo(new Date('2024-01-15'));

        expect(info).toBeDefined();
        expect(info?.mesocycleId).toBe(mesocycleId);
        expect(info?.weekNumber).toBe(3); // Day 15 is in week 3
      });

      it('should return null if no active mesocycle', async () => {
        const info = await getWorkoutMesocycleInfo(new Date());
        expect(info).toBeNull();
      });

      it('should return null if workout date is outside mesocycle range', async () => {
        await createMesocycle({
          name: 'Test Mesocycle',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-02-11'),
          durationWeeks: 6,
          currentWeek: 1,
          deloadWeek: 6,
          trainingSplit: 'upper_lower',
          splitDays: [
            {
              id: 'split-1',
              name: 'Upper',
              dayOrder: 1,
              exercises: [],
            },
          ],
          status: 'active',
        });

        const info = await getWorkoutMesocycleInfo(new Date('2024-03-01'));
        expect(info).toBeNull();
      });
    });

    describe('checkMesocycleCompletion', () => {
      it('should mark mesocycle as completed if end date passed', async () => {
        const pastEndDate = new Date();
        pastEndDate.setDate(pastEndDate.getDate() - 1);

        const mesocycleId = await createMesocycle({
          name: 'Test Mesocycle',
          startDate: new Date('2024-01-01'),
          endDate: pastEndDate,
          durationWeeks: 6,
          currentWeek: 6,
          deloadWeek: 6,
          trainingSplit: 'upper_lower',
          splitDays: [
            {
              id: 'split-1',
              name: 'Upper',
              dayOrder: 1,
              exercises: [],
            },
          ],
          status: 'active',
        });

        await checkMesocycleCompletion(mesocycleId);

        const mesocycle = await db.mesocycles.get(mesocycleId);
        expect(mesocycle?.status).toBe('completed');
      });

      it('should not mark as completed if end date has not passed', async () => {
        const futureEndDate = new Date();
        futureEndDate.setDate(futureEndDate.getDate() + 7);

        const mesocycleId = await createMesocycle({
          name: 'Test Mesocycle',
          startDate: new Date(),
          endDate: futureEndDate,
          durationWeeks: 6,
          currentWeek: 1,
          deloadWeek: 6,
          trainingSplit: 'upper_lower',
          splitDays: [
            {
              id: 'split-1',
              name: 'Upper',
              dayOrder: 1,
              exercises: [],
            },
          ],
          status: 'active',
        });

        await checkMesocycleCompletion(mesocycleId);

        const mesocycle = await db.mesocycles.get(mesocycleId);
        expect(mesocycle?.status).toBe('active');
      });
    });

    describe('getNextSplitDay', () => {
      it('should return next uncompleted split day', async () => {
        const mesocycle: Mesocycle = {
          id: 'meso-1',
          name: 'Test',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-02-11'),
          durationWeeks: 6,
          currentWeek: 1,
          deloadWeek: 6,
          trainingSplit: 'upper_lower',
          splitDays: [
            {
              id: 'upper',
              name: 'Upper',
              dayOrder: 1,
              exercises: [],
            },
            {
              id: 'lower',
              name: 'Lower',
              dayOrder: 2,
              exercises: [],
            },
          ],
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const workouts: Workout[] = [
          {
            id: 'w-1',
            date: new Date('2024-01-02'),
            mesocycleId: 'meso-1',
            weekNumber: 1,
            splitDayId: 'upper',
            exercises: [],
            completed: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        const nextSplit = await getNextSplitDay(mesocycle, workouts);
        expect(nextSplit?.id).toBe('lower');
      });

      it('should cycle back to first split when all completed', async () => {
        const mesocycle: Mesocycle = {
          id: 'meso-1',
          name: 'Test',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-02-11'),
          durationWeeks: 6,
          currentWeek: 1,
          deloadWeek: 6,
          trainingSplit: 'upper_lower',
          splitDays: [
            {
              id: 'upper',
              name: 'Upper',
              dayOrder: 1,
              exercises: [],
            },
            {
              id: 'lower',
              name: 'Lower',
              dayOrder: 2,
              exercises: [],
            },
          ],
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const workouts: Workout[] = [
          {
            id: 'w-1',
            date: new Date('2024-01-02'),
            mesocycleId: 'meso-1',
            weekNumber: 1,
            splitDayId: 'upper',
            exercises: [],
            completed: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          {
            id: 'w-2',
            date: new Date('2024-01-03'),
            mesocycleId: 'meso-1',
            weekNumber: 1,
            splitDayId: 'lower',
            exercises: [],
            completed: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        ];

        const nextSplit = await getNextSplitDay(mesocycle, workouts);
        expect(nextSplit?.id).toBe('upper'); // Cycles back to first
      });

      it('should return null if no split days', async () => {
        const mesocycle: Mesocycle = {
          id: 'meso-1',
          name: 'Test',
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-02-11'),
          durationWeeks: 6,
          currentWeek: 1,
          deloadWeek: 6,
          trainingSplit: 'upper_lower',
          splitDays: [],
          status: 'active',
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        const nextSplit = await getNextSplitDay(mesocycle, []);
        expect(nextSplit).toBeNull();
      });
    });
  });
});

