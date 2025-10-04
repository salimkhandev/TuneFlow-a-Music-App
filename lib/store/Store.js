import { configureStore } from "@reduxjs/toolkit";
import { likedSongsApi } from "../api/likedSongsApi";
import networkReducer from "../slices/networkSlice";
import offlineReducer from "../slices/offlineSlice";
import playerReducer from "../slices/playerSlice";

export const store = configureStore({
  reducer: {
    player: playerReducer,
    network: networkReducer,
    offline: offlineReducer,
    [likedSongsApi.reducerPath]: likedSongsApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(likedSongsApi.middleware),
});
