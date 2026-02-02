/**
 * Mesocycle Setup Step in Onboarding
 * Introduces mesocycle concept and guides users to create their first mesocycle
 */

import { useState } from 'react';
import type { OnboardingData } from './Onboarding';

interface MesocycleSetupStepProps {
  initialData: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

export default function MesocycleSetupStep({
  initialData,
  onNext,
  onBack,
}: MesocycleSetupStepProps) {
  const [mesocycleName, setMesocycleName] = useState('My First Mesocycle');
  const [weeks, setWeeks] = useState(4);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({
      mesocycleName,
      mesocycleWeeks: weeks,
      createMesocycle: true,
    });
  };

  return (
    <div className="onboarding-step">
      <div className="step-header">
        <h2>Set Up Your First Mesocycle</h2>
        <p className="step-description">
          Mesocycles are the foundation of evidence-based training
        </p>
      </div>

      <div className="step-content">
        <div className="info-box">
          <h3>💪 What is a Mesocycle?</h3>
          <p>
            A mesocycle is a 4-6 week training block designed to maximize muscle
            growth through:
          </p>
          <ul>
            <li>
              <strong>Progressive Overload:</strong> Gradually increasing volume
              over weeks
            </li>
            <li>
              <strong>Planned Deloads:</strong> Strategic recovery weeks to
              prevent overtraining
            </li>
            <li>
              <strong>Volume Management:</strong> Tracking your training volume
              through MEV, MAV, and MRV
            </li>
            <li>
              <strong>Auto-regulation:</strong> Adjusting based on your recovery
              and feedback
            </li>
          </ul>
        </div>

        <form onSubmit={handleSubmit} className="step-form">
          <div className="form-group">
            <label htmlFor="mesocycle-name">
              Mesocycle Name
              <span className="field-hint">
                Give your training block a memorable name
              </span>
            </label>
            <input
              id="mesocycle-name"
              type="text"
              value={mesocycleName}
              onChange={(e) => setMesocycleName(e.target.value)}
              placeholder="e.g., Spring 2026 Mass Phase"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="weeks">
              Number of Weeks
              <span className="field-hint">
                Most mesocycles are 4-6 weeks (including deload)
              </span>
            </label>
            <select
              id="weeks"
              value={weeks}
              onChange={(e) => setWeeks(Number(e.target.value))}
            >
              <option value={4}>4 Weeks</option>
              <option value={5}>5 Weeks</option>
              <option value={6}>6 Weeks</option>
            </select>
          </div>

          <div className="info-box info-box-secondary">
            <p>
              <strong>📋 Note:</strong> You'll configure exercises and volume
              progression after completing onboarding. For now, we'll create a
              basic structure using your{' '}
              {initialData.trainingSplit ? 'selected' : 'default'} training
              split.
            </p>
          </div>

          <div className="step-actions">
            <button type="button" onClick={onBack} className="btn btn-secondary">
              Back
            </button>
            <button type="submit" className="btn btn-primary">
              Create Mesocycle & Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
