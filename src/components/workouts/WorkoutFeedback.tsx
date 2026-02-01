/**
 * Post-workout feedback component for auto-regulation
 * Collects pump, soreness, and recovery feedback
 */

import { useState } from 'react';
import type {
  WorkoutFeedback as WorkoutFeedbackType,
  MuscleGroupFeedback,
  RecoveryStatus,
  MuscleGroup,
} from '../../types/models';
import './WorkoutFeedback.css';

interface WorkoutFeedbackProps {
  muscleGroups: MuscleGroup[];
  onSubmit: (feedback: WorkoutFeedbackType) => void;
  onSkip: () => void;
}

const RECOVERY_OPTIONS: {
  value: RecoveryStatus;
  label: string;
  emoji: string;
}[] = [
  { value: 'well_recovered', label: 'Well Recovered', emoji: '💪' },
  { value: 'moderately_recovered', label: 'Moderately Recovered', emoji: '👍' },
  { value: 'fatigued', label: 'Fatigued', emoji: '😓' },
  { value: 'very_fatigued', label: 'Very Fatigued', emoji: '😫' },
];

const PUMP_LABELS = [
  'No pump - felt nothing',
  'Minimal pump - slight fullness',
  'Moderate pump - good engagement',
  'Great pump - strong fullness',
  'Extreme pump - maximum engorgement',
];

const SORENESS_LABELS = [
  'No soreness - fully recovered',
  'Minimal soreness - slight awareness',
  'Moderate soreness - noticeable',
  'Significant soreness - affects movement',
  'Severe soreness - difficult to train',
];

const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  chest: 'Chest',
  back: 'Back',
  shoulders: 'Shoulders',
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',
  abs: 'Abs',
  obliques: 'Obliques',
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  glutes: 'Glutes',
  calves: 'Calves',
};

export default function WorkoutFeedback({
  muscleGroups,
  onSubmit,
  onSkip,
}: WorkoutFeedbackProps) {
  const [selectedRecovery, setSelectedRecovery] = useState<
    RecoveryStatus | undefined
  >();
  const [muscleGroupFeedback, setMuscleGroupFeedback] = useState<
    MuscleGroupFeedback[]
  >(() => muscleGroups.map((mg) => ({ muscleGroup: mg })));
  const [notes, setNotes] = useState('');

  const handlePumpChange = (muscleGroup: MuscleGroup, pump: number) => {
    setMuscleGroupFeedback((prev) =>
      prev.map((mgf) =>
        mgf.muscleGroup === muscleGroup ? { ...mgf, pump } : mgf
      )
    );
  };

  const handleSorenessChange = (muscleGroup: MuscleGroup, soreness: number) => {
    setMuscleGroupFeedback((prev) =>
      prev.map((mgf) =>
        mgf.muscleGroup === muscleGroup ? { ...mgf, soreness } : mgf
      )
    );
  };

  const handleSubmit = () => {
    const feedback: WorkoutFeedbackType = {
      overallRecovery: selectedRecovery,
      muscleGroupFeedback: muscleGroupFeedback.filter(
        (mgf) => mgf.pump !== undefined || mgf.soreness !== undefined
      ),
      notes: notes.trim() || undefined,
    };
    onSubmit(feedback);
  };

  return (
    <div className="workout-feedback-overlay">
      <div
        className="workout-feedback-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="feedback-heading"
      >
        <div className="feedback-header">
          <h2 id="feedback-heading">Post-Workout Feedback</h2>
          <p>Help us optimize your training by sharing how you felt</p>
        </div>

        <div className="feedback-content">
          {/* Overall Recovery Status */}
          <div className="feedback-section">
            <h3>Recovery Status</h3>
            <p className="section-description">
              How did you feel before this workout?
            </p>
            <div className="recovery-options">
              {RECOVERY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`recovery-option ${
                    selectedRecovery === option.value ? 'selected' : ''
                  }`}
                  onClick={() => setSelectedRecovery(option.value)}
                  aria-pressed={selectedRecovery === option.value}
                >
                  <span className="option-emoji">{option.emoji}</span>
                  <span className="option-label">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Muscle Group Feedback */}
          <div className="feedback-section">
            <h3>Muscle Group Feedback (Optional)</h3>
            <p className="section-description">
              Rate pump and soreness for trained muscle groups
            </p>

            {muscleGroupFeedback.map((mgf) => {
              const pumpLabelId = `pump-label-${mgf.muscleGroup}`;
              const sorenessLabelId = `soreness-label-${mgf.muscleGroup}`;

              return (
                <div key={mgf.muscleGroup} className="muscle-group-feedback">
                  <h4>{MUSCLE_GROUP_LABELS[mgf.muscleGroup]}</h4>

                  {/* Pump Rating */}
                  <div className="rating-row">
                    <span id={pumpLabelId}>Pump:</span>
                    <div
                      className="rating-scale"
                      role="radiogroup"
                      aria-labelledby={pumpLabelId}
                    >
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          className={`rating-button ${
                            mgf.pump === rating ? 'selected' : ''
                          }`}
                          onClick={() =>
                            handlePumpChange(mgf.muscleGroup, rating)
                          }
                          title={PUMP_LABELS[rating - 1]}
                          aria-label={`Rate pump ${rating} out of 5: ${PUMP_LABELS[rating - 1]}`}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Soreness Rating */}
                  <div className="rating-row">
                    <span id={sorenessLabelId}>
                      Soreness (previous workout):
                    </span>
                    <div
                      className="rating-scale"
                      role="radiogroup"
                      aria-labelledby={sorenessLabelId}
                    >
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <button
                          key={rating}
                          type="button"
                          className={`rating-button ${
                            mgf.soreness === rating ? 'selected' : ''
                          }`}
                          onClick={() =>
                            handleSorenessChange(mgf.muscleGroup, rating)
                          }
                          title={SORENESS_LABELS[rating - 1]}
                          aria-label={`Rate soreness ${rating} out of 5: ${SORENESS_LABELS[rating - 1]}`}
                        >
                          {rating}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Notes */}
          <div className="feedback-section">
            <label htmlFor="feedback-notes">
              <h3>Additional Notes (Optional)</h3>
            </label>
            <textarea
              id="feedback-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any other feedback about this workout?"
              rows={3}
              aria-label="Additional workout feedback notes"
            />
          </div>
        </div>

        <div className="feedback-actions">
          <button type="button" onClick={onSkip} className="btn-secondary">
            Skip Feedback
          </button>
          <button type="button" onClick={handleSubmit} className="btn-primary">
            Save Feedback
          </button>
        </div>
      </div>
    </div>
  );
}
