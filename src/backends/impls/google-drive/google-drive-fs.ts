import * as Comlink from 'comlink';
import { shell } from 'electron';
import { Remote } from 'comlink';
// @ts-ignore
import GDWorker from './google-drive.worker';
import type { GoogleDriveWorker } from './google-drive.worker';
import { FSBackendThreaded } from '../../abstracts/fs-backend-threaded.abstract';
import { IFSConstructorProps } from '../../abstracts/fs-backend.abstract';
import { GoogleDrivePersistence } from './google-drive-persistence';
import { WorkerWatcher } from '../../abstracts/fs-worker.abstract';
import { TreeNode } from '../../../interfaces/node.interface';

export class GoogleDriveFs extends FSBackendThreaded<
  GoogleDriveWorker,
  WorkerWatcher,
  GoogleDrivePersistence
> {
  static get tabOptions() {
    return { tabSpinner: true };
  }

  static Persistence = GoogleDrivePersistence;

  static async createInstance({
    viewId,
    configName,
    persistence,
  }: IFSConstructorProps<GoogleDrivePersistence>) {
    const GDWorkerClass = Comlink.wrap(new GDWorker()) as Remote<
      typeof GoogleDriveWorker
    >;

    const workerInstance = await new GDWorkerClass();
    return new GoogleDriveFs({
      viewId,
      workerInstance,
      configName,
      persistence,
    });
  }

  static getStartNode() {
    return {
      id: 'root',
      name: 'root',
      path: '/',
      meta: {
        parents: ['root'],
      },
    };
  }

  getParentNode(node: TreeNode): TreeNode {
    return {
      ...node,
      meta: {
        ...node.meta,
        parents: node.meta.parents.slice(0, node.meta.parents.length - 1),
      },
    };
  }

  get options() {
    return {
      pathSpinner: true,
      treeSpinner: true,
    };
  }

  async onInit(): Promise<void> {
    // if there's a config this.configName
    // read it.
    // verify it
    // setCredentials
    // try to get access token

    // otherwise
    // start auth process
    // write creds to the fs
    // let react change config name;

    if (this.configName) {
      const userConfig = await this.persistence.readConfig(this.configName);
      try {
        await this.worker.setCredentialsAndVerify(
          userConfig.config.refresh_token
        );
      } catch (e) {
        // delete config file
        await this.persistence.deleteConfig(userConfig.name);
        this.configName = '';
        // rethrow
        throw e;
      }
    } else {
      // full auth flow
      const url = await this.worker.getAuthUrl();
      if (!url) {
        throw new Error('Google auth url is empty');
      }
      await shell.openExternal(url);
      const authData = await this.worker.authenticate();
      await this.persistence.writeConfig(authData.email, authData);
      this.configName = authData.email;
    }
  }
}
