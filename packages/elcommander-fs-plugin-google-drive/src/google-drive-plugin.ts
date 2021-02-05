import { shell, remote } from 'electron';
import { Remote } from 'comlink';
import {
  FsPlugin,
  IFSConstructorProps,
  UserCancelError,
  runCancelableGenerator,
  createPromise,
  WorkerThread,
} from 'elcommander-plugin-sdk';
// @ts-ignore
// import GDWorker from './google-drive.worker';
import type { GoogleDriveWorker } from './google-drive.worker';
import { GoogleDrivePersistence } from './google-drive-persistence';
import { GoogleAuth } from './google-auth';
import { GoogleDriveFs } from './google-drive-fs';
import GoogleDriveIcon from './google-drive-icon';

export class GoogleDrivePlugin extends FsPlugin<
  GoogleDriveFs,
  GoogleDrivePersistence
> {
  static FS = GoogleDriveFs;

  static Persistence = GoogleDrivePersistence;

  static get pluginOptions() {
    return {
      pluginName: 'Google Drive',
      icon: GoogleDriveIcon,
      tabSpinner: true,
      initCancellable: true,
    };
  }

  static async createInstance({
    viewId,
    configName,
    persistence,
    domContainer,
  }: IFSConstructorProps<GoogleDrivePersistence>) {
    const rawWorker = new Worker(`${__dirname}/worker.js`);
    // const rawWorker = new GDWorker();
    const GDWorkerClass = WorkerThread.proxify<
      Remote<typeof GoogleDriveWorker>
    >(rawWorker);
    const workerInstance = await new GDWorkerClass();
    const fs = new GoogleDriveFs({ workerInstance });
    return new GoogleDrivePlugin({
      domContainer,
      viewId,
      configName,
      fs,
      persistence,
    });
  }

  get options() {
    return {
      pathSpinner: true,
      treeSpinner: true,
    };
  }

  cancelInit = createPromise<void, UserCancelError>();

  async cancelInitialization() {
    this.cancelInit.resolve();
    const auth = await this.fs.worker.auth;
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
    const workerAuth = ((yield this.fs.worker.auth) as unknown) as Remote<
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
      const { response } = yield remote.dialog.showMessageBox({
        type: 'question',
        buttons: ['Ok', 'Cancel'],
        message: 'Now you will be redirected to the Google Login page',
      });
      // Cancel button index
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
