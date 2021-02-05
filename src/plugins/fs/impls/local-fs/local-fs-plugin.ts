import * as Comlink from 'comlink';
// @ts-ignore
import LocalWorker from 'plugins/fs/impls/local-fs/local-fs.worker';
import {
  FSBackendThreaded,
  FSPersistence,
  FsPlugin,
  IFSConstructorProps,
  WorkerThread,
} from 'elcommander-plugin-sdk';
import HardDriveIcon from 'components/icons/hard-drive-icon';
import type { LocalFSWorker } from './local-fs.worker';

export class LocalFsPlugin extends FsPlugin<FSBackendThreaded<LocalFSWorker>> {
  static FS = FSBackendThreaded;

  static Persistence = FSPersistence;

  static get pluginOptions() {
    return {
      pluginName: 'Local',
      icon: HardDriveIcon,
    };
  }

  static async createInstance({
    viewId,
    configName,
    persistence,
    domContainer,
  }: IFSConstructorProps): Promise<LocalFsPlugin> {
    const LocalFSWorkerClass = WorkerThread.proxify(
      new LocalWorker()
    ) as Comlink.Remote<typeof LocalFSWorker>;

    const workerInstance = await new LocalFSWorkerClass();
    const fs = new FSBackendThreaded({ workerInstance });
    return new LocalFsPlugin({
      viewId,
      fs,
      configName,
      persistence,
      domContainer,
    });
  }
}
