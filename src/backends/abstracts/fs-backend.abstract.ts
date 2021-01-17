import { AbortSignal } from 'abort-controller';
import { FSEventEmitter, FSEventNames } from '../classes/fs-event-emitter';
import { IFSRawNode } from '../interfaces/fs-raw-node.interface';
import { TreeNode } from '../../interfaces/node.interface';
import { FSPersistence } from '../classes/fs-persistence';

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

// export interface FSCreateInstanceStatic<
//   T extends FSBackend<P>,
//   P extends FSPersistence = FSPersistence
// > {
//   new (props: IFSConstructorProps<P>): T;
//   Persistence: typeof FSPersistence
//   createInstance
// }

export abstract class FSBackend<
  Persistence extends FSPersistence = FSPersistence
> {
  static Persistence: typeof FSPersistence = FSPersistence;

  // async instantiation
  static async createInstance(_: IFSConstructorProps): Promise<FSBackend> {
    throw new Error('must be implemented in the derived class');
  }

  static getStartNode(): Partial<TreeNode> {
    return {};
  }

  public static get tabOptions() {
    return {
      tabSpinner: false,
    };
  }

  protected viewId: string;

  protected configName: string;

  private subscriptions: FSSubscription[] = [];

  protected persistence: Persistence;

  protected constructor({
    viewId,
    configName,
    persistence,
  }: IFSConstructorProps<Persistence>) {
    this.viewId = viewId;
    this.configName = configName;
    this.persistence = persistence;
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

  public async onInit(): Promise<void> {}
}
