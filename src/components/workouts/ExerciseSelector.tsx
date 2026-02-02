/**
 * Exercise selector modal for adding exercises to workout
 */

import { useState } from 'react';
import type { Exercise } from '../../types/models';
import './ExerciseSelector.css';

interface ExerciseSelectorProps {
  exercises: Exercise[];
  selectedExerciseIds: string[];
  onSelect: (exerciseId: string) => void;
  onClose: () => void;
}

export default function ExerciseSelector({
  exercises,
  selectedExerciseIds,
  onSelect,
  onClose,
}: ExerciseSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<
    Exercise['category'] | 'all'
  >('all');

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === 'all' || exercise.category === filterCategory;
    const notSelected = !selectedExerciseIds.includes(exercise.id);
    return matchesSearch && matchesCategory && notSelected;
  });

  const categories: Array<Exercise['category'] | 'all'> = [
    'all',
    'barbell',
    'dumbbell',
    'machine',
    'bodyweight',
    'cable',
    'other',
  ];

  const getCategoryIcon = (category: Exercise['category']) => {
    const icons: Record<Exercise['category'], string> = {
      barbell: '🏋️',
      dumbbell: '💪',
      machine: '🦾',
      bodyweight: '🧘',
      cable: '🔗',
      other: '⚙️',
    };
    return icons[category];
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Exercise</h2>
          <button onClick={onClose} className="btn-close" aria-label="Close">
            ✕
          </button>
        </div>

        <div className="modal-body">
          <div className="exercise-search">
            <input
              type="text"
              placeholder="Search exercises..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              autoFocus
            />
          </div>

          <div className="category-filters">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setFilterCategory(category);
                }}
                className={`category-filter-btn ${
                  filterCategory === category ? 'active' : ''
                }`}
              >
                {category === 'all'
                  ? '📋 All'
                  : `${getCategoryIcon(category as Exercise['category'])} ${
                      category.charAt(0).toUpperCase() + category.slice(1)
                    }`}
              </button>
            ))}
          </div>

          <div className="exercise-list">
            {filteredExercises.length === 0 && (
              <p className="no-results">
                No exercises found. Try adjusting your search or filters.
              </p>
            )}

            {filteredExercises.map((exercise) => (
              <button
                key={exercise.id}
                onClick={() => onSelect(exercise.id)}
                className="exercise-item"
              >
                <div className="exercise-item-header">
                  <span className="exercise-item-icon">
                    {getCategoryIcon(exercise.category)}
                  </span>
                  <span className="exercise-item-name">{exercise.name}</span>
                </div>
                <div className="exercise-item-muscles">
                  {exercise.muscleGroups.map((muscle) => (
                    <span key={muscle} className="muscle-tag-small">
                      {muscle}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
