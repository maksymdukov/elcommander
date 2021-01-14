import { FSBackend } from './abstracts/fs-backend.abstract';
import { LocalFs } from './impls/local-fs';
import { GoogleDriveFs } from './impls/google-drive-fs';

export interface IFSManagers<T extends FSBackend = any> {
  [k: string]: T;
}

export interface IDIContainer {
  [k: string]: FSBackend;
}

export const FSBackendsMap: IFSManagers = {
  LocalFS: LocalFs,
  GoogleDriveFS: GoogleDriveFs,
};
