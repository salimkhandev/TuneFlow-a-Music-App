# Global Offline State Management

This document explains how to use the global offline state management system implemented for the TuneFlow music app.

## Overview

The offline states (`offlineAudio`, `offlineStorageSize`, `offlineCount`) are now managed globally using Redux, allowing any component in the app to access and update these states efficiently.

## Files Created/Modified

### 1. `lib/slices/offlineSlice.js`
- Contains the Redux slice with all offline-related state and actions
- Includes convenience actions like `updateOfflineData` and `clearOfflineData`

### 2. `lib/store/Store.js`
- Updated to include the offline reducer

### 3. `lib/hooks/useOffline.js`
- Custom hooks for easy access to offline state and actions
- Provides both individual and combined hooks

### 4. `components/liked-songs/LikedSongs.jsx`
- Updated to use global Redux state instead of local state

## Available Hooks

### Individual State Hooks
```javascript
import { 
  useOfflineAudio, 
  useOfflineStorageSize, 
  useOfflineCount,
  useIsStoring,
  useStoringSongId,
  useShowOfflineInfo 
} from '@/lib/hooks/useOffline';

const MyComponent = () => {
  const offlineAudio = useOfflineAudio();
  const storageSize = useOfflineStorageSize();
  const count = useOfflineCount();
  // ... use the values
};
```

### Individual Action Hooks
```javascript
import { useOfflineActions } from '@/lib/hooks/useOffline';

const MyComponent = () => {
  const { 
    updateOfflineData, 
    clearOfflineData,
    addOfflineAudio,
    removeOfflineAudio 
  } = useOfflineActions();
  
  // Use the actions
};
```

### Combined Hook (Recommended)
```javascript
import { useOffline } from '@/lib/hooks/useOffline';

const MyComponent = () => {
  const {
    // State
    offlineAudio,
    offlineStorageSize,
    offlineCount,
    isStoring,
    storingSongId,
    showOfflineInfo,
    // Actions
    updateOfflineData,
    clearOfflineData,
    addOfflineAudio,
    removeOfflineAudio,
    setIsStoring,
    setStoringSongId,
    setShowOfflineInfo
  } = useOffline();
};
```

### Utility Hooks
```javascript
import { useOfflineSongIds, useIsSongOffline } from '@/lib/hooks/useOffline';

const MyComponent = ({ songId }) => {
  const offlineSongIds = useOfflineSongIds(); // Returns Set for performance
  const isSongOffline = useIsSongOffline(songId); // Boolean for specific song
};
```

## Common Usage Patterns

### 1. Update All Offline Data
```javascript
const refreshOfflineData = async () => {
  const audio = await getAllOfflineAudio();
  const size = await getOfflineAudioSize();
  const count = await getOfflineAudioCount();
  updateOfflineData({ audio, size, count });
};
```

### 2. Add Single Offline Audio
```javascript
const addSongOffline = async (song) => {
  const success = await storeAudioOffline(song);
  if (success) {
    addOfflineAudio(song);
  }
};
```

### 3. Remove Single Offline Audio
```javascript
const removeSongOffline = async (songId) => {
  const success = await removeAudioOffline(songId);
  if (success) {
    removeOfflineAudio(songId);
  }
};
```

### 4. Clear All Offline Data
```javascript
const clearAllOffline = async () => {
  const success = await clearAllOfflineAudio();
  if (success) {
    clearOfflineData();
  }
};
```

### 5. Check if Song is Offline
```javascript
const SongComponent = ({ song }) => {
  const isOffline = useIsSongOffline(song.id);
  
  return (
    <div>
      {isOffline && <span>📱 Available offline</span>}
    </div>
  );
};
```

## Benefits

1. **Global Access**: Any component can access offline state without prop drilling
2. **Performance**: Optimized selectors prevent unnecessary re-renders
3. **Consistency**: Single source of truth for offline data
4. **Efficiency**: Convenience actions reduce boilerplate code
5. **Type Safety**: Redux Toolkit provides excellent TypeScript support

## Migration Guide

If you have existing components using local offline state:

1. Remove local state declarations:
   ```javascript
   // Remove this
   const [offlineAudio, setOfflineAudio] = useState([]);
   const [offlineStorageSize, setOfflineStorageSize] = useState(0);
   const [offlineCount, setOfflineCount] = useState(0);
   ```

2. Add the hook import and usage:
   ```javascript
   import { useOffline } from '@/lib/hooks/useOffline';
   
   const { offlineAudio, offlineStorageSize, offlineCount, updateOfflineData } = useOffline();
   ```

3. Replace state updates:
   ```javascript
   // Replace this
   setOfflineAudio(audio);
   setOfflineStorageSize(size);
   setOfflineCount(count);
   
   // With this
   updateOfflineData({ audio, size, count });
   ```

This global state management system provides a robust, efficient, and easy-to-use solution for managing offline audio states throughout the TuneFlow app.
