/**
 * Component for selecting a program template
 * Displays available templates with descriptions and allows selection or skipping
 */

import { useState } from 'react';
import type { ProgramTemplate } from '../../types/models';
import { PROGRAM_TEMPLATES } from '../../lib/programTemplates';
import TemplatePreview from './TemplatePreview';
import './TemplateSelector.css';

interface TemplateSelectorProps {
  onSelectTemplate: (template: ProgramTemplate) => void;
  onSkip: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function TemplateSelector({
  onSelectTemplate,
  onSkip,
  isOpen,
  onClose,
}: TemplateSelectorProps) {
  const [selectedTemplate, setSelectedTemplate] =
    useState<ProgramTemplate | null>(null);

  if (!isOpen) return null;

  const handleTemplateClick = (template: ProgramTemplate) => {
    setSelectedTemplate(template);
  };

  const handleConfirm = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
      setSelectedTemplate(null);
    }
  };

  const handleSkipClick = () => {
    onSkip();
    setSelectedTemplate(null);
  };

  const handleClose = () => {
    onClose();
    setSelectedTemplate(null);
  };

  return (
    <div className="dialog-overlay" onClick={handleClose}>
      <div
        className="dialog template-selector-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog-header">
          <h2>Choose a Program Template</h2>
          <button
            type="button"
            className="dialog-close"
            onClick={handleClose}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="dialog-body">
          {!selectedTemplate ? (
            <>
              <p className="template-selector-intro">
                Select a template to get started with a structured training
                program, or skip to create your own custom workout.
              </p>

              <div className="template-grid">
                {PROGRAM_TEMPLATES.map((template) => (
                  <div
                    key={template.id}
                    className="template-card"
                    onClick={() => handleTemplateClick(template)}
                  >
                    <h3>{template.name}</h3>
                    <div className="template-meta">
                      <span className="template-days">
                        {template.daysPerWeek} days/week
                      </span>
                      <span className="template-level">
                        {template.targetLevel}
                      </span>
                    </div>
                    <p className="template-description">
                      {template.description}
                    </p>
                    <button
                      className="btn btn-primary"
                      onClick={() => handleTemplateClick(template)}
                    >
                      View Details
                    </button>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <TemplatePreview
              template={selectedTemplate}
              onBack={() => setSelectedTemplate(null)}
              onConfirm={handleConfirm}
            />
          )}
        </div>

        {!selectedTemplate && (
          <div className="dialog-footer">
            <button
              type="button"
              onClick={handleSkipClick}
              className="btn btn-secondary"
            >
              Skip - Create Custom Workout
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
