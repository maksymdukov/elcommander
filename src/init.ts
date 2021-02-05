import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { CONFIG } from '../packages/elcommander-plugin-sdk/src/config/config';

export const init = async () => {
  // create app-specific directories
  const userDataDir = app.getPath('userData');

  // plugin config dirs
  const promises = [CONFIG.pluginConfigDirName].map((name) => {
    const pluginRootDir = path.join(userDataDir, CONFIG.appDirsPrefix + name);
    return [CONFIG.fsPluginDirName].map((pluginCategory) => {
      const dir = path.join(pluginRootDir, pluginCategory);
      return fs.promises.mkdir(dir, { recursive: true });
    });
  });

  // plugin source dir with user-installed plugins /ElPlugins
  const pluginSourceDir = path.join(
    userDataDir,
    CONFIG.appDirsPrefix + CONFIG.pluginDirname
  );
  const pluginSourcePromise = fs.promises.mkdir(pluginSourceDir, {
    recursive: true,
  });
  // plugin source code dir
  const concatenated = ([] as Promise<string>[]).concat(
    ...promises,
    pluginSourcePromise
  );
  try {
    await Promise.allSettled(concatenated);
  } catch (e) {
    console.log('[Error creating apps folders] - ', e);
  }
};
