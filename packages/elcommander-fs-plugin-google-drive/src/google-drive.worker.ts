import * as Comlink from 'comlink';
import { drive_v3, google } from 'googleapis';
import AbortController from 'abort-controller';
import { proxy } from 'comlink';
import {
  IFSRawNode,
  FsItemTypeEnum,
  ReadWatchDirProps,
  FSWorker,
  OnFsChangeBindCb,
  OnFsErrorBindCb,
  OnFsReadDirBindCb,
} from 'elcommander-plugin-sdk';
import { GoogleAuth } from './google-auth';

export class GoogleDriveWorker extends FSWorker {
  public readonly auth: GoogleAuth;

  private readonly driveClient: drive_v3.Drive;

  constructor() {
    super();
    const authClient = new google.auth.OAuth2({
      clientId:
        '187570819989-11ur10pk0cch77lj1qhtl415e4aq1eha.apps.googleusercontent.com',
      clientSecret: '08dl0Yne_7S_g5pRlEEb3Eux',
    });
    this.driveClient = google.drive({ version: 'v3', auth: authClient });
    this.auth = proxy(new GoogleAuth(authClient));
  }

  async readDir({
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
    const { path } = node;
    const parentId = node.meta.parents[node.meta.parents.length - 1];
    const parents = [...node.meta.parents];

    const list = await this.driveClient.files.list(
      {
        fields:
          'nextPageToken, files(id, name, mimeType, parents, fileExtension, version, md5Checksum)',
        q: `"${parentId}" in parents`,
        orderBy: 'name',
      },
      { signal: abortSignal }
    );
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
    onReadDir: OnFsReadDirBindCb,
    _: OnFsChangeBindCb,
    onError: OnFsErrorBindCb
  ): Promise<void> {
    const { path: targetPath } = node;
    const abortController = new AbortController();
    try {
      this.subscriptions.add({
        path: targetPath,
        ctx: {
          close() {
            abortController.abort();
          },
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
}
Comlink.expose(GoogleDriveWorker);
