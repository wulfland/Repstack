import type { ReactNode } from 'react';
import './Layout.css';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <header className="header">
        <div className="container">
          <h1 className="logo">Repstack</h1>
          <nav className="nav">
            <a href="#workouts" className="nav-link">
              Workouts
            </a>
            <a href="#exercises" className="nav-link">
              Exercises
            </a>
            <a href="#progress" className="nav-link">
              Progress
            </a>
          </nav>
        </div>
      </header>
      <main className="main">
        <div className="container">{children}</div>
      </main>
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
