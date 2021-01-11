import { EventEmitter } from 'events';
import { FsItemTypeEnum } from '../../enums/fs-item-type.enum';

export interface IFSConstructorProps {
  viewId: string;
}

export interface FSRawNode {
  id: string;
  name: string;
  type: FsItemTypeEnum;
}

export type FSEventNames = 'change' | 'dirRead' | 'error';

export class FSEventEmitter extends EventEmitter {
  on(event: 'dirRead', listener: (nodes: FSRawNode[]) => void): this;
  on(
    event: 'change',
    listener: (eventType: string, filename: string | Buffer) => void
  ): this;
  on(event: 'error', listener: (error: Error) => void): this;
  on(event: 'close'): this;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  on(event: string, listener: (...args: any[]) => void): this;

  emit(event: 'error', error: Error): boolean;
  emit(event: 'change', eventType: string, filename: string | Buffer): boolean;
  emit(event: 'dirRead', nodes: FSRawNode[]): boolean;
  emit(event: 'close'): boolean;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  emit(event: string, ...args: any[]): boolean;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  removeAllListeners(event: FSEventNames): this;
}

export abstract class FSBackend {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  private viewId: string;

  protected constructor({ viewId }: IFSConstructorProps) {
    this.viewId = viewId;
  }

  abstract readDir(path: string): Promise<FSRawNode[]>;

  abstract readWatchDir(path: string): FSEventEmitter;

  abstract unwatchDir(path: string): void;

  abstract unwatchAllDir(): void;
}
