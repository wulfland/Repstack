/**
 * Render a finished workout as Markdown, for pasting into notes apps,
 * chats or a coach's spreadsheet.
 */

import type { Exercise, Workout } from '../types/models';
import {
  calculateExerciseVolume,
  calculateSetVolume,
} from './progressTracking';

type ExerciseNames = Pick<Exercise, 'id' | 'name'>[];

/**
 * Renders a workout as Markdown: a heading with the date, a summary line,
 * notes, and one table of completed sets per exercise. Only completed sets
 * are included, matching what the workout detail view shows.
 */
export function workoutToMarkdown(
  workout: Workout,
  exercises: ExerciseNames
): string {
  const nameById = new Map(exercises.map((e) => [e.id, e.name]));
  const lines: string[] = [];

  lines.push(`# Workout ${formatDate(workout.date)}`, '');

  const totalSets = workout.exercises.reduce(
    (total, ex) => total + ex.sets.filter((s) => s.completed).length,
    0
  );
  const totalVolume = workout.exercises.reduce(
    (total, ex) => total + calculateExerciseVolume(ex.sets),
    0
  );
  const summary = [
    workout.duration ? `Duration: ${formatDuration(workout.duration)}` : null,
    `Sets: ${totalSets}`,
    `Volume: ${Math.round(totalVolume)} kg`,
  ].filter(Boolean);
  lines.push(summary.join(' · '), '');

  if (workout.notes?.trim()) {
    lines.push(workout.notes.trim(), '');
  }

  for (const workoutExercise of workout.exercises) {
    const completedSets = workoutExercise.sets.filter((s) => s.completed);
    // An exercise with nothing logged would only add an empty table.
    if (completedSets.length === 0) continue;

    const name = nameById.get(workoutExercise.exerciseId) ?? 'Unknown Exercise';
    lines.push(`## ${name}`, '');
    lines.push('| Set | Weight | Reps | RIR | Volume |');
    lines.push('| --- | --- | --- | --- | --- |');
    completedSets.forEach((set, idx) => {
      const reps = set.actualReps ?? set.targetReps;
      const cells = [
        String(idx + 1),
        `${set.weight} kg`,
        String(reps),
        set.rir !== undefined ? String(set.rir) : '-',
        `${Math.round(calculateSetVolume(set))} kg`,
      ];
      lines.push(`| ${cells.join(' | ')} |`);
    });
    lines.push('');

    if (workoutExercise.notes?.trim()) {
      lines.push(`Notes: ${toOneLine(workoutExercise.notes.trim())}`, '');
    }
  }

  return lines.join('\n').trimEnd() + '\n';
}

// Local date, not toISOString(): an evening workout must not jump to the
// next day in UTC.
function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

// Exercise notes go on one line after "Notes:", so collapse line breaks.
function toOneLine(text: string): string {
  return text.replace(/\s*\n\s*/g, ' ');
}
