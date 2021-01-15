import fs from 'fs';
import nPath from 'path';
import chokidar from 'chokidar';
import { FSBackend, ReadWatchDirProps } from '../abstracts/fs-backend.abstract';
import { FsItemTypeEnum } from '../../enums/fs-item-type.enum';
import { FSEventEmitter, FSEventNames } from '../classes/fs-event-emitter';
import { IFSRawNode } from '../interfaces/fs-raw-node.interface';
import { TreeNode } from '../../interfaces/node.interface';
import { extractParentPath } from '../../utils/path';

/*
  Subscriptions array look:
    [{path: "/home", emitter: FSEventEmitter}]
 */

interface FSSubscription {
  path: string;
  emitter: FSEventEmitter;
}

export class LocalFs extends FSBackend {
  static get options() {
    return {
      tabSpinner: false,
    };
  }

  get options() {
    return {
      pathSpinner: false,
    };
  }

  subscriptions: FSSubscription[] = [];

  constructor({ viewId }: { viewId: string }) {
    super({ viewId });
  }

  async readDir({ node, up }: ReadWatchDirProps): Promise<IFSRawNode[]> {
    let { path } = node;
    const startNode: IFSRawNode = {
      id: node.path,
      type: FsItemTypeEnum.Directory,
      name: node.name,
      path: node.path,
      meta: {},
    };
    if (up) {
      // user want to read parent of the node
      path = extractParentPath(node.path);
      startNode.id = path;
      startNode.path = path;
    }
    const files = await fs.promises.readdir(nPath.normalize(path), {
      encoding: 'utf8',
      withFileTypes: true,
    });
    return [startNode].concat(
      files
        .filter((file) => file.isDirectory() || file.isFile())
        .map((dirent) => {
          const constructedPath = `${path === '/' ? '' : path}/${dirent.name}`;
          return {
            id: constructedPath,
            type: dirent.isDirectory()
              ? FsItemTypeEnum.Directory
              : FsItemTypeEnum.File,
            name: dirent.name,
            path: constructedPath,
            meta: {},
          };
        })
    );
  }

  readWatchDir({ node, up }: ReadWatchDirProps) {
    let { path } = node;
    if (up) {
      path = extractParentPath(path);
    }
    const sub = this.tryGetSubscription(path);
    // sub exist and we're exiting dirs
    if (sub && !up) {
      // emit directory read
      (async () => {
        try {
          const nodes = await this.readDir({ node, up });
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
      .watch(path, {
        depth: 0,
        alwaysStat: true,
        ignoreInitial: true,
      })
      .on('error', (error) => {
        eventEmitter.emit('error', error);
      })
      .on('ready', () => {
        watcher.on('all', (...args) => {
          eventEmitter.emit('change', ...args);
        });
        (async () => {
          try {
            const nodes = await this.readDir({ node, up });
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
    const { id } = node;
    this.subscriptions = this.subscriptions.filter((sub) => {
      if (sub.path.substr(0, id.length) === id) {
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
