import fs, { Dirent } from 'fs';
import * as Comlink from 'comlink';
import path from 'path';
import chokidar, { FSWatcher } from 'chokidar';
import { ReadWatchDirProps } from '../abstracts/fs-backend.abstract';
import { IFSRawNode } from '../interfaces/fs-raw-node.interface';
import { FsItemTypeEnum } from '../../enums/fs-item-type.enum';
import { extractParentPath } from '../../utils/path';
import {
  FSWorker,
  OnChangeCb,
  OnErrorCb,
  OnReadDirCb,
} from '../abstracts/fs-worker.abstract';

export class LocalFSWorker extends FSWorker<FSWatcher> {
  private static getReadDirStartNode({ node, up }: ReadWatchDirProps) {
    const startNode: IFSRawNode = {
      id: node.path,
      type: FsItemTypeEnum.Directory,
      name: node.name,
      path: node.path,
      meta: {},
    };
    if (up) {
      // user wants to read parent of the node
      const parentPath = extractParentPath(node.path);
      startNode.id = parentPath;
      startNode.path = parentPath;
    }
    return startNode;
  }

  private static getRawNodes(
    startNode: IFSRawNode,
    dirents: Dirent[]
  ): IFSRawNode[] {
    const { path: startNodePath } = startNode;
    return [startNode].concat(
      dirents
        .filter((file) => file.isDirectory() || file.isFile())
        .map((dirent) => {
          const constructedPath = `${
            startNodePath === '/' ? '' : startNodePath
          }/${dirent.name}`;
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

  async readWatchDir(
    { node, up }: ReadWatchDirProps,
    onReadDir: OnReadDirCb,
    onChange: OnChangeCb,
    onError: OnErrorCb
  ) {
    let { path: targetPath } = node;
    if (up) {
      targetPath = extractParentPath(targetPath);
    }

    const watcher = chokidar
      .watch(targetPath, {
        depth: 0,
        alwaysStat: true,
        ignoreInitial: true,
      })
      .on('error', (error) => {
        onError(error);
      })
      .on('ready', () => {
        (async () => {
          try {
            const nodes = await this.readDir({ node, up });
            await onReadDir(nodes);
            watcher.on('all', () => {
              onChange();
            });
          } catch (e) {
            await onError(e);
          }
        })();
      });
    this.addWatcher(targetPath, watcher);
  }

  async readDir({ node, up }: ReadWatchDirProps): Promise<IFSRawNode[]> {
    const startNode = LocalFSWorker.getReadDirStartNode({ node, up });
    const { path: targetPath } = startNode;
    const files = await fs.promises.readdir(path.normalize(targetPath), {
      encoding: 'utf8',
      withFileTypes: true,
    });
    return LocalFSWorker.getRawNodes(startNode, files);
  }
}

Comlink.expose(LocalFSWorker);
