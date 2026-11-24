/**
 * Unit tests for workout Markdown rendering
 */

import { describe, it, expect } from 'vitest';
import { workoutToMarkdown } from './workoutMarkdown';
import type { Workout, WorkoutSet } from '../types/models';

const exercises = [
  { id: 'bench', name: 'Bench Press' },
  { id: 'row', name: 'Cable Row' },
];

function set(overrides: Partial<WorkoutSet> = {}): WorkoutSet {
  return {
    id: crypto.randomUUID(),
    exerciseId: 'bench',
    setNumber: 1,
    targetReps: 8,
    weight: 80,
    completed: true,
    ...overrides,
  };
}

function workout(overrides: Partial<Workout> = {}): Workout {
  const date = new Date(2026, 9, 20, 18, 30);
  return {
    id: 'w1',
    date,
    exercises: [],
    completed: true,
    createdAt: date,
    updatedAt: date,
    ...overrides,
  };
}

describe('workoutToMarkdown', () => {
  it('renders heading, summary and one table per exercise', () => {
    const md = workoutToMarkdown(
      workout({
        duration: 65,
        exercises: [
          {
            exerciseId: 'bench',
            sets: [
              set({ actualReps: 8, rir: 2 }),
              set({ actualReps: 7, rir: 1 }),
            ],
          },
          {
            exerciseId: 'row',
            sets: [set({ exerciseId: 'row', weight: 50, actualReps: 12 })],
          },
        ],
      }),
      exercises
    );

    expect(md).toBe(
      [
        '# Workout 2026-10-20',
        '',
        'Duration: 1h 5m · Sets: 3 · Volume: 1800 kg',
        '',
        '## Bench Press',
        '',
        '| Set | Weight | Reps | RIR | Volume |',
        '| --- | --- | --- | --- | --- |',
        '| 1 | 80 kg | 8 | 2 | 640 kg |',
        '| 2 | 80 kg | 7 | 1 | 560 kg |',
        '',
        '## Cable Row',
        '',
        '| Set | Weight | Reps | RIR | Volume |',
        '| --- | --- | --- | --- | --- |',
        '| 1 | 50 kg | 12 | - | 600 kg |',
        '',
      ].join('\n')
    );
  });

  it('leaves out incomplete sets and exercises with no completed sets', () => {
    const md = workoutToMarkdown(
      workout({
        exercises: [
          {
            exerciseId: 'bench',
            sets: [set({ actualReps: 8 }), set({ completed: false })],
          },
          {
            exerciseId: 'row',
            sets: [set({ exerciseId: 'row', completed: false })],
          },
        ],
      }),
      exercises
    );

    expect(md).toContain('Sets: 1');
    expect(md).not.toContain('| 2 |');
    expect(md).not.toContain('Cable Row');
  });

  it('falls back to target reps when actual reps are missing', () => {
    const md = workoutToMarkdown(
      workout({ exercises: [{ exerciseId: 'bench', sets: [set()] }] }),
      exercises
    );

    expect(md).toContain('| 1 | 80 kg | 8 | - | 640 kg |');
  });

  it('omits duration when unknown', () => {
    const md = workoutToMarkdown(workout(), exercises);

    expect(md).toContain('Sets: 0 · Volume: 0 kg');
    expect(md).not.toContain('Duration');
  });

  it('includes workout notes and exercise notes on one line', () => {
    const md = workoutToMarkdown(
      workout({
        notes: '  Felt strong today.  ',
        exercises: [
          {
            exerciseId: 'bench',
            sets: [set()],
            notes: 'Paused reps\nnext time +2.5 kg',
          },
        ],
      }),
      exercises
    );

    expect(md).toContain('\nFelt strong today.\n');
    expect(md).toContain('Notes: Paused reps next time +2.5 kg');
  });

  it('names exercises that no longer exist "Unknown Exercise"', () => {
    const md = workoutToMarkdown(
      workout({
        exercises: [
          { exerciseId: 'deleted', sets: [set({ exerciseId: 'deleted' })] },
        ],
      }),
      exercises
    );

    expect(md).toContain('## Unknown Exercise');
  });

  it('uses the local date so evening workouts keep their day', () => {
    const md = workoutToMarkdown(
      workout({ date: new Date(2026, 0, 31, 23, 45) }),
      exercises
    );

    expect(md.startsWith('# Workout 2026-01-31\n')).toBe(true);
  });
});
