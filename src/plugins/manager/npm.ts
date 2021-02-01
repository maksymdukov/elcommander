import path from 'path';
import fs from 'fs';
import { fork } from 'child_process';
import { createPromise } from '../../utils/leaked-promise';
import { NpmExitError } from '../../error/npm/npm-exit.error';
import { CustomError } from '../../error/custom-error';
import { InstalledPackages, SearchedPackages } from './npm.types';

const NODE_MODULES_PATH = path.join(__dirname, 'node_modules');
const NPM_PATH = path.join(NODE_MODULES_PATH, 'npm', 'bin', 'npm-cli.js');

export class Npm {
  pluginPath: string;

  private abortController = new AbortController();

  constructor(pluginPath: string) {
    this.pluginPath = pluginPath;
    // initialize package.json
    if (!fs.existsSync(path.join(pluginPath, 'package.json'))) {
      this.runCommand(['init', '-y']);
    }
  }

  private runCommand(commandArgs: string[]): Promise<string> {
    const cp = fork(NPM_PATH, commandArgs, {
      silent: true,
      cwd: this.pluginPath,
    });
    const stdOutBuffer: Buffer[] = [];
    const stdErrBuffer: Buffer[] = [];
    const promise = createPromise<string, CustomError>();

    const onAbort = () => {
      cp.kill('SIGKILL');
      this.abortController.signal.removeEventListener('abort', onAbort);
      promise.reject(new NpmExitError('Aborted', '1'));
    };
    this.abortController.signal.addEventListener('abort', onAbort);

    cp.stdout?.on('data', (data: Buffer) => {
      stdOutBuffer.push(data);
    });
    cp.stderr?.on('data', (data: Buffer) => {
      stdErrBuffer.push(data);
    });

    cp.once('exit', (code) => {
      if (code === 0) {
        promise.resolve(Buffer.concat(stdOutBuffer).toString('utf8'));
      } else {
        promise.reject(
          new NpmExitError(
            Buffer.concat(stdErrBuffer).toString('utf8'),
            String(code)
          )
        );
      }
      this.abortController.signal.removeEventListener('abort', onAbort);
      cp.stdout?.removeAllListeners('data');
      cp.stderr?.removeAllListeners('data');
      cp.removeAllListeners('error');
    });
    cp.on('error', (err) => {
      this.abortController.signal.removeEventListener('abort', onAbort);
      promise.reject(new NpmExitError(err.message, '1'));
    });
    return promise.promise;
  }

  private parseJson(res: string): any {
    try {
      return JSON.parse(res);
    } catch (e) {
      throw new NpmExitError('Error parsing json', '1');
    }
  }

  public search(packageName: string): Promise<SearchedPackages> {
    return this.runCommand([
      'search',
      '--json',
      '--searchlimit=40',
      packageName,
    ]).then(this.parseJson);
  }

  public list(): Promise<InstalledPackages> {
    return this.runCommand(['list', '--long', '--depth=0', '--json'])
      .then(this.parseJson)
      .then((res: any) => res.dependencies || {});
  }

  public install(packageName: string): Promise<string> {
    return this.runCommand(['install', packageName]);
  }

  public uninstall(packageName: string): Promise<string> {
    return this.runCommand(['uninstall', packageName]);
  }

  public update(packageName: string): Promise<string> {
    return this.runCommand(['update', packageName]);
  }

  public abortAll() {
    this.abortController.abort();
  }
}
