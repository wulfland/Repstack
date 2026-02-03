/**
 * Mesocycle Setup Step in Onboarding
 * Introduces mesocycle concept and guides users to create their first mesocycle
 */

import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../db';
import type { OnboardingData } from './Onboarding';
import type { MesocycleSplitDay } from '../../types/models';
import { generateDefaultSplitDays } from '../../lib/splitUtils';
import MesocycleExerciseConfig from '../mesocycles/MesocycleExerciseConfig';

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
  const [step, setStep] = useState<'basic' | 'exercises'>('basic');
  const [mesocycleName, setMesocycleName] = useState('My First Mesocycle');
  const [weeks, setWeeks] = useState(4);
  // Initialize split days based on selected training split
  const [splitDays, setSplitDays] = useState<MesocycleSplitDay[]>(() =>
    initialData.trainingSplit
      ? generateDefaultSplitDays(initialData.trainingSplit)
      : []
  );

  // Load exercises for exercise selector
  const exercises = useLiveQuery(() => db.exercises.orderBy('name').toArray());

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    // Move to exercise configuration step
    setStep('exercises');
  };

  const handleBackStep = () => {
    // Go back to basic settings
    setStep('basic');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({
      mesocycleName,
      mesocycleWeeks: weeks,
      createMesocycle: true,
      splitDays, // Pass configured split days to onboarding
    });
  };

  return (
    <div className="onboarding-step">
      <div className="step-header">
        <h2>
          {step === 'basic'
            ? 'Set Up Your First Mesocycle'
            : 'Configure Exercises'}
        </h2>
        <p className="step-description">
          {step === 'basic'
            ? 'Mesocycles are the foundation of evidence-based training'
            : 'Add exercises to your training days'}
        </p>
      </div>

      <div className="step-content">
        {step === 'basic' ? (
          <>
            <div className="info-box">
              <h3>💪 What is a Mesocycle?</h3>
              <p>
                A mesocycle is a 4-6 week training block designed to maximize
                muscle growth through:
              </p>
              <ul>
                <li>
                  <strong>Progressive Overload:</strong> Gradually increasing
                  volume over weeks
                </li>
                <li>
                  <strong>Planned Deloads:</strong> Strategic recovery weeks to
                  prevent overtraining
                </li>
                <li>
                  <strong>Volume Management:</strong> Tracking your training
                  volume through MEV, MAV, and MRV
                </li>
                <li>
                  <strong>Auto-regulation:</strong> Adjusting based on your
                  recovery and feedback
                </li>
              </ul>
            </div>

            <form onSubmit={handleNextStep} className="step-form">
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

              <div className="step-actions">
                <button
                  type="button"
                  onClick={onBack}
                  className="btn btn-secondary"
                >
                  Back
                </button>
                <button type="submit" className="btn btn-primary">
                  Next: Configure Exercises
                </button>
              </div>
            </form>
          </>
        ) : (
          <>
            {exercises ? (
              <form onSubmit={handleSubmit} className="step-form">
                <MesocycleExerciseConfig
                  splitDays={splitDays}
                  exercises={exercises}
                  onChange={setSplitDays}
                />

                <div className="info-box info-box-secondary">
                  <p>
                    <strong>💡 Tip:</strong> You can add exercises now or skip
                    and configure them later from the Mesocycles page. Your
                    mesocycle will be created with the{' '}
                    {initialData.trainingSplit
                      ?.replace('_', ' ')
                      .replace(/\b\w/g, (l) => l.toUpperCase())}{' '}
                    split structure.
                  </p>
                </div>

                <div className="step-actions">
                  <button
                    type="button"
                    onClick={handleBackStep}
                    className="btn btn-secondary"
                  >
                    Back
                  </button>
                  <button type="submit" className="btn btn-primary">
                    Create Mesocycle & Continue
                  </button>
                </div>
              </form>
            ) : (
              <div className="loading-state">
                <p>Loading exercises...</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
