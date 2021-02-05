import { PluginCategories } from 'elcommander-plugin-sdk';

export type PluginState = {
  [k: string]: {
    name: string;
    version: string;
    path: string;
    enabled: boolean;
  };
};

export interface PreferencesState {
  plugins: Record<PluginCategories, PluginState>;
}

export const preferencesInitState: PreferencesState = {
  plugins: {
    fs: {},
  },
};
