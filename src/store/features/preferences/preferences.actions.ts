import { PayloadAction } from '@reduxjs/toolkit';
import { InstalledPackages } from 'plugins/manager/npm.types';
import { PluginCategories } from 'elcommander-plugin-sdk';
import { PluginState, PreferencesState } from './preferences-state';
import { AppThunk } from '../../store';
import { setPluginsAction } from './preferences.slice';
import { getPluginsByCategory } from './preferences.selectors';

export type SetPluginsAction = PayloadAction<{
  category: PluginCategories;
  plugins: PluginState;
}>;

export type TogglePluginAction = PayloadAction<{
  name: string;
  category: PluginCategories;
}>;

export type SetPreferencesStateAction = PayloadAction<{
  newState: PreferencesState;
}>;

export const setPluginsThunk = (
  category: PluginCategories,
  packages: InstalledPackages
): AppThunk => (dispatch, getState) => {
  const state = getState();
  const currentPlugins = getPluginsByCategory(state, category);

  const plugins = Object.values(packages).reduce((acc, pckg) => {
    acc[pckg.name] = {
      name: pckg.name,
      path: pckg.path,
      version: pckg.version,
      enabled: currentPlugins[pckg.name]
        ? currentPlugins[pckg.name].enabled
        : false, // false if it's a newly added plugin
    };
    return acc;
  }, {} as PluginState);

  dispatch(
    setPluginsAction({
      category,
      plugins,
    })
  );
};
