/**
 * Card component for displaying a single mesocycle
 */

import type { Mesocycle } from '../../types/models';
import './MesocycleCard.css';

interface MesocycleCardProps {
  mesocycle: Mesocycle;
  onComplete?: (id: string) => void;
  onAbandon?: (id: string) => void;
  onEdit?: (id: string) => void;
}

const SPLIT_LABELS: Record<Mesocycle['trainingSplit'], string> = {
  upper_lower: 'Upper/Lower',
  push_pull_legs: 'Push/Pull/Legs',
  full_body: 'Full Body',
  bro_split: 'Bro Split',
  custom: 'Custom',
};

export default function MesocycleCard({
  mesocycle,
  onComplete,
  onAbandon,
  onEdit,
}: MesocycleCardProps) {
  const isActive = mesocycle.status === 'active';
  const isDeloadWeek = mesocycle.currentWeek === mesocycle.deloadWeek;
  const progress = (mesocycle.currentWeek / mesocycle.durationWeeks) * 100;

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getDaysRemaining = () => {
    const now = new Date();
    const end = new Date(mesocycle.endDate);
    const diffTime = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysRemaining = isActive ? getDaysRemaining() : null;

  return (
    <div className={`mesocycle-card ${isActive ? 'active' : ''}`}>
      <div className="mesocycle-card-header">
        <div>
          <h3 className="mesocycle-card-title">{mesocycle.name}</h3>
          <div className="mesocycle-card-meta">
            <span className={`status-badge status-${mesocycle.status}`}>
              {mesocycle.status}
            </span>
            <span className="split-badge">
              {SPLIT_LABELS[mesocycle.trainingSplit]}
            </span>
          </div>
        </div>
        {onEdit && (
          <button
            onClick={() => onEdit(mesocycle.id)}
            className="btn btn-sm btn-secondary"
            title="Edit mesocycle"
          >
            ✏️ Edit
          </button>
        )}
      </div>

      <div className="mesocycle-card-body">
        {/* Progress Bar */}
        <div className="progress-section">
          <div className="progress-header">
            <span className="progress-label">
              Week {mesocycle.currentWeek} of {mesocycle.durationWeeks}
              {isDeloadWeek && <span className="deload-badge">🔄 Deload</span>}
            </span>
            {isActive && daysRemaining !== null && (
              <span className="days-remaining">
                {daysRemaining > 0 ? `${daysRemaining} days left` : 'Completed'}
              </span>
            )}
          </div>
          <div className="progress-bar">
            <div
              className={`progress-fill ${isDeloadWeek ? 'deload' : ''}`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Week Indicators */}
        <div className="week-indicators">
          {Array.from({ length: mesocycle.durationWeeks }, (_, i) => i + 1).map(
            (week) => {
              const isCurrent = week === mesocycle.currentWeek;
              const isComplete = week < mesocycle.currentWeek;
              const isDeload = week === mesocycle.deloadWeek;

              return (
                <div
                  key={week}
                  className={`week-indicator ${isCurrent ? 'current' : ''} ${isComplete ? 'complete' : ''} ${isDeload ? 'deload' : ''}`}
                  title={isDeload ? `Week ${week} (Deload)` : `Week ${week}`}
                >
                  <span className="week-number">{week}</span>
                  {isDeload && <span className="week-badge">D</span>}
                </div>
              );
            }
          )}
        </div>

        {/* Dates */}
        <div className="mesocycle-dates">
          <span>
            📅 {formatDate(mesocycle.startDate)} →{' '}
            {formatDate(mesocycle.endDate)}
          </span>
        </div>

        {/* Notes */}
        {mesocycle.notes && (
          <div className="mesocycle-notes">
            <p>{mesocycle.notes}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      {isActive && onComplete && onAbandon && (
        <div className="mesocycle-card-footer">
          <button
            onClick={() => onComplete(mesocycle.id)}
            className="btn btn-sm btn-success"
          >
            ✓ Complete
          </button>
          <button
            onClick={() => onAbandon(mesocycle.id)}
            className="btn btn-sm btn-secondary"
          >
            Abandon
          </button>
        </div>
      )}
    </div>
  );
}
