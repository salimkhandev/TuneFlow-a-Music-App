import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  offlineAudio: [],
  offlineStorageSize: 0,
  offlineCount: 0,
  isStoring: false,
  storingSongId: null,
  showOfflineInfo: false,
};

const offlineSlice = createSlice({
  name: 'offline',
  initialState,
  reducers: {
    setOfflineAudio: (state, action) => {
      state.offlineAudio = action.payload;
    },
    setOfflineStorageSize: (state, action) => {
      state.offlineStorageSize = action.payload;
    },
    setOfflineCount: (state, action) => {
      state.offlineCount = action.payload;
    },
    setIsStoring: (state, action) => {
      state.isStoring = action.payload;
    },
    setStoringSongId: (state, action) => {
      state.storingSongId = action.payload;
    },
    setShowOfflineInfo: (state, action) => {
      state.showOfflineInfo = action.payload;
    },
    // Convenience action to update all offline data at once
    updateOfflineData: (state, action) => {
      const { audio, size, count } = action.payload;
      state.offlineAudio = audio || state.offlineAudio;
      state.offlineStorageSize = size !== undefined ? size : state.offlineStorageSize;
      state.offlineCount = count !== undefined ? count : state.offlineCount;
    },
    // Action to clear all offline data
    clearOfflineData: (state) => {
      state.offlineAudio = [];
      state.offlineStorageSize = 0;
      state.offlineCount = 0;
    },
    // Action to add a single offline audio item
    addOfflineAudio: (state, action) => {
      const newAudio = action.payload;
      const existingIndex = state.offlineAudio.findIndex(audio => audio.songId === newAudio.songId);
      
      if (existingIndex !== -1) {
        // Update existing item
        state.offlineAudio[existingIndex] = newAudio;
      } else {
        // Add new item
        state.offlineAudio.push(newAudio);
      }
      
      // Update count
      state.offlineCount = state.offlineAudio.length;
    },
    // Action to remove a single offline audio item
    removeOfflineAudio: (state, action) => {
      const songId = action.payload;
      state.offlineAudio = state.offlineAudio.filter(audio => audio.songId !== songId);
      state.offlineCount = state.offlineAudio.length;
    },
  },
});

export const {
  setOfflineAudio,
  setOfflineStorageSize,
  setOfflineCount,
  setIsStoring,
  setStoringSongId,
  setShowOfflineInfo,
  updateOfflineData,
  clearOfflineData,
  addOfflineAudio,
  removeOfflineAudio,
} = offlineSlice.actions;

export default offlineSlice.reducer;
