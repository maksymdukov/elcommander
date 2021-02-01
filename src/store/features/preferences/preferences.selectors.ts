import { RootState } from '../../root-types';
import { createSelector } from '@reduxjs/toolkit';
import { PluginCategories } from '../../../plugins/plugin-categories.type';

export const getPreferences = (state: RootState) => state.preferences;

export const getPluginsState = (state: RootState) => state.preferences.plugins;

export const getPluginsByCategory = createSelector(
  [getPluginsState, (_: RootState, category: PluginCategories) => category],
  (state, category) => state[category]
);
