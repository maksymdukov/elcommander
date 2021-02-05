import React, { SVGProps } from 'react';
import { FsPlugin, IFSPlugin, PluginCategories } from 'elcommander-plugin-sdk';
// import getGoogleDrivePlugin from 'elcommander-fs-plugin-google-drive';
import { LocalFsPlugin } from './fs/impls/local-fs/local-fs-plugin';
import { PluginState } from '../store/features/preferences/preferences-state';
import '../utils/electron/shared_modules_path';

export interface IFSPluginDescriptor {
  id: string;
  name: string;
  klass: IFSPlugin;
  order: number;
  icon?: React.FC<SVGProps<SVGSVGElement>>;
}

export interface IFSPluginMap {
  [k: string]: IFSPluginDescriptor;
}

type PluginsMap = Record<PluginCategories, IFSPluginMap>;

const defaultPlugins: IFSPluginMap = {
  LocalFS: {
    id: 'LocalFS',
    name: 'Local',
    klass: LocalFsPlugin,
    order: 1,
  },
  // GoogleDrive: {
  //   id: 'GoogleDrive',
  //   name: 'Google Drive',
  //   klass: getGoogleDrivePlugin(),
  //   order: 2,
  // },
};

export const FSPluginsMap: {
  plugins: PluginsMap;
  setPlugins(pluginsMap: PluginsMap): void;
} = {
  plugins: {
    fs: defaultPlugins,
  },
  setPlugins(pluginsMap: PluginsMap) {
    this.plugins = pluginsMap;
  },
};

export const getFSPluginsMap = async () => {
  return FSPluginsMap.plugins.fs;
};

export const setFSPlugins = async (plugins: PluginState) => {
  const map = { ...defaultPlugins };
  Object.values(plugins).forEach((plugin) => {
    try {
      // eslint-disable-next-line global-require,import/no-dynamic-require
      const getPluginKlass = global.require(`${plugin.path}/dist/index.js`);
      const pluginKlass = getPluginKlass() as typeof FsPlugin;
      map[plugin.name] = {
        klass: pluginKlass,
        name: pluginKlass.pluginOptions.pluginName,
        id: plugin.name,
        order: 99,
        icon: pluginKlass.pluginOptions.icon,
      };
    } catch (e) {
      console.error(`Error loading plugin "${plugin.name}"`);
    }
  });
  FSPluginsMap.setPlugins({
    fs: map,
  });
};
