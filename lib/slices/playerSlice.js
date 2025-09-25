import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentSong: null,
  queue: [], // Array to hold the song queue
  queueIndex: -1, // Current position in the queue
  isPlaying: false,
  volume: 50,
  progress: 0,
  isBottomPlayerVisible: false
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
      // Reset progress to start from beginning for new song
      state.progress = 0;
      // Autoplay on selection (usually triggered by a user click)
      state.isPlaying = true;
      state.isBottomPlayerVisible = true;
   
    },
    togglePlayPause: (state) => {
      state.isPlaying = !state.isPlaying;
      // state.isBottomPlayerVisible=true;
    },
    setVolume: (state, action) => {
      state.volume = action.payload;
    },
    setProgress: (state, action) => {
      state.progress = action.payload;
      // state.isBottomPlayerVisible=true;
    },
    nextSong: (state) => {
      // Only proceed if we have songs in the queue
      if (state.queue.length > 0) {
        // Increment index, or loop back to beginning
        state.queueIndex = (state.queueIndex + 1) % state.queue.length;
        state.currentSong = state.queue[state.queueIndex];
        state.progress = 0; // Reset progress for new song
        // state.isBottomPlayerVisible=true;
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
        // state.isBottomPlayerVisible=true;
      }
    },
    addToQueue: (state, action) => {
      // Add a song to the end of the queue
      state.queue.push(action.payload);
      // state.isBottomPlayerVisible=true;
    },
    clearQueue: (state) => {
      state.queue = state.currentSong ? [state.currentSong] : [];
      state.queueIndex = state.currentSong ? 0 : -1;
      // state.isBottomPlayerVisible=true;
    },
    showBottomPlayer:(state)=>{
      state.isBottomPlayerVisible=true;
    },
    hideBottomPlayer:(state)=>{
      state.isBottomPlayerVisible=false;
    }
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
  showBottomPlayer,
  hideBottomPlayer
} = playerSlice.actions;

export default playerSlice.reducer;
