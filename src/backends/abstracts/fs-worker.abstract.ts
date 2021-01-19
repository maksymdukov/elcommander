import { FSBackend, ReadWatchDirProps } from './fs-backend.abstract';
import { IFSRawNode } from '../interfaces/fs-raw-node.interface';
import 'error/comlink/error-transfer-handler';

// HMR in worker error hack
// @ts-ignore
self.$RefreshReg$ = () => {};
// @ts-ignore
self.$RefreshSig$$ = () => () => {};

export interface WorkerWatcher {
  close(): void;
}

export interface WorkerWatchers<T> {
  [k: string]: T | undefined;
}

export type OnReadDirCb = (nodes: IFSRawNode[]) => Promise<void>;
export type OnChangeCb = () => Promise<void>;
export type OnErrorCb = (error: Error) => Promise<void>;

export abstract class FSWorker<W extends WorkerWatcher = WorkerWatcher> {
  private watchers: WorkerWatchers<W> = {};

  abstract readDir(
    ...args: Parameters<FSBackend['readDir']>
  ): ReturnType<FSBackend['readDir']>;

  abstract readWatchDir(
    props: ReadWatchDirProps,
    onReadDir: OnReadDirCb,
    onChange: OnChangeCb,
    onError: OnErrorCb
  ): Promise<void>;

  async removeWatcher(targetPath: string) {
    const watcher = this.watchers[targetPath];
    if (watcher) {
      watcher.close();
      delete this.watchers[targetPath];
    }
  }

  async removeAllWatchers() {
    Object.keys(this.watchers).forEach((path) => {
      this.removeWatcher(path);
    });
  }

  async addWatcher(targetPath: string, watcher: W) {
    this.watchers[targetPath] = watcher;
  }
}
