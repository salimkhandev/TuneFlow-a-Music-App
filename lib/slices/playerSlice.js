import { createSlice } from "@reduxjs/toolkit";

// Load state from sessionStorage
const loadState = () => {
  if (typeof window !== "undefined") {
    const storedState = sessionStorage.getItem("playerState");
    return storedState ? JSON.parse(storedState) : null;
  }
  return null;
};

const initialState = loadState() || {
  currentSong: null,
  queue: [], // Array to hold the song queue
  queueIndex: -1, // Current position in the queue
  isPlaying: false,
  volume: 50,
  progress: 0,
};

const playerSlice = createSlice({
  name: "player",
  initialState,
  reducers: {
    playSong: (state, action) => {
      // If we have a payload with queue information
      if (action.payload.queue && action.payload.index !== undefined) {
        state.queue = action.payload.queue;
        state.queueIndex = action.payload.index;
        state.currentSong = state.queue[state.queueIndex];
      } else {
        // Legacy support for direct song playing
        state.currentSong = action.payload;
        // Clear queue when playing a single song directly
        state.queue = [action.payload];
        state.queueIndex = 0;
      }
      state.isPlaying = true;
    },
    togglePlayPause: (state) => {
      state.isPlaying = !state.isPlaying;
    },
    setVolume: (state, action) => {
      state.volume = action.payload;
    },
    setProgress: (state, action) => {
      state.progress = action.payload;
    },
    nextSong: (state) => {
      // Only proceed if we have songs in the queue
      if (state.queue.length > 0) {
        // Increment index, or loop back to beginning
        state.queueIndex = (state.queueIndex + 1) % state.queue.length;
        state.currentSong = state.queue[state.queueIndex];
        state.progress = 0; // Reset progress for new song
      }
    },
    previousSong: (state) => {
      // Only proceed if we have songs in the queue
      if (state.queue.length > 0) {
        // Decrement index, or loop to end
        state.queueIndex =
          state.queueIndex <= 0 ? state.queue.length - 1 : state.queueIndex - 1;
        state.currentSong = state.queue[state.queueIndex];
        state.progress = 0; // Reset progress for new song
      }
    },
    addToQueue: (state, action) => {
      // Add a song to the end of the queue
      state.queue.push(action.payload);
    },
    clearQueue: (state) => {
      state.queue = state.currentSong ? [state.currentSong] : [];
      state.queueIndex = state.currentSong ? 0 : -1;
    },
  },
});

export const {
  playSong,
  togglePlayPause,
  setVolume,
  setProgress,
  nextSong,
  previousSong,
  addToQueue,
  clearQueue,
} = playerSlice.actions;

export default playerSlice.reducer;
