# Project Architecture

## Overview

Repstack is built as a Progressive Web App (PWA) using React, TypeScript, and Vite. The architecture follows modern web development best practices with a focus on offline-first capabilities, type safety, and code quality.

## Technology Stack

### Core Framework
- **React 19** - UI library with latest features
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server

### PWA & Storage
- **vite-plugin-pwa** - PWA configuration and manifest generation
- **Workbox** - Service Worker lifecycle management
- **Dexie.js** - IndexedDB wrapper for local data storage
- **dexie-react-hooks** - React hooks for reactive database queries

### Code Quality
- **ESLint** - JavaScript/TypeScript linting
- **Prettier** - Code formatting
- **TypeScript strict mode** - Enhanced type checking

## Project Structure

```
Repstack/
├── public/                 # Static assets served directly
│   ├── pwa-192x192.png    # PWA icon (192x192)
│   ├── pwa-512x512.png    # PWA icon (512x512)
│   ├── apple-touch-icon.png # iOS home screen icon
│   ├── icon.svg           # Source icon (SVG)
│   ├── robots.txt         # SEO robots file
│   └── vite.svg           # Vite logo
│
├── src/                   # Application source code
│   ├── components/        # Reusable UI components
│   ├── layouts/           # Layout components
│   │   ├── Layout.tsx     # Main app layout with header/footer
│   │   └── Layout.css     # Layout styles
│   ├── features/          # Feature-specific components
│   ├── pages/             # Page-level components
│   ├── hooks/             # Custom React hooks
│   │   └── useDatabase.ts # Database interaction hooks
│   ├── db/                # Database configuration
│   │   └── index.ts       # Dexie schema and types
│   ├── lib/               # Utility functions
│   ├── styles/            # Global styles
│   ├── App.tsx            # Root application component
│   ├── App.css            # App-specific styles
│   ├── main.tsx           # Application entry point
│   └── index.css          # Global CSS reset and variables
│
├── index.html             # HTML entry point
├── vite.config.ts         # Vite configuration
├── tsconfig.json          # TypeScript base configuration
├── tsconfig.app.json      # TypeScript app configuration
├── tsconfig.node.json     # TypeScript Node configuration
├── eslint.config.js       # ESLint configuration
├── .prettierrc            # Prettier configuration
├── .prettierignore        # Prettier ignore patterns
├── package.json           # Dependencies and scripts
└── .gitignore             # Git ignore patterns
```

## Key Architecture Decisions

### 1. Progressive Web App (PWA)

**Decision:** Use vite-plugin-pwa with Workbox for PWA capabilities.

**Rationale:**
- Provides offline-first functionality out of the box
- Automatic service worker generation
- Easy configuration with sensible defaults
- Works seamlessly with Vite's build process

**Implementation:**
- Service Worker caches all static assets
- Runtime caching for external resources (fonts, etc.)
- Manifest configured for installation on all platforms

### 2. Local-First Data Storage

**Decision:** Use IndexedDB via Dexie.js for all user data.

**Rationale:**
- No backend required for core functionality
- Data stays on user's device (privacy-first)
- Works completely offline
- Large storage capacity compared to localStorage
- Dexie provides cleaner API than raw IndexedDB

**Schema:**
```typescript
- users: User profiles and preferences
- exercises: Exercise library (user-created)
- workouts: Workout logs with sets, reps, feedback
- mesocycles: Training blocks (4-6 week programs)
```

### 3. Mobile-First Responsive Design

**Decision:** Build with mobile-first approach using CSS flexbox/grid.

**Rationale:**
- Most users will access on mobile devices
- Easier to scale up than scale down
- Better performance on mobile
- Forces focus on essential features

**Breakpoints:**
- Mobile: < 640px
- Tablet: 641px - 1024px
- Desktop: > 1024px

### 4. Component Organization

**Decision:** Organize by feature with atomic design principles.

**Structure:**
- `components/` - Reusable, generic components (buttons, inputs)
- `features/` - Feature-specific components (workout logger, exercise library)
- `layouts/` - Page layouts and structural components
- `pages/` - Top-level page components

**Rationale:**
- Clear separation of concerns
- Easy to locate and modify features
- Promotes reusability
- Scales well as app grows

### 5. Type Safety with TypeScript

**Decision:** Use TypeScript in strict mode throughout.

**Configuration:**
- `strict: true` - All strict checks enabled
- `noImplicitAny: true` - No implicit any types
- Type-only imports where possible

**Rationale:**
- Catch errors at compile time
- Better IDE support and autocomplete
- Self-documenting code
- Easier refactoring

## Data Flow

### 1. Database Layer (Dexie)
- Defines schema and models
- Handles IndexedDB interactions
- Provides type-safe API

### 2. Hooks Layer
- React hooks wrap database operations
- Provides reactive data with `useLiveQuery`
- Handles loading and error states

### 3. Component Layer
- Components consume hooks
- Display data to users
- Trigger database operations

**Example Flow:**
```
User Action → Component → Hook → Database → Reactive Update → Component Re-render
```

## Build & Development

### Development Mode
```bash
npm run dev
```
- Starts Vite dev server with HMR
- PWA features enabled for testing
- Service Worker registers in development

### Production Build
```bash
npm run build
```
- TypeScript compilation with strict checks
- Vite optimizes and bundles code
- Service Worker generated with all assets
- Manifest.json created
- Output in `dist/` directory

### Code Quality
```bash
npm run lint      # Check for linting errors
npm run format    # Format code with Prettier
npm run type-check # TypeScript type checking
```

## Performance Considerations

### Bundle Optimization
- Code splitting at route level
- Dynamic imports for large features
- Tree shaking of unused code
- Minification and compression

### Caching Strategy
- **Precache:** All app shell assets (HTML, CSS, JS)
- **Cache First:** Static assets (images, fonts)
- **Network First:** API calls (future feature)

### Loading Performance
- Critical CSS inlined
- Lazy load non-critical components
- Optimize images (WebP with fallbacks)
- Minimize JavaScript bundle size

**Targets:**
- Initial load: < 3 seconds on 3G
- Time to interactive: < 5 seconds
- Bundle size: < 300KB gzipped

## Security Considerations

### Data Privacy
- All data stored locally on user's device
- No analytics or tracking by default
- Data export/import for portability
- Clear data deletion options

### Input Validation
- TypeScript types at compile time
- Runtime validation for user inputs
- Sanitization of user-generated content

### Service Worker
- HTTPS required for Service Worker
- Same-origin policy enforced
- Secure caching strategies

## Future Architecture Plans

### Phase 1 (Current)
- ✅ PWA foundation
- ✅ Local data storage
- ✅ Responsive layout

### Phase 2
- State management (Zustand or Context)
- Form validation library
- Component library expansion
- Routing (React Router)

### Phase 3
- Optional cloud sync (SaaS layer)
- REST API integration
- Authentication system
- Multi-device sync

### Phase 4
- Internationalization (i18n)
- Dark mode
- Advanced analytics
- Social features

## Contributing Guidelines

### Code Style
- Follow Prettier configuration
- Use ESLint recommended rules
- Write meaningful commit messages
- Add TypeScript types for all functions

### Component Guidelines
- One component per file
- Use functional components with hooks
- Props interface defined above component
- CSS modules or CSS-in-JS for styles

### Testing (Future)
- Unit tests for business logic
- Integration tests for features
- E2E tests for critical paths
- Aim for >80% coverage

## Resources

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Dexie.js Guide](https://dexie.org/)
- [PWA Best Practices](https://web.dev/progressive-web-apps/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
