import { EventEmitter } from 'events';
import { IFSRawNode } from '../interfaces/fs-raw-node.interface';

export type FSEventNames = 'change' | 'dirRead' | 'error';

export class FSEventEmitter extends EventEmitter {
  on(event: 'dirRead', listener: (nodes: IFSRawNode[]) => void): this;
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
  emit(event: 'dirRead', nodes: IFSRawNode[]): boolean;
  emit(event: 'close'): boolean;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  emit(event: string, ...args: any[]): boolean;

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  removeAllListeners(event: FSEventNames): this;
}
