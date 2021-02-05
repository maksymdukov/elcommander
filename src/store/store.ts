import { Action, configureStore } from '@reduxjs/toolkit';
import thunk, { ThunkAction } from 'redux-thunk';
import logger from 'redux-logger';
import { enableMapSet } from 'immer';
import { ipcRenderer } from 'electron';
import { rootReducer } from './root-reducer';
import { RootState } from './root-types';
import { setPreferencesStateAction } from './features/preferences/preferences.slice';
import { setFSPlugins } from '../plugins/plugin-map';

enableMapSet();

const store = configureStore({
  devTools: process.env.NODE_ENV !== 'production',
  reducer: rootReducer,
  middleware: [thunk, logger],
});

ipcRenderer.on('preferencesUpdate', async (_, updatedState: RootState) => {
  await setFSPlugins(updatedState.preferences.plugins.fs);
  store.dispatch(
    setPreferencesStateAction({ newState: updatedState.preferences })
  );
});

// if (process.env.NODE_ENV === 'development' && module.hot) {
//   module.hot.accept('./rootReducer', () => {
//     const newRootReducer = require('./rootReducer').default;
//     store.replaceReducer(newRootReducer);
//   });
// }

export type AppDispatch = typeof store.dispatch;

export type AppThunk = ThunkAction<void, RootState, unknown, Action<string>>;

export default store;
