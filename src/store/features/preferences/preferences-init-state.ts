import { PluginCategories } from '../../../plugins/plugin-categories.type';

export type PluginState = {
  [k: string]: {
    name: string;
    version: string;
    path: string;
    enabled: boolean;
  };
};

export interface PreferencesInitState {
  plugins: Record<PluginCategories, PluginState>;
}

export const preferencesInitState: PreferencesInitState = {
  plugins: {
    fs: {},
  },
};
