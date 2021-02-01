import { createSlice } from '@reduxjs/toolkit';
import { preferencesInitState } from './preferences-init-state';
import { SetPluginsAction, TogglePluginAction } from './preferences.actions';

export const preferencesSlice = createSlice({
  name: 'preferences',
  initialState: preferencesInitState,
  reducers: {
    setPlugins(state, { payload: { category, plugins } }: SetPluginsAction) {
      state.plugins[category] = plugins;
    },
    togglePlugin(state, { payload: { name, category } }: TogglePluginAction) {
      const plugin = state.plugins[category][name];
      plugin.enabled = !plugin.enabled;
    },
  },
});

export const setPluginsAction = preferencesSlice.actions.setPlugins;
export const togglePluginAction = preferencesSlice.actions.togglePlugin;
