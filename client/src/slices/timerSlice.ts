import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

interface TimerState {
  duration: number; // total duration of current question
  remaining: number; // remaining time
  isActive: boolean;
}

const initialState: TimerState = {
  duration: 0,
  remaining: 0,
  isActive: false,
};

export const timerSlice = createSlice({
  name: "timer",
  initialState,
  reducers: {
    startTimer: (state, action: PayloadAction<number>) => {
      state.duration = action.payload;
      state.remaining = action.payload;
      state.isActive = true;
    },
    tick: (state) => {
      if (state.remaining > 0) state.remaining -= 1;
      else state.isActive = false;
    },
    resetTimer: (state) => {
      state.duration = 0;
      state.remaining = 0;
      state.isActive = false;
    },
    stopTimer: (state) => {
      state.isActive = false;
    },
  },
});

export const { startTimer, tick, resetTimer, stopTimer } = timerSlice.actions;
export default timerSlice.reducer;
