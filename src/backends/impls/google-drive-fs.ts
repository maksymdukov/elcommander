import * as Comlink from 'comlink';
// eslint-disable-next-line import/no-webpack-loader-syntax
import GDWorker from 'worker-loader!./google-drive.worker';
import { shell } from 'electron';
import { FSBackend, ReadWatchDirProps } from '../abstracts/fs-backend.abstract';
import { FSEventEmitter } from '../classes/fs-event-emitter';
import { IFSRawNode } from '../interfaces/fs-raw-node.interface';
import type { GoogleDrive } from './google-drive.worker';

interface GoogleDriveFsProps {
  viewId: string;
  workerClassInst: GoogleDrive;
}

export class GoogleDriveFs extends FSBackend {
  private googleDriveWorker: GoogleDrive;

  constructor({ viewId, workerClassInst }: GoogleDriveFsProps) {
    super({ viewId });
    this.googleDriveWorker = workerClassInst;
  }

  static get options() {
    return { tabSpinner: true };
  }

  get options() {
    return {
      pathSpinner: true,
      treeSpinner: true,
    };
  }

  static async createInstance({ viewId }: { viewId: string }) {
    const GDWorkerClass = (Comlink.wrap(
      new GDWorker()
    ) as unknown) as typeof GoogleDrive;

    const workerClassInst = await new GDWorkerClass();
    return new GoogleDriveFs({ viewId, workerClassInst });
  }

  async readDir(props: ReadWatchDirProps): Promise<IFSRawNode[]> {
    return this.googleDriveWorker.readDir(props);
  }

  readWatchDir(props: ReadWatchDirProps): FSEventEmitter {
    const emitter = new FSEventEmitter();
    (async () => {
      try {
        const nodes = await this.readDir(props);
        emitter.emit('dirRead', nodes);
      } catch (e) {
        emitter.emit('error', e);
      }
    })();
    return emitter;
  }

  async onInit(): Promise<any> {
    // if google refresh token exists
    // take that from the fs
    if (true) {
      await this.googleDriveWorker.setCredentials(
        process.env.DEV_REFRESH_TOKEN!
      );
    } else {
      // full auth flow
      const url = await this.googleDriveWorker.getAuthUrl();
      if (!url) {
        throw new Error('Google auth url is empty');
      }
      await shell.openExternal(url);
      await this.googleDriveWorker.authenticate();
    }
  }

  async onDestroy(): Promise<void> {}

  unwatchDir() {}

  unwatchAllDir() {}
}
