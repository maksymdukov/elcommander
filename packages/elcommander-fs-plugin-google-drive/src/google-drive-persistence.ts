import {
  ConfigShape,
  FSPersistence,
  IUserPluginConfig,
  SavedConfigFile,
} from 'elcommander-plugin-sdk';

export interface GoogleDriveConfigShape {
  email: string;
  refresh_token: string;
  access_token: string;
}

export class GoogleDrivePersistence extends FSPersistence {
  static readonly isPersistent = true;

  static readonly category = 'fs';

  static readonly dirName = 'google_drive';

  static async parseSavedConfigFiles(files: SavedConfigFile[]) {
    return FSPersistence.parseSavedConfigFiles(files) as Promise<
      ConfigShape<GoogleDriveConfigShape>[]
    >;
  }

  static parseSavedConfigFile(
    file: SavedConfigFile
  ): ConfigShape<GoogleDriveConfigShape> {
    return FSPersistence.parseSavedConfigFile(file);
  }

  static async getUserSavedConfigs(
    configs: ConfigShape<GoogleDriveConfigShape>[]
  ): Promise<IUserPluginConfig[]> {
    return configs;
  }

  async writeConfig(email: string, data: GoogleDriveConfigShape) {
    return this.pluginPersistence.writeConfig(email, JSON.stringify(data));
  }

  async readConfig(email: string) {
    const configFile = await this.pluginPersistence.readConfig(email);
    return GoogleDrivePersistence.parseSavedConfigFile(configFile);
  }

  async deleteConfig(name: string) {
    return this.pluginPersistence.deleteConfig(name);
  }
}
