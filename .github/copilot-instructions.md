# GitHub Copilot Instructions for Repstack

## Project Overview

Repstack is an open source hypertrophy training application inspired by Renaissance Periodization's evidence-based approach. The goal is to create a free, privacy-first Progressive Web App that helps users build muscle through scientifically-backed training programs.

## Core Principles

When working on this project, always keep these principles in mind:

### 1. Open Source First
- Core functionality must remain free and open source forever
- SaaS features are optional add-ons only
- Prioritize features that work locally without requiring a server

### 2. Privacy & Offline-First
- User data should be stored locally by default
- App must work fully offline
- No tracking or analytics without explicit user consent
- Export/import functionality for user data portability

### 3. Science-Based Training
- All training recommendations should be based on evidence-based hypertrophy principles
- Follow Renaissance Periodization's training guidelines:
  - Progressive overload
  - Auto-regulation based on feedback (pump, soreness, fatigue)
  - Mesocycle periodization (4-6 week blocks)
  - Planned deload weeks
  - Volume landmarks (MEV, MAV, MRV)

### 4. Cross-Platform PWA
- Must work seamlessly on iOS, Android, desktop, and web
- Responsive design for all screen sizes
- Native app-like experience with PWA features
- Installable on all platforms

## Development Guidelines

### Code Style
- Write clean, maintainable, well-documented code
- Follow modern JavaScript/TypeScript best practices
- Use functional programming patterns where appropriate
- Keep components small and focused
- Write tests for business logic

### Architecture Considerations
- **Frontend**: Consider React, Vue, or Svelte with PWA plugins
- **State Management**: Local-first with IndexedDB
- **Offline Support**: Service Workers for caching and offline functionality
- **Performance**: Optimize for mobile devices
- **Accessibility**: WCAG 2.1 AA compliance

### Feature Categorization

When adding features, categorize them as:

**Core (Free, Open Source):**
- Training program generation
- Workout logging
- Auto-regulation and feedback
- Exercise library
- Progress tracking
- Mesocycle management
- Basic analytics
- Data export/import

**SaaS (Optional, Paid - Future):**
- Cloud sync
- Advanced analytics
- Coaching features
- Team management
- Social features
- AI-powered recommendations

## Domain Knowledge

### Key Hypertrophy Training Concepts

**Volume Landmarks:**
- **MV (Maintenance Volume)**: Minimum volume to maintain muscle
- **MEV (Minimum Effective Volume)**: Volume needed to make gains
- **MAV (Maximum Adaptive Volume)**: Optimal volume for most growth
- **MRV (Maximum Recoverable Volume)**: Maximum volume before overtraining

**Training Variables:**
- Sets per muscle group per week
- Reps per set (typically 5-30 for hypertrophy, with different ranges for different goals):
  - 5-8 reps: Strength-focused hypertrophy
  - 8-15 reps: Optimal hypertrophy range for most exercises
  - 15-30 reps: Metabolic stress and pump-focused training
- RIR (Reps In Reserve) or proximity to failure
- Training frequency (2-6x per week per muscle)
- Exercise selection and variation

**Mesocycle Structure:**
- Week 1-2: Accumulation (moderate volume)
- Week 3-4: Intensification (higher volume/intensity)
- Week 5-6: Deload (reduced volume for recovery)
- Repeat with progression

**Auto-regulation Inputs:**
- Pump quality (1-5 scale)
- Muscle soreness (1-5 scale)
- Performance (weight/reps achieved)
- Perceived recovery

### Exercise Categories

- Push: Chest, shoulders, triceps
- Pull: Back, biceps, rear delts
- Legs: Quads, hamstrings, glutes, calves
- Core: Abs, obliques

## Requirements Work

When working on requirements with Copilot:

### User Stories Format
```
As a [user type],
I want to [action],
So that [benefit].

Acceptance Criteria:
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3
```

### Feature Planning
- Break features into small, testable increments
- Consider mobile-first design
- Plan for offline functionality from the start
- Think about data models and state management
- Consider accessibility from the beginning

### Questions to Ask
- How does this work offline?
- Where is the data stored?
- Is this core (free) or SaaS (paid)?
- Does this follow hypertrophy training principles?
- How does this scale across devices?
- What are the edge cases?

## Testing Strategy

- Unit tests for business logic (training algorithms, calculations)
- Integration tests for data flow
- E2E tests for critical user paths
- Manual testing on multiple devices/browsers
- Performance testing for large datasets

## Documentation Needs

When adding features, document:
- User-facing: How to use the feature
- Developer: How it works technically
- Training: Scientific basis for training features

## Data Models

Key entities to consider:
- **User Profile**: Training experience, preferences, goals
- **Exercise**: Name, category, muscle groups, equipment
- **Workout**: Exercises, sets, reps, weight, feedback
- **Mesocycle**: Training block with progression plan
- **Training Session**: Individual workout with auto-regulation
- **Progress**: Historical data and analytics

## Security Considerations

- Sanitize all user inputs
- Validate data before storage
- No sensitive data in localStorage (use IndexedDB with encryption if needed)
- Secure any future API endpoints
- Follow OWASP guidelines

## Performance Targets

- Initial load: < 3 seconds on 3G
- Time to interactive: < 5 seconds
- Offline ready: All core features work without internet
- Bundle size: Keep JavaScript bundles small
- Database: Handle 1000+ workouts efficiently

## Accessibility Requirements

- Keyboard navigation support
- Screen reader compatibility
- Sufficient color contrast
- Focus indicators
- ARIA labels where needed
- Responsive text sizing

## Contributing Context

This project welcomes contributions! When generating code or suggestions:
- Write beginner-friendly code with comments
- Include setup instructions
- Consider that contributors have varying experience levels
- Make it easy to test changes locally

## Future Considerations

Keep these future needs in mind when making architectural decisions:
- Multi-language support (i18n)
- Cloud sync architecture (when SaaS layer is added)
- Integration with fitness wearables
- Social/community features
- Video content delivery
- Custom exercise video uploads

## Questions for Copilot Users

When working with Copilot on this project, consider:

1. **Does this feature belong in core or SaaS?**
2. **How does this work offline?**
3. **Is this based on sound hypertrophy training principles?**
4. **Will this scale across mobile, tablet, and desktop?**
5. **Have I considered edge cases and error states?**
6. **Is this accessible to all users?**
7. **Is the user data portable and private?**

## Getting Help

- Check README.md for project overview
- See CONTRIBUTING.md for contribution guidelines
- Review existing issues for context
- Ask questions in GitHub Discussions

---

**Remember: We're building a tool to help people achieve their fitness goals through science-based training. Keep the user's success at the center of every decision.**
