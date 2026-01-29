# Offline Functionality Guide

## Overview

Repstack is designed to work 100% offline with no degraded functionality. All core features are available without an internet connection, making it perfect for use in gyms with poor cell reception or while traveling.

## Progressive Web App (PWA) Features

### Installation

Repstack can be installed on any device as a native-like app:

**iOS (Safari):**
1. Open Repstack in Safari
2. Tap the Share button
3. Tap "Add to Home Screen"
4. Tap "Add"

**Android (Chrome):**
1. Open Repstack in Chrome
2. Tap the menu (three dots)
3. Tap "Install app" or "Add to Home Screen"
4. Follow the prompts

**Desktop (Chrome, Edge, etc.):**
1. Open Repstack in your browser
2. Look for the install icon in the address bar
3. Click "Install" when prompted
4. The app will open in its own window

### Offline Capabilities

Once installed, Repstack provides complete offline functionality:

✅ **First Load**: The app caches all assets on first load  
✅ **Offline Access**: All features work without internet  
✅ **Data Persistence**: All data is stored locally in IndexedDB  
✅ **Automatic Updates**: When online, the app checks for updates automatically  
✅ **Graceful Transitions**: Seamless switching between online/offline modes

## Features Available Offline

### Exercise Library
- View all exercises
- Create custom exercises
- Edit exercise details
- Delete exercises (with history check)
- Filter and search exercises

### Workout Logging
- Start workout sessions
- Log sets, reps, and weight
- Record performance feedback (pump, soreness, fatigue)
- Complete workouts
- View workout history

### Mesocycle Management
- View active mesocycle
- Track training progress
- View volume recommendations
- Auto-regulation based on feedback
- Deload week tracking

### Progress Tracking
- View workout history
- See exercise progress over time
- Track volume and intensity trends
- View performance analytics

### Data Export
- Export all data to JSON format
- Works completely offline
- Import data from backup files
- Data portability guaranteed

## Technical Implementation

### Service Worker

Repstack uses Workbox to manage offline functionality:

**Caching Strategy:**
- **App Shell**: Cache-first strategy for HTML, CSS, JS
- **Images**: Cache-first with 30-day expiration
- **API Calls** (future): Network-first with offline fallback
- **Static Assets**: Precached on installation

**Cache Management:**
- Automatic cleanup of old caches
- Version-based cache invalidation
- Maximum 10MB cache size
- Smart cache prioritization

### Data Storage

All user data is stored locally using IndexedDB via Dexie.js:

**Tables:**
- `userProfiles`: User settings and preferences
- `exercises`: Exercise library (user-created)
- `workouts`: Workout logs with feedback
- `trainingSessions`: Individual training sessions
- `mesocycles`: Training blocks and progression

**Data Persistence:**
- Automatic saves on every change
- No data loss on app closure
- Works offline indefinitely
- No cloud dependency

### Manifest Configuration

The PWA manifest provides metadata for installation:

```json
{
  "name": "Repstack - Hypertrophy Training",
  "short_name": "Repstack",
  "display": "standalone",
  "orientation": "any",
  "icons": [
    { "src": "pwa-192x192.png", "sizes": "192x192" },
    { "src": "pwa-512x512.png", "sizes": "512x512", "purpose": "maskable" }
  ]
}
```

## Testing Offline Functionality

### Manual Testing

**Test Scenario 1: First Load Offline**
1. Open the app with internet
2. Wait for initial load and caching
3. Turn off internet (Airplane mode)
4. Close and reopen the app
5. Verify: App loads and works normally

**Test Scenario 2: Working Out Offline**
1. Start a workout session
2. Turn off internet (Airplane mode)
3. Log exercises, sets, and reps
4. Complete the workout
5. Verify: All data is saved locally

**Test Scenario 3: Multi-Day Offline Usage**
1. Use the app normally for several days offline
2. Create exercises, log workouts, manage mesocycles
3. Turn internet back on
4. Verify: All data persists and no data loss

**Test Scenario 4: Transition Testing**
1. Use app while online
2. Switch to offline mode (Airplane mode)
3. Continue using app
4. Switch back to online mode
5. Verify: No errors, smooth transitions

### Automated Testing

Run the E2E test suite to verify offline functionality:

```bash
# Run all offline tests
npm run test:e2e -- e2e/offline.spec.ts

# Run specific test
npm run test:e2e -- e2e/offline.spec.ts -g "should work offline"

# Run with UI for debugging
npm run test:e2e:ui
```

### Browser DevTools Testing

**Chrome/Edge DevTools:**
1. Open DevTools (F12)
2. Go to "Application" tab
3. Check "Service Workers" - should show active worker
4. Check "Cache Storage" - should show cached assets
5. Go to "Network" tab
6. Select "Offline" in throttling dropdown
7. Navigate the app to verify offline functionality

## Troubleshooting

### App Won't Load Offline

**Solution:**
1. Ensure you loaded the app at least once while online
2. Check that Service Worker is registered (DevTools → Application → Service Workers)
3. Clear browser cache and reload while online
4. Try reinstalling the app

### Data Not Persisting

**Solution:**
1. Check browser storage permissions
2. Ensure IndexedDB is enabled in browser settings
3. Check available storage space
4. Clear old data if storage is full

### Service Worker Not Updating

**Solution:**
1. Force refresh (Ctrl+Shift+R / Cmd+Shift+R)
2. Unregister old service worker in DevTools
3. Clear cache and reload
4. Reinstall the app

### Install Prompt Not Showing

**Solution:**
1. Ensure HTTPS connection (required for PWA)
2. Check that app meets PWA criteria
3. Try using a supported browser (Chrome, Edge, Safari)
4. Use manual install from browser menu

## Performance Considerations

### Cache Size Management
- App shell: ~500KB
- Static assets: ~8MB total
- Maximum cache: 10MB
- Automatic cleanup of old caches

### Storage Quota
- IndexedDB: Typically 50MB+ available
- Browser dependent
- Monitors storage usage
- Warns if approaching limits

### Battery Optimization
- Minimal background activity
- Efficient IndexedDB queries
- Optimized re-renders
- Low power consumption

## Future Enhancements

### Planned Features
- ✅ Complete offline functionality (Current)
- 🔜 Background sync for future cloud features
- 🔜 Offline analytics and insights
- 🔜 Advanced caching strategies
- 🔜 Sync conflict resolution
- 🔜 Multi-device offline support

### Cloud Sync (Optional Future SaaS)
When cloud sync is added (as an optional paid feature):
- Background sync API for automatic uploads
- Network-first with offline fallback for API calls
- Conflict resolution for multi-device usage
- Selective sync capabilities

**Note:** Core offline functionality will always remain free and open source.

## Best Practices

### For Users
1. **Install the app** for best offline experience
2. **Load once while online** before going offline
3. **Export data regularly** for backup
4. **Check storage** if using for extended periods
5. **Update regularly** when online

### For Developers
1. **Test offline scenarios** thoroughly
2. **Handle online/offline transitions** gracefully
3. **Minimize bundle size** for faster caching
4. **Use IndexedDB efficiently** with proper indexing
5. **Monitor cache size** and implement cleanup
6. **Version service workers** properly
7. **Test on real devices** in addition to DevTools

## Resources

- [PWA Checklist](https://web.dev/pwa-checklist/)
- [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [IndexedDB Guide](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)
- [Workbox Documentation](https://developers.google.com/web/tools/workbox)
- [Dexie.js Documentation](https://dexie.org/)

## Support

If you encounter issues with offline functionality:
1. Check this guide for troubleshooting steps
2. Review the E2E tests for expected behavior
3. Open an issue on GitHub with details
4. Include browser, OS, and reproduction steps

---

**Remember:** Repstack is designed to be your reliable workout companion, whether you're online or offline. Train confidently knowing your data is always accessible and secure.
