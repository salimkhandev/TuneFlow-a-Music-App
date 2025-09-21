import { configureStore } from "@reduxjs/toolkit";
import playerReducer from "../slices/playerSlice";
import networkReducer from "../slices/networkSlice";

export const store = configureStore({
  reducer: {
    player: playerReducer,
    network: networkReducer,
  },
});
