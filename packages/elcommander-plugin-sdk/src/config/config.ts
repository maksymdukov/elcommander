import path from 'path';

export const CONFIG: Readonly<{ [k: string]: string }> = {
  appDirsPrefix: 'EL',
  pluginDirname: 'Plugins',
  pluginConfigDirName: 'PluginConfig',
  fsPluginDirName: 'fs',
  nodeModulesPath: path.join(__dirname, 'node_modules'),
};
