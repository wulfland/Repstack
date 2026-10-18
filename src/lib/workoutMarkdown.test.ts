/**
 * Unit tests for the workout → Markdown renderer
 */

import { describe, it, expect } from 'vitest';
import { workoutToMarkdown, formatDuration } from './workoutMarkdown';
import type { Workout, WorkoutSet } from '../types/models';

const NAMES: Record<string, string> = {
  bench: 'Bench Press',
  squat: 'Back Squat',
};
const getExerciseName = (id: string) => NAMES[id];
const formatDate = () => 'Saturday, October 18, 2026 at 09:00 AM';

function makeSet(
  exerciseId: string,
  setNumber: number,
  overrides: Partial<WorkoutSet> = {}
): WorkoutSet {
  return {
    id: `${exerciseId}-${setNumber}`,
    exerciseId,
    setNumber,
    targetReps: 10,
    actualReps: 10,
    weight: 100,
    rir: 2,
    completed: true,
    ...overrides,
  };
}

function makeWorkout(overrides: Partial<Workout> = {}): Workout {
  const date = new Date('2026-10-18T09:00:00Z');
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

describe('formatDuration', () => {
  it('returns N/A for missing or zero', () => {
    expect(formatDuration()).toBe('N/A');
    expect(formatDuration(0)).toBe('N/A');
  });

  it('formats minutes and hours', () => {
    expect(formatDuration(45)).toBe('45m');
    expect(formatDuration(65)).toBe('1h 5m');
    expect(formatDuration(120)).toBe('2h 0m');
  });
});

describe('workoutToMarkdown', () => {
  it('renders a full workout with heading, stats, table and feedback', () => {
    const workout = makeWorkout({
      duration: 65,
      notes: 'Felt strong.\nSlept well.',
      exercises: [
        {
          exerciseId: 'bench',
          notes: 'Paused reps',
          sets: [
            makeSet('bench', 1),
            makeSet('bench', 2, { actualReps: 8, rir: 1 }),
          ],
        },
        {
          exerciseId: 'squat',
          sets: [makeSet('squat', 1, { weight: 140, rir: undefined })],
        },
      ],
      feedback: {
        overallRecovery: 'well_recovered',
        muscleGroupFeedback: [
          { muscleGroup: 'chest', pump: 4, soreness: 2 },
          { muscleGroup: 'quads', pump: 3 },
        ],
        notes: 'Ready for more',
      },
    });

    const md = workoutToMarkdown(workout, { getExerciseName, formatDate });

    expect(md).toBe(
      [
        '# Workout – Saturday, October 18, 2026 at 09:00 AM',
        '',
        '- **Duration:** 1h 5m',
        '- **Total sets:** 3',
        '- **Total volume:** 3200 kg',
        '',
        '## Notes',
        '',
        '> Felt strong.',
        '> Slept well.',
        '',
        '## Exercises',
        '',
        '### Bench Press',
        '',
        'Volume: 1800 kg',
        '',
        '| Set | Weight | Reps | RIR | Volume |',
        '| --- | --- | --- | --- | --- |',
        '| 1 | 100 kg | 10 | 2 | 1000 kg |',
        '| 2 | 100 kg | 8 (target: 10) | 1 | 800 kg |',
        '',
        '**Notes:** Paused reps',
        '',
        '### Back Squat',
        '',
        'Volume: 1400 kg',
        '',
        '| Set | Weight | Reps | RIR | Volume |',
        '| --- | --- | --- | --- | --- |',
        '| 1 | 140 kg | 10 | - | 1400 kg |',
        '',
        '## Feedback',
        '',
        '- **Overall recovery:** well recovered',
        '- **Muscle group feedback:**',
        '  - chest: Pump 4/5, Soreness 2/5',
        '  - quads: Pump 3/5',
        '- **Notes:** Ready for more',
        '',
      ].join('\n')
    );
  });

  it('omits notes and feedback sections when absent', () => {
    const md = workoutToMarkdown(
      makeWorkout({
        exercises: [{ exerciseId: 'bench', sets: [makeSet('bench', 1)] }],
      }),
      { getExerciseName, formatDate }
    );

    expect(md).not.toContain('## Notes');
    expect(md).not.toContain('## Feedback');
    expect(md).toContain('- **Duration:** N/A');
  });

  it('omits an empty feedback object', () => {
    const md = workoutToMarkdown(makeWorkout({ feedback: {}, exercises: [] }), {
      getExerciseName,
      formatDate,
    });
    expect(md).not.toContain('## Feedback');
  });

  it('skips incomplete sets but still counts the exercise', () => {
    const md = workoutToMarkdown(
      makeWorkout({
        exercises: [
          {
            exerciseId: 'bench',
            sets: [
              makeSet('bench', 1, { completed: false }),
              makeSet('bench', 2, { weight: 50 }),
            ],
          },
        ],
      }),
      { getExerciseName, formatDate }
    );

    expect(md).toContain('- **Total sets:** 1');
    expect(md).toContain('- **Total volume:** 500 kg');
    // the completed set is renumbered as set 1
    expect(md).toContain('| 1 | 50 kg | 10 | 2 | 500 kg |');
    expect(md).not.toContain('| 2 | 100 kg |');
  });

  it('shows a placeholder for exercises with no completed sets', () => {
    const md = workoutToMarkdown(
      makeWorkout({
        exercises: [
          {
            exerciseId: 'bench',
            sets: [makeSet('bench', 1, { completed: false })],
          },
        ],
      }),
      { getExerciseName, formatDate }
    );
    expect(md).toContain('_No completed sets._');
    expect(md).not.toContain('| Set |');
  });

  it('shows a placeholder when the workout has no exercises', () => {
    const md = workoutToMarkdown(makeWorkout(), {
      getExerciseName,
      formatDate,
    });
    expect(md).toContain('## Exercises\n\n_No exercises recorded._');
  });

  it('falls back to "Unknown Exercise" for unresolvable ids', () => {
    const md = workoutToMarkdown(
      makeWorkout({
        exercises: [{ exerciseId: 'missing', sets: [makeSet('missing', 1)] }],
      }),
      { getExerciseName, formatDate }
    );
    expect(md).toContain('### Unknown Exercise');
  });

  it('uses target reps when actual reps were not recorded', () => {
    const md = workoutToMarkdown(
      makeWorkout({
        exercises: [
          {
            exerciseId: 'bench',
            sets: [
              makeSet('bench', 1, { actualReps: undefined, targetReps: 12 }),
            ],
          },
        ],
      }),
      { getExerciseName, formatDate }
    );
    expect(md).toContain('| 1 | 100 kg | 12 | 2 | 1200 kg |');
  });

  it('escapes pipes and newlines in notes that sit on a single line', () => {
    const md = workoutToMarkdown(
      makeWorkout({
        exercises: [
          {
            exerciseId: 'bench',
            notes: 'a | b\nc',
            sets: [makeSet('bench', 1)],
          },
        ],
        feedback: { notes: 'x | y' },
      }),
      { getExerciseName, formatDate }
    );
    expect(md).toContain('**Notes:** a \\| b c');
    expect(md).toContain('- **Notes:** x \\| y');
  });

  it('uses a default date formatter when none is supplied', () => {
    const md = workoutToMarkdown(makeWorkout(), { getExerciseName });
    expect(md).toMatch(/^# Workout – .*2026/);
  });
});
