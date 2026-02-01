/**
 * Progress indicator for onboarding steps
 */

interface Step {
  id: string;
  title: string;
  optional: boolean;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: number;
  onStepClick?: (index: number) => void;
}

export default function ProgressIndicator({
  steps,
  currentStep,
  onStepClick,
}: ProgressIndicatorProps) {
  return (
    <div className="progress-indicator" role="navigation" aria-label="Onboarding progress">
      <div className="progress-dots">
        {steps.map((step, index) => (
          <button
            key={step.id}
            className={`progress-dot ${index === currentStep ? 'active' : ''} ${
              index < currentStep ? 'completed' : ''
            }`}
            onClick={() => onStepClick && index < currentStep && onStepClick(index)}
            disabled={index > currentStep}
            aria-label={`${step.title}${step.optional ? ' (optional)' : ''}${
              index === currentStep ? ' - current step' : ''
            }${index < currentStep ? ' - completed' : ''}`}
            aria-current={index === currentStep ? 'step' : undefined}
          >
            <span className="dot-inner" />
          </button>
        ))}
      </div>
      <div className="progress-label">
        Step {currentStep + 1} of {steps.length}
        {steps[currentStep].optional && <span className="optional-badge"> (optional)</span>}
      </div>
    </div>
  );
}
