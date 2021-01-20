import * as Comlink from 'comlink';
// @ts-ignore
import LocalWorker from 'backends/impls/local-fs/local-fs.worker';
import { IFSConstructorProps } from '../../abstracts/fs-backend.abstract';
import type { LocalFSWorker } from './local-fs.worker';
import { FSBackendThreaded } from '../../abstracts/fs-backend-threaded.abstract';
import { FsPlugin } from '../../abstracts/fs-plugin.abstract';
import { FSPersistence } from '../../classes/fs-persistence';

export class LocalFs extends FsPlugin<FSBackendThreaded<LocalFSWorker>> {
  static FS = FSBackendThreaded;

  static Persistence = FSPersistence;

  static async createInstance({
    viewId,
    configName,
    persistence,
    domContainer,
  }: IFSConstructorProps): Promise<LocalFs> {
    const LocalFSWorkerClass = Comlink.wrap(
      new LocalWorker()
    ) as Comlink.Remote<typeof LocalFSWorker>;
    const workerInstance = await new LocalFSWorkerClass();
    const fs = new FSBackendThreaded({ workerInstance });
    return new LocalFs({
      viewId,
      fs,
      configName,
      persistence,
      domContainer,
    });
  }
}
