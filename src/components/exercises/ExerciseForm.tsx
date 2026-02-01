/**
 * Form component for creating and editing exercises
 */

import { useState, useEffect, useRef } from 'react';
import type { Exercise, MuscleGroup } from '../../types/models';
import './ExerciseForm.css';

interface ExerciseFormProps {
  isOpen: boolean;
  exercise?: Exercise | null;
  onSave: (exercise: Omit<Exercise, 'id' | 'createdAt'>) => Promise<void>;
  onCancel: () => void;
}

const CATEGORIES: Array<Exercise['category']> = [
  'barbell',
  'dumbbell',
  'machine',
  'bodyweight',
  'cable',
  'other',
];

const MUSCLE_GROUPS: MuscleGroup[] = [
  'chest',
  'back',
  'shoulders',
  'biceps',
  'triceps',
  'forearms',
  'abs',
  'obliques',
  'quads',
  'hamstrings',
  'glutes',
  'calves',
];

export default function ExerciseForm({
  isOpen,
  exercise,
  onSave,
  onCancel,
}: ExerciseFormProps) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState<Exercise['category']>('barbell');
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([]);
  const [equipment, setEquipment] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (exercise) {
      setName(exercise.name);
      setCategory(exercise.category);
      setMuscleGroups(exercise.muscleGroups);
      setEquipment(exercise.equipment || '');
      setNotes(exercise.notes || '');
    } else {
      // Reset form for new exercise
      setName('');
      setCategory('barbell');
      setMuscleGroups([]);
      setEquipment('');
      setNotes('');
    }
    setError(null);
  }, [exercise, isOpen]);

  useEffect(() => {
    if (isOpen) {
      // Focus the name input when dialog opens
      nameInputRef.current?.focus();

      // Handle ESC key to close dialog
      const handleEscapeKey = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          onCancel();
        }
      };

      // Trap focus within dialog
      const handleTabKey = (event: KeyboardEvent) => {
        if (event.key !== 'Tab' || !dialogRef.current) return;

        const focusableElements =
          dialogRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          );
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (!event.shiftKey && document.activeElement === lastElement) {
          event.preventDefault();
          firstElement.focus();
        }
      };

      document.addEventListener('keydown', handleEscapeKey);
      document.addEventListener('keydown', handleTabKey);

      return () => {
        document.removeEventListener('keydown', handleEscapeKey);
        document.removeEventListener('keydown', handleTabKey);
      };
    }
  }, [isOpen, onCancel]);

  const handleMuscleGroupToggle = (muscle: MuscleGroup) => {
    setMuscleGroups((prev) =>
      prev.includes(muscle)
        ? prev.filter((m) => m !== muscle)
        : [...prev, muscle]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError('Exercise name is required');
      return;
    }

    if (muscleGroups.length === 0) {
      setError('Select at least one muscle group');
      return;
    }

    setIsSubmitting(true);

    try {
      await onSave({
        name: name.trim(),
        category,
        muscleGroups,
        equipment: equipment.trim() || undefined,
        notes: notes.trim() || undefined,
        isCustom: exercise?.isCustom ?? true, // Preserve isCustom for edits, default to true for new
      });
      // Reset form on success
      setName('');
      setCategory('barbell');
      setMuscleGroups([]);
      setEquipment('');
      setNotes('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save exercise');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="dialog-overlay"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="exercise-form-title"
    >
      <div
        className="dialog-content form-dialog"
        onClick={(e) => e.stopPropagation()}
        ref={dialogRef}
      >
        <div className="dialog-header">
          <h2 id="exercise-form-title">
            {exercise ? 'Edit Exercise' : 'Create Exercise'}
          </h2>
          <button
            className="dialog-close"
            onClick={onCancel}
            aria-label="Close dialog"
            type="button"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="dialog-body">
            {error && (
              <div className="form-error" role="alert" aria-live="polite">
                <span aria-hidden="true">⚠️</span>
                <span>{error}</span>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="exercise-name" className="form-label">
                Exercise Name <span aria-label="required">*</span>
              </label>
              <input
                id="exercise-name"
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Bench Press"
                maxLength={200}
                required
                ref={nameInputRef}
                aria-required="true"
              />
            </div>

            <div className="form-group">
              <label htmlFor="exercise-category" className="form-label">
                Category <span aria-label="required">*</span>
              </label>
              <select
                id="exercise-category"
                className="form-select"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as Exercise['category'])
                }
                required
                aria-required="true"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <fieldset>
                <legend className="form-label">
                  Muscle Groups <span aria-label="required">*</span>
                </legend>
                <div className="muscle-group-grid">
                  {MUSCLE_GROUPS.map((muscle) => (
                    <label key={muscle} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={muscleGroups.includes(muscle)}
                        onChange={() => handleMuscleGroupToggle(muscle)}
                        aria-label={
                          muscle.charAt(0).toUpperCase() + muscle.slice(1)
                        }
                      />
                      <span className="checkbox-text">
                        {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            </div>

            <div className="form-group">
              <label htmlFor="exercise-equipment" className="form-label">
                Equipment
              </label>
              <input
                id="exercise-equipment"
                type="text"
                className="form-input"
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                placeholder="e.g., Smith Machine (optional)"
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label htmlFor="exercise-notes" className="form-label">
                Notes
              </label>
              <textarea
                id="exercise-notes"
                className="form-textarea"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about form, technique, or variations (optional)"
                rows={3}
                maxLength={500}
              />
            </div>
          </div>
          <div className="dialog-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : exercise ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
