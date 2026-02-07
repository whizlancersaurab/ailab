import { configureStore } from '@reduxjs/toolkit';
import themeSettingSlice from './themeSettingSlice';
import sidebarSlice from './sidebarSlice';
import authSlice from './authSlice'


const store = configureStore({
  reducer: {
    themeSetting: themeSettingSlice,
    sidebarSlice: sidebarSlice,
    authSlice: authSlice
  },
});

export type RootState  = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store;
