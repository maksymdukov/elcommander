import { Remote, proxy, releaseProxy } from 'comlink';
import {
  FSBackend,
  FSSubscription,
  IFSConstructorProps,
  ReadWatchDirProps,
} from './fs-backend.abstract';
import { IFSRawNode } from '../interfaces/fs-raw-node.interface';
import { extractParentPath } from '../../utils/path';
import { FSEventEmitter } from '../classes/fs-event-emitter';
import { FSWorker, WorkerWatcher } from './fs-worker.abstract';

export interface CtorProps<Worker> {
  viewId: string;
  workerInstance: Remote<Worker>;
}

export abstract class FSBackendThreaded<
  Worker extends FSWorker<Watcher>,
  Watcher extends WorkerWatcher = WorkerWatcher
> extends FSBackend {
  static async createInstance<
    WorkerT extends FSWorker<WatcherT>,
    WatcherT extends WorkerWatcher = WorkerWatcher
  >(
    _: IFSConstructorProps
  ): Promise<ThisType<FSBackendThreaded<WorkerT, WatcherT>>> {
    throw new Error('Must be implemented in the derived class');
  }

  readonly worker: Remote<Worker>;

  protected constructor({ viewId, workerInstance }: CtorProps<Worker>) {
    super({ viewId });
    this.worker = workerInstance;
  }

  async readDir(props: ReadWatchDirProps): Promise<IFSRawNode[]> {
    return this.worker.readDir(props);
  }

  readWatchDir({ node, up }: ReadWatchDirProps) {
    let { path } = node;
    if (up) {
      path = extractParentPath(path);
    }
    const sub = this.tryGetSubscription(path);
    // already subscribed
    if (sub) {
      sub.emitter.emit('error', new Error('Already subscribed'));
      return sub.emitter;
    }

    const eventEmitter = new FSEventEmitter();
    const fsSubscription: FSSubscription = {
      path,
      emitter: eventEmitter,
    };
    this.addSubscription(fsSubscription);

    const onRead = proxy(async (nodes: IFSRawNode[]) => {
      eventEmitter.emit('dirRead', nodes);
    });
    const onChange = proxy(async () => {
      eventEmitter.emit('change');
    });
    const onError = proxy(async (e: Error) => {
      eventEmitter.emit('error', e);
    });

    this.worker.readWatchDir(
      {
        node,
        up,
      },
      onRead,
      onChange,
      onError
    );

    eventEmitter.on('close', () => {
      this.worker.removeWatcher(path);
    });

    return eventEmitter;
  }

  async onDestroy() {
    await this.unwatchAllDir();
    await this.worker.removeAllWatchers();
    this.worker[releaseProxy]();
  }
}
