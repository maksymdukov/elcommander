import * as Comlink from 'comlink';
// eslint-disable-next-line import/no-webpack-loader-syntax
import GDWorker from 'worker-loader!./google-drive.worker';
import { shell } from 'electron';
import { FSBackend } from '../abstracts/fs-backend.abstract';
import { FSEventEmitter } from '../classes/fs-event-emitter';
import { IFSRawNode } from '../interfaces/fs-raw-node.interface';
import type { GoogleDrive } from './google-drive.worker';
import { TreeNode } from '../../interfaces/node.interface';

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

  get options(): { spinner?: boolean } {
    return { spinner: true };
  }

  static async createInstance({ viewId }: { viewId: string }) {
    const GDWorkerClass = (Comlink.wrap(
      new GDWorker()
    ) as unknown) as typeof GoogleDrive;

    const workerClassInst = await new GDWorkerClass();
    const instance = new GoogleDriveFs({ viewId, workerClassInst });
    await instance.onInit();
    return instance;
  }

  async readDir(
    node: TreeNode | undefined,
    path: string,
    enterStack: TreeNode[] | undefined
  ): Promise<IFSRawNode[]> {
    return this.googleDriveWorker.readDir(node, path, enterStack);
  }

  readWatchDir(
    node: TreeNode | undefined,
    path: string,
    enterStack: TreeNode[] | undefined
  ): FSEventEmitter {
    const emitter = new FSEventEmitter();
    (async () => {
      try {
        const nodes = await this.readDir(node, path, enterStack);
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
    if (false) {
      // await this.googleDriveWorker.setCredentials();
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
