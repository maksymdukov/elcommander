import path from 'path';
import { remote } from 'electron';
import { Npm } from './npm';
import { CONFIG } from '../../config/config';
import { PluginCategories } from '../plugin-categories.type';
import { InstalledPackages } from './npm.types';

const PLUGINS_PATH = path.join(
  remote.app.getPath('userData'),
  CONFIG.appDirsPrefix + CONFIG.pluginDirname
);

export class PluginManager {
  npm = new Npm(PLUGINS_PATH);

  constructor(private category: PluginCategories) {}

  async add(name: string) {
    return this.npm.install(name);
  }

  async remove(name: string) {
    return this.npm.uninstall(name);
  }

  async list() {
    const localPlugins = await this.npm.list();
    if (this.category === 'fs') {
      // filter plugins by category
    }
    return localPlugins;
  }

  async searchAll() {
    return this.npm.search('cra-template-*');
  }

  async search() {
    // get local plugins list
    const localCategorizedPlugins = await this.list();

    // find plugins based on category
    // if (category === 'fs') {}
    const foundPlugins = await this.npm.search('cra-template-*');

    // filter out existing plugins
    return foundPlugins.filter((found) => !localCategorizedPlugins[found.name]);
  }

  async update(name: string) {
    return this.npm.update(name);
  }

  async getOutdatedPackages() {
    const localList = await this.list();
    const allFound = await this.searchAll();
    return Object.values(localList).reduce((acc, localPackage) => {
      if (
        allFound.find(
          (found) =>
            found.name === localPackage.name &&
            found.version !== localPackage.version
        )
      ) {
        acc[localPackage.name] = localPackage;
      }
      return acc;
    }, {} as InstalledPackages);
  }

  abortAll() {
    this.npm.abortAll();
  }
}

// const pluginManager = new PluginManager();
// pluginManager.list('fs').then(console.log).catch(console.log);
// pluginManager.add('semver').then(console.log).catch(console.log);
// pluginManager.search('fs').then(console.log).catch(console.log);
