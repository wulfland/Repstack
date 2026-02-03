/**
 * Exercise selector modal for adding exercises to workout
 */

import { useState } from 'react';
import type { Exercise, MuscleGroup } from '../../types/models';
import './ExerciseSelector.css';

interface ExerciseSelectorProps {
  exercises: Exercise[];
  selectedExerciseIds: string[];
  onSelect: (exerciseId: string) => void;
  onClose: () => void;
}

// Define muscle group categories for filtering
type MuscleGroupFilter =
  | 'all'
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'core';

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
  const [filterMuscleGroup, setFilterMuscleGroup] =
    useState<MuscleGroupFilter>('all');

  const filteredExercises = exercises.filter((exercise) => {
    const matchesSearch = exercise.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      filterCategory === 'all' || exercise.category === filterCategory;
    const matchesMuscleGroup =
      filterMuscleGroup === 'all' ||
      (filterMuscleGroup === 'core'
        ? exercise.muscleGroups.includes('abs' as MuscleGroup) ||
          exercise.muscleGroups.includes('obliques' as MuscleGroup)
        : exercise.muscleGroups.includes(filterMuscleGroup as MuscleGroup));
    const notSelected = !selectedExerciseIds.includes(exercise.id);
    return matchesSearch && matchesCategory && matchesMuscleGroup && notSelected;
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

  const muscleGroups: MuscleGroupFilter[] = [
    'all',
    'chest',
    'back',
    'shoulders',
    'biceps',
    'triceps',
    'quads',
    'hamstrings',
    'glutes',
    'calves',
    'core',
  ];

  const getMuscleGroupIcon = (muscleGroup: MuscleGroupFilter): string => {
    const icons: Record<MuscleGroupFilter, string> = {
      all: '🔍',
      chest: '💪',
      back: '🔙',
      shoulders: '🫱',
      biceps: '💪',
      triceps: '🦾',
      quads: '🦵',
      hamstrings: '🦵',
      glutes: '🍑',
      calves: '🦿',
      core: '🔥',
    };
    return icons[muscleGroup];
  };

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

  const handleClose = () => {
    // Reset filters when closing
    setSearchQuery('');
    setFilterCategory('all');
    setFilterMuscleGroup('all');
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Add Exercise</h2>
          <button onClick={handleClose} className="btn-close" aria-label="Close">
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

          <div className="filter-section">
            <h3 className="filter-title">Body Part</h3>
            <div className="muscle-group-filters">
              {muscleGroups.map((muscleGroup) => (
                <button
                  key={muscleGroup}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFilterMuscleGroup(muscleGroup);
                  }}
                  className={`muscle-group-filter-btn ${
                    filterMuscleGroup === muscleGroup ? 'active' : ''
                  }`}
                >
                  <span className="filter-icon">
                    {getMuscleGroupIcon(muscleGroup)}
                  </span>
                  <span className="filter-label">
                    {muscleGroup === 'all'
                      ? 'All'
                      : muscleGroup.charAt(0).toUpperCase() + muscleGroup.slice(1)}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="filter-section">
            <h3 className="filter-title">Equipment</h3>
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
