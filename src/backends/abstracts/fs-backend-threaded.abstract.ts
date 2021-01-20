import { Remote, proxy, releaseProxy } from 'comlink';
import { FSBackend, ReadWatchDirProps } from './fs-backend.abstract';
import { IFSRawNode } from '../interfaces/fs-raw-node.interface';
import { extractParentPath } from '../../utils/path';
import { FSEventEmitter } from '../classes/fs-event-emitter';
import { FSWorker } from './fs-worker.abstract';
import { FSSubscription } from '../classes/fs-subscription-manager';
import 'error/comlink/error-transfer-handler';

export type CtorProps<Worker extends FSWorker> = {
  workerInstance: Remote<Worker>;
};

export class FSBackendThreaded<Worker extends FSWorker> extends FSBackend {
  worker: Remote<Worker>;

  constructor({ workerInstance }: CtorProps<Worker>) {
    super();
    this.worker = workerInstance;
  }

  async readDir(props: ReadWatchDirProps): Promise<IFSRawNode[]> {
    return this.worker.readDir(props);
  }

  readWatchDir({ node, up }: ReadWatchDirProps): FSEventEmitter {
    let { path } = node;
    if (up) {
      path = extractParentPath(path);
    }
    const sub = this.subscriptions.get(path);
    // already subscribed
    if (sub) {
      // TODO setImmediate?
      sub.ctx.emit('error', new Error('Already subscribed'));
      return sub.ctx;
    }

    const eventEmitter = new FSEventEmitter();
    const fsSubscription: FSSubscription<FSEventEmitter> = {
      path,
      ctx: eventEmitter,
    };
    this.subscriptions.add(fsSubscription);

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
      this.worker.unwatchDir(path);
    });

    return eventEmitter;
  }

  async onDestroy() {
    await this.unwatchAllDir();
    await this.worker.unwatchAllDir();
    this.worker[releaseProxy]();
  }
}
