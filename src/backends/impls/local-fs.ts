import fs from 'fs';
import nPath from 'path';
import chokidar from 'chokidar';
import { FSBackend } from '../abstracts/fs-backend.abstract';
import { FsItemTypeEnum } from '../../enums/fs-item-type.enum';
import { FSEventEmitter, FSEventNames } from '../classes/fs-event-emitter';
import { IFSRawNode } from '../interfaces/fs-raw-node.interface';
import { TreeNode } from '../../interfaces/node.interface';

/*
  Subscriptions array look:
    [{path: "/home", emitter: FSEventEmitter}]
 */

interface FSSubscription {
  path: string;
  emitter: FSEventEmitter;
}

export class LocalFs extends FSBackend {
  get options() {
    return {
      spinner: false,
    };
  }

  subscriptions: FSSubscription[] = [];

  constructor({ viewId }: { viewId: string }) {
    super({ viewId });
  }

  async readDir(_: TreeNode | undefined, path: string): Promise<IFSRawNode[]> {
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
          path: `${path === '/' ? '' : path}/${dirent.name}`,
          meta: {},
        };
      });
  }

  readWatchDir(
    node: TreeNode | undefined,
    path: string,
    enterStack: TreeNode[] | undefined
  ) {
    console.log('enterStack', enterStack);
    const sub = this.tryGetSubscription(path);
    if (sub) {
      // emit directory read
      (async () => {
        try {
          const nodes = await this.readDir(node, path);
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

    const watcher = chokidar
      .watch(path, { depth: 0, alwaysStat: true, ignoreInitial: true })
      .on('error', (error) => {
        eventEmitter.emit('error', error);
      })
      .on('ready', () => {
        watcher.on('all', (...args) => {
          eventEmitter.emit('change', ...args);
        });
        (async () => {
          try {
            const nodes = await this.readDir(node, path);
            eventEmitter.emit('dirRead', nodes);
          } catch (e) {
            eventEmitter.emit('error', e);
          }
        })();
      });

    eventEmitter.on('close', () => {
      watcher.close();
    });

    return eventEmitter;
  }

  private tryGetSubscription(path: string) {
    return this.subscriptions.find((sub) => sub.path === path);
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

  private removeSubListeners(sub: FSSubscription) {
    (['change', 'error', 'dirRead', 'close'] as FSEventNames[]).forEach((ev) =>
      sub.emitter.removeAllListeners(ev)
    );
  }
}
