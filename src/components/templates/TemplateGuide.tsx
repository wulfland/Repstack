/**
 * Component for displaying template guidance during workout
 * Shows suggested exercises from the template to help users build their workout
 */

import { useState } from 'react';
import type { ProgramTemplate, TemplateDayPlan } from '../../types/models';
import './TemplateGuide.css';

interface TemplateGuideProps {
  template: ProgramTemplate;
  currentDayIndex: number;
  onChangeDayIndex: (index: number) => void;
  onDismiss: () => void;
}

export default function TemplateGuide({
  template,
  currentDayIndex,
  onChangeDayIndex,
  onDismiss,
}: TemplateGuideProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const currentDay: TemplateDayPlan = template.days[currentDayIndex];

  if (isCollapsed) {
    return (
      <div className="template-guide collapsed">
        <button
          onClick={() => setIsCollapsed(false)}
          className="template-guide-expand"
        >
          📋 Show Template Guide ({template.name} - {currentDay.name})
        </button>
      </div>
    );
  }

  return (
    <div className="template-guide">
      <div className="template-guide-header">
        <div className="template-guide-title">
          <span className="template-icon">📋</span>
          <div>
            <h3>{template.name}</h3>
            <p className="template-subtitle">
              Use this as a guide for your workout
            </p>
          </div>
        </div>
        <div className="template-guide-actions">
          <button
            onClick={() => setIsCollapsed(true)}
            className="btn-icon"
            title="Collapse guide"
          >
            −
          </button>
          <button
            onClick={onDismiss}
            className="btn-icon"
            title="Dismiss guide"
          >
            ×
          </button>
        </div>
      </div>

      <div className="template-guide-body">
        {/* Day selector if multiple days */}
        {template.days.length > 1 && (
          <div className="template-day-selector">
            <label htmlFor="day-select">Training Day:</label>
            <select
              id="day-select"
              value={currentDayIndex}
              onChange={(e) => onChangeDayIndex(Number(e.target.value))}
              className="day-select"
            >
              {template.days.map((day, index) => (
                <option key={index} value={index}>
                  {day.name}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="template-current-day">
          <h4>{currentDay.name}</h4>
          <div className="template-exercises-list">
            {currentDay.exercises.map((exercise, index) => (
              <div key={index} className="template-exercise-guide">
                <div className="template-exercise-number">{index + 1}</div>
                <div className="template-exercise-details">
                  <div className="template-exercise-name">{exercise.name}</div>
                  <div className="template-exercise-volume">
                    {exercise.targetSets} × {exercise.targetReps}
                  </div>
                  <div className="template-exercise-description">
                    {exercise.description}
                  </div>
                  <div className="template-exercise-muscles">
                    {exercise.muscleGroups.map((muscle, idx) => (
                      <span key={idx} className="muscle-badge">
                        {muscle}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="template-guide-note">
          <strong>Note:</strong> These are suggestions. Feel free to substitute
          with exercises that work for you!
        </div>
      </div>
    </div>
  );
}
