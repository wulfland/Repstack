/**
 * Main exercise library list component with filtering and search
 */

import { useState, useMemo } from 'react';
import type { Exercise, MuscleGroup } from '../../types/models';
import ExerciseCard from './ExerciseCard';
import ExerciseForm from './ExerciseForm';
import DeleteConfirmDialog from './DeleteConfirmDialog';
import './ExerciseList.css';

interface ExerciseListProps {
  exercises: Exercise[];
  onCreateExercise: (exercise: Omit<Exercise, 'id' | 'createdAt'>) => Promise<void>;
  onUpdateExercise: (id: string, exercise: Partial<Exercise>) => Promise<void>;
  onDeleteExercise: (id: string) => Promise<void>;
  checkExerciseHasHistory: (id: string) => Promise<boolean>;
}

type SortOption = 'alphabetical' | 'recent';

export default function ExerciseList({
  exercises,
  onCreateExercise,
  onUpdateExercise,
  onDeleteExercise,
  checkExerciseHasHistory,
}: ExerciseListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<Exercise['category'] | 'all'>('all');
  const [muscleFilter, setMuscleFilter] = useState<MuscleGroup | 'all'>('all');
  const [sortBy, setSortBy] = useState<SortOption>('alphabetical');
  const [showForm, setShowForm] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    exercise: Exercise | null;
    hasHistory: boolean;
  }>({
    isOpen: false,
    exercise: null,
    hasHistory: false,
  });

  const filteredAndSortedExercises = useMemo(() => {
    let filtered = exercises;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (ex) =>
          ex.name.toLowerCase().includes(query) ||
          ex.muscleGroups.some((m) => m.toLowerCase().includes(query)) ||
          ex.category.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((ex) => ex.category === categoryFilter);
    }

    // Muscle group filter
    if (muscleFilter !== 'all') {
      filtered = filtered.filter((ex) => ex.muscleGroups.includes(muscleFilter));
    }

    // Sorting
    const sorted = [...filtered];
    if (sortBy === 'alphabetical') {
      sorted.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'recent') {
      sorted.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    }

    return sorted;
  }, [exercises, searchQuery, categoryFilter, muscleFilter, sortBy]);

  const handleCreateClick = () => {
    setEditingExercise(null);
    setShowForm(true);
  };

  const handleEditClick = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setShowForm(true);
  };

  const handleDeleteClick = async (exercise: Exercise) => {
    const hasHistory = await checkExerciseHasHistory(exercise.id);
    setDeleteDialog({
      isOpen: true,
      exercise,
      hasHistory,
    });
  };

  const handleFormSave = async (exerciseData: Omit<Exercise, 'id' | 'createdAt'>) => {
    if (editingExercise) {
      await onUpdateExercise(editingExercise.id, exerciseData);
    } else {
      await onCreateExercise(exerciseData);
    }
    setShowForm(false);
    setEditingExercise(null);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingExercise(null);
  };

  const handleDeleteConfirm = async () => {
    if (deleteDialog.exercise) {
      try {
        await onDeleteExercise(deleteDialog.exercise.id);
        setDeleteDialog({ isOpen: false, exercise: null, hasHistory: false });
      } catch (error) {
        alert(error instanceof Error ? error.message : 'Failed to delete exercise');
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({ isOpen: false, exercise: null, hasHistory: false });
  };

  const uniqueCategories: Array<Exercise['category']> = [
    'barbell',
    'dumbbell',
    'machine',
    'bodyweight',
    'cable',
    'other',
  ];

  const uniqueMuscles: MuscleGroup[] = [
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

  return (
    <div className="exercise-list-container">
      <div className="exercise-list-header">
        <h1>Exercise Library</h1>
        <button className="btn btn-primary" onClick={handleCreateClick}>
          + Create Exercise
        </button>
      </div>

      <div className="exercise-list-filters">
        <div className="search-box">
          <input
            type="text"
            className="search-input"
            placeholder="Search exercises..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-row">
          <select
            className="filter-select"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as Exercise['category'] | 'all')}
          >
            <option value="all">All Categories</option>
            {uniqueCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={muscleFilter}
            onChange={(e) => setMuscleFilter(e.target.value as MuscleGroup | 'all')}
          >
            <option value="all">All Muscle Groups</option>
            {uniqueMuscles.map((muscle) => (
              <option key={muscle} value={muscle}>
                {muscle.charAt(0).toUpperCase() + muscle.slice(1)}
              </option>
            ))}
          </select>

          <select
            className="filter-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            <option value="alphabetical">Alphabetical</option>
            <option value="recent">Most Recent</option>
          </select>
        </div>
      </div>

      {filteredAndSortedExercises.length === 0 ? (
        <div className="empty-state">
          <p className="empty-state-icon">🏋️</p>
          <h3 className="empty-state-title">No exercises found</h3>
          <p className="empty-state-text">
            {exercises.length === 0
              ? 'Create your first exercise to get started'
              : 'Try adjusting your filters or search query'}
          </p>
        </div>
      ) : (
        <>
          <div className="exercise-list-count">
            Showing {filteredAndSortedExercises.length} of {exercises.length} exercises
          </div>
          <div className="exercise-grid">
            {filteredAndSortedExercises.map((exercise) => (
              <ExerciseCard
                key={exercise.id}
                exercise={exercise}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            ))}
          </div>
        </>
      )}

      <ExerciseForm
        isOpen={showForm}
        exercise={editingExercise}
        onSave={handleFormSave}
        onCancel={handleFormCancel}
      />

      <DeleteConfirmDialog
        isOpen={deleteDialog.isOpen}
        exerciseName={deleteDialog.exercise?.name || ''}
        hasHistory={deleteDialog.hasHistory}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
