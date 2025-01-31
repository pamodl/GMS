import { createAsyncThunk } from '@reduxjs/toolkit';

export const checkIn = createAsyncThunk(
  'checkin/checkIn', 
  async (userId, { getState, rejectWithValue }) => {
    try {
      const { checkin } = getState();
      if (checkin.isCheckedIn) {
        return rejectWithValue('You are already checked in');
      }

      const response = await fetch('/Back/checkinout/checkin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to check in');
      }

      const data = await response.json();
      return { success: true, timestamp: data.timestamp };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const checkOut = createAsyncThunk(
  'checkin/checkOut', 
  async (userId, { getState, rejectWithValue }) => {
    try {
      const { checkin } = getState();
      if (!checkin.isCheckedIn) {
        return rejectWithValue('You are not checked in');
      }

      const response = await fetch('/Back/checkinout/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(errorData || 'Failed to check out');
      }

      const data = await response.json();
      return { success: true, timestamp: data.timestamp };
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);