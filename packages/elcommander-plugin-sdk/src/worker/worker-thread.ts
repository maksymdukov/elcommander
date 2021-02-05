import * as Comlink from 'comlink';

declare global {
  interface Window {
    WorkerThread: typeof WorkerThread;
  }
}

export class WorkerThread extends Worker {
  static proxify<R extends unknown>(worker: WorkerThread): Comlink.Remote<R> {
    return Comlink.wrap(worker);
  }
}

if (typeof window !== 'undefined') {
  window.WorkerThread = WorkerThread;
}
