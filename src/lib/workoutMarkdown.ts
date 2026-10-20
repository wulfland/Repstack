/**
 * Render a completed workout as GitHub-flavored Markdown.
 *
 * Pure: no DOM, no DB. The caller supplies the exercise name lookup so the
 * function stays independent of Dexie and is trivially unit-testable.
 */

import type { Workout, WorkoutExercise, WorkoutSet } from '../types/models';
import {
  calculateSetVolume,
  calculateExerciseVolume,
} from './progressTracking';

export interface WorkoutMarkdownOptions {
  /** Resolve an exercise id to a display name. */
  getExerciseName: (exerciseId: string) => string | undefined;
  /** Format the workout date for the heading. Defaults to a long en-US date. */
  formatDate?: (date: Date) => string;
}

const UNKNOWN_EXERCISE = 'Unknown Exercise';

function defaultFormatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

export function formatDuration(minutes?: number): string {
  if (!minutes) return 'N/A';
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
}

/** Escape characters that would break a Markdown table cell. */
function escapeCell(value: string): string {
  return value.replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

/** Render free text as a blockquote, one `>` per line. */
function blockquote(text: string): string {
  return text
    .split(/\r?\n/)
    .map((line) => (line.trim() ? `> ${line}` : '>'))
    .join('\n');
}

function humanize(value: string): string {
  return value.replace(/_/g, ' ');
}

function formatReps(set: WorkoutSet): string {
  if (set.actualReps === undefined) return String(set.targetReps);
  if (set.actualReps === set.targetReps) return String(set.actualReps);
  return `${set.actualReps} (target: ${set.targetReps})`;
}

function renderExercise(
  workoutExercise: WorkoutExercise,
  getExerciseName: WorkoutMarkdownOptions['getExerciseName']
): string[] {
  const name = getExerciseName(workoutExercise.exerciseId) ?? UNKNOWN_EXERCISE;
  const completedSets = workoutExercise.sets.filter((s) => s.completed);
  const volume = Math.round(calculateExerciseVolume(workoutExercise.sets));

  const lines: string[] = [`### ${name}`, '', `Volume: ${volume} kg`, ''];

  if (completedSets.length === 0) {
    lines.push('_No completed sets._');
  } else {
    lines.push(
      '| Set | Weight | Reps | RIR | Volume |',
      '| --- | --- | --- | --- | --- |'
    );
    completedSets.forEach((set, idx) => {
      lines.push(
        `| ${idx + 1} | ${set.weight} kg | ${formatReps(set)} | ${
          set.rir ?? '-'
        } | ${Math.round(calculateSetVolume(set))} kg |`
      );
    });
  }

  if (workoutExercise.notes) {
    lines.push('', `**Notes:** ${escapeCell(workoutExercise.notes)}`);
  }

  return lines;
}

function renderFeedback(workout: Workout): string[] {
  const feedback = workout.feedback;
  if (!feedback) return [];
  const { overallRecovery, muscleGroupFeedback, notes } = feedback;
  const hasMuscleFeedback = !!muscleGroupFeedback?.length;
  if (!overallRecovery && !hasMuscleFeedback && !notes) return [];

  const lines: string[] = ['## Feedback', ''];
  if (overallRecovery) {
    lines.push(`- **Overall recovery:** ${humanize(overallRecovery)}`);
  }
  if (hasMuscleFeedback) {
    lines.push('- **Muscle group feedback:**');
    for (const mgf of muscleGroupFeedback!) {
      const parts: string[] = [];
      if (mgf.pump !== undefined) parts.push(`Pump ${mgf.pump}/5`);
      if (mgf.soreness !== undefined) parts.push(`Soreness ${mgf.soreness}/5`);
      lines.push(`  - ${mgf.muscleGroup}: ${parts.join(', ') || '-'}`);
    }
  }
  if (notes) {
    lines.push(`- **Notes:** ${escapeCell(notes)}`);
  }
  return lines;
}

export function workoutToMarkdown(
  workout: Workout,
  options: WorkoutMarkdownOptions
): string {
  const formatDate = options.formatDate ?? defaultFormatDate;

  const totalSets = workout.exercises.reduce(
    (total, ex) => total + ex.sets.filter((s) => s.completed).length,
    0
  );
  const totalVolume = Math.round(
    workout.exercises.reduce(
      (total, ex) => total + calculateExerciseVolume(ex.sets),
      0
    )
  );

  const sections: string[][] = [];

  sections.push([
    `# Workout – ${formatDate(workout.date)}`,
    '',
    `- **Duration:** ${formatDuration(workout.duration)}`,
    `- **Total sets:** ${totalSets}`,
    `- **Total volume:** ${totalVolume} kg`,
  ]);

  if (workout.notes) {
    sections.push(['## Notes', '', blockquote(workout.notes)]);
  }

  const exerciseLines: string[] = ['## Exercises'];
  if (workout.exercises.length === 0) {
    exerciseLines.push('', '_No exercises recorded._');
  } else {
    for (const ex of workout.exercises) {
      exerciseLines.push('', ...renderExercise(ex, options.getExerciseName));
    }
  }
  sections.push(exerciseLines);

  const feedback = renderFeedback(workout);
  if (feedback.length > 0) sections.push(feedback);

  return sections.map((s) => s.join('\n')).join('\n\n') + '\n';
}
