import {
  IUserPluginConfig,
  PluginCategories,
  PluginPersistence,
  SavedConfigFile,
} from '../../plugin-persistence';

export type ConfigShape<T = any> = {
  name: string;
  config: T;
};

export class FSPersistence {
  static readonly isPersistent: boolean = false;

  static readonly category: PluginCategories = 'fs';

  // override in derived class
  static readonly dirName: string = 'abc_name';

  static parseSavedConfigFile(file: SavedConfigFile): ConfigShape {
    return {
      name: file.name,
      config: JSON.parse(file.content),
    };
  }

  static async parseSavedConfigFiles(
    files: SavedConfigFile[]
  ): Promise<ConfigShape[]> {
    return files.map(this.parseSavedConfigFile);
  }

  static async getUserSavedConfigs(
    configs: ConfigShape[]
  ): Promise<IUserPluginConfig[]> {
    return configs;
  }

  constructor(public pluginPersistence: PluginPersistence) {}
}
