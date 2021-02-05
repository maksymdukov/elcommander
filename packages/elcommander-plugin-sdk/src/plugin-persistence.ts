import fs from 'fs';
import path from 'path';
import { CONFIG } from './config/config';
import { readAllFilesInDir } from './utils/fs/read-all-dir';
import { ExtractPromiseArray } from './utils/types/extract';
import { IFSPlugin } from './fs/fs-plugin.abstract';
import { PluginCategories } from './plugin-categories.type';

const { remote } = require('electron');

export type PluginClass = IFSPlugin;

export interface IUserPluginConfig {
  name: string;
}

export type SavedConfigFile = ExtractPromiseArray<
  ReturnType<typeof readAllFilesInDir>
>;

export class PluginPersistence {
  static getPluginDirPath(category: PluginCategories, dirName: string) {
    return path.join(
      remote.app.getPath('userData'),
      CONFIG.appDirsPrefix + CONFIG.pluginConfigDirName,
      category,
      dirName
    );
  }

  static async readPluginConfigs(Plugin: PluginClass) {
    if (!Plugin.Persistence.isPersistent) {
      return [];
    }
    // read all files in plugin config dir
    const pluginDir = this.getPluginDirPath(
      Plugin.Persistence.category,
      Plugin.Persistence.dirName
    );

    // create if not exist
    await fs.promises.mkdir(pluginDir, { recursive: true });

    try {
      // yield execution to Plugin
      const configFiles = await readAllFilesInDir(pluginDir);
      const configs = await Plugin.Persistence.parseSavedConfigFiles(
        configFiles
      );
      // yield execution to Plugin
      return Plugin.Persistence.getUserSavedConfigs(configs);
    } catch (e) {
      return [];
    }
  }

  pluginDir: string;

  constructor(private category: PluginCategories, private dirName: string) {
    this.pluginDir = PluginPersistence.getPluginDirPath(
      this.category,
      this.dirName
    );
  }

  private getConfigPath(name: string) {
    return path.join(this.pluginDir, name);
  }

  async readConfig(name: string): Promise<SavedConfigFile> {
    const content = await fs.promises.readFile(this.getConfigPath(name), {
      encoding: 'utf8',
    });
    return {
      name,
      content,
    };
  }

  async writeConfig(name: string, content: string) {
    return fs.promises.writeFile(this.getConfigPath(name), content, {
      encoding: 'utf8',
    });
  }

  async deleteConfig(name: string) {
    return fs.promises.unlink(name);
  }
}
