/**
 * Unit tests for progress tracking utilities
 */

import { describe, it, expect } from 'vitest';
import {
  calculateOneRepMax,
  calculateOneRepMaxBrzycki,
  calculateSetVolume,
  calculateExerciseVolume,
  calculateWorkoutVolume,
  findPersonalRecords,
  calculateMuscleGroupVolume,
  calculateTrainingStatistics,
  getWorkoutCalendar,
  getExerciseProgressTrend,
} from '../lib/progressTracking';
import type { Workout, WorkoutSet, Exercise } from '../types/models';

describe('1RM Calculations', () => {
  describe('calculateOneRepMax (Epley formula)', () => {
    it('should return the weight for 1 rep', () => {
      expect(calculateOneRepMax(100, 1)).toBe(100);
    });

    it('should calculate 1RM for various rep ranges', () => {
      // 100kg for 5 reps: 1RM ≈ 116.67
      expect(calculateOneRepMax(100, 5)).toBeCloseTo(116.67, 1);

      // 100kg for 10 reps: 1RM ≈ 133.33
      expect(calculateOneRepMax(100, 10)).toBeCloseTo(133.33, 1);

      // 80kg for 8 reps: 1RM ≈ 101.33
      expect(calculateOneRepMax(80, 8)).toBeCloseTo(101.33, 1);
    });

    it('should return 0 for invalid inputs', () => {
      expect(calculateOneRepMax(0, 5)).toBe(0);
      expect(calculateOneRepMax(100, 0)).toBe(0);
      expect(calculateOneRepMax(-100, 5)).toBe(0);
    });

    it('should handle high rep ranges', () => {
      // Formula: 1RM = weight × (1 + reps / 30)
      expect(calculateOneRepMax(50, 30)).toBeCloseTo(100, 1);
    });
  });

  describe('calculateOneRepMaxBrzycki (Brzycki formula)', () => {
    it('should return the weight for 1 rep', () => {
      expect(calculateOneRepMaxBrzycki(100, 1)).toBe(100);
    });

    it('should calculate 1RM for various rep ranges', () => {
      // 100kg for 5 reps
      expect(calculateOneRepMaxBrzycki(100, 5)).toBeCloseTo(112.5, 1);

      // 100kg for 10 reps
      expect(calculateOneRepMaxBrzycki(100, 10)).toBeCloseTo(133.33, 1);
    });

    it('should return 0 for invalid inputs', () => {
      expect(calculateOneRepMaxBrzycki(0, 5)).toBe(0);
      expect(calculateOneRepMaxBrzycki(100, 0)).toBe(0);
    });

    it('should handle high reps (formula breaks down at 37+)', () => {
      expect(calculateOneRepMaxBrzycki(50, 37)).toBe(50);
      expect(calculateOneRepMaxBrzycki(50, 40)).toBe(50);
    });

    it('should be more conservative than Epley at moderate reps', () => {
      const weight = 100;
      const reps = 8;

      const epley = calculateOneRepMax(weight, reps);
      const brzycki = calculateOneRepMaxBrzycki(weight, reps);

      // Brzycki should generally be lower (more conservative)
      expect(brzycki).toBeLessThan(epley);
    });
  });
});

describe('Volume Calculations', () => {
  describe('calculateSetVolume', () => {
    it('should calculate volume using actual reps when completed', () => {
      const set: WorkoutSet = {
        id: '1',
        exerciseId: 'ex-1',
        setNumber: 1,
        targetReps: 10,
        actualReps: 12,
        weight: 100,
        completed: true,
      };

      expect(calculateSetVolume(set)).toBe(1200); // 12 × 100
    });

    it('should use target reps when actual reps not provided', () => {
      const set: WorkoutSet = {
        id: '1',
        exerciseId: 'ex-1',
        setNumber: 1,
        targetReps: 10,
        weight: 100,
        completed: false,
      };

      expect(calculateSetVolume(set)).toBe(1000); // 10 × 100
    });

    it('should handle zero weight', () => {
      const set: WorkoutSet = {
        id: '1',
        exerciseId: 'ex-1',
        setNumber: 1,
        targetReps: 10,
        weight: 0,
        completed: true,
      };

      expect(calculateSetVolume(set)).toBe(0);
    });
  });

  describe('calculateExerciseVolume', () => {
    it('should sum volume of all completed sets', () => {
      const sets: WorkoutSet[] = [
        {
          id: '1',
          exerciseId: 'ex-1',
          setNumber: 1,
          targetReps: 10,
          actualReps: 10,
          weight: 100,
          completed: true,
        },
        {
          id: '2',
          exerciseId: 'ex-1',
          setNumber: 2,
          targetReps: 10,
          actualReps: 9,
          weight: 100,
          completed: true,
        },
        {
          id: '3',
          exerciseId: 'ex-1',
          setNumber: 3,
          targetReps: 10,
          actualReps: 8,
          weight: 100,
          completed: true,
        },
      ];

      // 10×100 + 9×100 + 8×100 = 2700
      expect(calculateExerciseVolume(sets)).toBe(2700);
    });

    it('should exclude incomplete sets', () => {
      const sets: WorkoutSet[] = [
        {
          id: '1',
          exerciseId: 'ex-1',
          setNumber: 1,
          targetReps: 10,
          actualReps: 10,
          weight: 100,
          completed: true,
        },
        {
          id: '2',
          exerciseId: 'ex-1',
          setNumber: 2,
          targetReps: 10,
          weight: 100,
          completed: false,
        },
      ];

      expect(calculateExerciseVolume(sets)).toBe(1000); // Only first set
    });

    it('should return 0 for empty sets array', () => {
      expect(calculateExerciseVolume([])).toBe(0);
    });
  });

  describe('calculateWorkoutVolume', () => {
    it('should sum volume of all exercises in workout', () => {
      const workout: Workout = {
        id: 'w-1',
        date: new Date(),
        exercises: [
          {
            exerciseId: 'ex-1',
            sets: [
              {
                id: 's-1',
                exerciseId: 'ex-1',
                setNumber: 1,
                targetReps: 10,
                weight: 100,
                completed: true,
              },
            ],
          },
          {
            exerciseId: 'ex-2',
            sets: [
              {
                id: 's-2',
                exerciseId: 'ex-2',
                setNumber: 1,
                targetReps: 12,
                weight: 50,
                completed: true,
              },
            ],
          },
        ],
        completed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Exercise 1: 10×100 = 1000
      // Exercise 2: 12×50 = 600
      // Total: 1600
      expect(calculateWorkoutVolume(workout)).toBe(1600);
    });

    it('should return 0 for workout with no exercises', () => {
      const workout: Workout = {
        id: 'w-1',
        date: new Date(),
        exercises: [],
        completed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      expect(calculateWorkoutVolume(workout)).toBe(0);
    });
  });
});

describe('Personal Records', () => {
  describe('findPersonalRecords', () => {
    it('should find PRs across different rep ranges', () => {
      const workouts: Workout[] = [
        {
          id: 'w-1',
          date: new Date('2024-01-01'),
          exercises: [
            {
              exerciseId: 'bench-press',
              sets: [
                {
                  id: 's-1',
                  exerciseId: 'bench-press',
                  setNumber: 1,
                  targetReps: 1,
                  actualReps: 1,
                  weight: 150,
                  completed: true,
                },
              ],
            },
          ],
          completed: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'w-2',
          date: new Date('2024-01-08'),
          exercises: [
            {
              exerciseId: 'bench-press',
              sets: [
                {
                  id: 's-2',
                  exerciseId: 'bench-press',
                  setNumber: 1,
                  targetReps: 5,
                  actualReps: 5,
                  weight: 120,
                  completed: true,
                },
              ],
            },
          ],
          completed: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const records = findPersonalRecords(workouts, 'bench-press');

      expect(records.length).toBeGreaterThan(0);
      const oneRM = records.find((r) => r.repRange === '1RM');
      expect(oneRM).toBeDefined();
      expect(oneRM?.weight).toBe(150);

      const fiveRM = records.find((r) => r.repRange === '5RM');
      expect(fiveRM).toBeDefined();
      expect(fiveRM?.weight).toBe(120);
    });

    it('should only include completed workouts and sets', () => {
      const workouts: Workout[] = [
        {
          id: 'w-1',
          date: new Date(),
          exercises: [
            {
              exerciseId: 'squat',
              sets: [
                {
                  id: 's-1',
                  exerciseId: 'squat',
                  setNumber: 1,
                  targetReps: 5,
                  weight: 200,
                  completed: false,
                },
              ],
            },
          ],
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const records = findPersonalRecords(workouts, 'squat');
      expect(records).toHaveLength(0);
    });

    it('should select highest weight within each rep range', () => {
      const workouts: Workout[] = [
        {
          id: 'w-1',
          date: new Date('2024-01-01'),
          exercises: [
            {
              exerciseId: 'deadlift',
              sets: [
                {
                  id: 's-1',
                  exerciseId: 'deadlift',
                  setNumber: 1,
                  targetReps: 5,
                  actualReps: 5,
                  weight: 180,
                  completed: true,
                },
              ],
            },
          ],
          completed: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'w-2',
          date: new Date('2024-01-08'),
          exercises: [
            {
              exerciseId: 'deadlift',
              sets: [
                {
                  id: 's-2',
                  exerciseId: 'deadlift',
                  setNumber: 1,
                  targetReps: 5,
                  actualReps: 5,
                  weight: 190, // Higher weight
                  completed: true,
                },
              ],
            },
          ],
          completed: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const records = findPersonalRecords(workouts, 'deadlift');
      const fiveRM = records.find((r) => r.repRange === '5RM');

      expect(fiveRM?.weight).toBe(190);
    });

    it('should return empty array for exercise not in workouts', () => {
      const workouts: Workout[] = [];
      const records = findPersonalRecords(workouts, 'nonexistent');
      expect(records).toHaveLength(0);
    });
  });
});

describe('Muscle Group Volume', () => {
  describe('calculateMuscleGroupVolume', () => {
    it('should calculate volume per muscle group', () => {
      const exercises: Exercise[] = [
        {
          id: 'bench-press',
          name: 'Bench Press',
          category: 'barbell',
          muscleGroups: ['chest', 'triceps'],
          isCustom: false,
          createdAt: new Date(),
        },
        {
          id: 'rows',
          name: 'Barbell Rows',
          category: 'barbell',
          muscleGroups: ['back'],
          isCustom: false,
          createdAt: new Date(),
        },
      ];

      const workouts: Workout[] = [
        {
          id: 'w-1',
          date: new Date(),
          exercises: [
            {
              exerciseId: 'bench-press',
              sets: [
                {
                  id: 's-1',
                  exerciseId: 'bench-press',
                  setNumber: 1,
                  targetReps: 10,
                  weight: 100,
                  completed: true,
                },
              ],
            },
            {
              exerciseId: 'rows',
              sets: [
                {
                  id: 's-2',
                  exerciseId: 'rows',
                  setNumber: 1,
                  targetReps: 10,
                  weight: 80,
                  completed: true,
                },
              ],
            },
          ],
          completed: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const volumeData = calculateMuscleGroupVolume(workouts, exercises);

      const chestVolume = volumeData.find((v) => v.muscleGroup === 'chest');
      expect(chestVolume?.volume).toBe(1000); // Bench press: 10×100
      expect(chestVolume?.sets).toBe(1);

      const tricepsVolume = volumeData.find((v) => v.muscleGroup === 'triceps');
      expect(tricepsVolume?.volume).toBe(1000); // Also from bench press
      expect(tricepsVolume?.sets).toBe(1);

      const backVolume = volumeData.find((v) => v.muscleGroup === 'back');
      expect(backVolume?.volume).toBe(800); // Rows: 10×80
      expect(backVolume?.sets).toBe(1);
    });

    it('should filter by date range when provided', () => {
      const exercises: Exercise[] = [
        {
          id: 'ex-1',
          name: 'Test',
          category: 'barbell',
          muscleGroups: ['chest'],
          isCustom: false,
          createdAt: new Date(),
        },
      ];

      const workouts: Workout[] = [
        {
          id: 'w-1',
          date: new Date('2024-01-01'),
          exercises: [
            {
              exerciseId: 'ex-1',
              sets: [
                {
                  id: 's-1',
                  exerciseId: 'ex-1',
                  setNumber: 1,
                  targetReps: 10,
                  weight: 100,
                  completed: true,
                },
              ],
            },
          ],
          completed: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'w-2',
          date: new Date('2024-02-01'),
          exercises: [
            {
              exerciseId: 'ex-1',
              sets: [
                {
                  id: 's-2',
                  exerciseId: 'ex-1',
                  setNumber: 1,
                  targetReps: 10,
                  weight: 100,
                  completed: true,
                },
              ],
            },
          ],
          completed: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const volumeData = calculateMuscleGroupVolume(
        workouts,
        exercises,
        new Date('2024-01-15'),
        new Date('2024-02-15')
      );

      const chestVolume = volumeData.find((v) => v.muscleGroup === 'chest');
      expect(chestVolume?.volume).toBe(1000); // Only second workout
    });

    it('should only count completed workouts', () => {
      const exercises: Exercise[] = [
        {
          id: 'ex-1',
          name: 'Test',
          category: 'barbell',
          muscleGroups: ['chest'],
          isCustom: false,
          createdAt: new Date(),
        },
      ];

      const workouts: Workout[] = [
        {
          id: 'w-1',
          date: new Date(),
          exercises: [
            {
              exerciseId: 'ex-1',
              sets: [
                {
                  id: 's-1',
                  exerciseId: 'ex-1',
                  setNumber: 1,
                  targetReps: 10,
                  weight: 100,
                  completed: true,
                },
              ],
            },
          ],
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const volumeData = calculateMuscleGroupVolume(workouts, exercises);
      expect(volumeData).toHaveLength(0);
    });
  });
});

describe('Training Statistics', () => {
  describe('calculateTrainingStatistics', () => {
    it('should calculate basic statistics', () => {
      const workouts: Workout[] = [
        {
          id: 'w-1',
          date: new Date('2024-01-01'),
          exercises: [
            {
              exerciseId: 'ex-1',
              sets: [
                {
                  id: 's-1',
                  exerciseId: 'ex-1',
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
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'w-2',
          date: new Date('2024-01-08'),
          exercises: [
            {
              exerciseId: 'ex-1',
              sets: [
                {
                  id: 's-2',
                  exerciseId: 'ex-1',
                  setNumber: 1,
                  targetReps: 10,
                  weight: 100,
                  completed: true,
                },
              ],
            },
          ],
          completed: true,
          duration: 70,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const stats = calculateTrainingStatistics(workouts);

      expect(stats.totalWorkouts).toBe(2);
      expect(stats.totalCompletedWorkouts).toBe(2);
      expect(stats.totalSets).toBe(2);
      expect(stats.totalVolume).toBe(2000); // 2 sets × 10 reps × 100kg
      expect(stats.averageWorkoutDuration).toBe(65); // (60 + 70) / 2
      expect(stats.firstWorkoutDate).toEqual(new Date('2024-01-01'));
      expect(stats.lastWorkoutDate).toEqual(new Date('2024-01-08'));
    });

    it('should handle empty workout list', () => {
      const stats = calculateTrainingStatistics([]);

      expect(stats.totalWorkouts).toBe(0);
      expect(stats.totalCompletedWorkouts).toBe(0);
      expect(stats.totalSets).toBe(0);
      expect(stats.totalVolume).toBe(0);
      expect(stats.averageWorkoutDuration).toBe(0);
      expect(stats.currentStreak).toBe(0);
      expect(stats.longestStreak).toBe(0);
      expect(stats.firstWorkoutDate).toBeNull();
      expect(stats.lastWorkoutDate).toBeNull();
    });

    it('should only count completed workouts', () => {
      const workouts: Workout[] = [
        {
          id: 'w-1',
          date: new Date(),
          exercises: [],
          completed: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'w-2',
          date: new Date(),
          exercises: [],
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const stats = calculateTrainingStatistics(workouts);
      expect(stats.totalWorkouts).toBe(2);
      expect(stats.totalCompletedWorkouts).toBe(1);
    });

    it('should calculate current streak correctly', () => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const workouts: Workout[] = [
        {
          id: 'w-1',
          date: yesterday,
          exercises: [],
          completed: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'w-2',
          date: today,
          exercises: [],
          completed: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const stats = calculateTrainingStatistics(workouts);
      expect(stats.currentStreak).toBeGreaterThanOrEqual(1);
    });

    it('should calculate longest streak correctly', () => {
      const workouts: Workout[] = [
        {
          id: 'w-1',
          date: new Date('2024-01-01'),
          exercises: [],
          completed: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'w-2',
          date: new Date('2024-01-02'),
          exercises: [],
          completed: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'w-3',
          date: new Date('2024-01-03'),
          exercises: [],
          completed: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        // Gap here
        {
          id: 'w-4',
          date: new Date('2024-01-10'),
          exercises: [],
          completed: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const stats = calculateTrainingStatistics(workouts);
      expect(stats.longestStreak).toBe(3);
    });
  });
});

describe('Workout Calendar', () => {
  describe('getWorkoutCalendar', () => {
    it('should create calendar entries for date range', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-03');

      const workouts: Workout[] = [
        {
          id: 'w-1',
          date: new Date('2024-01-02'),
          exercises: [],
          completed: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const calendar = getWorkoutCalendar(workouts, startDate, endDate);

      expect(calendar).toHaveLength(3); // 3 days
      expect(calendar[0].workoutCount).toBe(0); // Jan 1
      expect(calendar[1].workoutCount).toBe(1); // Jan 2
      expect(calendar[2].workoutCount).toBe(0); // Jan 3
    });

    it('should only include completed workouts', () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-01');

      const workouts: Workout[] = [
        {
          id: 'w-1',
          date: new Date('2024-01-01'),
          exercises: [],
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const calendar = getWorkoutCalendar(workouts, startDate, endDate);
      expect(calendar[0].workoutCount).toBe(0);
    });

    it('should handle multiple workouts on same day', () => {
      // Use specific UTC dates to avoid timezone issues
      const startDate = new Date(Date.UTC(2024, 0, 1, 0, 0, 0));
      const endDate = new Date(Date.UTC(2024, 0, 1, 23, 59, 59));

      const workouts: Workout[] = [
        {
          id: 'w-1',
          date: new Date(Date.UTC(2024, 0, 1, 10, 0, 0)),
          exercises: [],
          completed: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'w-2',
          date: new Date(Date.UTC(2024, 0, 1, 18, 0, 0)),
          exercises: [],
          completed: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const calendar = getWorkoutCalendar(workouts, startDate, endDate);
      expect(calendar[0].workoutCount).toBe(2);
      expect(calendar[0].workouts).toHaveLength(2);
    });
  });
});

describe('Exercise Progress Trend', () => {
  describe('getExerciseProgressTrend', () => {
    it('should track progress over time', () => {
      const workouts: Workout[] = [
        {
          id: 'w-1',
          date: new Date('2024-01-01'),
          exercises: [
            {
              exerciseId: 'bench-press',
              sets: [
                {
                  id: 's-1',
                  exerciseId: 'bench-press',
                  setNumber: 1,
                  targetReps: 10,
                  actualReps: 10,
                  weight: 100,
                  completed: true,
                },
              ],
            },
          ],
          completed: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'w-2',
          date: new Date('2024-01-08'),
          exercises: [
            {
              exerciseId: 'bench-press',
              sets: [
                {
                  id: 's-2',
                  exerciseId: 'bench-press',
                  setNumber: 1,
                  targetReps: 10,
                  actualReps: 10,
                  weight: 105, // Progress!
                  completed: true,
                },
              ],
            },
          ],
          completed: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const trend = getExerciseProgressTrend(workouts, 'bench-press');

      expect(trend).toHaveLength(2);
      expect(trend[0].weight).toBe(100);
      expect(trend[1].weight).toBe(105);
      expect(trend[1].weight).toBeGreaterThan(trend[0].weight);
    });

    it('should select best set from each workout', () => {
      const workouts: Workout[] = [
        {
          id: 'w-1',
          date: new Date(),
          exercises: [
            {
              exerciseId: 'squat',
              sets: [
                {
                  id: 's-1',
                  exerciseId: 'squat',
                  setNumber: 1,
                  targetReps: 10,
                  weight: 100,
                  completed: true,
                },
                {
                  id: 's-2',
                  exerciseId: 'squat',
                  setNumber: 2,
                  targetReps: 8,
                  weight: 110, // Volume: 8×110 = 880 vs 10×100 = 1000
                  completed: true,
                },
              ],
            },
          ],
          completed: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const trend = getExerciseProgressTrend(workouts, 'squat');

      expect(trend).toHaveLength(1);
      // First set has higher volume (1000 > 880), so it's selected
      expect(trend[0].weight).toBe(100);
      expect(trend[0].volume).toBe(1000);
    });

    it('should only include completed workouts and sets', () => {
      const workouts: Workout[] = [
        {
          id: 'w-1',
          date: new Date(),
          exercises: [
            {
              exerciseId: 'deadlift',
              sets: [
                {
                  id: 's-1',
                  exerciseId: 'deadlift',
                  setNumber: 1,
                  targetReps: 5,
                  weight: 200,
                  completed: false,
                },
              ],
            },
          ],
          completed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const trend = getExerciseProgressTrend(workouts, 'deadlift');
      expect(trend).toHaveLength(0);
    });

    it('should return empty array for exercise not in workouts', () => {
      const workouts: Workout[] = [];
      const trend = getExerciseProgressTrend(workouts, 'nonexistent');
      expect(trend).toHaveLength(0);
    });
  });
});
