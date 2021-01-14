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

export abstract class FSBackend {
  // async instantiation
  static async createInstance(prop: IFSConstructorProps) {
    // @ts-ignore
    const instance = new this(prop);
    await instance.onInit();
    return instance;
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private viewId: string;

  public abstract get options(): {
    spinner?: boolean;
  };

  protected constructor({ viewId }: IFSConstructorProps) {
    this.viewId = viewId;
  }

  public abstract readDir(
    node: TreeNode | undefined,
    path: string,
    enterStack: TreeNode[] | undefined
  ): Promise<IFSRawNode[]>;

  public abstract readWatchDir(
    node: TreeNode | undefined,
    path: string,
    enterStack: TreeNode[] | undefined
  ): FSEventEmitter;

  public abstract unwatchDir(node: TreeNode): void;

  public abstract unwatchAllDir(): void;

  public async onDestroy() {}

  public async onInit() {}
}
