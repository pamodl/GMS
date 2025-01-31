import { combineReducers, configureStore } from '@reduxjs/toolkit';
import userReducer from './user/userSlice';
import { persistReducer, persistStore } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import checkinReducer from './checkin/checkinSlice';

const rootReducer = combineReducers({
  user: userReducer,
  checkin: checkinReducer,
});

const persistConfig = {
  key: 'root',
  storage,
  version: 1,
  whitelist: ['user', 'checkin'], // Persist both user and checkin states
  blacklist: [], // Add any reducer you don't want to persist
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export const persistor = persistStore(store);

// Debug helper
if (process.env.NODE_ENV === 'development') {
  store.subscribe(() => {
    console.log('Current State:', store.getState());
  });
}

export default store;