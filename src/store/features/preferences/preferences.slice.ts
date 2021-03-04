import { createSlice } from '@reduxjs/toolkit';
import { preferencesInitState, PreferencesState } from './preferences-state';
import {
  SetPluginsAction,
  SetPreferencesStateAction,
  TogglePluginAction,
  UpdatePluginsAction,
} from './preferences.actions';

export const preferencesSlice = createSlice({
  name: 'preferences',
  initialState: preferencesInitState,
  reducers: {
    updateCategory(state, { payload: { category } }: UpdatePluginsAction) {
      // eslint-disable-next-line no-self-assign
      state.plugins[category] = { ...state.plugins[category] };
    },
    setPlugins(state, { payload: { category, plugins } }: SetPluginsAction) {
      state.plugins[category] = plugins;
    },
    togglePlugin(state, { payload: { name, category } }: TogglePluginAction) {
      const plugin = state.plugins[category][name];
      plugin.enabled = !plugin.enabled;
    },
    setState(state, { payload: { newState } }: SetPreferencesStateAction) {
      Object.keys(state).forEach((key) => {
        state[key as keyof PreferencesState] =
          newState[key as keyof PreferencesState];
      });
    },
  },
});

export const setPluginsAction = preferencesSlice.actions.setPlugins;
export const setPreferencesStateAction = preferencesSlice.actions.setState;
export const togglePluginAction = preferencesSlice.actions.togglePlugin;
export const updateCategoryAction = preferencesSlice.actions.updateCategory;
