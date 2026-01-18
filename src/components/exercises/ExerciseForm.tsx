/**
 * Form component for creating and editing exercises
 */

import { useState, useEffect } from 'react';
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
    <div className="dialog-overlay" onClick={onCancel}>
      <div
        className="dialog-content form-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="dialog-header">
          <h2>{exercise ? 'Edit Exercise' : 'Create Exercise'}</h2>
          <button
            className="dialog-close"
            onClick={onCancel}
            aria-label="Close dialog"
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

            <div className="form-group">
              <label htmlFor="exercise-name" className="form-label">
                Exercise Name *
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
              />
            </div>

            <div className="form-group">
              <label htmlFor="exercise-category" className="form-label">
                Category *
              </label>
              <select
                id="exercise-category"
                className="form-select"
                value={category}
                onChange={(e) =>
                  setCategory(e.target.value as Exercise['category'])
                }
                required
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Muscle Groups *</label>
              <div className="muscle-group-grid">
                {MUSCLE_GROUPS.map((muscle) => (
                  <label key={muscle} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={muscleGroups.includes(muscle)}
                      onChange={() => handleMuscleGroupToggle(muscle)}
                    />
                    <span className="checkbox-text">
                      {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
                    </span>
                  </label>
                ))}
              </div>
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
