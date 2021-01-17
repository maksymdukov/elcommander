import * as Comlink from 'comlink';
import LocalWorker from 'backends/impls/local-fs/local-fs.worker';
import type { FSWatcher } from 'chokidar';
import { IFSConstructorProps } from '../../abstracts/fs-backend.abstract';
import type { LocalFSWorker } from './local-fs.worker';
import { FSBackendThreaded } from '../../abstracts/fs-backend-threaded.abstract';

// @ts-ignore
export class LocalFs extends FSBackendThreaded<LocalFSWorker, FSWatcher> {
  static get tabOptions() {
    return {
      tabSpinner: false,
    };
  }

  get options() {
    return {
      pathSpinner: false,
      treeSpinner: false,
    };
  }

  static async createInstance({
    viewId,
    configName,
    persistence,
  }: IFSConstructorProps) {
    const LocalFSWorkerClass = Comlink.wrap(
      new LocalWorker()
    ) as Comlink.Remote<typeof LocalFSWorker>;
    const workerInstance = await new LocalFSWorkerClass();
    return new LocalFs({ viewId, workerInstance, configName, persistence });
  }
}
