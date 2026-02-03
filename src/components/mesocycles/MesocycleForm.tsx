/**
 * Form component for creating mesocycles (training blocks)
 */

import { useState, useEffect } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import type { Mesocycle, MesocycleSplitDay } from '../../types/models';
import { db } from '../../db';
import { generateDefaultSplitDays } from '../../lib/splitUtils';
import MesocycleExerciseConfig from './MesocycleExerciseConfig';
import './MesocycleForm.css';

interface MesocycleFormProps {
  isOpen: boolean;
  existingMesocycle?: Mesocycle; // If provided, form is in edit mode
  onSave: (
    mesocycle: Omit<Mesocycle, 'id' | 'createdAt' | 'updatedAt'>
  ) => Promise<void>;
  onCancel: () => void;
}

const TRAINING_SPLITS: Array<{
  value: Mesocycle['trainingSplit'];
  label: string;
}> = [
  { value: 'upper_lower', label: 'Upper/Lower (4 days/week)' },
  { value: 'push_pull_legs', label: 'Push/Pull/Legs (3-6 days/week)' },
  { value: 'full_body', label: 'Full Body (2-4 days/week)' },
  { value: 'bro_split', label: 'Bro Split (5-6 days/week)' },
  { value: 'custom', label: 'Custom' },
];

export default function MesocycleForm({
  isOpen,
  existingMesocycle,
  onSave,
  onCancel,
}: MesocycleFormProps) {
  const isEditMode = !!existingMesocycle;
  const [step, setStep] = useState<'basic' | 'exercises'>('basic');
  const [name, setName] = useState('');
  const [durationWeeks, setDurationWeeks] = useState<number>(6);
  const [deloadWeek, setDeloadWeek] = useState<number>(6);
  const [trainingSplit, setTrainingSplit] =
    useState<Mesocycle['trainingSplit']>('push_pull_legs');
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [notes, setNotes] = useState('');
  const [splitDays, setSplitDays] = useState<MesocycleSplitDay[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load exercises for exercise selector
  const exercises = useLiveQuery(() => db.exercises.orderBy('name').toArray());

  useEffect(() => {
    if (isOpen) {
      if (isEditMode && existingMesocycle) {
        // Populate form with existing mesocycle data
        setStep('basic');
        setName(existingMesocycle.name);
        setDurationWeeks(existingMesocycle.durationWeeks);
        setDeloadWeek(existingMesocycle.deloadWeek);
        setTrainingSplit(existingMesocycle.trainingSplit);
        setStartDate(
          new Date(existingMesocycle.startDate).toISOString().split('T')[0]
        );
        setNotes(existingMesocycle.notes || '');
        setSplitDays(existingMesocycle.splitDays || []);
        setError(null);
      } else {
        // Reset form when opened for creation
        setStep('basic');
        setName('');
        setDurationWeeks(6);
        setDeloadWeek(6);
        setTrainingSplit('push_pull_legs');
        setStartDate(new Date().toISOString().split('T')[0]);
        setNotes('');
        setSplitDays(generateDefaultSplitDays('push_pull_legs'));
        setError(null);
      }
    }
  }, [isOpen, isEditMode, existingMesocycle]);

  // Handle training split change with warning in edit mode
  const handleTrainingSplitChange = (newSplit: Mesocycle['trainingSplit']) => {
    if (isEditMode && trainingSplit !== newSplit) {
      if (
        !confirm(
          'Changing the training split will regenerate the split days structure. This may affect your configured exercises. Continue?'
        )
      ) {
        return;
      }
      // Regenerate split days when split type changes in edit mode
      setSplitDays(generateDefaultSplitDays(newSplit));
    }
    setTrainingSplit(newSplit);
  };

  // Update deload week when duration changes
  useEffect(() => {
    if (durationWeeks === 4) {
      setDeloadWeek(4);
    } else if (durationWeeks === 5) {
      setDeloadWeek(5);
    } else {
      setDeloadWeek(6);
    }
  }, [durationWeeks]);

  // Update split days when training split changes (only in create mode)
  useEffect(() => {
    if (step === 'basic' && !isEditMode) {
      setSplitDays(generateDefaultSplitDays(trainingSplit));
    }
  }, [trainingSplit, step, isEditMode]);

  const calculateEndDate = (start: Date, weeks: number): Date => {
    const end = new Date(start);
    end.setDate(end.getDate() + weeks * 7);
    return end;
  };

  const handleNextStep = (e?: React.MouseEvent | React.FormEvent) => {
    // Prevent form submission
    e?.preventDefault();
    e?.stopPropagation();

    setError(null);

    if (!name.trim()) {
      setError('Please enter a mesocycle name');
      return;
    }

    if (deloadWeek > durationWeeks || deloadWeek < 1) {
      setError(`Deload week must be between 1 and ${durationWeeks}`);
      return;
    }

    setStep('exercises');
  };

  const handleBackStep = (e?: React.MouseEvent) => {
    // Prevent form submission
    e?.preventDefault();
    e?.stopPropagation();

    setStep('basic');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const start = new Date(startDate);
      const end = calculateEndDate(start, durationWeeks);

      await onSave({
        name: name.trim(),
        startDate: start,
        endDate: end,
        durationWeeks,
        currentWeek: isEditMode ? existingMesocycle!.currentWeek : 1,
        deloadWeek,
        trainingSplit,
        splitDays,
        status: isEditMode ? existingMesocycle!.status : 'active',
        notes: notes.trim() || undefined,
      });

      // Reset form after successful save (only for create mode)
      if (!isEditMode) {
        setStep('basic');
        setName('');
        setDurationWeeks(6);
        setDeloadWeek(6);
        setTrainingSplit('push_pull_legs');
        setStartDate(new Date().toISOString().split('T')[0]);
        setNotes('');
        setSplitDays(generateDefaultSplitDays('push_pull_legs'));
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to create mesocycle'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const startDateObj = new Date(startDate);
  const endDateObj = calculateEndDate(startDateObj, durationWeeks);

  return (
    <div className="dialog-overlay" onClick={onCancel}>
      <div
        className="dialog form-dialog mesocycle-form-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog-header">
          <h2>
            {isEditMode
              ? step === 'basic'
                ? 'Edit Mesocycle'
                : 'Edit Exercises'
              : step === 'basic'
                ? 'Create New Mesocycle'
                : 'Configure Exercises'}
          </h2>
          <button
            type="button"
            className="dialog-close"
            onClick={onCancel}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="dialog-body">
            {error && (
              <div className="form-error">
                <span>⚠️</span>
                <span>{error}</span>
              </div>
            )}

            {step === 'basic' && (
              <>
                <div className="form-group">
                  <label htmlFor="name" className="form-label">
                    Mesocycle Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="form-input"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Hypertrophy Block - January 2024"
                    required
                    autoFocus
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="durationWeeks" className="form-label">
                      Duration *
                    </label>
                    <select
                      id="durationWeeks"
                      className="form-select"
                      value={durationWeeks}
                      onChange={(e) => setDurationWeeks(Number(e.target.value))}
                      required
                    >
                      <option value="4">4 weeks</option>
                      <option value="5">5 weeks</option>
                      <option value="6">6 weeks</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label htmlFor="deloadWeek" className="form-label">
                      Deload Week *
                    </label>
                    <select
                      id="deloadWeek"
                      className="form-select"
                      value={deloadWeek}
                      onChange={(e) => setDeloadWeek(Number(e.target.value))}
                      required
                    >
                      {Array.from(
                        { length: durationWeeks },
                        (_, i) => i + 1
                      ).map((week) => (
                        <option key={week} value={week}>
                          Week {week}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="trainingSplit" className="form-label">
                    Training Split *
                  </label>
                  <select
                    id="trainingSplit"
                    className="form-select"
                    value={trainingSplit}
                    onChange={(e) =>
                      handleTrainingSplitChange(
                        e.target.value as Mesocycle['trainingSplit']
                      )
                    }
                    required
                  >
                    {TRAINING_SPLITS.map((split) => (
                      <option key={split.value} value={split.value}>
                        {split.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="startDate" className="form-label">
                    Start Date *
                  </label>
                  <input
                    type="date"
                    id="startDate"
                    className="form-input"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                  />
                  <div className="form-help">
                    End date: {endDateObj.toLocaleDateString()} ({durationWeeks}{' '}
                    weeks)
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="notes" className="form-label">
                    Notes (optional)
                  </label>
                  <textarea
                    id="notes"
                    className="form-textarea"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Training goals, focus areas, etc."
                    rows={3}
                  />
                </div>
              </>
            )}

            {step === 'exercises' &&
              (exercises ? (
                <MesocycleExerciseConfig
                  splitDays={splitDays}
                  exercises={exercises}
                  onChange={setSplitDays}
                  mesocycleId={existingMesocycle?.id}
                />
              ) : (
                <div className="mesocycle-form-loading">
                  <p>Loading exercises...</p>
                </div>
              ))}
          </div>

          <div className="dialog-footer">
            {step === 'basic' ? (
              <>
                <button
                  type="button"
                  onClick={onCancel}
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="btn btn-primary"
                  disabled={isSubmitting}
                >
                  Next: {isEditMode ? 'Edit' : 'Configure'} Exercises
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleBackStep}
                  className="btn btn-secondary"
                  disabled={isSubmitting}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={isSubmitting || !exercises}
                >
                  {isSubmitting
                    ? isEditMode
                      ? 'Saving...'
                      : 'Creating...'
                    : isEditMode
                      ? 'Save Changes'
                      : 'Create Mesocycle'}
                </button>
              </>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
