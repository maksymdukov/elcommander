import { FSEventEmitter } from '../classes/fs-event-emitter';
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

  public static get options() {
    return {
      tabSpinner: false,
    };
  }

  abstract get options(): {
    pathSpinner?: boolean;
    treeSpinner?: boolean;
  };

  protected constructor({ viewId }: IFSConstructorProps) {
    this.viewId = viewId;
  }

  public abstract readDir(props: ReadWatchDirProps): Promise<IFSRawNode[]>;

  public abstract readWatchDir(arg: ReadWatchDirProps): FSEventEmitter;

  public abstract unwatchDir(node: TreeNode): void;

  public abstract unwatchAllDir(): void;

  public async onDestroy() {}

  public async onInit() {}
}
