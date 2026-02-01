import type { ReactNode } from 'react';
import './Layout.css';

type Page = 'workout' | 'exercises' | 'mesocycles' | 'progress' | 'settings';

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
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <header className="header">
        <div className="container">
          <h1 className="logo">Repstack</h1>
          {/* Desktop navigation - hidden on mobile */}
          <nav className="nav nav-desktop" aria-label="Main navigation">
            <a
              href="#workouts"
              className={`nav-link ${currentPage === 'workout' ? 'active' : ''}`}
              onClick={handleNavClick('workout')}
              aria-current={currentPage === 'workout' ? 'page' : undefined}
            >
              Workouts
            </a>
            <a
              href="#mesocycles"
              className={`nav-link ${currentPage === 'mesocycles' ? 'active' : ''}`}
              onClick={handleNavClick('mesocycles')}
              aria-current={currentPage === 'mesocycles' ? 'page' : undefined}
            >
              Mesocycles
            </a>
            <a
              href="#exercises"
              className={`nav-link ${currentPage === 'exercises' ? 'active' : ''}`}
              onClick={handleNavClick('exercises')}
              aria-current={currentPage === 'exercises' ? 'page' : undefined}
            >
              Exercises
            </a>
            <a
              href="#progress"
              className={`nav-link ${currentPage === 'progress' ? 'active' : ''}`}
              onClick={handleNavClick('progress')}
              aria-current={currentPage === 'progress' ? 'page' : undefined}
            >
              Progress
            </a>
            <a
              href="#settings"
              className={`nav-link ${currentPage === 'settings' ? 'active' : ''}`}
              onClick={handleNavClick('settings')}
              aria-current={currentPage === 'settings' ? 'page' : undefined}
            >
              Settings
            </a>
          </nav>
        </div>
      </header>
      <main className="main" id="main-content" tabIndex={-1}>
        <div className="container">{children}</div>
      </main>
      {/* Mobile bottom navigation - hidden on desktop */}
      <nav className="nav-mobile" aria-label="Mobile navigation">
        <a
          href="#workouts"
          className={`nav-mobile-link ${currentPage === 'workout' ? 'active' : ''}`}
          onClick={handleNavClick('workout')}
          aria-current={currentPage === 'workout' ? 'page' : undefined}
          aria-label="Workouts"
        >
          <span className="nav-mobile-icon" aria-hidden="true">💪</span>
          <span className="nav-mobile-label">Workout</span>
        </a>
        <a
          href="#mesocycles"
          className={`nav-mobile-link ${currentPage === 'mesocycles' ? 'active' : ''}`}
          onClick={handleNavClick('mesocycles')}
          aria-current={currentPage === 'mesocycles' ? 'page' : undefined}
          aria-label="Mesocycles"
        >
          <span className="nav-mobile-icon" aria-hidden="true">📊</span>
          <span className="nav-mobile-label">Meso</span>
        </a>
        <a
          href="#exercises"
          className={`nav-mobile-link ${currentPage === 'exercises' ? 'active' : ''}`}
          onClick={handleNavClick('exercises')}
          aria-current={currentPage === 'exercises' ? 'page' : undefined}
          aria-label="Exercises"
        >
          <span className="nav-mobile-icon" aria-hidden="true">🏋️</span>
          <span className="nav-mobile-label">Exercises</span>
        </a>
        <a
          href="#progress"
          className={`nav-mobile-link ${currentPage === 'progress' ? 'active' : ''}`}
          onClick={handleNavClick('progress')}
          aria-current={currentPage === 'progress' ? 'page' : undefined}
          aria-label="Progress"
        >
          <span className="nav-mobile-icon" aria-hidden="true">📈</span>
          <span className="nav-mobile-label">Progress</span>
        </a>
        <a
          href="#settings"
          className={`nav-mobile-link ${currentPage === 'settings' ? 'active' : ''}`}
          onClick={handleNavClick('settings')}
          aria-current={currentPage === 'settings' ? 'page' : undefined}
          aria-label="Settings"
        >
          <span className="nav-mobile-icon" aria-hidden="true">⚙️</span>
          <span className="nav-mobile-label">Settings</span>
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
