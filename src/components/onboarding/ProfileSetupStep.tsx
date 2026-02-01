/**
 * Profile setup step - Collects user name, experience level, and unit preferences
 */

import { useState } from 'react';
import type { OnboardingData } from './Onboarding';

interface ProfileSetupStepProps {
  initialData: OnboardingData;
  onNext: (data: Partial<OnboardingData>) => void;
  onBack: () => void;
}

export default function ProfileSetupStep({
  initialData,
  onNext,
  onBack,
}: ProfileSetupStepProps) {
  const [name, setName] = useState(initialData.name || '');
  const [experienceLevel, setExperienceLevel] = useState<
    'beginner' | 'intermediate' | 'advanced'
  >(initialData.experienceLevel || 'beginner');
  const [units, setUnits] = useState<'metric' | 'imperial'>(
    initialData.units || 'metric'
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({
      name: name || 'User',
      experienceLevel,
      units,
    });
  };

  return (
    <div className="onboarding-step profile-setup-step">
      <div className="step-content">
        <h2>Set Up Your Profile</h2>
        <p className="step-description">
          Tell us a bit about yourself to personalize your training experience.
        </p>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="form-group">
            <label htmlFor="name">
              Name <span className="optional-label">(optional)</span>
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="form-input"
              maxLength={50}
            />
          </div>

          <div className="form-group">
            <label>Training Experience</label>
            <p className="field-description">
              This helps us set appropriate default recommendations.
            </p>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="experience"
                  value="beginner"
                  checked={experienceLevel === 'beginner'}
                  onChange={(e) =>
                    setExperienceLevel(
                      e.target.value as 'beginner' | 'intermediate' | 'advanced'
                    )
                  }
                />
                <div className="radio-content">
                  <span className="radio-title">Beginner</span>
                  <span className="radio-description">
                    Less than 1 year of consistent training
                  </span>
                </div>
              </label>

              <label className="radio-option">
                <input
                  type="radio"
                  name="experience"
                  value="intermediate"
                  checked={experienceLevel === 'intermediate'}
                  onChange={(e) =>
                    setExperienceLevel(
                      e.target.value as 'beginner' | 'intermediate' | 'advanced'
                    )
                  }
                />
                <div className="radio-content">
                  <span className="radio-title">Intermediate</span>
                  <span className="radio-description">
                    1-3 years of consistent training
                  </span>
                </div>
              </label>

              <label className="radio-option">
                <input
                  type="radio"
                  name="experience"
                  value="advanced"
                  checked={experienceLevel === 'advanced'}
                  onChange={(e) =>
                    setExperienceLevel(
                      e.target.value as 'beginner' | 'intermediate' | 'advanced'
                    )
                  }
                />
                <div className="radio-content">
                  <span className="radio-title">Advanced</span>
                  <span className="radio-description">
                    3+ years of consistent training
                  </span>
                </div>
              </label>
            </div>
          </div>

          <div className="form-group">
            <label>Unit Preference</label>
            <div className="radio-group radio-group-inline">
              <label className="radio-option radio-option-inline">
                <input
                  type="radio"
                  name="units"
                  value="metric"
                  checked={units === 'metric'}
                  onChange={(e) =>
                    setUnits(e.target.value as 'metric' | 'imperial')
                  }
                />
                <div className="radio-content">
                  <span className="radio-title">Metric</span>
                  <span className="radio-description">kg / cm</span>
                </div>
              </label>

              <label className="radio-option radio-option-inline">
                <input
                  type="radio"
                  name="units"
                  value="imperial"
                  checked={units === 'imperial'}
                  onChange={(e) =>
                    setUnits(e.target.value as 'metric' | 'imperial')
                  }
                />
                <div className="radio-content">
                  <span className="radio-title">Imperial</span>
                  <span className="radio-description">lb / in</span>
                </div>
              </label>
            </div>
          </div>

          <div className="step-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onBack}
            >
              Back
            </button>
            <button type="submit" className="btn btn-primary">
              Continue
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
