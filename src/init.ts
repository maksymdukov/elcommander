import fs from 'fs';
import path from 'path';
import { app } from 'electron';
import { CONFIG } from './config/config';

export const init = async () => {
  // create app-specific directories
  const userDataDir = app.getPath('userData');

  const promises = [CONFIG.pluginConfigDirName].map((name) => {
    const pluginRootDir = path.join(userDataDir, CONFIG.appDirsPrefix + name);
    return [CONFIG.fsPluginDirName].map((pluginCategory) => {
      const dir = path.join(pluginRootDir, pluginCategory);
      return fs.promises.mkdir(dir, { recursive: true });
    });
  });
  const concatenated = ([] as Promise<string>[]).concat(...promises);
  try {
    await Promise.allSettled(concatenated);
  } catch (e) {
    console.log('[Error creating apps folders] - ', e);
  }
};
