/**
 * Component to display previous performance data for an exercise
 */

import type { WorkoutSet } from '../../types/models';
import './PreviousPerformance.css';

interface PreviousPerformanceProps {
  date: Date;
  sets: WorkoutSet[];
}

export default function PreviousPerformance({
  date,
  sets,
}: PreviousPerformanceProps) {
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffDays = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="previous-performance">
      <div className="previous-performance-header">
        <span className="previous-label">Last workout: {formatDate(date)}</span>
      </div>
      <div className="previous-sets">
        {sets.map((set, index) => (
          <div key={set.id} className="previous-set-item">
            <span className="previous-set-number">Set {index + 1}:</span>
            <span className="previous-set-data">
              {set.weight} kg × {set.actualReps || set.targetReps} reps
              {set.rir !== undefined && ` @ ${set.rir} RIR`}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
