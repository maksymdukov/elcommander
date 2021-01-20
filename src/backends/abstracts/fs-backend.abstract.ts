import { AbortSignal } from 'abort-controller';
import { FSEventEmitter, FSEventNames } from '../classes/fs-event-emitter';
import { IFSRawNode } from '../interfaces/fs-raw-node.interface';
import { TreeNode } from '../../interfaces/node.interface';
import { FSPersistence } from '../classes/fs-persistence';
import { FsSubscriptionManager } from '../classes/fs-subscription-manager';

declare global {
  interface Error {
    path: string;
    syscall: string;
    code: string;
    errno: number;
  }
}

export interface IFSConstructorProps<P extends FSPersistence = FSPersistence> {
  viewId: string;
  configName: string;
  persistence: P;
  domContainer: Element;
}

export interface ReadWatchDirProps {
  node: TreeNode;
  up?: boolean;
  abortSignal?: AbortSignal;
}

export abstract class FSBackend {
  static getStartNode(): Partial<TreeNode> {
    return {};
  }

  protected constructor(..._: any[]) {}

  getParentNode(node: TreeNode): TreeNode {
    return node;
  }

  public subscriptions: FsSubscriptionManager<any> = new FsSubscriptionManager<
    FSEventEmitter
  >({
    onSubRemove: (sub) => {
      sub.ctx.emit('close');
      ([
        'change',
        'error',
        'dirRead',
        'close',
      ] as FSEventNames[]).forEach((ev) => sub.ctx.removeAllListeners(ev));
    },
  });

  public abstract readDir(props: ReadWatchDirProps): Promise<IFSRawNode[]>;

  public abstract readWatchDir(arg: ReadWatchDirProps): FSEventEmitter;

  // unwatch directories including nested
  public unwatchDir(path: string) {
    this.subscriptions.removeNested(path);
  }

  public unwatchAllDir() {
    this.subscriptions.removeAll();
  }
}
