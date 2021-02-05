import { FSBackend, ReadWatchDirProps } from './fs-backend.abstract';
import { IFSRawNode } from '../interfaces/fs-raw-node.interface';
import '../error/comlink/error-transfer-handler';
import { FsSubscriptionManager } from './fs-subscription-manager';

// HMR in worker error hack
// @ts-ignore
self.$RefreshReg$ = () => {};
// @ts-ignore
self.$RefreshSig$$ = () => () => {};

export interface WorkerWatcher {
  close(): void;
}

export type OnFsReadDirBindCb = (nodes: IFSRawNode[]) => Promise<void>;
export type OnFsChangeBindCb = () => Promise<void>;
export type OnFsErrorBindCb = (error: Error) => Promise<void>;

export abstract class FSWorker {
  public subscriptions: FsSubscriptionManager<any> = new FsSubscriptionManager<
    WorkerWatcher
  >({
    onSubRemove: (sub) => sub.ctx.close(),
  });

  abstract readDir(
    ...args: Parameters<FSBackend['readDir']>
  ): ReturnType<FSBackend['readDir']>;

  abstract readWatchDir(
    props: ReadWatchDirProps,
    onReadDir: OnFsReadDirBindCb,
    onChange: OnFsChangeBindCb,
    onError: OnFsErrorBindCb
  ): Promise<void>;

  async unwatchDir(path: string) {
    return this.subscriptions.removeNested(path);
  }

  async unwatchAllDir() {
    return this.subscriptions.removeAll();
  }
}
