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
import { runCancelableGenerator } from '../../../utils/generators';

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
      initCancellable: true,
    };
  }

  async cancelInitialization() {
    this.cancelInit.resolve();
    const auth = await this.worker.auth;
    await auth.cancel();
  }

  *authFlow() {
    // if there's a config this.configName
    // read it.
    // verify it
    // setCredentials
    // try to get access token

    // otherwise
    // start auth process
    // write creds to the fs
    // let react change config name;
    const workerAuth = ((yield this.worker.auth) as unknown) as Remote<
      GoogleAuth
    >;
    if (this.configName) {
      const userConfig = yield this.persistence.readConfig(this.configName);
      try {
        yield workerAuth.setCredentialsAndVerify(
          userConfig.config.refresh_token
        );
      } catch (e) {
        // delete config file
        yield this.persistence.deleteConfig(userConfig.name);
        this.configName = '';
        // rethrow
        throw e;
      }
    } else {
      // full auth flow
      // Promise.race();
      const { response } = yield remote.dialog.showMessageBox({
        type: 'question',
        buttons: ['Ok', 'Cancel'],
        message: 'Now you will be redirected to the Google Login page',
      });
      // Cancel button
      if (response === 1) {
        throw new UserCancelError();
      }
      const url = yield workerAuth.getAuthUrl();
      if (!url) {
        throw new Error('Google auth url is empty');
      }
      yield shell.openExternal(url);
      const authData = yield workerAuth.authenticate();
      yield this.persistence.writeConfig(authData.email, authData);
      this.configName = authData.email;
    }
  }

  async onInit(): Promise<void> {
    return runCancelableGenerator(
      this.authFlow.bind(this),
      this.cancelInit.promise
    );
  }
}
