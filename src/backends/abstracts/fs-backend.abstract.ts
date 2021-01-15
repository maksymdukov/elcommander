import { AbortSignal } from 'abort-controller';
import { FSEventEmitter, FSEventNames } from '../classes/fs-event-emitter';
import { IFSRawNode } from '../interfaces/fs-raw-node.interface';
import { TreeNode } from '../../interfaces/node.interface';

declare global {
  interface Error {
    path: string;
    syscall: string;
    code: string;
    errno: number;
  }
}

export interface IFSConstructorProps {
  viewId: string;
}

export interface ReadWatchDirProps {
  node: TreeNode;
  up?: boolean;
  abortSignal?: AbortSignal;
}

/*
  Subscriptions array look:
    [{path: "/home", emitter: FSEventEmitter}]
 */

export interface FSSubscription {
  path: string;
  emitter: FSEventEmitter;
}

export abstract class FSBackend {
  // async instantiation
  static async createInstance(prop: IFSConstructorProps) {
    // @ts-ignore
    return new this(prop);
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private viewId: string;

  public static get tabOptions() {
    return {
      tabSpinner: false,
    };
  }

  private subscriptions: FSSubscription[] = [];

  protected constructor({ viewId }: IFSConstructorProps) {
    this.viewId = viewId;
  }

  abstract get options(): {
    pathSpinner?: boolean;
    treeSpinner?: boolean;
  };

  public abstract readDir(props: ReadWatchDirProps): Promise<IFSRawNode[]>;

  public abstract readWatchDir(arg: ReadWatchDirProps): FSEventEmitter;

  protected addSubscription(sub: FSSubscription) {
    this.subscriptions.push(sub);
  }

  protected tryGetSubscription(path: string) {
    return this.subscriptions.find((sub) => sub.path === path);
  }

  protected removeSubListeners(sub: FSSubscription) {
    (['change', 'error', 'dirRead', 'close'] as FSEventNames[]).forEach((ev) =>
      sub.emitter.removeAllListeners(ev)
    );
  }

  // Recursively unwatch directories
  unwatchDir(node: TreeNode) {
    const { path } = node;
    this.subscriptions = this.subscriptions.filter((sub) => {
      if (sub.path.substr(0, path.length) === path) {
        sub.emitter.emit('close');
        this.removeSubListeners(sub);
        return false;
      }
      return true;
    });
  }

  unwatchAllDir() {
    this.subscriptions.forEach((sub) => {
      sub.emitter.emit('close');
      this.removeSubListeners(sub);
    });
    this.subscriptions = [];
  }

  public async onDestroy() {
    this.unwatchAllDir();
  }

  public async onInit() {}
}
