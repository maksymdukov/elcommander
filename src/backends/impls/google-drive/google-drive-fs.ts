import * as Comlink from 'comlink';
import { shell, remote } from 'electron';
import { Remote } from 'comlink';
// @ts-ignore
import GDWorker from './google-drive.worker';
import type { GoogleDriveWorker } from './google-drive.worker';
import { FSBackendThreaded } from '../../abstracts/fs-backend-threaded.abstract';
import { IFSConstructorProps } from '../../abstracts/fs-backend.abstract';
import { GoogleDrivePersistence } from './google-drive-persistence';
import { WorkerWatcher } from '../../abstracts/fs-worker.abstract';
import { TreeNode } from '../../../interfaces/node.interface';
import { UserCancelError } from '../../../error/fs-plugin/user-cancel.error';
import { createPromise } from '../../../utils/leaked-promise';
import { GoogleAuth } from './google-auth';

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
    domContainer,
  }: IFSConstructorProps<GoogleDrivePersistence>) {
    const GDWorkerClass = Comlink.wrap(new GDWorker()) as Remote<
      typeof GoogleDriveWorker
    >;

    const workerInstance = await new GDWorkerClass();
    return new GoogleDriveFs({
      domContainer,
      viewId,
      workerInstance,
      configName,
      persistence,
    });
  }

  cancelInit = createPromise<void, UserCancelError>();

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

  cancelInitialization() {
    this.cancelInit.reject(new UserCancelError());
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
    const workerAuth = ((await this.worker.auth) as unknown) as Remote<
      GoogleAuth
    >;

    if (this.configName) {
      const userConfig = await this.persistence.readConfig(this.configName);
      try {
        await workerAuth.setCredentialsAndVerify(
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
      // Promise.race();
      const { response } = await remote.dialog.showMessageBox({
        type: 'question',
        buttons: ['Ok', 'Cancel'],
        message: 'Now you will be redirected to the Google Login page',
      });
      // Cancel button
      if (response === 1) {
        throw new UserCancelError();
      }
      const url = await workerAuth.getAuthUrl();
      if (!url) {
        throw new Error('Google auth url is empty');
      }
      await shell.openExternal(url);
      const authData = await workerAuth.authenticate();
      await this.persistence.writeConfig(authData.email, authData);
      this.configName = authData.email;
    }
  }
}
