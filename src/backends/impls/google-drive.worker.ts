import * as Comlink from 'comlink';
import http, { Server } from 'http';
import { Auth, drive_v3, google } from 'googleapis';
import url from 'url';
import { AddressInfo } from 'net';
import { TreeNode } from '../../interfaces/node.interface';
import { IFSRawNode } from '../interfaces/fs-raw-node.interface';
import { FsItemTypeEnum } from '../../enums/fs-item-type.enum';
import { CONFIG } from '../../config/config';

export class GoogleDrive {
  private server: Server | null = null;

  private serverListen: Promise<number> | null = null;

  private codeListen: Promise<string | null> | null = null;

  private readonly authClient: Auth.OAuth2Client;

  private readonly driveClient: drive_v3.Drive;

  private redirectUri: string | null = null;

  public constructor() {
    this.authClient = new google.auth.OAuth2({
      clientId: CONFIG.gClientId,
      clientSecret: CONFIG.gClientSecret,
    });
    this.driveClient = google.drive({ version: 'v3', auth: this.authClient });
  }

  async readDir(
    node: TreeNode | undefined,
    path: string,
    enterStack: TreeNode[] | undefined
  ): Promise<IFSRawNode[]> {
    let parentId = 'root';
    const lastStackItem = enterStack?.length
      ? enterStack[enterStack.length - 1]
      : null;
    if (lastStackItem && lastStackItem.path === path) {
      parentId = lastStackItem.meta.parents[0] as string;
    }
    if (node) {
      parentId = node.meta.id;
    }
    const list = await this.driveClient.files.list({
      fields:
        'nextPageToken, files(id, name, mimeType, parents, fileExtension)',
      q: `"${parentId}" in parents`,
      orderBy: 'name',
    });
    console.log(list.data.files);
    if (!list.data.files) return [];
    return list.data.files.map((item) => ({
      path: `${path === '/' ? '' : path}/${item.name}`,
      name: item.name!,
      type:
        item.mimeType === 'application/vnd.google-apps.folder'
          ? FsItemTypeEnum.Directory
          : FsItemTypeEnum.File,
      meta: {
        id: item.id,
        parents: item.parents,
      },
    }));
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
Comlink.expose(GoogleDrive);
