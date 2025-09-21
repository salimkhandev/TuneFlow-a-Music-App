import { createSlice } from '@reduxjs/toolkit';

const initialState = {
    netAvail: true, // Assume online by default
    value: true,
    isInitialized: false, // Track if network detection has run at least once
};

const networkSlice = createSlice({
    name: 'network',
    initialState,
    reducers: {
        setNetAvail: (state, action) => {
            state.netAvail = action.payload;
            state.isInitialized = true;
        },
        setValue: (state, action) => {
            state.value = action.payload;
        },
    },
});

export const { setNetAvail, setValue } = networkSlice.actions;
export default networkSlice.reducer;