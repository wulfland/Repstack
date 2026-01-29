import type { ReactNode } from 'react';
import './Layout.css';

type Page = 'workout' | 'exercises' | 'mesocycles' | 'progress';

interface LayoutProps {
  children: ReactNode;
  currentPage?: Page;
  onNavigate?: (page: Page) => void;
}

export default function Layout({
  children,
  currentPage = 'workout',
  onNavigate,
}: LayoutProps) {
  const handleNavClick = (page: Page) => (e: React.MouseEvent) => {
    e.preventDefault();
    if (onNavigate) {
      onNavigate(page);
    }
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="container">
          <h1 className="logo">Repstack</h1>
          {/* Desktop navigation - hidden on mobile */}
          <nav className="nav nav-desktop">
            <a
              href="#workouts"
              className={`nav-link ${currentPage === 'workout' ? 'active' : ''}`}
              onClick={handleNavClick('workout')}
            >
              Workouts
            </a>
            <a
              href="#mesocycles"
              className={`nav-link ${currentPage === 'mesocycles' ? 'active' : ''}`}
              onClick={handleNavClick('mesocycles')}
            >
              Mesocycles
            </a>
            <a
              href="#exercises"
              className={`nav-link ${currentPage === 'exercises' ? 'active' : ''}`}
              onClick={handleNavClick('exercises')}
            >
              Exercises
            </a>
            <a
              href="#progress"
              className={`nav-link ${currentPage === 'progress' ? 'active' : ''}`}
              onClick={handleNavClick('progress')}
            >
              Progress
            </a>
          </nav>
        </div>
      </header>
      <main className="main">
        <div className="container">{children}</div>
      </main>
      {/* Mobile bottom navigation - hidden on desktop */}
      <nav className="nav-mobile" aria-label="Mobile navigation">
        <a
          href="#workouts"
          className={`nav-mobile-link ${currentPage === 'workout' ? 'active' : ''}`}
          onClick={handleNavClick('workout')}
        >
          <span className="nav-mobile-icon">💪</span>
          <span className="nav-mobile-label">Workout</span>
        </a>
        <a
          href="#mesocycles"
          className={`nav-mobile-link ${currentPage === 'mesocycles' ? 'active' : ''}`}
          onClick={handleNavClick('mesocycles')}
        >
          <span className="nav-mobile-icon">📊</span>
          <span className="nav-mobile-label">Meso</span>
        </a>
        <a
          href="#exercises"
          className={`nav-mobile-link ${currentPage === 'exercises' ? 'active' : ''}`}
          onClick={handleNavClick('exercises')}
        >
          <span className="nav-mobile-icon">🏋️</span>
          <span className="nav-mobile-label">Exercises</span>
        </a>
        <a
          href="#progress"
          className={`nav-mobile-link ${currentPage === 'progress' ? 'active' : ''}`}
          onClick={handleNavClick('progress')}
        >
          <span className="nav-mobile-icon">📈</span>
          <span className="nav-mobile-label">Progress</span>
        </a>
      </nav>
      <footer className="footer">
        <div className="container">
          <p>
            Repstack - Open Source Hypertrophy Training |{' '}
            <a
              href="https://github.com/wulfland/Repstack"
              target="_blank"
              rel="noopener noreferrer"
            >
              GitHub
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
