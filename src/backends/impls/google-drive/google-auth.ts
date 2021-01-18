import http, { Server } from 'http';
import { Auth } from 'googleapis';
import url from 'url';
import { AddressInfo } from 'net';
import { timeout } from 'utils/timeout';
import { createPromise } from 'utils/leaked-promise';

export class GoogleAuth {
  server: Server | null = null;

  serverListen = createPromise<number, Error>();

  codeListen = createPromise<string | null>();

  redirectUri: string | null = null;

  constructor(public authClient: Auth.OAuth2Client) {}

  public async authenticateByCode(code: string) {
    try {
      const { tokens } = await this.authClient.getToken({
        code,
        redirect_uri: this.redirectUri!,
      });
      this.authClient.setCredentials(tokens);
      return tokens;
    } catch (e) {
      throw new Error('Cant get google tokens by code');
    }
  }

  private parseCode(input: string): null | string {
    const myUrl = url.parse(input);
    if (!myUrl.search) {
      return null;
    }
    const search = new URLSearchParams(myUrl.search);
    return search.get('code');
  }

  private startServer() {
    this.server = http.createServer((req, res) => {
      this.codeListen.resolve(this.parseCode(req.url!));
      res.end('You can now close this tab');
    });
    this.server.listen(() => {
      const address = this.server?.address() as AddressInfo;
      console.log('listening on', address);
      this.serverListen.resolve(address.port);
    });
    this.server.on('error', (err) => {
      this.serverListen.reject(err);
    });
  }

  private generateAuthUrl(port: number) {
    this.redirectUri = `http://localhost:${port}`;
    return this.authClient.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/drive',
        'https://www.googleapis.com/auth/userinfo.email',
      ],
      redirect_uri: this.redirectUri,
    });
  }

  public async getAuthUrl() {
    try {
      this.startServer();
      const port = await this.serverListen.promise;
      return this.generateAuthUrl(port);
    } catch (e) {
      this.server?.close();
      throw new Error('cant start server for auth');
    }
  }

  public async setCredentialsAndVerify(refreshToken: string) {
    this.authClient.setCredentials({
      refresh_token: refreshToken,
    });
    const { token } = await this.authClient.getAccessToken();
    return token;
  }

  private async verifyIdToken(idToken: string) {
    return this.authClient.verifyIdToken({ idToken });
  }

  public async authenticate() {
    const code = await Promise.race([this.codeListen.promise, timeout(60)]);
    if (!code) {
      throw new Error('auth code is invalid');
    }
    this.server?.close();
    const tokens = await this.authenticateByCode(code);
    if (!tokens.id_token || !tokens.access_token || !tokens.refresh_token) {
      throw new Error('no tokens found');
    }
    const ticket = await this.verifyIdToken(tokens.id_token);
    const payload = ticket.getPayload();
    if (!payload) {
      throw new Error('no payload in id_token found');
    }
    const { email } = payload;
    if (!email) {
      throw new Error('no email found in id_token payload');
    }
    return {
      email,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
    };
  }

  public async cancel() {
    this.server?.close();
    this.serverListen.reject(new Error());
    this.codeListen.reject();
  }
}
