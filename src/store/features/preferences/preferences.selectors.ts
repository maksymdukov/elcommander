import { createSelector } from '@reduxjs/toolkit';
import { PluginCategories } from 'elcommander-plugin-sdk';
import { RootState } from '../../root-types';

export const getPreferences = (state: RootState) => state.preferences;

export const getPluginsState = (state: RootState) => state.preferences.plugins;

export const getPluginsByCategory = createSelector(
  [getPluginsState, (_: RootState, category: PluginCategories) => category],
  (state, category) => state[category]
);
