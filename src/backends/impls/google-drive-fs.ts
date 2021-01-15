import * as Comlink from 'comlink';
import GDWorker from 'backends/impls/google-drive.worker';
import { shell } from 'electron';
import { Remote } from 'comlink';
import type { GoogleDriveWorker } from './google-drive.worker';
import { FSBackendThreaded } from '../abstracts/fs-backend-threaded.abstract';

export class GoogleDriveFs extends FSBackendThreaded<GoogleDriveWorker> {
  static get tabOptions() {
    return { tabSpinner: true };
  }

  get options() {
    return {
      pathSpinner: true,
      treeSpinner: true,
    };
  }

  static async createInstance({ viewId }: { viewId: string }) {
    const GDWorkerClass = Comlink.wrap(new GDWorker()) as Remote<
      typeof GoogleDriveWorker
    >;

    const workerInstance = await new GDWorkerClass();
    return new GoogleDriveFs({ viewId, workerInstance });
  }

  async onInit(): Promise<any> {
    // if google refresh token exists
    // take that from the fs
    if (true) {
      await this.worker.setCredentials(process.env.DEV_REFRESH_TOKEN!);
    } else {
      // full auth flow
      const url = await this.worker.getAuthUrl();
      if (!url) {
        throw new Error('Google auth url is empty');
      }
      await shell.openExternal(url);
      await this.worker.authenticate();
    }
  }
}
