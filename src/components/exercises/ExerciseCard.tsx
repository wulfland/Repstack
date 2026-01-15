/**
 * Exercise card component for displaying exercise information
 */

import type { Exercise } from '../../types/models';
import './ExerciseCard.css';

interface ExerciseCardProps {
  exercise: Exercise;
  onEdit: (exercise: Exercise) => void;
  onDelete: (exercise: Exercise) => void;
  onClick?: (exercise: Exercise) => void;
}

export default function ExerciseCard({
  exercise,
  onEdit,
  onDelete,
  onClick,
}: ExerciseCardProps) {
  const handleClick = () => {
    if (onClick) {
      onClick(exercise);
    }
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(exercise);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(exercise);
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

  const getCategoryLabel = (category: Exercise['category']) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  return (
    <div className="exercise-card" onClick={handleClick}>
      <div className="exercise-card-header">
        <div className="exercise-card-title">
          <h3>{exercise.name}</h3>
          {!exercise.isCustom && (
            <span className="exercise-badge starter">Starter</span>
          )}
        </div>
        <div className="exercise-card-actions">
          <button
            className="btn-icon"
            onClick={handleEdit}
            title="Edit exercise"
            aria-label="Edit exercise"
          >
            ✏️
          </button>
          <button
            className="btn-icon"
            onClick={handleDelete}
            title="Delete exercise"
            aria-label="Delete exercise"
          >
            🗑️
          </button>
        </div>
      </div>
      <div className="exercise-card-body">
        <div className="exercise-category">
          <span className="category-icon">{getCategoryIcon(exercise.category)}</span>
          <span className="category-label">{getCategoryLabel(exercise.category)}</span>
        </div>
        <div className="exercise-muscles">
          {exercise.muscleGroups.map((muscle) => (
            <span key={muscle} className="muscle-tag">
              {muscle}
            </span>
          ))}
        </div>
        {exercise.notes && (
          <p className="exercise-notes">{exercise.notes}</p>
        )}
      </div>
    </div>
  );
}
