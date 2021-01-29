import path from 'path';
import { remote } from 'electron';
import { Npm } from './npm';
import { CONFIG } from '../../config/config';
import { PluginCategories } from '../plugin-categories.type';

const PLUGINS_PATH = path.join(
  remote.app.getPath('userData'),
  CONFIG.appDirsPrefix + CONFIG.pluginDirname
);

export class PluginManager {
  npm = new Npm(PLUGINS_PATH);

  async add(name: string) {
    return this.npm.install(name);
  }

  async remove(name: string) {
    return this.npm.uninstall(name);
  }

  async list(category: PluginCategories) {
    const localPlugins = await this.npm.list();
    if (category === 'fs') {
      // filter plugins by category
    }
    return localPlugins;
  }

  async search(category: PluginCategories) {
    // get local plugins list
    const localCategorizedPlugins = await this.list(category);

    // find plugins based on category
    // if (category === 'fs') {}
    const foundPlugins = await this.npm.search('cra-template-*');

    // filter out existing plugins
    return foundPlugins.filter((found) => !localCategorizedPlugins[found.name]);
  }

  async update(name: string) {
    return this.npm.update(name);
  }
}

// const pluginManager = new PluginManager();
// pluginManager.list('fs').then(console.log).catch(console.log);
// pluginManager.add('semver').then(console.log).catch(console.log);
// pluginManager.search('fs').then(console.log).catch(console.log);
