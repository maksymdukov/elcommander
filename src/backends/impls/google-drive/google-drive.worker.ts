import * as Comlink from 'comlink';
import { drive_v3, google } from 'googleapis';
import AbortController from 'abort-controller';
import { IFSRawNode } from '../../interfaces/fs-raw-node.interface';
import { FsItemTypeEnum } from '../../../enums/fs-item-type.enum';
import { CONFIG } from '../../../config/config';
import { ReadWatchDirProps } from '../../abstracts/fs-backend.abstract';
import { extractParentPath } from '../../../utils/path';
import {
  FSWorker,
  OnChangeCb,
  OnErrorCb,
  OnReadDirCb,
} from '../../abstracts/fs-worker.abstract';
import { GoogleAuth } from './google-auth';

export class GoogleDriveWorker extends FSWorker {
  private readonly auth: GoogleAuth;

  private readonly driveClient: drive_v3.Drive;

  public constructor() {
    super();
    const authClient = new google.auth.OAuth2({
      clientId: CONFIG.gClientId,
      clientSecret: CONFIG.gClientSecret,
    });
    this.driveClient = google.drive({ version: 'v3', auth: authClient });
    this.auth = new GoogleAuth(authClient);
  }

  async readDir({
    up,
    node,
    abortSignal,
  }: ReadWatchDirProps): Promise<IFSRawNode[]> {
    const startNode: IFSRawNode = {
      id: node.id,
      name: node.name,
      path: node.path,
      type: FsItemTypeEnum.Directory,
      meta: {
        ...node.meta,
      },
    };
    let { path } = node;
    let parentId = node.meta.parents[node.meta.parents.length - 1];
    let parents = [...node.meta.parents];
    // user wants to read the parent of this node
    if (up) {
      path = extractParentPath(path);
      // last element is id of current node itself
      // we want to take the last but one
      parentId = node.meta.parents[node.meta.parents.length - 2];
      parents = node.meta.parents.slice(0, node.meta.parents.length - 1);
      startNode.meta.parents = parents;
      startNode.path = path;
    }

    const list = await this.driveClient.files.list(
      {
        fields:
          'nextPageToken, files(id, name, mimeType, parents, fileExtension, version, md5Checksum)',
        q: `"${parentId}" in parents`,
        orderBy: 'name',
      },
      { signal: abortSignal }
    );
    console.log(list.data.files);
    if (!list.data.files) return [];
    return [
      startNode,
      ...list.data.files.map((item) => {
        const constructedPath = `${path === '/' ? '' : path}/${item.name}`;
        return {
          id: item.id!,
          path: constructedPath,
          name: item.name!,
          type:
            item.mimeType === 'application/vnd.google-apps.folder'
              ? FsItemTypeEnum.Directory
              : FsItemTypeEnum.File,
          meta: {
            parents: [...parents, item.id],
          },
        };
      }),
    ];
  }

  async readWatchDir(
    { up, node }: ReadWatchDirProps,
    onReadDir: OnReadDirCb,
    _: OnChangeCb,
    onError: OnErrorCb
  ): Promise<void> {
    let { path: targetPath } = node;
    if (up) {
      targetPath = extractParentPath(targetPath);
    }
    const abortController = new AbortController();
    try {
      await this.addWatcher(targetPath, {
        close() {
          abortController.abort();
        },
      });
      const nodes = await this.readDir({
        node,
        up,
        abortSignal: abortController.signal,
      });
      await onReadDir(nodes);
    } catch (e) {
      if (e.code === 20 && e.name === 'AbortError') {
        return;
      }
      await onError(e);
    }
  }

  async setCredentialsAndVerify(token: string) {
    return this.auth.setCredentialsAndVerify(token);
  }

  async getAuthUrl() {
    return this.auth.getAuthUrl();
  }

  async authenticate() {
    return this.auth.authenticate();
  }
}
Comlink.expose(GoogleDriveWorker);
