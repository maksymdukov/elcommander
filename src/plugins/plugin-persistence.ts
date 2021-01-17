import fs from 'fs';
import path from 'path';
import { remote } from 'electron';
import { FSBackend } from '../backends/abstracts/fs-backend.abstract';
import { CONFIG } from '../config/config';
import { readAllFilesInDir } from '../utils/fs/read-all-dir';
import { ExtractPromiseArray } from '../utils/types/extract';

export type PluginCategories = 'fs';

export type PluginClass = typeof FSBackend;

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

  async readConfig(name: string): Promise<SavedConfigFile> {
    const content = await fs.promises.readFile(
      path.join(this.pluginDir, name),
      {
        encoding: 'utf8',
      }
    );
    return {
      name,
      content,
    };
  }

  async writeConfig(name: string, content: string) {
    console.log('write config name', name);
    console.log('write config content', content);
    console.log('path', path.join(this.pluginDir, name));
    const result = await fs.promises.writeFile(
      path.join(this.pluginDir, name),
      content,
      {
        encoding: 'utf8',
      }
    );
    return result;
  }

  async deleteConfig(name: string) {
    return fs.promises.unlink(name);
  }
}
