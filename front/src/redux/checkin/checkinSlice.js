import { createSlice } from '@reduxjs/toolkit';
import { checkIn, checkOut } from './checkinActions';

const checkinSlice = createSlice({
  name: 'checkin',
  initialState: {
    isCheckedIn: false,
    lastCheckIn: null,
    lastCheckOut: null,
    loading: false,
    error: null,
  },
  reducers: {
    resetState: (state) => {
      state.isCheckedIn = false;
      state.lastCheckIn = null;
      state.lastCheckOut = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Check-in cases
      .addCase(checkIn.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkIn.fulfilled, (state, action) => {
        if (action.payload && action.payload.success) {
          state.isCheckedIn = true;
          state.lastCheckIn = action.payload.timestamp || new Date().toISOString();
          state.error = null;
        }
        state.loading = false;
      })
      .addCase(checkIn.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.isCheckedIn = false;
      })
      // Check-out cases
      .addCase(checkOut.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(checkOut.fulfilled, (state, action) => {
        if (action.payload && action.payload.success) {
          state.isCheckedIn = false;
          state.lastCheckOut = action.payload.timestamp || new Date().toISOString();
          state.error = null;
        }
        state.loading = false;
      })
      .addCase(checkOut.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { resetState } = checkinSlice.actions;
export default checkinSlice.reducer;