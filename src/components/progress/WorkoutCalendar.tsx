import { useState, useMemo } from 'react';
import { useWorkouts } from '../../hooks/useDatabase';
import { getWorkoutCalendar } from '../../lib/progressTracking';
import type { CalendarDay } from '../../lib/progressTracking';
import './WorkoutCalendar.css';

export default function WorkoutCalendar() {
  const workouts = useWorkouts();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const calendarData = useMemo(() => {
    if (!workouts) return [];

    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const startDate = new Date(year, month, 1);
    const endDate = new Date(year, month + 1, 0);

    return getWorkoutCalendar(workouts, startDate, endDate);
  }, [workouts, currentMonth]);

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  const handleToday = () => {
    setCurrentMonth(new Date());
  };

  const formatMonthYear = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'long',
      year: 'numeric',
    }).format(date);
  };

  const getDayOfWeek = (date: Date) => {
    return date.getDay();
  };

  const getIntensityClass = (workoutCount: number): string => {
    if (workoutCount === 0) return 'intensity-none';
    if (workoutCount === 1) return 'intensity-low';
    if (workoutCount === 2) return 'intensity-medium';
    return 'intensity-high';
  };

  if (!workouts) {
    return <div className="loading">Loading calendar...</div>;
  }

  // Get first day of month to calculate offset
  const firstDayOfMonth = calendarData[0]?.date;
  const firstDayOffset = firstDayOfMonth ? getDayOfWeek(firstDayOfMonth) : 0;

  return (
    <div className="workout-calendar">
      <div className="calendar-header">
        <h2>Training Calendar</h2>
        <div className="calendar-controls">
          <button onClick={handlePreviousMonth} className="calendar-nav-btn">
            ← Prev
          </button>
          <button onClick={handleToday} className="calendar-today-btn">
            Today
          </button>
          <button onClick={handleNextMonth} className="calendar-nav-btn">
            Next →
          </button>
        </div>
      </div>

      <div className="calendar-month">
        <h3>{formatMonthYear(currentMonth)}</h3>
      </div>

      <div className="calendar-grid">
        <div className="calendar-weekdays">
          <div className="weekday">Sun</div>
          <div className="weekday">Mon</div>
          <div className="weekday">Tue</div>
          <div className="weekday">Wed</div>
          <div className="weekday">Thu</div>
          <div className="weekday">Fri</div>
          <div className="weekday">Sat</div>
        </div>

        <div className="calendar-days">
          {/* Empty cells for days before the first of the month */}
          {Array.from({ length: firstDayOffset }).map((_, idx) => (
            <div key={`empty-${idx}`} className="calendar-day empty"></div>
          ))}

          {/* Actual calendar days */}
          {calendarData.map((day: CalendarDay) => {
            const isToday =
              new Date().toDateString() === day.date.toDateString();
            const dayNumber = day.date.getDate();

            return (
              <div
                key={day.date.toISOString()}
                className={`calendar-day ${getIntensityClass(day.workoutCount)} ${
                  isToday ? 'today' : ''
                }`}
                title={
                  day.workoutCount > 0
                    ? `${day.workoutCount} workout${day.workoutCount > 1 ? 's' : ''}`
                    : 'Rest day'
                }
              >
                <div className="day-number">{dayNumber}</div>
                {day.workoutCount > 0 && (
                  <div className="workout-indicator">
                    {day.workoutCount > 1 ? `${day.workoutCount}x` : '●'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="calendar-legend">
        <h4>Legend</h4>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color intensity-none"></div>
            <span>Rest day</span>
          </div>
          <div className="legend-item">
            <div className="legend-color intensity-low"></div>
            <span>1 workout</span>
          </div>
          <div className="legend-item">
            <div className="legend-color intensity-medium"></div>
            <span>2 workouts</span>
          </div>
          <div className="legend-item">
            <div className="legend-color intensity-high"></div>
            <span>3+ workouts</span>
          </div>
        </div>
      </div>
    </div>
  );
}
