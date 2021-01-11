import fs from 'fs';
import nPath from 'path';
import {
  FSBackend,
  FSEventEmitter,
  FSEventNames,
} from './interfaces/fs-backend.interface';
import { FsItemTypeEnum } from '../enums/fs-item-type.enum';

/*
  Subscriptions array look:
    [{path: "/home", emitter: FSEventEmitter}]
 */

interface FSSubscription {
  path: string;
  emitter: FSEventEmitter;
}

export class LocalFs extends FSBackend {
  subscriptions: FSSubscription[] = [];

  constructor({ viewId }: { viewId: string }) {
    super({ viewId });
  }

  async readDir(
    path: string
  ): Promise<{ id: string; name: string; type: FsItemTypeEnum }[]> {
    const files = await fs.promises.readdir(nPath.normalize(path), {
      encoding: 'utf8',
      withFileTypes: true,
    });
    return files
      .filter((file) => file.isDirectory() || file.isFile())
      .map((dirent) => {
        return {
          type: dirent.isDirectory()
            ? FsItemTypeEnum.Directory
            : FsItemTypeEnum.File,
          name: dirent.name,
          id: `${path === '/' ? '' : path}/${dirent.name}`,
        };
      });
  }

  readWatchDir(path: string) {
    const sub = this.tryGetSubscription(path);
    if (sub) {
      // emit directory read
      (async () => {
        try {
          const nodes = await this.readDir(path);
          sub.emitter.emit('dirRead', nodes);
        } catch (e) {
          sub.emitter.emit('error', e);
        }
      })();

      return sub.emitter;
    }

    const eventEmitter = new FSEventEmitter();
    const fsSubscription: FSSubscription = {
      path,
      emitter: eventEmitter,
    };
    this.subscriptions.push(fsSubscription);

    const watcher = fs
      .watch(path, { encoding: 'utf8', recursive: false })
      .on('change', (...args) => {
        eventEmitter.emit('change', ...args);
      })
      .on('error', (err) => {
        eventEmitter.emit('error', err);
      });

    eventEmitter.on('close', () => {
      watcher.close();
    });

    (async () => {
      const nodes = await this.readDir(path);
      eventEmitter.emit('dirRead', nodes);
    })();
    return eventEmitter;
  }

  private tryGetSubscription(path: string) {
    return this.subscriptions.find((sub) => sub.path === path);
  }

  // Recursively unwatch directories
  unwatchDir(path: string) {
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

  private removeSubListeners(sub: FSSubscription) {
    (['change', 'error', 'dirRead', 'close'] as FSEventNames[]).forEach((ev) =>
      sub.emitter.removeAllListeners(ev)
    );
  }
}
