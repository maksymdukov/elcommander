import * as Comlink from 'comlink';
import http, { Server } from 'http';
import { Auth, drive_v3, google } from 'googleapis';
import url from 'url';
import { AddressInfo } from 'net';
import AbortController from 'abort-controller';
import { IFSRawNode } from '../interfaces/fs-raw-node.interface';
import { FsItemTypeEnum } from '../../enums/fs-item-type.enum';
import { CONFIG } from '../../config/config';
import { ReadWatchDirProps } from '../abstracts/fs-backend.abstract';
import { extractParentPath } from '../../utils/path';
import {
  FSWorker,
  OnChangeCb,
  OnErrorCb,
  OnReadDirCb,
} from '../abstracts/fs-worker.abstract';

export class GoogleDriveWorker extends FSWorker {
  private server: Server | null = null;

  private serverListen: Promise<number> | null = null;

  private codeListen: Promise<string | null> | null = null;

  private readonly authClient: Auth.OAuth2Client;

  private readonly driveClient: drive_v3.Drive;

  private redirectUri: string | null = null;

  public constructor() {
    super();
    this.authClient = new google.auth.OAuth2({
      clientId: CONFIG.gClientId,
      clientSecret: CONFIG.gClientSecret,
    });
    this.driveClient = google.drive({ version: 'v3', auth: this.authClient });
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

  async authenticateByCode(code: string) {
    try {
      const { tokens } = await this.authClient.getToken({
        code,
        redirect_uri: this.redirectUri!,
      });
      this.authClient.setCredentials(tokens);
    } catch (e) {
      throw new Error('Cant get google tokens by code');
    }
  }

  parseCode(input: string): null | string {
    const myUrl = url.parse(input);
    if (!myUrl.search) {
      return null;
    }
    const search = new URLSearchParams(myUrl.search);
    return search.get('code');
  }

  startServer() {
    this.serverListen = new Promise((resolveListen, rejectListen) => {
      this.codeListen = new Promise((resolveCode) => {
        this.server = http.createServer((req, res) => {
          resolveCode(this.parseCode(req.url!));
          res.end('You can now close this tab');
        });
        this.server.listen(() => {
          const address = this.server?.address() as AddressInfo;
          console.log('listening on', address);
          resolveListen(address.port);
        });
        this.server.on('error', (err) => {
          rejectListen(err);
        });
      });
    });
  }

  private generateAuthUrl(port: number) {
    this.redirectUri = `http://localhost:${port}`;
    return this.authClient.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/drive'],
      redirect_uri: this.redirectUri,
    });
  }

  async getAuthUrl() {
    this.startServer();
    const port = await this.serverListen;
    if (port === null) {
      this.server?.close();
      throw new Error('cant start server for auth');
    }
    return this.generateAuthUrl(port);
  }

  async setCredentials(refreshToken: string) {
    this.authClient.setCredentials({
      refresh_token: refreshToken,
    });
    const { token } = await this.authClient.getAccessToken();
    console.log('WEBWORKER access token', token);
  }

  private timeout(): Promise<null> {
    // eslint-disable-next-line promise/param-names
    return new Promise((r) => {
      setTimeout(() => {
        r(null);
      }, 40000);
    });
  }

  async authenticate() {
    if (!this.codeListen) {
      throw new Error('cant wait for auth code');
    }
    const code = await Promise.race([this.codeListen, this.timeout()]);
    if (!code) {
      throw new Error('auth code is wrong');
    }
    this.server?.close();
    await this.authenticateByCode(code);
  }
}
Comlink.expose(GoogleDriveWorker);
