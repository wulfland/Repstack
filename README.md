# Repstack - Open Source Hypertrophy Training Application

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🎯 Vision

Repstack is an open source alternative to commercial hypertrophy training applications, inspired by evidence-based training principles from Renaissance Periodization. Our mission is to make scientifically-backed muscle building programs accessible to everyone, completely free.

## 🚀 Project Goals

- **Open Source & Free**: Core functionality will always remain free and open source
- **Progressive Web App**: Runs seamlessly on all platforms (iOS, Android, Desktop, Web)
- **Science-Based**: Built on proven hypertrophy training principles
- **Privacy-First**: Your training data stays with you - works offline
- **Community-Driven**: Built by lifters, for lifters

## ✨ Planned Features

### Phase 1: Core Training Engine
- [ ] Personalized training program generator
- [ ] Auto-regulation based on user feedback (pump, soreness, recovery)
- [ ] Progressive overload tracking
- [ ] Mesocycle management (4-6 week training blocks)
- [ ] Deload week scheduling
- [ ] Exercise library with user-created exercises and categories (machine, barbell, dumbbell)

### Phase 2: Enhanced Experience
- [ ] Workout logging and history
- [ ] Progress tracking and analytics
- [ ] Custom exercise creation
- [ ] Template library (1-2 programs for different splits: upper/lower, push/pull/legs, full body)
- [ ] Exercise substitution recommendations
- [ ] Volume landmarks and recovery indicators

### Phase 3: Advanced Features
- [ ] Offline-first PWA capabilities
- [ ] Data export/import
- [ ] Training insights and visualizations
- [ ] Multiple training styles (hypertrophy, strength, hybrid)
- [ ] Equipment-based program filtering
- [ ] Mobile and desktop responsive design

### Future: SaaS Layer (Optional, Paid)
- Premium coaching features
- Advanced analytics
- Team/coach management
- Cloud sync across devices
- Community features and challenges

**Note:** The core application will always remain open source and free. SaaS features will be optional add-ons.

## 🛠️ Technology Stack

**Framework & Build:**
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Fast dev server and build tool

**PWA Capabilities:**
- **vite-plugin-pwa** - PWA configuration and service worker generation
- **Workbox** - Service worker management
- **IndexedDB** - Local data storage via Dexie.js

**Code Quality:**
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript strict mode** - Type checking

## 💻 Development Setup

### Prerequisites

- **Node.js** 18.x or higher
- **npm** 9.x or higher (comes with Node.js)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/wulfland/Repstack.git
   cd Repstack
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The app will be available at `http://localhost:5173/`

### Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors automatically
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run type-check` - Run TypeScript type checking

### PWA Features

The app includes full Progressive Web App capabilities:

- ✅ **Offline Support** - Service Workers cache assets for offline use
- ✅ **Installable** - Can be installed on any device (iOS, Android, Desktop)
- ✅ **Local Storage** - IndexedDB stores user data locally
- ✅ **Responsive** - Mobile-first design that works on all screen sizes
- ✅ **Fast** - Optimized build with code splitting

📖 **[Complete Offline Functionality Guide](docs/OFFLINE_FUNCTIONALITY.md)** - Learn how Repstack works 100% offline

### Testing PWA Features

**Local Development:**
- PWA features are enabled in development mode
- Service Worker registers automatically
- Test offline mode by stopping the dev server after initial load

**Production Build:**
```bash
npm run build
npm run preview
```
Then open in your browser and test:
1. Install the app (look for install prompt)
2. Go offline (DevTools → Network → Offline)
3. App should still work

### Project Structure

```
Repstack/
├── public/              # Static assets
│   ├── pwa-192x192.png  # PWA icon (192x192)
│   ├── pwa-512x512.png  # PWA icon (512x512)
│   ├── apple-touch-icon.png  # iOS home screen icon
│   └── robots.txt       # SEO robots file
├── src/
│   ├── components/      # Reusable UI components
│   ├── layouts/         # Layout components
│   ├── features/        # Feature-specific components
│   ├── pages/           # Page components
│   ├── hooks/           # Custom React hooks
│   ├── db/              # IndexedDB database setup (Dexie)
│   ├── lib/             # Utility functions
│   ├── styles/          # Global styles
│   ├── App.tsx          # Main app component
│   ├── main.tsx         # App entry point
│   └── index.css        # Global CSS
├── index.html           # HTML template
├── vite.config.ts       # Vite configuration
├── tsconfig.json        # TypeScript configuration
├── eslint.config.js     # ESLint configuration
└── .prettierrc          # Prettier configuration
```

### Database Schema

The app uses IndexedDB (via Dexie.js) with the following tables:

- **users** - User profiles and preferences
- **exercises** - Exercise library (user-created)
- **workouts** - Workout logs with sets, reps, and feedback
- **mesocycles** - Training blocks (4-6 week programs)

See `src/db/index.ts` for the complete schema.

### Performance Targets

- ⚡ Initial load: < 3 seconds on 3G
- ⚡ Time to interactive: < 5 seconds
- 📦 Bundle size: Optimized for mobile
- 🚀 Lighthouse score: 90+ across all metrics

## 📋 Project Status

**Current Phase:** ✅ Foundation Complete → 🚀 Building Core Features

The project foundation is now set up with:
- ✅ React + TypeScript + Vite
- ✅ PWA capabilities (offline, installable)
- ✅ IndexedDB for local storage
- ✅ Responsive mobile-first layout
- ✅ Code quality tools (ESLint, Prettier)
- ✅ Production build pipeline

**Next Steps:**
- Build core training engine
- Implement workout logging
- Create exercise library
- Add mesocycle management

## 🤝 Contributing

We welcome contributions! This project is in early stages, but we're excited to build this together with the community.

Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines on how to contribute.

### How You Can Help

- **Requirements Definition**: Help us define features and user stories
- **Design & UX**: Design mockups and user flows
- **Development**: Code contributions once architecture is defined
- **Testing**: Test the app and provide feedback
- **Documentation**: Improve docs and create tutorials
- **Exercise Content**: Contribute exercise descriptions and form cues

## 📖 Documentation

Documentation is being developed alongside the project. Check the `/docs` folder (coming soon) for:

- Architecture decisions
- API documentation
- User guides
- Development setup instructions

## 🎓 Learning Resources

Interested in the science behind the app? Check out:

- [Renaissance Periodization YouTube Channel](https://www.youtube.com/c/RenaissancePeriodization)
- [Hypertrophy Training Principles](https://rpstrength.com/expert-advice)
- [Progressive Overload Explained](https://rpstrength.com/blogs/articles/progressive-overload)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

This means:
- ✅ Free to use, modify, and distribute
- ✅ Can be used in commercial projects
- ✅ Can be used to create derivative works
- ⚠️ Provided "as is" without warranty

## 🔮 Project Roadmap

1. **Phase 1 (3 months)**: Requirements definition and architecture design
2. **Phase 2 (3-4 months)**: Core training engine MVP
3. **Phase 3 (2-3 months)**: PWA features and offline capability
4. **Phase 4**: Public beta release

## 💬 Community & Support

- **Issues**: Use GitHub Issues for bug reports and feature requests
- **Discussions**: Use GitHub Discussions for questions and ideas
- **Contributing**: See CONTRIBUTING.md for contribution guidelines

## 🙏 Acknowledgments

This project is inspired by the work of:
- Dr. Mike Israetel and the Renaissance Periodization team
- The open source fitness community
- Evidence-based training research

**Disclaimer**: This is an independent open source project and is not affiliated with or endorsed by Renaissance Periodization.

---

**Built with ❤️ by the open source fitness community**