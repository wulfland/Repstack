/**
 * Component for previewing a program template's details
 * Shows all exercises, sets, reps for each training day
 */

import type { ProgramTemplate } from '../../types/models';
import './TemplatePreview.css';

interface TemplatePreviewProps {
  template: ProgramTemplate;
  onBack: () => void;
  onConfirm: () => void;
}

export default function TemplatePreview({
  template,
  onBack,
  onConfirm,
}: TemplatePreviewProps) {
  return (
    <div className="template-preview">
      <div className="template-preview-header">
        <div>
          <h3>{template.name}</h3>
          <div className="template-meta">
            <span className="template-days">
              {template.daysPerWeek} days/week
            </span>
            <span className="template-level">{template.targetLevel}</span>
          </div>
          <p className="template-description">{template.description}</p>
        </div>
      </div>

      <div className="template-preview-body">
        <h4>Training Days</h4>
        <p className="template-note">
          These are suggested exercise categories. You'll select your specific
          exercises when you create each workout.
        </p>

        {template.days.map((day, dayIndex) => (
          <div key={dayIndex} className="template-day">
            <h5 className="template-day-name">{day.name}</h5>
            <div className="template-exercises">
              {day.exercises.map((exercise, exerciseIndex) => (
                <div key={exerciseIndex} className="template-exercise">
                  <div className="template-exercise-header">
                    <span className="template-exercise-name">
                      {exercise.name}
                    </span>
                    <span className="template-exercise-volume">
                      {exercise.targetSets} × {exercise.targetReps}
                    </span>
                  </div>
                  <p className="template-exercise-description">
                    {exercise.description}
                  </p>
                  <div className="template-exercise-muscles">
                    {exercise.muscleGroups.map((muscle, index) => (
                      <span key={index} className="muscle-tag">
                        {muscle}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="template-preview-footer">
        <button type="button" onClick={onBack} className="btn btn-secondary">
          ← Back to Templates
        </button>
        <button type="button" onClick={onConfirm} className="btn btn-primary">
          Use This Template
        </button>
      </div>
    </div>
  );
}
